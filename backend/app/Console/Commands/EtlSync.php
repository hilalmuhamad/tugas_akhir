<?php

namespace App\Console\Commands;

use App\Services\EtlService;
use Illuminate\Console\Command;

class EtlSync extends Command
{
    protected $signature = 'etl:sync';

    protected $description = 'Jalankan ETL penuh: staging (CSV + kuesioner) lalu rebuild skema bintang';

    public function handle(EtlService $etl): int
    {
        $this->info('1/2  Memuat ulang staging layer (CSV + profil kuesioner)...');
        $profilDiStaging = $etl->loadStagingFromCsv();

        $this->line("     Baris kuesioner di staging: {$profilDiStaging}");

        $this->info('2/2  Rebuild skema bintang dari staging...');
        $result = $etl->rebuildStarSchema();

        $this->line(sprintf(
            '     staging: %d baris | fact_tracer_alumni: %d baris | dim_tahun_survei: %d tahun',
            $result['staging'],
            $result['fakta'],
            $result['tahun_survei']
        ));
        $this->info('ETL selesai.');

        return self::SUCCESS;
    }
}
