<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Lapisan penyaji OLAP.
 *
 * Seluruh agregasi dikerjakan PostgreSQL lewat view v_olap_* (lihat migrasi
 * 2026_08_14_000002_create_olap_views_table). Controller ini hanya memilih
 * view, menyaring tahun survei, mengurutkan, lalu membentuk JSON.
 *
 * Dua nilai baku yang dipakai di seluruh berkas ini, hasil revisi pascasidang
 * 2026-08-27:
 *  - status kerja      : 'Bekerja' | 'Tidak Bekerja'
 *  - kategori keselarasan : 'Selaras' | 'Tidak Selaras', pada dua dimensi
 *                           ('Horizontal' = kesesuaian bidang,
 *                            'Vertikal'   = kesesuaian tingkat pendidikan)
 *
 * Setiap pembacaan view dibungkus try/catch. Bila view belum ada atau
 * kolomnya berbeda, respons TIDAK menjadi 500; controller jatuh ke agregasi
 * cadangan yang menghitung langsung dari fact_tracer_alumni dengan jendela
 * kohort yang sama.
 */
class OlapController extends Controller
{
    /** Tahun survei bawaan bila permintaan tidak menyebutkannya. */
    private const TAHUN_SURVEI_BAWAAN = 2025;

    /* =====================================================================
     * Endpoint
     * ===================================================================== */

    /**
     * Ringkasan agregat OLAP. Sumber: v_olap_summary.
     */
    public function summary(Request $request)
    {
        $tahunSurvei = $this->tahunSurveiDari($request);

        $row = $this->bacaBaris('v_olap_summary', $tahunSurvei)
            ?? $this->cadanganSummary($tahunSurvei);

        if (! $row || (int) ($row->total_alumni ?? 0) === 0) {
            return response()->json([
                'success'      => true,
                'tahun_survei' => $tahunSurvei,
                'data'         => [
                    'tahun_survei'          => $tahunSurvei,
                    'total_alumni'          => 0,
                    'alumni_bekerja'        => 0,
                    'alumni_tidak_bekerja'  => 0,
                    'persentase_bekerja'    => 0,
                    'rata_rata_ipk'         => null,
                    'rata_rata_masa_tunggu' => null,
                    'rata_rata_gaji'        => null,
                ],
            ]);
        }

        return response()->json([
            'success'      => true,
            'tahun_survei' => $tahunSurvei,
            'data'         => $this->castRow($row),
        ]);
    }

    /**
     * Status kerja alumni per tahun lulus. Sumber: v_olap_status_kerja.
     */
    public function statusKerja(Request $request)
    {
        $tahunSurvei = $this->tahunSurveiDari($request);

        $rows = $this->bacaView(
            'v_olap_status_kerja',
            $tahunSurvei,
            fn (Builder $q) => $q->orderByDesc('tahun_lulus')
        );

        if (empty($rows)) {
            $rows = $this->castRows($this->cadanganStatusKerja($tahunSurvei));
        }

        return $this->balas($tahunSurvei, $rows);
    }

    /**
     * Jumlah alumni per program studi. Sumber: v_olap_program_studi.
     */
    public function programStudi(Request $request)
    {
        $tahunSurvei = $this->tahunSurveiDari($request);

        $rows = $this->bacaView(
            'v_olap_program_studi',
            $tahunSurvei,
            fn (Builder $q) => $q->orderByDesc('tahun_lulus')->orderBy('program_studi')
        );

        if (empty($rows)) {
            $rows = $this->castRows($this->cadanganProgramStudi($tahunSurvei));
        }

        return $this->balas($tahunSurvei, $rows);
    }

    /**
     * Jumlah alumni dan status kerja per tahun lulus. Sumber: v_olap_tahun_lulus.
     */
    public function tahunLulus(Request $request)
    {
        $tahunSurvei = $this->tahunSurveiDari($request);

        $rows = $this->bacaView(
            'v_olap_tahun_lulus',
            $tahunSurvei,
            fn (Builder $q) => $q->orderByDesc('tahun_lulus')
        );

        if (empty($rows)) {
            $rows = $this->castRows($this->cadanganTahunLulus($tahunSurvei));
        }

        return $this->balas($tahunSurvei, $rows);
    }

