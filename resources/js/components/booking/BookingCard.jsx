import React from "react";
import { CalendarDays, Clock3, MapPin } from "lucide-react";
import BookingStatusBadge from "./BookingStatusBadge";

const displayDate = (value) => value ? new Date(String(value).replace(" ", "T")).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" }) : "—";
const displayTime = (value) => value ? String(value).slice(11, 16) : "—";

export default function BookingCard({ booking, onView, onCancel }) {
    const canCancel = ["pending", "confirmed"].includes(booking.status) && new Date(String(booking.start_at).replace(" ", "T")).getTime() > Date.now();
    return (
        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div><h3 className="text-base font-bold text-gray-900">{booking.court?.name || `Court #${booking.court_id}`}</h3><p className="mt-1 text-xs text-gray-500">Booking #{booking.id}</p></div>
                <BookingStatusBadge status={booking.status} />
            </div>
            <div className="mt-5 space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2"><CalendarDays size={16} className="text-green-700" />{displayDate(booking.start_at)}</p>
                <p className="flex items-center gap-2"><Clock3 size={16} className="text-green-700" />{displayTime(booking.start_at)} – {displayTime(booking.end_at)} ({booking.duration_minutes} min)</p>
                {booking.court?.location && <p className="flex items-center gap-2"><MapPin size={16} className="text-green-700" />{booking.court.location}</p>}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="font-bold text-gray-900">PHP {Number(booking.total_price || 0).toFixed(2)}</span>
                <div className="flex gap-2">
                    <button type="button" onClick={() => onView(booking.id)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50">Details</button>
                    {canCancel && <button type="button" onClick={() => onCancel(booking)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50">Cancel</button>}
                </div>
            </div>
        </article>
    );
}
