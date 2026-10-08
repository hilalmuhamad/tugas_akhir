<?php

namespace App\Services;

use App\Events\OlapDataUpdated;
use App\Models\AlumniProfile;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Jalur ETL OLTP -> OLAP (skema bintang tracer study):
 *
 *   alumnidummy.csv (data lulusan)        alumni_profiles (OLTP, dari kuesioner)
 *        |  loadStagingFromCsv()               |  syncProfile() / mergeProfilesToStaging()
 *        +---------------+---------------------+
 *                        v
 *                staging_alumni
 *                        |  rebuildStarSchema()
 *                        v
 *   dim_alumni, dim_program_studi, dim_waktu, dim_status_kerja,
 *   dim_keselarasan, dim_tahun_survei
 *                        |  (join lookup)
 *                        v
 *              fact_tracer_alumni
 *
 * ---------------------------------------------------------------------------
 * DITULIS ULANG 2026-08-27. Empat kerusakan yang diperbaiki:
 *
 *  1. AlumniStagingSeeder dan perintah `etl:sync` memanggil loadStagingFromCsv(),
 *     tetapi metode itu tidak ada — yang ada loadStagingFromRaw(), dan isinya pun
 *     mati karena ada `return` di tengah badan metode. Akibatnya `db:seed` dan
 *     `etl:sync` selalu melempar BadMethodCallException, sehingga basis data
 *     hanya bisa diisi manual lewat pgAdmin dan lama-lama menyimpang dari kode.
 *     Metode loadStagingFromCsv() dipulihkan di sini.
 *
 *  2. Baris fakta ditulisi tahun_survei_key, padahal kolom itu tidak pernah ada
 *     di migrasi fact_tracer_alumni. Penulisannya dihapus: satu alumni memang
 *     masuk DUA survei (TS-1 pada tahun lulus+1, TS-2 pada lulus+2), jadi tahun
 *     survei adalah jendela yang diturunkan saat agregasi, bukan atribut fakta.
 *     Yang tetap diperlukan hanyalah isi dim_tahun_survei — lihat
 *     syncDimTahunSurvei().
 *
 *  3. dim_status_kerja dan dim_keselarasan ikut di-TRUNCATE lalu diisi ulang dari
 *     nilai yang kebetulan ada di staging. Kuncinya jadi berubah setiap sinkron
 *     dan isinya bergantung data. Sekarang kedua dimensi itu DIBEKUKAN di
 *     migrasi (2 baris status, 4 baris keselarasan) dan ETL hanya mencari
 *     kuncinya, tidak pernah membuat baris baru.
 *
 *  4. Kategori diringkas sesuai revisi pascasidang:
 *        status kerja : 'Bekerja' | 'Tidak Bekerja'
 *        keselarasan  : 'Selaras' | 'Tidak Selaras' pada dua dimensi
 *     Jawaban berskala lama masih dikenali agar data yang sudah ada di basis
 *     data ikut terpetakan saat sinkronisasi berikutnya — lihat tetapan
 *     LEGACY_* di bawah.
 * ---------------------------------------------------------------------------
 */
class EtlService
{
    /**
     * Offset id staging untuk baris yang berasal dari kuesioner.
     * Baris CSV memakai id 1..N, jadi ruang id 1_000_000+ dipakai
     * alumni_profiles.id agar tidak terjadi tabrakan kunci.
     */
    private const PROFIL_ID_OFFSET = 1_000_000;

    /** Dua nilai status kerja yang dikenal sistem. */
    public const STATUS_BEKERJA       = 'Bekerja';
    public const STATUS_TIDAK_BEKERJA = 'Tidak Bekerja';

    /** Dua kategori keselarasan yang dikenal sistem. */
    public const SELARAS       = 'Selaras';
    public const TIDAK_SELARAS = 'Tidak Selaras';

    /** Tahun survei paling awal yang ditampilkan dasbor. */
    private const TAHUN_SURVEI_MINIMAL = 2022;

    /**
     * Jawaban status kerja lama yang dihitung sebagai 'Bekerja'.
     * "Melanjutkan Studi", "Belum Memungkinkan Bekerja", dan "Tidak Bekerja
     * tetapi Sedang Mencari Kerja" sengaja TIDAK ada di sini — ketiganya jatuh
     * ke 'Tidak Bekerja'. Karena itu persentase bekerja di dasbor bukan IKU-1;
     * IKU-1 ikut menghitung yang melanjutkan studi.
     */
    private const LEGACY_STATUS_BEKERJA = [
        'bekerja',
        'wirausaha/startup',
        'wirausaha',
        'berwirausaha',
        'placed',
    ];

