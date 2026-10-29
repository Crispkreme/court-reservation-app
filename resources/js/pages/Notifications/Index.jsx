import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/layout/Layout";
import { Bell, CheckCheck, Plus, RefreshCw, Search, Trash2, X, Mail, Clock3, CheckCircle2, AlertCircle, Send, Eye } from "lucide-react";

const API = "/api/v1";

const notificationTypes = [
    ["", "All Types"],
    ["booking_confirmation", "Booking Confirmation"],
    ["booking_reminder", "Booking Reminder"],
    ["booking_cancellation", "Booking Cancellation"],
    ["booking_rescheduling", "Booking Rescheduling"],
    ["payment_success", "Payment Success"],
    ["payment_failure", "Payment Failure"],
    ["refund_processed", "Refund Processed"],
    ["waitlist_availability", "Waitlist Availability"],
    ["waitlist_promotion", "Waitlist Promotion"],
    ["claim_expiration", "Claim Expiration"],
    ["membership_expiration", "Membership Expiration"],
    ["court_closure", "Court Closure"],
    ["operational_closure", "Operational Closure"],
];

const channels = [
    ["", "All Channels"],
    ["in_app", "In-App"],
    ["email", "Email"],
    ["sms", "SMS"],
    ["push", "Push"],
];

const statuses = [
    ["", "All Statuses"],
    ["pending", "Pending"],
    ["queued", "Queued"],
    ["sent", "Sent"],
    ["delivered", "Delivered"],
    ["failed", "Failed"],
    ["read", "Read"],
];

function getToken() {
    return localStorage.getItem("auth_token");
}

function authHeaders() {
    return {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
    };
}

