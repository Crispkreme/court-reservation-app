<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingCancellation;
use App\Models\CancellationPolicy;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

use App\Http\Requests\StoreCancellationRequest;
use App\Http\Requests\CancellationPreviewRequest;

class BookingCancellationController extends Controller
{
    public function preview(
        CancellationPreviewRequest $request,
        Booking $booking
    ): JsonResponse {
        if ($booking->cancellation) {
            return response()->json([
                'message' => 'This booking has already been cancelled.',
            ], 422);
        }

        $type = $request->cancellationType();

        return response()->json(
            $this->calculateRefund(
                $booking,
                $type
            )
        );
    }

    public function store(
    StoreCancellationRequest $request,
    Booking $booking
    ): JsonResponse {

        $user = $request->user();
        $validated = $request->validated();

        if ($booking->cancellation) {
            throw ValidationException::withMessages([
                'booking' => [
                    'This booking has already been cancelled.',
                ],
            ]);
        }

        if ($booking->status === 'CANCELLED') {
            throw ValidationException::withMessages([
                'booking' => [
                    'This booking is already cancelled.',
                ],
            ]);
        }

        $refund = $this->calculateRefund(
            $booking,
            $validated['cancellation_type']
        );

        $cancellation = DB::transaction(
            function () use (
                $booking,
                $user,
                $validated,
                $refund
            ) {
                $cancellation = BookingCancellation::create([
                    'booking_id' => $booking->id,
                    'cancellation_policy_id' => $refund['policy_id'],
                    'user_id' => $user->id,
                    'cancellation_type' => $validated['cancellation_type'],
                    'cancellation_reason' => $validated['cancellation_reason'] ?? null,
                    'cancelled_at' => now(),

                    'hours_before_booking' => $refund['hours_before_booking'],
                    'booking_amount' => $refund['booking_amount'],
                    'refund_percentage' => $refund['refund_percentage'],
                    'eligible_refund_amount' => $refund['eligible_refund_amount'],
                    'refund_status' => $refund['eligible_refund_amount'] > 0 ? 'PENDING' : 'NOT_APPLICABLE',
                ]);

                $booking->update([
                    'status' => 'CANCELLED',
                ]);

                return $cancellation;
            }
        );

        return response()->json([
            'message' => 'Booking cancelled successfully.',
            'data' => $cancellation->load('cancellationPolicy'),
        ], 201);
    }

    protected function calculateRefund(
        Booking $booking,
        string $cancellationType
    ): array {
        $bookingStart = $this->getBookingStart($booking);

        $hoursBeforeBooking = max(
            0,
            now()->diffInMinutes(
                $bookingStart,
                false
            ) / 60
        );

        /*
         * Customer cancellations use the configured
         * cancellation policy.
         *
         * Court closures receive a full refund.
         *
         * Admin cancellations use the configured
         * admin policy if available.
         *
         * No-shows normally receive no refund.
         */
        $policy = CancellationPolicy::query()
            ->active()
            ->where(function ($query) use ($cancellationType) {
                $query
                    ->whereNull('cancellation_type')
                    ->orWhere(
                        'cancellation_type',
                        $cancellationType
                    );
            })
            ->where(
                'minimum_hours_before_booking',
                '<=',
                $hoursBeforeBooking
            )
            ->where(function ($query) use ($hoursBeforeBooking) {
                $query
                    ->whereNull('maximum_hours_before_booking')
                    ->orWhere(
                        'maximum_hours_before_booking',
                        '>',
                        $hoursBeforeBooking
                    );
            })
            ->orderByDesc('priority')
            ->orderByDesc('minimum_hours_before_booking')
            ->first();

        /*
         * Court closure is automatically refundable
         * unless an explicit court-closure policy exists.
         */
        if ($cancellationType === 'court_closure' && !$policy) {
            $refundPercentage = 100;
        } elseif ($cancellationType === 'no_show' && !$policy) {
            $refundPercentage = 0;
        } else {
            $refundPercentage = $policy?->refund_percentage ?? 0;
        }

        /*
         * IMPORTANT:
         * This assumes the bookings table has
         * a total_amount column.
         */
        $bookingAmount = (float) ($booking->total_amount ?? 0);
        $eligibleRefundAmount = round(
            $bookingAmount * ($refundPercentage / 100),
            2
        );

        return [
            'policy_id' => $policy?->id,
            'policy_name' => $policy?->name,
            'hours_before_booking' => round($hoursBeforeBooking, 2),
            'booking_amount' => $bookingAmount,
            'refund_percentage' => (float) $refundPercentage,
            'eligible_refund_amount' => $eligibleRefundAmount,
        ];
    }

    protected function getBookingStart(Booking $booking): Carbon {
        return Carbon::parse(
            $booking->booking_date
            . ' '
            . $booking->start_time
        );
    }
}