    /**
     * Jawaban keselarasan horizontal lama yang dihitung 'Selaras'.
     * Sisanya ('Kurang erat', 'Tidak sama sekali') -> 'Tidak Selaras'.
     */
    private const LEGACY_HORIZONTAL_SELARAS = [
        'sangat erat',
        'erat',
        'cukup erat',
    ];

    /**
     * Jawaban keselarasan vertikal lama yang dihitung 'Selaras'.
     *
     * Dasarnya definisi underemployment: yang dianggap tidak selaras secara
     * vertikal adalah alumni yang bekerja pada tingkat LEBIH RENDAH daripada
     * jenjang pendidikannya. Bekerja pada tingkat yang sama maupun setingkat
     * lebih tinggi keduanya selaras.
     */
    private const LEGACY_VERTIKAL_SELARAS = [
        'setingkat lebih tinggi',
        'tingkat yang sama',
        'sama',
        'tinggi',
    ];

    /* =====================================================================
     * Sinkronisasi satu profil (dipicu Observer kuesioner)
     * ===================================================================== */

    /**
     * Sinkronkan SATU alumni saja, tanpa membangun ulang seluruh gudang data.
     * Dipanggil AlumniProfileObserver pada created/updated.
     *
     * Transformasi yang dikerjakan di service (bukan di controller):
     *  - masa_tunggu_bulan = selisih bulan penuh tanggal_lulus -> tanggal_mulai_bekerja
     *  - lulus_tepat_waktu = D3 <= 3 tahun, jenjang lain <= 4 tahun
     *  - status kerja dan kedua kategori keselarasan dibakukan
     */
    public function syncSingleProfile(int $alumniId): void
    {
        $profile = AlumniProfile::find($alumniId);

        if (! $profile) {
            Log::warning("EtlService::syncSingleProfile alumniId={$alumniId} tidak ditemukan");

            return;
        }

        $computedMasaTunggu = $this->calculateMasaTunggu($profile);

        if ($computedMasaTunggu !== null && (int) $profile->masa_tunggu_bulan !== $computedMasaTunggu) {
            AlumniProfile::withoutEvents(function () use ($profile, $computedMasaTunggu) {
                $profile->update(['masa_tunggu_bulan' => $computedMasaTunggu]);
            });
            $profile->masa_tunggu_bulan = $computedMasaTunggu;
        }

        $computedTepatWaktu = $this->isTepatWaktu($profile);

        if ($profile->lulus_tepat_waktu !== $computedTepatWaktu) {
            AlumniProfile::withoutEvents(function () use ($profile, $computedTepatWaktu) {
                $profile->update(['lulus_tepat_waktu' => $computedTepatWaktu]);
            });
            $profile->lulus_tepat_waktu = $computedTepatWaktu;
        }

        $this->syncProfile($profile);

        try {
            event(new OlapDataUpdated($profile->id, $profile->tahun_lulus));
        } catch (\Throwable $e) {
            Log::debug('OlapDataUpdated broadcast dilewati: '.$e->getMessage());
        }
    }

