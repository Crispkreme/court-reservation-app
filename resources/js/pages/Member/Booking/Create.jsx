import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCourts } from "@/services/courtService";
import { createBooking, getCourtAvailability } from "@/services/bookingService";
import TimeSlotSelector from "@/components/booking/TimeSlotSelector";
import BookingSummary from "@/components/booking/BookingSummary";

const localDate = () => {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
    const part = (type) => parts.find((item) => item.type === type)?.value;
    return `${part("year")}-${part("month")}-${part("day")}`;
};
const errorText = (error) => Object.values(error?.response?.data?.errors || {}).flat()[0] || error?.response?.data?.message || "Something went wrong. Please try again.";

export default function Create() {
    const navigate = useNavigate();
    const [courts, setCourts] = useState([]);
    const [courtId, setCourtId] = useState("");
    const [date, setDate] = useState(localDate);
    const [duration, setDuration] = useState(60);
    const [availability, setAvailability] = useState(null);
    const [slot, setSlot] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        getCourts().then((result) => {
            if (!active) return;
            const payload = result.data ?? result;
            setCourts(Array.isArray(payload) ? payload : payload.data || []);
        }).catch((err) => { if (active) setError(errorText(err)); });
        return () => { active = false; };
    }, []);

    useEffect(() => {
        setSlot(null);
        setAvailability(null);
        setError("");
        if (!courtId || !date || !duration) return;
        let active = true;
        setLoading(true);
        getCourtAvailability(courtId, { date, duration_minutes: Number(duration) })
            .then((result) => { if (active) setAvailability(result.data ?? result); })
            .catch((err) => { if (active) setError(errorText(err)); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [courtId, date, duration]);

    const submit = async (event) => {
        event.preventDefault();
        if (!slot) return;
        setSaving(true);
        setError("");
        try {
            const result = await createBooking({ court_id: Number(courtId), start_at: slot.start_at, end_at: slot.end_at, duration_minutes: Number(duration) });
            const booking = result.data ?? result;
            navigate(booking?.id ? `/member/bookings/${booking.id}` : "/member/bookings");
        } catch (err) { setError(errorText(err)); }
        finally { setSaving(false); }
    };

    const court = courts.find((item) => String(item.id) === String(courtId));

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
            <button type="button" onClick={() => navigate("/member/bookings")} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700"><ArrowLeft size={17} />Back to bookings</button>
            <div><h1 className="text-2xl font-bold text-gray-900">New Booking</h1><p className="mt-1 text-sm text-gray-500">Choose a court, date, duration and available time slot.</p></div>
            {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <label className="space-y-2 text-sm font-semibold text-gray-700">Court<select required value={courtId} onChange={(e) => setCourtId(e.target.value)} className="block w-full rounded-xl border border-gray-200 bg-white p-3 font-normal"><option value="">Select court</option>{courts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                        <label className="space-y-2 text-sm font-semibold text-gray-700">Date<input required type="date" min={localDate()} value={date} onChange={(e) => setDate(e.target.value)} className="block w-full rounded-xl border border-gray-200 p-3 font-normal" /></label>
                        <label className="space-y-2 text-sm font-semibold text-gray-700">Duration<select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="block w-full rounded-xl border border-gray-200 bg-white p-3 font-normal">{[30, 60, 90, 120].map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}</select></label>
                    </div>
                    <div><h2 className="mb-3 font-bold text-gray-900">Available time slots</h2><TimeSlotSelector slots={availability?.slots || []} value={slot} onChange={setSlot} loading={loading} /></div>
                </div>
                <div className="space-y-4"><BookingSummary court={court} date={date} duration={duration} slot={slot} price={availability?.price} /><button type="submit" disabled={!slot || saving || loading} className="w-full rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Submitting..." : "Confirm booking"}</button></div>
            </form>
        </div>
    );
}
