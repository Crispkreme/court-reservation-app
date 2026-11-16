import React, { useMemo } from "react";
import { CalendarDays } from "lucide-react";

const minutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
};
const clock = (minute) => `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
const datePart = (value) => String(value || "").slice(0, 10);
const timePart = (value) => String(value || "").slice(11, 16);
const statusClass = {
    pending: "border-amber-300 bg-amber-50 text-amber-900",
    confirmed: "border-green-300 bg-green-50 text-green-900",
    completed: "border-blue-300 bg-blue-50 text-blue-900",
    cancelled: "border-slate-300 bg-slate-100 text-slate-600",
};
const STEP = 30;
const ROW_HEIGHT = 64;

export default function BookingCalendar({
    bookings = [], courts = [], date,
    timeFrom = "06:00", timeTo = "23:00", onBookingClick,
}) {
    const start = minutes(timeFrom);
    const end = minutes(timeTo);
    const valid = Number.isFinite(start) && Number.isFinite(end) && start >= 0 && end <= 1440 && end > start;
    const rows = useMemo(() => {
        if (!valid) return [];
        return Array.from({ length: Math.ceil((end - start) / STEP) }, (_, index) => start + index * STEP);
    }, [start, end, valid]);

    const events = useMemo(() => {
        if (!valid || !date) return [];
        return bookings.flatMap((booking) => {
            if (!booking.start_at || !booking.end_at) return [];
            const fromDate = datePart(booking.start_at);
            const toDate = datePart(booking.end_at);
            if (fromDate > date || toDate < date) return [];
            const from = fromDate < date ? 0 : minutes(timePart(booking.start_at));
            const to = toDate > date ? 1440 : minutes(timePart(booking.end_at));
            const visibleFrom = Math.max(from, start);
            const visibleTo = Math.min(to, end);
            if (!Number.isFinite(from) || !Number.isFinite(to) || visibleTo <= visibleFrom) return [];
            return [{ ...booking, visibleFrom, visibleTo }];
        });
    }, [bookings, date, start, end, valid]);

    if (!valid) return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">Choose a valid time range where To Time is later than From Time.</p>;
    if (!courts.length) return <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center text-slate-500"><CalendarDays className="mx-auto mb-2" />No courts available.</div>;

    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
            <div className="min-w-max">
                <div className="sticky top-0 z-20 flex bg-slate-50">
                    <div className="sticky left-0 z-30 w-20 shrink-0 border-b border-r border-slate-200 bg-slate-50 p-3 text-xs font-semibold">Time</div>
                    {courts.map((court) => <div key={court.id} className="w-56 shrink-0 border-b border-r border-slate-200 p-3 text-sm font-semibold text-slate-800">{court.name}</div>)}
                </div>
                <div className="flex">
                    <div className="sticky left-0 z-10 w-20 shrink-0 bg-white">
                        {rows.map((minute) => <div key={minute} style={{ height: ROW_HEIGHT }} className="border-b border-r border-slate-100 px-2 pt-2 text-xs text-slate-500">{clock(minute)}</div>)}
                    </div>
                    {courts.map((court) => {
                        const courtEvents = events.filter((event) => String(event.court_id ?? event.court?.id) === String(court.id));
                        return (
                            <div key={court.id} className="relative w-56 shrink-0 border-r border-slate-200" style={{ height: rows.length * ROW_HEIGHT }}>
                                {rows.map((minute) => <div key={minute} style={{ height: ROW_HEIGHT }} className="border-b border-slate-100" />)}
                                {courtEvents.map((booking) => {
                                    const top = ((booking.visibleFrom - start) / STEP) * ROW_HEIGHT;
                                    const height = ((booking.visibleTo - booking.visibleFrom) / STEP) * ROW_HEIGHT;
                                    return (
                                        <button key={booking.id} type="button" onClick={() => onBookingClick?.(booking)}
                                            title={`Booking #${booking.id} | ${timePart(booking.start_at)}–${timePart(booking.end_at)} | ${booking.status}`}
                                            style={{ top: top + 2, height: Math.max(20, height - 4) }}
                                            className={`absolute left-1 right-1 overflow-hidden rounded-md border p-2 text-left text-xs shadow-sm hover:brightness-95 ${statusClass[booking.status] || statusClass.cancelled}`}>
                                            <span className="block font-bold">{timePart(booking.start_at)} – {timePart(booking.end_at)}</span>
                                            <span className="block truncate">{booking.user?.name || `Booking #${booking.id}`}</span>
                                            <span className="block capitalize">{booking.status}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
