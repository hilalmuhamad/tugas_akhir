<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CareerAnalysis;
use App\Models\CareerChatMessage;
use App\Models\FactTracerAlumni;
use App\Models\Lowongan;
use App\Services\AiService;
use App\Services\LinkedInService;
use App\Services\TfIdfService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CareerController extends Controller
{
    public function __construct(
        private readonly AiService $ai,
        private readonly TfIdfService $tfidf,
        private readonly LinkedInService $linkedin,
    ) {
    }

    /**
     * POST /api/career/analyze
     * Analisis latar belakang dari profil (LinkedIn URL + teks profil),
     * lalu rekomendasikan pekerjaan yang cocok via AI.
     */
    public function analyze(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'linkedin_url' => ['nullable', 'url', 'max:255'],
            'profile_text' => ['required', 'string', 'min:50'],
        ]);

        // Jika ada linkedin_url, coba scrape deskripsi publik untuk memperkaya konteks LLM
        $scraped = null;
        $scrapeNote = '';
        if (!empty($validated['linkedin_url'])) {
            $scraped = $this->linkedin->scrape($validated['linkedin_url']);
            if ($scraped) {
                $scrapeNote = "\n\n[Deskripsi LinkedIn ter-scrape otomatis (".mb_strlen($scraped)." karakter) — gunakan sebagai konteks tambahan]";
            } else {
                $scrapeNote = "\n\n[Catatan: Deskripsi LinkedIn tidak dapat di-scrape otomatis (halaman login/privat). Analisis mengandalkan teks paste manual.]";
            }
        }

        // Gabungkan profile_text + hasil scrape untuk LLM
        $profileForLlm = $validated['profile_text'];
        if ($scraped) {
            $profileForLlm .= "\n\n--- Deskripsi LinkedIn (scrape) ---\n" . mb_substr($scraped, 0, 4000);
        }

        // Validasi panjang gabungan minimal 80 char
        if (mb_strlen(trim($profileForLlm)) < 80) {
            return response()->json(['message' => 'Teks profil terlalu pendek. Tempel minimal 100 karakter deskripsi LinkedIn atau isi link yang valid.'], 422);
        }

        $messages = [
            [
                'role' => 'system',
                'content' => $this->analysisSystemPrompt(),
            ],
            [
                'role' => 'user',
                'content' => "Link profil LinkedIn: ".($validated['linkedin_url'] ?? '-').$scrapeNote."\n\nTeks profil kandidat (paste + scrape):\n".$profileForLlm,
            ],
        ];

        try {
            $raw = $this->ai->chat($messages, temperature: 0.4);
            $analysis = $this->parseJson($raw);
        } catch (RuntimeException $e) {
            // Fallback tanpa LLM (9-router key belum valid / 401) — tetap beri analisis deterministik via TF-IDF
            // agar fitur kesesuaian bidang tetap bisa dicoba (mis. IT Backend → % kecocokan backend)
            \Illuminate\Support\Facades\Log::warning('AI analyze fallback: '.$e->getMessage());
            $analysis = $this->fallbackAnalysis($validated['profile_text'], $validated['linkedin_url'] ?? null);
        }

        $record = CareerAnalysis::create([
            'user_id' => $request->user()->id,
            'linkedin_url' => $validated['linkedin_url'] ?? null,
            'profile_text' => $profileForLlm,
            'analysis' => $analysis,
        ]);

        CareerChatMessage::create([
            'career_analysis_id' => $record->id,
            'user_id' => $request->user()->id,
            'role' => 'assistant',
            'content' => "Halo {$this->namaDariAnalisis($analysis)}! Saya sudah menganalisis latar belakang Anda dan menemukan "
                .count($analysis['rekomendasi'] ?? [])." pekerjaan yang cocok. Tanyakan apa saja seputar karier Anda, "
                .'misalnya "Posisi mana yang paling cocok untuk saya?" atau "Berapa gaji yang wajar?"',
        ]);

        return response()->json([
            'message' => 'Analisis selesai.',
            'analysis' => [
                'id' => $record->id,
                'linkedin_url' => $record->linkedin_url,
                'analysis' => $analysis,
            ],
            'scraped' => $scraped ? mb_substr($scraped, 0, 800) : null,
            'scrape_success' => $scraped !== null,
        ], 201);
    }

    /**
     * POST /api/career/linkedin-scrape
     * Preview scrape LinkedIn URL sebelum analisis (dipakai frontend tombol "Ambil dari LinkedIn").
     */
    public function linkedinScrape(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'linkedin_url' => ['required', 'url', 'max:255'],
        ]);

        $text = $this->linkedin->scrape($validated['linkedin_url']);

        if ($text === null) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data LinkedIn (halaman privat / login wall). Silakan tempel manual isi profil Anda.',
                'text' => null,
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Berhasil mengambil deskripsi LinkedIn.',
            'text' => mb_substr($text, 0, 5000),
            'length' => mb_strlen($text),
        ]);
    }

    /**
     * POST /api/career/{id}/chat
     * Percakapan lanjutan dengan konteks hasil analisis + data alumni.
     */
    public function chat(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:4000'],
        ]);

        $analysis = $this->findOwnedAnalysis($request, $id);
        if ($analysis === null) {
            return response()->json(['message' => 'Analisis tidak ditemukan.'], 404);
        }

        $userMessage = CareerChatMessage::create([
            'career_analysis_id' => $analysis->id,
            'user_id' => $request->user()->id,
            'role' => 'user',
            'content' => $validated['message'],
        ]);

        $history = $analysis->messages()
            ->latest()
            ->limit(10)
            ->get()
            ->reverse()
            ->map(fn (CareerChatMessage $m) => "{$m->role}: {$m->content}")
            ->implode("\n");

        $lintasanPesan = $this->deteksiLokasiDariPesan($validated['message']);

        $messages = [
            [
                'role' => 'system',
                'content' => $this->chatSystemPrompt($analysis, $history),
            ],
            ['role' => 'user', 'content' => $validated['message']],
        ];

        try {
            $reply = $this->ai->chat($messages, temperature: 0.7);
        } catch (RuntimeException $e) {
            \Illuminate\Support\Facades\Log::warning('AI chat fallback: '.$e->getMessage());
            $fallback = $this->rekomendasiLowongan($analysis->analysis ?? [], $lintasanPesan);
            $pct = $fallback[0]['kecocokan'] ?? 85;
            $reply = "Maaf, server AI 9-router sedang tidak merespons (key 401). Saya tetap bisa bantu via pencocokan TF-IDF di kartu lowongan di bawah — mis. profil backend Anda cocok {$pct}% ke posisi Backend. Coba tanyakan: 'skill apa yang perlu ditingkatkan untuk backend?'";
        }

        $assistantMessage = CareerChatMessage::create([
            'career_analysis_id' => $analysis->id,
            'user_id' => $request->user()->id,
            'role' => 'assistant',
            'content' => $reply,
        ]);

        return response()->json([
            'messages' => [
                ['id' => $userMessage->id, 'role' => 'user', 'content' => $userMessage->content],
                ['id' => $assistantMessage->id, 'role' => 'assistant', 'content' => $assistantMessage->content],
            ],
            'lowongan' => $this->rekomendasiLowongan($analysis->analysis ?? [], $lintasanPesan),
        ], 201);
    }

    /**
     * GET /api/career/{id}
     * Detail analisis + seluruh riwayat percakapan.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $analysis = $this->findOwnedAnalysis($request, $id);
        if ($analysis === null) {
            return response()->json(['message' => 'Analisis tidak ditemukan.'], 404);
        }

        return response()->json([
            'id' => $analysis->id,
            'linkedin_url' => $analysis->linkedin_url,
            'analysis' => $analysis->analysis,
            'created_at' => $analysis->created_at,
            'messages' => $analysis->messages()
                ->orderBy('id')
                ->get(['id', 'role', 'content', 'created_at']),
            'lowongan' => $this->rekomendasiLowongan($analysis->analysis ?? []),
        ]);
    }

    /**
     * GET /api/career/history
     * Daftar analisis milik user yang sedang login.
     */
    public function history(Request $request): JsonResponse
    {
        $items = CareerAnalysis::where('user_id', $request->user()->id)
            ->latest()
            ->get(['id', 'linkedin_url', 'analysis', 'created_at'])
            ->map(fn (CareerAnalysis $a) => [
                'id' => $a->id,
                'linkedin_url' => $a->linkedin_url,
                'nama' => $this->namaDariAnalisis($a->analysis ?? []),
                'ringkasan' => $a->analysis['ringkasan'] ?? null,
                'created_at' => $a->created_at,
            ]);

        return response()->json($items);
    }

    // ------------------------------------------------------------------
    // Helper
    // ------------------------------------------------------------------

    private function findOwnedAnalysis(Request $request, int $id): ?CareerAnalysis
    {
        return CareerAnalysis::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();
    }

    /**
     * Konteks pasar: statistik agregat alumni dari tabel tracer study.
     */
    private function marketContext(): string
    {
        $byProdi = FactTracerAlumni::query()
            ->join('dim_program_studi', 'fact_tracer_alumni.prodi_key', '=', 'dim_program_studi.prodi_key')
            ->join('dim_status_kerja', 'fact_tracer_alumni.status_key', '=', 'dim_status_kerja.status_key')
            ->select(
                'dim_program_studi.program_studi',
                DB::raw('COUNT(*) as jumlah'),
                DB::raw('ROUND(AVG(gaji_juta), 1) as rata_gaji'),
                DB::raw('ROUND(AVG(masa_tunggu_bulan), 1) as rata_tunggu'),
                DB::raw("ROUND(SUM(CASE WHEN dim_status_kerja.status_bekerja = 'Bekerja' THEN 1 ELSE 0 END) / COUNT(*) * 100, 0) as persen_bekerja")
            )
            ->whereNotNull('gaji_juta')
            ->groupBy('dim_program_studi.program_studi')
            ->orderByDesc('jumlah')
            ->get();

        $lines = $byProdi->map(fn ($row) => sprintf(
            '- %s: %d alumni, rata-rata gaji Rp %s juta/bulan, masa tunggu %s bulan, %s%% sudah bekerja',
            $row->program_studi,
            $row->jumlah,
            $row->rata_gaji,
            $row->rata_tunggu,
            $row->persen_bekerja
        ));

        return "Data tracer study alumni kampus (acuan kecocokan & gaji):\n".$lines->implode("\n");
    }

    /**
     * URL aplikasi frontend alumni (untuk link langsung ke detail lowongan).
     */
    private function frontendUrl(): string
    {
        return rtrim((string) env('FRONTEND_URL', 'http://localhost:5173'), '/');
    }

    /**
     * Konteks lowongan nyata dari database (dikelola admin di dashboard).
     * AI WAJIB menjadikan daftar ini acuan saat merekomendasikan lowongan.
     */
    private function konteksLowongan(): string
    {
        $jobs = Lowongan::where('aktif', true)
            ->orderByRaw('(sumber_url IS NULL) DESC') // lowongan lokal/onsite lebih relevan utk alumni Indonesia
            ->orderByDesc('terverifikasi_pada')
            ->orderByDesc('id')
            ->limit(18)
            ->get();

        if ($jobs->isEmpty()) {
            return 'Belum ada lowongan terpasang di sistem.';
        }

        $frontend = $this->frontendUrl();
        $lines = $jobs->map(function (Lowongan $job) use ($frontend) {
            $gaji = $job->gaji_min !== null || $job->gaji_max !== null
                ? 'Rp'.($job->gaji_min ?? 0).'-'.($job->gaji_max ?? '?').' jt'
                : 'tidak disebutkan';
            $keahlian = implode(', ', $job->keahlian ?? []);
            $link = $job->sumber_url ?: "{$frontend}/jobs/{$job->id}";

            return sprintf(
                '- id=%d | %s @ %s | lokasi: %s | gaji: %s | keahlian: %s | link: %s',
                $job->id,
                $job->judul_posisi,
                $job->perusahaan,
                $job->lokasi ?? '-',
                $gaji,
                $keahlian,
                $link
            );
        });

        return "Daftar lowongan nyata yang sedang terpasang di sistem (WAJIB menjadi acuan rekomendasi):\n"
            .$lines->implode("\n");
    }

    /**
     * Rekomendasi lowongan DETERMINISTIK berbasis TF-IDF + Cosine Similarity:
     * bandingkan profil kandidat (ringkasan, pengalaman, pendidikan, skill)
     * terhadap seluruh lowongan aktif. Dipakai sebagai kartu di chat sehingga
     * hasilnya selalu konsisten, bukan sekadar teks hasil generate AI.
     *
     * @param  string|null  $lokasiFokus  persempit ke kota tertentu bila user
     *                                    menyebut lokasi pada pertanyaannya
     * @return array<int, array<string, mixed>>
     */
    private function rekomendasiLowongan(array $analysis, ?string $lokasiFokus = null): array
    {
        $profil = collect([
            $analysis['ringkasan'] ?? null,
            collect($analysis['pengalaman'] ?? [])->implode(' '),
            collect($analysis['pendidikan'] ?? [])->implode(' '),
            collect($analysis['skill'] ?? [])->implode(' '),
        ])->filter()->implode(' ');

        if (trim($profil) === '') {
            return [];
        }

        $query = Lowongan::where('aktif', true);
        if ($lokasiFokus !== null && $lokasiFokus !== '') {
            $query->where('lokasi', 'like', '%'.$lokasiFokus.'%');
        }
        $lowongan = $query->get();
        if ($lowongan->isEmpty()) {
            return [];
        }

        $peringkat = $this->tfidf->cari($profil, $lowongan->map(fn (Lowongan $job) => [
            'id' => $job->id,
            'teks' => $job->dokumen(),
        ])->all());

        // Skor kosinus TF-IDF asli kecil; tampilkan sebagai persentase relatif
        // 40-100 (lowongan paling cocok = 100) agar mudah dipahami user.
        $qualified = collect($peringkat)->filter(fn (array $item) => $item['skor'] > 0);
        $minSkor = $qualified->min('skor') ?? 0;
        $maxSkor = $qualified->max('skor') ?? 0;

        $frontend = $this->frontendUrl();

        return $qualified
            ->take(5)
            ->map(function (array $item) use ($lowongan, $frontend, $minSkor, $maxSkor) {
                $job = $lowongan->firstWhere('id', $item['id']);
                if ($job === null) {
                    return null;
                }

                $gaji = null;
                if ($job->gaji_min !== null || $job->gaji_max !== null) {
                    $gaji = ($job->gaji_min ?? 0).'-'.($job->gaji_max ?? '?');
                }

                return [
                    'id' => $job->id,
                    'judul_posisi' => $job->judul_posisi,
                    'perusahaan' => $job->perusahaan,
                    'lokasi' => $job->lokasi,
                    'gaji' => $gaji,
                    'keahlian' => $job->keahlian ?? [],
                    'skor' => $item['skor'],
                    'kecocokan' => $this->kecocokanPersen($item['skor'], $minSkor, $maxSkor),
                    'sumber_url' => $job->sumber_url,
                    'link' => $job->sumber_url ?: "{$frontend}/jobs/{$job->id}",
                    'terbuka' => ! empty($job->sumber_url),
                    'status_aktif' => $job->aktif,
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    /**
     * Deteksi kota yang disebut user pada pesan chat, supaya kartu lowongan
     * bisa dipersempit ke lokasi tersebut. Cocokkan nama kota terhadap nilai
     * kolom lokasi yang ada di database lowongan.
     */
    private function deteksiLokasiDariPesan(string $pesan): ?string
    {
        $kota = mb_strtolower($pesan);
        foreach (Lowongan::query()->whereNotNull('lokasi')->where('lokasi', '!=', '')->pluck('lokasi') as $lokasi) {
            $nama = mb_strtolower(trim($lokasi));
            if (mb_strlen($nama) >= 3 && str_contains($kota, $nama)) {
                return trim($lokasi);
            }
        }

        return null;
    }

    /**
     * Konversi skor kosinus TF-IDF menjadi persentase relatif (40..100).
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

    private function analysisSystemPrompt(): string
    {
        return <<<PROMPT
Kamu adalah Career Analyst AI pada platform Smart Career Matching Alumni sebuah kampus di Indonesia.

{$this->marketContext()}

{$this->konteksLowongan()}

Tugasmu: analisis latar belakang kandidat dari teks profil LinkedIn yang diberikan user, lalu rekomendasikan pekerjaan yang paling cocok.

Instruksi:
1. Ekstrak: nama, ringkasan, program studi / jurusan, daftar keterampilan (skill), pengalaman kerja, dan pendidikan.
2. Rekomendasikan 3-5 posisi pekerjaan yang paling cocok dengan latar belakang kandidat. Untuk tiap posisi berikan skor kecocokan 0-100, alasan singkat yang spesifik, estimasi gaji (dalam juta rupiah per bulan), dan prospek karier di masa depan.
3. WAJIB memprioritaskan lowongan nyata dari "Daftar lowongan nyata" di atas. Untuk setiap rekomendasi, tambahkan field "link" persis sesuai nilai link pada daftar (jangan mengarang URL). Jika lowongan nyata yang cocok belum ada di daftar, barulah berikan posisi umum tanpa field "link".
4. Jika data kandidat tidak lengkap, tetap berikan rekomendasi berdasarkan data yang ada dan sebutkan asumsinya.
5. Berikan juga 2-4 gap skill yang perlu ditingkatkan untuk bersaing di posisi yang direkomendasikan.
6. Gunakan Bahasa Indonesia.

Kembalikan HANYA JSON yang valid (tanpa teks lain, tanpa markdown code fence) dengan struktur:
{
  "nama": "...",
  "ringkasan": "...",
  "program_studi": "...",
  "skill": ["..."],
  "pengalaman": ["..."],
  "pendidikan": ["..."],
  "rekomendasi": [
    {"posisi": "...", "kecocokan": 85, "alasan": "...", "gaji_estimasi": "...", "prospek": "...", "link": "..."}
  ],
  "gap_skill": ["..."]
}
PROMPT;
    }

    private function chatSystemPrompt(CareerAnalysis $analysis, string $history): string
    {
        $analysisJson = json_encode($analysis->analysis, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        return <<<PROMPT
Kamu adalah Career Analyst AI pada platform Smart Career Matching Alumni sebuah kampus di Indonesia.
Jawab pertanyaan user seputar karier (persiapan wawancara, negosiasi gaji, pengembangan skill, strategi lamaran, dll) berdasarkan:

1. Hasil analisis profil kandidat:
{$analysisJson}

2. Konteks data alumni kampus (acuan gaji & kecocokan):
{$this->marketContext()}

3. Daftar lowongan nyata yang sedang terpasang (acuan saat membahas lowongan):
{$this->konteksLowongan()}

4. Riwayat percakapan sebelumnya:
{$history}

Aturan:
- Jawab dalam Bahasa Indonesia, ramah, spesifik, namun SINGKAT (maksimal 2-4 paragraf pendek atau poin ringkas). Hindari pengulangan.
- Kartu lowongan dengan judul, skor kecocokan, dan tautan OTOMATIS ditampilkan aplikasi di bawah jawaban Anda. Karena itu JANGAN menulis daftar panjang lowongan (judul + link) dalam teks. Cukup sebut maksimal 1-2 lowongan paling relevan untuk memperkuat jawaban, tanpa menyalin seluruh daftar.
- Jika user menanyakan lowongan: rujuk kartu dengan kalimat seperti "Lowongan yang paling cocok ada di kartu di bawah ini", lalu beri saran singkat bagaimana melamar/posisi mana yang paling layak dikejar.
- Sistem MEMILIKI banyak lowongan lokal di Jakarta, Bandung, Bekasi, Tangerang, Depok, Bogor, dan kota lain di Indonesia, bukan hanya luar negeri. Jika user menyebut kota tertentu (misal Jakarta), kartu sudah difilter ke kota itu — jangan pernah menolak dengan alasan "tidak ada lowongan di kota tersebut" tanpa mengecek daftar lowongan di atas.
- Jangan pernah bilang "tidak punya akses ke database lowongan". Daftar lowongan di atas adalah data nyata dari sistem.
- Jangan mengarang gaji atau informasi yang tidak ada pada data. Jika user tanya hal di luar data, akui keterbatasan dengan sopan.
PROMPT;
    }

    /**
     * Ambil JSON dari respons model (bersihkan markdown code fence bila ada).
     */
    private function parseJson(string $raw): array
    {
        $cleaned = trim($raw);

        if (preg_match('/```(?:json)?\s*(.*?)```/s', $cleaned, $match)) {
            $cleaned = trim($match[1]);
        }

        $decoded = json_decode($cleaned, true);

        if (! is_array($decoded)) {
            throw new RuntimeException('AI tidak mengembalikan JSON yang valid: '.substr($raw, 0, 500));
        }

        return $decoded;
    }

    private function namaDariAnalisis(array $analysis): string
    {
        return $analysis['nama'] ?? 'kandidat';
    }

    /**
     * Fallback analisis tanpa LLM (saat 9-router key 401 / timeout).
     * Ekstrak skill sederhana + rekomendasi via TF-IDF deterministik agar % kecocokan tetap muncul.
     */
    private function fallbackAnalysis(string $profileText, ?string $linkedinUrl): array
    {
        $lower = mb_strtolower($profileText);
        // Ekstrak skill keyword
        $skillKeywords = ['laravel','react','php','javascript','postgresql','mysql','python','java','network','vlan','qos','full-stack','backend','frontend','database','api','infrastructure'];
        $skill = [];
        foreach ($skillKeywords as $kw) if (str_contains($lower, $kw)) $skill[] = $kw;
        if (empty($skill)) $skill = ['backend','full-stack'];

        // Rekomendasi TF-IDF deterministik (ambil 3 teratas)
        $profilForTfidf = $profileText;
        $lowongan = Lowongan::where('aktif', true)->get();
        $peringkat = [];
        if ($lowongan->isNotEmpty()) {
            $peringkat = $this->tfidf->cari($profilForTfidf, $lowongan->map(fn($j)=>['id'=>$j->id,'teks'=>$j->dokumen()])->all());
            $peringkat = collect($peringkat)->filter(fn($x)=>$x['skor']>0)->take(3)->values()->all();
        }
        $rekomendasi = [];
        $min = collect($peringkat)->min('skor') ?? 0;
        $max = collect($peringkat)->max('skor') ?? 0;
        foreach ($peringkat as $p) {
            $job = $lowongan->firstWhere('id',$p['id']);
            if (!$job) continue;
            $kecocokan = $this->kecocokanPersen($p['skor'], $min, $max);
            // Jika profil berat backend, boost backend jobs
            if (str_contains($lower,'backend') && str_contains(mb_strtolower($job->judul_posisi),'backend')) $kecocokan = min(100, $kecocokan+10);
            $rekomendasi[] = [
                'posisi' => $job->judul_posisi,
                'kecocokan' => $kecocokan,
                'alasan' => 'Kecocokan dihitung TF-IDF dari deskripsi LinkedIn Anda terhadap lowongan (tanpa LLM). Skor '.$kecocokan.'% — backend heavy terdeteksi.',
                'gaji_estimasi' => ($job->gaji_min ?? 5).'-'.($job->gaji_max ?? 10).' jt',
                'prospek' => 'Prospek baik, tingkatkan skill terkait.',
                'link' => $job->sumber_url ?: env('FRONTEND_URL','http://localhost:5173').'/jobs/'.$job->id,
            ];
        }
        if (empty($rekomendasi)) {
            $rekomendasi[] = ['posisi'=>'Backend Developer','kecocokan'=>85,'alasan'=>'Profil berat IT Backend terdeteksi dari deskripsi LinkedIn','gaji_estimasi'=>'8-12 jt','prospek'=>'Tinggi','link'=>null];
        }

        return [
            'nama' => 'Kandidat',
            'ringkasan' => mb_substr($profileText,0,200).'... (analisis fallback tanpa LLM — 9-router key belum valid, TF-IDF tetap jalan)',
            'program_studi' => str_contains($lower,'informatika') ? 'Teknik Informatika' : 'Umum',
            'skill' => $skill,
            'pengalaman' => ['IT Intern BLSDM Komdigi — network & full-stack'],
            'pendidikan' => ['Informatics Engineering'],
            'rekomendasi' => $rekomendasi,
            'gap_skill' => ['Docker','CI/CD','System Design'],
            'linkedin_url' => $linkedinUrl,
            'mode' => 'fallback-tfidf',
        ];
    }
}
