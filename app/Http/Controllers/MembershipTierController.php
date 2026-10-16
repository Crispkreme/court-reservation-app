<?php

namespace App\Http\Controllers;

use App\Models\MembershipTier;
use Illuminate\Http\JsonResponse;

class MembershipTierController extends Controller
{
    public function index(): JsonResponse
    {
        $tiers = MembershipTier::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $tiers,
        ]);
    }
}