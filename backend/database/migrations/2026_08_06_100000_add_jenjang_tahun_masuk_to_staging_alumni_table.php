<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('staging_alumni', function (Blueprint $table) {
            $table->enum('jenjang', ['D3', 'S1'])->nullable()->after('gender');
            $table->unsignedSmallInteger('tahun_masuk')->nullable()->after('jenjang');
        });
    }

    public function down(): void
    {
        Schema::table('staging_alumni', function (Blueprint $table) {
            $table->dropColumn(['jenjang', 'tahun_masuk']);
        });
    }
};