    /**
     * Sinkronkan satu profil kuesioner (OLTP) ke gudang data (OLAP).
     * Idempotent: aman dipanggil berkali-kali untuk profil yang sama.
     */
    public function syncProfile(AlumniProfile $profile): void
    {
        DB::transaction(function () use ($profile) {
            $this->upsertStagingFromProfile($profile);

            $stagingId  = $this->stagingIdForProfile($profile);
            $tahunLulus = (int) $profile->tahun_lulus;

            $prodiKey  = $this->findOrCreateProdi($profile->program_studi, $profile->specialisasi);
            $waktuKey  = $this->findOrCreateWaktu($tahunLulus);
            $statusKey = $this->statusKey($profile->status_bekerja);

            $horizontal = $this->normalisasiHorizontal($profile->kesesuaian_bidang);
            $vertikal   = $this->normalisasiVertikal($profile->tingkat_pendidikan_sesuai);

            // Keselarasan hanya bermakna bagi alumni yang bekerja.
            if ($statusKey !== $this->statusKey(self::STATUS_BEKERJA)) {
                $horizontal = null;
                $vertikal   = null;
            }

            $keselarasanKey = $this->keselarasanKey($horizontal, $vertikal);

            // Tahun survei yang memuat kohort ini harus ada supaya view OLAP
            // langsung menampilkan alumni baru tanpa menunggu rebuild penuh.
            $this->pastikanTahunSurvei($tahunLulus);

            $dimValues = [
                'nama'                      => $profile->nama,
                'gender'                    => $profile->gender,
                'jenjang'                   => $profile->jenjang,
                'tahun_masuk'               => $profile->tahun_masuk,
                'jabatan'                   => $profile->jabatan,
                'bidang_pekerjaan'          => $profile->bidang_pekerjaan,
                'kesesuaian_bidang'         => $horizontal,
                'tingkat_pendidikan_sesuai' => $vertikal,
            ];

            $alumniKey = DB::table('dim_alumni')->where('id_sumber', $stagingId)->value('alumni_key');

            if ($alumniKey === null) {
                $alumniKey = DB::table('dim_alumni')
                    ->insertGetId(['id_sumber' => $stagingId] + $dimValues, 'alumni_key');
            } else {
                DB::table('dim_alumni')->where('alumni_key', $alumniKey)->update($dimValues);
            }

            $factValues = [
                'prodi_key'         => $prodiKey,
                'waktu_key'         => $waktuKey,
                'status_key'        => $statusKey,
                'keselarasan_key'   => $keselarasanKey,
                'pengalaman_kerja'  => $profile->pengalaman_kerja,
                'ipk'               => $profile->ipk,
                'masa_tunggu_bulan' => $profile->masa_tunggu_bulan,
                'gaji_juta'         => $profile->gaji_juta,
            ];

            $factKey = DB::table('fact_tracer_alumni')->where('alumni_key', $alumniKey)->value('fact_key');

            if ($factKey === null) {
                DB::table('fact_tracer_alumni')->insert(['alumni_key' => $alumniKey] + $factValues);
            } else {
                DB::table('fact_tracer_alumni')->where('fact_key', $factKey)->update($factValues);
            }
        });
    }

    /* =====================================================================
     * Pemuatan staging
     * ===================================================================== */

    /**
     * Muat ulang staging dari CSV lulusan, lalu gabungkan kembali baris
     * kuesioner supaya data yang diisi pengguna tidak hilang.
     *
     * @param  string|null  $csvPath  bila null memakai database/seeders/data/alumnidummy.csv
     * @return int jumlah baris kuesioner yang ada di staging setelah pemuatan
     */
    public function loadStagingFromCsv(?string $csvPath = null): int
    {
        $csvPath ??= database_path('seeders/data/alumnidummy.csv');

        if (! file_exists($csvPath)) {
            throw new \RuntimeException("Berkas CSV tidak ditemukan: {$csvPath}");
        }

        $handle = fopen($csvPath, 'r');

        if ($handle === false) {
            throw new \RuntimeException("Berkas CSV tidak dapat dibuka: {$csvPath}");
        }

        $header = $this->normalisasiHeader(fgetcsv($handle) ?: []);

        if (! in_array('id', $header, true)) {
            fclose($handle);
            throw new \RuntimeException("Kolom 'id' tidak ada di header CSV: {$csvPath}");
        }

        DB::table('staging_alumni')->truncate();

        $batch  = [];
        $jumlah = 0;

        while (($row = fgetcsv($handle)) !== false) {
            // Baris kosong di akhir berkas dilewati, bukan dianggap galat.
            if ($row === [null] || (count($row) === 1 && trim((string) $row[0]) === '')) {
                continue;
            }

            $data = $this->petakanBaris($header, $row);

            $status     = $this->normalisasiStatus($data['statusbekerja'] ?? null);
            $bekerja    = $status === self::STATUS_BEKERJA;
            $horizontal = $bekerja ? $this->normalisasiHorizontal($data['kesesuaianbidang'] ?? null) : null;
            $vertikal   = $bekerja ? $this->normalisasiVertikal($data['tingkatpendidikansesuai'] ?? null) : null;

            $batch[] = [
                'id'                        => (int) $data['id'],
                'nama'                      => $data['nama'] ?? '',
                'gender'                    => $data['gender'] ?? '',
                'jenjang'                   => self::kosongJadiNull($data['jenjang'] ?? null),
                'tahun_masuk'               => self::keInt($data['tahunmasuk'] ?? null),
                'program_studi'             => $data['programstudi'] ?? '',
                'specialisasi'              => $data['specialisasi'] ?? '',
                'pengalaman_kerja'          => $data['pengalamankerja'] ?? '',
                'tahun_lulus'               => (int) ($data['tahunlulus'] ?? 0),
                'ipk'                       => (float) ($data['ipk'] ?? 0),
                'status_bekerja'            => $status,
                'masa_tunggu_bulan'         => $bekerja ? self::keInt($data['masatunggubulan'] ?? null) : null,
                'gaji_juta'                 => $bekerja ? self::keFloat($data['gajijuta'] ?? null) : null,
                'jabatan'                   => $bekerja ? self::kosongJadiNull($data['jabatan'] ?? null) : null,
                'bidang_pekerjaan'          => $bekerja ? self::kosongJadiNull($data['bidangpekerjaan'] ?? null) : null,
                'kesesuaian_bidang'         => $horizontal,
                'tingkat_pendidikan_sesuai' => $vertikal,
            ];

            $jumlah++;

            if (count($batch) >= 100) {
                DB::table('staging_alumni')->insert($batch);
                $batch = [];
            }
        }

        if (! empty($batch)) {
            DB::table('staging_alumni')->insert($batch);
        }

        fclose($handle);

        Log::info("EtlService::loadStagingFromCsv memuat {$jumlah} baris dari ".basename($csvPath));

        return $this->mergeProfilesToStaging();
    }

