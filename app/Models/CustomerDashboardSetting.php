<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerDashboardSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'show_upcoming_bookings',
        'show_today_bookings',
        'show_quick_book',
        'show_available_courts',
        'show_sports',
        'show_membership',
        'show_payment_balance',
        'show_notifications',
        'show_booking_history',
        'show_transaction_history',
        'default_view',
        'default_booking_filter',
        'widget_order',
    ];

    protected $casts = [
        'show_upcoming_bookings' => 'boolean',
        'show_today_bookings' => 'boolean',
        'show_quick_book' => 'boolean',
        'show_available_courts' => 'boolean',
        'show_sports' => 'boolean',
        'show_membership' => 'boolean',
        'show_payment_balance' => 'boolean',
        'show_notifications' => 'boolean',
        'show_booking_history' => 'boolean',
        'show_transaction_history' => 'boolean',
        'widget_order' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}