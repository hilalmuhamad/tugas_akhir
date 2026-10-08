<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CareerAnalysis extends Model
{
    protected $connection = 'pgsql_oltp';

    protected $fillable = [
        'user_id', 'linkedin_url', 'profile_text', 'analysis',
    ];

    protected $casts = [
        'analysis' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(CareerChatMessage::class);
    }
}
