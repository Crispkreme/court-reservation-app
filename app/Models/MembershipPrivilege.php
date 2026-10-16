<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MembershipPrivilege extends Model
{
    use HasFactory;

    protected $fillable = [
        'membership_type_id',
        'priority_booking',
        'booking_advance_days',
        'premium_courts',
        'daily_booking_limit',
        'max_duration_minutes',
        'max_players',
        'cancellation_window_hours',
        'free_cancellation',
        'reschedule_window_hours',
        'free_rescheduling',
        'notes',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'priority_booking' => 'boolean',
            'premium_courts' => 'boolean',
            'free_cancellation' => 'boolean',
            'free_rescheduling' => 'boolean',
            'is_active' => 'boolean',

            'booking_advance_days' => 'integer',
            'daily_booking_limit' => 'integer',
            'max_duration_minutes' => 'integer',
            'max_players' => 'integer',
            'cancellation_window_hours' => 'integer',
            'reschedule_window_hours' => 'integer',
        ];
    }

    public function membershipType(): BelongsTo
    {
        return $this->belongsTo(
            MembershipType::class
        );
    }
}