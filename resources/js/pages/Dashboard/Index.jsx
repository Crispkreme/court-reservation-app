import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { formatCurrency, formatDate, formatTime } from "@/utils/formatters";
import { useAuth } from "../../context/AuthContext";
import PageState from "../../components/PageState";
import { InfoPanel, SectionHeader, FilterField, EmptyState, StatusBadge, SummaryCard, StatusCard, StatBox } from "@/components";
import { getAdminDashboard } from "../../services/adminService";

export default function Dashboard() {

    const navigate = useNavigate();
    const { user, role, isAdmin, isAuthenticated } = useAuth();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [dateFrom, setDateFrom] = useState(new Date().toISOString().slice(0, 10));
    const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10));

    const [timeFrom, setTimeFrom] = useState("");
    const [timeTo, setTimeTo] = useState("");

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [sportCategoryId, setSportCategoryId] = useState("");
    const [courtId, setCourtId] = useState("");

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login", { replace: true });
        } else if (!isAdmin) {
            navigate("/member-dashboard", { replace: true });
        }
    }, [isAuthenticated, isAdmin, navigate]);

    const fetchDashboard = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await getAdminDashboard();
            console.log("Dashboard response:", response);
            setDashboard(response.data);

        } catch (err) {
            console.error(
                "Admin dashboard error:",
                err.response?.status,
                err.response?.data || err.message
            );

            if (err.response?.status === 401) {
                setError("Please log in again to access the admin dashboard.");
            } else if (err.response?.status === 403) {
                setError("You do not have permission to access this dashboard.");
            } else {
                setError(
                    err.response?.data?.message ||
                    "Unable to load admin dashboard."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && isAdmin) {
            fetchDashboard();
        }
    }, [isAuthenticated, isAdmin]);

    const clearFilters = () => {
        const today = new Date().toISOString().slice(0, 10);

        setDateFrom(today);
        setDateTo(today);
        setTimeFrom("");
        setTimeTo("");
        setSearch("");
        setStatus("");
        setSportCategoryId("");
        setCourtId("");

        setTimeout(() => {
            fetchDashboard();
        }, 0);
    };

    if (loading || error) {
        return (
            <PageState
                title="Dashboard"
                loading={loading}
                error={error}
                loadingMessage="Loading admin dashboard..."
                onRetry={fetchDashboard}
            />
        );
    }

    const summary = dashboard?.summary || {};
    const bookingStatus = dashboard?.booking_status || {};
    const membership = dashboard?.membership_statistics || {};
    const waitlist = dashboard?.waitlist_activity || {};

    return (
        <Layout title="Dashboard">
            <div className="mx-auto w-full max-w-[1800px] space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Welcome, {user?.name || "Administrator"}!
                        </h1>

                        <p className="mt-1 text-slate-500">
                            Court reservation system overview and operational reporting.
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                        <h2 className="font-semibold text-slate-900">
                            Report Filters
                        </h2>

                        <p className="text-sm text-slate-500">
                            Filter dashboard data by date,
                            time, sport, court, status, or
                            search term.
                        </p>
                    </div>
            
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">

                        <FilterField label="Date From">
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full min-w-0 box-border border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </FilterField>

                        <FilterField label="Date To">
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full min-w-0 box-border border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </FilterField>

                        <FilterField label="Time From">
                            <input
                                type="time"
                                value={timeFrom}
                                onChange={(e) => setTimeFrom(e.target.value)}
                                className="w-full min-w-0 box-border border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </FilterField>

                        <FilterField label="Time To">
                            <input
                                type="time"
                                value={timeTo}
                                onChange={(e) => setTimeTo(e.target.value)}
                                className="w-full min-w-0 box-border border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </FilterField>

                        <FilterField label="Status">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full min-w-0 box-border border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">All Statuses</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="pending">Pending</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="completed">Completed</option>
                                <option value="failed">Failed</option>
                            </select>
                        </FilterField>

                        <FilterField label="Sport ID">
                            <input
                                type="number"
                                value={sportCategoryId}
                                onChange={(e) => setSportCategoryId(e.target.value)}
                                placeholder="Sport ID"
                                className="w-full min-w-0 box-border border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </FilterField>

                        <FilterField label="Court ID">
                            <input
                                type="number"
                                value={courtId}
                                onChange={(e) => setCourtId(e.target.value)}
                                placeholder="Court ID"
                                className="w-full min-w-0 box-border border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </FilterField>

                        <FilterField label="Search">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        fetchDashboard();
                                    }
                                }}
                                placeholder="Booking/customer..."
                                className="w-full min-w-0 box-border border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </FilterField>

                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <button onClick={fetchDashboard} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Generate Report
                        </button>

                        <button onClick={clearFilters} className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">

                    <SummaryCard
                        title="Total Bookings"
                        value={ summary.total_bookings || 0 }
                    />

                    <SummaryCard
                        title="Today's Revenue"
                        value={formatCurrency(summary.today_revenue)}
                    />

                    <SummaryCard
                        title="Outstanding"
                        value={formatCurrency(summary.outstanding_payments)}
                    />

                    <SummaryCard
                        title="Failed Transactions"
                        value={summary.failed_transactions || 0}
                    />

                    <SummaryCard
                        title="Available Courts"
                        value={summary.available_courts || 0}
                    />

                    <SummaryCard
                        title="Maintenance"
                        value={summary.maintenance_courts || 0}
                    />
                </div>

                {/* Booking status */}
                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <SectionHeader title="Booking Status" />

                    <div className="grid grid-cols-2 gap-4 p-5 md:grid-cols-5">
                        <StatusCard
                            label="Confirmed"
                            value={ bookingStatus.confirmed || 0 }
                        />
                        <StatusCard
                            label="Pending"
                            value={ bookingStatus.pending || 0 }
                        />
                        <StatusCard
                            label="Cancelled"
                            value={ bookingStatus.cancelled || 0 }
                        />
                        <StatusCard
                            label="Completed"
                            value={ bookingStatus.completed || 0 }
                        />
                        <StatusCard
                            label="Failed"
                            value={ bookingStatus.failed || 0 }
                        />
                    </div>
                </section>

                {/* Daily booking summary + sport summary */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <SectionHeader title="Daily Booking Summary" />

                        <div className="p-5">
                            {dashboard?.daily_bookings?.length === 0 ? (
                                <EmptyState message="No bookings found for this period." />
                            ) : (
                                <div className="space-y-3">
                                    {dashboard?.daily_bookings?.map(
                                        (item) => (
                                            <div
                                                key={item.booking_date}
                                                className="flex items-center justify-between rounded-lg border p-3"
                                            >
                                                <span>
                                                    {formatDate(item.booking_date)}
                                                </span>

                                                <span className="font-bold">
                                                    { item.total }
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <SectionHeader title="Sport Summary" />

                        <div className="p-5">
                            {dashboard?.sport_summary?.length === 0 ? (
                                <EmptyState message="No sport bookings found." />
                            ) : (
                                <div className="space-y-3">
                                    {dashboard?.sport_summary?.map(
                                        (item) => (
                                            <div
                                                key={item.sport_category_id}
                                                className="flex items-center justify-between rounded-lg border p-3"
                                            >
                                                <div>
                                                    <p className="font-medium">
                                                        {item.sport_category?.name || "Unknown Sport"}
                                                    </p>
                                                </div>

                                                <span className="font-bold">
                                                    {item.total_bookings}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Court utilization */}
                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <SectionHeader title="Court Utilization" />

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-sm text-slate-500">
                                        Court
                                    </th>

                                    <th className="px-5 py-3 text-left text-sm text-slate-500">
                                        Sport
                                    </th>

                                    <th className="px-5 py-3 text-left text-sm text-slate-500">
                                        Bookings
                                    </th>

                                    <th className="px-5 py-3 text-left text-sm text-slate-500">
                                        Utilization
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {dashboard?.court_utilization?.map(
                                    (item) => (
                                        <tr key={item.court_id}>
                                            <td className="px-5 py-3 font-medium">
                                                {item.court?.name || "Unknown"}
                                            </td>

                                            <td className="px-5 py-3">
                                                {item.court?.sport_category?.name || item.court?.sportCategory?.name || "-"}
                                            </td>

                                            <td className="px-5 py-3">
                                                {item.total_bookings}
                                            </td>

                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2 flex-1 rounded-full bg-gray-200">
                                                        <div
                                                            className="h-2 rounded-full bg-blue-600"
                                                            style={{
                                                                width: `${Math.min(
                                                                    item.utilization_percentage,
                                                                    100
                                                                )}%`,
                                                            }}
                                                        />
                                                    </div>

                                                    <span className="w-16 text-right text-sm">
                                                        {item.utilization_percentage} %
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Revenue / payments / waitlist */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

                    <InfoPanel title="Revenue">
                        <p className="text-sm text-slate-500">
                            Revenue for selected period
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            {formatCurrency(summary.today_revenue)}
                        </p>
                    </InfoPanel>

                    <InfoPanel title="Outstanding Payments">
                        <p className="text-sm text-slate-500">
                            Pending or unpaid amount
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            {formatCurrency(summary.outstanding_payments)}
                        </p>
                    </InfoPanel>

                    <InfoPanel title="Failed Transactions">
                        <p className="text-sm text-slate-500">
                            Failed transactions
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            {summary.failed_transactions}
                        </p>
                    </InfoPanel>
                </div>

                {/* Waitlist + Membership */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <SectionHeader title="Waitlist Activity" />

                        <div className="grid grid-cols-2 gap-4 p-5">
                            <StatBox
                                label="Total"
                                value={waitlist.total || 0}
                            />

                            <StatBox
                                label="Waiting"
                                value={waitlist.waiting || 0}
                            />

                            <StatBox
                                label="Promoted"
                                value={waitlist.promoted || 0}
                            />

                            <StatBox
                                label="Cancelled"
                                value={waitlist.cancelled || 0}
                            />

                            <StatBox
                                label="Expired"
                                value={waitlist.expired || 0}
                            />
                        </div>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <SectionHeader title="Membership Statistics" />

                            <button
                                type="button"
                                onClick={() => navigate('/memberships')}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Membership
                            </button>
                        </div>
                        

                        <div className="grid grid-cols-2 gap-4 p-5 md:grid-cols-3">
                            <StatBox
                                label="Total"
                                value={membership.total || 0}
                            />

                            <StatBox
                                label="Active"
                                value={membership.active || 0}
                            />

                            <StatBox
                                label="Pending"
                                value={membership.pending || 0}
                            />

                            <StatBox
                                label="Expired"
                                value={membership.expired || 0}
                            />

                            <StatBox
                                label="Suspended"
                                value={membership.suspended || 0}
                            />

                            <StatBox
                                label="Cancelled"
                                value={membership.cancelled || 0}
                            />
                        </div>
                    </section>
                </div>

                {/* Upcoming sessions */}
                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <SectionHeader title="Upcoming Sessions" />

                    <div className="overflow-x-auto">
                        {dashboard?.upcoming_sessions?.length === 0 ? (
                            <EmptyState message="No upcoming sessions." />
                        ) : (
                            <table className="min-w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-sm text-slate-500">
                                            Date
                                        </th>

                                        <th className="px-5 py-3 text-left text-sm text-slate-500">
                                            Time
                                        </th>

                                        <th className="px-5 py-3 text-left text-sm text-slate-500">
                                            Court
                                        </th>

                                        <th className="px-5 py-3 text-left text-sm text-slate-500">
                                            Sport
                                        </th>

                                        <th className="px-5 py-3 text-left text-sm text-slate-500">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {dashboard?.upcoming_sessions?.map(
                                        (session) => (
                                            <tr key={session.id}>
                                                <td className="px-5 py-3">
                                                    {formatDate(session.booking_date)}
                                                </td>

                                                <td className="px-5 py-3">
                                                    {formatTime(session.start_time)}
                                                </td>

                                                <td className="px-5 py-3">
                                                    {session.court?.name || "-"}
                                                </td>

                                                <td className="px-5 py-3">
                                                    {session.sport_category?.name ||session.sportCategory?.name || "-"}
                                                </td>

                                                <td className="px-5 py-3">
                                                    <StatusBadge
                                                        status={session.status}
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
                
                {/* Court Status */}
                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <SectionHeader title="Court Status" />

                    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {dashboard?.court_status?.length > 0 ? (
                            dashboard.court_status.map((court) => (
                                <div
                                    key={court.id}
                                    className="min-w-0 border border-slate-200 bg-white p-4 transition duration-200 hover:border-blue-300 hover:shadow-sm"
                                >
                                    {/* Court Name and Status */}
                                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <h3 className="min-w-0 break-words font-semibold text-slate-800">
                                            {court.name}
                                        </h3>

                                        <div className="shrink-0">
                                            <StatusBadge status={court.status} />
                                        </div>
                                    </div>

                                    {/* Sport Category */}
                                    <div className="mt-4 border-t border-slate-100 pt-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Sport Category
                                        </p>

                                        <p className="mt-1 break-words text-sm font-medium text-slate-700">
                                            {court.sport_category?.name ||
                                                court.sportCategory?.name ||
                                                "-"}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full px-4 py-10 text-center">
                                <p className="text-sm font-medium text-slate-600">
                                    No courts available.
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Court status information will appear here when available.
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </Layout>
    );
}