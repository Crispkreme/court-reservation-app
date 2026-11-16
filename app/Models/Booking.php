<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class Booking extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_CONFIRMED,
        self::STATUS_COMPLETED,
        self::STATUS_CANCELLED,
    ];

    protected $fillable = [
        'court_id',
        'user_id',
        'start_at',
        'end_at',
        'duration_minutes',
        'total_price',
        'status',
    ];

    protected $casts = [
        'court_id' => 'integer',
        'user_id' => 'integer',
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'duration_minutes' => 'integer',
        'total_price' => 'decimal:2',
    ];

    public function court(): BelongsTo
    {
        return $this->belongsTo(Court::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeForCourt(
        Builder $query,
        int $courtId
    ): Builder {
        return $query->where('court_id', $courtId);
    }

    public function scopeBetweenDates(
        Builder $query,
        Carbon|string $start,
        Carbon|string $end
    ): Builder {
        $startAt = $start instanceof Carbon ? $start : Carbon::parse($start, Court::TIME_ZONE);
        $endAt = $end instanceof Carbon ? $end : Carbon::parse($end, Court::TIME_ZONE);

        return $query
            ->where('start_at', '<', $endAt->format('Y-m-d H:i:s'))
            ->where('end_at', '>', $startAt->format('Y-m-d H:i:s'));
    }

    public function scopeWithStatus(
        Builder $query,
        string $status
    ): Builder {
        return $query->where('status', $status);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereIn('status', [
            self::STATUS_PENDING,
            self::STATUS_CONFIRMED,
        ]);
    }

    public function scopeForCalendar(
        Builder $query,
        Carbon|string $start,
        Carbon|string $end,
        ?int $courtId = null,
        ?string $status = null
    ): Builder {
        return $query
            ->with(['court', 'user'])
            ->betweenDates($start, $end)
            ->when($courtId !== null,fn (Builder $query) => $query->forCourt($courtId))
            ->when($status !== null && $status !== '',fn (Builder $query) => $query->withStatus($status));
    }

    public function getIsBlockingAttribute(): bool
    {
        return in_array($this->status, [
            self::STATUS_PENDING,
            self::STATUS_CONFIRMED,
        ], true);
    }
}