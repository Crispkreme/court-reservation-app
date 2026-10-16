import React, { useEffect, useMemo, useState } from "react";

const API = "/api/v1";

const FAILURE_TYPES = [
    {
        value: "",
        label: "All Failure Types",
    },
    {
        value: "booking",
        label: "Failed Booking",
    },
    {
        value: "payment",
        label: "Failed Payment",
    },
    {
        value: "payment_gateway_timeout",
        label: "Gateway Timeout",
    },
    {
        value: "refund",
        label: "Refund Failure",
    },
    {
        value: "notification",
        label: "Notification Failure",
    },
    {
        value: "waitlist_assignment",
        label: "Waitlist Assignment",
    },
];

const STATUSES = [
    {
        value: "",
        label: "All Statuses",
    },
    {
        value: "open",
        label: "Open",
    },
    {
        value: "retrying",
        label: "Retrying",
    },
    {
        value: "failed",
        label: "Failed",
    },
    {
        value: "resolved",
        label: "Resolved",
    },
    {
        value: "ignored",
        label: "Ignored",
    },
];

function getToken() {
    return localStorage.getItem("auth_token");
}

async function apiRequest(url, options = {}) {
    const response = await fetch(`${API}${url}`, {
        ...options,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
            ...(options.headers || {}),
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.message ||
                data.error ||
                "An error occurred while processing the request."
        );
    }

    return data;
}

function formatType(type) {
    const item = FAILURE_TYPES.find((item) => item.value === type);

    if (item) {
        return item.label;
    }

    return type
        ?.replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
    if (!value) {
        return "-";
    }

    return new Date(value).toLocaleString();
}

function statusClass(status) {
    switch (status) {
        case "open":
            return "bg-red-100 text-red-700";

        case "retrying":
            return "bg-yellow-100 text-yellow-700";

        case "failed":
            return "bg-orange-100 text-orange-700";

        case "resolved":
            return "bg-green-100 text-green-700";

        case "ignored":
            return "bg-gray-100 text-gray-700";

        default:
            return "bg-gray-100 text-gray-700";
    }
}

function typeClass(type) {
    switch (type) {
        case "booking":
            return "bg-red-50 text-red-700";

        case "payment":
            return "bg-orange-50 text-orange-700";

        case "payment_gateway_timeout":
            return "bg-yellow-50 text-yellow-700";

        case "refund":
            return "bg-purple-50 text-purple-700";

        case "notification":
            return "bg-blue-50 text-blue-700";

        case "waitlist_assignment":
            return "bg-indigo-50 text-indigo-700";

        default:
            return "bg-gray-50 text-gray-700";
    }
}

