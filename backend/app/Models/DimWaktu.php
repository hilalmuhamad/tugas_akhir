<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DimWaktu extends Model
{
    public $timestamps = false;

    protected $table = 'dim_waktu';
    protected $primaryKey = 'waktu_key';

    protected $fillable = ['tahun_lulus', 'dekade'];
}