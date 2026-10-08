<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AlumniProfile;
use App\Models\FactTracerAlumni;
use App\Models\Lowongan;
use App\Services\EtlService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AlumniController extends Controller
{
    /**
     * GET /api/alumni
     * Mengembalikan data tracer alumni (join fact + dimension) dalam
     * bentuk yang strukturnya sama persis dengan AlumniRecord di frontend.
     */
    public function index(): JsonResponse
    {
        $data = FactTracerAlumni::with(['alumni', 'programStudi', 'waktu', 'statusKerja'])
            ->get()
            ->map(function (FactTracerAlumni $fact) {
                return [
                    'id'              => $fact->alumni->id_sumber,
                    'nama'            => $fact->alumni->nama,
                    'gender'          => $fact->alumni->gender,
                    'jenjang'         => $fact->alumni->jenjang,
                    'tahunMasuk'      => $fact->alumni->tahun_masuk,
                    'jabatan'         => $fact->alumni->jabatan,
                    'bidangPekerjaan' => $fact->alumni->bidang_pekerjaan,
                    'kesesuaianBidang' => $fact->alumni->kesesuaian_bidang,
                    'tingkatPendidikanSesuai' => $fact->alumni->tingkat_pendidikan_sesuai,
                    'programStudi'    => $fact->programStudi->program_studi,
                    'specialisasi'    => $fact->programStudi->specialisasi,
                    'pengalamanKerja' => $fact->pengalaman_kerja,
                    'tahunLulus'      => $fact->waktu->tahun_lulus,
                    'ipk'             => (float) $fact->ipk,
                    'statusBekerja'   => $fact->statusKerja->status_bekerja,
                    'masaTungguBulan' => $fact->masa_tunggu_bulan,
                    'gajiJuta'        => $fact->gaji_juta === null ? null : (float) $fact->gaji_juta,
                ];
            })
            ->sortBy('id')
            ->values();

        return response()->json($data);
    }

    /**
     * GET /api/stats
     * Ringkasan angka untuk landing page & halaman Laporan (publik).
     * Seluruh agregasi dijalankan di PostgreSQL (GROUP BY), bukan di memori PHP.
     */
    public function stats(): JsonResponse
    {
        $bekerjaIn = implode(', ', array_map(fn ($s) => DB::getPdo()->quote($s), self::STATUS_BEKERJA));

        $ringkas = DB::table('fact_tracer_alumni as f')
            ->join('dim_status_kerja as sk', 'f.status_key', '=', 'sk.status_key')
            ->selectRaw("
                COUNT(*) AS total,
                SUM(CASE WHEN sk.status_bekerja IN ({$bekerjaIn}) THEN 1 ELSE 0 END) AS bekerja,
                AVG(CASE WHEN f.masa_tunggu_bulan IS NOT NULL THEN f.masa_tunggu_bulan END) AS masa_tunggu,
                AVG(CASE WHEN f.gaji_juta IS NOT NULL THEN f.gaji_juta END) AS gaji
            ")
            ->first();

        $perProdi = DB::table('fact_tracer_alumni as f')
            ->join('dim_program_studi as dp', 'f.prodi_key', '=', 'dp.prodi_key')
            ->join('dim_status_kerja as sk', 'f.status_key', '=', 'sk.status_key')
            ->selectRaw("
                dp.program_studi AS prodi,
                COUNT(*) AS jumlah,
                SUM(CASE WHEN sk.status_bekerja IN ({$bekerjaIn}) THEN 1 ELSE 0 END) AS bekerja,
                AVG(CASE WHEN f.gaji_juta IS NOT NULL THEN f.gaji_juta END) AS avg_gaji
            ")
            ->groupBy('dp.program_studi')
            ->get();

        $totalAlumni  = (int) ($ringkas->total ?? 0);
        $bekerja      = (int) ($ringkas->bekerja ?? 0);
        $masaTunggu   = $ringkas->masa_tunggu;
        $gaji         = $ringkas->gaji;

$gajiPerProdi = $perProdi
            ->mapWithKeys(fn ($r) => [self::prodiLabel($r->prodi) => $r->avg_gaji === null ? 0.0 : round((float) $r->avg_gaji, 1)])
            ->sortDesc();

        $persenKerjaPerProdi = $perProdi
            ->mapWithKeys(fn ($r) => [self::prodiLabel($r->prodi) => $r->jumlah > 0 ? round($r->bekerja / $r->jumlah * 100, 1) : 0.0])
            ->sortDesc();

        return response()->json([
            'total_alumni'          => $totalAlumni,
            'alumni_bekerja'        => $bekerja,
            'persentase_kerja'      => $totalAlumni > 0 ? round($bekerja / $totalAlumni * 100, 1) : 0,
            'masa_tunggu_rata'      => $masaTunggu ? round((float) $masaTunggu, 1) : null,
            'gaji_rata_rata'        => $gaji ? round((float) $gaji, 1) : null,
            'jumlah_prodi'          => $perProdi->count(),
            'program_studi'         => $perProdi->pluck('prodi')->map(fn ($p) => self::prodiLabel($p))->values(),
            'gaji_per_prodi'        => (object) $gajiPerProdi->all(),
            'persen_kerja_per_prodi'=> (object) $persenKerjaPerProdi->all(),
            'total_lowongan'        => Lowongan::count(),
        ]);
    }

    /**
     * Status kerja yang dihitung sebagai terserap kerja.
     *
     * Sejak revisi pascasidang 2026-08-27 dim_status_kerja hanya berisi dua
     * nilai, jadi daftar ini tinggal satu anggota. Tetap ditulis sebagai
     * tetapan supaya kueri di bawah tidak menuliskan literalnya berulang kali.
     */
    private const STATUS_BEKERJA = ['Bekerja'];

    /** Nama tampilan program studi (kode internal -> nama laporan). */
    private const PRODI_LABEL = [
        'Sci&Tech'  => 'Teknik Informatika',
        'Comm&Mgmt' => 'Manajemen',
        'Others'    => 'Akuntansi',
    ];

    private static function prodiLabel(string $prodi): string
    {
        return self::PRODI_LABEL[$prodi] ?? $prodi;
    }

    /**
     * Kategori keselarasan, sama untuk dimensi horizontal (kesesuaian bidang)
     * maupun vertikal (kesesuaian tingkat pendidikan). Mengikuti istilah
     * Kemendikti: hanya selaras dan tidak selaras.
     */
    private const KATEGORI_KESELARASAN = ['Selaras', 'Tidak Selaras'];

    /** Dua klasifikasi status kerja yang dikenal sistem. */
    private const KLASIFIKASI_STATUS = ['Bekerja', 'Tidak Bekerja'];

    /**
     * GET /api/laporan/unduh?token=...
     * Unduh laporan IKU tracer study alumni dalam bentuk CSV (diklasifikasikan
     * per status kerja dan per program studi). Dipakai tombol "Generate
     * Laporan IKU" agar unduhan ditangani langsung oleh browser (andalan,
     * tidak tergantung klik sintetis di frontend).
     */
    public function unduhLaporan(Request $request): StreamedResponse
    {
        $accessToken = PersonalAccessToken::findToken((string) $request->query('token', ''));
        abort_unless($accessToken?->tokenable, 401, 'Sesi berakhir, silakan login kembali.');

        $bekerjaIn = implode(', ', array_map(fn ($s) => DB::getPdo()->quote($s), self::STATUS_BEKERJA));

        // Jendela kohort yang sama dengan dashboard (TS-1 s.d. TS-3).
        $tahunAkhir = (int) ($request->query('tahunAkhir') ?? (date('Y') - 1));
        $tahunAwal  = (int) ($request->query('tahunAwal') ?? ($tahunAkhir - 2));

        $ringkas = DB::table('fact_tracer_alumni as f')
            ->join('dim_status_kerja as sk', 'f.status_key', '=', 'sk.status_key')
            ->join('dim_waktu as dw', 'f.waktu_key', '=', 'dw.waktu_key')
            ->whereBetween('dw.tahun_lulus', [$tahunAwal, $tahunAkhir])
            ->selectRaw("
                COUNT(*) AS total,
                SUM(CASE WHEN sk.status_bekerja IN ({$bekerjaIn}) THEN 1 ELSE 0 END) AS bekerja,
                AVG(CASE WHEN f.masa_tunggu_bulan IS NOT NULL THEN f.masa_tunggu_bulan END) AS masa_tunggu,
                AVG(CASE WHEN f.gaji_juta IS NOT NULL THEN f.gaji_juta END) AS gaji
            ")
            ->first();

        $total = (int) ($ringkas->total ?? 0);
        $bekerja = (int) ($ringkas->bekerja ?? 0);
        $masaTunggu = round((float) ($ringkas->masa_tunggu ?? 0), 1);
        $gaji = round((float) ($ringkas->gaji ?? 0), 1);

        $klasifikasi = DB::table('fact_tracer_alumni as f')
            ->join('dim_status_kerja as sk', 'f.status_key', '=', 'sk.status_key')
            ->join('dim_waktu as dw', 'f.waktu_key', '=', 'dw.waktu_key')
            ->selectRaw('sk.status_bekerja AS status, COUNT(*) AS jumlah')
            ->whereBetween('dw.tahun_lulus', [$tahunAwal, $tahunAkhir])
            ->whereIn('sk.status_bekerja', self::KLASIFIKASI_STATUS)
            ->groupBy('sk.status_bekerja')
            ->pluck('jumlah', 'status')
            ->all();

        // Tambahkan baris "Lainnya" untuk status di luar klasifikasi resmi.
        $klasifikasiLengkap = collect(self::KLASIFIKASI_STATUS)
            ->mapWithKeys(fn ($s) => [$s => (int) ($klasifikasi[$s] ?? 0)]);
        $terhitung = $klasifikasiLengkap->sum();
        if ($total > $terhitung) {
            $klasifikasiLengkap['Lainnya'] = $total - $terhitung;
        }

        $perProdi = DB::table('fact_tracer_alumni as f')
            ->join('dim_program_studi as dp', 'f.prodi_key', '=', 'dp.prodi_key')
            ->join('dim_status_kerja as sk', 'f.status_key', '=', 'sk.status_key')
            ->join('dim_waktu as dw', 'f.waktu_key', '=', 'dw.waktu_key')
            ->whereBetween('dw.tahun_lulus', [$tahunAwal, $tahunAkhir])
            ->selectRaw("
                dp.program_studi AS prodi,
                COUNT(*) AS jumlah,
                SUM(CASE WHEN sk.status_bekerja = 'Bekerja' THEN 1 ELSE 0 END) AS b_bekerja,
                SUM(CASE WHEN sk.status_bekerja = 'Tidak Bekerja' THEN 1 ELSE 0 END) AS b_tidak_bekerja,
                AVG(CASE WHEN f.gaji_juta IS NOT NULL THEN f.gaji_juta END) AS avg_gaji,
                AVG(CASE WHEN f.masa_tunggu_bulan IS NOT NULL THEN f.masa_tunggu_bulan END) AS avg_tunggu
            ")
            ->whereIn('sk.status_bekerja', self::KLASIFIKASI_STATUS)
            ->groupBy('dp.program_studi')
            ->get()
            ->map(fn ($r) => [
                self::prodiLabel($r->prodi),
                (int) $r->jumlah,
                (int) $r->b_bekerja,
                (int) $r->b_tidak_bekerja,
                $r->jumlah > 0 ? round($r->b_bekerja / $r->jumlah * 100, 1) : 0.0,
                $r->avg_gaji === null ? 0.0 : round((float) $r->avg_gaji, 1),
                $r->avg_tunggu === null ? 0.0 : round((float) $r->avg_tunggu, 1),
            ])
            ->sortByDesc(fn ($row) => $row[1])
            ->values()
            ->all();

        $waktu = now()->locale('id')->translatedFormat('l, d F Y, H:i');

        $rows = [
            ['LAPORAN IKU TRACER STUDY ALUMNI'],
            ['Smart Career Matching Alumni - Zona historis (kuesioner) + zona prediksi (Random Forest)'],
            ['Dibuat pada', $waktu],
            [''],
            ['INDIKATOR', 'NILAI'],
            ['Total alumni', $total],
            ['Alumni bekerja', $bekerja],
            ['Persentase bekerja', $total > 0 ? round($bekerja / $total * 100, 1).'%' : '0%'],
            ['Masa tunggu rata-rata (bulan)', $masaTunggu ?: '-'],
            ['Gaji rata-rata (Rp juta/bulan)', $gaji ?: '-'],
            ['Jumlah program studi', DB::table('dim_program_studi')->count()],
            ['Total lowongan aktif', Lowongan::count()],
            [''],
            ['KLASIFIKASI STATUS KERJA ALUMNI', 'JUMLAH', 'PERSEN'],
        ];
        foreach ($klasifikasiLengkap as $status => $jumlah) {
            $rows[] = [$status, $jumlah, $total > 0 ? round($jumlah / $total * 100, 1).'%' : '0%'];
        }
        $rows[] = [''];
        $rows[] = [
            'PROGRAM STUDI', 'TOTAL', 'BEKERJA', 'TIDAK BEKERJA',
            'BEKERJA (%)', 'GAJI RATA (JT)', 'MASA TUNGGU (BLN)',
        ];
        $rows = array_merge($rows, $perProdi);

        return response()->streamDownload(function () use ($rows) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            foreach ($rows as $row) {
                fputcsv($out, $row);
            }
            fclose($out);
        }, 'laporan-iku-tracer-study-'.date('Y-m-d').'.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * GET /api/laporan/unduh-pdf
     * Laporan PDF lengkap untuk staf Career Development. Seluruh angka
     * diambil langsung dari view OLAP PostgreSQL (v_olap_*); Laravel
     * hanya memfilter tahun_survei, mengurutkan, dan meneruskan ke Blade.
     */
    public function unduhLaporanPdf(Request $request)
    {
        $accessToken = PersonalAccessToken::findToken(
            (string) $request->query('token', '')
        );

        abort_unless(
            $accessToken?->tokenable,
            401,
            'Sesi berakhir, silakan login kembali.'
        );

        $tahunSurvei = (int) $request->query('tahun_survei', 2025);

        $summary = DB::table('v_olap_summary')
            ->where('tahun_survei', $tahunSurvei)
            ->first();

        abort_unless(
            $summary,
            404,
            'Data laporan OLAP tidak tersedia.'
        );

        $data = [
            'tahunSurvei' => $tahunSurvei,

            'summary' => $summary,

            'tahunLulus' => DB::table('v_olap_tahun_lulus')
                ->where('tahun_survei', $tahunSurvei)
                ->orderByDesc('tahun_lulus')
                ->get(),

            'statusKerja' => DB::table('v_olap_status_kerja')
                ->where('tahun_survei', $tahunSurvei)
                ->orderByDesc('tahun_lulus')
                ->get(),

            'programStudi' => DB::table('v_olap_program_studi')
                ->where('tahun_survei', $tahunSurvei)
                ->orderByDesc('tahun_lulus')
                ->orderBy('program_studi')
                ->get(),

            'keselarasan' => DB::table('v_olap_keselarasan')
                ->where('tahun_survei', $tahunSurvei)
                ->orderBy('urutan_dimensi')
                ->orderBy('urutan_kategori')
                ->get(),

            'keselarasanProgramStudi' =>
                DB::table('v_olap_keselarasan_program_studi')
                    ->where('tahun_survei', $tahunSurvei)
                    ->orderBy('program_studi')
                    ->orderBy('urutan_dimensi')
                    ->orderBy('urutan_kategori')
                    ->get(),

            'masaTunggu' => DB::table('v_olap_masa_tunggu')
                ->where('tahun_survei', $tahunSurvei)
                ->orderByDesc('tahun_lulus')
                ->orderBy('program_studi')
                ->get(),

            'ketepatanWaktu' => DB::table('v_olap_ketepatan_waktu')
                ->where('tahun_survei', $tahunSurvei)
                ->orderByDesc('tahun_lulus')
                ->get(),

            'waktu' => now()
                ->locale('id')
                ->translatedFormat('l, d F Y, H:i'),
        ];

        $pdf = Pdf::loadView(
            'laporan.tracer-study',
            $data
        )->setPaper('a4');

        return $pdf->download(
            'laporan-tracer-study-alumni-' .
            date('Y-m-d') .
            '.pdf'
        );
    }

    /**
     * GET /api/profile
     * Kuisioner profil alumni milik pengguna yang sedang login.
     */
    public function showProfile(Request $request): JsonResponse
    {
        $profile = AlumniProfile::where('user_id', $request->user()->id)->first();

        return response()->json($profile ? $this->mapProfile($profile) : null);
    }

    /**
     * POST /api/profile
     * Simpan / perbarui kuisioner profil alumni (khusus role alumni).
     * Event-Driven: setelah updateOrCreate, AlumniProfileObserver (created/updated)
     * otomatis -> EtlService::syncSingleProfile(alumniId) -> OlapDataUpdated broadcast.
     * Controller TIDAK lagi memanggil sync manual (instant single-profile, bukan rebuild).
     */
    public function saveProfile(Request $request): JsonResponse
    {
        abort_unless(in_array($request->user()->role, ['alumni', 'admin']), 403, 'Khusus alumni & admin');

        $validated = $request->validate([
            'nama'              => ['required', 'string', 'max:100'],
            'gender'            => ['required', 'in:L,P'],
            'jenjang'           => ['required', 'in:D3,S1'],
            'programStudi'      => ['required', 'string', 'max:50'],
            'specialisasi'      => ['required', 'string', 'max:50'],
            'pengalamanKerja'   => ['required', 'in:Ya,Tidak'],
            'tahunMasuk'        => ['required', 'integer', 'between:2000,'.(int) date('Y')],
            'tahunLulus'        => ['required', 'integer', 'gte:tahunMasuk', 'between:2000,'.((int) date('Y') + 1)],
            'tanggalLulus'      => ['nullable', 'date'],
            'tanggalMulaiBekerja' => ['nullable', 'date', 'after_or_equal:tanggalLulus'],
            'ipk'               => ['required', 'numeric', 'between:0,4'],
            'statusBekerja'     => ['required', Rule::in(self::KLASIFIKASI_STATUS)],
            'masaTungguBulan'   => ['nullable', 'integer', 'min:0'],
            'gajiJuta'          => ['nullable', 'numeric', 'min:0'],
            'jabatan'           => ['required_if:statusBekerja,Bekerja', 'nullable', 'string', 'max:100'],
            'bidangPekerjaan'   => ['required_if:statusBekerja,Bekerja', 'nullable', 'string', 'max:100'],
            'kesesuaianBidang'  => ['required_if:statusBekerja,Bekerja', 'nullable', Rule::in(self::KATEGORI_KESELARASAN)],
            'tingkatPendidikanSesuai' => ['required_if:statusBekerja,Bekerja', 'nullable', Rule::in(self::KATEGORI_KESELARASAN)],
        ]);

        // Keselarasan dan detail pekerjaan hanya bermakna bagi alumni yang
        // bekerja. Bila statusnya 'Tidak Bekerja', isian sisa kuesioner
        // dikosongkan di sini supaya tidak ada baris berstatus tidak bekerja
        // tetapi tetap punya kategori keselarasan.
        $bekerja = $validated['statusBekerja'] === 'Bekerja';
        // Masa tunggu kerja dihitung otomatis dari tanggal mulai bekerja pertama
        // dikurangi tanggal kelulusan (dalam bulan penuh, minimal 0).
        $masaTunggu = $validated['masaTungguBulan'] ?? null;
        if (isset($validated['tanggalLulus'], $validated['tanggalMulaiBekerja'])) {
            $masaTunggu = max(0, floor(
                \Carbon\Carbon::parse($validated['tanggalLulus'])
                    ->diffInMonths(\Carbon\Carbon::parse($validated['tanggalMulaiBekerja']))
            ));
        }

        $masaStudi = $validated['tahunLulus'] - $validated['tahunMasuk'];
        $durasiIdeal = $validated['jenjang'] === 'D3' ? 3 : 4;
        $lulusTepatWaktu = $masaStudi <= $durasiIdeal;

        $profile = AlumniProfile::updateOrCreate(
            ['user_id' => $request->user()->id],
            [
                'nama'             => $validated['nama'],
                'gender'           => $validated['gender'],
                'jenjang'          => $validated['jenjang'],
                'program_studi'    => $validated['programStudi'],
                'specialisasi'     => $validated['specialisasi'],
                'pengalaman_kerja' => $validated['pengalamanKerja'],
                'tahun_masuk'      => $validated['tahunMasuk'],
                'tahun_lulus'      => $validated['tahunLulus'],
                'tanggal_lulus'    => $validated['tanggalLulus'] ?? null,
                'tanggal_mulai_bekerja' => $validated['tanggalMulaiBekerja'] ?? null,
                'ipk'              => $validated['ipk'],
                'status_bekerja'   => $validated['statusBekerja'],
                'masa_tunggu_bulan' => $bekerja ? $masaTunggu : null,
                'gaji_juta'        => $bekerja ? ($validated['gajiJuta'] ?? null) : null,
                'jabatan'          => $bekerja ? ($validated['jabatan'] ?? null) : null,
                'bidang_pekerjaan' => $bekerja ? ($validated['bidangPekerjaan'] ?? null) : null,
                'kesesuaian_bidang' => $bekerja ? ($validated['kesesuaianBidang'] ?? null) : null,
                'tingkat_pendidikan_sesuai' => $bekerja ? ($validated['tingkatPendidikanSesuai'] ?? null) : null,
                'lulus_tepat_waktu' => $lulusTepatWaktu,
            ]
        );

        // Jembatan OLTP -> OLAP sekarang event-driven via AlumniProfileObserver
        // (created/updated -> syncSingleProfile -> broadcast OlapDataUpdated).
        // Tidak perlu $etl->syncProfile manual — observer sudah instant.

        return response()->json([
            'message' => 'Kuisioner berhasil disimpan.',
            'profile' => $this->mapProfile($profile->fresh()),
            'prediksi' => [
                'masaStudi' => $masaStudi,
                'durasiIdeal' => $durasiIdeal,
                'lulusTepatWaktu' => $lulusTepatWaktu,
            ],
        ]);
    }

    private function mapProfile(AlumniProfile $profile): array
    {
        return [
            'id'              => $profile->id,
            'nama'            => $profile->nama,
            'gender'          => $profile->gender,
            'jenjang'         => $profile->jenjang,
            'programStudi'    => $profile->program_studi,
            'specialisasi'    => $profile->specialisasi,
            'pengalamanKerja' => $profile->pengalaman_kerja,
            'tahunMasuk'      => $profile->tahun_masuk,
            'tahunLulus'      => $profile->tahun_lulus,
            'tanggalLulus'    => $profile->tanggal_lulus,
            'tanggalMulaiBekerja' => $profile->tanggal_mulai_bekerja,
            'ipk'             => (float) $profile->ipk,
            'statusBekerja'   => $profile->status_bekerja,
            'masaTungguBulan' => $profile->masa_tunggu_bulan,
            'gajiJuta'        => $profile->gaji_juta === null ? null : (float) $profile->gaji_juta,
            'jabatan'          => $profile->jabatan,
            'bidangPekerjaan'  => $profile->bidang_pekerjaan,
            'kesesuaianBidang' => $profile->kesesuaian_bidang,
            'tingkatPendidikanSesuai' => $profile->tingkat_pendidikan_sesuai,
            'lulusTepatWaktu' => (bool) $profile->lulus_tepat_waktu,
        ];
    }
}
