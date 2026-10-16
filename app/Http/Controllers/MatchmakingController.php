<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMatchmakingRequest;
use App\Models\Booking;
use App\Models\BookingPlayer;
use App\Models\MatchmakingRequest;
use App\Models\Player;
use App\Models\PlayerInvitation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class MatchmakingController extends Controller
{
    /**
     * List matchmaking requests.
     */
    public function index(Request $request): JsonResponse
    {
        $query = MatchmakingRequest::query()
            ->with([
                'booking',
                'sportCategory',
                'requestedBy',
                'invitations.player',
            ])
            ->latest();

        if ($request->filled('status')) {
            $query->where(
                'status',
                strtoupper($request->status)
            );
        }

        if ($request->filled('booking_id')) {
            $query->where(
                'booking_id',
                $request->integer('booking_id')
            );
        }

        if ($request->filled('sport_category_id')) {
            $query->where(
                'sport_category_id',
                $request->integer('sport_category_id')
            );
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    /**
     * Show a matchmaking request.
     */
    public function show(
        MatchmakingRequest $matchmakingRequest
    ): JsonResponse {
        $matchmakingRequest->load([
            'booking.court',
            'booking.bookingPlayers.player',
            'sportCategory',
            'requestedBy',
            'invitations.player',
        ]);

        return response()->json([
            'success' => true,
            'data' => $matchmakingRequest,
        ]);
    }

    /**
     * Create a matchmaking request.
     */
    public function store(
        StoreMatchmakingRequest $request
    ): JsonResponse {
        $validated = $request->validated();

        $user = $request->user();

        $booking = Booking::query()
            ->with([
                'court',
                'sportCategory',
                'bookingPlayers',
            ])
            ->findOrFail($validated['booking_id']);

        /*
         * The requested sport must match the booking sport.
         */
        if (
            (int) $booking->sport_category_id !==
            (int) $validated['sport_category_id']
        ) {
            throw ValidationException::withMessages([
                'sport_category_id' =>
                    'The selected sport does not match the booking.',
            ]);
        }

        /*
         * The requested date/time must match the booking session.
         */
        if (
            $booking->booking_date->format('Y-m-d') !==
            $validated['preferred_date']
        ) {
            throw ValidationException::withMessages([
                'preferred_date' =>
                    'The preferred date must match the booking date.',
            ]);
        }

        if (
            substr($booking->start_time, 0, 5) !==
            $validated['preferred_start_time']
        ) {
            throw ValidationException::withMessages([
                'preferred_start_time' =>
                    'The preferred start time must match the booking.',
            ]);
        }

        if (
            substr($booking->end_time, 0, 5) !==
            $validated['preferred_end_time']
        ) {
            throw ValidationException::withMessages([
                'preferred_end_time' =>
                    'The preferred end time must match the booking.',
            ]);
        }

        /*
         * Prevent multiple open matchmaking requests
         * for the same booking.
         */
        $existing = MatchmakingRequest::query()
            ->where('booking_id', $booking->id)
            ->where('status', 'OPEN')
            ->exists();

        if ($existing) {
            throw ValidationException::withMessages([
                'booking_id' =>
                    'This booking already has an open matchmaking request.',
            ]);
        }

        /*
         * Determine remaining spaces.
         */
        $currentPlayers = $booking->bookingPlayers()
            ->whereIn('participant_status', [
                'confirmed',
                'accepted',
            ])
            ->count();

        $capacity = (int) ($booking->court->capacity ?? 0);

        $availableSlots = max(
            0,
            $capacity - $currentPlayers
        );

        if (
            $availableSlots <
            $validated['required_players']
        ) {
            throw ValidationException::withMessages([
                'required_players' =>
                    "Only {$availableSlots} player slot(s) are available.",
            ]);
        }

        $matchmakingRequest = MatchmakingRequest::create([
            'booking_id' => $booking->id,
            'requested_by' => $user?->id,
            'sport_category_id' =>
                $validated['sport_category_id'],
            'preferred_date' =>
                $validated['preferred_date'],
            'preferred_start_time' =>
                $validated['preferred_start_time'],
            'preferred_end_time' =>
                $validated['preferred_end_time'],
            'required_players' =>
                $validated['required_players'],
            'skill_level' =>
                $validated['skill_level'] ?? null,
            'location' =>
                $validated['location'] ?? null,
            'availability' =>
                $validated['availability'] ?? null,
            'status' => 'OPEN',
            'notes' =>
                $validated['notes'] ?? null,
        ]);

        $matchmakingRequest->load([
            'booking.court',
            'sportCategory',
            'requestedBy',
        ]);

        return response()->json([
            'success' => true,
            'message' =>
                'Matchmaking request created successfully.',
            'data' => $matchmakingRequest,
        ], 201);
    }

    /**
     * Find compatible players.
     */
    public function compatiblePlayers(
        MatchmakingRequest $matchmakingRequest
    ): JsonResponse {
        $query = Player::query()
            ->where('is_active', true)
            ->whereDoesntHave(
                'bookingPlayers',
                function ($query) use ($matchmakingRequest) {
                    $query->where(
                        'booking_id',
                        $matchmakingRequest->booking_id
                    );
                }
            )
            ->whereDoesntHave(
                'invitations',
                function ($query) use ($matchmakingRequest) {
                    $query
                        ->where(
                            'booking_id',
                            $matchmakingRequest->booking_id
                        )
                        ->whereIn('status', [
                            'pending',
                            'accepted',
                        ]);
                }
            );

        /*
        * Optional skill-level matching.
        */
        if (
            $matchmakingRequest->skill_level &&
            $matchmakingRequest->skill_level !== 'any'
        ) {
            $query->where(
                'skill_level',
                $matchmakingRequest->skill_level
            );
        }

        /*
        * Optional location matching.
        */
        if ($matchmakingRequest->location) {
            $query->where(
                'location',
                $matchmakingRequest->location
            );
        }

        $players = $query
            ->limit(100)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $players,
        ]);
    }

    /**
     * Send invitations to selected players.
     */
    public function invite(
        Request $request,
        MatchmakingRequest $matchmakingRequest
    ): JsonResponse {
        $validated = $request->validate([
            'player_ids' => [
                'required',
                'array',
                'min:1',
            ],

            'player_ids.*' => [
                'integer',
                'distinct',
                'exists:players,id',
            ],
        ]);

        if (!$matchmakingRequest->isOpen()) {
            throw ValidationException::withMessages([
                'status' =>
                    'This matchmaking request is no longer open.',
            ]);
        }

        $booking = $matchmakingRequest->booking;

        $currentPlayers = BookingPlayer::query()
            ->where('booking_id', $booking->id)
            ->whereIn('participant_status', [
                'confirmed',
                'accepted',
            ])
            ->count();

        $capacity = (int) ($booking->court->capacity ?? 0);

        $remainingSlots = max(
            0,
            $capacity - $currentPlayers
        );

        if ($remainingSlots <= 0) {
            $this->closeRequest(
                $matchmakingRequest
            );

            throw ValidationException::withMessages([
                'player_ids' =>
                    'The booking session is already full.',
            ]);
        }

        $playerIds = array_slice(
            $validated['player_ids'],
            0,
            $remainingSlots
        );

        $created = [];

        foreach ($playerIds as $playerId) {
            $player = Player::findOrFail($playerId);

            /*
             * Prevent duplicate invitations.
             */
            $alreadyInvited = PlayerInvitation::query()
                ->where(
                    'matchmaking_request_id',
                    $matchmakingRequest->id
                )
                ->where(
                    'player_id',
                    $player->id
                )
                ->whereIn('status', [
                    'pending',
                    'accepted',
                ])
                ->exists();

            if ($alreadyInvited) {
                continue;
            }

            $created[] = PlayerInvitation::create([
                'booking_id' => $booking->id,
                'matchmaking_request_id' =>
                    $matchmakingRequest->id,
                'invited_by' =>
                    $request->user()?->id,
                'player_id' => $player->id,
                'name' => trim(
                    ($player->first_name ?? '') .
                    ' ' .
                    ($player->last_name ?? '')
                ),
                'email' => $player->email,
                'token' => Str::random(64),
                'status' => 'pending',
                'expires_at' => now()->addDays(2),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' =>
                count($created) .
                ' player invitation(s) sent successfully.',
            'data' => $created,
        ]);
    }

    /**
     * Close matchmaking manually.
     */
    public function close(
        MatchmakingRequest $matchmakingRequest
    ): JsonResponse {
        $this->closeRequest(
            $matchmakingRequest
        );

        return response()->json([
            'success' => true,
            'message' =>
                'Matchmaking request closed successfully.',
            'data' => $matchmakingRequest->fresh(),
        ]);
    }

    /**
     * Close automatically when session is full.
     */
    private function closeRequest(
        MatchmakingRequest $matchmakingRequest
    ): void {
        $matchmakingRequest->update([
            'status' => 'CLOSED',
            'closed_at' => now(),
        ]);
    }
}