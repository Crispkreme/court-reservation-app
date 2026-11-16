<?php

namespace App\Repositories;

use App\Interfaces\BookingInterface;
use App\Interfaces\CourtAvailabilityInterface;
use App\Models\Court;
use App\Models\CourtMaintenancePeriod;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class CourtAvailabilityRepository implements CourtAvailabilityInterface
{
    public function __construct(
        private readonly BookingInterface $bookingRepository
    ) {}

    public function getAvailability(
        int $courtId,
        string $date,
        int $durationMinutes
    ): array {
        $court = Court::findOrFail($courtId);

        if (! $court->isValidBookingDuration($durationMinutes)) {
            throw ValidationException::withMessages([
                'duration_minutes' => [
                    'Invalid booking duration for this court.',
                ],
            ]);
        }

        $selectedDate = Carbon::createFromFormat(
            '!Y-m-d',
            $date,
            Court::TIME_ZONE
        );

        $schedule = $court->getEffectiveSchedule($selectedDate);

        $response = [
            'court_id' => $court->id,
            'date' => $selectedDate->toDateString(),
            'duration_minutes' => $durationMinutes,
            'booking_interval_minutes' => (int) $court->booking_interval_minutes,
            'is_available' => false,
            'opening_time' => $schedule['opening_time'] ?? null,
            'closing_time' => $schedule['closing_time'] ?? null,
            'price' => $court->calculateBookingPrice($durationMinutes),
            'slots' => [],
        ];

        if (
            ! $court->isAvailable()
            || $schedule['status'] !== Court::OPERATING_OPEN
            || empty($schedule['opening_time'])
            || empty($schedule['closing_time'])
        ) {
            return $response;
        }

        $interval = (int) $court->booking_interval_minutes;

        if ($interval <= 0) {
            throw ValidationException::withMessages([
                'court_id' => [
                    'Invalid court booking interval.',
                ],
            ]);
        }

        $opening = Carbon::parse(
            $date . ' ' . $schedule['opening_time'],
            Court::TIME_ZONE
        );

        $closing = Carbon::parse(
            $date . ' ' . $schedule['closing_time'],
            Court::TIME_ZONE
        );

        $now = Carbon::now(Court::TIME_ZONE);

        $slots = [];

        for (
            $start = $opening->copy();
            $start->copy()->addMinutes($durationMinutes)->lte($closing);
            $start->addMinutes($interval)
        ) {
            $end = $start->copy()->addMinutes($durationMinutes);

            $startAt = $start->format('Y-m-d H:i:s');
            $endAt = $end->format('Y-m-d H:i:s');

            $isPast = $start->lte($now);

            $isBooked = $this->bookingRepository->hasOverlappingBooking(
                $court->id,
                $startAt,
                $endAt
            );

            $isMaintenance = $this->hasMaintenanceConflict(
                $court->id,
                $startAt,
                $endAt
            );

            $available = ! $isPast && ! $isBooked && ! $isMaintenance;

            $slots[] = [
                'start_at' => $startAt,
                'end_at' => $endAt,
                'start_time' => $start->format('H:i'),
                'end_time' => $end->format('H:i'),
                'is_available' => $available,
                'status' => $isPast
                    ? 'past'
                    : ($isMaintenance
                        ? 'maintenance'
                        : ($isBooked ? 'booked' : 'available')),
            ];
        }

        $response['slots'] = $slots;
        $response['is_available'] = collect($slots)
            ->contains('is_available', true);

        return $response;
    }

    public function isSlotAvailable(
        int $courtId,
        string $startAt,
        string $endAt
    ): bool {
        $court = Court::findOrFail($courtId);

        $start = Carbon::parse($startAt, Court::TIME_ZONE);
        $end = Carbon::parse($endAt, Court::TIME_ZONE);

        if (
            ! $court->isAvailable()
            || $start->lte(Carbon::now(Court::TIME_ZONE))
            || $end->lte($start)
            || ! $start->isSameDay($end)
        ) {
            return false;
        }

        $duration = (int) $start->diffInMinutes($end);

        if (! $court->isValidBookingDuration($duration)) {
            return false;
        }

        $schedule = $court->getEffectiveSchedule($start);

        if (
            $schedule['status'] !== Court::OPERATING_OPEN
            || empty($schedule['opening_time'])
            || empty($schedule['closing_time'])
        ) {
            return false;
        }

        $opening = Carbon::parse(
            $start->toDateString() . ' ' . $schedule['opening_time'],
            Court::TIME_ZONE
        );

        $closing = Carbon::parse(
            $start->toDateString() . ' ' . $schedule['closing_time'],
            Court::TIME_ZONE
        );

        $interval = (int) $court->booking_interval_minutes;

        if (
            $interval <= 0
            || $start->lt($opening)
            || $end->gt($closing)
            || (int) $opening->diffInMinutes($start) % $interval !== 0
        ) {
            return false;
        }

        if ($this->bookingRepository->hasOverlappingBooking(
            $courtId,
            $start->format('Y-m-d H:i:s'),
            $end->format('Y-m-d H:i:s')
        )) {
            return false;
        }

        return ! $this->hasMaintenanceConflict(
            $courtId,
            $start->format('Y-m-d H:i:s'),
            $end->format('Y-m-d H:i:s')
        );
    }

    private function hasMaintenanceConflict(
        int $courtId,
        string $startAt,
        string $endAt
    ): bool {
        return CourtMaintenancePeriod::query()
            ->where('court_id', $courtId)
            ->where('start_at', '<', $endAt)
            ->where('end_at', '>', $startAt)
            ->exists();
    }
}
