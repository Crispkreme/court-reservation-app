import React from "react";
import {
    MapPin,
    CalendarDays,
    Clock3,
    Timer,
    Wallet,
} from "lucide-react";

const formatPrice = (price) => {
    if (price === null || price === undefined || price === "") {
        return "—";
    }

    const amount = Number(price);

    if (!Number.isFinite(amount)) {
        return "—";
    }

    return new Intl.NumberFormat("en-AE", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
    }).format(amount);
};

const formatDate = (date) => {
    if (!date) return "—";

    const [year, month, day] = date.split("-").map(Number);

    if (!year || !month || !day) return date;

    const value = new Date(Date.UTC(year, month - 1, day));

    return new Intl.DateTimeFormat("en-AE", {
        timeZone: "UTC",
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(value);
};

export default function BookingSummary({
    court,
    date,
    duration,
    slot,
    price,
}) {
    const rows = [
        {
            label: "Court",
            value: court?.name || "Not selected",
            icon: MapPin,
        },
        {
            label: "Date",
            value: formatDate(date),
            icon: CalendarDays,
        },
        {
            label: "Time",
            value: slot
                ? `${slot.start_time} – ${slot.end_time}`
                : "Not selected",
            icon: Clock3,
        },
        {
            label: "Duration",
            value: `${duration} minutes`,
            icon: Timer,
        },
    ];

    return (
        <div className="space-y-5">
            <dl className="space-y-4">
                {rows.map(({ label, value, icon: Icon }) => (
                    <div
                        key={label}
                        className="flex items-start justify-between gap-3"
                    >
                        <dt className="flex items-center gap-2 text-sm text-slate-500">
                            <Icon size={16} className="shrink-0" />
                            {label}
                        </dt>

                        <dd className="text-right text-sm font-semibold text-slate-900">
                            {value}
                        </dd>
                    </div>
                ))}
            </dl>

            <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Wallet size={18} />
                        Total Price
                    </div>

                    <span className="text-lg font-bold text-red-700">
                        {court ? formatPrice(price) : "—"}
                    </span>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                    Final booking price is calculated by the server.
                </p>
            </div>
        </div>
    );
}