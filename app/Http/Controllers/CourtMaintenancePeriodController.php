<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Court;
use App\Models\CourtMaintenancePeriod;
use Illuminate\Http\Request;

use App\Http\Requests\StoreCourtMaintenanceRequest;
use App\Http\Requests\UpdateCourtMaintenanceRequest;

class CourtMaintenancePeriodController extends Controller
{
    public function index(Court $court)
    {
        return response()->json(
            $court->maintenancePeriods()
                ->orderBy('maintenance_date')
                ->orderBy('start_time')
                ->get()
        );
    }

    public function store(StoreCourtMaintenanceRequest $request,Court $court) {
        $validated = $request->validated();

        $maintenance = $court
            ->maintenancePeriods()
            ->create($validated);

        return response()->json([
            'message' => 'Maintenance period created successfully.',
            'data' => $maintenance,
        ], 201);
    }

    public function update(UpdateCourtMaintenanceRequest $request,CourtMaintenancePeriod $maintenancePeriod) {
        $validated = $request->validated();

        $maintenancePeriod->update($validated);

        return response()->json([
            'message' => 'Maintenance period updated successfully.',
            'data' => $maintenancePeriod->fresh(),
        ]);
    }

    public function destroy(CourtMaintenancePeriod $maintenancePeriod) {
        $maintenancePeriod->delete();

        return response()->json([
            'message' => 'Maintenance period deleted successfully.',
        ]);
    }
}