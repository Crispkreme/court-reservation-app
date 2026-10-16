<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Waitlist extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'court_id',
        'sport_category_id',
        'booking_id',
        'booking_date',
        'start_time',
        'end_time',
        'duration_minutes',
        'position',
        'status',
        'claim_window_minutes',
        'promoted_at',
        'claim_expires_at',
        'claimed_at',
        'fulfilled_at',
        'cancelled_at',
        'expired_at',
        'cancellation_reason',
        'expiration_reason',
        'session_key',
    ];

    protected $casts = [
        'booking_date' => 'date',
        'promoted_at' => 'datetime',
        'claim_expires_at' => 'datetime',
        'claimed_at' => 'datetime',
        'fulfilled_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'expired_at' => 'datetime',
    ];

    public const STATUS_WAITING = 'waiting';

    public const STATUS_NOTIFIED = 'notified';

    public const STATUS_CLAIMED = 'claimed';

    public const STATUS_FULFILLED = 'fulfilled';

    public const STATUS_EXPIRED = 'expired';

    public const STATUS_CANCELLED = 'cancelled';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function court(): BelongsTo
    {
        return $this->belongsTo(Court::class);
    }

    public function sportCategory(): BelongsTo
    {
        return $this->belongsTo(SportCategory::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function histories(): HasMany
    {
        return $this->hasMany(WaitlistHistory::class);
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', [
            self::STATUS_WAITING,
            self::STATUS_NOTIFIED,
            self::STATUS_CLAIMED,
        ]);
    }

    public function scopeWaiting($query)
    {
        return $query->where('status', self::STATUS_WAITING);
    }

    public function isActive(): bool
    {
        return in_array($this->status, [
            self::STATUS_WAITING,
            self::STATUS_NOTIFIED,
            self::STATUS_CLAIMED,
        ], true);
    }

    public function isClaimExpired(): bool
    {
        return $this->status === self::STATUS_NOTIFIED
            && $this->claim_expires_at
            && now()->greaterThanOrEqualTo($this->claim_expires_at);
    }
}