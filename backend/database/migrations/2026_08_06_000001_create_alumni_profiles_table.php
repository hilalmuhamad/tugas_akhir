<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alumni_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('nama', 100);
            $table->char('gender', 1);
            $table->enum('jenjang', ['D3', 'S1']);
            $table->string('program_studi', 50);
            $table->string('specialisasi', 50);
            $table->string('pengalaman_kerja', 10);
            $table->unsignedSmallInteger('tahun_masuk');
            $table->unsignedSmallInteger('tahun_lulus');
            $table->decimal('ipk', 3, 2);
            $table->string('status_bekerja', 60);
            $table->unsignedSmallInteger('masa_tunggu_bulan')->nullable();
            $table->decimal('gaji_juta', 5, 1)->nullable();
            $table->boolean('lulus_tepat_waktu');
            $table->timestamps();

            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alumni_profiles');
    }
};