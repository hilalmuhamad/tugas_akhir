<?php

namespace App\Services\Jobs\Sources;

use Illuminate\Support\Facades\Http;

/**
 * Sumber lowongan Indonesia asli: LokerID (https://www.loker.id).
 *
 * Ambil daftar tautan dari halaman depan, lalu untuk setiap lowongan
 * ambil data terstruktur JSON-LD JobPosting (judul, perusahaan, lokasi,
 * gaji IDR, deskripsi) sehingga link yang tersimpan selalu mengarah ke
 * lowongan asli di situs.
 */
class LokerSource implements JobSource
{
    private const HOME = 'https://www.loker.id/';

    public function name(): string
    {
        return 'loker';
    }

    public function fetch(int $limit): array
    {
        $home = $this->get(self::HOME);
        if ($home === null) {
            return [];
        }

        $links = $this->extractLinks($home);

// halaman kategori (/lowongan-kerja/<slug>) juga memuat daftar
        // lowongan; ambil beberapa untuk memperbanyak tautan
        $kategori = $this->extractKategori($home)
            ->unique()
            ->take(12);

        foreach ($kategori as $url) {
            $html = $this->get($url);
            if ($html !== null) {
                $links = array_merge($links, $this->extractLinks($html));
            }
            usleep(150000);
        }

        $links = collect($links)
            ->filter(fn (string $url) => str_ends_with($url, '.html'))
            ->reject(fn (string $url) => str_contains($url, '/lowongan-kerja/'))
            ->map(fn (string $url) => str_starts_with($url, 'http') ? $url : 'https://www.loker.id'.$url)
            ->unique()
            ->values();

        $hasil = [];
        foreach ($links->take($limit) as $url) {
            $detail = $this->get($url);
            if ($detail === null) {
                continue;
            }

            $job = $this->parseDetail($detail, $url);
            if ($job !== null) {
                $hasil[] = $job;
            }

            // jaga-jaga agar tidak terlalu membebani situs
            usleep(150000);
        }

        return $hasil;
    }

    private function get(string $url): ?string
    {
        try {
            $response = Http::timeout(20)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36'])
                ->get($url);

            return $response->successful() ? $response->body() : null;
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * @return array<int, string>
     */
    private function extractLinks(string $html): array
    {
        preg_match_all('/href="([^"]+\.html)"/', $html, $matches);

        return $matches[1] ?? [];
    }

    /**
     * Kategori berisi slug seperti "/lowongan-kerja/staf-admin" tanpa .html.
     *
     * @return \Illuminate\Support\Collection<int, string>
     */
    private function extractKategori(string $html)
    {
        preg_match_all('/href="(\/lowongan-kerja\/[^"?]+)"/', $html, $matches);

        return collect($matches[1] ?? [])
            ->reject(fn (string $url) => str_ends_with($url, '.html'))
            ->map(fn (string $url) => 'https://www.loker.id'.$url);
    }

    /**
     * Parsing JSON-LD JobPosting menjadi struktur data internal.
     *
     * @return array<string, mixed>|null
     */
    private function parseDetail(string $html, string $url): ?array
    {
        if (! preg_match('/<script type="application\/ld\+json">(.*?)<\/script>/s', $html, $m)) {
            return null;
        }

        $data = json_decode(trim($m[1]), true);
        if (! is_array($data) || ($data['@type'] ?? '') !== 'JobPosting') {
            return null;
        }

        $judul = trim((string) ($data['title'] ?? ''));
        $perusahaan = trim((string) ($data['hiringOrganization']['name'] ?? ''));
        if ($judul === '' || $perusahaan === '') {
            return null;
        }

        $gaji = $data['baseSalary']['value'] ?? [];
        $min = (float) ($gaji['minValue'] ?? 0);
        $max = (float) ($gaji['maxValue'] ?? 0);

        $deskripsi = $this->bersihkanHtml($data['description'] ?? '');
        $keahlian = array_values(array_filter(array_unique(array_merge(
            [$data['occupationalCategory'] ?? ''],
            [$data['educationRequirements'] ?? ''],
            [$data['experienceRequirements'] ?? ''],
        ))));

        return [
            'judul_posisi' => $judul,
            'perusahaan' => $perusahaan,
            'lokasi' => trim((string) ($data['jobLocation']['address']['addressLocality'] ?? '')),
            'gaji_min' => $min > 0 ? round($min / 1_000_000, 1) : null,
            'gaji_max' => $max > 0 ? round($max / 1_000_000, 1) : null,
            'deskripsi' => mb_substr($deskripsi, 0, 2000),
            'keahlian' => array_slice($keahlian, 0, 8),
            'sumber_url' => $url,
        ];
    }

    private function bersihkanHtml(?string $html): string
    {
        return trim((string) strip_tags((string) $html));
    }
}