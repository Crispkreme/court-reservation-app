<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FailureException extends Model
{
    use HasFactory;

    protected $table = 'failure_exceptions';

    protected $fillable = [
        'failure_type',
        'failure_stage',
        'booking_id',
        'user_id',
        'court_id',
        'reference',
        'reason',
        'technical_details',
        'error_code',
        'gateway',
        'gateway_reference',
        'failure_date',
        'failure_time',
        'failed_at',
        'is_recoverable',
        'retry_count',
        'max_retries',
        'status',
        'last_retry_at',
        'resolved_at',
        'resolved_by',
        'resolution_notes',
        'context',
    ];

    protected $casts = [
        'failure_date' => 'date',
        'failed_at' => 'datetime',
        'last_retry_at' => 'datetime',
        'resolved_at' => 'datetime',
        'is_recoverable' => 'boolean',
        'context' => 'array',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function court(): BelongsTo
    {
        return $this->belongsTo(Court::class);
    }

    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    public function getCanRetryAttribute(): bool
    {
        return (
            $this->is_recoverable &&
            in_array($this->status, ['open', 'failed']) &&
            $this->retry_count < $this->max_retries
        );
    }
}