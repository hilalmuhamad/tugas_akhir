<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dim_waktu', function (Blueprint $table) {
            $table->id('waktu_key');
            $table->unsignedSmallInteger('tahun_lulus')->unique();
            $table->string('dekade', 10)->nullable(); // diisi via seeder, mis. "2020s"
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dim_waktu');
    }
};