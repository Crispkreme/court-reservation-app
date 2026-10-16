<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AdminDashboardSetting;
use App\Models\Booking;
use App\Models\Court;
use App\Models\Membership;
use App\Models\SportCategory;
use App\Models\Transaction;
use App\Models\Waitlist;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class AdminDashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'time_from' => ['nullable', 'date_format:H:i'],
            'time_to' => ['nullable', 'date_format:H:i'],
            'search' => ['nullable', 'string', 'max:255'],
            'sport_category_id' => ['nullable', 'integer'],
            'court_id' => ['nullable', 'integer'],
            'status' => ['nullable', 'string', 'max:50'],
        ]);

        $dateFrom = !empty($validated['date_from'])
            ? Carbon::parse($validated['date_from'])->startOfDay()
            : today()->startOfDay();

        $dateTo = !empty($validated['date_to'])
            ? Carbon::parse($validated['date_to'])->endOfDay()
            : today()->endOfDay();

        $search = trim($validated['search'] ?? '');

        /*
        |--------------------------------------------------------------------------
        | Settings
        |--------------------------------------------------------------------------
        */

        $settings = AdminDashboardSetting::firstOrCreate(
            [
                'user_id' => $request->user()->id,
            ],
            [
                'default_date_range' => 'today',

                'widget_order' => [
                    'daily_summary',
                    'sport_summary',
                    'court_utilization',
                    'revenue',
                    'booking_status',
                    'outstanding_payments',
                    'failed_transactions',
                    'waitlist',
                    'memberships',
                    'upcoming_sessions',
                    'court_status',
                ],
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Base booking query
        |--------------------------------------------------------------------------
        */

        $bookingQuery = Booking::query()
            ->whereBetween(
                'booking_date',
                [
                    $dateFrom->toDateString(),
                    $dateTo->toDateString(),
                ]
            );

        /*
        |--------------------------------------------------------------------------
        | Filters
        |--------------------------------------------------------------------------
        */

        if (!empty($validated['sport_category_id'])) {
            $bookingQuery->where(
                'sport_category_id',
                $validated['sport_category_id']
            );
        }

        if (!empty($validated['court_id'])) {
            $bookingQuery->where(
                'court_id',
                $validated['court_id']
            );
        }

        if (!empty($validated['status'])) {
            $bookingQuery->where(
                'status',
                $validated['status']
            );
        }

        if ($search !== '') {
            $bookingQuery->where(function ($query) use ($search) {
                $query
                    ->where('booking_reference', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%");
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Daily Booking Summary
        |--------------------------------------------------------------------------
        */

        $dailyBookings = (clone $bookingQuery)
            ->selectRaw('booking_date, COUNT(*) as total')
            ->groupBy('booking_date')
            ->orderBy('booking_date')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Booking Status
        |--------------------------------------------------------------------------
        */

        $statusCounts = (clone $bookingQuery)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $bookingStatus = [
            'confirmed' => (int) ($statusCounts['confirmed'] ?? 0),
            'pending' => (int) ($statusCounts['pending'] ?? 0),
            'cancelled' => (int) ($statusCounts['cancelled'] ?? 0),
            'completed' => (int) ($statusCounts['completed'] ?? 0),
            'failed' => (int) ($statusCounts['failed'] ?? 0),
        ];

        /*
        |--------------------------------------------------------------------------
        | Sport Summary
        |--------------------------------------------------------------------------
        */

        $sportSummary = (clone $bookingQuery)
            ->with('sportCategory')
            ->selectRaw(
                'sport_category_id, COUNT(*) as total_bookings'
            )
            ->groupBy('sport_category_id')
            ->orderByDesc('total_bookings')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Court Utilization
        |--------------------------------------------------------------------------
        */

        $totalCourts = Court::count();

        $courtBookings = (clone $bookingQuery)
            ->with('court')
            ->selectRaw(
                'court_id, COUNT(*) as total_bookings'
            )
            ->groupBy('court_id')
            ->orderByDesc('total_bookings')
            ->get();

        $totalBookingCount = max(
            1,
            (clone $bookingQuery)->count()
        );

        $courtUtilization = $courtBookings->map(
            function ($item) use ($totalBookingCount) {
                return [
                    'court_id' => $item->court_id,
                    'court' => $item->court,
                    'total_bookings' => (int) $item->total_bookings,
                    'utilization_percentage' => round(
                        ($item->total_bookings / $totalBookingCount) * 100,
                        2
                    ),
                ];
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Revenue
        |--------------------------------------------------------------------------
        |
        | Uses successful/paid transactions when available.
        |
        */

        $todayRevenue = 0;

        $transactionQuery = Transaction::query()
            ->whereBetween('created_at', [$dateFrom, $dateTo]);

        if (Schema::hasColumn('transactions', 'status')) {
            $transactionQuery->whereIn(
                'status',
                [
                    'paid',
                    'success',
                    'successful',
                    'completed',
                ]
            );
        }

        $todayRevenue = (float) $transactionQuery->sum('amount');

        /*
        |--------------------------------------------------------------------------
        | Outstanding Payments
        |--------------------------------------------------------------------------
        */

        $outstandingPayments = Transaction::query()
            ->whereIn(
                'status',
                [
                    'pending',
                    'unpaid',
                    'outstanding',
                ]
            )
            ->sum('amount');

        /*
        |--------------------------------------------------------------------------
        | Failed Transactions
        |--------------------------------------------------------------------------
        */

        $failedTransactions = Transaction::query()
            ->where('status', 'failed')
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->count();

        /*
        |--------------------------------------------------------------------------
        | Waitlist Activity
        |--------------------------------------------------------------------------
        */

        $waitlistActivity = [
            'total' => 0,
            'waiting' => 0,
            'promoted' => 0,
            'cancelled' => 0,
            'expired' => 0,
        ];

        if (class_exists(Waitlist::class)) {
            $waitlistQuery = Waitlist::query()
                ->whereBetween('created_at', [$dateFrom, $dateTo]);

            $waitlistActivity['total'] =
                (clone $waitlistQuery)->count();

            $waitlistStatuses = (clone $waitlistQuery)
                ->selectRaw('status, COUNT(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status');

            $waitlistActivity['waiting'] =
                (int) ($waitlistStatuses['waiting'] ?? 0);

            $waitlistActivity['promoted'] =
                (int) ($waitlistStatuses['promoted'] ?? 0);

            $waitlistActivity['cancelled'] =
                (int) ($waitlistStatuses['cancelled'] ?? 0);

            $waitlistActivity['expired'] =
                (int) ($waitlistStatuses['expired'] ?? 0);
        }

        /*
        |--------------------------------------------------------------------------
        | Membership Statistics
        |--------------------------------------------------------------------------
        */

        $membershipStatistics = [
            'total' => 0,
            'active' => 0,
            'pending' => 0,
            'expired' => 0,
            'suspended' => 0,
            'cancelled' => 0,
        ];

        if (class_exists(Membership::class)) {
            $membershipStatuses = Membership::query()
                ->selectRaw('status, COUNT(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status');

            $membershipStatistics['total'] =
                (int) $membershipStatuses->sum();

            foreach (
                [
                    'active',
                    'pending',
                    'expired',
                    'suspended',
                    'cancelled',
                ] as $status
            ) {
                $membershipStatistics[$status] =
                    (int) ($membershipStatuses[$status] ?? 0);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Upcoming Sessions
        |--------------------------------------------------------------------------
        */

        $upcomingSessions = Booking::query()
            ->where(function ($query) {
                $query
                    ->whereDate(
                        'booking_date',
                        '>',
                        today()->toDateString()
                    )
                    ->orWhere(function ($query) {
                        $query
                            ->whereDate(
                                'booking_date',
                                today()->toDateString()
                            )
                            ->where(
                                'start_time',
                                '>=',
                                now()->format('H:i:s')
                            );
                    });
            })
            ->whereNotIn(
                'status',
                [
                    'cancelled',
                    'failed',
                ]
            )
            ->with([
                'court',
                'sportCategory',
            ])
            ->orderBy('booking_date')
            ->orderBy('start_time')
            ->limit(15)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Court Status
        |--------------------------------------------------------------------------
        */

        $courtStatus = Court::query()
            ->select([
                'id',
                'name',
                'status',
                'sport_category_id',
            ])
            ->with('sportCategory')
            ->orderBy('name')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Summary
        |--------------------------------------------------------------------------
        */

        $summary = [
            'total_bookings' => (clone $bookingQuery)->count(),

            'confirmed' => $bookingStatus['confirmed'],
            'pending' => $bookingStatus['pending'],
            'cancelled' => $bookingStatus['cancelled'],
            'completed' => $bookingStatus['completed'],
            'failed' => $bookingStatus['failed'],

            'today_revenue' => $todayRevenue,

            'outstanding_payments' => (float) $outstandingPayments,

            'failed_transactions' => $failedTransactions,

            'total_courts' => $totalCourts,

            'available_courts' => $courtStatus
                ->where('status', 'available')
                ->count(),

            'maintenance_courts' => $courtStatus
                ->where('status', 'maintenance')
                ->count(),

            'closed_courts' => $courtStatus
                ->where('status', 'closed')
                ->count(),
        ];

        return response()->json([
            'filters' => [
                'date_from' => $dateFrom->toDateString(),
                'date_to' => $dateTo->toDateString(),
                'time_from' => $validated['time_from'] ?? null,
                'time_to' => $validated['time_to'] ?? null,
                'search' => $search,
                'sport_category_id' =>
                    $validated['sport_category_id'] ?? null,
                'court_id' =>
                    $validated['court_id'] ?? null,
                'status' =>
                    $validated['status'] ?? null,
            ],

            'settings' => $settings,

            'summary' => $summary,

            'daily_bookings' => $dailyBookings,

            'booking_status' => $bookingStatus,

            'sport_summary' => $sportSummary,

            'court_utilization' => $courtUtilization,

            'outstanding_payments' => (float) $outstandingPayments,

            'failed_transactions' => $failedTransactions,

            'waitlist_activity' => $waitlistActivity,

            'membership_statistics' => $membershipStatistics,

            'upcoming_sessions' => $upcomingSessions,

            'court_status' => $courtStatus,
        ]);
    }

    public function settings(Request $request): JsonResponse
    {
        $settings = AdminDashboardSetting::firstOrCreate(
            [
                'user_id' => $request->user()->id,
            ],
            [
                'default_date_range' => 'today',

                'widget_order' => [
                    'daily_summary',
                    'sport_summary',
                    'court_utilization',
                    'revenue',
                    'booking_status',
                    'outstanding_payments',
                    'failed_transactions',
                    'waitlist',
                    'memberships',
                    'upcoming_sessions',
                    'court_status',
                ],
            ]
        );

        return response()->json($settings);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'show_daily_summary' => ['sometimes', 'boolean'],
            'show_sport_summary' => ['sometimes', 'boolean'],
            'show_court_utilization' => ['sometimes', 'boolean'],
            'show_revenue' => ['sometimes', 'boolean'],
            'show_booking_status' => ['sometimes', 'boolean'],
            'show_outstanding_payments' => ['sometimes', 'boolean'],
            'show_failed_transactions' => ['sometimes', 'boolean'],
            'show_waitlist' => ['sometimes', 'boolean'],
            'show_memberships' => ['sometimes', 'boolean'],
            'show_upcoming_sessions' => ['sometimes', 'boolean'],
            'show_court_status' => ['sometimes', 'boolean'],

            'default_date_range' => [
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

        $settings = AdminDashboardSetting::updateOrCreate(
            [
                'user_id' => $request->user()->id,
            ],
            $validated
        );

        return response()->json([
            'message' => 'Admin dashboard settings updated successfully.',
            'settings' => $settings,
        ]);
    }
}