    /**
     * Nama lama metode di atas. Dipertahankan agar kode/perintah lama tidak
     * pecah; jangan dipakai di kode baru.
     *
     * @deprecated pakai loadStagingFromCsv()
     */
    public function loadStagingFromRaw(): int
    {
        return $this->loadStagingFromCsv();
    }

    /**
     * Salin semua profil kuesioner (OLTP) ke staging.
     * Dipanggil sebelum rebuild agar data kuesioner tidak hilang ketika
     * staging dimuat ulang dari CSV.
     *
     * @return int jumlah baris kuesioner di staging
     */
    public function mergeProfilesToStaging(): int
    {
        foreach (DB::connection('pgsql_oltp')->table('alumni_profiles')->get() as $profile) {
            $status     = $this->normalisasiStatus($profile->status_bekerja);
            $bekerja    = $status === self::STATUS_BEKERJA;
            $horizontal = $bekerja ? $this->normalisasiHorizontal($profile->kesesuaian_bidang ?? null) : null;
            $vertikal   = $bekerja ? $this->normalisasiVertikal($profile->tingkat_pendidikan_sesuai ?? null) : null;

            DB::table('staging_alumni')->updateOrInsert(
                ['id' => self::PROFIL_ID_OFFSET + (int) $profile->id],
                [
                    'nama'                      => $profile->nama,
                    'gender'                    => $profile->gender,
                    'jenjang'                   => $profile->jenjang,
                    'tahun_masuk'               => $profile->tahun_masuk,
                    'program_studi'             => $profile->program_studi,
                    'specialisasi'              => $profile->specialisasi,
                    'pengalaman_kerja'          => $profile->pengalaman_kerja,
                    'tahun_lulus'               => $profile->tahun_lulus,
                    'ipk'                       => $profile->ipk,
                    'status_bekerja'            => $status,
                    'masa_tunggu_bulan'         => $bekerja ? $profile->masa_tunggu_bulan : null,
                    'gaji_juta'                 => $bekerja ? $profile->gaji_juta : null,
                    'jabatan'                   => $bekerja ? ($profile->jabatan ?? null) : null,
                    'bidang_pekerjaan'          => $bekerja ? ($profile->bidang_pekerjaan ?? null) : null,
                    'kesesuaian_bidang'         => $horizontal,
                    'tingkat_pendidikan_sesuai' => $vertikal,
                ]
            );
        }

        return DB::table('staging_alumni')
            ->where('id', '>=', self::PROFIL_ID_OFFSET)
            ->count();
    }

    /* =====================================================================
     * Pembangunan ulang skema bintang
     * ===================================================================== */

