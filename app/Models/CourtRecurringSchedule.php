<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourtRecurringSchedule extends Model
{
    public const STATUS_OPEN = 'open';
    public const STATUS_CLOSED = 'closed';

    public const STATUSES = [
        self::STATUS_OPEN,
        self::STATUS_CLOSED,
    ];

    protected $fillable = [
        'court_id',
        'day_of_week',
        'opening_time',
        'closing_time',
        'status',
        'effective_from',
        'effective_until',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'court_id' => 'integer',
        'day_of_week' => 'integer',
        'effective_from' => 'date:Y-m-d',
        'effective_until' => 'date:Y-m-d',
        'is_active' => 'boolean',
    ];

    public function court(): BelongsTo
    {
        return $this->belongsTo(Court::class);
    }

    public function scopeForCourt(
        Builder $query,
        int $courtId
    ): Builder {
        return $query->where('court_id', $courtId);
    }

    public function scopeForDay(
        Builder $query,
        int $dayOfWeek
    ): Builder {
        return $query->where('day_of_week', $dayOfWeek);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeEffectiveOn(
        Builder $query,
        Carbon|string $date
    ): Builder {
        $date = Carbon::parse($date, Court::TIME_ZONE)->toDateString();

        return $query
            ->where(function (Builder $query) use ($date) {
                $query
                    ->whereNull('effective_from')
                    ->orWhereDate('effective_from', '<=', $date);
            })
            ->where(function (Builder $query) use ($date) {
                $query
                    ->whereNull('effective_until')
                    ->orWhereDate('effective_until', '>=', $date);
            });
    }

    public function scopeForDate(
        Builder $query,
        Carbon|string $date
    ): Builder {
        $date = Carbon::parse($date, Court::TIME_ZONE);

        return $query
            ->active()
            ->forDay($date->dayOfWeek)
            ->effectiveOn($date);
    }

    public function scopeForCalendar(
        Builder $query,
        Carbon|string $startDate,
        Carbon|string $endDate,
        ?int $courtId = null
    ): Builder {
        $start = Carbon::parse(
            $startDate,
            Court::TIME_ZONE
        )->toDateString();

        $end = Carbon::parse(
            $endDate,
            Court::TIME_ZONE
        )->toDateString();

        return $query
            ->active()
            ->where(function (Builder $query) use ($end) {
                $query
                    ->whereNull('effective_from')
                    ->orWhereDate('effective_from', '<=', $end);
            })
            ->where(function (Builder $query) use ($start) {
                $query
                    ->whereNull('effective_until')
                    ->orWhereDate('effective_until', '>=', $start);
            })
            ->when(
                $courtId !== null,
                fn (Builder $query) => $query->forCourt($courtId)
            )
            ->orderBy('court_id')
            ->orderBy('day_of_week')
            ->orderByDesc('effective_from')
            ->orderByDesc('id');
    }

    public function isOpen(): bool
    {
        return $this->status === self::STATUS_OPEN;
    }

    public function isClosed(): bool
    {
        return $this->status === self::STATUS_CLOSED;
    }

    public function isEffectiveOn(
        Carbon|string $date
    ): bool {
        $date = Carbon::parse($date, Court::TIME_ZONE)
            ->startOfDay();

        if (! $this->is_active) {
            return false;
        }

        if ((int) $this->day_of_week !== $date->dayOfWeek) {
            return false;
        }

        if (
            $this->effective_from &&
            $date->lt($this->effective_from->copy()->startOfDay())
        ) {
            return false;
        }

        if (
            $this->effective_until &&
            $date->gt($this->effective_until->copy()->startOfDay())
        ) {
            return false;
        }

        return true;
    }

    public function getIsCurrentlyEffectiveAttribute(): bool
    {
        return $this->isEffectiveOn(
            Carbon::today(Court::TIME_ZONE)
        );
    }
}
