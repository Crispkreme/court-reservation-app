<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingReschedule extends Model
{
    protected $fillable = [
        'booking_id',
        'requested_by',
        'requested_by_type',

        'original_booking_date',
        'original_start_time',
        'original_end_time',
        'original_court_id',

        'new_booking_date',
        'new_start_time',
        'new_end_time',
        'new_court_id',

        'original_price',
        'new_price',
        'price_difference',
        'price_adjustment_type',

        'payment_status',
        'reason',
        'status',
    ];

    protected $casts = [
        'original_booking_date' => 'date',
        'new_booking_date' => 'date',

        'original_price' => 'decimal:2',
        'new_price' => 'decimal:2',
        'price_difference' => 'decimal:2',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function originalCourt(): BelongsTo
    {
        return $this->belongsTo(Court::class, 'original_court_id');
    }

    public function newCourt(): BelongsTo
    {
        return $this->belongsTo(Court::class, 'new_court_id');
    }
}