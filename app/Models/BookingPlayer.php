<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingPlayer extends Model
{
    protected $fillable = [
        'booking_id',
        'player_id',
        'participant_status',
        'invited_at',
        'responded_at',
        'checked_in_at',
        'notes',
    ];

    protected $casts = [
        'invited_at' => 'datetime',
        'responded_at' => 'datetime',
        'checked_in_at' => 'datetime',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }
}