<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * Akun adalah data operasional (OLTP), jadi wajib satu basis data dengan
     * alumni_profiles, personal_access_tokens, career_analyses, dan search_logs.
     * Sebelumnya User memakai koneksi default (tugasakhir) sehingga akun baru
     * tidak pernah masuk ke tugasakhir_oltp dan simpan kuesioner gagal karena
     * foreign key user_id tidak menemukan barisnya.
     */
    protected $connection = 'pgsql_oltp';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'avatar_path',
        'last_login_at',
        'email_notifications',
        'system_notifications',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_login_at' => 'datetime',
            'email_notifications' => 'boolean',
            'system_notifications' => 'boolean',
        ];
    }

    public function alumniProfile()
    {
        return $this->hasOne(AlumniProfile::class);
    }
}
