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

        $selectedDate = CarbonImmutable::parse($date, $timezone)
            ->startOfDay();

        switch ($view) {
            case 'weekly':
                $start = $selectedDate->startOfWeek(
                    CarbonInterface::MONDAY
                );
                $end = $start->addWeek();
                break;

            case 'monthly':
                $start = $selectedDate->startOfMonth();
                $end = $start->addMonth();
                break;

            default:
                $view = 'daily';
                $start = $selectedDate;
                $end = $start->addDay();
                break;
        }

        $dayCount = (int) $start->diffInDays($end);
        $lastDay = $end->subDay();

        $fromUtc = $start->utc()->toDateTimeString();
        $untilUtc = $end->utc()->toDateTimeString();

        $courts = Court::query()
            ->when(
                $courtId !== null,
                fn ($query) => $query->whereKey($courtId)
            )
            ->when(
                !$isAdmin,
                fn ($query) => $query->where(
                    'status',
                    'available'
                )
            )
            ->with([
                'schedules' => fn ($query) => $query
                    ->whereBetween('date', [
                        $start->toDateString(),
                        $lastDay->toDateString(),
                    ]),

                'recurringSchedules' => fn ($query) => $query
                    ->where('is_active', true)
                    ->where(
                        'effective_from',
                        '<=',
                        $lastDay->toDateString()
                    )
                    ->where(function ($query) use ($start) {
                        $query->whereNull('effective_until')
                            ->orWhere(
                                'effective_until',
                                '>=',
                                $start->toDateString()
                            );
                    })
                    ->orderByDesc('effective_from')
                    ->orderByDesc('id'),

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

            $schedulesByDate = $court->schedules->keyBy(
                fn ($schedule) => $schedule->date->toDateString()
            );

            for ($i = 0; $i < $dayCount; $i++) {
                $day = $start->addDays($i);
                $dateKey = $day->toDateString();

                $schedule = $schedulesByDate->get($dateKey);

                $recurringSchedule = $court->recurringSchedules->first(
                    fn ($item) =>
                        (int) $item->day_of_week === $day->dayOfWeek &&
                        $item->effective_from->toDateString() <= $dateKey &&
                        (
                            $item->effective_until === null ||
                            $item->effective_until->toDateString() >= $dateKey
                        )
                );

                $openingTime = $schedule?->opening_time
                    ?? $recurringSchedule?->opening_time
                    ?? $court->opening_time;

                $closingTime = $schedule?->closing_time
                    ?? $recurringSchedule?->closing_time
                    ?? $court->closing_time;

                $status = $schedule?->status
                    ?? $recurringSchedule?->status
                    ?? CourtSchedule::STATUS_OPEN;

                $slots = $this->generateSlots(
                    $court,
                    $day,
                    $now,
                    $status,
                    $openingTime,
                    $closingTime
                );

                $days[] = [
                    'date' => $dateKey,
                    'opening_time' => $openingTime,
                    'closing_time' => $closingTime,
                    'status' => $status,
                    'slots' => $slots,
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
                'end_date' => $lastDay->toDateString(),
            ],
            'courts' => $result,
        ];
    }

    private function generateSlots(
        Court $court,
        CarbonImmutable $day,
        CarbonImmutable $now,
        string $scheduleStatus,
        ?string $openingTime,
        ?string $closingTime
    ): array {
        if (!$openingTime || !$closingTime) {
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

        if ($closing->lte($opening)) {
            return [];
        }

        $slots = [];
        $cursor = $opening;

        while (true) {
            $slotEnd = $cursor->addMinutes($interval);

            if ($slotEnd->gt($closing)) {
                break;
            }

            if ($scheduleStatus === CourtSchedule::STATUS_CLOSED) {
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
            return 'blocked';
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
            return 'reserved';
        }

        if ($start->lte($now)) {
            return 'past';
        }

        return 'available';
    }
}