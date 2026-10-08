<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FactTracer extends Model
{
    protected $fillable = [
        'alumni_profile_id',
        'dim_prodi_id',
        'dim_waktu_id',
        'work_status',
        'salary_range',
        'waiting_time_months',
        'job_suitability',
    ];

    public function alumniProfile(): BelongsTo
    {
        return $this->belongsTo(AlumniProfile::class);
    }

    public function dimProdi(): BelongsTo
    {
        return $this->belongsTo(DimProdi::class);
    }

    public function dimWaktu(): BelongsTo
    {
        return $this->belongsTo(DimWaktu::class);
    }
}
