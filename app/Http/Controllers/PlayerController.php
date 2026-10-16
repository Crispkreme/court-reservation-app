<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingPlayer;
use App\Models\Player;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Http\Requests\IndexPlayerRequest;
use App\Http\Requests\AddPlayerToBookingRequest;
use App\Http\Requests\StorePlayerRequest;
use App\Http\Requests\UpdateBookingParticipantRequest;
use App\Http\Requests\UpdatePlayerRequest;

class PlayerController extends Controller
{
    public function index(IndexPlayerRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $query = Player::query()
            ->with('member')
            ->latest();

        if (isset($validated['type'])) {
            $query->where(
                'player_type',
                $validated['type']
            );
        }

        if (isset($validated['search'])) {
            $search = $validated['search'];

            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return response()->json(
            $query->paginate(20)
        );
    }

    public function store(StorePlayerRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $player = Player::create($validated);

        return response()->json([
            'message' => 'Player created successfully.',
            'player' => $player->load('member'),
        ], 201);
    }

    public function show(Player $player): JsonResponse
    {
        $player->load('member');

        $history = $player->bookings()
            ->with([
                'court',
                'sportCategory',
            ])
            ->latest('bookings.created_at')
            ->paginate(15);

        return response()->json([
            'player' => $player,
            'booking_history' => $history,
        ]);
    }

    public function update(
        UpdatePlayerRequest $request,
        Player $player
    ): JsonResponse {
        $validated = $request->validated();

        $player->update($validated);

        return response()->json([
            'message' => 'Player updated successfully.',
            'player' => $player->fresh('member'),
        ]);
    }

    public function addToBooking(
        AddPlayerToBookingRequest $request,
        Booking $booking
    ): JsonResponse {
        $validated = $request->validated();

        $court = $booking->load('court')->court;

        $currentCount = BookingPlayer::where('booking_id',$booking->id)
            ->whereNotIn('participant_status', [
                'cancelled',
                'declined',
            ])
            ->count();

        if ($currentCount >= $court->capacity) {
            return response()->json([
                'message' => 'Court player capacity has been reached.',
                'capacity' => $court->capacity,
                'current_count' => $currentCount,
            ], 422);
        }

        $exists = BookingPlayer::where('booking_id',$booking->id)
            ->where('player_id',$validated['player_id'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'This player is already part of the booking.',
            ], 422);
        }

        $participant = BookingPlayer::create([
            'booking_id' => $booking->id,
            'player_id' => $validated['player_id'],
            'participant_status' => $validated['participant_status'] ?? 'confirmed',
        ]);

        return response()->json([
            'message' => 'Player added to booking.',
            'participant' => $participant->load('player'),
        ], 201);
    }

    public function removeFromBooking(
        Booking $booking,
        BookingPlayer $bookingPlayer
    ): JsonResponse {
        abort_unless(
            $bookingPlayer->booking_id === $booking->id, 404
        );

        $bookingPlayer->update([
            'participant_status' => 'cancelled',
        ]);

        return response()->json([
            'message' => 'Player removed from booking.',
        ]);
    }

    public function updateParticipant(
        UpdateBookingParticipantRequest $request,
        BookingPlayer $bookingPlayer
    ): JsonResponse {
        $validated = $request->validated();

        $bookingPlayer->update($validated);

        if ($validated['participant_status'] === 'attended'&& !$bookingPlayer->checked_in_at) {
            $bookingPlayer->update([
                'checked_in_at' => now(),
            ]);
        }

        return response()->json([
            'message' => 'Participant updated successfully.',
            'participant' => $bookingPlayer->fresh([
                'player',
                'booking',
            ]),
        ]);
    }
}