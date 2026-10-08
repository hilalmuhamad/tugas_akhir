<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AlumniProfile extends Model
{
    protected $connection = 'pgsql_oltp';

    protected $fillable = [
        'user_id',
        'nama',
        'gender',
        'jenjang',
        'program_studi',
        'specialisasi',
        'pengalaman_kerja',
        'tahun_masuk',
        'tahun_lulus',
        'tanggal_lulus',
        'tanggal_mulai_bekerja',
        'ipk',
        'status_bekerja',
        'masa_tunggu_bulan',
        'gaji_juta',
        'jabatan',
        'bidang_pekerjaan',
        'kesesuaian_bidang',
        'tingkat_pendidikan_sesuai',
        'lulus_tepat_waktu',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
