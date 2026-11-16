import React from "react";

export default function BookingSummary({ court, date, duration, slot, price }) {
    return (
        <div className="rounded-2xl border border-green-100 bg-green-50/50 p-5">
            <h3 className="mb-4 font-bold text-gray-900">Booking summary</h3>
            <dl className="space-y-3 text-sm">
                {[["Court", court?.name || "—"], ["Date", date || "—"], ["Time", slot ? `${slot.start_time} – ${slot.end_time}` : "—"], ["Duration", `${duration} minutes`], ["Total", `AED ${Number(price || 0).toFixed(2)}`]].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4"><dt className="text-gray-500">{label}</dt><dd className="text-right font-semibold text-gray-900">{value}</dd></div>
                ))}
            </dl>
        </div>
    );
}
