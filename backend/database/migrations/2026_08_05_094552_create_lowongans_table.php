<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lowongans', function (Blueprint $table) {
            $table->id();
            $table->string('judul_posisi');
            $table->string('perusahaan');
            $table->string('lokasi');
            $table->unsignedTinyInteger('gaji_min')->nullable();
            $table->unsignedTinyInteger('gaji_max')->nullable();
            $table->text('deskripsi');
            $table->json('keahlian');
            $table->string('sumber_url')->nullable();
            $table->timestamp('terverifikasi_pada')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lowongans');
    }
};