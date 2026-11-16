
import React from "react";

export const SLOT_STYLES = {
    available: {
        label: "Available",
        className:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
    },
    booked: {
        label: "Booked",
        className: "border-red-200 bg-red-50 text-red-700",
        dot: "bg-red-500",
    },
    maintenance: {
        label: "Maintenance",
        className: "border-amber-200 bg-amber-50 text-amber-700",
        dot: "bg-amber-500",
    },
    closed: {
        label: "Closed",
        className: "border-slate-200 bg-slate-100 text-slate-500",
        dot: "bg-slate-500",
    },
    temporarily_blocked: {
        label: "Blocked",
        className: "border-orange-200 bg-orange-50 text-orange-700",
        dot: "bg-orange-500",
    },
    past: {
        label: "Past",
        className: "border-slate-200 bg-slate-50 text-slate-400",
        dot: "bg-slate-300",
    },
};

export default function ScheduleLegend() {
    return (
        <div className="flex flex-wrap gap-x-5 gap-y-3">
            {Object.entries(SLOT_STYLES).map(([key, item]) => (
                <div
                    key={key}
                    className="flex items-center gap-2 text-xs font-medium text-slate-600"
                >
                    <span
                        className={`h-2.5 w-2.5 rounded-full ${item.dot}`}
                    />
                    {item.label}
                </div>
            ))}
        </div>
    );
}
