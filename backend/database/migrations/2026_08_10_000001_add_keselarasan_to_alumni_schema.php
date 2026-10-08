<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/*
 * Indikator keselarasan kerja alumni (revisi pascasidang 2026-08-27).
 *
 * Penguji meminta kategori keselarasan cukup dua nilai saja — "Selaras" dan
 * "Tidak Selaras" — mengikuti istilah Kemendikti. Karena itu skala ordinal
 * lima tingkat ("Sangat erat" s.d. "Tidak sama sekali") dan empat tingkat
 * ("Setingkat lebih tinggi" s.d. "Tidak perlu pendidikan tinggi") DIHAPUS dari
 * sistem; kuesioner menanyakan langsung dua pilihan.
 *
 *  - alumni_profiles & staging_alumni : 4 kolom dari kuesioner/CSV.
 *      jabatan, bidang_pekerjaan       -> teks bebas / daftar bidang
 *      kesesuaian_bidang               -> 'Selaras' | 'Tidak Selaras'  (horizontal)
 *      tingkat_pendidikan_sesuai       -> 'Selaras' | 'Tidak Selaras'  (vertikal)
 *  - dim_keselarasan : dimensi konformasi 4 baris = 2 kategori horizontal
 *      x 2 kategori vertikal. Tidak ada lagi kolom jawaban ordinal.
 *  - fact_tracer_alumni : keselarasan_key FK nullable (hanya terisi untuk
 *      alumni berstatus 'Bekerja').
 *
 * Urutan kunci dijaga tetap supaya grafik dan naskah bisa merujuk angka
 * yang sama:
 *      1 = Selaras       / Selaras
 *      2 = Selaras       / Tidak Selaras
 *      3 = Tidak Selaras / Selaras
 *      4 = Tidak Selaras / Tidak Selaras
 */
return new class extends Migration
{
    /** Dua kategori keselarasan — satu-satunya nilai yang dikenal sistem. */
    public const KATEGORI = ['Selaras', 'Tidak Selaras'];

    public function up(): void
    {
        Schema::table('staging_alumni', function (Blueprint $table) {
            $table->string('jabatan', 100)->nullable()->after('tahun_lulus');
            $table->string('bidang_pekerjaan', 100)->nullable()->after('jabatan');
            $table->string('kesesuaian_bidang', 20)->nullable()->after('bidang_pekerjaan');
            $table->string('tingkat_pendidikan_sesuai', 20)->nullable()->after('kesesuaian_bidang');
        });

        Schema::table('alumni_profiles', function (Blueprint $table) {
            $table->string('jabatan', 100)->nullable()->after('status_bekerja');
            $table->string('bidang_pekerjaan', 100)->nullable()->after('jabatan');
            $table->string('kesesuaian_bidang', 20)->nullable()->after('bidang_pekerjaan');
            $table->string('tingkat_pendidikan_sesuai', 20)->nullable()->after('kesesuaian_bidang');
        });

        Schema::create('dim_keselarasan', function (Blueprint $table) {
            $table->id('keselarasan_key');
            $table->string('kategori_horizontal', 20);
            $table->string('kategori_vertikal', 20);
            $table->unique(['kategori_horizontal', 'kategori_vertikal']);
        });

        Schema::table('fact_tracer_alumni', function (Blueprint $table) {
            $table->foreignId('keselarasan_key')
                ->nullable()
                ->after('status_key')
                ->constrained('dim_keselarasan', 'keselarasan_key');
            $table->index('keselarasan_key');
        });

        $rows = [];
        foreach (self::KATEGORI as $horizontal) {
            foreach (self::KATEGORI as $vertikal) {
                $rows[] = [
                    'kategori_horizontal' => $horizontal,
                    'kategori_vertikal'   => $vertikal,
                ];
            }
        }

        DB::table('dim_keselarasan')->insert($rows);
    }

    public function down(): void
    {
        Schema::table('fact_tracer_alumni', function (Blueprint $table) {
            $table->dropConstrainedForeignId('keselarasan_key');
        });

        Schema::dropIfExists('dim_keselarasan');

        Schema::table('alumni_profiles', function (Blueprint $table) {
            $table->dropColumn(['jabatan', 'bidang_pekerjaan', 'kesesuaian_bidang', 'tingkat_pendidikan_sesuai']);
        });

        Schema::table('staging_alumni', function (Blueprint $table) {
            $table->dropColumn(['jabatan', 'bidang_pekerjaan', 'kesesuaian_bidang', 'tingkat_pendidikan_sesuai']);
        });
    }
};
