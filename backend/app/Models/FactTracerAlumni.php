<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FactTracerAlumni extends Model
{
    public $timestamps = false;

    protected $table = 'fact_tracer_alumni';
    protected $primaryKey = 'fact_key';

    protected $fillable = [
        'alumni_key', 'prodi_key', 'waktu_key', 'status_key',
        'pengalaman_kerja', 'ipk', 'masa_tunggu_bulan', 'gaji_juta',
    ];

    public function alumni()
    {
        return $this->belongsTo(DimAlumni::class, 'alumni_key', 'alumni_key');
    }

    public function programStudi()
    {
        return $this->belongsTo(DimProgramStudi::class, 'prodi_key', 'prodi_key');
    }

    public function waktu()
    {
        return $this->belongsTo(DimWaktu::class, 'waktu_key', 'waktu_key');
    }

    public function statusKerja()
    {
        return $this->belongsTo(DimStatusKerja::class, 'status_key', 'status_key');
    }
}