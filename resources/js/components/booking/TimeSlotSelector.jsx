import React from "react";

export default function TimeSlotSelector({ slots = [], value, onChange, loading = false }) {
    if (loading) return <p className="py-5 text-sm text-gray-500">Checking available time slots...</p>;
    if (!slots.length) return <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">No time slots for the selected date and duration.</p>;
    return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {slots.map((slot) => (
                <button key={slot.start_at} type="button" disabled={!slot.is_available} onClick={() => onChange(slot)}
                    className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${value?.start_at === slot.start_at ? "border-green-700 bg-green-700 text-white" : slot.is_available ? "border-gray-200 bg-white text-gray-800 hover:border-green-600 hover:bg-green-50" : "cursor-not-allowed border-gray-100 bg-gray-100 text-gray-400"}`}>
                    {slot.start_time} – {slot.end_time}
                    {!slot.is_available && <span className="mt-1 block text-xs font-normal capitalize">{slot.status}</span>}
                </button>
            ))}
        </div>
    );
}