    /**
     * Bangun ulang seluruh skema bintang dari staging (dipakai seeder,
     * perintah `php artisan etl:sync`, dan tombol Sinkronisasi di dasbor).
     *
     * Idempotent. dim_status_kerja dan dim_keselarasan TIDAK dikosongkan:
     * keduanya dimensi acuan berisi tetap yang kuncinya dibekukan di migrasi.
     *
     * @return array{staging: int, fakta: int, tahun_survei: int}
     */
    public function rebuildStarSchema(): array
    {
        // Baris kuesioner wajib ikut, apa pun jalur pemicunya.
        $this->mergeProfilesToStaging();
        $this->bakukanStaging();

        $jumlahTahunSurvei = $this->syncDimTahunSurvei();

        DB::statement(
            'TRUNCATE TABLE fact_tracer_alumni, dim_alumni, dim_program_studi, dim_waktu'
            .' RESTART IDENTITY CASCADE'
        );

        $staging = DB::table('staging_alumni')->orderBy('id')->get();

        // ---------- 1. dim_alumni ----------
        $alumniBatch = $staging->map(fn ($row) => [
            'id_sumber'                 => $row->id,
            'nama'                      => $row->nama,
            'gender'                    => $row->gender,
            'jenjang'                   => $row->jenjang,
            'tahun_masuk'               => $row->tahun_masuk,
            'jabatan'                   => $row->jabatan,
            'bidang_pekerjaan'          => $row->bidang_pekerjaan,
            'kesesuaian_bidang'         => $row->kesesuaian_bidang,
            'tingkat_pendidikan_sesuai' => $row->tingkat_pendidikan_sesuai,
        ])->all();

        foreach (array_chunk($alumniBatch, 100) as $chunk) {
            DB::table('dim_alumni')->insert($chunk);
        }

        // ---------- 2. dim_program_studi ----------
        $prodiBatch = DB::table('staging_alumni')
            ->select('program_studi', 'specialisasi')
            ->distinct()
            ->orderBy('program_studi')
            ->orderBy('specialisasi')
            ->get()
            ->map(fn ($p) => [
                'program_studi' => $p->program_studi,
                'specialisasi'  => $p->specialisasi,
            ])
            ->all();

        if (! empty($prodiBatch)) {
            DB::table('dim_program_studi')->insert($prodiBatch);
        }

        // ---------- 3. dim_waktu ----------
        $waktuBatch = DB::table('staging_alumni')
            ->distinct()
            ->orderBy('tahun_lulus')
            ->pluck('tahun_lulus')
            ->map(fn ($tahun) => [
                'tahun_lulus' => (int) $tahun,
                'dekade'      => (string) (floor((int) $tahun / 10) * 10).'s',
            ])
            ->all();

        if (! empty($waktuBatch)) {
            DB::table('dim_waktu')->insert($waktuBatch);
        }

        // ---------- 4. fact_tracer_alumni ----------
        $alumniMap = DB::table('dim_alumni')->pluck('alumni_key', 'id_sumber');
        $prodiMap  = DB::table('dim_program_studi')->get()
            ->mapWithKeys(fn ($r) => ["{$r->program_studi}|{$r->specialisasi}" => $r->prodi_key]);
        $waktuMap  = DB::table('dim_waktu')->pluck('waktu_key', 'tahun_lulus');
        $statusMap = $this->petaStatus();
        $selarasMap = $this->petaKeselarasan();

        $factBatch = [];

        foreach ($staging as $row) {
            $kunciKeselarasan = null;

            if ($row->kesesuaian_bidang && $row->tingkat_pendidikan_sesuai) {
                $kunciKeselarasan = $selarasMap["{$row->kesesuaian_bidang}|{$row->tingkat_pendidikan_sesuai}"] ?? null;
            }

            $factBatch[] = [
                'alumni_key'        => $alumniMap[$row->id],
                'prodi_key'         => $prodiMap["{$row->program_studi}|{$row->specialisasi}"],
                'waktu_key'         => $waktuMap[$row->tahun_lulus],
                'status_key'        => $statusMap[$row->status_bekerja],
                'keselarasan_key'   => $kunciKeselarasan,
                'pengalaman_kerja'  => $row->pengalaman_kerja,
                'ipk'               => $row->ipk,
                'masa_tunggu_bulan' => $row->masa_tunggu_bulan,
                'gaji_juta'         => $row->gaji_juta,
            ];
        }

        foreach (array_chunk($factBatch, 100) as $chunk) {
            DB::table('fact_tracer_alumni')->insert($chunk);
        }

        return [
            'staging'      => DB::table('staging_alumni')->count(),
            'fakta'        => DB::table('fact_tracer_alumni')->count(),
            'tahun_survei' => $jumlahTahunSurvei,
        ];
    }

