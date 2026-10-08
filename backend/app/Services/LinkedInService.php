<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * LinkedInScraper — ambil deskripsi publik dari link LinkedIn untuk dianalisis LLM.
 * Catatan: LinkedIn membatasi scraping; service ini best-effort.
 * Jika gagal (login wall / 403), kembalikan null dan controller fallback ke profile_text paste.
 */
class LinkedInService
{
    /**
     * Coba ambil teks deskripsi dari URL LinkedIn.
     * @return string|null teks bersih atau null jika gagal
     */
    public function scrape(?string $url): ?string
    {
        $url = trim((string) $url);
        if ($url !== '' && !preg_match('#^https?://#i', $url)) {
            $url = 'https://'.$url;
        }
        if ($url === '' || !filter_var($url, FILTER_VALIDATE_URL)) return null;
        if (!str_contains(strtolower($url), 'linkedin.com')) return null;

        try {
            $res = Http::timeout(12)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language' => 'en-US,en;q=0.9,id;q=0.8',
                ])->get($url);

            if (!$res->successful()) {
                Log::info('LinkedIn scrape failed status', ['url' => $url, 'status' => $res->status()]);
                return null;
            }

            $html = $res->body();
            // Hapus script/style
            $html = preg_replace('#<script.*?>.*?</script>#is', ' ', $html);
            $html = preg_replace('#<style.*?>.*?</style>#is', ' ', $html);
            // Ambil meta description & og:description sebagai prioritas
            $desc = '';
            if (preg_match('/<meta[^>]+property=["\']og:description["\'][^>]+content=["\']([^"\']+)["\']/i', $html, $m)) {
                $desc .= ' ' . html_entity_decode($m[1]);
            }
            if (preg_match('/<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)["\']/i', $html, $m)) {
                $desc .= ' ' . html_entity_decode($m[1]);
            }
            // Fallback: strip tags
            $text = trim(strip_tags($html));
            $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5);
            $text = preg_replace('/\s+/u', ' ', $text);
            $text = trim($desc . ' ' . $text);
            // Batasi 6000 char
            if (mb_strlen($text) > 6000) $text = mb_substr($text, 0, 6000);

            // Minimal 80 char bermakna, jika kurang anggap gagal (login wall)
            if (mb_strlen(trim($text)) < 80) return null;
            // Deteksi halaman login LinkedIn
            if (str_contains(strtolower($text), 'join now') && str_contains(strtolower($text), 'sign in') && mb_strlen($text) < 500) {
                return null;
            }

            return $text;
        } catch (\Throwable $e) {
            Log::info('LinkedIn scrape exception', ['url' => $url, 'err' => $e->getMessage()]);
            return null;
        }
    }
}
