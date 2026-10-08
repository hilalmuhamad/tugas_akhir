<?php

namespace App\Services\Jobs;

/**
 * Filter relevansi IT — memastikan korpus lowongan hanya berisi
 * pekerjaan teknologi (fokus: software/frontend/backend/mobile/data).
 *
 * Dipakai terpusat di JobScraperService + tiap source sebagai pengaman,
 * agar hasil scraping "baik dan benar" dan pencocokan TF-IDF tidak
 * terkontaminasi lowongan non-IT (driver, sales, notaris, dsb).
 */
class ItKeywordFilter
{
    /**
     * Token kuat: jika muncul di JUDUL, langsung dianggap lowongan IT.
     * Catatan: 'engineer'/'designer' polos sengaja TIDAK masuk agar
     * 'Sales Engineer' / 'Marketing Designer' tidak lolos.
     */
    private const STRONG_TITLE_TOKENS = [
        'developer', 'programmer', 'software', 'backend', 'frontend',
        'fullstack', 'full-stack', 'mobile', 'android', 'flutter',
        'react', 'vue', 'angular', 'laravel', 'devops', 'sre',
        'qa engineer', 'tester', 'data analyst', 'data scientist',
        'data engineer', 'machine learning', 'web developer',
        'it support', 'network engineer', 'platform engineer',
        'site reliability', 'ui/ux', 'wordpress', 'php', 'python',
        'javascript', 'typescript', 'node', 'golang', 'ios',
        'kotlin', 'dart', 'api engineer', 'integration engineer',
        'ai engineer', 'administrator', 'systems administrator',
        'system administrator',
    ];

    /**
     * Kata peran non-IT: jika muncul di JUDUL, langsung ditolak walau
     * tag-nya mengandung kata teknologi ("review aplikasi Android/iOS",
     * "mobile marketing", dsb). Dicek SEBELUM allowlist.
     */
    private const DENY_TITLE_TOKENS = [
        'marketing', 'sales', 'writer', 'copywriter', 'reviewer',
        'assistant', 'driver', 'notaris', 'legal', 'hospitality',
        'neurologist', 'medical', 'nurse', 'teacher', 'general manager',
        'accounting', 'accountant', 'host live', 'sosmed',
    ];

    /** Token skill/teknologi untuk penilaian gabungan. */
    private const SKILL_TOKENS = [
        'react', 'vue', 'angular', 'laravel', 'php', 'python', 'java',
        'javascript', 'typescript', 'node', 'golang', 'kotlin', 'dart',
        'flutter', 'mysql', 'postgresql', 'database', 'docker',
        'kubernetes', 'aws', 'git', 'api', 'backend', 'frontend',
        'mobile', 'android', 'ios', 'devops', 'qa', 'figma',
        'tailwind', 'nextjs', 'rest', 'graphql', 'linux',
    ];

    /**
     * Hanya sinyal dari JUDUL + TAG keahlian yang dihitung — deskripsi
     * sengaja diabaikan karena kata teknologi sering disebut insidental
     * di lowongan non-IT ("mobile-friendly content", "review aplikasi
     * Android/iOS", "update frontend website" untuk admin sosmed, dsb).
     * Deskripsi tetap disimpan dan dipakai TF-IDF untuk perangkingan.
     *
     * @param array{judul_posisi:string, deskripsi:string, keahlian:array} $job
     */
    public static function isItJob(array $job): bool
    {
        $judul = mb_strtolower((string) ($job['judul_posisi'] ?? ''));
        foreach (self::DENY_TITLE_TOKENS as $token) {
            if (str_contains($judul, $token)) {
                return false;
            }
        }
        foreach (self::STRONG_TITLE_TOKENS as $token) {
            if (str_contains($judul, $token)) {
                return true;
            }
        }

        $gabungan = mb_strtolower(
            ($job['judul_posisi'] ?? '').' '.
            implode(' ', (array) ($job['keahlian'] ?? []))
        );
        $cocok = 0;
        foreach (self::SKILL_TOKENS as $token) {
            // Token pendek (<=4 huruf: git, api, qa, aws, php, java, node, data)
            // wajib cocok utuh (word boundary) agar 'git' tidak cocok
            // dengan 'digital', 'api' dengan 'therapy/rapid', dst.
            $ketemu = mb_strlen($token) <= 4
                ? (bool) preg_match('/\b'.preg_quote($token, '/').'\b/u', $gabungan)
                : str_contains($gabungan, $token);
            if ($ketemu) {
                $cocok++;
                if ($cocok >= 2) {
                    return true;
                }
            }
        }

        return false;
    }
}
