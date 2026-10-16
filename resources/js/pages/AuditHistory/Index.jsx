import React, {
    useEffect,
    useState,
} from "react";

const API = "/api/v1";

const MODULES = [
    "booking",
    "cancellation",
    "rescheduling",
    "payment",
    "refund",
    "administration",
    "court_schedule",
    "court_blocking",
    "membership",
    "waitlist",
    "failure_exception",
];

const ACTIONS = [
    "created",
    "updated",
    "deleted",
    "cancelled",
    "rescheduled",
    "paid",
    "payment_failed",
    "refunded",
    "refund_failed",
    "blocked",
    "unblocked",
    "promoted",
    "expired",
    "approved",
    "rejected",
];

function authHeaders() {
    return {
        Accept: "application/json",
        Authorization:
            `Bearer ${localStorage.getItem(
                "auth_token"
            )}`,
    };
}

function titleCase(value) {
    return String(value)
        .replaceAll("_", " ")
        .replace(
            /\b\w/g,
            (character) =>
                character.toUpperCase()
        );
}

function formatDate(value) {
    if (!value) {
        return "-";
    }

    return new Date(value).toLocaleString();
}

function formatValues(values) {
    if (!values) {
        return "-";
    }

    return JSON.stringify(
        values,
        null,
        2
    );
}

