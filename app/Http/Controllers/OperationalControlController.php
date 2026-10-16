<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOperationalControlRequest;
use App\Models\Booking;
use App\Models\OperationalControl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OperationalControlController extends Controller
{
    /**
     * Display operational controls.
     */
    public function index(Request $request): JsonResponse
    {
        $query = OperationalControl::query()
            ->with([
                'court',
                'booking',
                'user',
                'authorizedBy',
            ])
            ->latest();

        if ($request->filled('control_type')) {
            $query->where(
                'control_type',
                $request->string('control_type')
            );
        }

        if ($request->filled('status')) {
            $query->where(
                'status',
                $request->string('status')
            );
        }

        if ($request->filled('court_id')) {
            $query->where(
                'court_id',
                $request->integer('court_id')
            );
        }

        if ($request->filled('booking_id')) {
            $query->where(
                'booking_id',
                $request->integer('booking_id')
            );
        }

        if ($request->filled('date')) {
            $query->whereDate(
                'starts_at',
                $request->date('date')
            );
        }

        return response()->json(
            $query->paginate(
                $request->integer('per_page', 20)
            )
        );
    }

    /**
     * Summary for dashboard.
     */
    public function summary(): JsonResponse
    {
        return response()->json([
            'total' => OperationalControl::count(),

            'active' => OperationalControl::where(
                'status',
                'active'
            )->count(),

            'court_blocks' => OperationalControl::whereIn(
                'control_type',
                [
                    'court_block',
                    'temporary_closure',
                    'maintenance',
                    'tournament_event',
                ]
            )->where('status', 'active')->count(),

            'manual_bookings' => OperationalControl::where(
                'control_type',
                'manual_booking'
            )->count(),

            'manual_cancellations' => OperationalControl::where(
                'control_type',
                'manual_cancellation'
            )->count(),

            'manual_reschedules' => OperationalControl::where(
                'control_type',
                'manual_reschedule'
            )->count(),

            'manual_refunds' => OperationalControl::where(
                'control_type',
                'manual_refund'
            )->count(),

            'rule_overrides' => OperationalControl::where(
                'control_type',
                'rule_override'
            )->count(),
        ]);
    }

    /**
     * Create operational control.
     */
    public function store(
        StoreOperationalControlRequest $request
    ): JsonResponse {
        $user = $request->user();

        $control = DB::transaction(function () use ($request, $user) {
            $data = $request->validated();

            $data['user_id'] = $user->id;
            $data['authorized_by'] = $user->id;
            $data['performed_at'] = now();

            if (!isset($data['status'])) {
                $data['status'] = 'active';
            }

            return OperationalControl::create($data);
        });

        return response()->json(
            $control->load([
                'court',
                'booking',
                'user',
                'authorizedBy',
            ]),
            201
        );
    }

    /**
     * Display one control.
     */
    public function show(
        OperationalControl $operationalControl
    ): JsonResponse {
        return response()->json(
            $operationalControl->load([
                'court',
                'booking',
                'user',
                'authorizedBy',
            ])
        );
    }

    /**
     * Update operational control.
     */
    public function update(
        StoreOperationalControlRequest $request,
        OperationalControl $operationalControl
    ): JsonResponse {
        $operationalControl->update(
            $request->validated()
        );

        return response()->json(
            $operationalControl->fresh()->load([
                'court',
                'booking',
                'user',
                'authorizedBy',
            ])
        );
    }

    /**
     * Cancel/disable an operational control.
     */
    public function destroy(
        OperationalControl $operationalControl
    ): JsonResponse {
        $operationalControl->update([
            'status' => 'cancelled',
            'metadata' => array_merge(
                $operationalControl->metadata ?? [],
                [
                    'cancelled_by' => auth()->id(),
                    'cancelled_at' => now()->toIso8601String(),
                ]
            ),
        ]);

        return response()->json([
            'message' => 'Operational control cancelled successfully.',
        ]);
    }

    /**
     * Manual booking.
     *
     * This creates an operational-control audit record.
     *
     * The actual booking should still go through your
     * existing Booking creation logic so pricing,
     * availability and booking rules remain centralized.
     */
    public function manualBooking(
        Request $request
    ): JsonResponse {
        abort_unless(
            $request->user()?->is_admin === true,
            403,
            'You are not authorized to create manual bookings.'
        );

        $validated = $request->validate([
            'booking_id' => [
                'required',
                'exists:bookings,id',
            ],

            'reason' => [
                'required',
                'string',
                'max:2000',
            ],

            'notes' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ]);

        $control = OperationalControl::create([
            'control_type' => 'manual_booking',
            'booking_id' => $validated['booking_id'],
            'user_id' => $request->user()->id,
            'authorized_by' => $request->user()->id,
            'status' => 'completed',
            'reason' => $validated['reason'],
            'notes' => $validated['notes'] ?? null,
            'performed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Manual booking operation recorded.',
            'data' => $control->load('booking'),
        ], 201);
    }

    /**
     * Manual cancellation.
     */
    public function manualCancellation(
        Request $request,
        Booking $booking
    ): JsonResponse {
        abort_unless(
            $request->user()?->is_admin === true,
            403,
            'You are not authorized to manually cancel bookings.'
        );

        $validated = $request->validate([
            'reason' => [
                'required',
                'string',
                'max:2000',
            ],

            'notes' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ]);

        DB::transaction(function () use (
            $request,
            $booking,
            $validated
        ) {
            /*
             * Adjust this status value if your Booking model
             * uses a different status vocabulary.
             */
            $booking->update([
                'status' => 'cancelled',
            ]);

            OperationalControl::create([
                'control_type' => 'manual_cancellation',
                'booking_id' => $booking->id,
                'user_id' => $request->user()->id,
                'authorized_by' => $request->user()->id,
                'status' => 'completed',
                'reason' => $validated['reason'],
                'notes' => $validated['notes'] ?? null,
                'performed_at' => now(),
            ]);
        });

        return response()->json([
            'message' => 'Booking manually cancelled.',
        ]);
    }

    /**
     * Manual rescheduling.
     */
    public function manualReschedule(
        Request $request,
        Booking $booking
    ): JsonResponse {
        abort_unless(
            $request->user()?->is_admin === true,
            403,
            'You are not authorized to manually reschedule bookings.'
        );

        $validated = $request->validate([
            'new_booking_date' => [
                'required',
                'date',
            ],

            'new_start_time' => [
                'required',
                'date_format:H:i',
            ],

            'new_duration_minutes' => [
                'nullable',
                'integer',
                'min:30',
            ],

            'reason' => [
                'required',
                'string',
                'max:2000',
            ],

            'notes' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ]);

        DB::transaction(function () use (
            $request,
            $booking,
            $validated
        ) {
            /*
             * Adjust column names here if your booking table
             * uses different names.
             */
            $booking->update([
                'booking_date' => $validated['new_booking_date'],
                'start_time' => $validated['new_start_time'],
                'duration_minutes' => $validated['new_duration_minutes']
                    ?? $booking->duration_minutes,
            ]);

            OperationalControl::create([
                'control_type' => 'manual_reschedule',
                'booking_id' => $booking->id,
                'court_id' => $booking->court_id,
                'user_id' => $request->user()->id,
                'authorized_by' => $request->user()->id,
                'status' => 'completed',

                'new_booking_date' => $validated['new_booking_date'],
                'new_start_time' => $validated['new_start_time'],
                'new_duration_minutes' =>
                    $validated['new_duration_minutes']
                    ?? $booking->duration_minutes,

                'reason' => $validated['reason'],
                'notes' => $validated['notes'] ?? null,
                'performed_at' => now(),
            ]);
        });

        return response()->json([
            'message' => 'Booking manually rescheduled.',
            'booking' => $booking->fresh(),
        ]);
    }

    /**
     * Manual refund authorization.
     *
     * This records the authorized refund operation.
     * Your existing payment/refund implementation should
     * perform the actual gateway refund.
     */
    public function manualRefund(
        Request $request,
        Booking $booking
    ): JsonResponse {
        abort_unless(
            $request->user()?->is_admin === true,
            403,
            'You are not authorized to issue manual refunds.'
        );

        $validated = $request->validate([
            'refund_amount' => [
                'required',
                'numeric',
                'min:0.01',
            ],

            'refund_reference' => [
                'nullable',
                'string',
                'max:255',
            ],

            'reason' => [
                'required',
                'string',
                'max:2000',
            ],

            'notes' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ]);

        $control = OperationalControl::create([
            'control_type' => 'manual_refund',
            'booking_id' => $booking->id,
            'court_id' => $booking->court_id,
            'user_id' => $request->user()->id,
            'authorized_by' => $request->user()->id,
            'status' => 'completed',

            'refund_amount' => $validated['refund_amount'],
            'refund_reference' =>
                $validated['refund_reference'] ?? null,

            'reason' => $validated['reason'],
            'notes' => $validated['notes'] ?? null,
            'performed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Manual refund authorization recorded.',
            'data' => $control,
        ], 201);
    }

    /**
     * Rule override.
     */
    public function overrideRules(
        Request $request
    ): JsonResponse {
        abort_unless(
            $request->user()?->is_admin === true,
            403,
            'You are not authorized to override booking rules.'
        );

        $validated = $request->validate([
            'booking_id' => [
                'nullable',
                'exists:bookings,id',
            ],

            'court_id' => [
                'nullable',
                'exists:courts,id',
            ],

            'override_rules' => [
                'required',
                'array',
            ],

            'reason' => [
                'required',
                'string',
                'max:2000',
            ],

            'notes' => [
                'nullable',
                'string',
                'max:5000',
            ],

            'starts_at' => [
                'nullable',
                'date',
            ],

            'ends_at' => [
                'nullable',
                'date',
                'after_or_equal:starts_at',
            ],
        ]);

        $control = OperationalControl::create([
            'control_type' => 'rule_override',
            'booking_id' => $validated['booking_id'] ?? null,
            'court_id' => $validated['court_id'] ?? null,
            'user_id' => $request->user()->id,
            'authorized_by' => $request->user()->id,
            'status' => 'active',

            'override_rules' =>
                $validated['override_rules'],

            'starts_at' =>
                $validated['starts_at'] ?? null,

            'ends_at' =>
                $validated['ends_at'] ?? null,

            'reason' => $validated['reason'],
            'notes' => $validated['notes'] ?? null,
            'performed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Booking rule override created.',
            'data' => $control,
        ], 201);
    }
}