    /**
     * Isi dim_tahun_survei dari tahun lulus yang benar-benar ada di staging.
     *
     * Setiap tahun lulus L memunculkan dua kandidat survei: L+1 (alumni jadi
     * responden TS-1) dan L+2 (jadi TS-2). Disaring mulai TAHUN_SURVEI_MINIMAL.
     * Baris yang sudah ada dibiarkan supaya kuncinya tidak berubah.
     *
     * @return int jumlah tahun survei di dimensi setelah sinkronisasi
     */
    public function syncDimTahunSurvei(): int
    {
        foreach ($this->kandidatTahunSurvei() as $tahun) {
            DB::table('dim_tahun_survei')->updateOrInsert(['tahun_survei' => $tahun]);
        }

        return DB::table('dim_tahun_survei')->count();
    }

    /** Pastikan kedua tahun survei yang memuat satu tahun lulus sudah ada. */
    private function pastikanTahunSurvei(int $tahunLulus): void
    {
        foreach ([$tahunLulus + 1, $tahunLulus + 2] as $tahun) {
            if ($tahun >= self::TAHUN_SURVEI_MINIMAL) {
                DB::table('dim_tahun_survei')->updateOrInsert(['tahun_survei' => $tahun]);
            }
        }
    }

    /** @return Collection<int, int> */
    private function kandidatTahunSurvei(): Collection
    {
        $kandidat = collect();

        foreach (DB::table('staging_alumni')->distinct()->pluck('tahun_lulus') as $tahunLulus) {
            $kandidat->push((int) $tahunLulus + 1);
            $kandidat->push((int) $tahunLulus + 2);
        }

        return $kandidat
            ->unique()
            ->filter(fn ($tahun) => $tahun >= self::TAHUN_SURVEI_MINIMAL)
            ->sort()
            ->values();
    }

    /**
     * Bakukan nilai yang sudah ada di staging ke dua kategori status dan dua
     * kategori keselarasan.
     *
     * Ini yang merapikan basis data yang dipelihara manual: baris berisi
     * "Wirausaha/Startup", "Melanjutkan Studi", "Sangat erat", "Tingkat yang
     * sama", dan sejenisnya ikut terpetakan pada sinkronisasi pertama setelah
     * pembaruan ini, tanpa perlu mengedit satu-satu.
     */
    private function bakukanStaging(): void
    {
        $baris = DB::table('staging_alumni')
            ->select('id', 'status_bekerja', 'kesesuaian_bidang', 'tingkat_pendidikan_sesuai')
            ->get();

        foreach ($baris as $row) {
            $status     = $this->normalisasiStatus($row->status_bekerja);
            $bekerja    = $status === self::STATUS_BEKERJA;
            $horizontal = $bekerja ? $this->normalisasiHorizontal($row->kesesuaian_bidang) : null;
            $vertikal   = $bekerja ? $this->normalisasiVertikal($row->tingkat_pendidikan_sesuai) : null;

            if (
                $status === $row->status_bekerja
                && $horizontal === $row->kesesuaian_bidang
                && $vertikal === $row->tingkat_pendidikan_sesuai
            ) {
                continue;
            }

            DB::table('staging_alumni')->where('id', $row->id)->update([
                'status_bekerja'            => $status,
                'kesesuaian_bidang'         => $horizontal,
                'tingkat_pendidikan_sesuai' => $vertikal,
            ]);
        }
    }

    /* =====================================================================
     * Pembakuan nilai
     * ===================================================================== */

    /**
     * Bakukan status kerja menjadi 'Bekerja' atau 'Tidak Bekerja'.
     * Nilai yang tidak dikenali dianggap 'Tidak Bekerja' — lebih aman
     * menganggap belum bekerja daripada melebihkan angka keterserapan.
     */
    public function normalisasiStatus(?string $status): string
    {
        $kunci = mb_strtolower(trim((string) $status));

        return in_array($kunci, self::LEGACY_STATUS_BEKERJA, true)
            ? self::STATUS_BEKERJA
            : self::STATUS_TIDAK_BEKERJA;
    }

    /** Bakukan kesesuaian bidang (keselarasan horizontal). */
    public function normalisasiHorizontal(?string $nilai): ?string
    {
        return $this->bakukanKeselarasan($nilai, self::LEGACY_HORIZONTAL_SELARAS);
    }

    /** Bakukan kesesuaian tingkat pendidikan (keselarasan vertikal). */
    public function normalisasiVertikal(?string $nilai): ?string
    {
        return $this->bakukanKeselarasan($nilai, self::LEGACY_VERTIKAL_SELARAS);
    }

