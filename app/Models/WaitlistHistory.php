<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WaitlistHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'waitlist_id',
        'user_id',
        'action',
        'from_status',
        'to_status',
        'position',
        'description',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function waitlist(): BelongsTo
    {
        return $this->belongsTo(Waitlist::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}