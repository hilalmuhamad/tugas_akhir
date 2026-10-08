<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * View historis masa tunggu kerja: seluruh fact_tracer_alumni
 * (215 alumni) tanpa filter tahun_survei.
 *
 * Grain: tahun_lulus x program_studi.
 *
 * Semantics:
 * - jumlah_alumni                   = seluruh fact pada kombinasi tahun + prodi
 * - jumlah_alumni_bermasa_tunggu    = COUNT(masa_tunggu_bulan) (non-NULL)
 * - rata_rata_masa_tunggu           = AVG(masa_tunggu_bulan), hanya non-NULL
 * - masa_tunggu_min / masa_tunggu_max = hanya nilai valid (non-NULL)
 *
 * View ini TIDAK menyentuh 9 view OLAP resmi yang sudah ada.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW v_olap_masa_tunggu_histori AS
            SELECT
                dw.tahun_lulus,
                dp.program_studi,
                COUNT(*)::bigint AS jumlah_alumni,
                COUNT(f.masa_tunggu_bulan)::bigint AS jumlah_alumni_bermasa_tunggu,
                ROUND(AVG(f.masa_tunggu_bulan), 2) AS rata_rata_masa_tunggu,
                MIN(f.masa_tunggu_bulan) AS masa_tunggu_min,
                MAX(f.masa_tunggu_bulan) AS masa_tunggu_max
            FROM fact_tracer_alumni f
            JOIN dim_waktu dw ON f.waktu_key = dw.waktu_key
            JOIN dim_program_studi dp ON f.prodi_key = dp.prodi_key
            GROUP BY dw.tahun_lulus, dp.program_studi
            ORDER BY dw.tahun_lulus, dp.program_studi
        SQL);
    }

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS v_olap_masa_tunggu_histori');
    }
};
