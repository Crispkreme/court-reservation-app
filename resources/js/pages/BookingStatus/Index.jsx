import { useEffect, useState } from "react";

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
    DRAFT: "bg-gray-100 text-gray-700",
    PENDING_PAYMENT: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-green-100 text-green-700",
    CHECKED_IN: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-indigo-100 text-indigo-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
    RESCHEDULED: "bg-purple-100 text-purple-700",
    NO_SHOW: "bg-orange-100 text-orange-700",
    EXPIRED: "bg-gray-200 text-gray-700",
    FAILED: "bg-red-100 text-red-800",
};

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                statusClasses[status] ??
                "bg-gray-100 text-gray-700"
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
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Booking Status & Lifecycle
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Manage booking statuses and view
                        the complete lifecycle history of
                        every booking.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Total Bookings
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900">
                            {pagination?.total ?? 0}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Current Filter
                        </p>

                        <p className="mt-2 text-lg font-semibold text-gray-900">
                            {filters.status
                                ? filters.status.replaceAll(
                                      "_",
                                      " "
                                  )
                                : "All Statuses"}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Lifecycle States
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900">
                            {STATUS_OPTIONS.length}
                        </p>
                    </div>
                </div>

                <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Status
                            </label>

                            <select
                                value={filters.status}
                                onChange={(event) =>
                                    setFilters({
                                        ...filters,
                                        status: event.target
                                            .value,
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            >
                                <option value="">
                                    All Statuses
                                </option>

                                {STATUS_OPTIONS.map(
                                    (status) => (
                                        <option
                                            key={status}
                                            value={status}
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
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Booking Date
                            </label>

                            <input
                                type="date"
                                value={filters.date}
                                onChange={(event) =>
                                    setFilters({
                                        ...filters,
                                        date: event.target
                                            .value,
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
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
                                className="w-full rounded-lg bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-800"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-5 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Bookings
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-500">
                            Loading bookings...
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No bookings found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                            Reference
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                            Customer
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                            Court
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                            Date
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                            Time
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                            Status
                                        </th>

                                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                    {bookings.map(
                                        (booking) => (
                                            <tr
                                                key={
                                                    booking.id
                                                }
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="font-semibold text-gray-900">
                                                        {
                                                            booking.booking_reference
                                                        }
                                                    </div>

                                                    <div className="text-xs text-gray-500">
                                                        #
                                                        {
                                                            booking.id
                                                        }
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="font-medium text-gray-900">
                                                        {
                                                            booking.customer_name
                                                        }
                                                    </div>

                                                    <div className="text-sm text-gray-500">
                                                        {
                                                            booking.customer_email
                                                        }
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 text-gray-700">
                                                    {booking
                                                        .court
                                                        ?.name ??
                                                        `Court #${booking.court_id}`}
                                                </td>

                                                <td className="px-5 py-4 text-gray-700">
                                                    {
                                                        booking.booking_date
                                                    }
                                                </td>

                                                <td className="px-5 py-4 text-gray-700">
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
                                                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
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
                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <div className="mb-5">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Update Status
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {
                                        selectedBooking.booking_reference
                                    }
                                </p>
                            </div>

                            <div className="mb-5 rounded-lg bg-gray-50 p-4">
                                <div className="text-sm text-gray-500">
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
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
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
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
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
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
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
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                        placeholder="Reason for status change"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
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
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                        placeholder="Additional notes"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving
                                        ? "Updating..."
                                        : "Update Booking Status"}
                                </button>
                            </form>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <div className="mb-5">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Status History
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Complete lifecycle for{" "}
                                    {
                                        selectedBooking.booking_reference
                                    }
                                </p>
                            </div>

                            {historyLoading ? (
                                <div className="py-8 text-center text-gray-500">
                                    Loading history...
                                </div>
                            ) : history.length === 0 ? (
                                <div className="rounded-lg bg-gray-50 p-6 text-center text-gray-500">
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
                                                className="relative border-l-2 border-gray-200 pl-5"
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

                                                            <span className="text-gray-400">
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

                                                <div className="mt-2 text-xs text-gray-500">
                                                    {item.changed_at
                                                        ? new Date(
                                                              item.changed_at
                                                          ).toLocaleString()
                                                        : ""}
                                                </div>

                                                {item.reason && (
                                                    <div className="mt-2 text-sm font-medium text-gray-800">
                                                        {
                                                            item.reason
                                                        }
                                                    </div>
                                                )}

                                                {item.notes && (
                                                    <div className="mt-1 text-sm text-gray-600">
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
        </div>
    );
}