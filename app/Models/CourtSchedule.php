<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourtSchedule extends Model
{
    public const STATUS_OPEN = 'open';
    public const STATUS_CLOSED = 'closed';

    public const STATUSES = [
        self::STATUS_OPEN,
        self::STATUS_CLOSED,
    ];

    protected $fillable = [
        'court_id',
        'date',
        'opening_time',
        'closing_time',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'court_id' => 'integer',
            'date' => 'date:Y-m-d',
        ];
    }

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

    public function scopeForDate(
        Builder $query,
        string $date
    ): Builder {
        return $query->whereDate('date', $date);
    }

    public function scopeBetweenDates(
        Builder $query,
        Carbon|string $startDate,
        Carbon|string $endDate
    ): Builder {
        return $query->whereBetween('date', [
            Carbon::parse($startDate)->toDateString(),
            Carbon::parse($endDate)->toDateString(),
        ]);
    }

    public function scopeOpen(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_OPEN);
    }

    public function scopeClosed(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_CLOSED);
    }

    public function scopeForCalendar(
        Builder $query,
        Carbon|string $startDate,
        Carbon|string $endDate,
        ?int $courtId = null,
        ?string $status = null
    ): Builder {
        return $query
            ->with('court')
            ->betweenDates($startDate, $endDate)
            ->when(
                $courtId !== null,
                fn (Builder $query) => $query->forCourt($courtId)
            )
            ->when(
                $status !== null,
                fn (Builder $query) => $query->where('status', $status)
            )
            ->orderBy('date')
            ->orderBy('court_id');
    }

    public function isOpen(): bool
    {
        return $this->status === self::STATUS_OPEN;
    }

    public function isClosed(): bool
    {
        return $this->status === self::STATUS_CLOSED;
    }

    public function getIsSpecialHoursAttribute(): bool
    {
        if (! $this->isOpen()) {
            return false;
        }

        if (! $this->opening_time || ! $this->closing_time) {
            return false;
        }

        return true;
    }
}