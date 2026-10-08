<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Dimensi tahun survei tracer study.
 *
 * Tabel ini sebelumnya hanya ada di PostgreSQL hasil kerja manual di pgAdmin —
 * tidak pernah punya migrasi — padahal EtlService dan OlapController membacanya
 * dan seluruh view OLAP menyaring atasnya. Akibatnya `php artisan migrate:fresh`
 * menghasilkan basis data yang tidak bisa menjalankan dasbor. Migrasi ini
 * menutup celah itu.
 *
 * Grain: satu baris per tahun pelaksanaan survei (TS).
 *
 * Isinya TIDAK di-hardcode di sini. EtlService::syncDimTahunSurvei() mengisinya
 * dari tahun lulus yang benar-benar ada di staging: setiap tahun lulus L
 * memunculkan kandidat survei L+1 (TS-1) dan L+2 (TS-2), disaring >= 2022.
 * Dengan begitu `migrate:fresh --seed` menghasilkan isi yang sama persis.
 *
 * Catatan pemodelan: fact_tracer_alumni sengaja TIDAK menyimpan tahun_survei_key.
 * Satu alumni masuk ke DUA survei (sebagai TS-1 pada survei L+1 dan TS-2 pada
 * survei L+2), jadi tahun survei adalah jendela yang diturunkan dari tahun_lulus
 * saat agregasi, bukan atribut baris fakta. Seluruh view OLAP menurunkannya
 * lewat join ke tabel ini dengan syarat
 *      dim_waktu.tahun_lulus BETWEEN ts.tahun_survei - 2 AND ts.tahun_survei - 1
 * yang persis sama dengan OlapController::kohortWindow().
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dim_tahun_survei', function (Blueprint $table) {
            $table->id('tahun_survei_key');
            $table->unsignedSmallInteger('tahun_survei')->unique();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dim_tahun_survei');
    }
};
