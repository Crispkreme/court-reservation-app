<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingReschedule;
use App\Models\BookingRule;
use App\Models\Court;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

use App\Http\Requests\LookupBookingRequest;
use App\Http\Requests\PreviewBookingRescheduleRequest;
use App\Http\Requests\StoreBookingRescheduleRequest;

class BookingRescheduleController extends Controller
{
    /**
     * Look up a booking using booking reference and customer email.
     *
     * This endpoint is intended for public customer rescheduling.
     */
    public function lookup(LookupBookingRequest $request): JsonResponse {
        $validated = $request->validated();

        $booking = Booking::query()
            ->with([
                'court',
                'sportCategory',
                'reschedules',
            ])
            ->where('booking_reference',$validated['booking_reference'])
            ->whereRaw('LOWER(customer_email) = ?', [strtolower($validated['customer_email']),])
            ->first();

        /*
        * Do not reveal booking information when the
        * reference and customer email do not match.
        */
        if (!$booking) {
            return response()->json([
                'message' => 'No booking was found with the provided booking reference and email address.',
            ], 404);
        }

        /*
        * Cancelled and failed bookings cannot be
        * rescheduled.
        */
        if (in_array(
            strtoupper((string) $booking->status),
            [
                'CANCELLED',
                'FAILED',
            ],
            true
        )) {
            return response()->json([
                'message' => 'This booking cannot be rescheduled because it is no longer active.',
            ], 422);
        }

        /*
        * Load the current booking rules.
        */
        $rules = BookingRule::query()->first();

        /*
        * Check whether rescheduling is globally enabled.
        */
        if (!$rules || !$rules->rescheduling_enabled) {
            return response()->json([
                'message' => 'Rescheduling is currently disabled.',
            ], 422);
        }

        /*
        * Check whether customers are allowed
        * to reschedule their own bookings.
        */
        if (!$rules->customer_rescheduling_enabled) {
            return response()->json([
                'message' => 'Customer rescheduling is not permitted.',
            ], 422);
        }

        /*
        * Calculate the booking datetime.
        */
        $bookingDateTime = Carbon::parse(
            $booking->booking_date
            . ' '
            . $booking->start_time
        );

        /*
        * Calculate the rescheduling cutoff.
        */
        $cutoff = $bookingDateTime->copy()
            ->subHours($rules->rescheduling_cutoff_hours);

        /*
        * Check whether the cutoff has already passed.
        */
        if (now()->greaterThanOrEqualTo($cutoff)) {
            return response()->json([
                'message' =>
                    'This booking can no longer be rescheduled. '
                    . 'Rescheduling must be completed at least '
                    . $rules->rescheduling_cutoff_hours
                    . ' hours before the booking.',
            ], 422);
        }

        return response()->json([
            'data' => [
                'booking' => $booking,
                'rescheduling' => [
                    'allowed' => true,
                    'cutoff_hours' => $rules->rescheduling_cutoff_hours,
                    'cutoff_at' => $cutoff->toDateTimeString(),
                ],
            ],
        ]);
    }

    /**
     * Show available rescheduling information.
     */
    public function show(Booking $booking): JsonResponse
    {
        $booking->load([
            'court',
            'sportCategory',
            'reschedules',
        ]);

        return response()->json([
            'data' => [
                'booking' => $booking,
                'reschedules' => $booking->reschedules,
            ],
        ]);
    }

    /**
     * Calculate price difference and validate availability.
     */
    public function preview(
        PreviewBookingRescheduleRequest $request,
        Booking $booking
    ): JsonResponse {
        $validated = $request->validated();

        /*
        * Verify that the current user is allowed
        * to reschedule this booking.
        */
        $this->authorizeRescheduling(
            $request,
            $booking
        );

        /*
        * Verify that the rescheduling cutoff
        * has not already passed.
        */
        $this->validateCutoff($booking);

        /*
        * Verify that the selected court exists.
        */
        $court = Court::findOrFail($validated['court_id']);

        /*
        * Validate that the requested start/end
        * times form a valid time range.
        */
        $this->validateTimeRange($validated['start_time'],$validated['end_time']);

        /*
        * Check whether the requested court/date/time
        * is available.
        */
        $this->validateAvailability(
            $booking,
            $court,
            $validated['booking_date'],
            $validated['start_time'],
            $validated['end_time']
        );

        /*
        * Calculate the price of the new booking slot.
        */
        $newPrice = $this->calculatePrice(
            $booking,
            $court,
            $validated['booking_date'],
            $validated['start_time'],
            $validated['end_time']
        );

        /*
        * Get the current booking price.
        */
        $originalPrice = (float) $booking->total_amount;

        /*
        * Calculate the price difference.
        */
        $difference = round($newPrice - $originalPrice, 2);

        /*
        * Determine whether the customer needs
        * to pay more, receive a refund, or has
        * no price adjustment.
        */
        $adjustmentType = match (true) {
            $difference > 0 => 'additional_payment',
            $difference < 0 => 'refund',
            default => 'none',
        };

        return response()->json([
            'data' => [
                'available' => true,
                'original_price' => $originalPrice,
                'new_price' => $newPrice,
                'price_difference' => abs($difference),
                'price_adjustment_type' => $adjustmentType,
                'payment_required' => $difference > 0,
                'refund_required' => $difference < 0,
            ],
        ]);
    }