export default function FailureExceptionsIndex() {
    const [failures, setFailures] = useState([]);
    const [summary, setSummary] = useState(null);

    const [loading, setLoading] = useState(true);
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [error, setError] = useState("");

    const [filters, setFilters] = useState({
        search: "",
        failure_type: "",
        status: "",
        is_recoverable: "",
        date_from: "",
        date_to: "",
    });

    const [selectedFailure, setSelectedFailure] = useState(null);

    const [resolutionNotes, setResolutionNotes] = useState("");

    const [actionLoading, setActionLoading] = useState(false);

    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
    });

    const queryString = useMemo(() => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== "" && value !== null && value !== undefined) {
                params.append(key, value);
            }
        });

        params.append("per_page", "20");

        return params.toString();
    }, [filters]);

    async function loadSummary() {
        try {
            setSummaryLoading(true);

            const query = new URLSearchParams();

            if (filters.date_from) {
                query.append("date_from", filters.date_from);
            }

            if (filters.date_to) {
                query.append("date_to", filters.date_to);
            }

            const data = await apiRequest(
                `/failure-exceptions/summary?${query.toString()}`
            );

            setSummary(data);
        } catch (err) {
            console.error(err);
        } finally {
            setSummaryLoading(false);
        }
    }

    async function loadFailures(page = 1) {
        try {
            setLoading(true);
            setError("");

            const separator = queryString ? "&" : "";

            const data = await apiRequest(
                `/failure-exceptions?${queryString}${separator}page=${page}`
            );

            setFailures(data.data || []);

            setPagination({
                current_page: data.current_page || 1,
                last_page: data.last_page || 1,
                total: data.total || 0,
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadFailures(1);
    }, [queryString]);

    useEffect(() => {
        loadSummary();
    }, [filters.date_from, filters.date_to]);

    function updateFilter(name, value) {
        setFilters((current) => ({
            ...current,
            [name]: value,
        }));
    }

    function resetFilters() {
        setFilters({
            search: "",
            failure_type: "",
            status: "",
            is_recoverable: "",
            date_from: "",
            date_to: "",
        });
    }

    async function retryFailure(failure) {
        if (
            !window.confirm(
                `Retry failure #${failure.id}?`
            )
        ) {
            return;
        }

        try {
            setActionLoading(true);

            await apiRequest(
                `/failure-exceptions/${failure.id}/retry`,
                {
                    method: "POST",
                }
            );

            await loadFailures(pagination.current_page);
            await loadSummary();

            if (selectedFailure?.id === failure.id) {
                const refreshed = await apiRequest(
                    `/failure-exceptions/${failure.id}`
                );

                setSelectedFailure(refreshed);
            }
        } catch (err) {
            alert(err.message);
        } finally {
            setActionLoading(false);
        }
    }

    async function resolveFailure() {
        if (!selectedFailure) {
            return;
        }

        if (!resolutionNotes.trim()) {
            alert("Please enter resolution notes.");
            return;
        }

        try {
            setActionLoading(true);

            await apiRequest(
                `/failure-exceptions/${selectedFailure.id}/resolve`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        resolution_notes: resolutionNotes,
                    }),
                }
            );

            setResolutionNotes("");

            await loadFailures(pagination.current_page);
            await loadSummary();

            const refreshed = await apiRequest(
                `/failure-exceptions/${selectedFailure.id}`
            );

            setSelectedFailure(refreshed);
        } catch (err) {
            alert(err.message);
        } finally {
            setActionLoading(false);
        }
    }

    async function ignoreFailure() {
        if (!selectedFailure) {
            return;
        }

        if (!resolutionNotes.trim()) {
            alert("Please enter a reason.");
            return;
        }

        try {
            setActionLoading(true);

            await apiRequest(
                `/failure-exceptions/${selectedFailure.id}/ignore`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        resolution_notes: resolutionNotes,
                    }),
                }
            );

            setResolutionNotes("");

            await loadFailures(pagination.current_page);
            await loadSummary();

            const refreshed = await apiRequest(
                `/failure-exceptions/${selectedFailure.id}`
            );

            setSelectedFailure(refreshed);
        } catch (err) {
            alert(err.message);
        } finally {
            setActionLoading(false);
        }
    }

    async function reopenFailure() {
        if (!selectedFailure) {
            return;
        }

        try {
            setActionLoading(true);

            await apiRequest(
                `/failure-exceptions/${selectedFailure.id}/reopen`,
                {
                    method: "POST",
                }
            );

            await loadFailures(pagination.current_page);
            await loadSummary();

            const refreshed = await apiRequest(
                `/failure-exceptions/${selectedFailure.id}`
            );

            setSelectedFailure(refreshed);
        } catch (err) {
            alert(err.message);
        } finally {
            setActionLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Failure & Exception Monitoring
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Monitor failed bookings, payments,
                                refunds, notifications, gateway
                                timeouts, and waitlist assignments.
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                loadFailures(
                                    pagination.current_page
                                );
                                loadSummary();
                            }}
                            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Summary */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <SummaryCard
                        title="Total Failures"
                        value={summary?.total ?? 0}
                        loading={summaryLoading}
                    />

                    <SummaryCard
                        title="Open"
                        value={summary?.open ?? 0}
                        loading={summaryLoading}
                    />

                    <SummaryCard
                        title="Recoverable"
                        value={summary?.recoverable ?? 0}
                        loading={summaryLoading}
                    />

                    <SummaryCard
                        title="Resolved"
                        value={summary?.resolved ?? 0}
                        loading={summaryLoading}
                    />
                </div>

                {/* Failure Categories */}
                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                    <MiniSummary
                        label="Bookings"
                        value={summary?.failed_bookings ?? 0}
                    />

                    <MiniSummary
                        label="Payments"
                        value={summary?.failed_payments ?? 0}
                    />

                    <MiniSummary
                        label="Gateway Timeouts"
                        value={summary?.gateway_timeouts ?? 0}
                    />

                    <MiniSummary
                        label="Refunds"
                        value={summary?.refund_failures ?? 0}
                    />

                    <MiniSummary
                        label="Notifications"
                        value={
                            summary?.notification_failures ?? 0
                        }
                    />

                    <MiniSummary
                        label="Waitlist"
                        value={summary?.waitlist_failures ?? 0}
                    />
                </div>

                {/* Filters */}
                <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900">
                            Filters
                        </h2>

                        <button
                            onClick={resetFilters}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Clear Filters
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Input
                            label="Search"
                            value={filters.search}
                            onChange={(value) =>
                                updateFilter(
                                    "search",
                                    value
                                )
                            }
                            placeholder="Reason, reference, booking..."
                        />

                        <Select
                            label="Failure Type"
                            value={filters.failure_type}
                            options={FAILURE_TYPES}
                            onChange={(value) =>
                                updateFilter(
                                    "failure_type",
                                    value
                                )
                            }
                        />

                        <Select
                            label="Status"
                            value={filters.status}
                            options={STATUSES}
                            onChange={(value) =>
                                updateFilter(
                                    "status",
                                    value
                                )
                            }
                        />

                        <Select
                            label="Recoverability"
                            value={filters.is_recoverable}
                            options={[
                                {
                                    value: "",
                                    label: "All",
                                },
                                {
                                    value: "1",
                                    label: "Recoverable",
                                },
                                {
                                    value: "0",
                                    label: "Not Recoverable",
                                },
                            ]}
                            onChange={(value) =>
                                updateFilter(
                                    "is_recoverable",
                                    value
                                )
                            }
                        />

                        <Input
                            label="Date From"
                            type="date"
                            value={filters.date_from}
                            onChange={(value) =>
                                updateFilter(
                                    "date_from",
                                    value
                                )
                            }
                        />

                        <Input
                            label="Date To"
                            type="date"
                            value={filters.date_to}
                            onChange={(value) =>
                                updateFilter(
                                    "date_to",
                                    value
                                )
                            }
                        />
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
                    <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                        <div>
                            <h2 className="font-semibold text-gray-900">
                                Failure Records
                            </h2>

                            <p className="text-sm text-gray-500">
                                {pagination.total} records
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-10 text-center text-gray-500">
                            Loading failure records...
                        </div>
                    ) : failures.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">
                            No failure records found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <Th>ID</Th>
                                        <Th>Type</Th>
                                        <Th>Stage</Th>
                                        <Th>Booking</Th>
                                        <Th>Member</Th>
                                        <Th>Court</Th>
                                        <Th>Reason</Th>
                                        <Th>Failed At</Th>
                                        <Th>Status</Th>
                                        <Th>Actions</Th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                    {failures.map((failure) => (
                                        <tr
                                            key={failure.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <Td>
                                                #{failure.id}
                                            </Td>

                                            <Td>
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${typeClass(
                                                        failure.failure_type
                                                    )}`}
                                                >
                                                    {formatType(
                                                        failure.failure_type
                                                    )}
                                                </span>
                                            </Td>

                                            <Td>
                                                {failure.failure_stage ||
                                                    "-"}
                                            </Td>

                                            <Td>
                                                {failure.booking
                                                    ?.booking_reference ||
                                                    failure.booking_id ||
                                                    "-"}
                                            </Td>

                                            <Td>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {failure.user
                                                            ?.name ||
                                                            "-"}
                                                    </div>

                                                    <div className="text-xs text-gray-500">
                                                        {failure.user
                                                            ?.email ||
                                                            ""}
                                                    </div>
                                                </div>
                                            </Td>

                                            <Td>
                                                {failure.court
                                                    ?.name ||
                                                    "-"}
                                            </Td>

                                            <Td>
                                                <div className="max-w-xs truncate">
                                                    {
                                                        failure.reason
                                                    }
                                                </div>
                                            </Td>

                                            <Td>
                                                {formatDate(
                                                    failure.failed_at
                                                )}
                                            </Td>

                                            <Td>
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass(
                                                        failure.status
                                                    )}`}
                                                >
                                                    {failure.status}
                                                </span>
                                            </Td>

                                            <Td>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() =>
                                                            setSelectedFailure(
                                                                failure
                                                            )
                                                        }
                                                        className="rounded-md border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
                                                    >
                                                        View
                                                    </button>

                                                    {failure.is_recoverable &&
                                                        [
                                                            "open",
                                                            "failed",
                                                        ].includes(
                                                            failure.status
                                                        ) &&
                                                        failure.retry_count <
                                                            failure.max_retries && (
                                                            <button
                                                                disabled={
                                                                    actionLoading
                                                                }
                                                                onClick={() =>
                                                                    retryFailure(
                                                                        failure
                                                                    )
                                                                }
                                                                className="rounded-md bg-yellow-500 px-3 py-1 text-xs text-white hover:bg-yellow-600 disabled:opacity-50"
                                                            >
                                                                Retry
                                                            </button>
                                                        )}
                                                </div>
                                            </Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading &&
                        pagination.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4">
                                <button
                                    disabled={
                                        pagination.current_page <=
                                        1
                                    }
                                    onClick={() =>
                                        loadFailures(
                                            pagination.current_page -
                                                1
                                        )
                                    }
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50"
                                >
                                    Previous
                                </button>

                                <span className="text-sm text-gray-600">
                                    Page{" "}
                                    {
                                        pagination.current_page
                                    }{" "}
                                    of{" "}
                                    {pagination.last_page}
                                </span>

                                <button
                                    disabled={
                                        pagination.current_page >=
                                        pagination.last_page
                                    }
                                    onClick={() =>
                                        loadFailures(
                                            pagination.current_page +
                                                1
                                        )
                                    }
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedFailure && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Failure #{selectedFailure.id}
                                </h2>

                                <p className="text-sm text-gray-500">
                                    {formatType(
                                        selectedFailure.failure_type
                                    )}
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setSelectedFailure(null)
                                }
                                className="text-2xl text-gray-400 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-6 p-6">
                            {/* Basic information */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Detail
                                    label="Failure Type"
                                    value={formatType(
                                        selectedFailure.failure_type
                                    )}
                                />

                                <Detail
                                    label="Failure Stage"
                                    value={
                                        selectedFailure.failure_stage ||
                                        "-"
                                    }
                                />

                                <Detail
                                    label="Status"
                                    value={
                                        selectedFailure.status
                                    }
                                />

                                <Detail
                                    label="Recoverable"
                                    value={
                                        selectedFailure.is_recoverable
                                            ? "Yes"
                                            : "No"
                                    }
                                />

                                <Detail
                                    label="Booking"
                                    value={
                                        selectedFailure.booking
                                            ?.booking_reference ||
                                        selectedFailure.booking_id ||
                                        "-"
                                    }
                                />

                                <Detail
                                    label="Member"
                                    value={
                                        selectedFailure.user
                                            ?.name ||
                                        "-"
                                    }
                                />

                                <Detail
                                    label="Court"
                                    value={
                                        selectedFailure.court
                                            ?.name ||
                                        "-"
                                    }
                                />

                                <Detail
                                    label="Reference"
                                    value={
                                        selectedFailure.reference ||
                                        "-"
                                    }
                                />

                                <Detail
                                    label="Error Code"
                                    value={
                                        selectedFailure.error_code ||
                                        "-"
                                    }
                                />

                                <Detail
                                    label="Gateway"
                                    value={
                                        selectedFailure.gateway ||
                                        "-"
                                    }
                                />

                                <Detail
                                    label="Gateway Reference"
                                    value={
                                        selectedFailure.gateway_reference ||
                                        "-"
                                    }
                                />

                                <Detail
                                    label="Retry Count"
                                    value={`${selectedFailure.retry_count} / ${selectedFailure.max_retries}`}
                                />

                                <Detail
                                    label="Failed At"
                                    value={formatDate(
                                        selectedFailure.failed_at
                                    )}
                                />
                            </div>

                            {/* Reason */}
                            <div>
                                <h3 className="mb-2 font-semibold text-gray-900">
                                    Failure Reason
                                </h3>

                                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                                    {
                                        selectedFailure.reason
                                    }
                                </div>
                            </div>

                            {/* Technical details */}
                            {selectedFailure.technical_details && (
                                <div>
                                    <h3 className="mb-2 font-semibold text-gray-900">
                                        Technical Details
                                    </h3>

                                    <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
                                        {
                                            selectedFailure.technical_details
                                        }
                                    </pre>
                                </div>
                            )}

                            {/* Resolution */}
                            {selectedFailure.resolution_notes && (
                                <div>
                                    <h3 className="mb-2 font-semibold text-gray-900">
                                        Resolution
                                    </h3>

                                    <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
                                        {
                                            selectedFailure.resolution_notes
                                        }
                                    </div>
                                </div>
                            )}

                            {/* Resolution controls */}
                            {!["resolved", "ignored"].includes(
                                selectedFailure.status
                            ) && (
                                <div className="border-t border-gray-200 pt-5">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Resolution Notes
                                    </label>

                                    <textarea
                                        rows={4}
                                        value={resolutionNotes}
                                        onChange={(event) =>
                                            setResolutionNotes(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Describe the resolution or action taken..."
                                        className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {selectedFailure.is_recoverable &&
                                            selectedFailure.retry_count <
                                                selectedFailure.max_retries &&
                                            ["open", "failed"].includes(
                                                selectedFailure.status
                                            ) && (
                                                <button
                                                    disabled={
                                                        actionLoading
                                                    }
                                                    onClick={() =>
                                                        retryFailure(
                                                            selectedFailure
                                                        )
                                                    }
                                                    className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 disabled:opacity-50"
                                                >
                                                    Retry
                                                </button>
                                            )}

                                        <button
                                            disabled={actionLoading}
                                            onClick={
                                                resolveFailure
                                            }
                                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                        >
                                            Mark Resolved
                                        </button>

                                        <button
                                            disabled={actionLoading}
                                            onClick={ignoreFailure}
                                            className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                                        >
                                            Ignore
                                        </button>
                                    </div>
                                </div>
                            )}

                            {["resolved", "ignored"].includes(
                                selectedFailure.status
                            ) && (
                                <button
                                    disabled={actionLoading}
                                    onClick={reopenFailure}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Reopen Failure
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SummaryCard({ title, value, loading }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{title}</p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? "..." : value}
            </p>
        </div>
    );
}

function MiniSummary({ label, value }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">{label}</p>

            <p className="mt-1 text-xl font-bold text-gray-900">
                {value}
            </p>
        </div>
    );
}

function Input({
    label,
    value,
    onChange,
    type = "text",
    placeholder = "",
}) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
                {label}
            </label>

            <input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
        </div>
    );
}

function Select({
    label,
    value,
    options,
    onChange,
}) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
                {label}
            </label>

            <select
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

function Th({ children }) {
    return (
        <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
            {children}
        </th>
    );
}

function Td({ children }) {
    return (
        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
            {children}
        </td>
    );
}

function Detail({ label, value }) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {label}
            </p>

            <p className="mt-1 text-sm text-gray-900">
                {value}
            </p>
        </div>
    );
}