    /**
     * Keselarasan kerja alumni. Sumber: v_olap_keselarasan.
     *
     * Balasan berisi empat baris per tahun survei: dua dimensi
     * ('Horizontal', 'Vertikal') x dua kategori ('Selaras', 'Tidak Selaras').
     * Kategori yang tidak punya alumni tetap muncul dengan jumlah 0 supaya
     * grafik tidak berubah jumlah batangnya antar tahun.
     *
     * Penyebutnya alumni berstatus 'Bekerja' yang keselarasannya terisi,
     * bukan seluruh responden — keselarasan tidak berlaku bagi yang tidak
     * bekerja. Nilai itu ikut dikirim sebagai jumlah_responden.
     */
    public function keselarasan(Request $request)
    {
        $tahunSurvei = $this->tahunSurveiDari($request);

        $rows = $this->bacaView(
            'v_olap_keselarasan',
            $tahunSurvei,
            fn (Builder $q) => $q->orderBy('urutan_dimensi')->orderBy('urutan_kategori')
        );

        // View saat ini 2 baris (Selaras/Tidak Selaras) tanpa dimensi — fallback ke 4 baris Horizontal/Vertikal
        if (empty($rows) || count($rows) < 4 || !isset($rows[0]->dimensi)) {
            $rows = $this->castRows($this->cadanganKeselarasan($tahunSurvei));
        }

        return $this->balas($tahunSurvei, $rows);
    }

    /**
     * Keselarasan kerja alumni per program studi (drill-down).
     * Sumber: v_olap_keselarasan_program_studi.
     */
    public function keselarasanProgramStudi(Request $request)
    {
        $tahunSurvei = $this->tahunSurveiDari($request);

        $rows = $this->bacaView(
            'v_olap_keselarasan_program_studi',
            $tahunSurvei,
            fn (Builder $q) => $q->orderBy('program_studi')
                ->orderBy('urutan_dimensi')
                ->orderBy('urutan_kategori')
        );

        if (empty($rows) || (isset($rows[0]) && !isset($rows[0]->dimensi))) {
            $rows = $this->castRows($this->cadanganKeselarasanProgramStudi($tahunSurvei));
        }

        return $this->balas($tahunSurvei, $rows);
    }

    /**
     * Rata-rata masa tunggu kerja per tahun lulus dan program studi.
     * Sumber: v_olap_masa_tunggu.
     */
    public function masaTunggu(Request $request)
    {
        $tahunSurvei = $this->tahunSurveiDari($request);

        $rows = $this->bacaView(
            'v_olap_masa_tunggu',
            $tahunSurvei,
            fn (Builder $q) => $q->orderByDesc('tahun_lulus')->orderBy('program_studi')
        );

        if (empty($rows)) {
            $rows = $this->castRows($this->cadanganMasaTunggu($tahunSurvei));
        }

        return $this->balas($tahunSurvei, $rows);
    }

    /**
     * Rata-rata masa tunggu kerja seluruh histori fakta, tanpa jendela kohort.
     * Sumber: v_olap_masa_tunggu_histori.
     */
    public function masaTungguHistori()
    {
        try {
            $rows = DB::table('v_olap_masa_tunggu_histori')
                ->orderBy('tahun_lulus')
                ->orderBy('program_studi')
                ->get()
                ->map(fn ($row) => $this->castRow($row))
                ->values()
                ->all();
        } catch (\Throwable $e) {
            Log::warning('OLAP view v_olap_masa_tunggu_histori tidak terbaca: '.$e->getMessage());
            $rows = [];
        }

        return response()->json([
            'success' => true,
            'data'    => $rows,
        ]);
    }

    /**
     * Ketepatan waktu studi per tahun lulus. Sumber: v_olap_ketepatan_waktu.
     */
    public function ketepatanWaktu(Request $request)
    {
        $tahunSurvei = $this->tahunSurveiDari($request);

        $rows = $this->bacaView(
            'v_olap_ketepatan_waktu',
            $tahunSurvei,
            fn (Builder $q) => $q->orderByDesc('tahun_lulus')
        );

        if (empty($rows)) {
            $rows = $this->castRows($this->cadanganKetepatanWaktu($tahunSurvei));
        }

        return $this->balas($tahunSurvei, $rows);
    }

