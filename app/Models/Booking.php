<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'sport_category_id',
        'court_id',
        'booking_reference',
        'booking_date',
        'start_time',
        'end_time',
        'duration_minutes',
        'players_count',
        'unit_price',
        'total_amount',
        'booking_source',
        'status',
        'membership_type',
        'membership_required',
        'customer_name',
        'customer_email',
        'customer_phone',
        'notes',
        'confirmed_at',
        'cancelled_at',
        'cancellation_reason',
    ];

    protected function casts(): array
    {
        return [
            'booking_date' => 'date',
            'membership_required' => 'boolean',
            'confirmed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'unit_price' => 'decimal:2',
            'total_amount' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sportCategory(): BelongsTo
    {
        return $this->belongsTo(SportCategory::class);
    }

    public function court(): BelongsTo
    {
        return $this->belongsTo(Court::class);
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', [
            'PENDING',
            'CONFIRMED',
            'CHECKED_IN',
            'IN_PROGRESS',
        ]);
    }

    public function scopeForDate($query, $date)
    {
        return $query->whereDate('booking_date', $date);
    }

    public function holds(): HasMany
    {
        return $this->hasMany(BookingHold::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(BookingStatusHistory::class)
            ->orderBy('changed_at');
    }

    public function cancellation(): HasOne
    {
        return $this->hasOne(
            BookingCancellation::class
        );
    }

    public function reschedules(): HasMany
    {
        return $this->hasMany(BookingReschedule::class);
    }

    public function bookingPlayers(): HasMany
    {
        return $this->hasMany(BookingPlayer::class);
    }

    public function players(): BelongsToMany
    {
        return $this->belongsToMany(
            Player::class,
            'booking_players'
        )->withPivot([
            'participant_status',
            'invited_at',
            'responded_at',
            'checked_in_at',
            'notes',
        ])->withTimestamps();
    }

    public function matchmakingRequests(): HasMany
    {
        return $this->hasMany(
            MatchmakingRequest::class
        );
    }

    public function playerInvitations(): HasMany
    {
        return $this->hasMany(PlayerInvitation::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}   