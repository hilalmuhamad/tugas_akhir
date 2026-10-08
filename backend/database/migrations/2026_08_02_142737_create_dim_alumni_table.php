<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dim_alumni', function (Blueprint $table) {
            $table->id('alumni_key');
            $table->unsignedInteger('id_sumber')->unique(); // id asli dari staging/CSV
            $table->string('nama', 100);
            $table->char('gender', 1);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dim_alumni');
    }
};