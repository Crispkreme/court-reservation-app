<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class PaymentTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_id',
        'transaction_reference',
        'type',
        'status',
        'amount',
        'currency',
        'gateway',
        'gateway_reference',
        'gateway_response',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'gateway_response' => 'array',
    ];

    protected static function booted(): void
    {
        static::creating(function (PaymentTransaction $transaction) {
            if (!$transaction->transaction_reference) {
                $transaction->transaction_reference =
                    'TXN-' . strtoupper(Str::random(12));
            }
        });
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }
}