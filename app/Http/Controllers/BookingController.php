<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\AuditLogService;
use App\Models\Court;
use App\Models\BookingStatusHistory;
use App\Models\Membership;

use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

use App\Http\Requests\BookingIndexRequest;
use App\Http\Requests\AvailabilityRequest;
use App\Http\Requests\StoreBookingRequest;
use App\Http\Requests\CancelBookingRequest;

class BookingController extends Controller
{
    /**
     * Booking rules.
     */
    private const ALLOWED_DURATIONS = [30, 60, 90];
    private const MAX_BOOKINGS_PER_DAY = 3;

    /**
     * Default maximum advance booking window.
     *
     * Membership access_rules.booking_advance_days
     * can override this value.
     */
    private const ADVANCE_BOOKING_DAYS = 30;

    /**
     * List bookings.
     */
    public function index(BookingIndexRequest $request): JsonResponse
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

        if (isset($validated['status'])) {
            $query->where('status',$validated['status']);
        }

        if (isset($validated['date'])) {
            $query->whereDate('booking_date',$validated['date']);
        }

        if (isset($validated['court_id'])) {
            $query->where('court_id',$validated['court_id']);
        }

        if (isset($validated['sport_category_id'])) {
            $query->where('sport_category_id',$validated['sport_category_id']);
        }

