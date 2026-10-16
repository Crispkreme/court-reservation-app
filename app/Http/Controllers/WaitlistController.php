<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\CancelWaitlistRequest;
use App\Http\Requests\ClaimWaitlistRequest;
use App\Http\Requests\StoreWaitlistRequest;
use App\Models\Booking;
use App\Models\Waitlist;
use App\Models\WaitlistHistory;
use App\Notifications\WaitlistSlotAvailableNotification;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class WaitlistController extends Controller
{
    /**
     * Display waitlists.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Waitlist::query()
            ->with([
                'user:id,name,email',
                'court:id,name,court_number',
                'sportCategory:id,name',
            ])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('court_id')) {
            $query->where('court_id', $request->integer('court_id'));
        }

        if ($request->filled('booking_date')) {
            $query->whereDate(
                'booking_date',
                $request->date('booking_date')
            );
        }

        if ($request->user() && !$request->user()->is_admin) {
            $query->where('user_id', $request->user()->id);
        }

        return response()->json(
            $query->orderBy('position')->paginate(20)
        );
    }

    /**
     * Show one waitlist entry.
     */
    public function show(Waitlist $waitlist): JsonResponse
    {
        $waitlist->load([
            'user:id,name,email',
            'court',
            'sportCategory',
            'booking',
            'histories.user:id,name',
        ]);

        return response()->json($waitlist);
    }

    /**
     * Join a waitlist.
     */
    public function store(
        StoreWaitlistRequest $request
    ): JsonResponse {
        $user = $request->user();
        $data = $request->validated();
        $sessionKey = implode('|', [
            $data['court_id'],
            $data['booking_date'],
            $data['start_time'],
            $data['end_time'],
        ]);

        $alreadyWaiting = Waitlist::query()
            ->where('user_id', $user->id)
            ->where('session_key', $sessionKey)
            ->active()
            ->exists();

        if ($alreadyWaiting) {
            return response()->json([
                'message' => 'You are already on the waitlist for this session.',
            ], 422);
        }

        $lastPosition = Waitlist::query()
            ->where('session_key', $sessionKey)
            ->max('position');

        $position = ($lastPosition ?? 0) + 1;

        $waitlist = DB::transaction(function () use (
            $user,
            $data,
            $sessionKey,
            $position
        ) {
            $waitlist = Waitlist::create([
                'user_id' => $user->id,
                'court_id' => $data['court_id'],
                'sport_category_id' => $data['sport_category_id'] ?? null,
                'booking_date' => $data['booking_date'],
                'start_time' => $data['start_time'],
                'end_time' => $data['end_time'],
                'duration_minutes' => $data['duration_minutes'],
                'position' => $position,
                'status' => Waitlist::STATUS_WAITING,
                'claim_window_minutes' => $data['claim_window_minutes'] ?? config('waitlist.claim_window_minutes'),
                'session_key' => $sessionKey,
            ]);

            $this->recordHistory(
                $waitlist,
                'joined',
                null,
                Waitlist::STATUS_WAITING,
                'Joined the waitlist.'
            );

            return $waitlist;
        });

        return response()->json(
            $waitlist->load([
                'court',
                'sportCategory',
            ]),
            201
        );
    }

    /**
     * Cancel a waitlist entry.
     */
    public function cancel(
        CancelWaitlistRequest $request,
        Waitlist $waitlist
    ): JsonResponse {
        $user = $request->user();

        if (
            !$user->is_admin &&
            $waitlist->user_id !== $user->id
        ) {
            abort(403);
        }

        if (
            in_array($waitlist->status, [
                Waitlist::STATUS_FULFILLED,
                Waitlist::STATUS_CANCELLED,
                Waitlist::STATUS_EXPIRED,
            ], true)
        ) {
            return response()->json([
                'message' => 'This waitlist entry can no longer be cancelled.',
            ], 422);
        }

        DB::transaction(function () use ($request, $waitlist) {
            $oldStatus = $waitlist->status;

            $waitlist->update([
                'status' => Waitlist::STATUS_CANCELLED,
                'cancelled_at' => now(),
                'cancellation_reason' =>
                    $request->validated('reason'),
            ]);

            $this->recordHistory(
                $waitlist,
                'cancelled',
                $oldStatus,
                Waitlist::STATUS_CANCELLED,
                $request->validated('reason')
                    ?? 'Waitlist entry cancelled.'
            );
        });

        /*
         * If the cancelled user was currently holding a claim,
         * immediately promote the next person.
         */
        if (
            $waitlist->status === Waitlist::STATUS_CANCELLED
        ) {
            $this->promoteNext($waitlist);
        }

        return response()->json([
            'message' => 'Waitlist entry cancelled successfully.',
            'waitlist' => $waitlist->fresh(),
        ]);
    }

    /**
     * Claim an available slot.
     */
    public function claim(
        ClaimWaitlistRequest $request,
        Waitlist $waitlist
    ): JsonResponse {
        $user = $request->user();

        if (
            !$user->is_admin &&
            $waitlist->user_id !== $user->id
        ) {
            abort(403);
        }

        if ($waitlist->status !== Waitlist::STATUS_NOTIFIED) {
            return response()->json([
                'message' => 'This waitlist entry is not currently available for claiming.',
            ], 422);
        }

        if (
            !$waitlist->claim_expires_at ||
            now()->greaterThanOrEqualTo(
                $waitlist->claim_expires_at
            )
        ) {
            $this->expireWaitlist($waitlist);

            return response()->json([
                'message' => 'The claim window has expired.',
            ], 422);
        }

        $booking = DB::transaction(function () use (
            $waitlist,
            $request
        ) {
            $waitlist->refresh();

            $waitlist->update([
                'status' => Waitlist::STATUS_CLAIMED,
                'claimed_at' => now(),
            ]);

            $this->recordHistory(
                $waitlist,
                'claimed',
                Waitlist::STATUS_NOTIFIED,
                Waitlist::STATUS_CLAIMED,
                'Waitlist slot claimed.'
            );

            /*
             * Create the actual booking.
             */
            $booking = Booking::create([
                'user_id' => $waitlist->user_id,
                'sport_category_id' => $waitlist->sport_category_id,
                'court_id' => $waitlist->court_id,
                'booking_reference' => 'WL-' . strtoupper(
                    \Illuminate\Support\Str::random(10)
                ),
                'booking_date' => $waitlist->booking_date,
                'start_time' => $waitlist->start_time,
                'end_time' => $waitlist->end_time,
                'duration_minutes' => $waitlist->duration_minutes,
                'players_count' =>
                    $request->validated('players_count') ?? 1,
                'status' => Booking::STATUS_PENDING,
            ]);

            $waitlist->update([
                'status' => Waitlist::STATUS_FULFILLED,
                'booking_id' => $booking->id,
                'fulfilled_at' => now(),
            ]);

            $this->recordHistory(
                $waitlist,
                'fulfilled',
                Waitlist::STATUS_CLAIMED,
                Waitlist::STATUS_FULFILLED,
                'Waitlist entry converted into a booking.',
                [
                    'booking_id' => $booking->id,
                ]
            );

            return $booking;
        });

        return response()->json([
            'message' => 'Waitlist slot claimed successfully.',
            'booking' => $booking->load([
                'court',
                'sportCategory',
            ]),
        ]);
    }

    /**
     * Promote the next waiting member.
     */
    public function promoteNext(
        Waitlist $waitlist
    ): ?Waitlist {
        return DB::transaction(function () use ($waitlist) {
            $next = Waitlist::query()
                ->where('session_key', $waitlist->session_key)
                ->where('status', Waitlist::STATUS_WAITING)
                ->orderBy('position')
                ->lockForUpdate()
                ->first();

            if (!$next) {
                return null;
            }

            $next->load([
                'user',
                'court',
                'sportCategory',
            ]);

            $expiresAt = now()->addMinutes(
                $next->claim_window_minutes
            );

            $next->update([
                'status' => Waitlist::STATUS_NOTIFIED,
                'promoted_at' => now(),
                'claim_expires_at' => $expiresAt,
            ]);

            $this->recordHistory(
                $next,
                'promoted',
                Waitlist::STATUS_WAITING,
                Waitlist::STATUS_NOTIFIED,
                'Waitlist member promoted because a slot became available.',
                [
                    'claim_expires_at' => $expiresAt->toISOString(),
                ]
            );

            $next->user->notify(
                new WaitlistSlotAvailableNotification($next)
            );

            $this->recordHistory(
                $next,
                'notification_sent',
                Waitlist::STATUS_NOTIFIED,
                Waitlist::STATUS_NOTIFIED,
                'Slot availability notification sent.'
            );

            return $next;
        });
    }

    /**
     * Expire an unclaimed promotion.
     */
    public function expireWaitlist(
        Waitlist $waitlist
    ): void {
        DB::transaction(function () use ($waitlist) {
            $waitlist->refresh();

            if (
                $waitlist->status !==
                Waitlist::STATUS_NOTIFIED
            ) {
                return;
            }

            $waitlist->update([
                'status' => Waitlist::STATUS_EXPIRED,
                'expired_at' => now(),
                'expiration_reason' =>
                    'Claim window expired.',
            ]);

            $this->recordHistory(
                $waitlist,
                'expired',
                Waitlist::STATUS_NOTIFIED,
                Waitlist::STATUS_EXPIRED,
                'Claim window expired before the slot was claimed.'
            );
        });

        /*
         * Automatically move the available slot
         * to the next person.
         */
        $this->promoteNext($waitlist);
    }

    /**
     * Record audit history.
     */
    private function recordHistory(
        Waitlist $waitlist,
        string $action,
        ?string $fromStatus,
        ?string $toStatus,
        string $description,
        array $metadata = []
    ): void {
        WaitlistHistory::create([
            'waitlist_id' => $waitlist->id,
            'user_id' => $waitlist->user_id,
            'action' => $action,
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'position' => $waitlist->position,
            'description' => $description,
            'metadata' => $metadata ?: null,
        ]);
    }
}