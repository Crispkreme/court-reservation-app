<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\CourtScheduleOverride;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

use App\Http\Requests\IndexCourtScheduleOverrideRequest;
use App\Http\Requests\StoreCourtScheduleOverrideRequest;
use App\Http\Requests\UpdateCourtScheduleOverrideRequest;

class CourtScheduleOverrideController extends Controller
{
    public function index(IndexCourtScheduleOverrideRequest $request): JsonResponse {
        $validated = $request->validated();

        $query = CourtScheduleOverride::query()
            ->with('court')
            ->where('is_active', true);

        if (isset($validated['court_id'])) {
            $query->where('court_id', $validated['court_id']);
        }

        if (isset($validated['date'])) {
            $query->whereDate('date', $validated['date']);
        }

        if (isset($validated['from'])) {
            $query->whereDate('date', '>=', $validated['from']);
        }

        if (isset($validated['to'])) {
            $query->whereDate('date', '<=', $validated['to']);
        }

        $overrides = $query
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'data' => $overrides,
        ]);
    }

    public function store(StoreCourtScheduleOverrideRequest $request): JsonResponse {
        $validated = $request->validated();

        $override = CourtScheduleOverride::create($validated);

        return response()->json([
            'message' => 'Schedule override created successfully.',
            'data' => $override->load('court'),
        ], 201);
    }

    public function show(CourtScheduleOverride $courtScheduleOverride): JsonResponse {
        return response()->json([
            'data' => $courtScheduleOverride->load('court'),
        ]);
    }

    public function update(
        UpdateCourtScheduleOverrideRequest $request,
        CourtScheduleOverride $courtScheduleOverride
    ): JsonResponse {
        $validated = $request->validated();

        $courtScheduleOverride->update($validated);

        return response()->json([
            'message' => 'Schedule override updated successfully.',
            'data' => $courtScheduleOverride
                ->fresh()
                ->load('court'),
        ]);
    }

    public function destroy(
        CourtScheduleOverride $courtScheduleOverride
    ): JsonResponse {
        $courtScheduleOverride->delete();

        return response()->json([
            'message' => 'Schedule override deleted successfully.',
        ]);
    }
}