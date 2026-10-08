<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Detail pekerjaan & keselarasan dipindah ke dimensi alumni supaya tabel
 * Data Alumni (GET /api/alumni) bisa menampilkan jabatan, bidang pekerjaan,
 * kesesuaian bidang, dan tingkat pendidikan sesuai untuk alumni berstatus
 * 'Bekerja' (nullable; kosong untuk 'Tidak Bekerja').
 *
 * kesesuaian_bidang dan tingkat_pendidikan_sesuai hanya bernilai 'Selaras'
 * atau 'Tidak Selaras' — lihat 2026_08_10_000001_add_keselarasan_to_alumni_schema.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dim_alumni', function (Blueprint $table) {
            $table->string('jabatan', 100)->nullable()->after('tahun_masuk');
            $table->string('bidang_pekerjaan', 100)->nullable()->after('jabatan');
            $table->string('kesesuaian_bidang', 20)->nullable()->after('bidang_pekerjaan');
            $table->string('tingkat_pendidikan_sesuai', 20)->nullable()->after('kesesuaian_bidang');
        });
    }

    public function down(): void
    {
        Schema::table('dim_alumni', function (Blueprint $table) {
            $table->dropColumn(['jabatan', 'bidang_pekerjaan', 'kesesuaian_bidang', 'tingkat_pendidikan_sesuai']);
        });
    }
};