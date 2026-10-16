<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Court;
use App\Models\CustomerDashboardSetting;
use App\Models\Notification;
use App\Models\SportCategory;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerDashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $dateFrom = $request->filled('date_from')
            ? Carbon::parse($request->date_from)->startOfDay()
            : null;

        $dateTo = $request->filled('date_to')
            ? Carbon::parse($request->date_to)->endOfDay()
            : null;

        $search = trim((string) $request->input('search', ''));

        /*
        |--------------------------------------------------------------------------
        | Settings
        |--------------------------------------------------------------------------
        */

        $settings = CustomerDashboardSetting::firstOrCreate(
            ['user_id' => $user->id],
            [
                'widget_order' => [
                    'upcoming_bookings',
                    'today_bookings',
                    'quick_book',
                    'available_courts',
                    'sports',
                    'membership',
                    'payment_balance',
                    'notifications',
                    'booking_history',
                    'transaction_history',
                ],
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Base booking query
        |--------------------------------------------------------------------------
        */

        $bookingQuery = Booking::query()
            ->where('user_id', $user->id);

        if ($search !== '') {
            $bookingQuery->where(function ($query) use ($search) {
                $query
                    ->where('booking_reference', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%");
            });
        }

        if ($dateFrom) {
            $bookingQuery->whereDate('booking_date', '>=', $dateFrom->toDateString());
        }

        if ($dateTo) {
            $bookingQuery->whereDate('booking_date', '<=', $dateTo->toDateString());
        }

        /*
        |--------------------------------------------------------------------------
        | Upcoming bookings
        |--------------------------------------------------------------------------
        */

        $upcomingBookings = (clone $bookingQuery)
            ->where(function ($query) {
                $query
                    ->whereDate('booking_date', '>', today())
                    ->orWhere(function ($q) {
                        $q->whereDate('booking_date', today())
                            ->where('start_time', '>=', now()->format('H:i:s'));
                    });
            })
            ->whereNotIn('status', [
                'cancelled',
                'completed',
                'no_show',
            ])
            ->with([
                'court',
                'sportCategory',
            ])
            ->orderBy('booking_date')
            ->orderBy('start_time')
            ->limit(10)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Today's bookings
        |--------------------------------------------------------------------------
        */

        $todayBookings = (clone $bookingQuery)
            ->whereDate('booking_date', today())
            ->with([
                'court',
                'sportCategory',
            ])
            ->orderBy('start_time')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Booking history
        |--------------------------------------------------------------------------
        */

        $bookingHistory = (clone $bookingQuery)
            ->where(function ($query) {
                $query
                    ->whereDate('booking_date', '<', today())
                    ->orWhereIn('status', [
                        'completed',
                        'cancelled',
                        'no_show',
                    ]);
            })
            ->with([
                'court',
                'sportCategory',
            ])
            ->orderByDesc('booking_date')
            ->orderByDesc('start_time')
            ->limit(20)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Available courts
        |--------------------------------------------------------------------------
        */

        $availableCourts = Court::query()
            ->with('sportCategory')
            ->where(function ($query) {
                $query->where('status', 'available')
                    ->orWhereNull('status');
            })
            ->orderBy('name')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Sport categories
        |--------------------------------------------------------------------------
        */

        $sports = SportCategory::query()
            ->withCount('courts')
            ->orderBy('name')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Membership
        |--------------------------------------------------------------------------
        */

        $membership = null;

        if (method_exists($user, 'memberships')) {
            $membership = $user->memberships()
                ->with('membershipType')
                ->whereIn('status', [
                    'active',
                    'pending',
                ])
                ->orderByDesc('start_date')
                ->first();
        }

        /*
        |--------------------------------------------------------------------------
        | Payment balance
        |--------------------------------------------------------------------------
        |
        | Calculate outstanding amount from unpaid / pending transactions.
        |
        */

        $paymentBalance = 0;

        if (class_exists(Transaction::class)) {
            $paymentBalance = Transaction::query()
                ->where('user_id', $user->id)
                ->whereIn('status', [
                    'pending',
                    'unpaid',
                    'outstanding',
                    'failed',
                ])
                ->sum('amount');
        }

        /*
        |--------------------------------------------------------------------------
        | Transactions
        |--------------------------------------------------------------------------
        */

        $transactions = collect();

        if (class_exists(Transaction::class)) {
            $transactionQuery = Transaction::query()
                ->where('user_id', $user->id);

            if ($dateFrom) {
                $transactionQuery->whereDate(
                    'created_at',
                    '>=',
                    $dateFrom->toDateString()
                );
            }

            if ($dateTo) {
                $transactionQuery->whereDate(
                    'created_at',
                    '<=',
                    $dateTo->toDateString()
                );
            }

            if ($search !== '') {
                $transactionQuery->where(function ($query) use ($search) {
                    $query
                        ->where('transaction_reference', 'like', "%{$search}%")
                        ->orWhere('payment_reference', 'like', "%{$search}%")
                        ->orWhere('status', 'like', "%{$search}%");
                });
            }

            $transactions = $transactionQuery
                ->orderByDesc('created_at')
                ->limit(20)
                ->get();
        }

        /*
        |--------------------------------------------------------------------------
        | Notifications
        |--------------------------------------------------------------------------
        */

        $notifications = collect();

        if (class_exists(Notification::class)) {
            $notifications = Notification::query()
                ->where('user_id', $user->id)
                ->orderByDesc('created_at')
                ->limit(10)
                ->get();
        }

        /*
        |--------------------------------------------------------------------------
        | Summary
        |--------------------------------------------------------------------------
        */

        $summary = [
            'upcoming_bookings' => $upcomingBookings->count(),
            'today_bookings' => $todayBookings->count(),
            'available_courts' => $availableCourts->count(),
            'unread_notifications' => $notifications
                ->where('read_at', null)
                ->count(),
            'payment_balance' => (float) $paymentBalance,
        ];

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],

            'settings' => $settings,

            'summary' => $summary,

            'upcoming_bookings' => $upcomingBookings,

            'today_bookings' => $todayBookings,

            'booking_history' => $bookingHistory,

            'available_courts' => $availableCourts,

            'sports' => $sports,

            'membership' => $membership,

            'payment_balance' => (float) $paymentBalance,

            'notifications' => $notifications,

            'transactions' => $transactions,
        ]);
    }

    public function settings(Request $request): JsonResponse
    {
        $settings = CustomerDashboardSetting::firstOrCreate(
            [
                'user_id' => $request->user()->id,
            ],
            [
                'widget_order' => [
                    'upcoming_bookings',
                    'today_bookings',
                    'quick_book',
                    'available_courts',
                    'sports',
                    'membership',
                    'payment_balance',
                    'notifications',
                    'booking_history',
                    'transaction_history',
                ],
            ]
        );

        return response()->json($settings);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'show_upcoming_bookings' => ['sometimes', 'boolean'],
            'show_today_bookings' => ['sometimes', 'boolean'],
            'show_quick_book' => ['sometimes', 'boolean'],
            'show_available_courts' => ['sometimes', 'boolean'],
            'show_sports' => ['sometimes', 'boolean'],
            'show_membership' => ['sometimes', 'boolean'],
            'show_payment_balance' => ['sometimes', 'boolean'],
            'show_notifications' => ['sometimes', 'boolean'],
            'show_booking_history' => ['sometimes', 'boolean'],
            'show_transaction_history' => ['sometimes', 'boolean'],

            'default_view' => [
                'sometimes',
                'string',
                'max:50',
            ],

            'default_booking_filter' => [
                'sometimes',
                'string',
                'max:50',
            ],

            'widget_order' => [
                'sometimes',
                'array',
            ],

            'widget_order.*' => [
                'string',
            ],
        ]);

        $settings = CustomerDashboardSetting::updateOrCreate(
            [
                'user_id' => $request->user()->id,
            ],
            $validated
        );

        return response()->json([
            'message' => 'Dashboard settings updated successfully.',
            'settings' => $settings,
        ]);
    }
}