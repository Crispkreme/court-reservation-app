
import React from "react";

export const SLOT_STYLES = {
    available: {
        label: "Available",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
    },
    reserved: {
        label: "Reserved",
        className: "border-red-200 bg-red-50 text-red-700",
        dot: "bg-red-500",
    },
    held: {
        label: "Held",
        className: "border-amber-200 bg-amber-50 text-amber-700",
        dot: "bg-amber-500",
    },
    blocked: {
        label: "Blocked",
        className: "border-slate-300 bg-slate-100 text-slate-700",
        dot: "bg-slate-500",
    },
    maintenance: {
        label: "Maintenance",
        className: "border-blue-200 bg-blue-50 text-blue-700",
        dot: "bg-blue-500",
    },
    closed: {
        label: "Closed",
        className: "border-gray-200 bg-gray-100 text-gray-500",
        dot: "bg-gray-400",
    },
    past: {
        label: "Past",
        className: "border-gray-200 bg-gray-50 text-gray-400",
        dot: "bg-gray-300",
    },
};

export default function ScheduleLegend() {
    return (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            {Object.entries(SLOT_STYLES).map(([key, style]) => (
                <div key={key} className="flex items-center gap-2">
                    <span
                        className={`h-2.5 w-2.5 rounded-full ${style.dot}`}
                    />
                    <span className="text-xs font-medium text-slate-600">
                        {style.label}
                    </span>
                </div>
            ))}
        </div>
    );
}
