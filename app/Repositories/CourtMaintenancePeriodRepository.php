<?php

namespace App\Repositories;

use App\Interfaces\CourtMaintenancePeriodInterface;
use App\Models\CourtMaintenancePeriod;
use Illuminate\Database\Eloquent\Collection;

class CourtMaintenancePeriodRepository implements CourtMaintenancePeriodInterface
{
    public function getAll(?int $courtId = null): Collection
    {
        return CourtMaintenancePeriod::query()
            ->with('court:id,name')
            ->when(
                $courtId !== null,
                fn ($query) => $query->where('court_id', $courtId)
            )
            ->orderBy('start_at')
            ->get();
    }

    public function findById(int $id): ?CourtMaintenancePeriod
    {
        return CourtMaintenancePeriod::query()
            ->with('court:id,name')
            ->find($id);
    }

    public function create(array $data): CourtMaintenancePeriod
    {
        $period = CourtMaintenancePeriod::create($data);
        return $period->load('court:id,name');
    }

    public function update(
        CourtMaintenancePeriod $maintenancePeriod,
        array $data
    ): CourtMaintenancePeriod {
        $maintenancePeriod->update($data);

        return $maintenancePeriod->fresh()->load('court:id,name');
    }

    public function delete(
        CourtMaintenancePeriod $maintenancePeriod
    ): bool {
        return (bool) $maintenancePeriod->delete();
    }

    public function getByCourt(int $courtId): Collection
    {
        return CourtMaintenancePeriod::query()
            ->where('court_id', $courtId)
            ->where('end_at', '>', now())
            ->orderBy('start_at')
            ->get();
    }
}
