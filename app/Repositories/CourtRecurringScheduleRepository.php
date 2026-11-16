<?php

namespace App\Repositories;

use App\Interfaces\CourtRecurringScheduleInterface;
use App\Models\CourtRecurringSchedule;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

class CourtRecurringScheduleRepository implements CourtRecurringScheduleInterface
{
    public function all(?int $courtId = null): Collection
    {
        return CourtRecurringSchedule::query()
            ->with('court:id,name')
            ->when(
                $courtId !== null,
                fn ($query) => $query->where('court_id', $courtId)
            )
            ->orderBy('court_id')
            ->orderBy('day_of_week')
            ->orderByDesc('effective_from')
            ->get();
    }

    public function find(int $id): CourtRecurringSchedule
    {
        return CourtRecurringSchedule::with('court:id,name')
            ->findOrFail($id);
    }

    public function create(array $data): CourtRecurringSchedule
    {
        $this->validateConflict($data);

        return CourtRecurringSchedule::create($data)
            ->load('court:id,name');
    }

    public function update(
        CourtRecurringSchedule $schedule,
        array $data
    ): CourtRecurringSchedule {
        $merged = array_merge(
            $schedule->only([
                'court_id',
                'day_of_week',
                'opening_time',
                'closing_time',
                'status',
                'effective_from',
                'effective_until',
                'is_active',
                'notes',
            ]),
            $data
        );

        $this->validateConflict($merged, $schedule->id);

        $schedule->update($data);

        return $schedule->refresh()->load('court:id,name');
    }

    public function delete(CourtRecurringSchedule $schedule): bool
    {
        return (bool) $schedule->delete();
    }

    private function validateConflict(
        array $data,
        ?int $excludeId = null
    ): void {
        if (!($data['is_active'] ?? true)) {
            return;
        }

        $query = CourtRecurringSchedule::query()
            ->where('court_id', $data['court_id'])
            ->where('day_of_week', $data['day_of_week'])
            ->where('is_active', true)
            ->when(
                $excludeId !== null,
                fn ($query) => $query->whereKeyNot($excludeId)
            )
            ->where(function ($query) use ($data) {
                $query->whereNull('effective_until')
                    ->orWhere(
                        'effective_until',
                        '>=',
                        $data['effective_from']
                    );
            });

        if (!empty($data['effective_until'])) {
            $query->where(
                'effective_from',
                '<=',
                $data['effective_until']
            );
        }

        if ($query->exists()) {
            throw ValidationException::withMessages([
                'day_of_week' => [
                    'An active recurring schedule already exists for this court and weekday within the selected date range.',
                ],
            ]);
        }
    }
}
