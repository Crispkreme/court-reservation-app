<?php

namespace App\Repositories;

use App\Interfaces\CourtUtilizationInterface;
use App\Models\Booking;
use App\Models\Court;
use Carbon\CarbonImmutable;

class CourtUtilizationRepository implements CourtUtilizationInterface
{
    public function summary(
        string $startDate,
        string $endDate,
        ?int $courtId = null
    ): array {
        $timezone = Court::TIME_ZONE;

        $from = CarbonImmutable::parse($startDate, $timezone)
            ->startOfDay();

        $until = CarbonImmutable::parse($endDate, $timezone)
            ->addDay()
            ->startOfDay();

        $fromUtc = $from->utc()->format('Y-m-d H:i:s');
        $untilUtc = $until->utc()->format('Y-m-d H:i:s');

        $courts = Court::query()
            ->when(
                $courtId !== null,
                fn ($query) => $query->whereKey($courtId)
            )
            ->with([
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

        $rows = [];

        $totalScheduled = 0;
        $totalMaintenance = 0;
        $totalBooked = 0;
        $totalBookings = 0;

        foreach ($courts as $court) {
            $scheduled = 0;
            $maintenance = 0;
            $booked = 0;
            $bookingIds = [];

            if ($court->hasValidOperatingHours()) {
                for (
                    $day = $from;
                    $day->lt($until);
                    $day = $day->addDay()
                ) {
                    $date = $day->toDateString();

                    $opening = CarbonImmutable::parse(
                        $date . ' ' . $court->opening_time,
                        $timezone
                    )->utc()->timestamp;

                    $closing = CarbonImmutable::parse(
                        $date . ' ' . $court->closing_time,
                        $timezone
                    )->utc()->timestamp;

                    $scheduled += $closing - $opening;

                    $maintenanceIntervals = [];

                    foreach ($court->maintenancePeriods as $period) {
                        $start = max(
                            $opening,
                            $period->start_at->timestamp
                        );

                        $end = min(
                            $closing,
                            $period->end_at->timestamp
                        );

                        if ($start < $end) {
                            $maintenanceIntervals[] = [
                                $start,
                                $end,
                            ];
                        }
                    }

                    $maintenanceIntervals = $this->mergeIntervals(
                        $maintenanceIntervals
                    );

                    $maintenance += $this->intervalSeconds(
                        $maintenanceIntervals
                    );

                    $bookedIntervals = [];

                    foreach ($court->bookings as $booking) {
                        $start = max(
                            $opening,
                            $booking->start_at->timestamp
                        );

                        $end = min(
                            $closing,
                            $booking->end_at->timestamp
                        );

                        if ($start >= $end) {
                            continue;
                        }

                        $bookingIds[$booking->id] = true;

                        $segments = $this->subtractIntervals(
                            [$start, $end],
                            $maintenanceIntervals
                        );

                        foreach ($segments as $segment) {
                            $bookedIntervals[] = $segment;
                        }
                    }

                    $booked += $this->intervalSeconds(
                        $this->mergeIntervals($bookedIntervals)
                    );
                }
            }

            $available = max(0, $scheduled - $maintenance);

            $booked = min($booked, $available);

            $count = count($bookingIds);

            $rows[] = [
                'court_id' => $court->id,
                'court_name' => $court->name,
                'court_status' => $court->status,
                'scheduled_hours' => round(
                    $scheduled / 3600,
                    2
                ),
                'maintenance_hours' => round(
                    $maintenance / 3600,
                    2
                ),
                'available_hours' => round(
                    $available / 3600,
                    2
                ),
                'booked_hours' => round(
                    $booked / 3600,
                    2
                ),
                'bookings_count' => $count,
                'utilization_rate' => $available > 0
                    ? round($booked / $available * 100, 2)
                    : 0,
            ];

            $totalScheduled += $scheduled;
            $totalMaintenance += $maintenance;
            $totalBooked += $booked;
            $totalBookings += $count;
        }

        $totalAvailable = max(
            0,
            $totalScheduled - $totalMaintenance
        );

        return [
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'summary' => [
                'courts_count' => count($rows),
                'scheduled_hours' => round(
                    $totalScheduled / 3600,
                    2
                ),
                'maintenance_hours' => round(
                    $totalMaintenance / 3600,
                    2
                ),
                'available_hours' => round(
                    $totalAvailable / 3600,
                    2
                ),
                'booked_hours' => round(
                    $totalBooked / 3600,
                    2
                ),
                'bookings_count' => $totalBookings,
                'utilization_rate' => $totalAvailable > 0
                    ? round(
                        $totalBooked / $totalAvailable * 100,
                        2
                    )
                    : 0,
            ],
            'courts' => $rows,
        ];
    }

    private function mergeIntervals(array $intervals): array
    {
        usort(
            $intervals,
            fn ($a, $b) => $a[0] <=> $b[0]
        );

        $merged = [];

        foreach ($intervals as $interval) {
            $last = count($merged) - 1;

            if (
                $last < 0 ||
                $interval[0] > $merged[$last][1]
            ) {
                $merged[] = $interval;
            } else {
                $merged[$last][1] = max(
                    $merged[$last][1],
                    $interval[1]
                );
            }
        }

        return $merged;
    }

    private function intervalSeconds(array $intervals): int
    {
        return array_sum(
            array_map(
                fn ($interval) => $interval[1] - $interval[0],
                $intervals
            )
        );
    }

    private function subtractIntervals(
        array $interval,
        array $blocked
    ): array {
        $segments = [$interval];

        foreach ($blocked as [$blockStart, $blockEnd]) {
            $next = [];

            foreach ($segments as [$start, $end]) {
                if (
                    $blockEnd <= $start ||
                    $blockStart >= $end
                ) {
                    $next[] = [$start, $end];
                    continue;
                }

                if ($start < $blockStart) {
                    $next[] = [
                        $start,
                        $blockStart,
                    ];
                }

                if ($blockEnd < $end) {
                    $next[] = [
                        $blockEnd,
                        $end,
                    ];
                }
            }

            $segments = $next;
        }

        return $segments;
    }
}