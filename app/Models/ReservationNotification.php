<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ReservationNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'channel',
        'status',
        'priority',
        'notifiable_type',
        'notifiable_id',
        'data',
        'scheduled_at',
        'sent_at',
        'delivered_at',
        'read_at',
        'failed_at',
        'failure_reason',
    ];

    protected $casts = [
        'data' => 'array',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
        'failed_at' => 'datetime',
    ];

    public const TYPES = [
        'booking_confirmation',
        'booking_reminder',
        'booking_cancellation',
        'booking_rescheduling',
        'payment_success',
        'payment_failure',
        'refund_processed',
        'waitlist_availability',
        'waitlist_promotion',
        'claim_expiration',
        'membership_expiration',
        'court_closure',
        'operational_closure',
    ];

    public const CHANNELS = [
        'in_app',
        'email',
        'sms',
        'push',
    ];

    public const STATUSES = [
        'pending',
        'queued',
        'sent',
        'delivered',
        'failed',
        'read',
    ];

    public const PRIORITIES = [
        'low',
        'normal',
        'high',
        'urgent',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function notifiable(): MorphTo
    {
        return $this->morphTo();
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    public function markAsRead(): void
    {
        if (!$this->read_at) {
            $this->update([
                'read_at' => now(),
                'status' => 'read',
            ]);
        }
    }

    public function markAsUnread(): void
    {
        $this->update([
            'read_at' => null,
            'status' => 'delivered',
        ]);
    }
}