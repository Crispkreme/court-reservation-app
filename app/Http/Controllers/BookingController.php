<?php

namespace App\Http\Controllers;

use App\Http\Requests\Booking\BookingFilterRequest;
use App\Http\Requests\Booking\BookingStatusRequest;
use App\Http\Requests\Booking\StoreBookingRequest;
use App\Http\Requests\Booking\UpdateBookingRequest;
use App\Interfaces\BookingInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct(
        private readonly BookingInterface $bookingRepository
    ) {}

    public function index(BookingFilterRequest $request): JsonResponse
    {
        $filters = $request->validated();

        if ($request->user()->isMember()) {
            $filters['user_id'] = $request->user()->id;
        }

        $bookings = $this->bookingRepository->getAll($filters);

        return response()->json($bookings);
    }

    public function store(StoreBookingRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->user()->isMember()) {
            $data['user_id'] = $request->user()->id;
        }

        $booking = $this->bookingRepository->create($data);

        return response()->json([
            'message' => 'Booking created successfully.',
            'data' => $booking,
        ], 201);
    }

    public function show(Request $request, int $booking): JsonResponse
    {
        $this->authorizeAccess($request);

        $record = $this->bookingRepository->findById($booking);

        if (
            ! $record ||
            (
                $request->user()->isMember() &&
                (int) $record->user_id !== (int) $request->user()->id
            )
        ) {
            return response()->json([
                'message' => 'Booking not found.',
            ], 404);
        }

        return response()->json([
            'data' => $record,
        ]);
    }

    public function update(
        UpdateBookingRequest $request,
        int $booking
    ): JsonResponse {
        $record = $this->bookingRepository->update(
            $booking,
            $request->validated()
        );

        return response()->json([
            'message' => 'Booking updated successfully.',
            'data' => $record,
        ]);
    }

    public function updateStatus(
        BookingStatusRequest $request,
        int $booking
    ): JsonResponse {
        $record = $this->bookingRepository->updateStatus(
            $booking,
            $request->validated('status')
        );

        return response()->json([
            'message' => 'Booking status updated successfully.',
            'data' => $record,
        ]);
    }

    public function cancel(
        Request $request,
        int $booking
    ): JsonResponse {
        abort_unless(
            $request->user()?->isActive() === true
                && $request->user()->isMember(),
            403
        );

        $record = $this->bookingRepository->cancel(
            $booking,
            (int) $request->user()->id
        );

        return response()->json([
            'message' => 'Booking cancelled successfully.',
            'data' => $record,
        ]);
    }

    public function destroy(
        Request $request,
        int $booking
    ): JsonResponse {
        abort_unless(
            $request->user()?->canAccessAdminCalendar() === true,
            403
        );

        $this->bookingRepository->delete($booking);

        return response()->json([
            'message' => 'Booking deleted successfully.',
        ]);
    }

    private function authorizeAccess(Request $request): void
    {
        $user = $request->user();

        abort_unless(
            $user?->isActive() === true
                && ($user->isAdmin() || $user->isMember()),
            403
        );
    }
}