<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lowongan;
use App\Models\SearchLog;
use App\Services\Jobs\JobScraperService;
use App\Services\TfIdfService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobController extends Controller
{
    public function __construct(private readonly TfIdfService $tfidf)
    {
    }

    /**
     * GET /api/jobs
     * Daftar lowongan aktif (sumber: seeder + scraping web).
     * Admin memakai ?semua=1 untuk melihat/mengaktifkan kembali
     * yang dinonaktifkan filter IT.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Lowongan::orderByDesc('terverifikasi_pada')
            ->orderByDesc('id');

        if ($request->query('semua') != '1') {
            $query->where('aktif', true);
        }

        $jobs = $query->get()
            ->map(fn (Lowongan $job) => $this->bentuk($job));

        return response()->json($jobs);
    }

    /**
     * POST /api/jobs/search
     * Pencarian lowongan bahasa alami berbasis TF-IDF + Cosine Similarity.
     * Mendukung filter daerah kerja dan penyempurnaan hasil menggunakan
     * profil kandidat (pengalaman, pendidikan, keahlian) dari analisis LinkedIn.
     * Hasil diurutkan dari skor kemiripan tertinggi, query dicatat ke log.
     */
    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => ['required', 'string', 'min:2', 'max:255'],
            'daerah' => ['nullable', 'string', 'max:100'],
            'profil' => ['nullable', 'array'],
            'profil.pengalaman' => ['nullable', 'array'],
            'profil.pengalaman.*' => ['string', 'max:500'],
            'profil.pendidikan' => ['nullable', 'array'],
            'profil.pendidikan.*' => ['string', 'max:500'],
            'profil.keahlian' => ['nullable', 'array'],
            'profil.keahlian.*' => ['string', 'max:500'],
        ]);

        $query = $validated['query'];
        $daerah = $validated['daerah'] ?? null;

        $lowonganQuery = Lowongan::query()->where('aktif', true);
        if ($daerah !== null && $daerah !== '') {
            $lowonganQuery->where('lokasi', 'like', '%'.$daerah.'%');
        }
        $lowongan = $lowonganQuery->get();

        $dokumen = $lowongan->map(fn (Lowongan $job) => [
            'id' => $job->id,
            'teks' => $job->dokumen(),
        ])->all();

        // Query utama (60%) + teks profil kandidat (40%) untuk rekomendasi yang lebih spesifik
        $kueri = [['teks' => $query, 'bobot' => 0.6]];
        $profil = $validated['profil'] ?? [];
        $teksProfil = trim(collect([
            $profil['pengalaman'] ?? [],
            $profil['pendidikan'] ?? [],
            $profil['keahlian'] ?? [],
        ])->flatten()->implode(' '));

        if ($teksProfil !== '') {
            $kueri[] = ['teks' => $teksProfil, 'bobot' => 0.4];
        }

        $peringkat = $this->tfidf->skorKombinasi($kueri, $dokumen);

        // Normalisasi skor TF-IDF (nilai kosinus asli sangat kecil) menjadi
        // persentase relatif 40-100 sehingga mudah dipahami pengguna:
        // lowongan paling cocok = 100%, yang paling rendah pada hasil = ~40%.
        $qualified = collect($peringkat)->filter(fn (array $item) => $item['skor'] > 0);
        $minSkor = $qualified->min('skor') ?? 0;
        $maxSkor = $qualified->max('skor') ?? 0;

        $hasil = $qualified
            ->take(20)
            ->map(function (array $item) use ($lowongan, $minSkor, $maxSkor) {
                $job = $lowongan->firstWhere('id', $item['id']);

                return $this->bentuk($job)->merge([
                    'skor' => $item['skor'],
                    'kecocokan' => $this->kecocokanPersen($item['skor'], $minSkor, $maxSkor),
                ]);
            })
            ->values();

        SearchLog::create([
            'user_id' => $request->user()?->id,
            'query' => $query.($daerah ? " (daerah: {$daerah})" : ''),
            'jumlah_hasil' => $hasil->count(),
            'kategori_deteksi' => $this->deteksiKategori($query),
        ]);

        return response()->json([
            'query' => $query,
            'daerah' => $daerah,
            'profil_digunakan' => $teksProfil !== '',
            'metode' => 'tf-idf + cosine similarity (dengan profil kandidat bila tersedia)',
            'total_korpus' => $lowongan->count(),
            'hasil' => $hasil,
        ]);
    }

    /**
     * GET /api/jobs/regions
     * Daftar daerah kerja unik dari seluruh lowongan (untuk dropdown filter).
     */
    public function regions(): JsonResponse
    {
        $regions = collect();
        foreach (Lowongan::query()->whereNotNull('lokasi')->where('lokasi', '!=', '')->pluck('lokasi') as $lokasi) {
            $key = mb_strtolower(trim($lokasi));
            if ($key === '') {
                continue;
            }
            $regions[$key] = mb_convert_case(trim($lokasi), MB_CASE_TITLE, 'UTF-8');
        }

        return response()->json($regions->sort()->values());
    }

    /**
     * GET /api/search-logs
     * Riwayat pencarian (untuk halaman Log Pencarian admin).
     */
    public function logs(Request $request): JsonResponse
    {
        $logs = SearchLog::with('user:id,name')
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn (SearchLog $log) => [
                'id' => $log->id,
                'user' => $log->user?->name ?? 'Admin/Anonim',
                'query' => $log->query,
                'jumlah_hasil' => $log->jumlah_hasil,
                'kategori_deteksi' => $log->kategori_deteksi,
                'created_at' => $log->created_at?->toDateTimeString(),
            ]);

        return response()->json($logs);
    }

    /**
     * POST /api/jobs
     * Tambah lowongan manual oleh admin.
     */
    public function store(Request $request): JsonResponse
    {
        abort_unless($request->user()->role === 'admin', 403, 'Khusus admin');

        $validated = $request->validate([
            'judul_posisi' => ['required', 'string', 'max:255'],
            'perusahaan'   => ['required', 'string', 'max:255'],
            'lokasi'       => ['nullable', 'string', 'max:255'],
            'gaji_min'     => ['nullable', 'numeric', 'min:0'],
            'gaji_max'     => ['nullable', 'numeric', 'min:0'],
            'deskripsi'    => ['nullable', 'string', 'max:2000'],
            'keahlian'     => ['nullable', 'array'],
            'keahlian.*'   => ['string', 'max:255'],
            'sumber_url'   => ['nullable', 'url', 'max:500'],
        ]);

        $job = Lowongan::create([
            'judul_posisi'       => $validated['judul_posisi'],
            'perusahaan'         => $validated['perusahaan'],
            'lokasi'             => $validated['lokasi'] ?? null,
            'gaji_min'           => $validated['gaji_min'] ?? null,
            'gaji_max'           => $validated['gaji_max'] ?? null,
            'deskripsi'          => $validated['deskripsi'] ?? '',
            'keahlian'           => $validated['keahlian'] ?? [],
            'sumber_url'         => $validated['sumber_url'] ?? null,
            'terverifikasi_pada' => now(),
        ]);

        return response()->json($this->bentuk($job), 201);
    }

    /**
     * DELETE /api/jobs/{id}
     * Hapus lowongan oleh admin.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        abort_unless($request->user()->role === 'admin', 403, 'Khusus admin');

        $job = Lowongan::findOrFail($id);
        $job->delete();

        return response()->json(['message' => 'Lowongan dihapus']);
    }

    /**
     * PATCH /api/jobs/{id}
     * Ubah status aktif/nonaktif lowongan oleh admin.
     * Lowongan nonaktif tidak muncul di pencarian & rekomendasi AI.
     */
    public function toggleAktif(Request $request, int $id): JsonResponse
    {
        abort_unless($request->user()->role === 'admin', 403, 'Khusus admin');

        $validated = $request->validate([
            'aktif' => ['required', 'boolean'],
        ]);

        $job = Lowongan::findOrFail($id);
        $job->aktif = $validated['aktif'];
        $job->save();

        return response()->json($this->bentuk($job));
    }

    /**
     * POST /api/jobs/scrape
     * Trigger scraping lowongan dari 4 sumber (Loker, Remotive, Jobicy, Adzuna) — khusus admin.
     * Dipakai admin untuk menambah korpus pencocokan kesesuaian bidang (mis. IT Backend).
     */
    public function scrape(Request $request, JobScraperService $scraper): JsonResponse
    {
        abort_unless($request->user()->role === 'admin', 403, 'Khusus admin');

        $validated = $request->validate([
            'limit' => ['nullable', 'integer', 'min:1', 'max:20'],
            'source' => ['nullable', 'string', 'in:Loker,Remotive,Jobicy,Adzuna'],
        ]);

        $limit = $validated['limit'] ?? 5;
        $source = $validated['source'] ?? null;

        $result = $scraper->scrape($source, $limit);

        return response()->json([
            'message' => 'Scraping selesai.',
            'result' => $result,
        ]);
    }

    private function bentuk(Lowongan $job): \Illuminate\Support\Collection
    {
        return collect([
            'id' => $job->id,
            'judul_posisi' => $job->judul_posisi,
            'perusahaan' => $job->perusahaan,
            'lokasi' => $job->lokasi,
            'gaji_min' => $job->gaji_min,
            'gaji_max' => $job->gaji_max,
            'keahlian' => $job->keahlian,
            'deskripsi' => $job->deskripsi,
            'sumber_url' => $job->sumber_url,
            'terbuka' => ! empty($job->sumber_url),
            'aktif' => $job->aktif,
        ]);
    }

    /**
     * Konversi skor kemiripan TF-IDF (0..~1) menjadi persentase relatif
     * terhadap rentang skor pada hasil pencarian (40..100).
     */
    private function kecocokanPersen(float $skor, float $minSkor, float $maxSkor): int
    {
        if ($skor <= 0) {
            return 0;
        }
        if ($maxSkor <= $minSkor) {
            return 100;
        }

        return (int) round(40 + (($skor - $minSkor) / ($maxSkor - $minSkor)) * 60);
    }

    private function deteksiKategori(string $query): string
    {
        $q = mb_strtolower($query);
        $kategori = [
            'Teknologi Informasi' => ['developer', 'programmer', 'software', 'frontend', 'backend',
                'fullstack', 'data analyst', 'data scientist', 'devops', 'network', 'web developer', 'coding', 'mobile', 'qa', 'tester', 'teknologi', 'information technology', 'it support', 'it staff'],
            'Keuangan & Akuntansi' => ['finance', 'keuangan', 'accounting', 'akuntansi', 'pajak', 'tax', 'audit', 'bank', 'investasi'],
            'Pemasaran & Penjualan' => ['marketing', 'pemasaran', 'sales', 'penjualan', 'digital marketing', 'seo', 'iklan', 'advertising', 'content'],
            'SDM & Administrasi' => ['hr', 'sdm', 'recruitment', 'rekrutmen', 'admin', 'administrasi', 'sekretaris', 'office'],
            'Logistik & Operasional' => ['logistik', 'logistics', 'kargo', 'cargo', 'gudang', 'warehouse', 'supply chain', 'pengiriman'],
        ];

        foreach ($kategori as $nama => $kataKunci) {
            foreach ($kataKunci as $kata) {
                if (str_contains($q, $kata)) {
                    return $nama;
                }
            }
        }

        return 'Umum';
    }
}
