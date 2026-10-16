<?php

namespace App\Http\Controllers;

use App\Models\BookingRule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use App\Http\Requests\IndexBookingRuleRequest;
use App\Http\Requests\StoreBookingRuleRequest;
use App\Http\Requests\UpdateBookingRuleRequest;

class BookingRuleController extends Controller
{
    public function index(IndexBookingRuleRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $rules = BookingRule::query()
            ->with([
                'membershipTier',
                'sportCategory',
                'court',
            ])
            ->when(
                isset($validated['rule_type']),
                fn ($query) => $query->where(
                    'rule_type',
                    $validated['rule_type']
                )
            )
            ->when(
                isset($validated['is_active']),
                fn ($query) => $query->where(
                    'is_active',
                    $validated['is_active']
                )
            )
            ->orderByDesc('priority')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $rules,
        ]);
    }

    public function store(StoreBookingRuleRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $rule = BookingRule::create($validated);

        return response()->json([
            'message' => 'Booking rule created successfully.',
            'data' => $rule->load([
                'membershipTier',
                'sportCategory',
                'court',
            ]),
        ], 201);
    }

    public function show(BookingRule $bookingRule): JsonResponse
    {
        return response()->json([
            'data' => $bookingRule->load([
                'membershipTier',
                'sportCategory',
                'court',
            ]),
        ]);
    }

    public function update(
        UpdateBookingRuleRequest $request,
        BookingRule $bookingRule
    ): JsonResponse {
        $validated = $request->validated();

        $bookingRule->update($validated);

        return response()->json([
            'message' => 'Booking rule updated successfully.',
            'data' => $bookingRule->fresh()->load([
                'membershipTier',
                'sportCategory',
                'court',
            ]),
        ]);
    }

    public function destroy(
        BookingRule $bookingRule
    ): JsonResponse {
        $bookingRule->delete();

        return response()->json([
            'message' => 'Booking rule deleted successfully.',
        ]);
    }
}