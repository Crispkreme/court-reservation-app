<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Court;
use App\Models\FailureException;
use App\Models\Payment;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    /**
     * Main reports endpoint.
     */
    public function index(Request $request)
    {
        $report = $request->get('report', 'daily_booking');

        $data = match ($report) {
            'daily_booking' => $this->dailyBooking($request),
            'court_utilization' => $this->courtUtilization($request),
            'sport_category' => $this->sportCategory($request),
            'revenue' => $this->revenue($request),
            'payment' => $this->payment($request),
            'outstanding_fees' => $this->outstandingFees($request),
            'cancellation' => $this->cancellation($request),
            'rescheduling' => $this->rescheduling($request),
            'no_show' => $this->noShow($request),
            'membership' => $this->membership($request),
            'waitlist' => $this->waitlist($request),
            'failed_transaction' => $this->failedTransaction($request),
            'booking_activity' => $this->bookingActivity($request),
            default => $this->dailyBooking($request),
        };

        return response()->json([
            'report' => $report,
            'filters' => [
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
            ],
            'data' => $data,
        ]);
    }

    /**
     * Daily booking report.
     */
    private function dailyBooking(Request $request): array
    {
        $query = Booking::query()
            ->with([
                'user:id,name,email',
                'court',
            ]);

        $this->applyDateFilter(
            $query,
            $request,
            'booking_date'
        );

        if ($request->filled('status')) {
            $query->where(
                'status',
                $request->status
            );
        }

        if ($request->filled('court_id')) {
            $query->where(
                'court_id',
                $request->court_id
            );
        }

        $bookings = $query
            ->orderBy('booking_date')
            ->orderBy('start_time')
            ->get();

        return [
            'summary' => [
                'total_bookings' => $bookings->count(),

                'confirmed' => $bookings
                    ->where('status', 'confirmed')
                    ->count(),

                'pending' => $bookings
                    ->where('status', 'pending')
                    ->count(),

                'cancelled' => $bookings
                    ->where('status', 'cancelled')
                    ->count(),

                'completed' => $bookings
                    ->where('status', 'completed')
                    ->count(),

                'failed' => $bookings
                    ->where('status', 'failed')
                    ->count(),

                'no_show' => $bookings
                    ->where('status', 'no_show')
                    ->count(),
            ],

            'rows' => $bookings->map(function ($booking) {
                return [
                    'booking_id' => $booking->id,
                    'booking_reference' =>
                        $booking->booking_reference ?? null,

                    'date' => $booking->booking_date,

                    'start_time' => $booking->start_time,

                    'duration_minutes' =>
                        $booking->duration_minutes,

                    'member' =>
                        $booking->user?->name,

                    'email' =>
                        $booking->user?->email,

                    'court' =>
                        $booking->court?->name,

                    'status' =>
                        $booking->status,

                    'players_count' =>
                        $booking->players_count,

                    'amount' =>
                        $booking->total_amount
                            ?? $booking->amount
                            ?? 0,
                ];
            })->values(),
        ];
    }

    /**
     * Court utilization report.
     */
    private function courtUtilization(Request $request): array
    {
        $query = Booking::query()
            ->with('court');

        $this->applyDateFilter(
            $query,
            $request,
            'booking_date'
        );

        $bookings = $query->get();

        $rows = $bookings
            ->groupBy('court_id')
            ->map(function ($items, $courtId) {
                $court = $items->first()?->court;

                $bookedMinutes = $items->sum(
                    fn ($booking) =>
                        (int) ($booking->duration_minutes ?? 0)
                );

                $bookingCount = $items->count();

                return [
                    'court_id' => $courtId,
                    'court' => $court?->name ?? "Court #{$courtId}",
                    'booking_count' => $bookingCount,
                    'booked_minutes' => $bookedMinutes,
                    'booked_hours' =>
                        round($bookedMinutes / 60, 2),

                    'completed' =>
                        $items->where('status', 'completed')->count(),

                    'cancelled' =>
                        $items->where('status', 'cancelled')->count(),

                    'no_show' =>
                        $items->where('status', 'no_show')->count(),
                ];
            })
            ->values();

        return [
            'summary' => [
                'courts_with_bookings' => $rows->count(),

                'total_bookings' =>
                    $bookings->count(),

                'total_booked_minutes' =>
                    $bookings->sum(
                        fn ($booking) =>
                            (int) ($booking->duration_minutes ?? 0)
                    ),
            ],

            'rows' => $rows,
        ];
    }

    /**
     * Sport category report.
     */
    private function sportCategory(Request $request): array
    {
        $query = Booking::query()
            ->with([
                'sportCategory',
            ]);

        $this->applyDateFilter(
            $query,
            $request,
            'booking_date'
        );

        $bookings = $query->get();

        $rows = $bookings
            ->groupBy('sport_category_id')
            ->map(function ($items, $categoryId) {
                $category =
                    $items->first()?->sportCategory;

                return [
                    'sport_category_id' => $categoryId,

                    'sport_category' =>
                        $category?->name
                        ?? "Sport #{$categoryId}",

                    'bookings' =>
                        $items->count(),

                    'confirmed' =>
                        $items
                            ->where('status', 'confirmed')
                            ->count(),

                    'completed' =>
                        $items
                            ->where('status', 'completed')
                            ->count(),

                    'cancelled' =>
                        $items
                            ->where('status', 'cancelled')
                            ->count(),

                    'players' =>
                        $items->sum(
                            fn ($booking) =>
                                (int) ($booking->players_count ?? 0)
                        ),

                    'revenue' =>
                        $items->sum(
                            fn ($booking) =>
                                (float) (
                                    $booking->total_amount
                                    ?? $booking->amount
                                    ?? 0
                                )
                        ),
                ];
            })
            ->values();

        return [
            'summary' => [
                'total_sports' => $rows->count(),
                'total_bookings' => $bookings->count(),
                'total_players' => $bookings->sum(
                    fn ($booking) =>
                        (int) ($booking->players_count ?? 0)
                ),
            ],

            'rows' => $rows,
        ];
    }

    /**
     * Revenue report.
     */
    private function revenue(Request $request): array
    {
        $query = Booking::query();

        $this->applyDateFilter(
            $query,
            $request,
            'booking_date'
        );

        $bookings = $query->get();

        $total = $bookings->sum(
            fn ($booking) =>
                (float) (
                    $booking->total_amount
                    ?? $booking->amount
                    ?? 0
                )
        );

        $completed = $bookings
            ->where('status', 'completed')
            ->sum(
                fn ($booking) =>
                    (float) (
                        $booking->total_amount
                        ?? $booking->amount
                        ?? 0
                    )
            );

        $cancelled = $bookings
            ->where('status', 'cancelled')
            ->sum(
                fn ($booking) =>
                    (float) (
                        $booking->total_amount
                        ?? $booking->amount
                        ?? 0
                    )
            );

        return [
            'summary' => [
                'gross_revenue' => $total,
                'completed_revenue' => $completed,
                'cancelled_value' => $cancelled,

                'average_booking_value' =>
                    $bookings->count()
                        ? round(
                            $total / $bookings->count(),
                            2
                        )
                        : 0,
            ],

            'rows' => $bookings
                ->groupBy('booking_date')
                ->map(function ($items, $date) {
                    return [
                        'date' => $date,

                        'bookings' =>
                            $items->count(),

                        'revenue' =>
                            $items->sum(
                                fn ($booking) =>
                                    (float) (
                                        $booking->total_amount
                                        ?? $booking->amount
                                        ?? 0
                                    )
                            ),
                    ];
                })
                ->values(),
        ];
    }

    /**
     * Payment report.
     */
    private function payment(Request $request): array
    {
        $query = Payment::query();

        $this->applyTimestampDateFilter(
            $query,
            $request,
            'created_at'
        );

        if ($request->filled('status')) {
            $query->where(
                'status',
                $request->status
            );
        }

        if ($request->filled('payment_method')) {
            $query->where(
                'payment_method',
                $request->payment_method
            );
        }

        $payments = $query
            ->with([
                'user:id,name,email',
                'booking',
            ])
            ->latest()
            ->get();

        return [
            'summary' => [
                'total_transactions' =>
                    $payments->count(),

                'successful' =>
                    $payments
                        ->whereIn(
                            'status',
                            ['paid', 'completed', 'success']
                        )
                        ->count(),

                'pending' =>
                    $payments
                        ->where('status', 'pending')
                        ->count(),

                'failed' =>
                    $payments
                        ->where('status', 'failed')
                        ->count(),

                'refunded' =>
                    $payments
                        ->where('status', 'refunded')
                        ->count(),

                'total_amount' =>
                    $payments->sum(
                        fn ($payment) =>
                            (float) $payment->amount
                    ),
            ],

            'rows' => $payments
                ->map(function ($payment) {
                    return [
                        'id' => $payment->id,

                        'payment_reference' =>
                            $payment->payment_reference,

                        'booking' =>
                            $payment->booking?->booking_reference
                            ?? $payment->booking_id,

                        'member' =>
                            $payment->user?->name,

                        'method' =>
                            $payment->payment_method,

                        'gateway' =>
                            $payment->gateway,

                        'amount' =>
                            (float) $payment->amount,

                        'status' =>
                            $payment->status,

                        'paid_at' =>
                            $payment->paid_at,

                        'created_at' =>
                            $payment->created_at,
                    ];
                })
                ->values(),
        ];
    }

    /**
     * Outstanding / aged fees report.
     */
    private function outstandingFees(Request $request): array
    {
        $model = class_exists(
            \App\Models\OutstandingPayment::class
        )
            ? \App\Models\OutstandingPayment::class
            : null;

        if (!$model) {
            return [
                'summary' => [
                    'total' => 0,
                    'outstanding_balance' => 0,
                ],

                'rows' => [],

                'message' =>
                    'OutstandingPayment model was not found.',
            ];
        }

        $query = $model::query();

        if ($request->filled('status')) {
            $query->where(
                'status',
                $request->status
            );
        }

        $items = $query
            ->with([
                'user:id,name,email',
                'booking',
            ])
            ->latest()
            ->get();

        $rows = $items->map(function ($item) {
            $dueDate = $item->due_date
                ? Carbon::parse($item->due_date)
                : null;

            $daysOverdue = $dueDate
                ? max(
                    0,
                    $dueDate->diffInDays(
                        now(),
                        false
                    )
                )
                : 0;

            $bucket = match (true) {
                $daysOverdue <= 7 => '0-7',
                $daysOverdue <= 30 => '8-30',
                $daysOverdue <= 60 => '31-60',
                $daysOverdue <= 90 => '61-90',
                default => '90+',
            };

            return [
                'id' => $item->id,

                'member' =>
                    $item->user?->name,

                'booking' =>
                    $item->booking?->booking_reference
                    ?? $item->booking_id,

                'due_date' =>
                    $item->due_date,

                'amount' =>
                    (float) (
                        $item->outstanding_amount
                        ?? $item->balance
                        ?? $item->amount
                        ?? 0
                    ),

                'status' =>
                    $item->status,

                'days_overdue' =>
                    $daysOverdue,

                'aging_bucket' =>
                    $bucket,
            ];
        });

        return [
            'summary' => [
                'total' =>
                    $rows->count(),

                'outstanding_balance' =>
                    $rows->sum('amount'),

                '0_7' =>
                    $rows
                        ->where('aging_bucket', '0-7')
                        ->sum('amount'),

                '8_30' =>
                    $rows
                        ->where('aging_bucket', '8-30')
                        ->sum('amount'),

                '31_60' =>
                    $rows
                        ->where('aging_bucket', '31-60')
                        ->sum('amount'),

                '61_90' =>
                    $rows
                        ->where('aging_bucket', '61-90')
                        ->sum('amount'),

                '90_plus' =>
                    $rows
                        ->where('aging_bucket', '90+')
                        ->sum('amount'),
            ],

            'rows' => $rows->values(),
        ];
    }

    /**
     * Cancellation report.
     */
    private function cancellation(Request $request): array
    {
        $query = Booking::query()
            ->where('status', 'cancelled')
            ->with([
                'user:id,name,email',
                'court',
            ]);

        $this->applyDateFilter(
            $query,
            $request,
            'booking_date'
        );

        $bookings = $query
            ->latest('booking_date')
            ->get();

        return [
            'summary' => [
                'total_cancellations' =>
                    $bookings->count(),

                'total_value' =>
                    $bookings->sum(
                        fn ($booking) =>
                            (float) (
                                $booking->total_amount
                                ?? $booking->amount
                                ?? 0
                            )
                    ),
            ],

            'rows' => $bookings
                ->map(function ($booking) {
                    return [
                        'booking_reference' =>
                            $booking->booking_reference,

                        'date' =>
                            $booking->booking_date,

                        'member' =>
                            $booking->user?->name,

                        'court' =>
                            $booking->court?->name,

                        'amount' =>
                            (float) (
                                $booking->total_amount
                                ?? $booking->amount
                                ?? 0
                            ),

                        'cancellation_reason' =>
                            $booking->cancellation_reason
                            ?? $booking->cancel_reason
                            ?? null,

                        'cancelled_at' =>
                            $booking->cancelled_at
                            ?? null,
                    ];
                })
                ->values(),
        ];
    }

    /**
     * Rescheduling report.
     */
    private function rescheduling(Request $request): array
    {
        if (!class_exists(
            \App\Models\BookingReschedule::class
        )) {
            return [
                'summary' => [
                    'total_reschedules' => 0,
                ],

                'rows' => [],

                'message' =>
                    'BookingReschedule model was not found.',
            ];
        }

        $model = \App\Models\BookingReschedule::class;

        $query = $model::query();

        $this->applyTimestampDateFilter(
            $query,
            $request,
            'created_at'
        );

        $items = $query
            ->with([
                'booking',
                'user:id,name,email',
            ])
            ->latest()
            ->get();

        return [
            'summary' => [
                'total_reschedules' =>
                    $items->count(),
            ],

            'rows' => $items
                ->map(function ($item) {
                    return [
                        'id' =>
                            $item->id,

                        'booking' =>
                            $item->booking?->booking_reference
                            ?? $item->booking_id,

                        'member' =>
                            $item->user?->name,

                        'old_date' =>
                            $item->old_booking_date
                            ?? $item->old_date
                            ?? null,

                        'old_time' =>
                            $item->old_start_time
                            ?? $item->old_time
                            ?? null,

                        'new_date' =>
                            $item->new_booking_date
                            ?? $item->new_date
                            ?? null,

                        'new_time' =>
                            $item->new_start_time
                            ?? $item->new_time
                            ?? null,

                        'reason' =>
                            $item->reason
                            ?? null,

                        'created_at' =>
                            $item->created_at,
                    ];
                })
                ->values(),
        ];
    }

    /**
     * No-show report.
     */
    private function noShow(Request $request): array
    {
        $query = Booking::query()
            ->where('status', 'no_show')
            ->with([
                'user:id,name,email',
                'court',
            ]);

        $this->applyDateFilter(
            $query,
            $request,
            'booking_date'
        );

        $items = $query
            ->latest('booking_date')
            ->get();

        return [
            'summary' => [
                'total_no_shows' =>
                    $items->count(),

                'total_minutes' =>
                    $items->sum(
                        fn ($booking) =>
                            (int) (
                                $booking->duration_minutes
                                ?? 0
                            )
                    ),
            ],

            'rows' => $items
                ->map(function ($booking) {
                    return [
                        'booking_reference' =>
                            $booking->booking_reference,

                        'date' =>
                            $booking->booking_date,

                        'start_time' =>
                            $booking->start_time,

                        'member' =>
                            $booking->user?->name,

                        'court' =>
                            $booking->court?->name,

                        'duration_minutes' =>
                            $booking->duration_minutes,

                        'players_count' =>
                            $booking->players_count,
                    ];
                })
                ->values(),
        ];
    }

    /**
     * Membership report.
     */
    private function membership(Request $request): array
    {
        if (!class_exists(
            \App\Models\Membership::class
        )) {
            return [
                'summary' => [
                    'total_memberships' => 0,
                ],

                'rows' => [],

                'message' =>
                    'Membership model was not found.',
            ];
        }

        $model = \App\Models\Membership::class;

        $query = $model::query();

        $this->applyTimestampDateFilter(
            $query,
            $request,
            'created_at'
        );

        if ($request->filled('status')) {
            $query->where(
                'status',
                $request->status
            );
        }

        $memberships = $query
            ->with([
                'user:id,name,email',
                'membershipType',
            ])
            ->latest()
            ->get();

        $rows = $memberships->map(function ($membership) {
            return [
                'id' =>
                    $membership->id,

                'member' =>
                    $membership->user?->name,

                'email' =>
                    $membership->user?->email,

                'type' =>
                    $membership->membershipType?->name,

                'status' =>
                    $membership->status,

                'start_date' =>
                    $membership->start_date,

                'expiration_date' =>
                    $membership->expiration_date,

                'created_at' =>
                    $membership->created_at,
            ];
        });

        return [
            'summary' => [
                'total_memberships' =>
                    $rows->count(),

                'active' =>
                    $rows->where('status', 'active')->count(),

                'pending' =>
                    $rows->where('status', 'pending')->count(),

                'expired' =>
                    $rows->where('status', 'expired')->count(),

                'suspended' =>
                    $rows->where('status', 'suspended')->count(),

                'cancelled' =>
                    $rows->where('status', 'cancelled')->count(),
            ],

            'rows' => $rows->values(),
        ];
    }

    /**
     * Waitlist report.
     */
    private function waitlist(Request $request): array
    {
        $model = null;

        if (class_exists(
            \App\Models\WaitlistEntry::class
        )) {
            $model =
                \App\Models\WaitlistEntry::class;
        } elseif (class_exists(
            \App\Models\Waitlist::class
        )) {
            $model =
                \App\Models\Waitlist::class;
        }

        if (!$model) {
            return [
                'summary' => [
                    'total_entries' => 0,
                ],

                'rows' => [],

                'message' =>
                    'Waitlist model was not found.',
            ];
        }

        $query = $model::query();

        $this->applyTimestampDateFilter(
            $query,
            $request,
            'created_at'
        );

        $items = $query
            ->latest()
            ->get();

        return [
            'summary' => [
                'total_entries' =>
                    $items->count(),

                'waiting' =>
                    $items
                        ->whereIn(
                            'status',
                            ['waiting', 'pending']
                        )
                        ->count(),

                'promoted' =>
                    $items
                        ->whereIn(
                            'status',
                            ['promoted', 'assigned']
                        )
                        ->count(),

                'cancelled' =>
                    $items
                        ->where('status', 'cancelled')
                        ->count(),

                'expired' =>
                    $items
                        ->where('status', 'expired')
                        ->count(),
            ],

            'rows' => $items
                ->map(function ($item) {
                    return [
                        'id' =>
                            $item->id,

                        'booking' =>
                            $item->booking_id
                            ?? null,

                        'user' =>
                            $item->user?->name
                            ?? $item->member?->name
                            ?? null,

                        'position' =>
                            $item->position
                            ?? null,

                        'status' =>
                            $item->status,

                        'claim_expires_at' =>
                            $item->claim_expires_at
                            ?? null,

                        'created_at' =>
                            $item->created_at,
                    ];
                })
                ->values(),
        ];
    }

    /**
     * Failed transaction report.
     */
    private function failedTransaction(Request $request): array
    {
        $rows = collect();

        if (class_exists(
            \App\Models\FailureException::class
        )) {
            $failures = FailureException::query()
                ->with([
                    'user:id,name,email',
                    'booking',
                    'court',
                ])
                ->whereIn(
                    'failure_type',
                    [
                        'payment',
                        'payment_gateway_timeout',
                        'refund',
                    ]
                );

            $this->applyTimestampDateFilter(
                $failures,
                $request,
                'failed_at'
            );

            $rows = $failures
                ->latest('failed_at')
                ->get()
                ->map(function ($failure) {
                    return [
                        'id' =>
                            $failure->id,

                        'type' =>
                            $failure->failure_type,

                        'stage' =>
                            $failure->failure_stage,

                        'booking' =>
                            $failure->booking?->booking_reference
                            ?? $failure->booking_id,

                        'member' =>
                            $failure->user?->name,

                        'court' =>
                            $failure->court?->name,

                        'reason' =>
                            $failure->reason,

                        'error_code' =>
                            $failure->error_code,

                        'gateway' =>
                            $failure->gateway,

                        'status' =>
                            $failure->status,

                        'failed_at' =>
                            $failure->failed_at,
                    ];
                });
        }

        return [
            'summary' => [
                'total_failed_transactions' =>
                    $rows->count(),

                'payment_failures' =>
                    $rows
                        ->where('type', 'payment')
                        ->count(),

                'gateway_timeouts' =>
                    $rows
                        ->where(
                            'type',
                            'payment_gateway_timeout'
                        )
                        ->count(),

                'refund_failures' =>
                    $rows
                        ->where('type', 'refund')
                        ->count(),
            ],

            'rows' =>
                $rows->values(),
        ];
    }

    /**
     * Booking activity/history report.
     */
    private function bookingActivity(Request $request): array
    {
        $query = Booking::query()
            ->with([
                'user:id,name,email',
                'court',
            ]);

        $this->applyTimestampDateFilter(
            $query,
            $request,
            'created_at'
        );

        if ($request->filled('status')) {
            $query->where(
                'status',
                $request->status
            );
        }

        $bookings = $query
            ->latest('created_at')
            ->get();

        return [
            'summary' => [
                'total_activity' =>
                    $bookings->count(),

                'confirmed' =>
                    $bookings
                        ->where('status', 'confirmed')
                        ->count(),

                'pending' =>
                    $bookings
                        ->where('status', 'pending')
                        ->count(),

                'cancelled' =>
                    $bookings
                        ->where('status', 'cancelled')
                        ->count(),

                'completed' =>
                    $bookings
                        ->where('status', 'completed')
                        ->count(),

                'failed' =>
                    $bookings
                        ->where('status', 'failed')
                        ->count(),
            ],

            'rows' => $bookings
                ->map(function ($booking) {
                    return [
                        'id' =>
                            $booking->id,

                        'booking_reference' =>
                            $booking->booking_reference,

                        'member' =>
                            $booking->user?->name,

                        'court' =>
                            $booking->court?->name,

                        'booking_date' =>
                            $booking->booking_date,

                        'start_time' =>
                            $booking->start_time,

                        'status' =>
                            $booking->status,

                        'amount' =>
                            (float) (
                                $booking->total_amount
                                ?? $booking->amount
                                ?? 0
                            ),

                        'created_at' =>
                            $booking->created_at,

                        'updated_at' =>
                            $booking->updated_at,
                    ];
                })
                ->values(),
        ];
    }

    /**
     * CSV export.
     */
    public function csv(Request $request)
    {
        $report = $request->get(
            'report',
            'daily_booking'
        );

        $response = $this->index($request);

        $payload = json_decode(
            $response->getContent(),
            true
        );

        $rows = $payload['data']['rows'] ?? [];

        $filename =
            $report .
            '-' .
            now()->format('Y-m-d-H-i-s') .
            '.csv';

        return response()->streamDownload(
            function () use ($rows) {
                $handle = fopen('php://output', 'w');

                if (empty($rows)) {
                    fputcsv($handle, ['No records found']);
                    fclose($handle);
                    return;
                }

                fputcsv(
                    $handle,
                    array_keys($rows[0])
                );

                foreach ($rows as $row) {
                    fputcsv(
                        $handle,
                        array_map(
                            function ($value) {
                                if (is_array($value)) {
                                    return json_encode(
                                        $value
                                    );
                                }

                                return $value;
                            },
                            array_values($row)
                        )
                    );
                }

                fclose($handle);
            },
            $filename,
            [
                'Content-Type' =>
                    'text/csv; charset=UTF-8',
            ]
        );
    }

    /**
     * PDF export.
     */
    public function pdf(Request $request)
    {
        $report = $request->get(
            'report',
            'daily_booking'
        );

        $response = $this->index($request);

        $payload = json_decode(
            $response->getContent(),
            true
        );

        $pdf = Pdf::loadView(
            'reports.pdf',
            [
                'report' => $report,
                'summary' =>
                    $payload['data']['summary'] ?? [],
                'rows' =>
                    $payload['data']['rows'] ?? [],
                'generatedAt' => now(),
            ]
        );

        $filename =
            $report .
            '-' .
            now()->format('Y-m-d-H-i-s') .
            '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Apply a date filter to a date column.
     */
    private function applyDateFilter(
        Builder $query,
        Request $request,
        string $column
    ): void {
        if ($request->filled('date_from')) {
            $query->whereDate(
                $column,
                '>=',
                $request->date_from
            );
        }

        if ($request->filled('date_to')) {
            $query->whereDate(
                $column,
                '<=',
                $request->date_to
            );
        }
    }

    /**
     * Apply a date filter to a timestamp column.
     */
    private function applyTimestampDateFilter(
        Builder $query,
        Request $request,
        string $column
    ): void {
        if ($request->filled('date_from')) {
            $query->whereDate(
                $column,
                '>=',
                $request->date_from
            );
        }

        if ($request->filled('date_to')) {
            $query->whereDate(
                $column,
                '<=',
                $request->date_to
            );
        }
    }
}