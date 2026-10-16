<?php

namespace App\Http\Controllers;

use App\Models\FailureException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class FailureExceptionController extends Controller
{
    /**
     * List failures.
     */
    public function index(Request $request): JsonResponse
    {
        $query = FailureException::query()
            ->with([
                'booking',
                'user:id,name,email',
                'court',
                'resolver:id,name',
            ])
            ->latest('failed_at');

        if ($request->filled('failure_type')) {
            $query->where(
                'failure_type',
                $request->string('failure_type')
            );
        }

        if ($request->filled('failure_stage')) {
            $query->where(
                'failure_stage',
                $request->string('failure_stage')
            );
        }

        if ($request->filled('status')) {
            $query->where(
                'status',
                $request->string('status')
            );
        }

        if ($request->filled('is_recoverable')) {
            $query->where(
                'is_recoverable',
                filter_var(
                    $request->is_recoverable,
                    FILTER_VALIDATE_BOOLEAN
                )
            );
        }

        if ($request->filled('booking_id')) {
            $query->where(
                'booking_id',
                $request->booking_id
            );
        }

        if ($request->filled('court_id')) {
            $query->where(
                'court_id',
                $request->court_id
            );
        }

        if ($request->filled('user_id')) {
            $query->where(
                'user_id',
                $request->user_id
            );
        }

        if ($request->filled('date_from')) {
            $query->whereDate(
                'failed_at',
                '>=',
                $request->date_from
            );
        }

        if ($request->filled('date_to')) {
            $query->whereDate(
                'failed_at',
                '<=',
                $request->date_to
            );
        }

        if ($request->filled('search')) {
            $search = $request->string('search');

            $query->where(function ($q) use ($search) {
                $q->where('reason', 'like', "%{$search}%")
                    ->orWhere('reference', 'like', "%{$search}%")
                    ->orWhere('error_code', 'like', "%{$search}%")
                    ->orWhere('gateway_reference', 'like', "%{$search}%")
                    ->orWhereHas('booking', function ($bookingQuery) use ($search) {
                        $bookingQuery->where(
                            'booking_reference',
                            'like',
                            "%{$search}%"
                        );
                    })
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $perPage = min(
            max((int) $request->get('per_page', 20), 1),
            100
        );

        return response()->json(
            $query->paginate($perPage)
        );
    }

    /**
     * Summary dashboard.
     */
    public function summary(Request $request): JsonResponse
    {
        $query = FailureException::query();

        if ($request->filled('date_from')) {
            $query->whereDate(
                'failed_at',
                '>=',
                $request->date_from
            );
        }

        if ($request->filled('date_to')) {
            $query->whereDate(
                'failed_at',
                '<=',
                $request->date_to
            );
        }

        return response()->json([
            'total' => (clone $query)->count(),

            'open' => (clone $query)
                ->where('status', 'open')
                ->count(),

            'retrying' => (clone $query)
                ->where('status', 'retrying')
                ->count(),

            'resolved' => (clone $query)
                ->where('status', 'resolved')
                ->count(),

            'ignored' => (clone $query)
                ->where('status', 'ignored')
                ->count(),

            'recoverable' => (clone $query)
                ->where('is_recoverable', true)
                ->whereIn('status', ['open', 'failed'])
                ->count(),

            'failed_bookings' => (clone $query)
                ->where('failure_type', 'booking')
                ->count(),

            'failed_payments' => (clone $query)
                ->where('failure_type', 'payment')
                ->count(),

            'gateway_timeouts' => (clone $query)
                ->where('failure_type', 'payment_gateway_timeout')
                ->count(),

            'refund_failures' => (clone $query)
                ->where('failure_type', 'refund')
                ->count(),

            'notification_failures' => (clone $query)
                ->where('failure_type', 'notification')
                ->count(),

            'waitlist_failures' => (clone $query)
                ->where('failure_type', 'waitlist_assignment')
                ->count(),

            'by_type' => (clone $query)
                ->selectRaw('failure_type, COUNT(*) as total')
                ->groupBy('failure_type')
                ->orderByDesc('total')
                ->get(),

            'by_status' => (clone $query)
                ->selectRaw('status, COUNT(*) as total')
                ->groupBy('status')
                ->orderByDesc('total')
                ->get(),
        ]);
    }

    /**
     * Store a failure.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'failure_type' => [
                'required',
                'string',
                'in:booking,payment,payment_gateway_timeout,refund,notification,waitlist_assignment',
            ],

            'failure_stage' => [
                'nullable',
                'string',
                'max:100',
            ],

            'booking_id' => [
                'nullable',
                'integer',
                'exists:bookings,id',
            ],

            'user_id' => [
                'nullable',
                'integer',
                'exists:users,id',
            ],

            'court_id' => [
                'nullable',
                'integer',
                'exists:courts,id',
            ],

            'reference' => [
                'nullable',
                'string',
                'max:255',
            ],

            'reason' => [
                'required',
                'string',
            ],

            'technical_details' => [
                'nullable',
                'string',
            ],

            'error_code' => [
                'nullable',
                'string',
                'max:100',
            ],

            'gateway' => [
                'nullable',
                'string',
                'max:100',
            ],

            'gateway_reference' => [
                'nullable',
                'string',
                'max:255',
            ],

            'failure_date' => [
                'nullable',
                'date',
            ],

            'failure_time' => [
                'nullable',
                'date_format:H:i',
            ],

            'failed_at' => [
                'nullable',
                'date',
            ],

            'is_recoverable' => [
                'boolean',
            ],

            'max_retries' => [
                'nullable',
                'integer',
                'min:0',
                'max:100',
            ],

            'context' => [
                'nullable',
                'array',
            ],
        ]);

        $validated['status'] = 'open';

        if (!isset($validated['failed_at'])) {
            $validated['failed_at'] = now();
        }

        if (!isset($validated['failure_date'])) {
            $validated['failure_date'] = Carbon::parse(
                $validated['failed_at']
            )->toDateString();
        }

        if (!isset($validated['failure_time'])) {
            $validated['failure_time'] = Carbon::parse(
                $validated['failed_at']
            )->format('H:i');
        }

        $failure = FailureException::create($validated);

        return response()->json([
            'message' => 'Failure recorded successfully.',
            'data' => $failure->load([
                'booking',
                'user:id,name,email',
                'court',
            ]),
        ], 201);
    }

    /**
     * Show one failure.
     */
    public function show(FailureException $failureException): JsonResponse
    {
        return response()->json(
            $failureException->load([
                'booking',
                'user:id,name,email',
                'court',
                'resolver:id,name',
            ])
        );
    }

    /**
     * Retry a failure.
     */
    public function retry(
        FailureException $failureException
    ): JsonResponse {
        if (!$failureException->is_recoverable) {
            return response()->json([
                'message' => 'This failure is not marked as recoverable.',
            ], 422);
        }

        if ($failureException->retry_count >= $failureException->max_retries) {
            return response()->json([
                'message' => 'Maximum retry attempts have been reached.',
            ], 422);
        }

        if ($failureException->status === 'resolved') {
            return response()->json([
                'message' => 'This failure has already been resolved.',
            ], 422);
        }

        $failureException->update([
            'status' => 'retrying',
            'retry_count' => $failureException->retry_count + 1,
            'last_retry_at' => now(),
        ]);

        /*
         * The actual retry operation can later be connected
         * to your booking/payment/notification/waitlist jobs.
         *
         * For now, this records the retry attempt.
         */

        return response()->json([
            'message' => 'Retry attempt recorded.',
            'data' => $failureException->fresh()->load([
                'booking',
                'user:id,name,email',
                'court',
            ]),
        ]);
    }

    /**
     * Resolve a failure.
     */
    public function resolve(
        Request $request,
        FailureException $failureException
    ): JsonResponse {
        $validated = $request->validate([
            'resolution_notes' => [
                'required',
                'string',
                'max:5000',
            ],
        ]);

        $failureException->update([
            'status' => 'resolved',
            'resolved_at' => now(),
            'resolved_by' => $request->user()?->id,
            'resolution_notes' => $validated['resolution_notes'],
        ]);

        return response()->json([
            'message' => 'Failure resolved successfully.',
            'data' => $failureException->fresh()->load([
                'booking',
                'user:id,name,email',
                'court',
                'resolver:id,name',
            ]),
        ]);
    }

    /**
     * Ignore a failure.
     */
    public function ignore(
        Request $request,
        FailureException $failureException
    ): JsonResponse {
        $validated = $request->validate([
            'resolution_notes' => [
                'required',
                'string',
                'max:5000',
            ],
        ]);

        $failureException->update([
            'status' => 'ignored',
            'resolved_at' => now(),
            'resolved_by' => $request->user()?->id,
            'resolution_notes' => $validated['resolution_notes'],
        ]);

        return response()->json([
            'message' => 'Failure ignored successfully.',
            'data' => $failureException->fresh(),
        ]);
    }

    /**
     * Reopen a resolved/ignored failure.
     */
    public function reopen(
        FailureException $failureException
    ): JsonResponse {
        $failureException->update([
            'status' => 'open',
            'resolved_at' => null,
            'resolved_by' => null,
            'resolution_notes' => null,
        ]);

        return response()->json([
            'message' => 'Failure reopened successfully.',
            'data' => $failureException->fresh(),
        ]);
    }

    /**
     * Delete a failure record.
     */
    public function destroy(
        FailureException $failureException
    ): JsonResponse {
        $failureException->delete();

        return response()->json([
            'message' => 'Failure record deleted successfully.',
        ]);
    }
}