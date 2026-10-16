<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingHold extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE = 'ACTIVE';

    public const STATUS_CONVERTED = 'CONVERTED';

    public const STATUS_EXPIRED = 'EXPIRED';

    public const STATUS_FAILED = 'FAILED';

    public const DEFAULT_HOLD_DURATION = 10;

    protected $fillable = [
        'user_id',
        'sport_category_id',
        'court_id',
        'booking_id',
        'hold_token',
        'active_slot_key',
        'booking_date',
        'start_time',
        'end_time',
        'duration_minutes',
        'players_count',
        'status',
        'hold_duration_minutes',
        'held_at',
        'expires_at',
        'payment_reference',
        'failure_reason',
        'failed_at',
        'expired_at',
        'converted_at',
        'customer_name',
        'customer_email',
        'customer_phone',
        'notes',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'booking_date' => 'date',
            'held_at' => 'datetime',
            'expires_at' => 'datetime',
            'failed_at' => 'datetime',
            'expired_at' => 'datetime',
            'converted_at' => 'datetime',
            'metadata' => 'array',
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

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE)
            ->where('expires_at', '>', now());
    }

    public function scopeExpired($query)
    {
        return $query->where('status', self::STATUS_ACTIVE)
            ->where('expires_at', '<=', now());
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE
            && $this->expires_at
            && $this->expires_at->isFuture();
    }

    public function isExpired(): bool
    {
        return $this->status === self::STATUS_EXPIRED
            || (
                $this->status === self::STATUS_ACTIVE
                && $this->expires_at
                && $this->expires_at->isPast()
            );
    }

    public function remainingSeconds(): int
    {
        if (!$this->isActive()) {
            return 0;
        }

        return max(
            0,
            now()->diffInSeconds($this->expires_at, false)
        );
    }
}