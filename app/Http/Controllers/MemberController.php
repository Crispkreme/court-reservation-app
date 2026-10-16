<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Player;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

use App\Http\Requests\IndexMemberRequest;
use App\Http\Requests\StoreMemberRequest;
use App\Http\Requests\UpdateMemberRequest;

class MemberController extends Controller
{
    public function index(IndexMemberRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $query = Member::query()
            ->with('player')
            ->latest();

        if (isset($validated['status'])) {
            $query->where(
                'membership_status',
                $validated['status']
            );
        }

        if (isset($validated['search'])) {
            $search = $validated['search'];

            $query->where(function ($q) use ($search) {
                $q->where('member_number', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return response()->json(
            $query->paginate(15)
        );
    }

    public function store(StoreMemberRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $member = DB::transaction(function () use ($validated) {
            $member = Member::create([
                ...$validated,
                'member_number' => $this->generateMemberNumber(),
            ]);

            Player::create([
                'member_id' => $member->id,
                'first_name' => $member->first_name,
                'last_name' => $member->last_name,
                'email' => $member->email,
                'phone' => $member->phone,
                'player_type' => 'member',
                'is_active' => true,
            ]);

            return $member->load('player');
        });

        return response()->json([
            'message' => 'Member registered successfully.',
            'member' => $member,
        ], 201);
    }

    public function show(Member $member): JsonResponse
    {
        $member->load([
            'player',
        ]);

        $bookingHistory = $member->player
            ? $member->player
                ->bookings()
                ->with(['court','sportCategory',])
                ->latest('bookings.created_at')
                ->paginate(10)
            : collect();

        return response()->json([
            'member' => $member,
            'booking_history' => $bookingHistory,
        ]);
    }

    public function update(
        UpdateMemberRequest $request,
        Member $member
    ): JsonResponse {
        $validated = $request->validated();

        DB::transaction(function () use (
            $validated,
            $member
        ) {
            $member->update($validated);

            if ($member->player) {
                $member->player->update([
                    'first_name' => $member->first_name,
                    'last_name' => $member->last_name,
                    'email' => $member->email,
                    'phone' => $member->phone,
                ]);
            }
        });

        return response()->json([
            'message' => 'Member updated successfully.',
            'member' => $member->fresh('player'),
        ]);
    }

    public function destroy(Member $member): JsonResponse
    {
        $member->delete();

        return response()->json([
            'message' => 'Member deleted successfully.',
        ]);
    }

    private function generateMemberNumber(): string
    {
        do {
            $number = 'MEM-' . strtoupper(
                Str::random(8)
            );
        } while (
            Member::where(
                'member_number',
                $number
            )->exists()
        );

        return $number;
    }
}