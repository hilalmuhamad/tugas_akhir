<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alumni_profiles', function (Blueprint $table) {
            $table->date('tanggal_lulus')->nullable()->after('tahun_lulus');
            $table->date('tanggal_mulai_bekerja')->nullable()->after('tanggal_lulus');
        });
    }

    public function down(): void
    {
        Schema::table('alumni_profiles', function (Blueprint $table) {
            $table->dropColumn(['tanggal_lulus', 'tanggal_mulai_bekerja']);
        });
    }
};
