<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\MembershipPrivilege;
use App\Models\MembershipType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

use App\Http\Requests\MembershipPrivilegeIndexRequest;
use App\Http\Requests\UpdateMembershipPrivilegeRequest;
use App\Http\Requests\StoreMembershipPrivilegeRequest;

class MembershipPrivilegeController extends Controller
{
    /**
     * List membership privileges.
     */
    public function index(MembershipPrivilegeIndexRequest $request): JsonResponse {
        $validated = $request->validated();

        $query = MembershipPrivilege::query()
            ->with('membershipType')
            ->latest();

        if (isset($validated['membership_type_id'])) {
            $query->where(
                'membership_type_id',
                $validated['membership_type_id']
            );
        }

        if (isset($validated['is_active'])) {
            $query->where(
                'is_active',
                $validated['is_active']
            );
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    /**
     * Show one privilege configuration.
     */
    public function show(
        MembershipPrivilege $membershipPrivilege
    ): JsonResponse {
        $membershipPrivilege->load('membershipType');

        return response()->json([
            'success' => true,
            'data' => $membershipPrivilege,
        ]);
    }

    /**
     * Create privilege configuration.
     */
    public function store(
        StoreMembershipPrivilegeRequest $request
    ): JsonResponse {
        $privilege = MembershipPrivilege::create(
            $request->validated()
        );

        $privilege->load('membershipType');

        return response()->json([
            'success' => true,
            'message' => 'Membership privileges created successfully.',
            'data' => $privilege,
        ], 201);
    }

    /**
     * Update privilege configuration.
     */
    public function update(
        UpdateMembershipPrivilegeRequest $request,
        MembershipPrivilege $membershipPrivilege
    ): JsonResponse {
        
        $membershipPrivilege->update($request->validated());
        $membershipPrivilege->load('membershipType');

        return response()->json([
            'success' => true,
            'message' => 'Membership privileges updated successfully.',
            'data' => $membershipPrivilege,
        ]);
    }

    /**
     * Delete privilege configuration.
     */
    public function destroy(
        MembershipPrivilege $membershipPrivilege
    ): JsonResponse {
        $membershipPrivilege->delete();

        return response()->json([
            'success' => true,
            'message' =>
                'Membership privileges deleted successfully.',
        ]);
    }

    /**
     * Return membership tiers for the
     * privilege configuration page.
     */
    public function membershipTypes(): JsonResponse
    {
        $membershipTypes = MembershipType::query()
            ->with('privilege')
            ->orderBy('price')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $membershipTypes,
        ]);
    }
}