    /**
     * Kosong tetap kosong (alumni tidak bekerja atau tidak menjawab), supaya
     * baris tanpa jawaban tidak ikut jadi penyebut persentase keselarasan.
     *
     * @param  array<int, string>  $daftarSelaras
     */
    private function bakukanKeselarasan(?string $nilai, array $daftarSelaras): ?string
    {
        $kunci = mb_strtolower(trim((string) $nilai));

        if ($kunci === '') {
            return null;
        }

        if ($kunci === mb_strtolower(self::SELARAS) || in_array($kunci, $daftarSelaras, true)) {
            return self::SELARAS;
        }

        return self::TIDAK_SELARAS;
    }

    /* =====================================================================
     * Pencarian kunci dimensi
     * ===================================================================== */

    /** @return array<string, int> */
    private function petaStatus(): array
    {
        return DB::table('dim_status_kerja')
            ->pluck('status_key', 'status_bekerja')
            ->map(fn ($v) => (int) $v)
            ->all();
    }

    /** @return array<string, int> */
    private function petaKeselarasan(): array
    {
        return DB::table('dim_keselarasan')->get()
            ->mapWithKeys(fn ($r) => [
                "{$r->kategori_horizontal}|{$r->kategori_vertikal}" => (int) $r->keselarasan_key,
            ])
            ->all();
    }

    /**
     * Cari kunci status. dim_status_kerja berisi tetap dua baris dari migrasi,
     * jadi baris baru TIDAK dibuat di sini — nilai asing dibakukan dulu.
     */
    private function statusKey(?string $status): int
    {
        $baku = $this->normalisasiStatus($status);
        $key  = DB::table('dim_status_kerja')->where('status_bekerja', $baku)->value('status_key');

        if ($key === null) {
            throw new \RuntimeException(
                "dim_status_kerja tidak punya baris '{$baku}'. "
                .'Jalankan `php artisan migrate:fresh --seed`.'
            );
        }

        return (int) $key;
    }

    /**
     * Cari kunci keselarasan dari pasangan kategori. dim_keselarasan berisi
     * tetap empat baris dari migrasi (2 x 2), jadi baris baru tidak dibuat.
     * Mengembalikan null bila salah satu kategori kosong — keselarasan hanya
     * bermakna kalau kedua dimensinya terjawab.
     */
    private function keselarasanKey(?string $horizontal, ?string $vertikal): ?int
    {
        if (! $horizontal || ! $vertikal) {
            return null;
        }

        $key = DB::table('dim_keselarasan')
            ->where('kategori_horizontal', $horizontal)
            ->where('kategori_vertikal', $vertikal)
            ->value('keselarasan_key');

        if ($key === null) {
            throw new \RuntimeException(
                "dim_keselarasan tidak punya pasangan '{$horizontal}' / '{$vertikal}'. "
                .'Jalankan `php artisan migrate:fresh --seed`.'
            );
        }

        return (int) $key;
    }

    private function findOrCreateProdi(string $programStudi, string $specialisasi): int
    {
        $key = DB::table('dim_program_studi')
            ->where('program_studi', $programStudi)
            ->where('specialisasi', $specialisasi)
            ->value('prodi_key');

        if ($key !== null) {
            return (int) $key;
        }

        return (int) DB::table('dim_program_studi')->insertGetId([
            'program_studi' => $programStudi,
            'specialisasi'  => $specialisasi,
        ], 'prodi_key');
    }

    private function findOrCreateWaktu(int $tahunLulus): int
    {
        $key = DB::table('dim_waktu')->where('tahun_lulus', $tahunLulus)->value('waktu_key');

        if ($key !== null) {
            return (int) $key;
        }

        return (int) DB::table('dim_waktu')->insertGetId([
            'tahun_lulus' => $tahunLulus,
            'dekade'      => (string) (floor($tahunLulus / 10) * 10).'s',
        ], 'waktu_key');
    }

    /* =====================================================================
     * Perhitungan turunan
     * ===================================================================== */

