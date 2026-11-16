
import React from "react";
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
} from "lucide-react";

const shiftDate = (date, days) => {
    const value = new Date(`${date}T12:00:00Z`);
    value.setUTCDate(value.getUTCDate() + days);
    return value.toISOString().slice(0, 10);
};

export const getUaeToday = () => {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Dubai",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const get = (type) =>
        parts.find((part) => part.type === type)?.value;

    return `${get("year")}-${get("month")}-${get("day")}`;
};

export default function ScheduleToolbar({
    date,
    view,
    courtId,
    courts = [],
    loading = false,
    onDateChange,
    onViewChange,
    onCourtChange,
    onRefresh,
}) {
    const navigate = (direction) => {
        const days = view === "weekly" ? 7 : 1;
        onDateChange(shiftDate(date, direction * days));
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="font-semibold text-slate-900">
                        Schedule Filters
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Browse court availability by date.
                    </p>
                </div>

                <div className="inline-flex rounded-xl bg-slate-100 p-1">
                    {["daily", "weekly"].map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => onViewChange(option)}
                            aria-pressed={view === option}
                            className={`rounded-lg px-5 py-2 text-sm font-medium capitalize transition ${
                                view === option
                                    ? "bg-white text-red-700 shadow-sm"
                                    : "text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        aria-label="Previous period"
                        className="rounded-lg border border-slate-200 p-2.5 hover:bg-slate-50"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="relative min-w-0 flex-1">
                        <CalendarDays
                            size={17}
                            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) =>
                                e.target.value &&
                                onDateChange(e.target.value)
                            }
                            className="w-full rounded-lg border border-slate-200 py-2.5 pr-3 pl-10 text-sm outline-none focus:border-red-500"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate(1)}
                        aria-label="Next period"
                        className="rounded-lg border border-slate-200 p-2.5 hover:bg-slate-50"
                    >
                        <ChevronRight size={18} />
                    </button>

                    <button
                        type="button"
                        onClick={() => onDateChange(getUaeToday())}
                        className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium hover:bg-slate-50"
                    >
                        Today
                    </button>
                </div>

                <select
                    value={courtId ?? ""}
                    onChange={(e) => onCourtChange(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500"
                >
                    <option value="">All Courts</option>
                    {courts.map((court) => (
                        <option key={court.id} value={court.id}>
                            {court.name}
                        </option>
                    ))}
                </select>

                <button
                    type="button"
                    onClick={onRefresh}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>
        </div>
    );
}
