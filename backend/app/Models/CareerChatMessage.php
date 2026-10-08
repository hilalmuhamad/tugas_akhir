<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CareerChatMessage extends Model
{
    protected $connection = 'pgsql_oltp';

    protected $fillable = [
        'career_analysis_id', 'user_id', 'role', 'content',
    ];

    public function analysis(): BelongsTo
    {
        return $this->belongsTo(CareerAnalysis::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
