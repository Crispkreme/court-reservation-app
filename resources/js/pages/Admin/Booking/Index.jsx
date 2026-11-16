import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Plus,
    RefreshCw,
} from "lucide-react";

import { getBookingCalendar } from "@/services/bookingService";
import { getCourts } from "@/services/courtService";
import BookingCalendar from "@/components/booking/BookingCalendar";
import BookingModal from "./modal/BookingModal";

const TIME_ZONE = "Asia/Manila";

const normalizeCollection = (response) => {
    const payload = response?.data ?? response;

    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;

    return [];
};

const getToday = () => {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const getPart = (type) =>
        parts.find((part) => part.type === type)?.value;

    return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
};

const moveDate = (date, days) => {
    const value = new Date(`${date}T12:00:00Z`);

    value.setUTCDate(value.getUTCDate() + days);

    return value.toISOString().slice(0, 10);
};

export default function BookingIndex() {
    const [courts, setCourts] = useState([]);
    const [members] = useState([]);

    const [calendarDate, setCalendarDate] = useState(getToday);
    const [timeFrom, setTimeFrom] = useState("06:00");
    const [timeTo, setTimeTo] = useState("23:00");

    const [courtFilter, setCourtFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const [error, setError] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const loadCourts = useCallback(async () => {
        try {
            const response = await getCourts();

            setCourts(normalizeCollection(response));
        } catch (err) {
            console.error("Failed to load courts:", err);

            setCourts([]);
            setError(
                err.response?.data?.message ??
                "Unable to load courts."
            );
        }
    }, []);

    useEffect(() => {
        loadCourts();
    }, [loadCourts]);

    useEffect(() => {
        let active = true;

        const loadCalendar = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await getBookingCalendar({
                    date_from: calendarDate,
                    date_to: calendarDate,
                    court_id: courtFilter || undefined,
                    status: statusFilter || undefined,
                });

                if (active) {
                    setBookings(normalizeCollection(response));
                }
            } catch (err) {
                if (active) {
                    setBookings([]);

                    setError(
                        err.response?.data?.message ??
                        "Unable to load calendar bookings."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadCalendar();

        return () => {
            active = false;
        };
    }, [
        calendarDate,
        courtFilter,
        statusFilter,
        refreshKey,
    ]);

    const filteredCourts = useMemo(() => {
        if (!courtFilter) return courts;

        return courts.filter(
            (court) => String(court.id) === String(courtFilter)
        );
    }, [courts, courtFilter]);

    const stats = useMemo(() => ({
        total: bookings.length,
        pending: bookings.filter(
            (booking) => booking.status === "pending"
        ).length,
        confirmed: bookings.filter(
            (booking) => booking.status === "confirmed"
        ).length,
        completed: bookings.filter(
            (booking) => booking.status === "completed"
        ).length,
        cancelled: bookings.filter(
            (booking) => booking.status === "cancelled"
        ).length,
    }), [bookings]);

    const refreshCalendar = () => {
        setRefreshKey((value) => value + 1);
    };

    const openCreateModal = () => {
        setSelectedBooking(null);
        setModalOpen(true);
    };

    const openEditModal = (booking) => {
        setSelectedBooking(booking);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedBooking(null);
    };

    const handleBookingSuccess = () => {
        closeModal();
        refreshCalendar();
    };

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Booking Management
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage and monitor court reservations.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={refreshCalendar}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={16}
                            className={loading ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800"
                    >
                        <Plus size={16} />
                        Add Booking
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                {[
                    {
                        label: "Total Bookings",
                        value: stats.total,
                    },
                    {
                        label: "Pending",
                        value: stats.pending,
                    },
                    {
                        label: "Confirmed",
                        value: stats.confirmed,
                    },
                    {
                        label: "Completed",
                        value: stats.completed,
                    },
                    {
                        label: "Cancelled",
                        value: stats.cancelled,
                    },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                    >
                        <p className="text-xs font-medium text-slate-500">
                            {stat.label}
                        </p>

                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-4 sm:p-6">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-700">
                                <CalendarDays size={20} />
                            </div>

                            <div>
                                <h2 className="text-base font-semibold text-slate-900">
                                    Court Booking Calendar
                                </h2>

                                <p className="text-xs text-slate-500">
                                    Daily reservations across all courts
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setCalendarDate(getToday())}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Today
                        </button>
                    </div>

                    <div className="flex flex-wrap items-end gap-3">
                        <button
                            type="button"
                            aria-label="Previous day"
                            onClick={() =>
                                setCalendarDate((date) =>
                                    moveDate(date, -1)
                                )
                            }
                            className="rounded-lg border border-slate-200 p-2.5 text-slate-700 hover:bg-slate-50"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                            Calendar Date

                            <input
                                type="date"
                                value={calendarDate}
                                onChange={(event) =>
                                    setCalendarDate(event.target.value)
                                }
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-red-500"
                            />
                        </label>

                        <button
                            type="button"
                            aria-label="Next day"
                            onClick={() =>
                                setCalendarDate((date) =>
                                    moveDate(date, 1)
                                )
                            }
                            className="rounded-lg border border-slate-200 p-2.5 text-slate-700 hover:bg-slate-50"
                        >
                            <ChevronRight size={18} />
                        </button>

                        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                            From Time

                            <input
                                type="time"
                                value={timeFrom}
                                max={timeTo}
                                onChange={(event) =>
                                    setTimeFrom(event.target.value)
                                }
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-red-500"
                            />
                        </label>

                        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                            To Time

                            <input
                                type="time"
                                value={timeTo}
                                min={timeFrom}
                                onChange={(event) =>
                                    setTimeTo(event.target.value)
                                }
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-red-500"
                            />
                        </label>

                        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                            Court

                            <select
                                value={courtFilter}
                                onChange={(event) =>
                                    setCourtFilter(event.target.value)
                                }
                                className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-red-500"
                            >
                                <option value="">All Courts</option>

                                {courts.map((court) => (
                                    <option
                                        key={court.id}
                                        value={court.id}
                                    >
                                        {court.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                            Status

                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(event.target.value)
                                }
                                className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-red-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </label>
                    </div>
                </div>

                <div className="p-4 sm:p-6">
                    {error && (
                        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex min-h-80 flex-col items-center justify-center gap-3">
                            <RefreshCw
                                size={24}
                                className="animate-spin text-red-700"
                            />

                            <p className="text-sm text-slate-500">
                                Loading calendar...
                            </p>
                        </div>
                    ) : (
                        <BookingCalendar
                            bookings={bookings}
                            courts={filteredCourts}
                            date={calendarDate}
                            timeFrom={timeFrom}
                            timeTo={timeTo}
                            onBookingClick={openEditModal}
                        />
                    )}
                </div>
            </div>

            <BookingModal
                open={modalOpen}
                booking={selectedBooking}
                courts={courts}
                members={members}
                onClose={closeModal}
                onSuccess={handleBookingSuccess}
            />
        </div>
    );
}