        $bookings = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $bookings,
        ]);
    }

    /**
     * Get available courts for a date/time/duration.
     */
    public function availability(AvailabilityRequest $request): JsonResponse {
        $validated = $request->validated();

        $date = Carbon::parse($validated['date']);
        $start = Carbon::parse($validated['date'] . ' ' . $validated['start_time']);
        $end = $start->copy()->addMinutes($validated['duration_minutes']);

        $courts = Court::query()
            ->where('sport_category_id',$validated['sport_category_id'])
            ->get();

        $available = $courts->filter(function ($court) use (
            $date,
            $start,
            $end
        ) {
            return ! Booking::query()
                ->where('court_id',$court->id)
                ->whereDate('booking_date',$date)
                ->active()
                ->where('start_time','<',$end->format('H:i:s'))
                ->where('end_time','>',$start->format('H:i:s'))
                ->exists();
        })->values();

        return response()->json([
            'success' => true,
            'data' => [
                'date' => $date->format('Y-m-d'),
                'start_time' => $start->format('H:i'),
                'end_time' => $end->format('H:i'),
                'duration_minutes' => $validated['duration_minutes'],
                'courts' => $available,
            ],
        ]);
    }

    /**
     * Create a booking.
     */
    public function store(StoreBookingRequest $request): JsonResponse {
        $validated = $request->validated();

        $user = auth()->user();
        $date = Carbon::parse($validated['booking_date']);

        /*
         * Prevent past bookings.
         */
        if ($date->startOfDay()->isBefore(now()->startOfDay())) {
            throw ValidationException::withMessages([
                'booking_date' =>
                    'The booking date cannot be in the past.',
            ]);
        }

        /*
         * Get the authenticated user's active membership.
         *
         * Adjust this query if your Membership model uses
         * a different status/date structure.
         */
        $membership = null;

        if ($user) {
            $membership = Membership::query()
                ->with('membershipType')
                ->where('user_id', $user->id)
                ->where('status', 'ACTIVE')
                ->whereDate('start_date','<=',$date)
                ->whereDate('expiration_date','>=',$date)
                ->latest('expiration_date')
                ->first();
        }

        /*
         * Membership access rules.
         */
        $accessRules = $membership?->membershipType?->access_rules ?? [];

        $bookingAdvanceDays = (int) ($accessRules['booking_advance_days'] ?? self::ADVANCE_BOOKING_DAYS);
        $priorityBooking = (bool) ($accessRules['priority_booking'] ?? false);
        $premiumCourts = (bool) ($accessRules['premium_courts']?? false);

        /*
         * Advance booking window.
         *
         * Membership-specific access rules override
         * the default 30-day booking window.
         */
        if (
            $date->startOfDay()->greaterThan(
                now()->addDays($bookingAdvanceDays)
                     ->startOfDay()
            )
        ) {
            throw ValidationException::withMessages([
                'booking_date' =>
                    'Your current membership allows bookings only up to '
                    . $bookingAdvanceDays
                    . ' days in advance.',
            ]);
        }

        /*
         * Calculate booking start and end time.
         */
        $start = Carbon::parse($validated['booking_date']. ' '. $validated['start_time']);
        $end = $start->copy()->addMinutes($validated['duration_minutes']);

        /*
         * Make sure the court belongs to the selected sport.
         */
        $court = Court::query()
            ->where('id',$validated['court_id'])
            ->where('sport_category_id',$validated['sport_category_id'])
            ->first();

        if (! $court) {
            throw ValidationException::withMessages([
                'court_id' => 'The selected court does not belong to the selected sport.',
            ]);
        }

        /*
         * Premium court validation.
         *
         * This assumes your courts table has an
         * `is_premium` boolean column.
         */
        if (($court->is_premium ?? false)&& ! $premiumCourts) {
            throw ValidationException::withMessages([
                'court_id' => 'Your current membership does not allow access to premium courts.',
            ]);
        }

        /*
         * Capacity validation.
         */
        if (isset($court->minimum_capacity)&& $validated['players_count'] < $court->minimum_capacity) {
            throw ValidationException::withMessages([
                'players_count' => 'The number of players is below the minimum court capacity.',
            ]);
        }

        if (isset($court->maximum_capacity) && $validated['players_count'] > $court->maximum_capacity) {
            throw ValidationException::withMessages([
                'players_count' => 'The number of players exceeds the maximum court capacity.',
            ]);
        }

        /*
         * User booking limit.
         */
        $userId = $user?->id;

        if ($userId) {
            $dailyBookings = Booking::query()
                ->where('user_id',$userId)
                ->whereDate('booking_date',$date)
                ->active()
                ->count();

            if ($dailyBookings>= self::MAX_BOOKINGS_PER_DAY) {
                throw ValidationException::withMessages([
                    'booking_date' => 'You have reached the maximum number of bookings allowed for this day.',
                ]);
            }
        }

        /*
         * Calculate base price.
         */
        $pricePerHour = (float) ($court->price_per_hour ?? 0);
        $unitPrice = $pricePerHour;
        $baseAmount = round(($pricePerHour / 60)* $validated['duration_minutes'],2);

        /*
         * Membership discount.
         */
        $discountType = null;
        $discountValue = 0;
        $discountAmount = 0;

        if ($membership?->membershipType) {
            $membershipType = $membership->membershipType;

            $discountType = $membershipType->discount_type;
            $discountValue = (float) ($membershipType->discount_value ?? 0);

            if ($discountType === 'percentage') {
                $discountAmount = round($baseAmount* ($discountValue / 100),2);
            } elseif ($discountType === 'fixed') {
                $discountAmount = min($discountValue,$baseAmount);
            }
        }

        /*
         * Final amount after membership discount.
         */
        $totalAmount = round(max(0,$baseAmount - $discountAmount),2);

        /*
         * Critical section.
         */
        $booking = DB::transaction(function () use (
            $validated,
            $court,
            $date,
            $start,
            $end,
            $unitPrice,
            $baseAmount,
            $discountType,
            $discountValue,
            $discountAmount,
            $totalAmount,
            $userId,
            $membership,
            $priorityBooking
        ) {
            $lockedCourt = Court::query()
                ->whereKey($court->id)
                ->lockForUpdate()
                ->firstOrFail();

            /*
             * Double-booking detection.
             */
            $conflict = Booking::query()
                ->where('court_id',$lockedCourt->id)
                ->whereDate('booking_date',$date)
                ->active()
                ->where('start_time','<',$end->format('H:i:s'))
                ->where('end_time','>',$start->format('H:i:s'))
                ->lockForUpdate()
                ->exists();

            if ($conflict) {
                throw ValidationException::withMessages([
                    'start_time' => 'The selected court is already booked during this time.',
                ]);
            }

            /*
             * Create booking.
             */
            $booking = Booking::create([
                'user_id' => $userId,
                'sport_category_id' => $validated['sport_category_id'],
                'court_id' => $lockedCourt->id,
                'booking_reference' => $this->generateBookingReference(),
                'booking_date' => $date->format('Y-m-d'),
                'start_time' => $start->format('H:i:s'),
                'end_time' => $end->format('H:i:s'),
                'duration_minutes' => $validated['duration_minutes'],
                'players_count' => $validated['players_count'],
                'unit_price' => $unitPrice,
                'total_amount' => $totalAmount,
                'booking_source' => $validated['booking_source']?? 'ONLINE',
                'status' =>'CONFIRMED',

                /*
                 * Store the actual membership used for
                 * this booking rather than trusting the request.
                 */
                'membership_type' => $membership?->membershipType?->code,
                'customer_name' => $validated['customer_name'] ?? $user?->name,
                'customer_email' => $validated['customer_email'] ?? $user?->email,
                'customer_phone' => $validated['customer_phone'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'confirmed_at' => now(),
            ]);

            /*
             * If your bookings table contains these columns,
             * store the membership pricing information.
             *
             * Uncomment these fields after adding the columns.
             */
            /*
            $booking->update([
                'base_amount' => $baseAmount,
                'discount_type' => $discountType,
                'discount_value' => $discountValue,
                'discount_amount' => $discountAmount,
                'membership_id' => $membership?->id,
            ]);
            */

            /*
             * Create initial booking status history.
             */
            BookingStatusHistory::create([
                'booking_id' => $booking->id,
                'from_status' => null,
                'to_status' => BookingStatusHistory::STATUS_CONFIRMED,
                'changed_by' => auth()->id(),
                'reason' => 'Booking created.',
                'notes' => 'Initial booking status.',
                'metadata' => [
                    'source' => 'BOOKING_CONTROLLER',
                    'membership_id' => $membership?->id,
                    'membership_type' => $membership?->membershipType?->code,
                    'priority_booking' => $priorityBooking,
                    'base_amount' => $baseAmount,
                    'discount_type' => $discountType,
                    'discount_value' => $discountValue,
                    'discount_amount' => $discountAmount,
                    'final_amount' => $totalAmount,
                ],

                'changed_at' => now(),
            ]);

            /*
            * Create centralized audit log.
            */
            AuditLogService::record(
                module: 'booking',
                action: 'created',
                model: $booking,
                oldValues: null,
                newValues: [
                    'id' => $booking->id,
                    'booking_reference' => $booking->booking_reference,
                    'user_id' => $booking->user_id,
                    'sport_category_id' => $booking->sport_category_id,
                    'court_id' => $booking->court_id,
                    'booking_date' => $booking->booking_date,
                    'start_time' => $booking->start_time,
                    'end_time' => $booking->end_time,
                    'duration_minutes' => $booking->duration_minutes,
                    'players_count' => $booking->players_count,
                    'status' => $booking->status,
                    'booking_source' => $booking->booking_source,
                    'membership_type' => $booking->membership_type,
                    'total_amount' => $booking->total_amount,
                ],
                description: 'Booking was created.',
                reason: 'Initial booking creation.'
            );

            return $booking;
        });

        /*
         * Load relationships for API response.
         */
        $booking->load([
            'court',
            'sportCategory',
            'user',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Booking created successfully.',
            'data' => $booking,
        ], 201);
    }

    /**
     * Show a booking.
     */
    public function show(
        Booking $booking
    ): JsonResponse {
        $booking->load([
            'court',
            'sportCategory',
            'user',
        ]);

        return response()->json([
            'success' => true,
            'data' => $booking,
        ]);
    }

    /**
     * Cancel a booking.
     */
    public function cancel(
        CancelBookingRequest $request,
        Booking $booking
    ): JsonResponse {
        if ($booking->status === 'CANCELLED') {
            throw ValidationException::withMessages([
                'booking' => 'This booking is already cancelled.',
            ]);
        }

        if ($booking->status === 'COMPLETED') {
            throw ValidationException::withMessages([
                'booking' => 'A completed booking cannot be cancelled.',
            ]);
        }

        $validated = $request->validated();

        $oldValues = [
            'status' => $booking->status,
            'cancelled_at' => $booking->cancelled_at,
            'cancellation_reason' => $booking->cancellation_reason,
        ];

        $booking->update([
            'status' => 'CANCELLED',
            'cancelled_at' => now(),
            'cancellation_reason' => $validated['cancellation_reason'] ?? null,
        ]);

        BookingStatusHistory::create([
            'booking_id' => $booking->id,
            'from_status' => $oldValues['status'],
            'to_status' => 'CANCELLED',
            'changed_by' => auth()->id(),
            'reason' => $validated['cancellation_reason'] ?? 'Booking cancelled.',
            'notes' => 'Booking cancellation.',
            'metadata' => [
                'source' => 'BOOKING_CONTROLLER',
            ],
            'changed_at' => now(),
        ]);

        /*
        * Create centralized audit log.
        */
        AuditLogService::record(
            module: 'cancellation',
            action: 'cancelled',
            model: $booking,
            oldValues: $oldValues,
            newValues: [
                'status' => $booking->status,
                'cancelled_at' => $booking->cancelled_at,
                'cancellation_reason' => $booking->cancellation_reason,
            ],
            description: 'Booking was cancelled.',
            reason: $validated['cancellation_reason'] ?? 'No reason provided.'
        );

        return response()->json([
            'success' => true,
            'message' => 'Booking cancelled successfully.',
            'data' => $booking->fresh(),
        ]);
    }

    /**
     * Generate unique booking reference.
     */
    private function generateBookingReference(): string
    {
        do {
            $reference =
                'BK-'
                . now()->format('Ymd')
                . '-'
                . strtoupper(
                    Str::random(6)
                );
        } while (
            Booking::where(
                'booking_reference',
                $reference
            )->exists()
        );

        return $reference;
    }
}