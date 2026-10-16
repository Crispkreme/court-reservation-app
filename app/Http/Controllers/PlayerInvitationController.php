<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePlayerInvitationRequest;
use App\Models\Booking;
use App\Models\BookingPlayer;
use App\Models\MatchmakingRequest;
use App\Models\Player;
use App\Models\PlayerInvitation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PlayerInvitationController extends Controller
{
    /**
     * List player invitations.
     */
    public function index(): JsonResponse
    {
        $invitations = PlayerInvitation::query()
            ->with([
                'booking',
                'player',
                'inviter',
                'matchmakingRequest',
            ])
            ->latest()
            ->paginate(20);

        return response()->json($invitations);
    }

    /**
     * Create a player invitation.
     */
    public function store(
        StorePlayerInvitationRequest $request,
        Booking $booking
    ): JsonResponse {
        $validated = $request->validated();

        $invitation = DB::transaction(function () use (
            $validated,
            $booking,
            $request
        ) {
            $player = Player::create([
                'first_name' => $validated['name'],
                'last_name' => '',
                'email' => $validated['email'] ?? null,
                'player_type' => 'guest',
                'is_active' => true,
            ]);

            $invitation = PlayerInvitation::create([
                'booking_id' => $booking->id,
                'invited_by' => $request->user()->id,
                'player_id' => $player->id,
                'name' => $validated['name'],
                'email' => $validated['email'] ?? null,
                'token' => Str::random(64),
                'status' => 'pending',
                'expires_at' => now()->addDays(2),
            ]);

            return $invitation;
        });

        return response()->json([
            'message' => 'Player invitation created.',
            'invitation' => $invitation->load('player'),
        ], 201);
    }

    /**
     * Show an invitation using its token.
     */
    public function show(string $token): JsonResponse
    {
        $invitation = PlayerInvitation::query()
            ->with([
                'booking',
                'player',
                'matchmakingRequest',
            ])
            ->where('token', $token)
            ->firstOrFail();

        if (
            $invitation->expires_at &&
            $invitation->expires_at->isPast() &&
            $invitation->status === 'pending'
        ) {
            $invitation->update([
                'status' => 'expired',
            ]);
        }

        return response()->json([
            'invitation' => $invitation->fresh([
                'booking',
                'player',
                'matchmakingRequest',
            ]),
        ]);
    }

    /**
     * Accept or decline an invitation.
     *
     * Expected:
     * {
     *     "action": "accept"
     * }
     *
     * or:
     *
     * {
     *     "action": "decline"
     * }
     */
    public function respond(
        Request $request,
        string $token
    ): JsonResponse {
        $validated = $request->validate([
            'action' => [
                'required',
                'string',
                'in:accept,decline',
            ],
        ]);

        $invitation = PlayerInvitation::query()
            ->where('token', $token)
            ->firstOrFail();

        if ($invitation->status !== 'pending') {
            throw ValidationException::withMessages([
                'invitation' =>
                    'This invitation has already been responded to.',
            ]);
        }

        if (
            $invitation->expires_at &&
            $invitation->expires_at->isPast()
        ) {
            $invitation->update([
                'status' => 'expired',
            ]);

            throw ValidationException::withMessages([
                'invitation' =>
                    'This invitation has expired.',
            ]);
        }

        if ($validated['action'] === 'decline') {
            $invitation->update([
                'status' => 'declined',
            ]);

            return response()->json([
                'success' => true,
                'message' =>
                    'Player invitation declined.',
                'invitation' =>
                    $invitation->fresh([
                        'booking',
                        'player',
                        'matchmakingRequest',
                    ]),
            ]);
        }

        /*
         * Accept invitation.
         *
         * Lock the booking so two players cannot accept
         * the final available slot at the same time.
         */
        DB::transaction(function () use ($invitation) {
            $booking = Booking::query()
                ->with('court')
                ->lockForUpdate()
                ->findOrFail(
                    $invitation->booking_id
                );

            /*
             * Check whether this player is already
             * part of the booking.
             */
            $alreadyAdded = BookingPlayer::query()
                ->where(
                    'booking_id',
                    $booking->id
                )
                ->where(
                    'player_id',
                    $invitation->player_id
                )
                ->exists();

            if ($alreadyAdded) {
                $invitation->update([
                    'status' => 'accepted',
                ]);

                $this->closeMatchmakingIfFull(
                    $booking
                );

                return;
            }

            /*
             * Count confirmed/accepted players.
             */
            $currentPlayers = BookingPlayer::query()
                ->where(
                    'booking_id',
                    $booking->id
                )
                ->whereIn(
                    'participant_status',
                    [
                        'confirmed',
                        'accepted',
                    ]
                )
                ->count();

            $capacity = (int) (
                $booking->court->capacity ?? 0
            );

            if ($capacity > 0 && $currentPlayers >= $capacity) {
                throw ValidationException::withMessages([
                    'invitation' =>
                        'The booking session is already full.',
                ]);
            }

            /*
             * Add the player to the booking session.
             */
            BookingPlayer::create([
                'booking_id' => $booking->id,
                'player_id' => $invitation->player_id,
                'participant_status' => 'confirmed',
            ]);

            /*
             * Mark invitation as accepted.
             */
            $invitation->update([
                'status' => 'accepted',
            ]);

            /*
             * Automatically close matchmaking if
             * the booking has reached its capacity.
             */
            $this->closeMatchmakingIfFull(
                $booking
            );
        });

        return response()->json([
            'success' => true,
            'message' =>
                'Player invitation accepted successfully.',
            'invitation' =>
                $invitation->fresh([
                    'booking',
                    'player',
                    'matchmakingRequest',
                ]),
        ]);
    }

    /**
     * Automatically close matchmaking when the
     * booking session reaches its capacity.
     */
    private function closeMatchmakingIfFull(
        Booking $booking
    ): void {
        $booking->loadMissing('court');

        $capacity = (int) (
            $booking->court->capacity ?? 0
        );

        if ($capacity <= 0) {
            return;
        }

        $currentPlayers = BookingPlayer::query()
            ->where(
                'booking_id',
                $booking->id
            )
            ->whereIn(
                'participant_status',
                [
                    'confirmed',
                    'accepted',
                ]
            )
            ->count();

        if ($currentPlayers < $capacity) {
            return;
        }

        MatchmakingRequest::query()
            ->where(
                'booking_id',
                $booking->id
            )
            ->where(
                'status',
                'OPEN'
            )
            ->update([
                'status' => 'FULL',
                'closed_at' => now(),
            ]);
    }
}