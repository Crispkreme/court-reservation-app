<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\CourtSchedule\CourtScheduleRequest;
use App\Interfaces\CourtScheduleInterface;
use Illuminate\Http\JsonResponse;

class CourtScheduleController extends Controller
{
    public function __construct(
        protected CourtScheduleInterface $repository
    ) {}

    /**
     * Display daily or weekly court schedules.
     */
    public function index(
        CourtScheduleRequest $request
    ): JsonResponse {
        $validated = $request->validated();

        $schedules = $this->repository->getSchedule(
            $validated['date'] ?? now('Asia/Dubai')->toDateString(),
            $validated['view'] ?? 'daily',
            isset($validated['court_id'])
                ? (int) $validated['court_id']
                : null,
            $request->user()?->role === 'admin'
        );

        return response()->json([
            'success' => true,
            'message' => 'Court schedules retrieved successfully.',
            'data' => $schedules,
        ]);
    }
}
