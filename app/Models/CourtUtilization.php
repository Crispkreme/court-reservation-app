<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourtUtilization extends Model
{
    protected $fillable = [
        'court_id',
        'utilization_date',
        'available_minutes',
        'booked_minutes',
        'maintenance_minutes',
        'blocked_minutes',
        'booking_count',
        'utilization_percentage',
    ];

    protected $casts = [
        'utilization_date' => 'date',
        'available_minutes' => 'integer',
        'booked_minutes' => 'integer',
        'maintenance_minutes' => 'integer',
        'blocked_minutes' => 'integer',
        'booking_count' => 'integer',
        'utilization_percentage' => 'decimal:2',
    ];

    public function court()
    {
        return $this->belongsTo(Court::class);
    }
}