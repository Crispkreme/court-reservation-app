import { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import { Activity, CalendarDays, Filter, History, RefreshCw, ShieldCheck } from "lucide-react";

const API = "/api/v1";

const STATUS_OPTIONS = [
    "DRAFT",
    "PENDING_PAYMENT",
    "CONFIRMED",
    "CHECKED_IN",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "RESCHEDULED",
    "NO_SHOW",
    "EXPIRED",
    "FAILED",
];

const statusClasses = {
    DRAFT: "bg-slate-100 text-slate-700",
    PENDING_PAYMENT: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-green-100 text-green-700",
    CHECKED_IN: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-indigo-100 text-indigo-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
    RESCHEDULED: "bg-purple-100 text-purple-700",
    NO_SHOW: "bg-orange-100 text-orange-700",
    EXPIRED: "bg-slate-200 text-slate-700",
    FAILED: "bg-red-100 text-red-800",
};

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                statusClasses[status] ??
                "bg-slate-100 text-slate-700"
            }`}
        >
            {status?.replaceAll("_", " ")}
        </span>
    );
}

export default function BookingStatus() {
    const [bookings, setBookings] = useState([]);
    const [pagination, setPagination] = useState(null);

    const [selectedBooking, setSelectedBooking] = useState(null);
    const [history, setHistory] = useState([]);

    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [filters, setFilters] = useState({
        status: "",
        date: "",
    });

    const [statusForm, setStatusForm] = useState({
        status: "",
        reason: "",
        notes: "",
    });

    async function loadBookings() {
        setLoading(true);
        setError("");

        try {
            const params = new URLSearchParams();

            if (filters.status) {
                params.set("status", filters.status);
            }

            if (filters.date) {
                params.set("date", filters.date);
            }

            const query = params.toString();

            const response = await fetch(
                `${API}/booking-statuses/bookings${
                    query ? `?${query}` : ""
                }`,
                {
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ??
                        "Unable to load bookings."
                );
            }

            setBookings(result.data?.data ?? []);
            setPagination(result.data ?? null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function loadHistory(booking) {
        setSelectedBooking(booking);
        setHistory([]);
        setHistoryLoading(true);
        setError("");

        setStatusForm({
            status: "",
            reason: "",
            notes: "",
        });

        try {
            const response = await fetch(
                `${API}/booking-statuses/bookings/${booking.id}/history`,
                {
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ??
                        "Unable to load booking history."
                );
            }

            setSelectedBooking(
                result.data?.booking ?? booking
            );

            setHistory(result.data?.history ?? []);
        } catch (err) {
            setError(err.message);
        } finally {
            setHistoryLoading(false);
        }
    }

    async function updateStatus(event) {
        event.preventDefault();

        if (!selectedBooking) {
            return;
        }

        if (!statusForm.status) {
            setError("Please select a new status.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const response = await fetch(
                `${API}/booking-statuses/bookings/${selectedBooking.id}/status`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify(statusForm),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                const validationErrors =
                    result.errors
                        ? Object.values(result.errors)
                              .flat()
                              .join(" ")
                        : null;

                throw new Error(
                    validationErrors ??
                        result.message ??
                        "Unable to update booking status."
                );
            }

            const updatedBooking =
                result.data?.booking;

            if (updatedBooking) {
                setSelectedBooking(updatedBooking);
            }

            await loadHistory(
                updatedBooking ?? selectedBooking
            );

            await loadBookings();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    useEffect(() => {
        loadBookings();
    }, [filters.status, filters.date]);

    return (
        <Layout title="Booking Status">
            <div className="mx-auto w-full max-w-[1800px] space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                                Booking Status & Lifecycle
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Manage booking statuses and review the complete lifecycle history.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={loadBookings}
                        className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:self-auto"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">
                            Total Bookings
                        </p>

                        <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                            {pagination?.total ?? 0}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">
                            Current Filter
                        </p>

                        <p className="mt-2 text-lg font-semibold text-slate-900">
                            {filters.status
                                ? filters.status.replaceAll(
                                      "_",
                                      " "
                                  )
                                : "All Statuses"}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">
                            Lifecycle States
                        </p>

                        <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                            {STATUS_OPTIONS.length}
                        </p>
                    </div>
                </div>

                <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Status
                            </label>

                            <select
                                value={filters.status}
                                onChange={(event) =>
                                    setFilters({
                                        ...filters,
                                        status: event.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">All Statuses</option>

                                {STATUS_OPTIONS.map((status) => (
                                    <option key={status} value={status}>
                                        {status.replaceAll("_", " ")}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Booking Date
                            </label>

                            <input
                                type="date"
                                value={filters.date}
                                onChange={(event) =>
                                    setFilters({
                                        ...filters,
                                        date: event.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={() =>
                                    setFilters({
                                        status: "",
                                        date: "",
                                    })
                                }
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                <Filter size={16} />
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <div className="flex items-center gap-2">
                            <CalendarDays size={18} className="text-blue-600" />
                            <h2 className="text-lg font-semibold text-slate-900">
                                Bookings
                            </h2>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-slate-500">
                            Loading bookings...
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            No bookings found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Reference
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Customer
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Court
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Date
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Time
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Status
                                        </th>

                                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-200">
                                    {bookings.map(
                                        (booking) => (
                                            <tr
                                                key={
                                                    booking.id
                                                }
                                                className="transition-colors hover:bg-slate-50"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="font-semibold text-slate-900">
                                                        {
                                                            booking.booking_reference
                                                        }
                                                    </div>

                                                    <div className="text-xs text-slate-500">
                                                        #
                                                        {
                                                            booking.id
                                                        }
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="font-medium text-slate-900">
                                                        {
                                                            booking.customer_name
                                                        }
                                                    </div>

                                                    <div className="text-sm text-slate-500">
                                                        {
                                                            booking.customer_email
                                                        }
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 text-slate-700">
                                                    {booking
                                                        .court
                                                        ?.name ??
                                                        `Court #${booking.court_id}`}
                                                </td>

                                                <td className="px-5 py-4 text-slate-700">
                                                    {
                                                        booking.booking_date
                                                    }
                                                </td>

                                                <td className="px-5 py-4 text-slate-700">
                                                    {booking.start_time?.slice(
                                                        0,
                                                        5
                                                    )}{" "}
                                                    -
                                                    {booking.end_time?.slice(
                                                        0,
                                                        5
                                                    )}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <StatusBadge
                                                        status={
                                                            booking.status
                                                        }
                                                    />
                                                </td>

                                                <td className="px-5 py-4 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            loadHistory(
                                                                booking
                                                            )
                                                        }
                                                        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                    >
                                                        View
                                                        Lifecycle
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {selectedBooking && (
                    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-5">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={19} className="text-blue-600" />
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Update Status
                                    </h2>
                                </div>

                                <p className="mt-1 text-sm text-slate-500">
                                    {
                                        selectedBooking.booking_reference
                                    }
                                </p>
                            </div>

                            <div className="mb-5 rounded-lg bg-slate-50 p-4">
                                <div className="text-sm text-slate-500">
                                    Current Status
                                </div>

                                <div className="mt-2">
                                    <StatusBadge
                                        status={
                                            selectedBooking.status
                                        }
                                    />
                                </div>
                            </div>

                            <form
                                onSubmit={
                                    updateStatus
                                }
                                className="space-y-4"
                            >
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        New Status
                                    </label>

                                    <select
                                        value={
                                            statusForm.status
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setStatusForm({
                                                ...statusForm,
                                                status: event
                                                    .target
                                                    .value,
                                            })
                                        }
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="">
                                            Select status
                                        </option>

                                        {STATUS_OPTIONS.map(
                                            (status) => (
                                                <option
                                                    key={
                                                        status
                                                    }
                                                    value={
                                                        status
                                                    }
                                                >
                                                    {status.replaceAll(
                                                        "_",
                                                        " "
                                                    )}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Reason
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            statusForm.reason
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setStatusForm({
                                                ...statusForm,
                                                reason: event
                                                    .target
                                                    .value,
                                            })
                                        }
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        placeholder="Reason for status change"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Notes
                                    </label>

                                    <textarea
                                        value={
                                            statusForm.notes
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setStatusForm({
                                                ...statusForm,
                                                notes: event
                                                    .target
                                                    .value,
                                            })
                                        }
                                        rows="4"
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        placeholder="Additional notes"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving
                                        ? "Updating..."
                                        : "Update Booking Status"}
                                </button>
                            </form>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-5">
                                <div className="flex items-center gap-2">
                                    <History size={19} className="text-blue-600" />
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Status History
                                    </h2>
                                </div>

                                <p className="mt-1 text-sm text-slate-500">
                                    Complete lifecycle for{" "}
                                    {
                                        selectedBooking.booking_reference
                                    }
                                </p>
                            </div>

                            {historyLoading ? (
                                <div className="py-8 text-center text-slate-500">
                                    Loading history...
                                </div>
                            ) : history.length === 0 ? (
                                <div className="rounded-lg bg-slate-50 p-6 text-center text-slate-500">
                                    No status history
                                    found.
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {history.map(
                                        (item) => (
                                            <div
                                                key={
                                                    item.id
                                                }
                                                className="relative border-l-2 border-slate-200 pl-5"
                                            >
                                                <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-gray-400" />

                                                <div className="flex flex-wrap items-center gap-2">
                                                    {item.from_status && (
                                                        <>
                                                            <StatusBadge
                                                                status={
                                                                    item.from_status
                                                                }
                                                            />

                                                            <span className="text-slate-400">
                                                                →
                                                            </span>
                                                        </>
                                                    )}

                                                    <StatusBadge
                                                        status={
                                                            item.to_status
                                                        }
                                                    />
                                                </div>

                                                <div className="mt-2 text-xs text-slate-500">
                                                    {item.changed_at
                                                        ? new Date(
                                                              item.changed_at
                                                          ).toLocaleString()
                                                        : ""}
                                                </div>

                                                {item.reason && (
                                                    <div className="mt-2 text-sm font-medium text-slate-800">
                                                        {
                                                            item.reason
                                                        }
                                                    </div>
                                                )}

                                                {item.notes && (
                                                    <div className="mt-1 text-sm text-slate-600">
                                                        {
                                                            item.notes
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}