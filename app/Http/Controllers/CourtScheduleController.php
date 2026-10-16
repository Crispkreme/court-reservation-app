<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\CourtSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

use App\Http\Requests\IndexCourtScheduleListRequest;
use App\Http\Requests\StoreCourtScheduleRequest;
use App\Http\Requests\UpdateCourtScheduleRequest;

class CourtScheduleController extends Controller
{
    public function index(IndexCourtScheduleListRequest $request): JsonResponse {
        $validated = $request->validated();

        $query = CourtSchedule::query()
            ->with('court')
            ->where('is_active', true);

        if (isset($validated['court_id'])) {
            $query->where('court_id', $validated['court_id']);
        }

        if (isset($validated['day_of_week'])) {
            $query->where('day_of_week', $validated['day_of_week']);
        }

        $schedules = $query
            ->orderBy('court_id')
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'data' => $schedules,
        ]);
    }

    public function store(StoreCourtScheduleRequest $request): JsonResponse {
        $validated = $request->validated();

        $schedule = CourtSchedule::create($validated);

        return response()->json([
            'message' => 'Court schedule created successfully.',
            'data' => $schedule->load('court'),
        ], 201);
    }

    public function show(CourtSchedule $courtSchedule): JsonResponse
    {
        return response()->json([
            'data' => $courtSchedule->load('court'),
        ]);
    }

    public function update(
        UpdateCourtScheduleRequest $request,
        CourtSchedule $courtSchedule
    ): JsonResponse {
        $validated = $request->validated();

        $courtSchedule->update($validated);

        return response()->json([
            'message' => 'Court schedule updated successfully.',
            'data' => $courtSchedule->fresh()->load('court'),
        ]);
    }

    public function destroy(CourtSchedule $courtSchedule): JsonResponse
    {
        $courtSchedule->delete();

        return response()->json([
            'message' => 'Court schedule deleted successfully.',
        ]);
    }
}