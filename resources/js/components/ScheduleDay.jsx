import React from "react";
import { SLOT_STYLES } from "./ScheduleLegend";

export default function ScheduleDay({ day, view = "daily" }) {
    const slots = day.slots ?? [];

    const dateLabel = new Date(
        `${day.date}T12:00:00Z`
    ).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
    });

    return (
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-4">
                <h3 className="font-semibold text-slate-900">
                    {dateLabel}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                    {day.opening_time && day.closing_time
                        ? `${day.opening_time} - ${day.closing_time}`
                        : "No operating hours"}
                </p>
            </div>

            {slots.length === 0 ? (
                <div className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-500">
                    {day.status === "closed"
                        ? "Court Closed"
                        : "No time slots available"}
                </div>
            ) : (
                <div
                    className={`grid gap-2 ${
                        view === "weekly"
                            ? "grid-cols-1"
                            : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
                    }`}
                >
                    {slots.map((slot, index) => {
                        const style =
                            SLOT_STYLES[slot.status] ??
                            SLOT_STYLES.closed;

                        return (
                            <div
                                key={`${slot.start_time}-${index}`}
                                className={`rounded-lg border p-3 text-center ${style.className}`}
                            >
                                <p className="text-xs font-semibold">
                                    {slot.start_time}
                                </p>

                                <p className="mt-1 text-[11px]">
                                    {slot.end_time}
                                </p>

                                <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide">
                                    {style.label}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
