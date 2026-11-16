import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const parseDate = (value) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
};

export default function ScheduleCalendar({
    date,
    courts = [],
    loading = false,
    onDateChange,
}) {
    const selectedDate = useMemo(() => parseDate(date), [date]);

    const monthLabel = selectedDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    const calendarDays = useMemo(() => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const offset = (firstDay.getDay() + 6) % 7;
        const totalCells = Math.ceil((offset + lastDay.getDate()) / 7) * 7;

        return Array.from({ length: totalCells }, (_, index) => {
            const current = new Date(year, month, index - offset + 1);

            return {
                date: formatDate(current),
                day: current.getDate(),
                currentMonth: current.getMonth() === month,
            };
        });
    }, [selectedDate]);

    const dayStats = useMemo(() => {
        const result = {};

        courts.forEach((court) => {
            court.days?.forEach((day) => {
                if (!result[day.date]) {
                    result[day.date] = {
                        total: 0,
                        available: 0,
                        booked: 0,
                        unavailable: 0,
                    };
                }

                day.slots?.forEach((slot) => {
                    result[day.date].total += 1;

                    if (slot.is_bookable) {
                        result[day.date].available += 1;
                    } else if (slot.status === "booked") {
                        result[day.date].booked += 1;
                    } else {
                        result[day.date].unavailable += 1;
                    }
                });
            });
        });

        return result;
    }, [courts]);

    const changeMonth = (offset) => {
        const nextDate = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth() + offset,
            1
        );

        onDateChange(formatDate(nextDate));
    };

    const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Dubai",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-red-50 p-2.5 text-red-700">
                        <CalendarDays size={21} />
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            {monthLabel}
                        </h2>
                        <p className="text-xs text-slate-500">
                            Select a date to view its schedule
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => changeMonth(-1)}
                        disabled={loading}
                        aria-label="Previous month"
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        <ChevronLeft size={19} />
                    </button>

                    <button
                        type="button"
                        onClick={() => onDateChange(today)}
                        disabled={loading}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        Today
                    </button>

                    <button
                        type="button"
                        onClick={() => changeMonth(1)}
                        disabled={loading}
                        aria-label="Next month"
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        <ChevronRight size={19} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                {weekdays.map((day) => (
                    <div
                        key={day}
                        className="py-3 text-center text-xs font-semibold text-slate-500"
                    >
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-px bg-slate-200">
                {calendarDays.map((day) => {
                    const stats = dayStats[day.date];
                    const isToday = day.date === today;
                    const isSelected = day.date === date;

                    return (
                        <button
                            key={day.date}
                            type="button"
                            onClick={() => onDateChange(day.date)}
                            disabled={!day.currentMonth || loading}
                            className={`min-h-24 min-w-0 bg-white p-2 text-left transition sm:min-h-32 sm:p-3 ${
                                day.currentMonth
                                    ? "hover:bg-red-50"
                                    : "bg-slate-50 opacity-40"
                            } ${
                                isSelected
                                    ? "ring-2 ring-inset ring-red-600"
                                    : ""
                            }`}
                        >
                            <span
                                className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                                    isToday
                                        ? "bg-red-700 text-white"
                                        : "text-slate-700"
                                }`}
                            >
                                {day.day}
                            </span>

                            {day.currentMonth && stats && (
                                <div className="mt-2 space-y-1">
                                    {stats.available > 0 && (
                                        <div className="rounded bg-emerald-50 px-1.5 py-1 text-[10px] font-medium text-emerald-700 sm:text-xs">
                                            {stats.available} Available
                                        </div>
                                    )}

                                    {stats.booked > 0 && (
                                        <div className="rounded bg-red-50 px-1.5 py-1 text-[10px] font-medium text-red-700 sm:text-xs">
                                            {stats.booked} Booked
                                        </div>
                                    )}

                                    {stats.unavailable > 0 && (
                                        <div className="rounded bg-slate-100 px-1.5 py-1 text-[10px] font-medium text-slate-600 sm:text-xs">
                                            {stats.unavailable} Unavailable
                                        </div>
                                    )}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
