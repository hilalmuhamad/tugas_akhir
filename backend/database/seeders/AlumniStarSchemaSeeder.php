<?php

namespace Database\Seeders;

use App\Services\EtlService;
use Illuminate\Database\Seeder;

class AlumniStarSchemaSeeder extends Seeder
{
    public function run(EtlService $etl): void
    {
        $result = $etl->rebuildStarSchema();

        $this->command->info(
            "fact_tracer_alumni: {$result['fakta']} baris (staging: {$result['staging']}, "
            ."dim_tahun_survei: {$result['tahun_survei']} tahun)."
        );
    }
}
