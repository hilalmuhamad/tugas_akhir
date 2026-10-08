<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Fix audit 2026-08-28: staging_alumni kekurangan kolom OLTP hasil revisi ETL.
 * Sinkronisasi gagal: SQLSTATE[42703] column "masa_tunggu_bulan" does not exist.
 * AlumniProfiles juga kekurangan tingkat_pendidikan_sesuai & lulus_tepat_waktu.
 * Ditambahkan IF NOT EXISTS agar aman di DB lama.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('staging_alumni', function (Blueprint $table) {
            if (!Schema::hasColumn('staging_alumni', 'masa_tunggu_bulan')) {
                $table->smallInteger('masa_tunggu_bulan')->nullable()->after('status_bekerja');
            }
            if (!Schema::hasColumn('staging_alumni', 'kesesuaian_bidang')) {
                $table->string('kesesuaian_bidang', 50)->nullable()->after('bidang_pekerjaan');
            }
            if (!Schema::hasColumn('staging_alumni', 'tingkat_pendidikan_sesuai')) {
                $table->string('tingkat_pendidikan_sesuai', 50)->nullable()->after('kesesuaian_bidang');
            }
            if (!Schema::hasColumn('staging_alumni', 'lulus_tepat_waktu')) {
                $table->boolean('lulus_tepat_waktu')->nullable()->after('tingkat_pendidikan_sesuai');
            }
        });

        Schema::table('alumni_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('alumni_profiles', 'tingkat_pendidikan_sesuai')) {
                $table->string('tingkat_pendidikan_sesuai', 50)->nullable()->after('kesesuaian_bidang');
            }
            if (!Schema::hasColumn('alumni_profiles', 'lulus_tepat_waktu')) {
                $table->boolean('lulus_tepat_waktu')->nullable()->after('tingkat_pendidikan_sesuai');
            }
        });
    }

    public function down(): void
    {
        Schema::table('staging_alumni', function (Blueprint $table) {
            $table->dropColumn(['masa_tunggu_bulan', 'kesesuaian_bidang', 'tingkat_pendidikan_sesuai', 'lulus_tepat_waktu']);
        });
        Schema::table('alumni_profiles', function (Blueprint $table) {
            $table->dropColumn(['tingkat_pendidikan_sesuai', 'lulus_tepat_waktu']);
        });
    }
};
