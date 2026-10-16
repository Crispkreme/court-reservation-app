<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingHold;
use App\Models\Court;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

use App\Http\Requests\BookingHoldIndexRequest;
use App\Http\Requests\StoreBookingHoldRequest;
use App\Http\Requests\ConvertBookingHoldRequest;
use App\Http\Requests\FailBookingHoldRequest;

class BookingHoldController extends Controller
{
    private const ALLOWED_DURATIONS = [30,60,90,];
    private const DEFAULT_HOLD_DURATION = 10;

    /**
     * List booking holds.
     */
    public function index(BookingHoldIndexRequest $request): JsonResponse {
        /*
        * Automatically release expired holds before
        * returning the list.
        */
        $this->releaseExpiredHolds();
        $validated = $request->validated();

        $query = BookingHold::query()
            ->with([
                'court',
                'sportCategory',
                'user',
                'booking',
            ])
            ->latest('created_at');

        if (isset($validated['status'])) {
            $query->where(
                'status',
                $validated['status']
            );
        }

        if (isset($validated['date'])) {
            $query->whereDate(
                'booking_date',
                $validated['date']
            );
        }

        if (isset($validated['court_id'])) {
            $query->where(
                'court_id',
                $validated['court_id']
            );
        }

        $holds = $query->paginate(20);
        return response()->json([
            'success' => true,
            'data' => $holds,
        ]);
    }

    /**
     * Create a temporary hold.
     */
    public function store(StoreBookingHoldRequest $request): JsonResponse
    {
        $validated = $request->validated();

        /*
         * Release expired holds before checking availability.
         */
        $this->releaseExpiredHolds();

        $date = Carbon::parse($validated['booking_date']);
        $start = Carbon::parse(
            $validated['booking_date']
            . ' '
            . $validated['start_time']
        );

        $end = $start->copy()->addMinutes($validated['duration_minutes']);

        /*
         * Do not allow a hold in the past.
         */
        if ($start->isPast()) {
            throw ValidationException::withMessages([
                'start_time' => 'The selected time has already passed.',
            ]);
        }

        /*
         * Verify that the selected court belongs
         * to the selected sport and is active.
         */
        $court = Court::query()
            ->whereKey($validated['court_id'])
            ->where(
                'sport_category_id',
                $validated['sport_category_id']
            )
            ->where('is_active', true)
            ->first();

        if (!$court) {
            throw ValidationException::withMessages([
                'court_id' => 'The selected court is not available for this sport.',
            ]);
        }

        /*
         * Verify minimum player capacity.
         */
        if ($validated['players_count'] < $court->min_players) {
            throw ValidationException::withMessages([
                'players_count' => 'The number of players is below the minimum allowed for this court.',
            ]);
        }

        /*
         * Verify maximum player capacity.
         */
        if ($validated['players_count'] > $court->max_players) {
            throw ValidationException::withMessages([
                'players_count' => 'The number of players exceeds the maximum allowed for this court.',
            ]);
        }

        /*
         * Determine how long the slot should be held.
         */
        $holdDuration = $validated['hold_duration_minutes'] ?? self::DEFAULT_HOLD_DURATION;
        $userId = auth()->id();
        $hold = DB::transaction(function () use (
            $validated,
            $date,
            $start,
            $end,
            $holdDuration,
            $userId
        ) {
            /*
             * Lock the court row to prevent
             * concurrent booking/hold conflicts.
             */
            $court = Court::query()
                ->whereKey($validated['court_id'])
                ->lockForUpdate()
                ->firstOrFail();

            /*
             * Check for an existing confirmed/active booking.
             */
            $bookingConflict = Booking::query()
                ->where('court_id', $court->id)
                ->whereDate('booking_date', $date)
                ->active()
                ->where('start_time', '<' ,$end->format('H:i:s'))
                ->where('end_time', '>' ,$start->format('H:i:s'))
                ->lockForUpdate()
                ->exists();

            if ($bookingConflict) {
                throw ValidationException::withMessages([
                    'court_id' => 'This court is already booked for the selected time.',
                ]);
            }

            /*
             * Check for another customer's active hold.
             */
            $holdConflict = BookingHold::query()
                ->where('court_id',$court->id)
                ->whereDate('booking_date',$date)
                ->where('status',BookingHold::STATUS_ACTIVE)
                ->where('expires_at','>',now())
                ->where('start_time','<',$end->format('H:i:s'))
                ->where('end_time','>',$start->format('H:i:s'))
                ->lockForUpdate()
                ->exists();

            if ($holdConflict) {
                throw ValidationException::withMessages([
                    'court_id' => 'This court is temporarily held by another customer. Please select another time or court.',
                ]);
            }

            /*
             * Create hold timestamps.
             */
            $heldAt = now();
            $expiresAt = $heldAt->copy()->addMinutes($holdDuration);

            /*
             * Generate unique hold token.
             */
            $holdToken = (string) Str::uuid();

            /*
             * Generate a unique identifier for
             * the currently held booking slot.
             */
            $activeSlotKey =
                $court->id
                . '|'
                . $date->format('Y-m-d')
                . '|'
                . $start->format('H:i:s')
                . '|'
                . $end->format('H:i:s');

            return BookingHold::create([
                'user_id' => $userId,
                'sport_category_id' => $validated['sport_category_id'],
                'court_id' => $court->id,
                'booking_id' => null,
                'hold_token' => $holdToken,
                'active_slot_key' => $activeSlotKey,
                'booking_date' => $date->format('Y-m-d'),
                'start_time' => $start->format('H:i:s'),
                'end_time' => $end->format('H:i:s'),
                'duration_minutes' => $validated['duration_minutes'],
                'players_count' => $validated['players_count'],
                'status' => BookingHold::STATUS_ACTIVE,
                'hold_duration_minutes' => $holdDuration,
                'held_at' => $heldAt,
                'expires_at' => $expiresAt,
                'customer_name' =>
                    $validated['customer_name']
                    ?? auth()->user()?->name,
                'customer_email' =>
                    $validated['customer_email']
                    ?? auth()->user()?->email,
                'customer_phone' =>
                    $validated['customer_phone']
                    ?? null,
                'notes' => $validated['notes'] ?? null,
                'metadata' => $validated['metadata'] ?? null,
            ]);
        });

        /*
         * Load relationships for the API response.
         */
        $hold->load([
            'court',
            'sportCategory',
            'user',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Court temporarily held successfully.',
            'data' => $hold,
        ], 201);
    }

