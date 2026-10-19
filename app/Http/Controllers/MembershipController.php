<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexMembershipRequest;
use App\Http\Requests\RenewMembershipRequest;
use App\Http\Requests\StoreMembershipRequest;
use App\Http\Requests\UpdateMembershipRequest;
use App\Http\Requests\ExpiringMembershipRequest;

use App\Models\Member;
use App\Models\Membership;
use App\Models\MembershipType;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MembershipController extends Controller
{
    public function index(IndexMembershipRequest $request): JsonResponse
    {
        $validated = $request->validated();
        Membership::query()
            ->whereIn('status', ['active', 'pending'])
            ->whereDate('expiration_date', '<', today())
            ->update([
                'status' => 'expired',
            ]);

        $query = Membership::query()
            ->with([
                'member',
                'membershipType',
            ])
            ->latest('start_date');

        if (!empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        if (!empty($validated['membership_type_id'])) {
            $query->where(
                'membership_type_id',
                $validated['membership_type_id']
            );
        }

        if (!empty($validated['member_id'])) {
            $query->where(
                'member_id',
                $validated['member_id']
            );
        }

        if (!empty($validated['search'])) {
            $search = trim($validated['search']);

            $query->whereHas('member', function ($q) use ($search) {
                $q->where(function ($subQuery) use ($search) {
                    $subQuery->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('member_number', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            });
        }

        $perPage = $validated['per_page'] ?? 20;

        return response()->json(
            $query->paginate($perPage)
        );
    }

    /**
     * Display active membership types.
     */
    public function types(): JsonResponse
    {
        return response()->json(
            MembershipType::query()
                ->where('is_active', true)
                ->orderBy('price')
                ->get()
        );
    }

    /**
     * Show a membership.
     */
    public function show(
        Membership $membership
    ): JsonResponse {
        return response()->json([
            'membership' => $membership->load([
                'member',
                'membershipType',
                'renewedFrom',
                'renewals.membershipType',
            ]),
        ]);
    }

    /**
     * Create a membership.
     */
    public function store(
        StoreMembershipRequest $request
    ): JsonResponse {
        $validated = $request->validated();

        $membershipType = MembershipType::findOrFail(
            $validated['membership_type_id']
        );

        $startDate = Carbon::parse(
            $validated['start_date']
        );

        /*
         * Membership duration is inclusive.
         *
         * Example:
         * start = January 1
         * duration = 30 days
         * expiration = January 30
         */
        $expirationDate = $startDate
            ->copy()
            ->addDays(
                $membershipType->duration_days - 1
            );

        /*
         * Use custom discount values when supplied.
         * Otherwise use the membership type defaults.
         */
        $discountType = $validated['discount_type']
            ?? $membershipType->discount_type;

        $discountValue = array_key_exists(
            'discount_value',
            $validated
        )
            ? (float) ($validated['discount_value'] ?? 0)
            : (float) $membershipType->discount_value;

        $basePrice = (float) $membershipType->price;

        $finalPrice = $this->calculateFinalPrice(
            $basePrice,
            $discountType,
            $discountValue
        );

        $membership = DB::transaction(function () use (
            $validated,
            $startDate,
            $expirationDate,
            $basePrice,
            $discountType,
            $discountValue,
            $finalPrice
        ) {
            /*
             * Make sure the member exists.
             */
            $member = Member::findOrFail(
                $validated['member_id']
            );

            /*
             * Create the membership.
             */
            $membership = Membership::create([
                'member_id' => $member->id,
                'membership_type_id' => $validated['membership_type_id'],
                'start_date' => $startDate,
                'expiration_date' => $expirationDate,
                'status' => $validated['status'],
                'base_price' => $basePrice,
                'discount_type' => $discountType,
                'discount_value' => $discountValue,
                'final_price' => $finalPrice,
                'notes' => $validated['notes'] ?? null,
            ]);

            /*
             * A member should only have one active
             * membership at a time.
             */
            if ($membership->status === 'active') {
                Membership::query()
                    ->where('member_id', $membership->member_id)
                    ->where('id', '!=', $membership->id)
                    ->where('status', 'active')
                    ->update([
                        'status' => 'expired',
                    ]);
            }

            return $membership;
        });

        return response()->json([
            'message' => 'Membership created successfully.',
            'membership' => $membership->load([
                'member',
                'membershipType',
            ]),
        ], 201);
    }

    /**
     * Update a membership.
     */
    public function update(
        UpdateMembershipRequest $request,
        Membership $membership
    ): JsonResponse {
        $validated = $request->validated();

        /*
         * If membership type is changed and the request
         * does not explicitly provide pricing information,
         * recalculate the membership pricing.
         */
        if (
            isset($validated['membership_type_id'])
            && $validated['membership_type_id']
                != $membership->membership_type_id
        ) {
            $membershipType = MembershipType::findOrFail(
                $validated['membership_type_id']
            );

            $basePrice = (float) $membershipType->price;

            $discountType = $validated['discount_type']
                ?? $membership->discount_type
                ?? $membershipType->discount_type;

            $discountValue = array_key_exists(
                'discount_value',
                $validated
            )
                ? (float) ($validated['discount_value'] ?? 0)
                : (
                    $membership->discount_value
                    ?? $membershipType->discount_value
                );

            $validated['base_price'] = $basePrice;
            $validated['discount_type'] = $discountType;
            $validated['discount_value'] = $discountValue;
            $validated['final_price'] = $this->calculateFinalPrice(
                $basePrice,
                $discountType,
                $discountValue
            );

            /*
             * Recalculate expiration when the membership type
             * changes and a new start date is supplied.
             */
            if (isset($validated['start_date'])) {
                $validated['expiration_date'] = Carbon::parse(
                    $validated['start_date']
                )
                    ->addDays(
                        $membershipType->duration_days - 1
                    );
            }
        }

        /*
         * Recalculate final price when discount values are
         * changed without changing the membership type.
         */
        if (
            array_key_exists('discount_type', $validated)
            || array_key_exists('discount_value', $validated)
        ) {
            $basePrice = array_key_exists(
                'base_price',
                $validated
            )
                ? (float) $validated['base_price']
                : (float) $membership->base_price;

            $discountType = $validated['discount_type']
                ?? $membership->discount_type;

            $discountValue = array_key_exists(
                'discount_value',
                $validated
            )
                ? (float) ($validated['discount_value'] ?? 0)
                : (float) $membership->discount_value;

            $validated['final_price'] = $this->calculateFinalPrice(
                $basePrice,
                $discountType,
                $discountValue
            );
        }

        $membership->update($validated);

        /*
         * Make sure only one membership is active
         * for this member.
         */
        if ($membership->status === 'active') {
            Membership::query()
                ->where('member_id', $membership->member_id)
                ->where('id', '!=', $membership->id)
                ->where('status', 'active')
                ->update([
                    'status' => 'expired',
                ]);
        }

        return response()->json([
            'message' => 'Membership updated successfully.',
            'membership' => $membership->fresh([
                'member',
                'membershipType',
            ]),
        ]);
    }

    /**
     * Renew a membership.
     */
    public function renew(
        RenewMembershipRequest $request,
        Membership $membership
    ): JsonResponse {
        $validated = $request->validated();

        $membershipType = MembershipType::findOrFail(
            $validated['membership_type_id']
                ?? $membership->membership_type_id
        );

        /*
         * If the current membership is still active,
         * start the renewal on the following day.
         *
         * Otherwise, start the renewal today.
         */
        $startDate = isset($validated['start_date'])
            ? Carbon::parse($validated['start_date'])
            : (
                $membership->expiration_date
                && !$membership->expiration_date->isBefore(today())
                    ? $membership->expiration_date
                        ->copy()
                        ->addDay()
                    : today()
            );

        $expirationDate = $startDate
            ->copy()
            ->addDays(
                $membershipType->duration_days - 1
            );

        $basePrice = (float) $membershipType->price;

        /*
         * Renewal uses the membership type's default
         * discount configuration.
         */
        $discountType = $membershipType->discount_type;

        $discountValue = (float) $membershipType->discount_value;

        $finalPrice = $this->calculateFinalPrice(
            $basePrice,
            $discountType,
            $discountValue
        );

        $newMembership = DB::transaction(function () use (
            $membership,
            $membershipType,
            $startDate,
            $expirationDate,
            $basePrice,
            $discountType,
            $discountValue,
            $finalPrice,
            $validated
        ) {
            $newMembership = Membership::create([
                'member_id' => $membership->member_id,
                'membership_type_id' => $membershipType->id,
                'start_date' => $startDate,
                'expiration_date' => $expirationDate,
                'status' => $validated['status'] ?? 'active',
                'base_price' => $basePrice,
                'discount_type' => $discountType,
                'discount_value' => $discountValue,
                'final_price' => $finalPrice,
                'renewed_from_id' => $membership->id,
                'notes' => $validated['notes'] ?? null,
            ]);

            /*
             * Once the renewal becomes active, the previous
             * membership is no longer the active membership.
             */
            if ($newMembership->status === 'active') {
                Membership::query()
                    ->where('member_id', $newMembership->member_id)
                    ->where('id', '!=', $newMembership->id)
                    ->where('status', 'active')
                    ->update([
                        'status' => 'expired',
                    ]);
            }

            return $newMembership;
        });

        return response()->json([
            'message' => 'Membership renewed successfully.',
            'membership' => $newMembership->load([
                'member',
                'membershipType',
                'renewedFrom',
            ]),
        ], 201);
    }

    /**
     * Suspend a membership.
     */
    public function suspend(
        Membership $membership
    ): JsonResponse {
        $membership->update([
            'status' => 'suspended',
        ]);

        return response()->json([
            'message' => 'Membership suspended successfully.',
            'membership' => $membership->fresh([
                'member',
                'membershipType',
            ]),
        ]);
    }

    /**
     * Cancel a membership.
     */
    public function cancel(
        Membership $membership
    ): JsonResponse {
        $membership->update([
            'status' => 'cancelled',
        ]);

        return response()->json([
            'message' => 'Membership cancelled successfully.',
            'membership' => $membership->fresh([
                'member',
                'membershipType',
            ]),
        ]);
    }

    /**
     * Display memberships expiring soon.
     */
    public function expiring(ExpiringMembershipRequest $request): JsonResponse {
        $days = $request->integer('days', 7);

        Membership::query()
            ->whereIn('status', ['active', 'pending'])
            ->whereDate('expiration_date', '<', today())
            ->update([
                'status' => 'expired',
            ]);

        $memberships = Membership::query()
            ->with([
                'member',
                'membershipType',
            ])
            ->where('status', 'active')
            ->whereBetween('expiration_date', [
                today(),
                today()->copy()->addDays($days),
            ])
            ->orderBy('expiration_date')
            ->get();

        return response()->json([
            'days' => $days,
            'memberships' => $memberships,
        ]);
    }

    /**
     * Membership statistics.
     */
    public function statistics(): JsonResponse
    {
        Membership::query()
            ->whereIn('status', ['active', 'pending'])
            ->whereDate('expiration_date', '<', today())
            ->update([
                'status' => 'expired',
            ]);

        return response()->json([
            'total' => Membership::count(),
            'active' => Membership::where('status','active')->count(),
            'pending' => Membership::where('status','pending')->count(),
            'expired' => Membership::where('status','expired')->count(),
            'suspended' => Membership::where('status','suspended')->count(),
            'cancelled' => Membership::where('status','cancelled')->count(),
            'expiring_7_days' => Membership::query()
                ->where('status', 'active')
                ->whereBetween('expiration_date', [
                    today(),
                    today()->addDays(7),
                ])
                ->count(),
        ]);
    }

    /**
     * Delete a membership.
     *
     * Active memberships cannot be deleted.
     * They should be cancelled instead.
     */
    public function destroy(
        Membership $membership
    ): JsonResponse {
        if ($membership->status === 'active') {
            return response()->json([
                'message' => 'Active memberships cannot be deleted. Cancel the membership instead.',
            ], 422);
        }

        $membership->delete();

        return response()->json([
            'message' => 'Membership deleted successfully.',
        ]);
    }

    /**
     * Calculate the final membership price.
     */
    private function calculateFinalPrice(
        float $basePrice,
        ?string $discountType,
        float $discountValue
    ): float {
        if (!$discountType || $discountType === 'none') {
            return max(0, $basePrice);
        }

        if ($discountType === 'percentage') {
            return max(0,$basePrice - ($basePrice * ($discountValue / 100)));
        }

        if ($discountType === 'fixed') {
            return max(0,$basePrice - $discountValue);
        }

        return max(0, $basePrice);
    }
}