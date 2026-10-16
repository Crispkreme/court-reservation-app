<?php

namespace App\Http\Controllers;

use App\Http\Requests\IndexMembershipTypeRequest;
use App\Http\Requests\StoreMembershipTypeRequest;
use App\Http\Requests\UpdateMembershipTypeRequest;
use App\Models\MembershipType;
use Illuminate\Http\JsonResponse;

class MembershipTypeController extends Controller
{
    /**
     * Display a paginated list of membership types.
     */
    public function index(
        IndexMembershipTypeRequest $request
    ): JsonResponse {
        $validated = $request->validated();

        $query = MembershipType::query()
            ->withCount('memberships')
            ->orderBy('price');

        /*
         * Search by membership type name,
         * slug, or code.
         */
        if (isset($validated['search'])) {
            $search = $validated['search'];

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        /*
         * Filter by active/inactive status.
         */
        if (isset($validated['is_active'])) {
            $query->where(
                'is_active',
                $validated['is_active']
            );
        }

        return response()->json(
            $query->paginate(
                $validated['per_page'] ?? 20
            )
        );
    }

    /**
     * Store a newly created membership type.
     */
    public function store(
        StoreMembershipTypeRequest $request
    ): JsonResponse {
        $validated = $request->validated();

        $membershipType = MembershipType::create(
            $validated
        );

        return response()->json([
            'message' => 'Membership type created successfully.',
            'membership_type' => $membershipType,
        ], 201);
    }

    /**
     * Display the specified membership type.
     */
    public function show(
        MembershipType $membershipType
    ): JsonResponse {
        return response()->json([
            'membership_type' => $membershipType->loadCount('memberships'),
        ]);
    }

    /**
     * Update the specified membership type.
     */
    public function update(
        UpdateMembershipTypeRequest $request,
        MembershipType $membershipType
    ): JsonResponse {
        $validated = $request->validated();

        $membershipType->update(
            $validated
        );

        return response()->json([
            'message' => 'Membership type updated successfully.',
            'membership_type' => $membershipType->fresh()
                ->loadCount('memberships'),
        ]);
    }

    /**
     * Remove the specified membership type.
     *
     * Membership types that are already being used by
     * memberships cannot be deleted.
     */
    public function destroy(
        MembershipType $membershipType
    ): JsonResponse {
        if ($membershipType->memberships()->exists()) {
            return response()->json([
                'message' => 'This membership type cannot be deleted because memberships already use it.',
            ], 422);
        }

        $membershipType->delete();

        return response()->json([
            'message' => 'Membership type deleted successfully.',
        ]);
    }
}
