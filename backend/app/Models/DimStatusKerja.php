<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DimStatusKerja extends Model
{
    public $timestamps = false;

    protected $table = 'dim_status_kerja';
    protected $primaryKey = 'status_key';

    protected $fillable = ['status_bekerja', 'kategori_penghasilan'];
}