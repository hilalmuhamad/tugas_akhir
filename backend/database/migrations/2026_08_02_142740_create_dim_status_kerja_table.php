<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/*
 * Dimensi status kerja — hanya dua nilai (revisi pascasidang 2026-08-27).
 *
 * Sebelumnya kuesioner memakai lima pilihan ("Bekerja", "Wirausaha/Startup",
 * "Melanjutkan Studi", "Belum Memungkinkan Bekerja", "Tidak Bekerja tetapi
 * Sedang Mencari Kerja"). Dasbor hanya pernah membedakan berpenghasilan vs
 * tidak, sehingga kelima nilai itu diringkas menjadi dua:
 *
 *      Bekerja        <- Bekerja, Wirausaha/Startup
 *      Tidak Bekerja  <- Melanjutkan Studi, Belum Memungkinkan Bekerja,
 *                        Tidak Bekerja tetapi Sedang Mencari Kerja
 *
 * Peringatan untuk penulisan laporan: karena "Melanjutkan Studi" kini masuk
 * "Tidak Bekerja", persentase Bekerja di dasbor BUKAN IKU-1. IKU-1 menghitung
 * lulusan yang bekerja, berwiraswasta, ATAU melanjutkan studi. Sebut angka ini
 * sebagai "persentase alumni bekerja", jangan sebagai capaian IKU-1.
 *
 * Kunci dibekukan di migrasi supaya stabil di seluruh lingkungan:
 *      1 = Bekerja        (Berpenghasilan)
 *      2 = Tidak Bekerja  (Tidak Berpenghasilan)
 */
return new class extends Migration
{
    public const BARIS = [
        ['status_bekerja' => 'Bekerja',       'kategori_penghasilan' => 'Berpenghasilan'],
        ['status_bekerja' => 'Tidak Bekerja', 'kategori_penghasilan' => 'Tidak Berpenghasilan'],
    ];

    public function up(): void
    {
        Schema::create('dim_status_kerja', function (Blueprint $table) {
            $table->id('status_key');
            $table->string('status_bekerja', 20)->unique();
            $table->string('kategori_penghasilan', 20); // 'Berpenghasilan' / 'Tidak Berpenghasilan'
        });

        DB::table('dim_status_kerja')->insert(self::BARIS);
    }

    public function down(): void
    {
        Schema::dropIfExists('dim_status_kerja');
    }
};
