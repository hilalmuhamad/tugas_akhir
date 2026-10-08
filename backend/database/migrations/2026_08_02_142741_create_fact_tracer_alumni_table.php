<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fact_tracer_alumni', function (Blueprint $table) {
            $table->id('fact_key');

            $table->foreignId('alumni_key')->constrained('dim_alumni', 'alumni_key');
            $table->foreignId('prodi_key')->constrained('dim_program_studi', 'prodi_key');
            $table->foreignId('waktu_key')->constrained('dim_waktu', 'waktu_key');
            $table->foreignId('status_key')->constrained('dim_status_kerja', 'status_key');

            $table->string('pengalaman_kerja', 10); // 'Ya' / 'Tidak' — degenerate dimension

            // measures
            $table->decimal('ipk', 3, 2);
            $table->unsignedSmallInteger('masa_tunggu_bulan')->nullable();
            $table->decimal('gaji_juta', 5, 1)->nullable();

            $table->index('prodi_key');
            $table->index('waktu_key');
            $table->index('status_key');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fact_tracer_alumni');
    }
};