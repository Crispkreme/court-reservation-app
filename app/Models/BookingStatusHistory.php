<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingStatusHistory extends Model
{
    use HasFactory;

    public const STATUS_DRAFT = 'DRAFT';

    public const STATUS_PENDING_PAYMENT = 'PENDING_PAYMENT';

    public const STATUS_CONFIRMED = 'CONFIRMED';

    public const STATUS_CHECKED_IN = 'CHECKED_IN';

    public const STATUS_IN_PROGRESS = 'IN_PROGRESS';

    public const STATUS_COMPLETED = 'COMPLETED';

    public const STATUS_CANCELLED = 'CANCELLED';

    public const STATUS_RESCHEDULED = 'RESCHEDULED';

    public const STATUS_NO_SHOW = 'NO_SHOW';

    public const STATUS_EXPIRED = 'EXPIRED';

    public const STATUS_FAILED = 'FAILED';

    public const STATUSES = [
        self::STATUS_DRAFT,
        self::STATUS_PENDING_PAYMENT,
        self::STATUS_CONFIRMED,
        self::STATUS_CHECKED_IN,
        self::STATUS_IN_PROGRESS,
        self::STATUS_COMPLETED,
        self::STATUS_CANCELLED,
        self::STATUS_RESCHEDULED,
        self::STATUS_NO_SHOW,
        self::STATUS_EXPIRED,
        self::STATUS_FAILED,
    ];

    protected $fillable = [
        'booking_id',
        'from_status',
        'to_status',
        'changed_by',
        'reason',
        'notes',
        'metadata',
        'changed_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'changed_at' => 'datetime',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}