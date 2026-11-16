import React, { useCallback, useEffect, useState } from "react";
import {
    CalendarDays,
    CalendarPlus,
    ChevronLeft,
    ChevronRight,
    SearchX,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cancelBooking, getBookings } from "@/services/bookingService";

import BookingCard from "@/components/booking/BookingCard";
import CancelBookingModal from "@/components/booking/CancelBookingModal";
import PageHeader from "@components/common/PageHeader";
import FilterPanel from "@components/common/FilterPanel";
import AlertMessage from "@components/AlertMessage";

const errorText = (error) =>
    error?.response?.data?.message || "Something went wrong. Please try again.";

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
            const result = await getBookings({
                page,
                per_page: 12,
                ...(status !== "all" ? { status } : {}),
            });
            const payload =
                result.data && !Array.isArray(result.data)
                    ? result.data
                    : result;
            setBookings(
                Array.isArray(payload.data)
                    ? payload.data
                    : Array.isArray(payload)
                      ? payload
                      : [],
            );
            setLastPage(payload.last_page || 1);
        } catch (err) {
            setError(errorText(err));
        } finally {
            setLoading(false);
        }
    }, [page, status]);

    useEffect(() => {
        load();
    }, [load]);

    const confirmCancel = async () => {
        if (!selected) return;
        setCancelling(true);
        try {
            await cancelBooking(selected.id);
            setSelected(null);
            await load();
        } catch (err) {
            setError(errorText(err));
        } finally {
            setCancelling(false);
        }
    };

    const filtered = bookings.filter((booking) =>
        `${booking.id} ${booking.court?.name || ""}`
            .toLowerCase()
            .includes(search.toLowerCase()),
    );

    return (
        <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
            <PageHeader
                title="My Bookings"
                description="Manage your court reservations."
                buttonText="New Booking"
                buttonIcon={CalendarPlus}
                showButton={true}
                onButtonClick={() => navigate("/member/bookings/create")}
            />

            <FilterPanel
                title="Search & Filter Bookings"
                search={search}
                searchLabel="Search Bookings"
                onSearchChange={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                searchPlaceholder="Search court or booking number..."
                columns={2}
                filters={[
                    {
                        name: "status",
                        label: "Booking Status",
                        value: status,
                        onChange: (value) => {
                            setStatus(value);
                            setPage(1);
                        },
                        includeDefault: false,
                        options: [
                            { value: "all", label: "All Statuses" },
                            { value: "pending", label: "Pending" },
                            { value: "confirmed", label: "Confirmed" },
                            { value: "completed", label: "Completed" },
                            { value: "cancelled", label: "Cancelled" },
                        ],
                    },
                ]}
                onClear={() => {
                    setSearch("");
                    setStatus("all");
                    setPage(1);
                }}
            />

            {error && (
                <AlertMessage
                    type="error"
                    message={error}
                    onClose={() => setError("")}
                />
            )}

            <div className="space-y-6">
                {loading ? (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                            >
                                <div className="space-y-4 p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="h-11 w-11 rounded-xl bg-slate-100" />
                                        <div className="h-6 w-24 rounded-full bg-slate-100" />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="h-5 w-3/4 rounded-lg bg-slate-100" />
                                        <div className="h-4 w-1/2 rounded-lg bg-slate-100" />
                                    </div>

                                    <div className="space-y-3 rounded-xl bg-slate-50 p-4">
                                        <div className="h-4 w-4/5 rounded bg-slate-200" />
                                        <div className="h-4 w-3/5 rounded bg-slate-200" />
                                        <div className="h-4 w-2/5 rounded bg-slate-200" />
                                    </div>

                                    <div className="h-10 rounded-xl bg-slate-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length > 0 ? (
                    <>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Your Reservations
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Showing {filtered.length} reservation
                                    {filtered.length !== 1 ? "s" : ""} on this
                                    page
                                </p>
                            </div>

                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                                <CalendarDays
                                    size={15}
                                    className="text-red-700"
                                />
                                Page {page} of {lastPage}
                            </div>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {filtered.map((booking) => (
                                <BookingCard
                                    key={booking.id}
                                    booking={booking}
                                    onView={(id) =>
                                        navigate(`/member/reservations/${id}`)
                                    }
                                    onCancel={setSelected}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm sm:py-20">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50">
                            <SearchX size={36} className="text-slate-400" />
                        </div>

                        <h3 className="mt-6 text-xl font-bold text-slate-900">
                            No Bookings Found
                        </h3>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                            No reservations match your current filters. Try
                            adjusting your search or book a court to get
                            started.
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/member/book")}
                            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-800"
                        >
                            <CalendarPlus size={18} />
                            Book a Court
                        </button>
                    </div>
                )}

                {!loading && lastPage > 1 && (
                    <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row">
                        <div className="text-sm text-slate-500">
                            Page{" "}
                            <span className="font-semibold text-slate-900">
                                {page}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-slate-900">
                                {lastPage}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={page <= 1 || loading}
                                onClick={() =>
                                    setPage((current) =>
                                        Math.max(1, current - 1),
                                    )
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={17} />
                                Previous
                            </button>

                            <div className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-red-700 px-3 text-sm font-bold text-white">
                                {page}
                            </div>

                            <button
                                type="button"
                                disabled={page >= lastPage || loading}
                                onClick={() =>
                                    setPage((current) =>
                                        Math.min(lastPage, current + 1),
                                    )
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                                <ChevronRight size={17} />
                            </button>
                        </div>
                    </div>
                )}

                <CancelBookingModal
                    booking={selected}
                    loading={cancelling}
                    onClose={() => setSelected(null)}
                    onConfirm={confirmCancel}
                />
            </div>
        </div>
    );
}
