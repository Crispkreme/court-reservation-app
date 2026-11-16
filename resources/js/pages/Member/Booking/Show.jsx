import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { cancelBooking, getBooking } from "@/services/bookingService";
import BookingStatusBadge from "@/components/booking/BookingStatusBadge";
import CancelBookingModal from "@/components/booking/CancelBookingModal";

export default function Show() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        getBooking(id).then((result) => { if (active) setBooking(result.data ?? result); }).catch((err) => { if (active) setError(err?.response?.data?.message || "Unable to load booking."); }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [id]);

    const confirmCancel = async () => {
        setCancelling(true);
        try { const result = await cancelBooking(id); setBooking(result.data ?? result); setSelected(null); }
        catch (err) { setError(err?.response?.data?.message || "Unable to cancel booking."); }
        finally { setCancelling(false); }
    };

    const canCancel = booking && ["pending", "confirmed"].includes(booking.status) && new Date(String(booking.start_at).replace(" ", "T")).getTime() > Date.now();

    return (
        <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
            <button type="button" onClick={() => navigate("/member/bookings")} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700"><ArrowLeft size={17} />Back to bookings</button>
            <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
            {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
            {loading ? <p className="text-gray-500">Loading booking...</p> : booking ? <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"><div className="mb-6 flex items-center justify-between"><h2 className="text-lg font-bold">Booking #{booking.id}</h2><BookingStatusBadge status={booking.status} /></div><dl className="space-y-4">{[["Court", booking.court?.name || `Court #${booking.court_id}`], ["Start", booking.start_at], ["End", booking.end_at], ["Duration", `${booking.duration_minutes} minutes`], ["Total", `AED ${Number(booking.total_price || 0).toFixed(2)}`]].map(([label, value]) => <div key={label} className="flex justify-between gap-4 border-b border-gray-100 pb-3 text-sm"><dt className="text-gray-500">{label}</dt><dd className="text-right font-semibold text-gray-900">{value}</dd></div>)}</dl>{canCancel && <button type="button" onClick={() => setSelected(booking)} className="mt-6 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-50">Cancel booking</button>}</div> : <p className="text-gray-500">Booking not found.</p>}
            <CancelBookingModal booking={selected} loading={cancelling} onClose={() => setSelected(null)} onConfirm={confirmCancel} />
        </div>
    );
}
