<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lowongan extends Model
{
    protected $connection = 'pgsql_oltp';

    protected $fillable = [
        'judul_posisi', 'perusahaan', 'lokasi',
        'gaji_min', 'gaji_max', 'deskripsi', 'keahlian',
        'sumber_url', 'terverifikasi_pada', 'aktif',
    ];

    protected $casts = [
        'keahlian' => 'array',
        'aktif' => 'boolean',
    ];

    /**
     * Dokumen yang diindeks TF-IDF: gabungan judul, deskripsi, dan keahlian.
     */
    public function dokumen(): string
    {
        return $this->judul_posisi.' '.$this->deskripsi.' '.implode(' ', $this->keahlian ?? []);
    }
}
