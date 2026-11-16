import React, { useCallback, useEffect, useState } from "react";
import { CalendarPlus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cancelBooking, getBookings } from "@/services/bookingService";
import BookingCard from "@/components/booking/BookingCard";
import CancelBookingModal from "@/components/booking/CancelBookingModal";

const errorText = (error) => error?.response?.data?.message || "Something went wrong. Please try again.";

export default function Index() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [status, setStatus] = useState("all");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [selected, setSelected] = useState(null);
    const [cancelling, setCancelling] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const result = await getBookings({ page, per_page: 12, ...(status !== "all" ? { status } : {}) });
            const payload = result.data && !Array.isArray(result.data) ? result.data : result;
            setBookings(Array.isArray(payload.data) ? payload.data : Array.isArray(payload) ? payload : []);
            setLastPage(payload.last_page || 1);
        } catch (err) { setError(errorText(err)); }
        finally { setLoading(false); }
    }, [page, status]);

    useEffect(() => { load(); }, [load]);

    const confirmCancel = async () => {
        if (!selected) return;
        setCancelling(true);
        try { await cancelBooking(selected.id); setSelected(null); await load(); }
        catch (err) { setError(errorText(err)); }
        finally { setCancelling(false); }
    };

    const filtered = bookings.filter((booking) => `${booking.id} ${booking.court?.name || ""}`.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div><h1 className="text-2xl font-bold text-gray-900">My Bookings</h1><p className="mt-1 text-sm text-gray-500">Manage your court reservations.</p></div>
                <button type="button" onClick={() => navigate("/member/bookings/create")} className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white hover:bg-green-800"><CalendarPlus size={18} />New booking</button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1"><Search size={18} className="absolute left-3 top-3 text-gray-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search court or booking number" className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-green-600" /></div>
                <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm"><option value="all">All statuses</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>
            </div>
            {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
            {loading ? <p className="py-12 text-center text-gray-500">Loading bookings...</p> : filtered.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((booking) => <BookingCard key={booking.id} booking={booking} onView={(id) => navigate(`/member/bookings/${id}`)} onCancel={setSelected} />)}</div> : <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-500">No bookings found.</div>}
            {lastPage > 1 && <div className="flex items-center justify-center gap-4"><button disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)} className="rounded-lg border px-4 py-2 disabled:opacity-40">Previous</button><span className="text-sm text-gray-600">Page {page} of {lastPage}</span><button disabled={page >= lastPage || loading} onClick={() => setPage((p) => p + 1)} className="rounded-lg border px-4 py-2 disabled:opacity-40">Next</button></div>}
            <CancelBookingModal booking={selected} loading={cancelling} onClose={() => setSelected(null)} onConfirm={confirmCancel} />
        </div>
    );
}
