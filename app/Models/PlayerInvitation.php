<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlayerInvitation extends Model
{
    protected $fillable = [
        'booking_id',
        'matchmaking_request_id',
        'invited_by',
        'player_id',
        'name',
        'email',
        'token',
        'status',
        'expires_at',
        'responded_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'responded_at' => 'datetime',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function matchmakingRequest(): BelongsTo
    {
        return $this->belongsTo(
            MatchmakingRequest::class
        );
    }

    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }
}