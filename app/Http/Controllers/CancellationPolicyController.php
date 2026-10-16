<?php

namespace App\Http\Controllers;

use App\Models\CancellationPolicy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

use App\Http\Requests\StoreCancellationPolicyRequest;
use App\Http\Requests\UpdateCancellationPolicyRequest;

class CancellationPolicyController extends Controller
{
    public function index(): JsonResponse
    {
        $policies = CancellationPolicy::query()
            ->orderByDesc('priority')
            ->orderByDesc('minimum_hours_before_booking')
            ->get();

        return response()->json([
            'data' => $policies,
        ]);
    }

    public function store(StoreCancellationPolicyRequest $request): JsonResponse {
        $validated = $request->validated();
        $policy = CancellationPolicy::create($validated);

        return response()->json([
            'message' => 'Cancellation policy created successfully.',
            'data' => $policy,
        ], 201);
    }

    public function show(CancellationPolicy $cancellationPolicy): JsonResponse {
        return response()->json([
            'data' => $cancellationPolicy,
        ]);
    }

    public function update(
        UpdateCancellationPolicyRequest $request,
        CancellationPolicy $cancellationPolicy
    ): JsonResponse {
        $validated = $request->validated();

        $cancellationPolicy->update($validated);

        return response()->json([
            'message' => 'Cancellation policy updated successfully.',
            'data' => $cancellationPolicy->fresh(),
        ]);
    }

    public function destroy(CancellationPolicy $cancellationPolicy): JsonResponse {
        $cancellationPolicy->delete();

        return response()->json([
            'message' => 'Cancellation policy deleted successfully.',
        ]);
    }
}