<?php

namespace App\Interfaces;

use App\Models\CourtMaintenancePeriod;
use Illuminate\Database\Eloquent\Collection;

interface CourtMaintenancePeriodInterface
{
    public function getAll(?int $courtId = null): Collection;
    public function findById(int $id): ?CourtMaintenancePeriod;
    public function create(array $data): CourtMaintenancePeriod;
    public function update(CourtMaintenancePeriod $maintenancePeriod, array $data
    ): CourtMaintenancePeriod;
    public function delete(CourtMaintenancePeriod $maintenancePeriod
    ): bool;
    public function getByCourt(int $courtId): Collection;
}
