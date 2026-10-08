<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dim_program_studi', function (Blueprint $table) {
            $table->id('prodi_key');
            $table->string('program_studi', 30);
            $table->string('specialisasi', 20);
            $table->unique(['program_studi', 'specialisasi']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dim_program_studi');
    }
};