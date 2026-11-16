import React from "react";
import { Clock3, Loader2, Check } from "lucide-react";

const statusLabels = {
    booked: "Booked",
    maintenance: "Maintenance",
    past: "Past",
    available: "Available",
};

export default function TimeSlotSelector({
    slots = [],
    value,
    onChange,
    loading = false,
    disabled = false,
}) {
    if (loading) {
        return (
            <div
                role="status"
                className="flex items-center justify-center gap-3 rounded-xl bg-slate-50 p-8 text-sm text-slate-500"
            >
                <Loader2 size={18} className="animate-spin text-red-700" />
                Checking available time slots...
            </div>
        );
    }

    if (!slots.length) {
        return (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <Clock3 size={30} className="mx-auto text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-700">
                    No time slots found
                </p>
                <p className="mt-1 text-xs text-slate-500">
                    Try another date, court, or duration.
                </p>
            </div>
        );
    }

    return (
        <div
            role="group"
            aria-label="Court booking time slots"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        >
            {slots.map((item) => {
                const available = item.is_available === true;
                const selected =
                    available &&
                    value?.start_at === item.start_at &&
                    value?.end_at === item.end_at;

                return (
                    <button
                        key={`${item.start_at}-${item.end_at}`}
                        type="button"
                        disabled={!available || disabled}
                        aria-pressed={selected}
                        onClick={() => {
                            if (available && !disabled) {
                                onChange(selected ? null : item);
                            }
                        }}
                        className={[
                            "relative flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl border px-3 py-3 text-center transition",
                            selected
                                ? "border-red-700 bg-red-700 text-white shadow-sm"
                                : available
                                  ? "border-slate-200 bg-white text-slate-800 hover:border-red-500 hover:bg-red-50"
                                  : "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400",
                            disabled ? "opacity-60" : "",
                        ].join(" ")}
                    >
                        {selected && (
                            <Check
                                size={14}
                                className="absolute right-2 top-2"
                            />
                        )}

                        <span className="text-sm font-semibold">
                            {item.start_time} – {item.end_time}
                        </span>

                        <span
                            className={`text-xs ${
                                selected
                                    ? "text-red-100"
                                    : available
                                      ? "text-green-700"
                                      : "text-slate-400"
                            }`}
                        >
                            {selected
                                ? "Selected"
                                : statusLabels[item.status] ||
                                  (available ? "Available" : "Unavailable")}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
