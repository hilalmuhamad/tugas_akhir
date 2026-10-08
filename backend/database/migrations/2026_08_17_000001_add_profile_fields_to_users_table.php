<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 25)->nullable()->after('email');
            $table->string('avatar_path')->nullable()->after('role');
            $table->timestamp('last_login_at')->nullable()->after('remember_token');
            $table->boolean('email_notifications')->default(true)->after('last_login_at');
            $table->boolean('system_notifications')->default(true)->after('email_notifications');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'avatar_path',
                'last_login_at',
                'email_notifications',
                'system_notifications',
            ]);
        });
    }
};
