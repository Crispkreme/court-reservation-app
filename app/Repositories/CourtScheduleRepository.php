<?php

namespace App\Repositories;

use App\Interfaces\CourtScheduleInterface;
use App\Models\Booking;
use App\Models\Court;
use App\Models\CourtSchedule;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;

class CourtScheduleRepository implements CourtScheduleInterface
{
    public function getSchedule(
        string $date,
        string $view = 'daily',
        ?int $courtId = null,
        bool $isAdmin = false
    ): array {
        $timezone = Court::TIME_ZONE;

        $start = CarbonImmutable::parse($date, $timezone)
            ->startOfDay();

        if ($view === 'weekly') {
            $start = $start->startOfWeek(
                CarbonInterface::MONDAY
            );
        }

        $dayCount = $view === 'weekly' ? 7 : 1;
        $end = $start->addDays($dayCount);

        $fromUtc = $start->utc()->toDateTimeString();
        $untilUtc = $end->utc()->toDateTimeString();

        $courts = Court::query()
            ->when(
                $courtId !== null,
                fn ($query) => $query->whereKey($courtId)
            )
            ->when(
                !$isAdmin,
                fn ($query) => $query
                    ->where('status', 'available')
            )
            ->with([
                'schedules' => fn ($query) => $query
                    ->whereBetween('date', [
                        $start->toDateString(),
                        $end->subDay()->toDateString(),
                    ]),

                'maintenancePeriods' => fn ($query) => $query
                    ->where('start_at', '<', $untilUtc)
                    ->where('end_at', '>', $fromUtc),

                'bookings' => fn ($query) => $query
                    ->whereIn('status', [
                        Booking::STATUS_CONFIRMED,
                        Booking::STATUS_COMPLETED,
                    ])
                    ->where('start_at', '<', $untilUtc)
                    ->where('end_at', '>', $fromUtc),
            ])
            ->orderBy('name')
            ->get();

        $now = CarbonImmutable::now($timezone);
        $result = [];

        foreach ($courts as $court) {
            $days = [];

            for ($i = 0; $i < $dayCount; $i++) {
                $day = $start->addDays($i);
                $dateKey = $day->toDateString();

                $schedule = $court->schedules->first(
                    fn ($item) =>
                        $item->date->toDateString() === $dateKey
                );

                $openingTime = $schedule?->opening_time
                    ?: $court->opening_time;

                $closingTime = $schedule?->closing_time
                    ?: $court->closing_time;

                $days[] = [
                    'date' => $dateKey,
                    'opening_time' => $openingTime,
                    'closing_time' => $closingTime,
                    'status' => $schedule?->status ?? 'open',
                    'slots' => $this->generateSlots(
                        $court,
                        $day,
                        $now,
                        $schedule,
                        $openingTime,
                        $closingTime
                    ),
                ];
            }

            $result[] = [
                'id' => $court->id,
                'name' => $court->name,
                'status' => $court->status,
                'opening_time' => $court->opening_time,
                'closing_time' => $court->closing_time,
                'booking_interval_minutes' =>
                    (int) $court->booking_interval_minutes,
                'days' => $days,
            ];
        }

        return [
            'view' => $view,
            'timezone' => $timezone,
            'period' => [
                'start_date' => $start->toDateString(),
                'end_date' => $end->subDay()->toDateString(),
            ],
            'courts' => $result,
        ];
    }

    private function generateSlots(
        Court $court,
        CarbonImmutable $day,
        CarbonImmutable $now,
        ?CourtSchedule $schedule,
        ?string $openingTime,
        ?string $closingTime
    ): array {
        if (
            !$openingTime ||
            !$closingTime ||
            $closingTime <= $openingTime
        ) {
            return [];
        }

        $interval = (int) $court->booking_interval_minutes;

        if (!in_array($interval, [15, 30, 60], true)) {
            return [];
        }

        $timezone = Court::TIME_ZONE;
        $date = $day->toDateString();

        $opening = CarbonImmutable::parse(
            $date . ' ' . $openingTime,
            $timezone
        );

        $closing = CarbonImmutable::parse(
            $date . ' ' . $closingTime,
            $timezone
        );

        $slots = [];
        $cursor = $opening;

        while ($cursor->addMinutes($interval)->lte($closing)) {
            $slotEnd = $cursor->addMinutes($interval);

            if ($schedule?->status === CourtSchedule::STATUS_CLOSED) {
                $status = 'closed';
            } else {
                $status = $this->getSlotStatus(
                    $court,
                    $cursor,
                    $slotEnd,
                    $now
                );
            }

            $slots[] = [
                'date' => $date,
                'start_time' => $cursor->format('H:i'),
                'end_time' => $slotEnd->format('H:i'),
                'status' => $status,
                'is_bookable' => $status === 'available',
            ];

            $cursor = $slotEnd;
        }

        return $slots;
    }

    private function getSlotStatus(
        Court $court,
        CarbonImmutable $start,
        CarbonImmutable $end,
        CarbonImmutable $now
    ): string {
        if ($court->status === 'maintenance') {
            return 'maintenance';
        }

        if ($court->status === 'temporarily_blocked') {
            return 'temporarily_blocked';
        }

        if ($court->status !== 'available') {
            return 'closed';
        }

        $overlaps = fn ($period) =>
            $period->start_at->timestamp < $end->timestamp &&
            $period->end_at->timestamp > $start->timestamp;

        if ($court->maintenancePeriods->contains($overlaps)) {
            return 'maintenance';
        }

        if ($court->bookings->contains($overlaps)) {
            return 'booked';
        }

        if ($start->lte($now)) {
            return 'past';
        }

        return 'available';
    }
}
