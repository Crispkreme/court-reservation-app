<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    public const METHOD_PAYPAL = 'PAYPAL';
    public const METHOD_CARD = 'CARD';
    public const METHOD_E_WALLET = 'E_WALLET';
    public const METHOD_CASH = 'CASH';
    public const METHOD_BANK_TRANSFER = 'BANK_TRANSFER';
    public const METHOD_MANUAL = 'MANUAL';

    public const STATUS_PENDING = 'PENDING';
    public const STATUS_PAID = 'PAID';
    public const STATUS_FAILED = 'FAILED';
    public const STATUS_REFUNDED = 'REFUNDED';
    public const STATUS_PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED';

    protected $fillable = [
        'booking_id',
        'user_id',
        'payment_reference',
        'payment_method',
        'gateway',
        'gateway_reference',
        'amount',
        'currency',
        'status',
        'refunded_amount',
        'paid_at',
        'failed_at',
        'refunded_at',
        'confirmed_at',
        'failure_reason',
        'gateway_response',
        'metadata',
        'public_token',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'refunded_amount' => 'decimal:2',
            'paid_at' => 'datetime',
            'failed_at' => 'datetime',
            'refunded_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'gateway_response' => 'array',
            'metadata' => 'array',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}