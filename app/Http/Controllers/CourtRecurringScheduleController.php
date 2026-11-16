<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\CourtRecurringSchedule\CourtRecurringScheduleRequest;
use App\Interfaces\CourtRecurringScheduleInterface;
use App\Models\CourtRecurringSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourtRecurringScheduleController extends Controller
{
    public function __construct(
        private readonly CourtRecurringScheduleInterface $repository
    ) {}

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'court_id' => ['nullable', 'integer', 'exists:courts,id'],
        ]);

        return response()->json([
            'success' => true,
            'data' => $this->repository->all(
                $request->filled('court_id')
                    ? (int) $request->court_id
                    : null
            ),
        ]);
    }

    public function show(CourtRecurringSchedule $courtRecurringSchedule): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->repository->find(
                $courtRecurringSchedule->id
            ),
        ]);
    }

    public function store(CourtRecurringScheduleRequest $request): JsonResponse
    {
        $schedule = $this->repository->create(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Recurring schedule created successfully.',
            'data' => $schedule,
        ], 201);
    }

    public function update(
        CourtRecurringScheduleRequest $request,
        CourtRecurringSchedule $courtRecurringSchedule
    ): JsonResponse {
        $schedule = $this->repository->update(
            $courtRecurringSchedule,
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Recurring schedule updated successfully.',
            'data' => $schedule,
        ]);
    }

    public function destroy(
        CourtRecurringSchedule $courtRecurringSchedule
    ): JsonResponse {
        $this->repository->delete($courtRecurringSchedule);

        return response()->json([
            'success' => true,
            'message' => 'Recurring schedule deleted successfully.',
        ]);
    }
}
