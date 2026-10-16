<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class PaymentRefund extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_id',
        'user_id',
        'refund_reference',
        'gateway_reference',
        'amount',
        'currency',
        'status',
        'reason',
        'notes',
        'processed_at',
        'gateway_response',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'processed_at' => 'datetime',
        'gateway_response' => 'array',
    ];

    protected static function booted(): void
    {
        static::creating(function (PaymentRefund $refund) {
            if (!$refund->refund_reference) {
                $refund->refund_reference =
                    'REF-' . strtoupper(Str::random(12));
            }
        });
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}