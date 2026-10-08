<?php

namespace App\Services\Jobs\Sources;

use Illuminate\Support\Facades\Http;

/**
 * Sumber gratis tanpa API key: Remotive.
 * https://remotive.com/api/remote-jobs
 *
 * Langsung minta kategori software-dev (terdokumentasi di API Remotive)
 * agar yang diambil sejak awal sudah lowongan IT, bukan acak.
 */
class RemotiveSource implements JobSource
{
    public function name(): string
    {
        return 'remotive';
    }

    public function fetch(int $limit): array
    {
        $response = Http::timeout(30)
            ->get('https://remotive.com/api/remote-jobs', [
                'limit' => min($limit, 100),
                'category' => 'software-dev',
            ]);

        if ($response->failed()) {
            return [];
        }

        return collect($response->json('jobs') ?? [])
            ->map(fn (array $job) => [
                'judul_posisi' => $job['title'] ?? '',
                'perusahaan' => $job['company_name'] ?? '',
                'lokasi' => $this->lokasi($job['candidate_required_location'] ?? null),
                'gaji_min' => null,
                'gaji_max' => null,
                'deskripsi' => $this->bersihkanHtml($job['description'] ?? ''),
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
        if ($raw === '' || str_contains(strtolower($raw), 'anywhere') || str_contains(strtolower($raw), 'worldwide')) {
            return 'Remote';
        }

        return $raw;
    }

    private function bersihkanHtml(?string $html): string
    {
        $text = trim((string) strip_tags((string) $html));

        return mb_substr($text, 0, 2000);
    }
}
