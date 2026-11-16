<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourtRecurringSchedule extends Model
{
    public const STATUS_OPEN = 'open';
    public const STATUS_CLOSED = 'closed';

    protected $fillable = [
        'court_id',
        'day_of_week',
        'opening_time',
        'closing_time',
        'status',
        'effective_from',
        'effective_until',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'day_of_week' => 'integer',
        'effective_from' => 'date:Y-m-d',
        'effective_until' => 'date:Y-m-d',
        'is_active' => 'boolean',
    ];

    public function court(): BelongsTo
    {
        return $this->belongsTo(Court::class);
    }
}
