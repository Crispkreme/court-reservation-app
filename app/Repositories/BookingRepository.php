<?php

namespace App\Repositories;

use App\Interfaces\BookingInterface;
use App\Models\Booking;
use App\Models\Court;
use App\Models\CourtMaintenancePeriod;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BookingRepository implements BookingInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Booking::query()->with(['court', 'user']);

        $this->applyFilters($query, $filters);

        return $query
            ->orderByDesc('start_at')
            ->paginate(
                min(max((int) ($filters['per_page'] ?? 10), 1), 100)
            );
    }

    public function findById(int $id): ?Booking
    {
        return Booking::query()
            ->with(['court', 'user'])
            ->find($id);
    }

    public function create(array $data): Booking
    {
        return DB::transaction(function () use ($data) {
            $court = Court::query()
                ->lockForUpdate()
                ->findOrFail($data['court_id']);

            $this->validateBooking($court, $data);

            if ($this->hasOverlappingBooking(
                $court->id,
                $data['start_at'],
                $data['end_at']
            )) {
                throw ValidationException::withMessages([
                    'start_at' => [
                        'The selected court is already booked during this time.',
                    ],
                ]);
            }

            $booking = Booking::create([
                'court_id' => $court->id,
                'user_id' => $data['user_id'],
                'start_at' => $data['start_at'],
                'end_at' => $data['end_at'],
                'duration_minutes' => $data['duration_minutes'],
                'total_price' => $court->calculateBookingPrice(
                    (int) $data['duration_minutes']
                ),
                'status' => Booking::STATUS_PENDING,
            ]);

            return $booking->load(['court', 'user']);
        });
    }

    public function update(int $id, array $data): Booking
    {
        return DB::transaction(function () use ($id, $data) {
            $booking = Booking::query()->findOrFail($id);

            $courtId = (int) ($data['court_id'] ?? $booking->court_id);

            $court = Court::query()
                ->lockForUpdate()
                ->findOrFail($courtId);

            $booking->refresh();

            $merged = array_merge([
                'court_id' => $booking->court_id,
                'user_id' => $booking->user_id,
                'start_at' => $booking->start_at->format('Y-m-d H:i:s'),
                'end_at' => $booking->end_at->format('Y-m-d H:i:s'),
                'duration_minutes' => $booking->duration_minutes,
            ], $data);

            $merged['start_at'] = Carbon::parse(
                $merged['start_at'],
                Court::TIME_ZONE
            )->format('Y-m-d H:i:s');

            $merged['end_at'] = Carbon::parse(
                $merged['end_at'],
                Court::TIME_ZONE
            )->format('Y-m-d H:i:s');

            $start = Carbon::parse($merged['start_at'], Court::TIME_ZONE);
            $end = Carbon::parse($merged['end_at'], Court::TIME_ZONE);

            $merged['duration_minutes'] = (int) $start->diffInMinutes($end);

            $this->validateBooking($court, $merged);

            if ($this->hasOverlappingBooking(
                $court->id,
                $merged['start_at'],
                $merged['end_at'],
                $booking->id
            )) {
                throw ValidationException::withMessages([
                    'start_at' => [
                        'The selected court is already booked during this time.',
                    ],
                ]);
            }

            $booking->update([
                'court_id' => $court->id,
                'user_id' => $merged['user_id'],
                'start_at' => $merged['start_at'],
                'end_at' => $merged['end_at'],
                'duration_minutes' => $merged['duration_minutes'],
                'total_price' => $court->calculateBookingPrice(
                    (int) $merged['duration_minutes']
                ),
            ]);

            return $booking->refresh()->load(['court', 'user']);
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $booking = Booking::query()->findOrFail($id);

            return (bool) $booking->delete();
        });
    }

    public function updateStatus(int $id, string $status): Booking
    {
        if (! in_array($status, Booking::STATUSES, true)) {
            throw ValidationException::withMessages([
                'status' => ['Invalid booking status.'],
            ]);
        }

        return DB::transaction(function () use ($id, $status) {
            $booking = Booking::query()->findOrFail($id);

            $court = Court::query()
                ->lockForUpdate()
                ->findOrFail($booking->court_id);

            $booking->refresh();

            if (in_array($status, [
                Booking::STATUS_PENDING,
                Booking::STATUS_CONFIRMED,
            ], true)) {
                $data = [
                    'start_at' => $booking->start_at->format('Y-m-d H:i:s'),
                    'end_at' => $booking->end_at->format('Y-m-d H:i:s'),
                    'duration_minutes' => $booking->duration_minutes,
                ];

                $this->validateBooking($court, $data);

                if ($this->hasOverlappingBooking(
                    $court->id,
                    $data['start_at'],
                    $data['end_at'],
                    $booking->id
                )) {
                    throw ValidationException::withMessages([
                        'status' => [
                            'Cannot activate a booking that overlaps another active booking.',
                        ],
                    ]);
                }
            }

            $booking->update(['status' => $status]);

            return $booking->refresh()->load(['court', 'user']);
        });
    }

    public function cancel(int $id, int $userId): Booking
    {
        return DB::transaction(function () use ($id, $userId) {
            $booking = Booking::query()
                ->where('user_id', $userId)
                ->findOrFail($id);

            $court = Court::query()
                ->lockForUpdate()
                ->findOrFail($booking->court_id);

            $booking->refresh();

            if ($booking->user_id !== $userId) {
                abort(404);
            }

            if (! in_array($booking->status, [
                Booking::STATUS_PENDING,
                Booking::STATUS_CONFIRMED,
            ], true)) {
                throw ValidationException::withMessages([
                    'status' => [
                        'Only pending or confirmed bookings can be cancelled.',
                    ],
                ]);
            }

            if ($booking->start_at->lte(Carbon::now(Court::TIME_ZONE))) {
                throw ValidationException::withMessages([
                    'start_at' => [
                        'Bookings that have already started cannot be cancelled.',
                    ],
                ]);
            }

            $booking->update([
                'status' => Booking::STATUS_CANCELLED,
            ]);

            return $booking->refresh()->load(['court', 'user']);
        });
    }

    public function getByCourt(
        int $courtId,
        array $filters = []
    ): Collection {
        $query = Booking::query()
            ->with(['court', 'user'])
            ->forCourt($courtId);

        $this->applyFilters($query, $filters);

        return $query->orderBy('start_at')->get();
    }

    public function getByUser(
        int $userId,
        array $filters = []
    ): Collection {
        $query = Booking::query()
            ->with(['court', 'user'])
            ->where('user_id', $userId);

        $this->applyFilters($query, $filters);

        return $query->orderByDesc('start_at')->get();
    }

    public function getForCalendar(
        string $startDate,
        string $endDate,
        ?int $courtId = null,
        ?string $status = null
    ): Collection {
        $start = Carbon::parse(
            $startDate,
            Court::TIME_ZONE
        )->startOfDay();

        $end = Carbon::parse(
            $endDate,
            Court::TIME_ZONE
        )->addDay()->startOfDay();

        return Booking::forCalendar(
            $start,
            $end,
            $courtId,
            $status
        )->get();
    }

    public function hasOverlappingBooking(
        int $courtId,
        string $startAt,
        string $endAt,
        ?int $excludeBookingId = null
    ): bool {
        return Booking::query()
            ->forCourt($courtId)
            ->active()
            ->where('start_at', '<', $endAt)
            ->where('end_at', '>', $startAt)
            ->when(
                $excludeBookingId !== null,
                fn (Builder $query) =>
                    $query->whereKeyNot($excludeBookingId)
            )
            ->exists();
    }

    private function applyFilters(
        Builder $query,
        array $filters
    ): void {
        $query
            ->when(
                ! empty($filters['court_id']),
                fn (Builder $query) =>
                    $query->where('court_id', $filters['court_id'])
            )
            ->when(
                ! empty($filters['user_id']),
                fn (Builder $query) =>
                    $query->where('user_id', $filters['user_id'])
            )
            ->when(
                ! empty($filters['status']),
                fn (Builder $query) =>
                    $query->where('status', $filters['status'])
            )
            ->when(
                ! empty($filters['date_from']),
                fn (Builder $query) =>
                    $query->whereDate(
                        'start_at',
                        '>=',
                        $filters['date_from']
                    )
            )
            ->when(
                ! empty($filters['date_to']),
                fn (Builder $query) =>
                    $query->whereDate(
                        'start_at',
                        '<=',
                        $filters['date_to']
                    )
            );
    }

    private function validateBooking(
        Court $court,
        array $data
    ): void {
        if (! $court->isAvailable()) {
            throw ValidationException::withMessages([
                'court_id' => [
                    'The selected court is currently unavailable.',
                ],
            ]);
        }

        $start = Carbon::parse(
            $data['start_at'],
            Court::TIME_ZONE
        );

        $end = Carbon::parse(
            $data['end_at'],
            Court::TIME_ZONE
        );

        if ($end->lte($start)) {
            throw ValidationException::withMessages([
                'end_at' => [
                    'The end time must be after the start time.',
                ],
            ]);
        }

        $duration = (int) $start->diffInMinutes($end);

        if (
            $duration !== (int) $data['duration_minutes']
            || ! $court->isValidBookingDuration($duration)
        ) {
            throw ValidationException::withMessages([
                'duration_minutes' => [
                    'Invalid booking duration for this court.',
                ],
            ]);
        }

        $schedule = $court->getEffectiveSchedule($start);

        if ($schedule['status'] !== Court::OPERATING_OPEN) {
            throw ValidationException::withMessages([
                'start_at' => [
                    'The court is closed on the selected date.',
                ],
            ]);
        }

        if (
            empty($schedule['opening_time'])
            || empty($schedule['closing_time'])
        ) {
            throw ValidationException::withMessages([
                'start_at' => [
                    'Court operating hours are not configured.',
                ],
            ]);
        }

        $opening = Carbon::parse(
            $start->toDateString() . ' ' . $schedule['opening_time'],
            Court::TIME_ZONE
        );

        $closing = Carbon::parse(
            $start->toDateString() . ' ' . $schedule['closing_time'],
            Court::TIME_ZONE
        );

        if (
            ! $start->isSameDay($end)
            || $start->lt($opening)
            || $end->gt($closing)
        ) {
            throw ValidationException::withMessages([
                'start_at' => [
                    'The booking must be within court operating hours.',
                ],
            ]);
        }

        $interval = (int) $court->booking_interval_minutes;

        if ($interval <= 0) {
            throw ValidationException::withMessages([
                'start_at' => [
                    'The court booking interval is invalid.',
                ],
            ]);
        }

        $minutesFromOpening = (int) $opening->diffInMinutes($start);

        if ($minutesFromOpening % $interval !== 0) {
            throw ValidationException::withMessages([
                'start_at' => [
                    'The selected start time does not match the booking interval.',
                ],
            ]);
        }
    }
}
