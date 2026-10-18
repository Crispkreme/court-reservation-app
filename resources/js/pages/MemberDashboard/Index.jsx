import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    formatCurrency,
    formatDate,
    formatTime,
} from "@/utils/formatters";
import {
    InfoPanel,
    SectionHeader,
    EmptyState,
    StatusBadge,
    SummaryCard,
    StatusCard,
    StatBox,
} from "@/components";

const API = "/api/v1";

export default function MemberDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("auth_token");

    const fetchDashboard = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API}/member-dashboard`, {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("dashboard response", response);

            if (!response.ok) {
                throw new Error("Unable to load your member dashboard.");
            }

            const data = await response.json();
            
            setDashboard(data.data ?? data);
        } catch (err) {
            setError(err.message || "Unable to load your dashboard.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-xl bg-white p-8 shadow-sm">
                        Loading member dashboard...
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
                        <h2 className="text-lg font-semibold">
                            Dashboard Error
                        </h2>
                        <p className="mt-2">{error}</p>
                        <button
                            onClick={fetchDashboard}
                            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const summary = dashboard?.summary || {};
    const bookingStatus = dashboard?.booking_status || {};
    const membership = dashboard?.membership || {};
    const waitlist = dashboard?.waitlist_activity || {};

    const upcomingSessions = dashboard?.upcoming_sessions || [];
    const recentBookings = dashboard?.recent_bookings || dashboard?.bookings || [];
    const availableCourts = dashboard?.available_courts || [];

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Member Dashboard
                        </h1>
                        <p className="mt-1 text-gray-500">
                            View your court bookings, payments, membership,
                            and upcoming sessions.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Link
                            to="/bookings"
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium"
                        >
                            My Bookings
                        </Link>
                        <Link
                            to="/courts"
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                        >
                            Browse Courts
                        </Link>
                    </div>
                </div>

                {/* Personal summary */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <SummaryCard
                        title="My Total Bookings"
                        value={summary.total_bookings ?? recentBookings.length}
                    />
                    <SummaryCard
                        title="Total Payments"
                        value={formatCurrency(summary.total_payments ?? 0)}
                    />
                    <SummaryCard
                        title="Unpaid Balance"
                        value={formatCurrency(summary.outstanding_payments ?? 0)}
                    />
                    <SummaryCard
                        title="Failed Transactions"
                        value={summary.failed_transactions ?? 0}
                    />
                    <SummaryCard
                        title="Upcoming Sessions"
                        value={summary.upcoming_sessions ?? upcomingSessions.length}
                    />
                    <SummaryCard
                        title="Available Courts"
                        value={summary.available_courts ?? availableCourts.length}
                    />
                </div>

                {/* My booking status */}
                <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <SectionHeader
                        title="My Booking Status"
                        subtitle="Stay updated on your court reservations."
                    />

                    <div className="grid grid-cols-1 gap-4 bg-slate-50/60 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        <StatusCard
                            label="Confirmed"
                            value={bookingStatus.confirmed ?? 0}
                        />

                        <StatusCard
                            label="Pending"
                            value={bookingStatus.pending ?? 0}
                        />

                        <StatusCard
                            label="Cancelled"
                            value={bookingStatus.cancelled ?? 0}
                        />

                        <StatusCard
                            label="Completed"
                            value={bookingStatus.completed ?? 0}
                        />

                        <StatusCard
                            label="Failed"
                            value={bookingStatus.failed ?? 0}
                        />
                    </div>
                </section>


                {/* Membership and payments */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <InfoPanel title="My Membership">
                        <p className="text-sm text-gray-500">
                            Current membership status
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                            <StatusBadge
                                status={membership.status || "pending"}
                            />
                        </div>
                        {membership.plan_name && (
                            <p className="mt-3 font-semibold text-gray-900">
                                {membership.plan_name}
                            </p>
                        )}
                        {membership.expiry_date && (
                            <p className="mt-1 text-sm text-gray-500">
                                Expires: {formatDate(membership.expiry_date)}
                            </p>
                        )}
                        {!membership.status && (
                            <p className="mt-2 text-sm text-gray-500">
                                Membership details are not available.
                            </p>
                        )}
                    </InfoPanel>

                    <InfoPanel title="Payment Overview">
                        <p className="text-sm text-gray-500">
                            Your outstanding balance
                        </p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">
                            {formatCurrency(summary.outstanding_payments ?? 0)}
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                            Total paid: {formatCurrency(summary.total_payments ?? 0)}
                        </p>
                        <Link
                            to="/payments"
                            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
                        >
                            View payments
                        </Link>
                    </InfoPanel>

                    <InfoPanel title="My Waitlist">
                        <p className="text-sm text-gray-500">
                            Your court waitlist activity
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <StatBox
                                label="Waiting"
                                value={waitlist.waiting ?? 0}
                            />
                            <StatBox
                                label="Promoted"
                                value={waitlist.promoted ?? 0}
                            />
                        </div>
                        <Link
                            to="/waitlist"
                            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
                        >
                            View waitlist
                        </Link>
                    </InfoPanel>
                </div>

                {/* Upcoming sessions */}
                <section className="rounded-xl bg-white shadow-sm">
                    <SectionHeader title="My Upcoming Sessions" />
                    <div className="overflow-x-auto">
                        {upcomingSessions.length === 0 ? (
                            <EmptyState message="You have no upcoming sessions." />
                        ) : (
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-sm text-gray-500">
                                            Date
                                        </th>
                                        <th className="px-5 py-3 text-left text-sm text-gray-500">
                                            Time
                                        </th>
                                        <th className="px-5 py-3 text-left text-sm text-gray-500">
                                            Court
                                        </th>
                                        <th className="px-5 py-3 text-left text-sm text-gray-500">
                                            Sport
                                        </th>
                                        <th className="px-5 py-3 text-left text-sm text-gray-500">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {upcomingSessions.map((session) => (
                                        <tr key={session.id}>
                                            <td className="px-5 py-3">
                                                {session.booking_date
                                                    ? formatDate(session.booking_date)
                                                    : "-"}
                                            </td>
                                            <td className="px-5 py-3">
                                                {session.start_time
                                                    ? formatTime(session.start_time)
                                                    : "-"}
                                            </td>
                                            <td className="px-5 py-3">
                                                {session.court?.name || "-"}
                                            </td>
                                            <td className="px-5 py-3">
                                                {session.sport_category?.name ||
                                                    session.sportCategory?.name ||
                                                    "-"}
                                            </td>
                                            <td className="px-5 py-3">
                                                <StatusBadge status={session.status || "pending"} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>

                {/* Recent bookings */}
                <section className="rounded-xl bg-white shadow-sm">
                    <SectionHeader title="My Recent Bookings" />
                    <div className="overflow-x-auto">
                        {recentBookings.length === 0 ? (
                            <EmptyState message="You have no bookings yet. Browse the available courts to make a reservation." />
                        ) : (
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-sm text-gray-500">
                                            Date
                                        </th>
                                        <th className="px-5 py-3 text-left text-sm text-gray-500">
                                            Court
                                        </th>
                                        <th className="px-5 py-3 text-left text-sm text-gray-500">
                                            Sport
                                        </th>
                                        <th className="px-5 py-3 text-left text-sm text-gray-500">
                                            Amount
                                        </th>
                                        <th className="px-5 py-3 text-left text-sm text-gray-500">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {recentBookings.map((booking) => (
                                        <tr key={booking.id}>
                                            <td className="px-5 py-3">
                                                {booking.booking_date
                                                    ? formatDate(booking.booking_date)
                                                    : "-"}
                                            </td>
                                            <td className="px-5 py-3">
                                                {booking.court?.name || "-"}
                                            </td>
                                            <td className="px-5 py-3">
                                                {booking.sport_category?.name ||
                                                    booking.sportCategory?.name ||
                                                    "-"}
                                            </td>
                                            <td className="px-5 py-3">
                                                {formatCurrency(
                                                    booking.total_amount ??
                                                        booking.amount ??
                                                        0
                                                )}
                                            </td>
                                            <td className="px-5 py-3">
                                                <StatusBadge status={booking.status || "pending"} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>

                {/* Available courts */}          
                <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <SectionHeader
                        title="Available Courts"
                        subtitle="Find a court for your next game."
                    />

                    <div className="bg-slate-50/60 p-5">
                        {availableCourts.length === 0 ? (
                            <EmptyState message="No courts are available right now. Visit the Courts page to check for updates." />
                        ) : (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                {availableCourts.map((court) => (
                                    <div
                                        key={court.id}
                                        className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
                                    >
                                        {/* Court accent */}
                                        <div className="h-1.5 bg-emerald-500" />

                                        <div className="p-5">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-6 w-6"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={1.8}
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M4 6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v11a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 17.5v-11z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M12 4v16M4 12h16"
                                                            />
                                                        </svg>
                                                    </div>

                                                    <div className="min-w-0">
                                                        <h3 className="truncate font-bold text-slate-900">
                                                            {court.name}
                                                        </h3>

                                                        <p className="mt-1 text-sm text-gray-500">
                                                            {court.sport_category?.name ||
                                                                court.sportCategory?.name ||
                                                                "Sport not specified"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <StatusBadge
                                                    status={court.status || "available"}
                                                />
                                            </div>

                                            <div className="mt-5 flex items-end justify-between border-t border-gray-100 pt-4">
                                                <div>
                                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                        Hourly rate
                                                    </p>

                                                    <p className="mt-1 text-xl font-bold text-slate-900">
                                                        {court.hourly_rate != null
                                                            ? formatCurrency(court.hourly_rate)
                                                            : "Not set"}
                                                        {court.hourly_rate != null && (
                                                            <span className="ml-1 text-xs font-normal text-gray-500">
                                                                / hour
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>

                                                <span className="text-sm font-semibold text-emerald-600 transition group-hover:text-emerald-700">
                                                    Court #{court.id}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <div className="flex justify-end">
                    <button
                        onClick={fetchDashboard}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Refresh Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