    /**
     * Reschedule a booking.
     */
    public function store(
        StoreBookingRescheduleRequest $request,
        Booking $booking
    ): JsonResponse {
        $validated = $request->validated();

        /*
        * Verify that the current user is allowed
        * to reschedule this booking.
        */
        $this->authorizeRescheduling($request,$booking);

        /*
        * Verify that the rescheduling cutoff
        * has not already passed.
        */
        $this->validateCutoff($booking);

        /*
        * Verify that the selected court exists.
        */
        $court = Court::findOrFail($validated['court_id']);

        /*
        * Validate the requested time range.
        */
        $this->validateTimeRange($validated['start_time'],$validated['end_time']);

        /*
        * Verify that the requested court/date/time
        * is still available.
        */
        $this->validateAvailability(
            $booking,
            $court,
            $validated['booking_date'],
            $validated['start_time'],
            $validated['end_time']
        );

        /*
        * Calculate the price for the new booking slot.
        */
        $newPrice = $this->calculatePrice(
            $booking,
            $court,
            $validated['booking_date'],
            $validated['start_time'],
            $validated['end_time']
        );

        /*
        * Get the current booking price.
        */
        $originalPrice = (float) $booking->total_amount;

        /*
        * Calculate the price difference.
        */
        $difference = round($newPrice - $originalPrice,2);

        /*
        * Determine the required price adjustment.
        */
        $adjustmentType = match (true) {
            $difference > 0 => 'additional_payment',
            $difference < 0 => 'refund',
            default => 'none',
        };

        /*
        * Payment/refund starts as pending when
        * there is a price adjustment.
        */
        $paymentStatus = match ($adjustmentType) {
            'additional_payment' => 'pending',
            'refund' => 'pending',
            default => 'not_required',
        };

        $reschedule = DB::transaction(
            function () use (
                $request,
                $booking,
                $validated,
                $court,
                $originalPrice,
                $newPrice,
                $difference,
                $adjustmentType,
                $paymentStatus
            ) {
                /*
                * Get the authenticated user.
                */
                $user = $request->user();
                $requestedBy = $user?->id;

                /*
                * Determine whether this reschedule
                * was requested by a customer or administrator.
                */
                $requestedByType =
                    $user && $user->is_admin
                        ? 'administrator'
                        : 'customer';

                /*
                * Preserve the original booking information
                * in the reschedule history.
                */
                $reschedule = BookingReschedule::create([
                    'booking_id' => $booking->id,
                    'requested_by' => $requestedBy,
                    'requested_by_type' => $requestedByType,
                    'original_booking_date' => $booking->booking_date,
                    'original_start_time' => $booking->start_time,
                    'original_end_time' => $booking->end_time,
                    'original_court_id' => $booking->court_id,
                    'new_booking_date' => $validated['booking_date'],
                    'new_start_time' => $validated['start_time'],
                    'new_end_time' => $validated['end_time'],
                    'new_court_id' => $court->id,
                    'original_price' => $originalPrice,
                    'new_price' => $newPrice,
                    'price_difference' => abs($difference),
                    'price_adjustment_type' => $adjustmentType,
                    'payment_status' => $paymentStatus,
                    'reason' => $validated['reason'] ?? null,
                    'status' => 'completed',
                ]);

                /*
                * Update the actual booking only after
                * the reschedule history has been recorded.
                */
                $booking->update([
                    'booking_date' => $validated['booking_date'],
                    'start_time' => $validated['start_time'],
                    'end_time' => $validated['end_time'],
                    'court_id' => $court->id,
                    'total_amount' => $newPrice,
                ]);

                return $reschedule;
            }
        );

        return response()->json([
            'message' => $adjustmentType === 'additional_payment'
                ? 'Booking rescheduled. Additional payment is required.'
                : (
                    $adjustmentType === 'refund'
                        ? 'Booking rescheduled. Refund is required.'
                        : 'Booking rescheduled successfully.'
                ),
            'data' => [
                'reschedule' =>
                    $reschedule->load([
                        'requester',
                        'originalCourt',
                        'newCourt',
                    ]),
                'payment_required' => $adjustmentType === 'additional_payment',
                'refund_required' => $adjustmentType === 'refund',
            ],
        ], 201);
    }

