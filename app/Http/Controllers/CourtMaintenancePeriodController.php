<?php

namespace App\Http\Controllers;

use App\Http\Requests\CourtMaintenancePeriod\StoreCourtMaintenancePeriodRequest;
use App\Http\Requests\CourtMaintenancePeriod\UpdateCourtMaintenancePeriodRequest;
use App\Interfaces\CourtMaintenancePeriodInterface;
use App\Models\Court;
use App\Models\CourtMaintenancePeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourtMaintenancePeriodController extends Controller
{
    public function __construct(
        private readonly CourtMaintenancePeriodInterface $service
    ) {}

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'court_id' => ['nullable', 'integer', 'exists:courts,id'],
        ]);

        $courtId = $request->filled('court_id')
            ? $request->integer('court_id')
            : null;

        return response()->json([
            'data' => $this->service->getAll($courtId),
        ]);
    }

    public function store(
        StoreCourtMaintenancePeriodRequest $request
    ): JsonResponse {
        $period = $this->service->create(
            $request->validated()
        );

        return response()->json([
            'message' => 'Maintenance period created successfully.',
            'data' => $period,
        ], 201);
    }

    public function show(
        CourtMaintenancePeriod $maintenancePeriod
    ): JsonResponse {
        return response()->json([
            'data' => $this->service->findById(
                $maintenancePeriod->id
            ),
        ]);
    }

    public function update(
        UpdateCourtMaintenancePeriodRequest $request,
        CourtMaintenancePeriod $maintenancePeriod
    ): JsonResponse {
        $period = $this->service->update(
            $maintenancePeriod,
            $request->validated()
        );

        return response()->json([
            'message' => 'Maintenance period updated successfully.',
            'data' => $period,
        ]);
    }

    public function destroy(
        CourtMaintenancePeriod $maintenancePeriod
    ): JsonResponse {
        $this->service->delete($maintenancePeriod);

        return response()->json([
            'message' => 'Maintenance period deleted successfully.',
        ]);
    }

    public function byCourt(Court $court): JsonResponse
    {
        return response()->json([
            'data' => $this->service->getByCourt($court->id),
        ]);
    }
}
