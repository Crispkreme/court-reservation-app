<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingCancellation extends Model
{
    protected $fillable = [
        'booking_id',
        'cancellation_policy_id',
        'user_id',
        'cancellation_type',
        'cancellation_reason',
        'cancelled_at',
        'hours_before_booking',
        'booking_amount',
        'refund_percentage',
        'eligible_refund_amount',
        'refund_status',
        'refund_transaction_reference',
        'refund_notes',
    ];

    protected $casts = [
        'cancelled_at' => 'datetime',
        'hours_before_booking' => 'decimal:2',
        'booking_amount' => 'decimal:2',
        'refund_percentage' => 'decimal:2',
        'eligible_refund_amount' => 'decimal:2',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function cancellationPolicy(): BelongsTo
    {
        return $this->belongsTo(
            CancellationPolicy::class
        );
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}