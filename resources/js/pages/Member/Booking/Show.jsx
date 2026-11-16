import React, { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Clock3, MapPin, CreditCard, Hash, Timer, CalendarCheck2, AlertCircle, ArrowRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { cancelBooking, getBooking } from "@/services/bookingService";

import BookingStatusBadge from "@/components/booking/BookingStatusBadge";
import CancelBookingModal from "@/components/booking/CancelBookingModal";
import PageHeader from "@/components/common/PageHeader";
import AlertMessage from "@/components/AlertMessage";

const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(String(value).replace(" ", "T"));

    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString("en-AE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

const formatTime = (value) => {
    if (!value) return "—";

    const date = new Date(String(value).replace(" ", "T"));

    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleTimeString("en-AE", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

const formatCurrency = (value) => {
    return `AED ${Number(value || 0).toLocaleString("en-AE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

function InfoItem({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Icon size={20} />
            </div>

            <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">
                    {label}
                </p>

                <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                    {value}
                </p>
            </div>
        </div>
    );
}

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

        setLoading(true);
        setError("");
        setBooking(null);

        getBooking(id)
            .then((result) => {
                if (active) {
                    setBooking(result.data ?? result);
                }
            })
            .catch((err) => {
                if (active) {
                    setError(
                        err?.response?.data?.message ||
                            "Unable to load booking."
                    );
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [id]);

    const confirmCancel = async () => {
        setCancelling(true);
        setError("");

        try {
            const result = await cancelBooking(id);

            setBooking(result.data ?? result);
            setSelected(null);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "Unable to cancel booking."
            );
        } finally {
            setCancelling(false);
        }
    };

    const startTime = booking?.start_at
        ? new Date(String(booking.start_at).replace(" ", "T"))
        : null;

    const canCancel =
        booking &&
        ["pending", "confirmed"].includes(booking.status) &&
        startTime &&
        !Number.isNaN(startTime.getTime()) &&
        startTime.getTime() > Date.now();

    return (
        <div className="space-y-6 p-6 lg:p-10">
            <button
                type="button"
                onClick={() => navigate("/member/bookings")}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-red-700"
            >
                <ArrowLeft size={17} />
                Back to Bookings
            </button>

            <PageHeader
                title="Booking Details"
                description="Review your court reservation and booking information."
            />

            {error && (
                <AlertMessage
                    type="error"
                    message={error}
                />
            )}

            {loading ? (
                <div className="space-y-5 animate-pulse">
                    <div className="h-32 rounded-2xl bg-slate-200" />

                    <div className="grid gap-5 lg:grid-cols-3">
                        <div className="h-80 rounded-2xl bg-slate-200 lg:col-span-2" />
                        <div className="h-80 rounded-2xl bg-slate-200" />
                    </div>
                </div>
            ) : booking ? (
                <>
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-700">
                                    <CalendarCheck2 size={26} />
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Reservation Reference
                                    </p>

                                    <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                                        Booking #{booking.id}
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {booking.court?.name ||
                                            `Court #${booking.court_id}`}
                                    </p>
                                </div>
                            </div>

                            <BookingStatusBadge
                                status={booking.status}
                            />
                        </div>

                        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Hash size={14} />
                                Reservation ID: {booking.id}
                            </div>
                        </div>
                    </div>

                    <div className="grid items-start gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-700">
                                            <CalendarDays size={20} />
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-slate-900">
                                                Reservation Schedule
                                            </h3>

                                            <p className="mt-0.5 text-xs text-slate-500">
                                                Your reserved date and time
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                                        <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-800">
                                            <CalendarDays
                                                size={18}
                                                className="text-red-700"
                                            />
                                            {formatDate(booking.start_at)}
                                        </div>

                                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Start Time
                                                </p>

                                                <p className="mt-1 text-lg font-bold text-slate-900 sm:text-2xl">
                                                    {formatTime(booking.start_at)}
                                                </p>
                                            </div>

                                            <ArrowRight
                                                size={20}
                                                className="text-slate-400"
                                            />

                                            <div className="text-right">
                                                <p className="text-xs text-slate-500">
                                                    End Time
                                                </p>

                                                <p className="mt-1 text-lg font-bold text-slate-900 sm:text-2xl">
                                                    {formatTime(booking.end_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex items-center gap-2 text-sm text-slate-600">
                                        <Timer
                                            size={17}
                                            className="text-red-700"
                                        />
                                        Duration:
                                        <span className="font-semibold text-slate-900">
                                            {booking.duration_minutes} minutes
                                        </span>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 px-6 py-5">
                                    <h3 className="font-bold text-slate-900">
                                        Court Information
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Details of your reserved court
                                    </p>
                                </div>

                                <div className="grid gap-6 p-6 sm:grid-cols-2">
                                    <InfoItem
                                        icon={MapPin}
                                        label="Court"
                                        value={
                                            booking.court?.name ||
                                            `Court #${booking.court_id}`
                                        }
                                    />

                                    <InfoItem
                                        icon={Hash}
                                        label="Court ID"
                                        value={booking.court_id}
                                    />

                                    <InfoItem
                                        icon={CalendarDays}
                                        label="Booking Date"
                                        value={formatDate(booking.start_at)}
                                    />

                                    <InfoItem
                                        icon={Clock3}
                                        label="Reserved Duration"
                                        value={`${booking.duration_minutes} minutes`}
                                    />
                                </div>
                            </section>
                        </div>

                        <div className="space-y-6">
                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <CreditCard
                                            size={19}
                                            className="text-red-700"
                                        />

                                        <h3 className="font-bold text-slate-900">
                                            Booking Summary
                                        </h3>
                                    </div>
                                </div>

                                <div className="space-y-5 p-6">
                                    <div className="flex items-center justify-between gap-3 text-sm">
                                        <span className="text-slate-500">
                                            Court
                                        </span>

                                        <span className="text-right font-semibold text-slate-900">
                                            {booking.court?.name ||
                                                `Court #${booking.court_id}`}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 text-sm">
                                        <span className="text-slate-500">
                                            Duration
                                        </span>

                                        <span className="font-semibold text-slate-900">
                                            {booking.duration_minutes} min
                                        </span>
                                    </div>

                                    <div className="border-t border-dashed border-slate-200 pt-5">
                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Total Booking Amount
                                        </p>

                                        <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                                            {formatCurrency(
                                                booking.total_price
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {canCancel && (
                                <section className="rounded-2xl border border-red-100 bg-red-50/50 p-5">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle
                                            size={20}
                                            className="mt-0.5 shrink-0 text-red-700"
                                        />

                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900">
                                                Cancel Reservation
                                            </h3>

                                            <p className="mt-2 text-xs leading-5 text-slate-600">
                                                You can cancel this reservation
                                                before its scheduled start time.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setSelected(booking)}
                                        className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
                                    >
                                        Cancel Booking
                                    </button>
                                </section>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                    <CalendarDays
                        size={40}
                        className="mx-auto text-slate-300"
                    />

                    <h3 className="mt-4 text-lg font-bold text-slate-900">
                        Booking Not Found
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                        The reservation could not be found.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/member/reservations")}
                        className="mt-6 rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-800"
                    >
                        Back to My Bookings
                    </button>
                </div>
            )}

            <CancelBookingModal
                booking={selected}
                loading={cancelling}
                onClose={() => setSelected(null)}
                onConfirm={confirmCancel}
            />
        </div>
    );
}
