<?php

namespace App\Repositories;

use App\Interfaces\CourtScheduleOverrideInterface;
use App\Models\Booking;
use App\Models\CourtSchedule;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CourtScheduleOverrideRepository implements CourtScheduleOverrideInterface
{
    public function all(array $filters = []): Collection
    {
        return CourtSchedule::query()
            ->with('court:id,name')
            ->when(
                !empty($filters['court_id']),
                fn ($query) => $query->where('court_id', $filters['court_id'])
            )
            ->when(
                !empty($filters['date_from']),
                fn ($query) => $query->whereDate('date', '>=', $filters['date_from'])
            )
            ->when(
                !empty($filters['date_to']),
                fn ($query) => $query->whereDate('date', '<=', $filters['date_to'])
            )
            ->when(
                !empty($filters['status']),
                fn ($query) => $query->where('status', $filters['status'])
            )
            ->orderBy('date')
            ->orderBy('court_id')
            ->get();
    }

    public function find(int $id): CourtSchedule
    {
        return CourtSchedule::with('court:id,name')->findOrFail($id);
    }

    public function create(array $data): CourtSchedule
    {
        return DB::transaction(function () use ($data) {
            $this->validateDuplicate($data);
            $this->validateBookings($data);

            return CourtSchedule::create($data)
                ->load('court:id,name');
        });
    }

    public function update(CourtSchedule $schedule, array $data): CourtSchedule
    {
        return DB::transaction(function () use ($schedule, $data) {
            $this->validateDuplicate($data, $schedule->id);
            $this->validateBookings($data);

            $schedule->update($data);

            return $schedule->refresh()->load('court:id,name');
        });
    }

    public function delete(CourtSchedule $schedule): bool
    {
        return (bool) $schedule->delete();
    }

    private function validateDuplicate(
        array $data,
        ?int $excludeId = null
    ): void {
        $exists = CourtSchedule::query()
            ->where('court_id', $data['court_id'])
            ->whereDate('date', $data['date'])
            ->when(
                $excludeId !== null,
                fn ($query) => $query->where('id', '!=', $excludeId)
            )
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'date' => [
                    'A schedule override already exists for this court on the selected date.',
                ],
            ]);
        }
    }

    private function validateBookings(array $data): void
    {
        $bookings = Booking::query()
            ->where('court_id', $data['court_id'])
            ->whereDate('date', $data['date'])
            ->whereIn('status', ['confirmed', 'completed'])
            ->get(['start_time', 'end_time']);

        if ($bookings->isEmpty()) {
            return;
        }

        if ($data['status'] === CourtSchedule::STATUS_CLOSED) {
            throw ValidationException::withMessages([
                'status' => [
                    'This court has existing bookings on the selected date and cannot be closed.',
                ],
            ]);
        }

        $openingTime = substr($data['opening_time'], 0, 5);
        $closingTime = substr($data['closing_time'], 0, 5);

        foreach ($bookings as $booking) {
            $bookingStart = substr((string) $booking->start_time, 0, 5);
            $bookingEnd = substr((string) $booking->end_time, 0, 5);

            if (
                $bookingStart < $openingTime ||
                $bookingEnd > $closingTime
            ) {
                throw ValidationException::withMessages([
                    'opening_time' => [
                        'The selected operating hours conflict with an existing booking.',
                    ],
                ]);
            }
        }
    }
}
