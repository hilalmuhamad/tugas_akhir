<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('raw_placement', function (Blueprint $table) {

            // Technical key untuk database
            $table->bigIncrements('raw_id');

            // Kolom asli dari dataset Kaggle
            $table->integer('sl_no');

            $table->string('gender', 10);

            $table->decimal('ssc_p', 5, 2);
            $table->string('ssc_b', 50);

            $table->decimal('hsc_p', 5, 2);
            $table->string('hsc_b', 50);
            $table->string('hsc_s', 50);

            $table->decimal('degree_p', 5, 2);
            $table->string('degree_t', 50);

            $table->string('workex', 20);

            $table->decimal('etest_p', 5, 2);

            $table->string('specialisation', 100);

            $table->decimal('mba_p', 5, 2);

            $table->string('status', 50);

            $table->decimal('salary', 12, 2)->nullable();

            // Metadata loading
            $table->timestamp('loaded_at')->useCurrent();

            // Index untuk ID sumber
            $table->index('sl_no');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('raw_placement');
    }
};