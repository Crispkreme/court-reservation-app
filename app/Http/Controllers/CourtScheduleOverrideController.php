<?php

namespace App\Http\Controllers;

use App\Http\Requests\CourtScheduleOverride\CourtScheduleOverrideRequest;
use App\Http\Requests\CourtScheduleOverride\CourtScheduleOverrideFilterRequest;
use App\Interfaces\CourtScheduleOverrideInterface;
use App\Models\CourtSchedule;
use Illuminate\Http\JsonResponse;

class CourtScheduleOverrideController extends Controller
{
    public function __construct(
        private readonly CourtScheduleOverrideInterface $repository
    ) {}

    public function index(
        CourtScheduleOverrideFilterRequest $request
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'data' => $this->repository->all($request->validated()),
        ]);
    }

    public function show(
        CourtSchedule $courtScheduleOverride
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'data' => $this->repository->find($courtScheduleOverride->id),
        ]);
    }

    public function store(
        CourtScheduleOverrideRequest $request
    ): JsonResponse {
        $schedule = $this->repository->create(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Schedule override created successfully.',
            'data' => $schedule,
        ], 201);
    }

    public function update(
        CourtScheduleOverrideRequest $request,
        CourtSchedule $courtScheduleOverride
    ): JsonResponse {
        $schedule = $this->repository->update(
            $courtScheduleOverride,
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Schedule override updated successfully.',
            'data' => $schedule,
        ]);
    }

    public function destroy(
        CourtSchedule $courtScheduleOverride
    ): JsonResponse {
        $this->repository->delete($courtScheduleOverride);

        return response()->json([
            'success' => true,
            'message' => 'Schedule override deleted successfully.',
        ]);
    }
}
