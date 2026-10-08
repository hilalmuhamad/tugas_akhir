<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SearchLog extends Model
{
    protected $connection = 'pgsql_oltp';

    protected $fillable = [
        'user_id', 'query', 'jumlah_hasil', 'kategori_deteksi',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
