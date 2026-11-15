<?php

namespace App\Http\Controllers;

use App\Interfaces\CourtUtilizationInterface;
use App\Models\Court;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CourtUtilizationController extends Controller
{
    public function __construct(
        private readonly CourtUtilizationInterface $repository
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => ['nullable', 'date_format:Y-m-d'],
            'end_date' => ['nullable', 'date_format:Y-m-d'],
            'court_id' => ['nullable', 'integer', 'exists:courts,id'],
        ]);

        $user = $request->user();

        if (!$user || !in_array($user->role, ['admin', 'member'], true)) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        $today = CarbonImmutable::now(Court::TIME_ZONE);
        $start = $validated['start_date'] ?? $today->startOfMonth()->toDateString();
        $end = $validated['end_date'] ?? $today->toDateString();

        $startDate = CarbonImmutable::createFromFormat(
            '!Y-m-d',
            $start,
            Court::TIME_ZONE
        );

        $endDate = CarbonImmutable::createFromFormat(
            '!Y-m-d',
            $end,
            Court::TIME_ZONE
        );

        if ($endDate->lessThan($startDate)) {
            throw ValidationException::withMessages([
                'end_date' => [
                    'End date must be on or after start date.',
                ],
            ]);
        }

        if ($startDate->diffInDays($endDate) > 366) {
            throw ValidationException::withMessages([
                'end_date' => [
                    'Date range cannot exceed 366 days.',
                ],
            ]);
        }

        $courtId = $validated['court_id'] ?? null;

        $data = $this->repository->summary(
            $start,
            $end,
            $courtId
        );

        return response()->json([
            'data' => $data,
        ]);
    }
}