<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OperationalControl extends Model
{
    use HasFactory;

    protected $fillable = [
        'control_type',
        'court_id',
        'booking_id',
        'user_id',
        'authorized_by',
        'status',
        'starts_at',
        'ends_at',
        'minimum_advance_hours',
        'maximum_advance_days',
        'new_booking_date',
        'new_start_time',
        'new_duration_minutes',
        'refund_amount',
        'refund_reference',
        'override_rules',
        'allowed_roles',
        'reason',
        'notes',
        'metadata',
        'performed_at',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'performed_at' => 'datetime',

        'new_booking_date' => 'date',

        'override_rules' => 'array',
        'allowed_roles' => 'array',
        'metadata' => 'array',

        'refund_amount' => 'decimal:2',

        'minimum_advance_hours' => 'integer',
        'maximum_advance_days' => 'integer',
        'new_duration_minutes' => 'integer',
    ];

    public function court(): BelongsTo
    {
        return $this->belongsTo(Court::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function authorizedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'authorized_by');
    }
}