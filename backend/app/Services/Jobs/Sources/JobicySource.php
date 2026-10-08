<?php

namespace App\Services\Jobs\Sources;

use Illuminate\Support\Facades\Http;

/**
 * Sumber gratis tanpa API key: Jobicy.
 * https://jobicy.com/api/v2/remote-jobs
 */
class JobicySource implements JobSource
{
    public function name(): string
    {
        return 'jobicy';
    }

    public function fetch(int $limit): array
    {
        $response = Http::timeout(30)
            ->get('https://jobicy.com/api/v2/remote-jobs', [
                'count' => min($limit, 50),
            ]);

        if ($response->failed()) {
            return [];
        }

        return collect($response->json('jobs') ?? [])
            ->map(fn (array $job) => [
                'judul_posisi' => $job['jobTitle'] ?? '',
                'perusahaan' => $job['companyName'] ?? '',
                'lokasi' => $this->lokasi($job['jobGeo'] ?? null),
                'gaji_min' => $this->angka($job['jobSalaryMin'] ?? null),
                'gaji_max' => $this->angka($job['jobSalaryMax'] ?? null),
                'deskripsi' => $this->teks($job['jobDescription'] ?? $job['jobExcerpt'] ?? ''),
                'keahlian' => array_slice($job['tags'] ?? [], 0, 10),
                'sumber_url' => $job['url'] ?? null,
            ])
            ->filter(fn (array $job) => $job['judul_posisi'] !== '' && $job['perusahaan'] !== '')
            ->values()
            ->all();
    }

    private function lokasi(?string $raw): string
    {
        $raw = trim((string) $raw);

        return $raw === '' ? 'Remote' : $raw;
    }

    private function teks(?string $html): string
    {
        $text = trim((string) strip_tags((string) $html));

        return mb_substr($text, 0, 2000);
    }

    /**
     * Jobicy mengirimkan nominal dalam satuan ribuan (USD), mis. 50000 = $50k.
     * Kita simpan langsung nilainya; ditampilkan oleh frontend sebagai referensi.
     */
    private function angka(mixed $nilai): ?int
    {
        if (! is_numeric($nilai) || (int) $nilai <= 0) {
            return null;
        }

        return (int) round((int) $nilai / 1000);
    }
}