    /**
     * Show a specific hold.
     */
    public function show(BookingHold $bookingHold): JsonResponse {
        if (
            $bookingHold->status === BookingHold::STATUS_ACTIVE
            && $bookingHold->expires_at->isPast()
        ) {
            $this->expireHold($bookingHold);
            $bookingHold->refresh();
        }

        $bookingHold->load([
            'court',
            'sportCategory',
            'user',
            'booking',
        ]);

        return response()->json([
            'success' => true,
            'data' => $bookingHold,
        ]);
    }

    /**
     * Convert a successful hold into a confirmed booking.
     *
     * This represents successful payment.
     */
    public function convert(ConvertBookingHoldRequest $request,BookingHold $bookingHold): JsonResponse {
        $validated = $request->validated();

        $booking = DB::transaction(function () use (
            $bookingHold,
            $validated
        ) {
            /*
            * Lock the hold to prevent multiple
            * simultaneous conversions.
            */
            $hold = BookingHold::query()
                ->whereKey($bookingHold->id)
                ->lockForUpdate()
                ->firstOrFail();

            /*
            * The hold must still be active.
            */
            if ($hold->status !== BookingHold::STATUS_ACTIVE) {
                throw ValidationException::withMessages([
                    'booking_hold' => 'This hold is no longer active.',
                ]);
            }

            /*
            * Check whether the hold has expired.
            */
            if (!$hold->expires_at || $hold->expires_at->isPast()) {
                $this->expireHold($hold);

                throw ValidationException::withMessages([
                    'booking_hold' => 'The booking hold has expired.',
                ]);
            }

            /*
            * Lock the court while converting
            * the hold into a booking.
            */
            $court = Court::query()
                ->whereKey($hold->court_id)
                ->lockForUpdate()
                ->firstOrFail();

            /*
            * Final booking conflict check.
            *
            * This protects against a booking being
            * created after the hold was initially made.
            */
            $conflict = Booking::query()
                ->where('court_id',$court->id)
                ->whereDate('booking_date',$hold->booking_date)
                ->active()
                ->where('start_time','<',$hold->end_time)
                ->where('end_time','>',$hold->start_time)
                ->lockForUpdate()
                ->exists();

            if ($conflict) {
                $hold->update([
                    'status' => BookingHold::STATUS_FAILED,
                    'failure_reason' => 'Booking conflict occurred during checkout.',
                    'failed_at' => now(),
                    'active_slot_key' => null,
                ]);

                throw ValidationException::withMessages([
                    'booking_hold' => 'The court is no longer available.',
                ]);
            }

            /*
            * Calculate booking price.
            */
            $pricePerHour = (float) ($court->base_price ?? 0);
            $unitPrice = $pricePerHour;
            $totalAmount = round(
                ($pricePerHour / 60)
                * $hold->duration_minutes,
                2
            );

            /*
            * Create the confirmed booking.
            */
            $booking = Booking::create([
                'user_id' => $hold->user_id,
                'sport_category_id' => $hold->sport_category_id,
                'court_id' => $hold->court_id,
                'booking_reference' => $this->generateBookingReference(),
                'booking_date' => $hold->booking_date->format('Y-m-d'),
                'start_time' => $hold->start_time,
                'end_time' => $hold->end_time,
                'duration_minutes' => $hold->duration_minutes,
                'players_count' => $hold->players_count,
                'unit_price' => $unitPrice,
                'total_amount' => $totalAmount,
                'booking_source' => 'ONLINE',
                'status' => 'CONFIRMED',
                'membership_type' => null,
                'membership_required' => false,
                'customer_name' => $hold->customer_name,
                'customer_email' => $hold->customer_email,
                'customer_phone' => $hold->customer_phone,
                'notes' => $hold->notes,
                'confirmed_at' => now(),
            ]);

            /*
            * Mark the hold as converted.
            */
            $hold->update([
                'booking_id' => $booking->id,
                'status' => BookingHold::STATUS_CONVERTED,
                'payment_reference' => $validated['payment_reference'] ?? null,
                'converted_at' => now(),

                /*
                * The slot is no longer considered
                * actively held because it now belongs
                * to a confirmed booking.
                */
                'active_slot_key' => null,
            ]);

            return $booking;
        });

        /*
        * Load booking relationships for the response.
        */
        $booking->load([
            'court',
            'sportCategory',
            'user',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Booking hold converted into a confirmed booking.',
            'data' => [
                'booking' => $booking,
                'hold' => $bookingHold->fresh(),
            ],
        ]);
    }

