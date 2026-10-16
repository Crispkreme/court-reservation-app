<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminDashboardSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'show_daily_summary',
        'show_sport_summary',
        'show_court_utilization',
        'show_revenue',
        'show_booking_status',
        'show_outstanding_payments',
        'show_failed_transactions',
        'show_waitlist',
        'show_memberships',
        'show_upcoming_sessions',
        'show_court_status',
        'default_date_range',
        'widget_order',
    ];

    protected $casts = [
        'show_daily_summary' => 'boolean',
        'show_sport_summary' => 'boolean',
        'show_court_utilization' => 'boolean',
        'show_revenue' => 'boolean',
        'show_booking_status' => 'boolean',
        'show_outstanding_payments' => 'boolean',
        'show_failed_transactions' => 'boolean',
        'show_waitlist' => 'boolean',
        'show_memberships' => 'boolean',
        'show_upcoming_sessions' => 'boolean',
        'show_court_status' => 'boolean',
        'widget_order' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}