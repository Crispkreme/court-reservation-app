
import React from "react";
import { Clock3 } from "lucide-react";
import { SLOT_STYLES } from "./ScheduleLegend";

const formatDate = (date) =>
    new Intl.DateTimeFormat("en-GB", {
        timeZone: "UTC",
        weekday: "short",
        month: "short",
        day: "numeric",
    }).format(new Date(`${date}T12:00:00Z`));

const formatTime = (time) => {
    if (!time) return "—";

    const [hour, minute] = time.split(":").map(Number);
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
};

export default function ScheduleDay({ day, view = "daily" }) {
    const slots = day.slots ?? [];
    const isClosed = day.status === "closed";

    return (
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3">
            <div className="mb-4 border-b border-slate-100 pb-3">
                <h4 className="text-sm font-semibold text-slate-900">
                    {formatDate(day.date)}
                </h4>

                <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <Clock3 size={13} />
                    {formatTime(day.opening_time)}
                    {" – "}
                    {formatTime(day.closing_time)}
                </div>

                {isClosed && (
                    <span className="mt-2 inline-block rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                        Closed for this date
                    </span>
                )}
            </div>

            {slots.length === 0 ? (
                <p className="py-5 text-center text-xs text-slate-400">
                    No operating time slots
                </p>
            ) : (
                <div
                    className={`grid gap-2 ${
                        view === "weekly"
                            ? "grid-cols-1"
                            : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6"
                    }`}
                >
                    {slots.map((slot, index) => {
                        const style =
                            SLOT_STYLES[slot.status] ??
                            SLOT_STYLES.closed;

                        return (
                            <div
                                key={`${slot.start_time}-${index}`}
                                title={`${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}: ${style.label}`}
                                className={`rounded-lg border px-2 py-3 text-center ${style.className}`}
                            >
                                <div className="text-xs font-semibold">
                                    {formatTime(slot.start_time)}
                                </div>

                                <div className="mt-1 text-[11px] opacity-75">
                                    {style.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
