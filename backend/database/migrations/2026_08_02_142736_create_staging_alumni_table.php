<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staging_alumni', function (Blueprint $table) {
            $table->unsignedInteger('id')->primary();
            $table->string('nama', 100);
            $table->char('gender', 1);
            $table->string('program_studi', 30);
            $table->string('specialisasi', 20);
            $table->string('pengalaman_kerja', 10);
            $table->unsignedSmallInteger('tahun_lulus');
            $table->decimal('ipk', 3, 2);
            $table->string('status_bekerja', 60);
            $table->unsignedSmallInteger('masa_tunggu_bulan')->nullable();
            $table->decimal('gaji_juta', 5, 1)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staging_alumni');
    }
};