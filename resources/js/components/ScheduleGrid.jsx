
import React from "react";
import { CalendarX2, MapPin } from "lucide-react";
import ScheduleDay from "./ScheduleDay";

export default function ScheduleGrid({
    courts = [],
    view = "daily",
    loading = false,
}) {
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2].map((item) => (
                    <div
                        key={item}
                        className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                    >
                        <div className="mb-5 h-5 w-48 rounded bg-slate-200" />
                        <div className="grid grid-cols-3 gap-3">
                            {[1, 2, 3, 4, 5, 6].map((slot) => (
                                <div
                                    key={slot}
                                    className="h-16 rounded-lg bg-slate-100"
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!courts.length) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center">
                <CalendarX2
                    size={36}
                    className="mx-auto text-slate-300"
                />
                <h3 className="mt-4 font-semibold text-slate-800">
                    No court schedules found
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                    Try another date or select a different court.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {courts.map((court) => (
                <section
                    key={court.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                        <div>
                            <h3 className="font-semibold text-slate-900">
                                {court.name}
                            </h3>

                            <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                <MapPin size={13} />
                                Court #{court.id}
                            </div>
                        </div>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">
                            {court.status?.replaceAll("_", " ") ??
                                "Unknown"}
                        </span>
                    </div>

                    <div className="p-4">
                        <div
                            className={
                                view === "weekly"
                                    ? "grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7"
                                    : "grid grid-cols-1"
                            }
                        >
                            {(court.days ?? []).map((day) => (
                                <ScheduleDay
                                    key={day.date}
                                    day={day}
                                    view={view}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            ))}
        </div>
    );
}
