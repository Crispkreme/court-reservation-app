<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MatchmakingRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'requested_by',
        'sport_category_id',
        'preferred_date',
        'preferred_start_time',
        'preferred_end_time',
        'required_players',
        'skill_level',
        'location',
        'availability',
        'status',
        'notes',
        'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'preferred_date' => 'date',
            'availability' => 'array',
            'closed_at' => 'datetime',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'requested_by'
        );
    }

    public function sportCategory(): BelongsTo
    {
        return $this->belongsTo(
            SportCategory::class
        );
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(
            PlayerInvitation::class
        );
    }

    public function isOpen(): bool
    {
        return $this->status === 'OPEN';
    }
}