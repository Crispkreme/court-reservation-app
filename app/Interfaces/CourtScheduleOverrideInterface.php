<?php

namespace App\Interfaces;

use App\Models\CourtSchedule;
use Illuminate\Database\Eloquent\Collection;

interface CourtScheduleOverrideInterface
{
    public function all(array $filters = []): Collection;
    public function find(int $id): CourtSchedule;
    public function create(array $data): CourtSchedule;
    public function update(CourtSchedule $schedule, array $data): CourtSchedule;
    public function delete(CourtSchedule $schedule): bool;
}
