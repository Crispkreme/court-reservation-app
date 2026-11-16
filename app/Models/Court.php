<?php

namespace App\Models;

use Carbon\Carbon;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use InvalidArgumentException;

class Court extends Model
{
    public const STATUS_AVAILABLE = 'available';
    public const STATUS_MAINTENANCE = 'maintenance';
    public const STATUS_CLOSED = 'closed';
    public const STATUS_TEMPORARILY_BLOCKED = 'temporarily_blocked';

    public const STATUSES = [
        self::STATUS_AVAILABLE,
        self::STATUS_MAINTENANCE,
        self::STATUS_CLOSED,
        self::STATUS_TEMPORARILY_BLOCKED,
    ];

    public const OPERATING_OPEN = 'open';
    public const OPERATING_CLOSED = 'closed';
    public const OPERATING_UNAVAILABLE = 'unavailable';
    public const OPERATING_UNKNOWN = 'unknown';
    public const TIME_ZONE = 'Asia/Dubai';

    public const BOOKING_INTERVALS = [
        15,
        30,
        60,
    ];

    public const DEFAULT_BOOKING_INTERVAL = 30;
    public const DEFAULT_MIN_BOOKING = 60;
    public const DEFAULT_MAX_BOOKING = 180;

    protected $fillable = [
        'sport_category_id',
        'name',
        'description',
        'location',
        'court_type',
        'min_players',
        'max_players',
        'price_per_hour',
        'opening_time',
        'closing_time',
        'booking_interval_minutes',
        'min_booking_minutes',
        'max_booking_minutes',
        'status',
    ];

    protected $attributes = [
        'status' => self::STATUS_AVAILABLE,
        'booking_interval_minutes' => self::DEFAULT_BOOKING_INTERVAL,
        'min_booking_minutes' => self::DEFAULT_MIN_BOOKING,
        'max_booking_minutes' => self::DEFAULT_MAX_BOOKING,
    ];

    protected $casts = [
        'min_players' => 'integer',
        'max_players' => 'integer',
        'price_per_hour' => 'decimal:2',
        'booking_interval_minutes' => 'integer',
        'min_booking_minutes' => 'integer',
        'max_booking_minutes' => 'integer',
    ];

    public function sportCategory(): BelongsTo
    {
        return $this->belongsTo(SportCategory::class);
    }

    public function isAvailable(): bool
    {
        return $this->status === self::STATUS_AVAILABLE;
    }

    public function isUnavailable(): bool
    {
        return ! $this->isAvailable();
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_AVAILABLE => 'Available',
            self::STATUS_MAINTENANCE => 'Maintenance',
            self::STATUS_CLOSED => 'Closed',
            self::STATUS_TEMPORARILY_BLOCKED => 'Temporarily Blocked',
            default => 'Unknown',
        };
    }

    private function normalizeTime(mixed $time): ?string
    {
        if ($time instanceof DateTimeInterface) {
            return $time->format('H:i:s');
        }

        if ($time === null) {
            return null;
        }

        $time = trim((string) $time);

        if (
            ! preg_match(
                '/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/',
                $time
            )
        ) {
            return null;
        }

        return strlen($time) === 5
            ? "{$time}:00"
            : $time;
    }

    public function hasValidOperatingHours(): bool
    {
        $openingTime = $this->normalizeTime(
            $this->opening_time
        );

        $closingTime = $this->normalizeTime(
            $this->closing_time
        );

        return $openingTime !== null
            && $closingTime !== null
            && $closingTime > $openingTime;
    }

    public function isWithinOperatingHours(?Carbon $dateTime = null): bool {
        if (! $this->hasValidOperatingHours()) {
            return false;
        }

        $now = ($dateTime ?? Carbon::now(self::TIME_ZONE))
            ->copy()
            ->setTimezone(self::TIME_ZONE);

        $openingTime = $this->normalizeTime($this->opening_time);
        $closingTime = $this->normalizeTime($this->closing_time);
        $currentTime = $now->format('H:i:s');

        return $currentTime >= $openingTime && $currentTime < $closingTime;
    }

    public function isOpenNow(?Carbon $dateTime = null): bool {
        return $this->isAvailable() && $this->isWithinOperatingHours($dateTime);
    }

    public function isClosedNow(?Carbon $dateTime = null): bool {
        return $this->isAvailable()
            && $this->hasValidOperatingHours()
            && ! $this->isWithinOperatingHours($dateTime);
    }

    public function getOperatingStatus(?Carbon $dateTime = null): string {
        if (! $this->isAvailable()) {
            return self::OPERATING_UNAVAILABLE;
        }

        if (! $this->hasValidOperatingHours()) {
            return self::OPERATING_UNKNOWN;
        }

        return $this->isWithinOperatingHours($dateTime)
            ? self::OPERATING_OPEN
            : self::OPERATING_CLOSED;
    }

    public function hasValidBookingConfiguration(): bool
    {
        $interval = (int) $this->booking_interval_minutes;
        $minimum = (int) $this->min_booking_minutes;
        $maximum = (int) $this->max_booking_minutes;

        return in_array(
            $interval,
            self::BOOKING_INTERVALS,
            true
        )
            && $minimum > 0
            && $maximum >= $minimum
            && $maximum <= 1440
            && $minimum % $interval === 0
            && $maximum % $interval === 0;
    }

    public function isValidBookingDuration(int $minutes): bool {
        if (! $this->hasValidBookingConfiguration()) {
            return false;
        }

        $interval = (int) $this->booking_interval_minutes;
        $minimum = (int) $this->min_booking_minutes;
        $maximum = (int) $this->max_booking_minutes;

        return $minutes >= $minimum
            && $minutes <= $maximum
            && $minutes % $interval === 0;
    }

    public function getAllowedBookingDurations(): array
    {
        if (! $this->hasValidBookingConfiguration()) {
            return [];
        }

        return range(
            (int) $this->min_booking_minutes,
            (int) $this->max_booking_minutes,
            (int) $this->booking_interval_minutes
        );
    }

    public function calculateBookingPrice(int $minutes): string {
        if (! $this->isValidBookingDuration($minutes)) {
            throw new InvalidArgumentException(
                'Invalid booking duration for this court.'
            );
        }

        if ($this->price_per_hour === null ||! is_numeric($this->price_per_hour) ||(float) $this->price_per_hour < 0) {
            throw new InvalidArgumentException(
                'Invalid court hourly price.'
            );
        }

        $hourlyFils = (int) round((float) $this->price_per_hour * 100);
        $totalFils = (int) round($hourlyFils * $minutes / 60);

        return number_format(
            $totalFils / 100,
            2,
            '.',
            ''
        );
    }

    public function getOperatingStatusAttribute(): string
    {
        return $this->getOperatingStatus();
    }

    public function getIsOpenNowAttribute(): bool
    {
        return $this->isOpenNow();
    }

    public function getAllowedBookingDurationsAttribute(): array
    {
        return $this->getAllowedBookingDurations();
    }

    public function maintenancePeriods(): HasMany
    {
        return $this->hasMany(CourtMaintenancePeriod::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function schedules(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CourtSchedule::class);
    }

    public function recurringSchedules(): HasMany
    {
        return $this->hasMany(CourtRecurringSchedule::class);
    }
}
