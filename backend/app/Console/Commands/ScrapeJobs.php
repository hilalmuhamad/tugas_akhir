<?php

namespace App\Console\Commands;

use App\Services\Jobs\JobScraperService;
use Illuminate\Console\Command;

class ScrapeJobs extends Command
{
    protected $signature = 'jobs:scrape
        {--source= : Hanya ambil dari sumber tertentu (loker|remotive|jobicy|adzuna)}
        {--limit=50 : Maksimal lowongan per sumber}
        {--rapikan : Nonaktifkan lowongan scraping lama yang bukan IT}';

    protected $description = 'Ambil lowongan kerja IT dari berbagai sumber web ke database';

    public function handle(JobScraperService $scraper): int
    {
        $source = $this->option('source');
        $limit = (int) $this->option('limit');

        $this->info("Mengambil lowongan IT dari web (limit {$limit}/sumber)...");

        $result = $scraper->scrape(
            hanyaSource: $source !== null ? $source : null,
            limitPerSource: max(1, min($limit, 100)),
        );

        $this->line(sprintf(
            'Sumber diambil: %d | Baru: %d | Diperbarui: %d | Gagal: %d | Ditolak (non-IT): %d',
            $result['diambil'],
            $result['tersimpan'],
            $result['diperbarui'],
            $result['gagal'],
            $result['ditolak'] ?? 0
        ));
        $this->info("Total lowongan di database: {$result['total_database']}");

        if ($this->option('rapikan')) {
            $rapi = $scraper->rapikan();
            $this->line(sprintf(
                'Rapikan korpus: diperiksa %d | dinonaktifkan %d (non-IT)',
                $rapi['diperiksa'],
                $rapi['dinonaktifkan']
            ));
        }

        return self::SUCCESS;
    }
}