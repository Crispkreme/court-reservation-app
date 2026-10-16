<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourtMaintenancePeriod extends Model
{
    protected $fillable = [
        'court_id',
        'maintenance_date',
        'start_time',
        'end_time',
        'reason',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'maintenance_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function court()
    {
        return $this->belongsTo(Court::class);
    }
}