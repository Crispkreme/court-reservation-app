<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourtPricing extends Model
{
    protected $fillable = [
        'court_id',
        'pricing_type',
        'price',
        'start_time',
        'end_time',
        'day_of_week',
        'effective_from',
        'effective_until',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'day_of_week' => 'integer',
        'effective_from' => 'date',
        'effective_until' => 'date',
        'is_active' => 'boolean',
    ];

    public function court()
    {
        return $this->belongsTo(Court::class);
    }
}