    /**
     * Get reschedule history.
     */
    public function history(Booking $booking): JsonResponse {
        $reschedules = $booking
            ->reschedules()
            ->with([
                'requester',
                'originalCourt',
                'newCourt',
            ])
            ->latest()
            ->get();

        return response()->json([
            'data' => $reschedules,
        ]);
    }

    /**
     * Authorize rescheduling.
     *
     * IMPORTANT:
     * Authenticated administrators can reschedule directly.
     *
     * Public customers are handled separately through
     * the booking lookup flow.
     */
    private function authorizeRescheduling(
        StoreBookingRescheduleRequest|PreviewBookingRescheduleRequest $request,
        Booking $booking
    ): void {
        $user = $request->user();

        /*
        * Administrator.
        *
        * Administrators can reschedule any booking,
        * so no additional customer ownership checks are required.
        */
        if ($user && $user->is_admin) {
            return;
        }

        /*
        * Public customer requests need to be authorized
        * through the customer booking lookup flow.
        *
        * Do not allow an unauthenticated request to directly
        * manipulate a booking by ID.
        */
        if (!$user) {
            abort(403, 'Please verify your booking before rescheduling.');
        }

        /*
        * Authenticated customer.
        *
        * The customer must own the booking.
        */
        if (!$booking->user_id || $booking->user_id !== $user->id) {
            abort(403, 'You are not allowed to reschedule this booking.');
        }

        /*
        * Load the global booking rules.
        */
        $rules = BookingRule::query()->first();

        /*
        * Rescheduling must be globally enabled.
        */
        if (!$rules || !$rules->rescheduling_enabled) {
            abort(422, 'Rescheduling is currently disabled.');
        }

        /*
        * Customers must also be explicitly allowed
        * to reschedule their own bookings.
        */
        if (!$rules->customer_rescheduling_enabled) {
            abort(422, 'Customer rescheduling is not permitted.');
        }
    }

    /**
     * Validate rescheduling cutoff.
     */
    private function validateCutoff(Booking $booking): void {
        $rules = BookingRule::query()->first();

        if (!$rules) {
            return;
        }

        $bookingDateTime = Carbon::parse(
            $booking->booking_date .
            ' ' .
            $booking->start_time
        );

        $cutoff = $bookingDateTime
            ->copy()
            ->subHours($rules->rescheduling_cutoff_hours);

        if (
            now()->greaterThanOrEqualTo($cutoff)
        ) {
            abort(
                422,
                'Rescheduling is no longer permitted. ' .
                'The cutoff is ' .
                $rules->rescheduling_cutoff_hours .
                ' hours before the booking.'
            );
        }
    }

    /**
     * Validate time range.
     */
    private function validateTimeRange(
        string $startTime,
        string $endTime
    ): void {
        if ($endTime <= $startTime) {
            abort(422, 'The ending time must be later than the starting time.');
        }
    }

    /**
     * Validate court availability.
     */
    private function validateAvailability(
        Booking $booking,
        Court $court,
        string $date,
        string $startTime,
        string $endTime
    ): void {
        $conflict = Booking::query()
            ->where('court_id',$court->id)
            ->where('booking_date',$date)
            ->whereNotIn(
                'status',
                [
                    'CANCELLED',
                    'FAILED',
                ]
            )
            ->where('id','!=',$booking->id)
            ->where(
                function ($query) use (
                    $startTime,
                    $endTime
                ) {
                    $query
                        ->where('start_time','<',$endTime)
                        ->where('end_time','>',$startTime);
                }
            )
            ->exists();

        if ($conflict) {
            abort(422, 'The selected court and time are no longer available.');
        }
    }

    /**
     * Calculate booking price.
     *
     * Replace this with the application's actual
     * booking pricing engine when available.
     */
    private function calculatePrice(
        Booking $booking,
        Court $court,
        string $date,
        string $startTime,
        string $endTime
    ): float {
        $start = Carbon::createFromFormat('H:i',$startTime);
        $end = Carbon::createFromFormat('H:i',$endTime);
        $minutes = $start->diffInMinutes($end);
        $hourlyRate = (float) ($court->hourly_rate ?? 0);

        /*
         * If the court does not have an hourly rate,
         * keep the original booking price.
         */
        if ($hourlyRate <= 0) {
            return (float) $booking->total_amount;
        }

        return round(($minutes / 60) * $hourlyRate, 2);
    }
}