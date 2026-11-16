<?php

namespace App\Interfaces;

use App\Models\CourtRecurringSchedule;
use Illuminate\Database\Eloquent\Collection;

interface CourtRecurringScheduleInterface
{
    public function all(?int $courtId = null): Collection;
    public function find(int $id): CourtRecurringSchedule;
    public function create(array $data): CourtRecurringSchedule;
    public function update(CourtRecurringSchedule $schedule,array $data): CourtRecurringSchedule;
    public function delete(CourtRecurringSchedule $schedule): bool;
}