function typeLabel(type) {
    const found = notificationTypes.find(([value]) => value === type);

    if (found) {
        return found[1];
    }

    return type
        ?.replaceAll("_", " ")
        ?.replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusClass(status) {
    switch (status) {
        case "delivered":
        case "sent":
        case "read":
            return "bg-green-100 text-green-700";

        case "failed":
            return "bg-red-100 text-red-700";

        case "pending":
        case "queued":
            return "bg-yellow-100 text-yellow-700";

        default:
            return "bg-slate-100 text-slate-700";
    }
}

function priorityClass(priority) {
    switch (priority) {
        case "urgent":
            return "bg-red-100 text-red-700";

        case "high":
            return "bg-orange-100 text-orange-700";

        case "low":
            return "bg-slate-100 text-slate-600";

        default:
            return "bg-blue-100 text-blue-700";
    }
}

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [summary, setSummary] = useState({
        total: 0,
        unread: 0,
        read: 0,
        pending: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
    });

    const [filters, setFilters] = useState({
        search: "",
        type: "",
        channel: "",
        status: "",
        unread: false,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showCreate, setShowCreate] = useState(false);

    const [form, setForm] = useState({
        user_id: "",
        type: "booking_confirmation",
        title: "",
        message: "",
        channel: "in_app",
        priority: "normal",
        status: "pending",
        scheduled_at: "",
    });

    const fetchNotifications = async () => {
        setLoading(true);
        setError("");

        try {
            const params = new URLSearchParams();

            Object.entries(filters).forEach(([key, value]) => {
                if (value !== "" && value !== false) {
                    params.append(key, value);
                }
            });

            params.append("per_page", "50");

            const response = await fetch(
                `${API}/reservation-notifications?${params.toString()}`,
                {
                    headers: authHeaders(),
                }
            );

            if (!response.ok) {
                throw new Error("Unable to load notifications.");
            }

            const data = await response.json();

            setNotifications(data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const response = await fetch(
                `${API}/reservation-notifications/summary`,
                {
                    headers: authHeaders(),
                }
            );

            if (!response.ok) {
                return;
            }

            const data = await response.json();

            setSummary(data);
        } catch {
            // Summary failure should not prevent the notification page.
        }
    };

    useEffect(() => {
        fetchNotifications();
        fetchSummary();
    }, [
        filters.type,
        filters.channel,
        filters.status,
        filters.unread,
    ]);

    const filteredNotifications = useMemo(() => {
        const search = filters.search.trim().toLowerCase();

        if (!search) {
            return notifications;
        }

        return notifications.filter((notification) => {
            return (
                notification.title?.toLowerCase().includes(search) ||
                notification.message?.toLowerCase().includes(search) ||
                typeLabel(notification.type)
                    ?.toLowerCase()
                    .includes(search)
            );
        });
    }, [notifications, filters.search]);

    const markAsRead = async (id) => {
        try {
            const response = await fetch(
                `${API}/reservation-notifications/${id}/read`,
                {
                    method: "POST",
                    headers: authHeaders(),
                }
            );

            if (!response.ok) {
                throw new Error("Unable to mark notification as read.");
            }

            await fetchNotifications();
            await fetchSummary();
        } catch (err) {
            setError(err.message);
        }
    };

    const markAsUnread = async (id) => {
        try {
            const response = await fetch(
                `${API}/reservation-notifications/${id}/unread`,
                {
                    method: "POST",
                    headers: authHeaders(),
                }
            );

            if (!response.ok) {
                throw new Error("Unable to mark notification as unread.");
            }

            await fetchNotifications();
            await fetchSummary();
        } catch (err) {
            setError(err.message);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetch(
                `${API}/reservation-notifications/mark-all-read`,
                {
                    method: "POST",
                    headers: authHeaders(),
                }
            );

            if (!response.ok) {
                throw new Error("Unable to mark all notifications as read.");
            }

            await fetchNotifications();
            await fetchSummary();
        } catch (err) {
            setError(err.message);
        }
    };

    const deleteNotification = async (id) => {
        if (!window.confirm("Delete this notification?")) {
            return;
        }

        try {
            const response = await fetch(
                `${API}/reservation-notifications/${id}`,
                {
                    method: "DELETE",
                    headers: authHeaders(),
                }
            );

            if (!response.ok) {
                throw new Error("Unable to delete notification.");
            }

            await fetchNotifications();
            await fetchSummary();
        } catch (err) {
            setError(err.message);
        }
    };

    const createNotification = async (event) => {
        event.preventDefault();

        try {
            const payload = {
                ...form,
                user_id: form.user_id || null,
                scheduled_at: form.scheduled_at || null,
            };

            const response = await fetch(
                `${API}/reservation-notifications`,
                {
                    method: "POST",
                    headers: authHeaders(),
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to create notification."
                );
            }

            setShowCreate(false);

            setForm({
                user_id: "",
                type: "booking_confirmation",
                title: "",
                message: "",
                channel: "in_app",
                priority: "normal",
                status: "pending",
                scheduled_at: "",
            });

            await fetchNotifications();
            await fetchSummary();
        } catch (err) {
            setError(err.message);
        }
    };

    const updateForm = (field, value) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    return (
        <Layout>
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><Bell size={22} /></div>
                            <div><h1 className="text-2xl font-bold tracking-tight text-slate-900">Notifications</h1>
                            <p className="mt-1 text-sm text-slate-500">Manage booking, payment, waitlist, membership, and operational notifications.</p></div>
                        </div>

                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => { fetchNotifications(); fetchSummary(); }}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                            Refresh
                        </button>
                        <button
                            type="button"
                            onClick={markAllAsRead}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            <CheckCheck size={16} />
                            Mark All Read
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Summary */}
                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7">
                    <SummaryCard
                        label="Total"
                        value={summary.total}
                    />

                    <SummaryCard
                        label="Unread"
                        value={summary.unread}
                    />

                    <SummaryCard
                        label="Read"
                        value={summary.read}
                    />

                    <SummaryCard
                        label="Pending"
                        value={summary.pending}
                    />

                    <SummaryCard
                        label="Sent"
                        value={summary.sent}
                    />

                    <SummaryCard
                        label="Delivered"
                        value={summary.delivered}
                    />

                    <SummaryCard
                        label="Failed"
                        value={summary.failed}
                    />
                </div>

                {/* Filters */}
                <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
                        <div className="relative">
                        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search notifications..."
                            value={filters.search}
                            onChange={(event) =>
                                setFilters((previous) => ({
                                    ...previous,
                                    search: event.target.value,
                                }))
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                        </div>

                        <select
                            value={filters.type}
                            onChange={(event) =>
                                setFilters((previous) => ({
                                    ...previous,
                                    type: event.target.value,
                                }))
                            }
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            {notificationTypes.map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filters.channel}
                            onChange={(event) =>
                                setFilters((previous) => ({
                                    ...previous,
                                    channel: event.target.value,
                                }))
                            }
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            {channels.map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filters.status}
                            onChange={(event) =>
                                setFilters((previous) => ({
                                    ...previous,
                                    status: event.target.value,
                                }))
                            }
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            {statuses.map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>

                        <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                            <input
                                type="checkbox"
                                checked={filters.unread}
                                onChange={(event) =>
                                    setFilters((previous) => ({
                                        ...previous,
                                        unread: event.target.checked,
                                    }))
                                }
                            />

                            Unread only
                        </label>
                    </div>
                </div>

                {/* Notifications */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    {loading ? (
                        <div className="p-10 text-center text-slate-500">
                            Loading notifications...
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="p-10 text-center text-slate-500">
                            No notifications found.
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-5 transition hover:bg-slate-50 sm:p-6 ${
                                        !notification.read_at
                                            ? "bg-blue-50/40"
                                            : ""
                                    }`}
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="flex gap-4">
                                            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${!notification.read_at ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                                                <Bell size={19} />
                                            </div>

                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="font-semibold text-slate-900">
                                                        {notification.title}
                                                    </h3>

                                                    {!notification.read_at && (
                                                        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                                            New
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="mt-1 text-sm text-slate-600">
                                                    {notification.message}
                                                </p>

                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                                                        {typeLabel(
                                                            notification.type
                                                        )}
                                                    </span>

                                                    <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
                                                        {notification.channel}
                                                    </span>

                                                    <span
                                                        className={`rounded-full px-2 py-1 text-xs ${statusClass(
                                                            notification.status
                                                        )}`}
                                                    >
                                                        {notification.status}
                                                    </span>

                                                    <span
                                                        className={`rounded-full px-2 py-1 text-xs ${priorityClass(
                                                            notification.priority
                                                        )}`}
                                                    >
                                                        {notification.priority}
                                                    </span>
                                                </div>

                                                <div className="mt-2 text-xs text-slate-400">
                                                    {notification.created_at
                                                        ? new Date(
                                                              notification.created_at
                                                          ).toLocaleString()
                                                        : ""}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 gap-2">
                                            {notification.read_at ? (
                                                <button
                                                    onClick={() =>
                                                        markAsUnread(
                                                            notification.id
                                                        )
                                                    }
                                                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                                >
                                                    Mark Unread
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        markAsRead(
                                                            notification.id
                                                        )
                                                    }
                                                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs font-medium text-blue-700 hover:bg-blue-50"
                                                >
                                                    Mark Read
                                                </button>
                                            )}

                                            <button
                                                onClick={() =>
                                                    deleteNotification(
                                                        notification.id
                                                    )
                                                }
                                                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 p-5">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Create Notification
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Create an in-app, email, SMS, or push
                                    notification.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowCreate(false)}
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            onSubmit={createNotification}
                            className="max-h-[75vh] space-y-4 overflow-y-auto p-5"
                        >
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                    User ID
                                </label>

                                <input
                                    type="number"
                                    value={form.user_id}
                                    onChange={(event) =>
                                        updateForm(
                                            "user_id",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Optional"
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                        Notification Type
                                    </label>

                                    <select
                                        value={form.type}
                                        onChange={(event) =>
                                            updateForm(
                                                "type",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        {notificationTypes
                                            .filter(([value]) => value)
                                            .map(([value, label]) => (
                                                <option
                                                    key={value}
                                                    value={value}
                                                >
                                                    {label}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                        Channel
                                    </label>

                                    <select
                                        value={form.channel}
                                        onChange={(event) =>
                                            updateForm(
                                                "channel",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        {channels
                                            .filter(([value]) => value)
                                            .map(([value, label]) => (
                                                <option
                                                    key={value}
                                                    value={value}
                                                >
                                                    {label}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                    Title
                                </label>

                                <input
                                    type="text"
                                    required
                                    value={form.title}
                                    onChange={(event) =>
                                        updateForm(
                                            "title",
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                    Message
                                </label>

                                <textarea
                                    required
                                    rows="4"
                                    value={form.message}
                                    onChange={(event) =>
                                        updateForm(
                                            "message",
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                        Priority
                                    </label>

                                    <select
                                        value={form.priority}
                                        onChange={(event) =>
                                            updateForm(
                                                "priority",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="low">Low</option>
                                        <option value="normal">Normal</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                        Status
                                    </label>

                                    <select
                                        value={form.status}
                                        onChange={(event) =>
                                            updateForm(
                                                "status",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="pending">
                                            Pending
                                        </option>
                                        <option value="queued">Queued</option>
                                        <option value="sent">Sent</option>
                                        <option value="delivered">
                                            Delivered
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                        Scheduled At
                                    </label>

                                    <input
                                        type="datetime-local"
                                        value={form.scheduled_at}
                                        onChange={(event) =>
                                            updateForm(
                                                "scheduled_at",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreate(false)}
                                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Create Notification
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
        </Layout>
    );
}

function SummaryCard({ label, value }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
            </div>
            <div className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
                {value ?? 0}
            </div>
        </div>
    );
}