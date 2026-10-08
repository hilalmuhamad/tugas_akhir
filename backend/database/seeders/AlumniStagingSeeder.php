<?php

namespace Database\Seeders;

use App\Services\EtlService;
use Illuminate\Database\Seeder;

class AlumniStagingSeeder extends Seeder
{
    public function run(EtlService $etl): void
    {
        $jumlahProfil = $etl->loadStagingFromCsv();

        $total = \Illuminate\Support\Facades\DB::table('staging_alumni')->count();
        $this->command->info(
            "staging_alumni: {$total} baris (CSV + {$jumlahProfil} dari kuesioner)."
        );
    }
}