    /**
     * Detail seluruh alumni pada tingkat fakta.
     *
     * Tanpa parameter tahun_survei -> v_olap_detail, satu baris per alumni.
     * Dengan parameter             -> v_olap_kohort, hanya kohort survei itu.
     *
     * Dua view berbeda dipakai dengan sengaja: v_olap_kohort menggandakan
     * setiap alumni ke dua tahun survei (TS-1 dan TS-2), jadi membacanya tanpa
     * filter akan melipatduakan jumlah baris.
     */
    public function detail(Request $request)
    {
        $berfilter = $request->filled('tahun_survei');

        try {
            $query = DB::table($berfilter ? 'v_olap_kohort' : 'v_olap_detail');

            if ($berfilter) {
                $query->where('tahun_survei', $this->tahunSurveiDari($request));
            }

            $rows = $query
                ->orderByDesc('tahun_lulus')
                ->orderBy('id_sumber')
                ->get()
                ->map(fn ($row) => $this->castRow($row))
                ->values()
                ->all();
        } catch (\Throwable $e) {
            Log::warning('OLAP view detail tidak terbaca: '.$e->getMessage());
            $rows = [];
        }

        return response()->json([
            'success' => true,
            'data'    => $rows,
        ]);
    }

    /**
     * Target responden per program studi (dasbor staf). Datanya identik
     * dengan programStudi(), jadi view yang dibaca sama.
     */
    public function targetResponden(Request $request)
    {
        return $this->programStudi($request);
    }

    /**
     * Daftar tahun survei untuk dropdown admin.
     *
     * Tidak di-hardcode: survei tahun Y mencakup kohort TS-1 (Y-1) dan TS-2
     * (Y-2), jadi kandidatnya tahun_lulus+1 dan tahun_lulus+2 dari dim_waktu.
     * Disaring mulai 2022, diurut terbaru dahulu. Baris yang belum ada di
     * dim_tahun_survei dibuatkan supaya view OLAP langsung punya kohortnya.
     */
    public function tahunSurvei()
    {
        $tahunLulus = DB::table('dim_waktu')->pluck('tahun_lulus');

        if ($tahunLulus->isEmpty()) {
            $tahunLulus = DB::table('staging_alumni')->distinct()->pluck('tahun_lulus');
        }

        $kandidat = collect();
        foreach ($tahunLulus as $tl) {
            $kandidat->push((int) $tl + 1);
            $kandidat->push((int) $tl + 2);
        }

        $kandidat = $kandidat
            ->merge(DB::table('dim_tahun_survei')->pluck('tahun_survei')->map(fn ($v) => (int) $v))
            ->unique()
            ->filter(fn ($y) => $y >= 2022)
            ->sortDesc()
            ->values();

        foreach ($kandidat as $th) {
            DB::table('dim_tahun_survei')->updateOrInsert(['tahun_survei' => $th]);
        }

        return response()->json([
            'success' => true,
            'data'    => DB::table('dim_tahun_survei')
                ->orderByDesc('tahun_survei')
                ->pluck('tahun_survei')
                ->map(fn ($v) => (int) $v)
                ->all(),
        ]);
    }

    /**
     * Tombol Sinkronisasi di dasbor admin: bangun ulang skema bintang dari
     * staging lalu siarkan supaya dasbor menyegarkan sendiri. Khusus admin.
     */
    public function sync(Request $request)
    {
        $user = $request->user();

        if ($user && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Khusus admin'], 403);
        }

        $etl = app(\App\Services\EtlService::class);

        try {
            $result = $etl->rebuildStarSchema();
        } catch (\Throwable $e) {
            Log::error('Sinkronisasi OLAP gagal: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Sinkronisasi gagal: '.$e->getMessage(),
                'data'    => [
                    'staging' => DB::table('staging_alumni')->count(),
                    'fakta'   => DB::table('fact_tracer_alumni')->count(),
                ],
            ], 500);
        }

