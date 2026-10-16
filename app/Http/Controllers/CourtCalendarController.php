<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexCourtCalendarRequest;
use App\Models\CourtSchedule;
use App\Models\CourtScheduleOverride;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\JsonResponse;

class CourtCalendarController extends Controller
{
    public function index(IndexCourtCalendarRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $start = Carbon::parse($validated['start'])->startOfDay();
        $end = Carbon::parse($validated['end'])->endOfDay();

        /*
         * Get active recurring schedules.
         */
        $scheduleQuery = CourtSchedule::query()
            ->with('court')
            ->where('is_active', true);

        if (!empty($validated['court_id'])) {
            $scheduleQuery->where(
                'court_id',
                $validated['court_id']
            );
        }

        $schedules = $scheduleQuery->get();

        /*
         * Get active date-specific overrides.
         */
        $overrideQuery = CourtScheduleOverride::query()
            ->with('court')
            ->where('is_active', true)
            ->whereDate('date', '>=', $start->toDateString())
            ->whereDate('date', '<=', $end->toDateString());

        if (!empty($validated['court_id'])) {
            $overrideQuery->where(
                'court_id',
                $validated['court_id']
            );
        }

        $overrides = $overrideQuery->get();

        /*
         * Create a lookup for overrides.
         *
         * Key format:
         * court_id|date
         *
         * Example:
         * 1|2026-09-30
         */
        $overrideLookup = $overrides->keyBy(function ($override) {
            return $override->court_id . '|' . $override->date->format('Y-m-d');
        });

        $events = [];

        /*
         * Generate recurring schedule events.
         */
        foreach (
            CarbonPeriod::create(
                $start->copy()->startOfDay(),
                $end->copy()->startOfDay()
            ) as $date
        ) {
            $dayOfWeek = $date->dayOfWeek;
            $dateString = $date->format('Y-m-d');

            $daySchedules = $schedules->filter(
                function ($schedule) use ($dayOfWeek, $date) {
                    if ((int) $schedule->day_of_week !== (int) $dayOfWeek) {
                        return false;
                    }

                    if (
                        $schedule->start_date &&
                        $date->lt(Carbon::parse($schedule->start_date))
                    ) {
                        return false;
                    }

                    if (
                        $schedule->end_date &&
                        $date->gt(Carbon::parse($schedule->end_date))
                    ) {
                        return false;
                    }

                    return true;
                }
            );

            foreach ($daySchedules as $schedule) {
                /*
                 * Check whether this court has a date-specific
                 * override.
                 */
                $overrideKey = $schedule->court_id . '|' . $dateString;

                /*
                 * If an override exists, do not add the
                 * recurring schedule.
                 *
                 * The override takes precedence.
                 */
                if ($overrideLookup->has($overrideKey)) {
                    continue;
                }

                $events[] = [
                    'id' => 'schedule-' . $schedule->id . '-' . $dateString,
                    'title' => ucfirst($schedule->status),
                    'start' => $dateString . 'T' . $schedule->start_time,
                    'end' => $dateString . 'T' . $schedule->end_time,
                    'status' => $schedule->status,
                    'court_id' => $schedule->court_id,
                    'court_name' => $schedule->court->name,
                    'type' => 'schedule',
                    'editable' => true,
                ];
            }
        }

        /*
         * Add date-specific overrides.
         *
         * These are the effective events for the
         * corresponding court/date.
         */
        foreach ($overrides as $override) {
            $dateString = $override->date->format('Y-m-d');

            $startTime = $override->start_time ?? '00:00:00';
            $endTime = $override->end_time ?? '23:59:59';

            $events[] = [
                'id' => 'override-' . $override->id,
                'title' => $override->title ?? ucfirst($override->status),
                'start' => $dateString . 'T' . $startTime,
                'end' => $dateString . 'T' . $endTime,
                'status' => $override->status,
                'court_id' => $override->court_id,
                'court_name' => $override->court->name,
                'type' => 'override',
                'reason' => $override->reason,
                'editable' => true,
            ];
        }

        /*
         * Apply status filter to the final effective events.
         */
        if (!empty($validated['status'])) {
            $events = array_values(
                array_filter(
                    $events,
                    fn ($event) => $event['status'] === $validated['status']
                )
            );
        }

        return response()->json([
            'data' => $events,
        ]);
    }
}