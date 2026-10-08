<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dim_alumni', function (Blueprint $table) {
            $table->string('jenjang', 5)->nullable()->after('gender');
            $table->unsignedSmallInteger('tahun_masuk')->nullable()->after('jenjang');
        });

        // Backfill dari staging (sumber tunggal tahun masuk & jenjang).
        // Sintaks portabel (MySQL & PostgreSQL): UPDATE ... JOIN khas MySQL
        // diganti subquery berkorelasi.
        DB::statement(
            "UPDATE dim_alumni da
             SET jenjang = (
                    SELECT s.jenjang FROM staging_alumni s WHERE s.id = da.id_sumber
                 ),
                 tahun_masuk = (
                    SELECT s.tahun_masuk FROM staging_alumni s WHERE s.id = da.id_sumber
                 )
             WHERE EXISTS (SELECT 1 FROM staging_alumni s WHERE s.id = da.id_sumber)"
        );
    }

    public function down(): void
    {
        Schema::table('dim_alumni', function (Blueprint $table) {
            $table->dropColumn(['jenjang', 'tahun_masuk']);
        });
    }
};
