<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DimAlumni extends Model
{
    public $timestamps = false;

    protected $table = 'dim_alumni';
    protected $primaryKey = 'alumni_key';

    protected $fillable = ['id_sumber', 'nama', 'gender'];

    public function facts()
    {
        return $this->hasMany(FactTracerAlumni::class, 'alumni_key', 'alumni_key');
    }
}