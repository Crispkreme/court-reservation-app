import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API = "/api/v1";

export default function CustomerDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const token = localStorage.getItem("auth_token");

    const fetchDashboard = async () => {
        setLoading(true);
        setError("");

        try {
            const params = new URLSearchParams();

            if (search) {
                params.append("search", search);
            }

            if (dateFrom) {
                params.append("date_from", dateFrom);
            }

            if (dateTo) {
                params.append("date_to", dateTo);
            }

            const url = `${API}/customer-dashboard${
                params.toString() ? `?${params.toString()}` : ""
            }`;

            const response = await fetch(url, {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Unable to load customer dashboard.");
            }

            const data = await response.json();

            setDashboard(data);
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString();
    };

    const formatTime = (time) => {
        if (!time) {
            return "-";
        }

        const [hours, minutes] = time.split(":");

        const date = new Date();
        date.setHours(Number(hours), Number(minutes), 0);

        return date.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(Number(value || 0));
    };

    const clearFilters = () => {
        setSearch("");
        setDateFrom("");
        setDateTo("");

        setTimeout(() => {
            fetchDashboard();
        }, 0);
    };

    const membership = dashboard?.membership;

    const membershipType =
        membership?.membership_type?.name ||
        membership?.membershipType?.name ||
        membership?.membership_type?.level ||
        "No Active Membership";

    const filteredTodayBookings = useMemo(() => {
        return dashboard?.today_bookings || [];
    }, [dashboard]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-xl bg-white p-8 shadow">
                        Loading customer dashboard...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
                        <h2 className="mb-2 text-lg font-semibold">
                            Dashboard Error
                        </h2>

                        <p>{error}</p>

                        <button
                            onClick={fetchDashboard}
                            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="mx-auto max-w-7xl space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Customer Dashboard
                        </h1>

                        <p className="mt-1 text-gray-500">
                            Welcome back, {dashboard?.user?.name}.
                        </p>
                    </div>

                    <Link
                        to="/bookings"
                        className="rounded-lg bg-blue-600 px-5 py-3 text-center font-medium text-white hover:bg-blue-700"
                    >
                        Quick Book
                    </Link>
                </div>

                {/* Filters */}
                <div className="rounded-xl bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Search
                            </label>

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        fetchDashboard();
                                    }
                                }}
                                placeholder="Booking, transaction..."
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Date From
                            </label>

                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) =>
                                    setDateFrom(e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Date To
                            </label>

                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) =>
                                    setDateTo(e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />
                        </div>

                        <div className="flex items-end gap-2">
                            <button
                                onClick={fetchDashboard}
                                className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
                            >
                                Search
                            </button>

                            <button
                                onClick={clearFilters}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

                    <SummaryCard
                        title="Upcoming"
                        value={dashboard?.summary?.upcoming_bookings || 0}
                    />

                    <SummaryCard
                        title="Today's Bookings"
                        value={dashboard?.summary?.today_bookings || 0}
                    />

                    <SummaryCard
                        title="Available Courts"
                        value={dashboard?.summary?.available_courts || 0}
                    />

                    <SummaryCard
                        title="Notifications"
                        value={
                            dashboard?.summary?.unread_notifications || 0
                        }
                    />

                    <SummaryCard
                        title="Payment Balance"
                        value={formatCurrency(
                            dashboard?.summary?.payment_balance || 0
                        )}
                    />
                </div>

                {/* Today's bookings */}
                <section className="rounded-xl bg-white shadow-sm">
                    <SectionHeader
                        title="Today's Bookings"
                        action={
                            <Link
                                to="/bookings"
                                className="text-sm font-medium text-blue-600"
                            >
                                View All
                            </Link>
                        }
                    />

                    <div className="overflow-x-auto">
                        {filteredTodayBookings.length === 0 ? (
                            <EmptyState message="You have no bookings today." />
                        ) : (
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                                            Reference
                                        </th>

                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                                            Sport
                                        </th>

                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                                            Court
                                        </th>

                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                                            Time
                                        </th>

                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {filteredTodayBookings.map(
                                        (booking) => (
                                            <tr key={booking.id}>
                                                <td className="px-4 py-3 font-medium">
                                                    {booking.booking_reference ||
                                                        `#${booking.id}`}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {booking.sport_category
                                                        ?.name ||
                                                        booking.sportCategory
                                                            ?.name ||
                                                        "-"}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {booking.court?.name ||
                                                        "-"}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {formatTime(
                                                        booking.start_time
                                                    )}
                                                </td>

                                                <td className="px-4 py-3">
                                                    <StatusBadge
                                                        status={
                                                            booking.status
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>

                {/* Upcoming + Membership */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                    {/* Upcoming */}
                    <section className="rounded-xl bg-white shadow-sm">
                        <SectionHeader title="Upcoming Bookings" />

                        <div className="space-y-3 p-4">
                            {dashboard?.upcoming_bookings?.length === 0 ? (
                                <EmptyState message="No upcoming bookings." />
                            ) : (
                                dashboard?.upcoming_bookings?.map(
                                    (booking) => (
                                        <div
                                            key={booking.id}
                                            className="rounded-lg border p-4"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h3 className="font-semibold">
                                                        {booking.court?.name ||
                                                            "Court"}
                                                    </h3>

                                                    <p className="text-sm text-gray-500">
                                                        {booking.sport_category
                                                            ?.name ||
                                                            booking
                                                                .sportCategory
                                                                ?.name ||
                                                            "Sport"}
                                                    </p>
                                                </div>

                                                <StatusBadge
                                                    status={booking.status}
                                                />
                                            </div>

                                            <div className="mt-3 text-sm text-gray-600">
                                                {formatDate(
                                                    booking.booking_date
                                                )}{" "}
                                                •{" "}
                                                {formatTime(
                                                    booking.start_time
                                                )}
                                            </div>
                                        </div>
                                    )
                                )
                            )}
                        </div>
                    </section>

                    {/* Membership */}
                    <section className="rounded-xl bg-white shadow-sm">
                        <SectionHeader title="Membership Information" />

                        <div className="p-6">
                            {membership ? (
                                <div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Membership
                                            </p>

                                            <h3 className="text-xl font-bold">
                                                {membershipType}
                                            </h3>
                                        </div>

                                        <StatusBadge
                                            status={membership.status}
                                        />
                                    </div>

                                    <div className="mt-6 grid grid-cols-2 gap-4">
                                        <InfoItem
                                            label="Start Date"
                                            value={formatDate(
                                                membership.start_date
                                            )}
                                        />

                                        <InfoItem
                                            label="Expiration"
                                            value={formatDate(
                                                membership.expiration_date ||
                                                    membership.end_date
                                            )}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-gray-500">
                                        You do not currently have an active
                                        membership.
                                    </p>

                                    <Link
                                        to="/memberships"
                                        className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white"
                                    >
                                        View Memberships
                                    </Link>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Available Courts */}
                <section className="rounded-xl bg-white shadow-sm">
                    <SectionHeader
                        title="Available Courts"
                        action={
                            <Link
                                to="/courts"
                                className="text-sm font-medium text-blue-600"
                            >
                                View Courts
                            </Link>
                        }
                    />

                    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
                        {dashboard?.available_courts?.length === 0 ? (
                            <div className="col-span-full">
                                <EmptyState message="No courts are currently available." />
                            </div>
                        ) : (
                            dashboard?.available_courts?.map((court) => (
                                <div
                                    key={court.id}
                                    className="rounded-lg border p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">
                                            {court.name}
                                        </h3>

                                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                            Available
                                        </span>
                                    </div>

                                    <p className="mt-2 text-sm text-gray-500">
                                        {court.sport_category?.name ||
                                            court.sportCategory?.name ||
                                            "Court"}
                                    </p>

                                    <Link
                                        to={`/bookings?court_id=${court.id}`}
                                        className="mt-4 block rounded-lg bg-blue-600 px-3 py-2 text-center text-sm text-white"
                                    >
                                        Book Court
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Sports */}
                <section className="rounded-xl bg-white shadow-sm">
                    <SectionHeader title="Sport Categories" />

                    <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-4">
                        {dashboard?.sports?.map((sport) => (
                            <Link
                                key={sport.id}
                                to={`/bookings?sport_category_id=${sport.id}`}
                                className="rounded-lg border p-4 hover:bg-gray-50"
                            >
                                <h3 className="font-semibold">
                                    {sport.name}
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    {sport.courts_count || 0} courts
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Notifications */}
                <section className="rounded-xl bg-white shadow-sm">
                    <SectionHeader title="Notifications" />

                    <div className="divide-y">
                        {dashboard?.notifications?.length === 0 ? (
                            <EmptyState message="No notifications." />
                        ) : (
                            dashboard?.notifications?.map(
                                (notification) => (
                                    <div
                                        key={notification.id}
                                        className="p-4"
                                    >
                                        <div className="flex justify-between gap-4">
                                            <div>
                                                <h3 className="font-medium">
                                                    {notification.title ||
                                                        notification.type ||
                                                        "Notification"}
                                                </h3>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    {notification.message ||
                                                        notification.body ||
                                                        ""}
                                                </p>
                                            </div>

                                            {!notification.read_at && (
                                                <span className="h-2 w-2 rounded-full bg-blue-600" />
                                            )}
                                        </div>
                                    </div>
                                )
                            )
                        )}
                    </div>
                </section>

                {/* Booking History */}
                <section className="rounded-xl bg-white shadow-sm">
                    <SectionHeader
                        title="Booking History"
                        action={
                            <Link
                                to="/bookings"
                                className="text-sm font-medium text-blue-600"
                            >
                                View All
                            </Link>
                        }
                    />

                    <div className="overflow-x-auto">
                        {dashboard?.booking_history?.length === 0 ? (
                            <EmptyState message="No booking history found." />
                        ) : (
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm text-gray-500">
                                            Reference
                                        </th>

                                        <th className="px-4 py-3 text-left text-sm text-gray-500">
                                            Date
                                        </th>

                                        <th className="px-4 py-3 text-left text-sm text-gray-500">
                                            Court
                                        </th>

                                        <th className="px-4 py-3 text-left text-sm text-gray-500">
                                            Sport
                                        </th>

                                        <th className="px-4 py-3 text-left text-sm text-gray-500">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {dashboard?.booking_history?.map(
                                        (booking) => (
                                            <tr key={booking.id}>
                                                <td className="px-4 py-3 font-medium">
                                                    {booking.booking_reference ||
                                                        `#${booking.id}`}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {formatDate(
                                                        booking.booking_date
                                                    )}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {booking.court?.name ||
                                                        "-"}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {booking.sport_category
                                                        ?.name ||
                                                        booking.sportCategory
                                                            ?.name ||
                                                        "-"}
                                                </td>

                                                <td className="px-4 py-3">
                                                    <StatusBadge
                                                        status={
                                                            booking.status
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>

                {/* Transactions */}
                <section className="rounded-xl bg-white shadow-sm">
                    <SectionHeader title="Transaction History" />

                    <div className="overflow-x-auto">
                        {dashboard?.transactions?.length === 0 ? (
                            <EmptyState message="No transactions found." />
                        ) : (
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm text-gray-500">
                                            Reference
                                        </th>

                                        <th className="px-4 py-3 text-left text-sm text-gray-500">
                                            Date
                                        </th>

                                        <th className="px-4 py-3 text-left text-sm text-gray-500">
                                            Amount
                                        </th>

                                        <th className="px-4 py-3 text-left text-sm text-gray-500">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {dashboard?.transactions?.map(
                                        (transaction) => (
                                            <tr key={transaction.id}>
                                                <td className="px-4 py-3 font-medium">
                                                    {transaction.transaction_reference ||
                                                        transaction.payment_reference ||
                                                        `#${transaction.id}`}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {formatDate(
                                                        transaction.created_at
                                                    )}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {formatCurrency(
                                                        transaction.amount
                                                    )}
                                                </td>

                                                <td className="px-4 py-3">
                                                    <StatusBadge
                                                        status={
                                                            transaction.status
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

function SummaryCard({ title, value }) {
    return (
        <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{title}</p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
                {value}
            </p>
        </div>
    );
}

function SectionHeader({ title, action }) {
    return (
        <div className="flex items-center justify-between border-b px-4 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
                {title}
            </h2>

            {action}
        </div>
    );
}

function EmptyState({ message }) {
    return (
        <div className="p-8 text-center text-sm text-gray-500">
            {message}
        </div>
    );
}

function InfoItem({ label, value }) {
    return (
        <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="mt-1 font-medium text-gray-900">{value}</p>
        </div>
    );
}

function StatusBadge({ status }) {
    const normalized = String(status || "unknown").toLowerCase();

    let classes =
        "bg-gray-100 text-gray-700";

    if (
        [
            "confirmed",
            "paid",
            "completed",
            "active",
            "available",
            "success",
            "successful",
        ].includes(normalized)
    ) {
        classes = "bg-green-100 text-green-700";
    }

    if (
        [
            "pending",
            "held",
            "reserved",
            "processing",
        ].includes(normalized)
    ) {
        classes = "bg-yellow-100 text-yellow-700";
    }

    if (
        [
            "cancelled",
            "failed",
            "expired",
            "rejected",
            "no_show",
        ].includes(normalized)
    ) {
        classes = "bg-red-100 text-red-700";
    }

    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${classes}`}
        >
            {String(status || "Unknown").replaceAll("_", " ")}
        </span>
    );
}