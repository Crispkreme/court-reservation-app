<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OutstandingPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'booking_id',
        'user_id',
        'due_date',
        'original_amount',
        'paid_amount',
        'outstanding_amount',
        'status',
        'follow_up_status',
        'last_follow_up_at',
        'next_follow_up_at',
        'follow_up_notes',
        'resolved_at',
    ];

    protected $casts = [
        'due_date' => 'date',
        'original_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'outstanding_amount' => 'decimal:2',
        'last_follow_up_at' => 'datetime',
        'next_follow_up_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    protected $appends = [
        'aging_days',
        'aging_bucket',
    ];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getAgingDaysAttribute(): int
    {
        if (!$this->due_date) {
            return 0;
        }

        $today = Carbon::today();
        $dueDate = Carbon::parse($this->due_date);

        if ($dueDate->greaterThanOrEqualTo($today)) {
            return 0;
        }

        return $dueDate->diffInDays($today);
    }

    public function getAgingBucketAttribute(): string
    {
        $days = $this->aging_days;

        return match (true) {
            $days <= 7 => '0-7',
            $days <= 30 => '8-30',
            $days <= 60 => '31-60',
            $days <= 90 => '61-90',
            default => '90+',
        };
    }

    public function scopeOutstanding(Builder $query): Builder
    {
        return $query->whereIn('status', [
            'outstanding',
            'partially_paid',
        ]);
    }
}