<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Court extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'sport_category_id',
        'name',
        'court_number',
        'branch',
        'location',
        'min_players',
        'max_players',
        'status',
        'capacity',
        'opening_time',
        'closing_time',
        'booking_interval',
        'minimum_booking_duration',
        'maximum_booking_duration',
        'base_price',
        'currency',
        'description',
        'is_active',
    ];

    protected $casts = [
        'min_players' => 'integer',
        'max_players' => 'integer',
        'booking_interval' => 'integer',
        'minimum_booking_duration' => 'integer',
        'maximum_booking_duration' => 'integer',
        'base_price' => 'decimal:2',
        'is_active' => 'boolean',
        'capacity' => 'integer',
    ];

    public function sportCategory()
    {
        return $this->belongsTo(SportCategory::class);
    }

    public function pricings()
    {
        return $this->hasMany(CourtPricing::class);
    }

    public function maintenancePeriods()
    {
        return $this->hasMany(CourtMaintenancePeriod::class);
    }

    public function utilizations()
    {
        return $this->hasMany(CourtUtilization::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(CourtSchedule::class);
    }

    public function scheduleOverrides(): HasMany
    {
        return $this->hasMany(CourtScheduleOverride::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function bookingHolds(): HasMany
    {
        return $this->hasMany(BookingHold::class);
    }
}