export default function AuditHistoryIndex() {
    const [logs, setLogs] =
        useState([]);

    const [summary, setSummary] =
        useState({});

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [module, setModule] =
        useState("");

    const [action, setAction] =
        useState("");

    const [dateFrom, setDateFrom] =
        useState("");

    const [dateTo, setDateTo] =
        useState("");

    const [page, setPage] =
        useState(1);

    const [lastPage, setLastPage] =
        useState(1);

    const [selectedLog, setSelectedLog] =
        useState(null);

    async function loadLogs(
        requestedPage = page
    ) {
        try {
            setLoading(true);
            setError("");

            const params =
                new URLSearchParams();

            params.set(
                "page",
                requestedPage
            );

            params.set(
                "per_page",
                "25"
            );

            if (module) {
                params.set(
                    "module",
                    module
                );
            }

            if (action) {
                params.set(
                    "action",
                    action
                );
            }

            if (dateFrom) {
                params.set(
                    "date_from",
                    dateFrom
                );
            }

            if (dateTo) {
                params.set(
                    "date_to",
                    dateTo
                );
            }

            const response =
                await fetch(
                    `${API}/audit-logs?${params.toString()}`,
                    {
                        headers:
                            authHeaders(),
                    }
                );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Failed to load audit history."
                );
            }

            setLogs(
                result.data || []
            );

            setPage(
                result.current_page || 1
            );

            setLastPage(
                result.last_page || 1
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function loadSummary() {
        try {
            const params =
                new URLSearchParams();

            if (dateFrom) {
                params.set(
                    "date_from",
                    dateFrom
                );
            }

            if (dateTo) {
                params.set(
                    "date_to",
                    dateTo
                );
            }

            const response =
                await fetch(
                    `${API}/audit-logs/summary?${params.toString()}`,
                    {
                        headers:
                            authHeaders(),
                    }
                );

            const result =
                await response.json();

            if (response.ok) {
                setSummary(result);
            }
        } catch {
            // Summary failure should not
            // prevent audit records from loading.
        }
    }

    async function loadAll() {
        await Promise.all([
            loadLogs(1),
            loadSummary(),
        ]);
    }

    useEffect(() => {
        loadAll();
    }, []);

    function applyFilters() {
        loadAll();
    }

    function clearFilters() {
        setModule("");
        setAction("");
        setDateFrom("");
        setDateTo("");

        setTimeout(() => {
            loadLogs(1);
            loadSummary();
        }, 0);
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl">

                {/* Header */}

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Audit & History
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Track booking, payment,
                        membership, court, and
                        administrative changes.
                    </p>
                </div>

                {/* Summary */}

                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">

                    <SummaryCard
                        label="Total"
                        value={summary.total}
                    />

                    <SummaryCard
                        label="Created"
                        value={summary.created}
                    />

                    <SummaryCard
                        label="Updated"
                        value={summary.updated}
                    />

                    <SummaryCard
                        label="Cancelled"
                        value={summary.cancelled}
                    />

                    <SummaryCard
                        label="Rescheduled"
                        value={summary.rescheduled}
                    />

                    <SummaryCard
                        label="Refunded"
                        value={summary.refunded}
                    />

                    <SummaryCard
                        label="Blocked"
                        value={summary.blocked}
                    />

                    <SummaryCard
                        label="Deleted"
                        value={summary.deleted}
                    />

                </div>

                {/* Filters */}

                <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Module
                            </label>

                            <select
                                value={module}
                                onChange={(event) =>
                                    setModule(
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            >
                                <option value="">
                                    All Modules
                                </option>

                                {MODULES.map(
                                    (item) => (
                                        <option
                                            key={item}
                                            value={item}
                                        >
                                            {titleCase(
                                                item
                                            )}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Action
                            </label>

                            <select
                                value={action}
                                onChange={(event) =>
                                    setAction(
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            >
                                <option value="">
                                    All Actions
                                </option>

                                {ACTIONS.map(
                                    (item) => (
                                        <option
                                            key={item}
                                            value={item}
                                        >
                                            {titleCase(
                                                item
                                            )}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Date From
                            </label>

                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(event) =>
                                    setDateFrom(
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Date To
                            </label>

                            <input
                                type="date"
                                value={dateTo}
                                onChange={(event) =>
                                    setDateTo(
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>

                    </div>

                    <div className="mt-4 flex gap-3">

                        <button
                            onClick={
                                applyFilters
                            }
                            className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
                        >
                            Apply Filters
                        </button>

                        <button
                            onClick={
                                clearFilters
                            }
                            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Clear
                        </button>

                    </div>

                </div>

                {/* Error */}

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Table */}

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                    {loading ? (
                        <div className="p-10 text-center text-gray-500">
                            Loading audit history...
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">
                            No audit records found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">

                            <table className="min-w-full divide-y divide-gray-200">

                                <thead className="bg-gray-50">
                                    <tr>

                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Date / Time
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            User
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Module
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Action
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Description
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Record
                                        </th>

                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Details
                                        </th>

                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">

                                    {logs.map(
                                        (log) => (
                                            <tr
                                                key={
                                                    log.id
                                                }
                                                className="hover:bg-gray-50"
                                            >

                                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                                                    {formatDate(
                                                        log.created_at
                                                    )}
                                                </td>

                                                <td className="px-4 py-3">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {log.user
                                                            ?.name ||
                                                            "System"}
                                                    </div>

                                                    <div className="text-xs text-gray-500">
                                                        {log.user
                                                            ?.email ||
                                                            "-"}
                                                    </div>
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                                                    {titleCase(
                                                        log.module
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-3">
                                                    <ActionBadge
                                                        action={
                                                            log.action
                                                        }
                                                    />
                                                </td>

                                                <td className="max-w-md px-4 py-3 text-sm text-gray-700">
                                                    {log.description ||
                                                        "-"}
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                                    {log.auditable_type
                                                        ? `${log.auditable_type
                                                              .split(
                                                                  "\\"
                                                              )
                                                              .pop()} #${log.auditable_id}`
                                                        : "-"}
                                                </td>

                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() =>
                                                            setSelectedLog(
                                                                log
                                                            )
                                                        }
                                                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                                    >
                                                        View
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

                {/* Pagination */}

                {lastPage > 1 && (
                    <div className="mt-4 flex items-center justify-between">

                        <button
                            disabled={
                                page <= 1
                            }
                            onClick={() =>
                                loadLogs(
                                    page - 1
                                )
                            }
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm disabled:opacity-50"
                        >
                            Previous
                        </button>

                        <span className="text-sm text-gray-600">
                            Page {page} of{" "}
                            {lastPage}
                        </span>

                        <button
                            disabled={
                                page >=
                                lastPage
                            }
                            onClick={() =>
                                loadLogs(
                                    page + 1
                                )
                            }
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm disabled:opacity-50"
                        >
                            Next
                        </button>

                    </div>
                )}

                {/* Details modal */}

                {selectedLog && (
                    <AuditDetailsModal
                        log={selectedLog}
                        onClose={() =>
                            setSelectedLog(
                                null
                            )
                        }
                    />
                )}

            </div>
        </div>
    );
}

function SummaryCard({
    label,
    value,
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-medium text-gray-500">
                {label}
            </div>

            <div className="mt-1 text-xl font-bold text-gray-900">
                {value ?? 0}
            </div>
        </div>
    );
}

function ActionBadge({
    action,
}) {
    return (
        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
            {titleCase(action)}
        </span>
    );
}

function AuditDetailsModal({
    log,
    onClose,
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-xl">

                <div className="flex items-center justify-between border-b border-gray-200 p-5">

                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Audit Details
                        </h2>

                        <p className="text-sm text-gray-500">
                            {formatDate(
                                log.created_at
                            )}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
                    >
                        ✕
                    </button>

                </div>

                <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">

                    <Info
                        label="User"
                        value={
                            log.user?.name ||
                            "System"
                        }
                    />

                    <Info
                        label="Email"
                        value={
                            log.user?.email ||
                            "-"
                        }
                    />

                    <Info
                        label="Module"
                        value={titleCase(
                            log.module
                        )}
                    />

                    <Info
                        label="Action"
                        value={titleCase(
                            log.action
                        )}
                    />

                    <Info
                        label="Record"
                        value={
                            log.auditable_type
                                ? `${log.auditable_type
                                      .split(
                                          "\\"
                                      )
                                      .pop()} #${log.auditable_id}`
                                : "-"
                        }
                    />

                    <Info
                        label="IP Address"
                        value={
                            log.ip_address ||
                            "-"
                        }
                    />

                    <div className="md:col-span-2">
                        <Info
                            label="Description"
                            value={
                                log.description ||
                                "-"
                            }
                        />
                    </div>

                    <div className="md:col-span-2">
                        <Info
                            label="Reason"
                            value={
                                log.reason ||
                                "-"
                            }
                        />
                    </div>

                    <div>
                        <h3 className="mb-2 text-sm font-semibold text-gray-900">
                            Previous Values
                        </h3>

                        <pre className="max-h-80 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-white">
                            {formatValues(
                                log.old_values
                            )}
                        </pre>
                    </div>

                    <div>
                        <h3 className="mb-2 text-sm font-semibold text-gray-900">
                            New Values
                        </h3>

                        <pre className="max-h-80 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-white">
                            {formatValues(
                                log.new_values
                            )}
                        </pre>
                    </div>

                    <div className="md:col-span-2">
                        <Info
                            label="User Agent"
                            value={
                                log.user_agent ||
                                "-"
                            }
                        />
                    </div>

                </div>

            </div>
        </div>
    );
}

function Info({
    label,
    value,
}) {
    return (
        <div>
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {label}
            </div>

            <div className="mt-1 text-sm text-gray-900">
                {value}
            </div>
        </div>
    );
}