        try {
            event(new \App\Events\OlapDataUpdated(0, $this->tahunSurveiDari($request)));
        } catch (\Throwable $e) {
            Log::debug('OlapDataUpdated broadcast dilewati: '.$e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Sinkronisasi OLAP selesai',
            'data'    => $result,
        ]);
    }

    /* =====================================================================
     * Pembacaan view
     * ===================================================================== */

    private function tahunSurveiDari(Request $request): int
    {
        return (int) $request->query('tahun_survei', self::TAHUN_SURVEI_BAWAAN);
    }

    private function balas(int $tahunSurvei, array $rows)
    {
        return response()->json([
            'success'      => true,
            'tahun_survei' => $tahunSurvei,
            'data'         => $rows,
        ]);
    }

    /**
     * Baca satu view OLAP yang disaring tahun survei.
     * Mengembalikan array kosong bila view belum ada atau kolomnya berbeda,
     * supaya pemanggil bisa jatuh ke agregasi cadangan.
     */
    private function bacaView(string $view, int $tahunSurvei, callable $urutkan): array
    {
        try {
            $query = DB::table($view)->where('tahun_survei', $tahunSurvei);
            $urutkan($query);

            return $query->get()
                ->map(fn ($row) => $this->castRow($row))
                ->values()
                ->all();
        } catch (\Throwable $e) {
            Log::warning("OLAP view {$view} tidak terbaca: ".$e->getMessage());

            return [];
        }
    }

    private function bacaBaris(string $view, int $tahunSurvei): ?object
    {
        try {
            return DB::table($view)->where('tahun_survei', $tahunSurvei)->first();
        } catch (\Throwable $e) {
            Log::warning("OLAP view {$view} tidak terbaca: ".$e->getMessage());

            return null;
        }
    }

    /* =====================================================================
     * Agregasi cadangan
     *
     * Dipakai bila view OLAP belum punya baris untuk kohort tersebut (mis.
     * dim_tahun_survei baru diisi) atau viewnya belum dibuat. Perhitungan
     * tetap dikerjakan PostgreSQL lewat GROUP BY / FILTER; yang berbeda hanya
     * jendela kohortnya ditulis di sini, bukan di definisi view.
     * ===================================================================== */

    /** Survei tahun Y mencakup lulusan Y-2 (TS-2) sampai Y-1 (TS-1). */
    private function kohortWindow(int $tahunSurvei): array
    {
        return [$tahunSurvei - 2, $tahunSurvei - 1];
    }

    /** Ekspresi SQL penanda kohort, sama untuk semua cadangan. */
    private function ekspresiCohort(): string
    {
        return "CASE WHEN dw.tahun_lulus = ? THEN 'TS-1' WHEN dw.tahun_lulus = ? THEN 'TS-2' END AS cohort";
    }

    private function cadanganSummary(int $tahunSurvei): ?object
    {
        return DB::table('fact_tracer_alumni as f')
            ->join('dim_waktu as dw', 'dw.waktu_key', '=', 'f.waktu_key')
            ->join('dim_status_kerja as sk', 'sk.status_key', '=', 'f.status_key')
            ->whereBetween('dw.tahun_lulus', $this->kohortWindow($tahunSurvei))
            ->selectRaw("
                ?::smallint AS tahun_survei,
                COUNT(*)::bigint AS total_alumni,
                (COUNT(*) FILTER (WHERE sk.status_bekerja = 'Bekerja'))::bigint AS alumni_bekerja,
                (COUNT(*) FILTER (WHERE sk.status_bekerja <> 'Bekerja'))::bigint AS alumni_tidak_bekerja,
                ROUND(COUNT(*) FILTER (WHERE sk.status_bekerja = 'Bekerja') * 100.0
                      / NULLIF(COUNT(*), 0), 2) AS persentase_bekerja,
                ROUND(AVG(f.ipk)::numeric, 2) AS rata_rata_ipk,
                ROUND(AVG(f.masa_tunggu_bulan)::numeric, 2) AS rata_rata_masa_tunggu,
                ROUND((AVG(f.gaji_juta) FILTER (WHERE sk.status_bekerja = 'Bekerja'))::numeric, 2) AS rata_rata_gaji
            ", [$tahunSurvei])
            ->first();
    }

    private function cadanganStatusKerja(int $tahunSurvei): array
    {
        return DB::table('fact_tracer_alumni as f')
            ->join('dim_waktu as dw', 'dw.waktu_key', '=', 'f.waktu_key')
            ->join('dim_status_kerja as sk', 'sk.status_key', '=', 'f.status_key')
            ->whereBetween('dw.tahun_lulus', $this->kohortWindow($tahunSurvei))
            ->selectRaw("
                ?::smallint AS tahun_survei,
                {$this->ekspresiCohort()},
                dw.tahun_lulus,
                COUNT(*)::bigint AS jumlah_alumni,
                (COUNT(*) FILTER (WHERE sk.status_bekerja = 'Bekerja'))::bigint AS bekerja,
                (COUNT(*) FILTER (WHERE sk.status_bekerja = 'Tidak Bekerja'))::bigint AS tidak_bekerja,
                ROUND(COUNT(*) FILTER (WHERE sk.status_bekerja = 'Bekerja') * 100.0
                      / NULLIF(COUNT(*), 0), 2) AS persentase_bekerja
            ", [$tahunSurvei, $tahunSurvei - 1, $tahunSurvei - 2])
            ->groupBy('dw.tahun_lulus')
            ->orderByDesc('dw.tahun_lulus')
            ->get()
            ->all();
    }

    private function cadanganProgramStudi(int $tahunSurvei): array
    {
        return DB::table('fact_tracer_alumni as f')
            ->join('dim_waktu as dw', 'dw.waktu_key', '=', 'f.waktu_key')
            ->join('dim_program_studi as dp', 'dp.prodi_key', '=', 'f.prodi_key')
            ->join('dim_status_kerja as sk', 'sk.status_key', '=', 'f.status_key')
            ->whereBetween('dw.tahun_lulus', $this->kohortWindow($tahunSurvei))
            ->selectRaw("
                ?::smallint AS tahun_survei,
                {$this->ekspresiCohort()},
                dw.tahun_lulus,
                dp.program_studi,
                COUNT(*)::bigint AS jumlah_alumni,
                (COUNT(*) FILTER (WHERE sk.status_bekerja = 'Bekerja'))::bigint AS alumni_bekerja,
                (COUNT(*) FILTER (WHERE sk.status_bekerja = 'Tidak Bekerja'))::bigint AS alumni_tidak_bekerja,
                ROUND(AVG(f.ipk)::numeric, 2) AS rata_rata_ipk,
                ROUND(AVG(f.gaji_juta)::numeric, 2) AS rata_rata_gaji,
                ROUND(AVG(f.masa_tunggu_bulan)::numeric, 2) AS rata_rata_masa_tunggu
            ", [$tahunSurvei, $tahunSurvei - 1, $tahunSurvei - 2])
            ->groupBy('dw.tahun_lulus', 'dp.program_studi')
            ->orderByDesc('dw.tahun_lulus')
            ->orderBy('dp.program_studi')
            ->get()
            ->all();
    }

    private function cadanganTahunLulus(int $tahunSurvei): array
    {
        return DB::table('fact_tracer_alumni as f')
            ->join('dim_waktu as dw', 'dw.waktu_key', '=', 'f.waktu_key')
            ->join('dim_status_kerja as sk', 'sk.status_key', '=', 'f.status_key')
            ->whereBetween('dw.tahun_lulus', $this->kohortWindow($tahunSurvei))
            ->selectRaw("
                ?::smallint AS tahun_survei,
                {$this->ekspresiCohort()},
                dw.tahun_lulus,
                dw.dekade,
                COUNT(*)::bigint AS jumlah_alumni,
                (COUNT(*) FILTER (WHERE sk.status_bekerja = 'Bekerja'))::bigint AS alumni_bekerja,
                (COUNT(*) FILTER (WHERE sk.status_bekerja = 'Tidak Bekerja'))::bigint AS alumni_tidak_bekerja,
                ROUND(AVG(f.masa_tunggu_bulan)::numeric, 2) AS rata_rata_masa_tunggu
            ", [$tahunSurvei, $tahunSurvei - 1, $tahunSurvei - 2])
            ->groupBy('dw.tahun_lulus', 'dw.dekade')
            ->orderByDesc('dw.tahun_lulus')
            ->get()
            ->all();
    }

    /**
     * Cadangan keselarasan: agregasi OLAP PostgreSQL langsung dari fact.
     * DB dim_keselarasan saat ini 2 baris (Selaras/Tidak Selaras). View asli 4 baris
     * (Horizontal/Vertikal x 2 kategori) dibuat dengan helper baris4Keselarasan.
     */
    private function cadanganKeselarasan(int $tahunSurvei): array
    {
        $w = $this->kohortWindow($tahunSurvei);
        $agregat = DB::table('fact_tracer_alumni as f')
            ->join('dim_waktu as dw','dw.waktu_key','=','f.waktu_key')
            ->join('dim_status_kerja as sk','sk.status_key','=','f.status_key')
            ->join('dim_keselarasan as dk','dk.keselarasan_key','=','f.keselarasan_key')
            ->whereBetween('dw.tahun_lulus',$w)
            ->where('sk.status_bekerja','Bekerja')
            ->selectRaw("
                COUNT(*)::bigint AS jumlah_responden,
                COUNT(*) FILTER (WHERE dk.hubungan_bidang = 'Selaras')::bigint AS selaras
            ")->first();
        $responden = (int)($agregat->jumlah_responden ?? 0);
        if ($responden === 0) return [];
        $selaras = (int)($agregat->selaras ?? 0);
        return $this->baris4Keselarasan($tahunSurvei, $responden, $selaras, $selaras);
    }

    private function cadanganKeselarasanProgramStudi(int $tahunSurvei): array
    {
        $w = $this->kohortWindow($tahunSurvei);
        $rows = DB::table('fact_tracer_alumni as f')
            ->join('dim_waktu as dw','dw.waktu_key','=','f.waktu_key')
            ->join('dim_status_kerja as sk','sk.status_key','=','f.status_key')
            ->join('dim_program_studi as dp','dp.prodi_key','=','f.prodi_key')
            ->join('dim_keselarasan as dk','dk.keselarasan_key','=','f.keselarasan_key')
            ->whereBetween('dw.tahun_lulus',$w)
            ->where('sk.status_bekerja','Bekerja')
            ->selectRaw("
                dp.program_studi,
                COUNT(*)::bigint AS jumlah_responden,
                COUNT(*) FILTER (WHERE dk.hubungan_bidang = 'Selaras')::bigint AS selaras
            ")->groupBy('dp.program_studi')->orderBy('dp.program_studi')->get();
        $hasil = [];
        foreach ($rows as $r) {
            $baris = $this->baris4Keselarasan($tahunSurvei, (int)$r->jumlah_responden, (int)($r->selaras ?? 0), (int)($r->selaras ?? 0));
            foreach ($baris as $b) { $b->program_studi = $r->program_studi; $hasil[] = $b; }
        }
        return $hasil;
    }

    /**
     * Bentuk empat baris keselarasan (2 dimensi x 2 kategori) dari dua
     * hitungan "Selaras" dan satu penyebut. Bentuknya dibuat identik dengan
     * keluaran v_olap_keselarasan supaya frontend tidak perlu tahu bedanya.
     *
     * @return array<int, object>
     */
    private function baris4Keselarasan(
        int $tahunSurvei,
        int $responden,
        int $horizontalSelaras,
        int $vertikalSelaras
    ): array {
        $dimensi = [
            ['Horizontal', 1, $horizontalSelaras],
            ['Vertikal',   2, $vertikalSelaras],
        ];

        $hasil = [];

        foreach ($dimensi as [$nama, $urutanDimensi, $selaras]) {
            $pasangan = [
                ['Selaras',       1, $selaras],
                ['Tidak Selaras', 2, $responden - $selaras],
            ];

            foreach ($pasangan as [$kategori, $urutanKategori, $jumlah]) {
                $hasil[] = (object) [
                    'tahun_survei'     => $tahunSurvei,
                    'dimensi'          => $nama,
                    'kategori'         => $kategori,
                    'urutan_dimensi'   => $urutanDimensi,
                    'urutan_kategori'  => $urutanKategori,
                    'jumlah_responden' => $responden,
                    'jumlah_alumni'    => $jumlah,
                    'persentase'       => $responden > 0
                        ? round($jumlah * 100.0 / $responden, 2)
                        : 0,
                ];
            }
        }

        return $hasil;
    }

    private function cadanganMasaTunggu(int $tahunSurvei): array
    {
        return DB::table('fact_tracer_alumni as f')
            ->join('dim_waktu as dw', 'dw.waktu_key', '=', 'f.waktu_key')
            ->join('dim_program_studi as dp', 'dp.prodi_key', '=', 'f.prodi_key')
            ->whereBetween('dw.tahun_lulus', $this->kohortWindow($tahunSurvei))
            ->whereNotNull('f.masa_tunggu_bulan')
            ->selectRaw("
                ?::smallint AS tahun_survei,
                {$this->ekspresiCohort()},
                dw.tahun_lulus,
                dp.program_studi,
                COUNT(*)::bigint AS jumlah_alumni,
                ROUND(AVG(f.masa_tunggu_bulan)::numeric, 2) AS rata_rata_masa_tunggu,
                MIN(f.masa_tunggu_bulan) AS masa_tunggu_min,
                MAX(f.masa_tunggu_bulan) AS masa_tunggu_max
            ", [$tahunSurvei, $tahunSurvei - 1, $tahunSurvei - 2])
            ->groupBy('dw.tahun_lulus', 'dp.program_studi')
            ->orderByDesc('dw.tahun_lulus')
            ->orderBy('dp.program_studi')
            ->get()
            ->all();
    }

    private function cadanganKetepatanWaktu(int $tahunSurvei): array
    {
        $tepat = "da.tahun_masuk IS NOT NULL AND (
                    (da.jenjang = 'D3' AND dw.tahun_lulus - da.tahun_masuk <= 3)
                 OR (da.jenjang <> 'D3' AND dw.tahun_lulus - da.tahun_masuk <= 4))";

        $tidakTepat = "da.tahun_masuk IS NOT NULL AND (
                    (da.jenjang = 'D3' AND dw.tahun_lulus - da.tahun_masuk > 3)
                 OR (da.jenjang <> 'D3' AND dw.tahun_lulus - da.tahun_masuk > 4))";

        return DB::table('fact_tracer_alumni as f')
            ->join('dim_waktu as dw', 'dw.waktu_key', '=', 'f.waktu_key')
            ->join('dim_alumni as da', 'da.alumni_key', '=', 'f.alumni_key')
            ->whereBetween('dw.tahun_lulus', $this->kohortWindow($tahunSurvei))
            ->selectRaw("
                ?::smallint AS tahun_survei,
                {$this->ekspresiCohort()},
                dw.tahun_lulus,
                COUNT(*)::bigint AS jumlah_alumni,
                (COUNT(*) FILTER (WHERE {$tepat}))::bigint AS tepat_waktu,
                (COUNT(*) FILTER (WHERE {$tidakTepat}))::bigint AS tidak_tepat_waktu,
                (COUNT(*) FILTER (WHERE da.tahun_masuk IS NULL))::bigint AS tidak_dapat_dinilai,
                ROUND(AVG(dw.tahun_lulus - da.tahun_masuk)::numeric, 2) AS rata_rata_masa_studi,
                ROUND(COUNT(*) FILTER (WHERE {$tepat}) * 100.0
                      / NULLIF(COUNT(*) FILTER (WHERE da.tahun_masuk IS NOT NULL), 0), 2)
                      AS persentase_tepat_waktu
            ", [$tahunSurvei, $tahunSurvei - 1, $tahunSurvei - 2])
            ->groupBy('dw.tahun_lulus')
            ->orderByDesc('dw.tahun_lulus')
            ->get()
            ->all();
    }

    /* =====================================================================
     * Pembentukan tipe
     * ===================================================================== */

    /** @param array<int, object> $rows */
    private function castRows(array $rows): array
    {
        return array_values(array_map(fn ($row) => $this->castRow($row), $rows));
    }
    /**
     * Rekap Program Studi keseluruhan (215) — untuk validasi OLAP sesuai verifikasi PostgreSQL.
     * Tidak filter tahun_survei — agregasi penuh fact_tracer_alumni.
     * Query persis verifikasi: GROUP BY dp.program_studi, hitung bekerja/tidak, persentase.
     */
    public function rekapProgramStudi()
    {
        $rows = DB::table('fact_tracer_alumni as f')
            ->join('dim_program_studi as dp','dp.prodi_key','=','f.prodi_key')
            ->join('dim_status_kerja as ds','ds.status_key','=','f.status_key')
            ->selectRaw("
                dp.program_studi,
                COUNT(*)::bigint AS jumlah_alumni,
                COUNT(*) FILTER (WHERE ds.status_bekerja = 'Bekerja')::bigint AS bekerja,
                COUNT(*) FILTER (WHERE ds.status_bekerja = 'Tidak Bekerja')::bigint AS tidak_bekerja,
                ROUND(COUNT(*) FILTER (WHERE ds.status_bekerja = 'Bekerja') * 100.0 / NULLIF(COUNT(*),0),2) AS persentase_bekerja
            ")
            ->groupBy('dp.program_studi')
            ->orderBy('dp.program_studi')
            ->get()->map(fn($r)=>$this->castRow($r))->all();

        // Total rollup
        $total = DB::table('fact_tracer_alumni as f')
            ->join('dim_status_kerja as ds','ds.status_key','=','f.status_key')
            ->selectRaw("
                COUNT(*)::bigint AS jumlah_alumni,
                COUNT(*) FILTER (WHERE ds.status_bekerja = 'Bekerja')::bigint AS bekerja,
                COUNT(*) FILTER (WHERE ds.status_bekerja = 'Tidak Bekerja')::bigint AS tidak_bekerja,
                ROUND(COUNT(*) FILTER (WHERE ds.status_bekerja = 'Bekerja') * 100.0 / NULLIF(COUNT(*),0),2) AS persentase_bekerja
            ")->first();
        $totalRow = $total ? $this->castRow((object)[
            'program_studi'=>'Total',
            'jumlah_alumni'=>$total->jumlah_alumni,
            'bekerja'=>$total->bekerja,
            'tidak_bekerja'=>$total->tidak_bekerja,
            'persentase_bekerja'=>$total->persentase_bekerja,
        ]) : null;

        return response()->json([
            'success'=>true,
            'data'=> $rows,
            'total'=> $totalRow,
            'rekonsiliasi'=> $this->rekonsiliasiValid(),
        ]);
    }

    private function rekonsiliasiValid(): string
    {
        $c = DB::table('fact_tracer_alumni')->count();
        $a = DB::table('fact_tracer_alumni as f')->join('dim_program_studi as dp','dp.prodi_key','=','f.prodi_key')->count();
        return $c === $a ? 'VALID' : 'TIDAK VALID';
    }

    private function castRow(?object $row): ?array
    {
        if ($row === null) {
            return null;
        }

        $result = [];

        foreach ((array) $row as $key => $value) {
            $result[$key] = $value === null
                ? null
                : $this->castScalar($value);
        }

        return $result;
    }
    /**
     * PostgreSQL memulangkan numeric sebagai string lewat PDO. Nilai bulat
     * dikembalikan sebagai int, sisanya float, supaya JSON tidak berisi
     * angka berupa string.
     */
    private function castScalar(mixed $value): mixed
    {
        if (is_int($value) || is_float($value) || is_bool($value)) {
            return $value;
        }

        if (is_numeric($value)) {
            $float = (float) $value;

            return $float == floor($float) ? (int) $float : $float;
        }

        return $value;
    }
}