    /**
     * masa_tunggu_bulan = selisih bulan penuh tanggal_lulus -> tanggal_mulai_bekerja.
     * Mengembalikan null bila tanggalnya tidak lengkap, sehingga nilai isian
     * manual dari kuesioner tetap dipakai.
     */
    private function calculateMasaTunggu(AlumniProfile $profile): ?int
    {
        if (empty($profile->tanggal_lulus) || empty($profile->tanggal_mulai_bekerja)) {
            return null;
        }

        try {
            $lulus = Carbon::parse($profile->tanggal_lulus)->startOfDay();
            $mulai = Carbon::parse($profile->tanggal_mulai_bekerja)->startOfDay();

            if ($mulai->lessThan($lulus)) {
                return 0;
            }

            return max(0, (int) floor($lulus->diffInMonths($mulai)));
        } catch (\Throwable $e) {
            Log::debug('calculateMasaTunggu gagal mem-parse tanggal: '.$e->getMessage());

            return null;
        }
    }

    /** D3 tepat waktu bila masa studi <= 3 tahun, jenjang lain <= 4 tahun. */
    private function isTepatWaktu(AlumniProfile $profile): bool
    {
        if (empty($profile->tahun_masuk) || empty($profile->tahun_lulus)) {
            return (bool) $profile->lulus_tepat_waktu;
        }

        $masaStudi = (int) $profile->tahun_lulus - (int) $profile->tahun_masuk;
        $ideal     = $profile->jenjang === 'D3' ? 3 : 4;

        return $masaStudi <= $ideal;
    }

    /* =====================================================================
     * Utilitas
     * ===================================================================== */

    private function stagingIdForProfile(AlumniProfile $profile): int
    {
        return self::PROFIL_ID_OFFSET + (int) $profile->id;
    }

    private function upsertStagingFromProfile(AlumniProfile $profile): void
    {
        $status     = $this->normalisasiStatus($profile->status_bekerja);
        $bekerja    = $status === self::STATUS_BEKERJA;
        $horizontal = $bekerja ? $this->normalisasiHorizontal($profile->kesesuaian_bidang) : null;
        $vertikal   = $bekerja ? $this->normalisasiVertikal($profile->tingkat_pendidikan_sesuai) : null;

        DB::table('staging_alumni')->updateOrInsert(
            ['id' => $this->stagingIdForProfile($profile)],
            [
                'nama'                      => $profile->nama,
                'gender'                    => $profile->gender,
                'jenjang'                   => $profile->jenjang,
                'tahun_masuk'               => $profile->tahun_masuk,
                'program_studi'             => $profile->program_studi,
                'specialisasi'              => $profile->specialisasi,
                'pengalaman_kerja'          => $profile->pengalaman_kerja,
                'tahun_lulus'               => $profile->tahun_lulus,
                'ipk'                       => $profile->ipk,
                'status_bekerja'            => $status,
                'masa_tunggu_bulan'         => $bekerja ? $profile->masa_tunggu_bulan : null,
                'gaji_juta'                 => $bekerja ? $profile->gaji_juta : null,
                'jabatan'                   => $bekerja ? $profile->jabatan : null,
                'bidang_pekerjaan'          => $bekerja ? $profile->bidang_pekerjaan : null,
                'kesesuaian_bidang'         => $horizontal,
                'tingkat_pendidikan_sesuai' => $vertikal,
            ]
        );
    }

    /**
     * Bakukan header CSV: buang BOM, spasi, garis bawah, dan bedakan huruf
     * besar-kecil. Dengan begitu 'tahunLulus', 'tahun_lulus', dan 'Tahun Lulus'
     * sama-sama dikenali.
     *
     * @param  array<int, string|null>  $header
     * @return array<int, string>
     */
    private function normalisasiHeader(array $header): array
    {
        return array_map(function ($kolom) {
            $kolom = preg_replace('/^\xEF\xBB\xBF/', '', (string) $kolom);

            return mb_strtolower(preg_replace('/[^A-Za-z0-9]/', '', $kolom) ?? '');
        }, $header);
    }

    /**
     * @param  array<int, string>  $header
     * @param  array<int, string|null>  $row
     * @return array<string, string>
     */
    private function petakanBaris(array $header, array $row): array
    {
        $data = [];

        foreach ($header as $i => $kolom) {
            if ($kolom !== '') {
                $data[$kolom] = trim((string) ($row[$i] ?? ''));
            }
        }

        return $data;
    }

    private static function kosongJadiNull(?string $nilai): ?string
    {
        return $nilai === null || trim($nilai) === '' ? null : trim($nilai);
    }

    private static function keInt(?string $nilai): ?int
    {
        return self::kosongJadiNull($nilai) === null ? null : (int) $nilai;
    }

    private static function keFloat(?string $nilai): ?float
    {
        return self::kosongJadiNull($nilai) === null ? null : (float) $nilai;
    }
}
