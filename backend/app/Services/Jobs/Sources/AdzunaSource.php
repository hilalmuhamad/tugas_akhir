<?php

namespace App\Services\Jobs\Sources;

use Illuminate\Support\Facades\Http;

/**
 * Sumber opsional (butuh API key gratis): Adzuna.
 * Daftar di https://developer.adzuna.com lalu isi ADZUNA_APP_ID & ADZUNA_APP_KEY.
 * Kode negara 'id' = Indonesia.
 */
class AdzunaSource implements JobSource
{
    public function name(): string
    {
        return 'adzuna';
    }

    public function isEnabled(): bool
    {
        return (bool) config('services.adzuna.app_id') && (bool) config('services.adzuna.app_key');
    }

    public function fetch(int $limit): array
    {
        if (! $this->isEnabled()) {
            return [];
        }

        $country = config('services.adzuna.country', 'id');
        $appId = config('services.adzuna.app_id');
        $appKey = config('services.adzuna.app_key');

        $response = Http::timeout(30)
            ->get("https://api.adzuna.com/v1/api/jobs/{$country}/search/1", [
                'app_id' => $appId,
                'app_key' => $appKey,
                'results_per_page' => min($limit, 50),
                'content-type' => 'application/json',
            ]);

        if ($response->failed()) {
            return [];
        }

        $currency = $response->json('location.area') ? 'IDR' : $response->json('__CONFIG.currency') ?? 'IDR';

        return collect($response->json('results') ?? [])
            ->map(function (array $job) use ($currency) {
                $lokasi = collect($job['location']['area'] ?? [])->merge([$job['location']['display_name'] ?? null])
                    ->filter()
                    ->unique()
                    ->implode(', ');

                $keahlian = isset($job['category']['tag'])
                    ? [$job['category']['label'], $job['category']['tag']]
                    : [$job['category']['label'] ?? ''];

                return [
                    'judul_posisi' => $job['title'] ?? '',
                    'perusahaan' => $job['company']['display_name'] ?? '',
                    'lokasi' => $lokasi ?: $job['location']['display_name'] ?? 'Indonesia',
                    'gaji_min' => isset($job['salary_min']) ? (int) round((float) $job['salary_min'] / 1_000_000) : null,
                    'gaji_max' => isset($job['salary_max']) ? (int) round((float) $job['salary_max'] / 1_000_000) : null,
                    'deskripsi' => trim((string) strip_tags((string) ($job['description'] ?? ''))),
                    'keahlian' => array_values(array_filter($keahlian)),
                    'sumber_url' => $job['redirect_url'] ?? null,
                ];
            })
            ->filter(fn (array $job) => $job['judul_posisi'] !== '' && $job['perusahaan'] !== '')
            ->values()
            ->all();
    }
}