    /**
     * Record failed checkout/payment.
     */
    public function fail(FailBookingHoldRequest $request,BookingHold $bookingHold): JsonResponse {
        $validated = $request->validated();

        $hold = DB::transaction(function () use (
            $bookingHold,
            $validated
        ) {
            /*
            * Lock the hold to prevent concurrent
            * checkout/failure operations.
            */
            $hold = BookingHold::query()
                ->whereKey($bookingHold->id)
                ->lockForUpdate()
                ->firstOrFail();

            /*
            * Only an active hold can be marked as failed.
            */
            if ($hold->status !== BookingHold::STATUS_ACTIVE) {
                throw ValidationException::withMessages([
                    'booking_hold' => 'This hold is no longer active.',
                ]);
            }

            /*
            * Mark the hold as failed and release
            * the active booking slot.
            */
            $hold->update([
                'status' => BookingHold::STATUS_FAILED,
                'failure_reason' => $validated['failure_reason'],
                'payment_reference' => $validated['payment_reference'] ?? null,
                'failed_at' => now(),
                'active_slot_key' => null,
            ]);

            /*
            * Return the updated hold with
            * the required relationships.
            */
            return $hold->fresh([
                'court',
                'sportCategory',
                'user',
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Checkout failure recorded and court released.',
            'data' => $hold,
        ]);
    }

    /**
     * Release one expired hold.
     */
    public function release(BookingHold $bookingHold): JsonResponse {
        if (
            $bookingHold->status ===
            BookingHold::STATUS_ACTIVE
        ) {
            $this->expireHold($bookingHold);
        }

        return response()->json([
            'success' => true,
            'message' => 'Booking hold released.',
            'data' =>
                $bookingHold->fresh([
                    'court',
                    'sportCategory',
                ]),
        ]);
    }

    /**
     * Release all expired holds.
     */
    public function releaseExpired(): JsonResponse
    {
        $count = $this->releaseExpiredHolds();

        return response()->json([
            'success' => true,
            'message' => 'Expired booking holds released.',
            'data' => [
                'released_count' => $count,
            ],
        ]);
    }

    /**
     * Mark a hold as expired.
     */
    private function expireHold(
        BookingHold $hold
    ): void {
        $hold->update([
            'status' => BookingHold::STATUS_EXPIRED,
            'expired_at' => now(),
            'active_slot_key' => null,
        ]);
    }

    /**
     * Release all expired ACTIVE holds.
     */
    private function releaseExpiredHolds(): int
    {
        return BookingHold::query()
            ->where('status',BookingHold::STATUS_ACTIVE)
            ->where('expires_at','<=',now())
            ->update([
                'status' => BookingHold::STATUS_EXPIRED,
                'expired_at' => now(),
                'active_slot_key' => null,
                'updated_at' => now(),
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
                . strtoupper(Str::random(6));
        } while (
            Booking::where('booking_reference',$reference)->exists()
        );

        return $reference;
    }
}