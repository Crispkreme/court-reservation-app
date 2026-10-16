<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingStatusHistory;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

use App\Http\Requests\IndexBookingStatusRequest;
use App\Http\Requests\UpdateBookingStatusRequest;

class BookingStatusController extends Controller
{
    public function index(IndexBookingStatusRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $query = Booking::query()
            ->with([
                'court',
                'sportCategory',
                'user',
            ])
            ->latest('booking_date')
            ->latest('start_time');

        $query->when(
            isset($validated['status']),
            fn ($query) => $query->where(
                'status',
                $validated['status']
            )
        );

        $query->when(
            isset($validated['date']),
            fn ($query) => $query->whereDate(
                'booking_date',
                $validated['date']
            )
        );

        $query->when(
            isset($validated['court_id']),
            fn ($query) => $query->where(
                'court_id',
                $validated['court_id']
            )
        );

        $bookings = $query->paginate(
            $validated['per_page'] ?? 20
        );

        return response()->json([
            'success' => true,
            'data' => $bookings,
        ]);
    }

    public function statuses(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => BookingStatusHistory::STATUSES,
        ]);
    }

    public function history(Booking $booking): JsonResponse {
        $booking->load([
            'court',
            'sportCategory',
            'user',
            'statusHistories.changedBy',
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'booking' => $booking,
                'history' => $booking->statusHistories,
            ],
        ]);
    }

    public function updateStatus(UpdateBookingStatusRequest $request, Booking $booking): JsonResponse {
        $validated = $request->validated();

        $newStatus = $validated['status'];
        $currentStatus = $booking->status;

        if ($currentStatus === $newStatus) {
            throw ValidationException::withMessages([
                'status' => 'The booking is already in this status.',
            ]);
        }

        $this->validateTransition($currentStatus,$newStatus);

        $result = DB::transaction(function () use (
            $booking,
            $validated,
            $currentStatus,
            $newStatus
        ) {
            $lockedBooking = Booking::query()
                ->whereKey($booking->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedBooking->status !== $currentStatus) {
                throw ValidationException::withMessages([
                    'status' => 'The booking status changed before this request was completed. Please refresh and try again.',
                ]);
            }

            $updateData = [
                'status' => $newStatus,
            ];

            if ($newStatus === BookingStatusHistory::STATUS_CONFIRMED) {
                $updateData['confirmed_at'] = now();
            }

            if ($newStatus === BookingStatusHistory::STATUS_CANCELLED) {
                $updateData['cancelled_at'] = now();
                $updateData['cancellation_reason'] = $validated['reason'] ?? null;
            }

            $lockedBooking->update($updateData);
            $history = BookingStatusHistory::create([
                'booking_id' => $lockedBooking->id,
                'from_status' => $currentStatus,
                'to_status' => $newStatus,
                'changed_by' => auth()->id(),
                'reason' => $validated['reason'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'metadata' => $validated['metadata'] ?? null,
                'changed_at' => now(),
            ]);

            return [
                'booking' => $lockedBooking->fresh([
                    'court',
                    'sportCategory',
                    'user',
                ]),
                'history' => $history,
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Booking status updated successfully.',
            'data' => $result,
        ]);
    }

    private function validateTransition(
        ?string $fromStatus,
        string $toStatus
    ): void {
        $transitions = [
            BookingStatusHistory::STATUS_DRAFT => [
                BookingStatusHistory::STATUS_PENDING_PAYMENT,
                BookingStatusHistory::STATUS_CANCELLED,
                BookingStatusHistory::STATUS_FAILED,
            ],
            BookingStatusHistory::STATUS_PENDING_PAYMENT => [
                BookingStatusHistory::STATUS_CONFIRMED,
                BookingStatusHistory::STATUS_CANCELLED,
                BookingStatusHistory::STATUS_EXPIRED,
                BookingStatusHistory::STATUS_FAILED,
            ],
            BookingStatusHistory::STATUS_CONFIRMED => [
                BookingStatusHistory::STATUS_CHECKED_IN,
                BookingStatusHistory::STATUS_CANCELLED,
                BookingStatusHistory::STATUS_RESCHEDULED,
                BookingStatusHistory::STATUS_NO_SHOW,
            ],
            BookingStatusHistory::STATUS_CHECKED_IN => [
                BookingStatusHistory::STATUS_IN_PROGRESS,
                BookingStatusHistory::STATUS_CANCELLED,
            ],
            BookingStatusHistory::STATUS_IN_PROGRESS => [
                BookingStatusHistory::STATUS_COMPLETED,
            ],
            BookingStatusHistory::STATUS_RESCHEDULED => [
                BookingStatusHistory::STATUS_DRAFT,
                BookingStatusHistory::STATUS_PENDING_PAYMENT,
                BookingStatusHistory::STATUS_CONFIRMED,
                BookingStatusHistory::STATUS_CANCELLED,
            ],
            BookingStatusHistory::STATUS_CANCELLED => [],
            BookingStatusHistory::STATUS_COMPLETED => [],
            BookingStatusHistory::STATUS_NO_SHOW => [],
            BookingStatusHistory::STATUS_EXPIRED => [],
            BookingStatusHistory::STATUS_FAILED => [
                BookingStatusHistory::STATUS_DRAFT,
                BookingStatusHistory::STATUS_PENDING_PAYMENT,
            ],
        ];

        if ($fromStatus === null|| !array_key_exists($fromStatus, $transitions)) {
            throw ValidationException::withMessages([
                'status' => 'The current booking status is invalid.',
            ]);
        }

        if (!in_array(
            $toStatus,
            $transitions[$fromStatus],
            true
        )) {
            throw ValidationException::withMessages([
                'status' => "The booking cannot be changed from {$fromStatus} to {$toStatus}.",
            ]);
        }
    }
}