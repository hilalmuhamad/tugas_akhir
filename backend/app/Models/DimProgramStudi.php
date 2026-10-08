<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DimProgramStudi extends Model
{
    public $timestamps = false;

    protected $table = 'dim_program_studi';
    protected $primaryKey = 'prodi_key';

    protected $fillable = ['program_studi', 'specialisasi'];
}