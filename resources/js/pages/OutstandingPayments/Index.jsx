import { useCallback, useEffect, useMemo, useState } from "react";

const API = "/api/v1";

const agingBuckets = [
    "0-7",
    "8-30",
    "31-60",
    "61-90",
    "90+",
];

const initialFilters = {
    status: "",
    follow_up_status: "",
    aging_bucket: "",
    user_id: "",
    booking_id: "",
    date_from: "",
    date_to: "",
};

function currency(value) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
    }).format(Number(value || 0));
}

function formatDate(value) {
    if (!value) {
        return "-";
    }

    return new Date(value).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function statusClass(status) {
    switch (status) {
        case "outstanding":
            return "bg-red-100 text-red-700";

        case "partially_paid":
            return "bg-yellow-100 text-yellow-700";

        case "paid":
            return "bg-green-100 text-green-700";

        case "written_off":
            return "bg-gray-100 text-gray-700";

        default:
            return "bg-gray-100 text-gray-700";
    }
}

function followUpClass(status) {
    switch (status) {
        case "pending":
            return "bg-gray-100 text-gray-700";

        case "contacted":
            return "bg-blue-100 text-blue-700";

        case "promised":
            return "bg-yellow-100 text-yellow-700";

        case "escalated":
            return "bg-red-100 text-red-700";

        case "resolved":
            return "bg-green-100 text-green-700";

        default:
            return "bg-gray-100 text-gray-700";
    }
}

function getToken() {
    return localStorage.getItem("auth_token");
}

async function apiFetch(url, options = {}) {
    const token = getToken();

    const response = await fetch(url, {
        ...options,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token
                ? {
                      Authorization: `Bearer ${token}`,
                  }
                : {}),
            ...(options.headers || {}),
        },
    });

    if (!response.ok) {
        let message = "Request failed.";

        try {
            const error = await response.json();

            message =
                error.message ||
                Object.values(error.errors || {})
                    .flat()
                    .join(" ") ||
                message;
        } catch {
            // Ignore JSON parsing errors.
        }

        throw new Error(message);
    }

    return response;
}

export default function OutstandingPayments() {
    const [payments, setPayments] = useState([]);

    const [summary, setSummary] = useState({
        total_records: 0,
        total_original: 0,
        total_paid: 0,
        total_outstanding: 0,
        buckets: {},
    });

    const [filters, setFilters] = useState(initialFilters);

    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [editingPayment, setEditingPayment] = useState(null);
    const [followUpPayment, setFollowUpPayment] = useState(null);

    const queryString = useMemo(() => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== "" && value !== null && value !== undefined) {
                params.set(key, value);
            }
        });

        params.set("page", page);
        params.set("per_page", 15);

        return params.toString();
    }, [filters, page]);

    const loadPayments = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await apiFetch(
                `${API}/outstanding-payments?${queryString}`
            );

            const result = await response.json();

            setPayments(result.data || []);
            setSummary(
                result.summary || {
                    total_records: 0,
                    total_original: 0,
                    total_paid: 0,
                    total_outstanding: 0,
                    buckets: {},
                }
            );

            setLastPage(result.last_page || 1);
            setTotal(result.total || 0);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [queryString]);

    useEffect(() => {
        loadPayments();
    }, [loadPayments]);

    function updateFilter(key, value) {
        setPage(1);

        setFilters((current) => ({
            ...current,
            [key]: value,
        }));
    }

    function resetFilters() {
        setPage(1);
        setFilters(initialFilters);
    }

    async function deletePayment(payment) {
        if (
            !window.confirm(
                "Delete this outstanding payment record?"
            )
        ) {
            return;
        }

        try {
            await apiFetch(
                `${API}/outstanding-payments/${payment.id}`,
                {
                    method: "DELETE",
                }
            );

            await loadPayments();
        } catch (err) {
            setError(err.message);
        }
    }

    async function exportCsv() {
        try {
            const params = new URLSearchParams();

            Object.entries(filters).forEach(([key, value]) => {
                if (
                    value !== "" &&
                    value !== null &&
                    value !== undefined
                ) {
                    params.set(key, value);
                }
            });

            const response = await apiFetch(
                `${API}/outstanding-payments/export?${params.toString()}`
            );

            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;
            link.download = "outstanding-payments.csv";

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Outstanding Payments / Aged Fees
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Track unpaid balances, aging, and
                            payment follow-ups.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={exportCsv}
                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                            Export CSV
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setEditingPayment({
                                    transaction_id: "",
                                    booking_id: "",
                                    user_id: "",
                                    due_date: "",
                                    original_amount: "",
                                    paid_amount: 0,
                                    outstanding_amount: "",
                                    status: "outstanding",
                                    follow_up_status: "pending",
                                    last_follow_up_at: "",
                                    next_follow_up_at: "",
                                    follow_up_notes: "",
                                })
                            }
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Add Outstanding Payment
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <SummaryCard
                        title="Outstanding Records"
                        value={summary.total_records}
                    />

                    <SummaryCard
                        title="Original Amount"
                        value={currency(
                            summary.total_original
                        )}
                    />

                    <SummaryCard
                        title="Paid"
                        value={currency(summary.total_paid)}
                    />

                    <SummaryCard
                        title="Outstanding Balance"
                        value={currency(
                            summary.total_outstanding
                        )}
                        danger
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                    {agingBuckets.map((bucket) => {
                        const data =
                            summary.buckets?.[bucket] || {
                                count: 0,
                                amount: 0,
                            };

                        return (
                            <button
                                key={bucket}
                                type="button"
                                onClick={() =>
                                    updateFilter(
                                        "aging_bucket",
                                        bucket
                                    )
                                }
                                className={`rounded-xl border bg-white p-4 text-left shadow-sm transition hover:shadow ${
                                    filters.aging_bucket ===
                                    bucket
                                        ? "ring-2 ring-blue-500"
                                        : ""
                                }`}
                            >
                                <div className="text-sm font-medium text-gray-500">
                                    {bucket} days
                                </div>

                                <div className="mt-2 text-lg font-bold text-gray-900">
                                    {currency(data.amount)}
                                </div>

                                <div className="mt-1 text-xs text-gray-500">
                                    {data.count} record
                                    {data.count !== 1
                                        ? "s"
                                        : ""}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <FilterSelect
                            label="Status"
                            value={filters.status}
                            onChange={(value) =>
                                updateFilter(
                                    "status",
                                    value
                                )
                            }
                            options={[
                                ["", "All statuses"],
                                [
                                    "outstanding",
                                    "Outstanding",
                                ],
                                [
                                    "partially_paid",
                                    "Partially Paid",
                                ],
                                ["paid", "Paid"],
                                [
                                    "written_off",
                                    "Written Off",
                                ],
                            ]}
                        />

                        <FilterSelect
                            label="Follow-up"
                            value={
                                filters.follow_up_status
                            }
                            onChange={(value) =>
                                updateFilter(
                                    "follow_up_status",
                                    value
                                )
                            }
                            options={[
                                ["", "All follow-ups"],
                                [
                                    "pending",
                                    "Pending",
                                ],
                                [
                                    "contacted",
                                    "Contacted",
                                ],
                                [
                                    "promised",
                                    "Promised",
                                ],
                                [
                                    "escalated",
                                    "Escalated",
                                ],
                                [
                                    "resolved",
                                    "Resolved",
                                ],
                            ]}
                        />

                        <FilterSelect
                            label="Aging"
                            value={filters.aging_bucket}
                            onChange={(value) =>
                                updateFilter(
                                    "aging_bucket",
                                    value
                                )
                            }
                            options={[
                                ["", "All aging buckets"],
                                ...agingBuckets.map(
                                    (bucket) => [
                                        bucket,
                                        `${bucket} days`,
                                    ]
                                ),
                            ]}
                        />

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                User ID
                            </label>

                            <input
                                type="number"
                                value={filters.user_id}
                                onChange={(event) =>
                                    updateFilter(
                                        "user_id",
                                        event.target
                                            .value
                                    )
                                }
                                className="w-full rounded-lg border px-3 py-2 text-sm"
                                placeholder="User ID"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Booking ID
                            </label>

                            <input
                                type="number"
                                value={filters.booking_id}
                                onChange={(event) =>
                                    updateFilter(
                                        "booking_id",
                                        event.target
                                            .value
                                    )
                                }
                                className="w-full rounded-lg border px-3 py-2 text-sm"
                                placeholder="Booking ID"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Due From
                            </label>

                            <input
                                type="date"
                                value={filters.date_from}
                                onChange={(event) =>
                                    updateFilter(
                                        "date_from",
                                        event.target
                                            .value
                                    )
                                }
                                className="w-full rounded-lg border px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Due To
                            </label>

                            <input
                                type="date"
                                value={filters.date_to}
                                onChange={(event) =>
                                    updateFilter(
                                        "date_to",
                                        event.target
                                            .value
                                    )
                                }
                                className="w-full rounded-lg border px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="w-full rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                        Customer
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                        Booking
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                        Due Date
                                    </th>

                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                                        Original
                                    </th>

                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                                        Paid
                                    </th>

                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                                        Outstanding
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                        Aging
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                        Status
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                        Follow-up
                                    </th>

                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="10"
                                            className="px-4 py-10 text-center text-sm text-gray-500"
                                        >
                                            Loading...
                                        </td>
                                    </tr>
                                ) : payments.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="10"
                                            className="px-4 py-10 text-center text-sm text-gray-500"
                                        >
                                            No outstanding
                                            payments found.
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((payment) => (
                                        <tr
                                            key={
                                                payment.id
                                            }
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-4">
                                                <div className="font-medium text-gray-900">
                                                    {payment
                                                        .user
                                                        ?.name ||
                                                        "Unknown"}
                                                </div>

                                                <div className="text-xs text-gray-500">
                                                    {payment
                                                        .user
                                                        ?.email ||
                                                        "-"}
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 text-sm text-gray-700">
                                                #
                                                {payment.booking_id ||
                                                    "-"}
                                            </td>

                                            <td className="px-4 py-4 text-sm text-gray-700">
                                                {formatDate(
                                                    payment.due_date
                                                )}
                                            </td>

                                            <td className="px-4 py-4 text-right text-sm">
                                                {currency(
                                                    payment.original_amount
                                                )}
                                            </td>

                                            <td className="px-4 py-4 text-right text-sm">
                                                {currency(
                                                    payment.paid_amount
                                                )}
                                            </td>

                                            <td className="px-4 py-4 text-right text-sm font-semibold text-red-600">
                                                {currency(
                                                    payment.outstanding_amount
                                                )}
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="font-medium">
                                                    {
                                                        payment.aging_bucket
                                                    }
                                                </div>

                                                <div className="text-xs text-gray-500">
                                                    {
                                                        payment.aging_days
                                                    }{" "}
                                                    days
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass(
                                                        payment.status
                                                    )}`}
                                                >
                                                    {payment.status.replace(
                                                        "_",
                                                        " "
                                                    )}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${followUpClass(
                                                        payment.follow_up_status
                                                    )}`}
                                                >
                                                    {payment.follow_up_status.replace(
                                                        "_",
                                                        " "
                                                    )}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setFollowUpPayment(
                                                                payment
                                                            )
                                                        }
                                                        className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                                                    >
                                                        Follow-up
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setEditingPayment(
                                                                payment
                                                            )
                                                        }
                                                        className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deletePayment(
                                                                payment
                                                            )
                                                        }
                                                        className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between border-t px-4 py-3">
                        <div className="text-sm text-gray-500">
                            {total} record
                            {total !== 1 ? "s" : ""}
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() =>
                                    setPage(
                                        (current) =>
                                            current - 1
                                    )
                                }
                                className="rounded border px-3 py-1 text-sm disabled:opacity-40"
                            >
                                Previous
                            </button>

                            <span className="px-3 py-1 text-sm text-gray-600">
                                Page {page} of {lastPage}
                            </span>

                            <button
                                type="button"
                                disabled={
                                    page >= lastPage
                                }
                                onClick={() =>
                                    setPage(
                                        (current) =>
                                            current + 1
                                    )
                                }
                                className="rounded border px-3 py-1 text-sm disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {editingPayment && (
                <PaymentModal
                    payment={editingPayment}
                    onClose={() =>
                        setEditingPayment(null)
                    }
                    onSaved={async () => {
                        setEditingPayment(null);
                        await loadPayments();
                    }}
                />
            )}

            {followUpPayment && (
                <FollowUpModal
                    payment={followUpPayment}
                    onClose={() =>
                        setFollowUpPayment(null)
                    }
                    onSaved={async () => {
                        setFollowUpPayment(null);
                        await loadPayments();
                    }}
                />
            )}
        </div>
    );
}

function SummaryCard({
    title,
    value,
    danger = false,
}) {
    return (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">
                {title}
            </div>

            <div
                className={`mt-2 text-2xl font-bold ${
                    danger
                        ? "text-red-600"
                        : "text-gray-900"
                }`}
            >
                {value}
            </div>
        </div>
    );
}

function FilterSelect({
    label,
    value,
    onChange,
    options,
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
                className="w-full rounded-lg border px-3 py-2 text-sm"
            >
                {options.map(([optionValue, label]) => (
                    <option
                        key={optionValue}
                        value={optionValue}
                    >
                        {label}
                    </option>
                ))}
            </select>
        </div>
    );
}

function PaymentModal({
    payment,
    onClose,
    onSaved,
}) {
    const [form, setForm] = useState({
        transaction_id:
            payment.transaction_id || "",
        booking_id: payment.booking_id || "",
        user_id: payment.user_id || "",
        due_date: payment.due_date
            ? payment.due_date.substring(0, 10)
            : "",
        original_amount:
            payment.original_amount || "",
        paid_amount: payment.paid_amount || 0,
        outstanding_amount:
            payment.outstanding_amount || "",
        status:
            payment.status || "outstanding",
        follow_up_status:
            payment.follow_up_status || "pending",
        next_follow_up_at:
            payment.next_follow_up_at
                ? payment.next_follow_up_at.substring(
                      0,
                      16
                  )
                : "",
        follow_up_notes:
            payment.follow_up_notes || "",
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    function update(key, value) {
        setForm((current) => ({
            ...current,
            [key]: value,
        }));
    }

    async function submit(event) {
        event.preventDefault();

        setSaving(true);
        setError("");

        const isEdit = Boolean(payment.id);

        const url = isEdit
            ? `${API}/outstanding-payments/${payment.id}`
            : `${API}/outstanding-payments`;

        try {
            await apiFetch(url, {
                method: isEdit ? "PUT" : "POST",
                body: JSON.stringify(form),
            });

            await onSaved();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal title={payment.id ? "Edit Outstanding Payment" : "Add Outstanding Payment"} onClose={onClose}>
            <form
                onSubmit={submit}
                className="space-y-4"
            >
                {error && (
                    <div className="rounded bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                        label="Transaction ID"
                        type="number"
                        value={form.transaction_id}
                        onChange={(value) =>
                            update(
                                "transaction_id",
                                value
                            )
                        }
                    />

                    <Input
                        label="Booking ID"
                        type="number"
                        value={form.booking_id}
                        onChange={(value) =>
                            update(
                                "booking_id",
                                value
                            )
                        }
                    />

                    <Input
                        label="User ID"
                        type="number"
                        value={form.user_id}
                        onChange={(value) =>
                            update("user_id", value)
                        }
                    />

                    <Input
                        label="Due Date"
                        type="date"
                        value={form.due_date}
                        onChange={(value) =>
                            update(
                                "due_date",
                                value
                            )
                        }
                        required
                    />

                    <Input
                        label="Original Amount"
                        type="number"
                        step="0.01"
                        value={form.original_amount}
                        onChange={(value) =>
                            update(
                                "original_amount",
                                value
                            )
                        }
                        required
                    />

                    <Input
                        label="Paid Amount"
                        type="number"
                        step="0.01"
                        value={form.paid_amount}
                        onChange={(value) =>
                            update(
                                "paid_amount",
                                value
                            )
                        }
                    />

                    <FilterSelect
                        label="Status"
                        value={form.status}
                        onChange={(value) =>
                            update(
                                "status",
                                value
                            )
                        }
                        options={[
                            [
                                "outstanding",
                                "Outstanding",
                            ],
                            [
                                "partially_paid",
                                "Partially Paid",
                            ],
                            ["paid", "Paid"],
                            [
                                "written_off",
                                "Written Off",
                            ],
                        ]}
                    />

                    <FilterSelect
                        label="Follow-up Status"
                        value={
                            form.follow_up_status
                        }
                        onChange={(value) =>
                            update(
                                "follow_up_status",
                                value
                            )
                        }
                        options={[
                            ["pending", "Pending"],
                            [
                                "contacted",
                                "Contacted",
                            ],
                            [
                                "promised",
                                "Promised",
                            ],
                            [
                                "escalated",
                                "Escalated",
                            ],
                            [
                                "resolved",
                                "Resolved",
                            ],
                        ]}
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Next Follow-up
                    </label>

                    <input
                        type="datetime-local"
                        value={
                            form.next_follow_up_at
                        }
                        onChange={(event) =>
                            update(
                                "next_follow_up_at",
                                event.target.value
                            )
                        }
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Follow-up Notes
                    </label>

                    <textarea
                        value={form.follow_up_notes}
                        onChange={(event) =>
                            update(
                                "follow_up_notes",
                                event.target.value
                            )
                        }
                        rows="4"
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border px-4 py-2 text-sm"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                        {saving
                            ? "Saving..."
                            : "Save"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

function FollowUpModal({
    payment,
    onClose,
    onSaved,
}) {
    const [status, setStatus] = useState(
        payment.follow_up_status || "pending"
    );

    const [nextFollowUp, setNextFollowUp] =
        useState(
            payment.next_follow_up_at
                ? payment.next_follow_up_at.substring(
                      0,
                      16
                  )
                : ""
        );

    const [notes, setNotes] = useState(
        payment.follow_up_notes || ""
    );

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function submit(event) {
        event.preventDefault();

        setSaving(true);
        setError("");

        try {
            await apiFetch(
                `${API}/outstanding-payments/${payment.id}/follow-up`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        follow_up_status: status,
                        next_follow_up_at:
                            nextFollowUp || null,
                        follow_up_notes: notes,
                    }),
                }
            );

            await onSaved();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal
            title="Payment Follow-up"
            onClose={onClose}
        >
            <form
                onSubmit={submit}
                className="space-y-4"
            >
                {error && (
                    <div className="rounded bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="rounded-lg bg-gray-50 p-4">
                    <div className="text-sm text-gray-500">
                        Outstanding Balance
                    </div>

                    <div className="mt-1 text-xl font-bold text-red-600">
                        {currency(
                            payment.outstanding_amount
                        )}
                    </div>
                </div>

                <FilterSelect
                    label="Follow-up Status"
                    value={status}
                    onChange={setStatus}
                    options={[
                        ["pending", "Pending"],
                        [
                            "contacted",
                            "Contacted",
                        ],
                        [
                            "promised",
                            "Promised",
                        ],
                        [
                            "escalated",
                            "Escalated",
                        ],
                        [
                            "resolved",
                            "Resolved",
                        ],
                    ]}
                />

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Next Follow-up
                    </label>

                    <input
                        type="datetime-local"
                        value={nextFollowUp}
                        onChange={(event) =>
                            setNextFollowUp(
                                event.target.value
                            )
                        }
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Notes
                    </label>

                    <textarea
                        value={notes}
                        onChange={(event) =>
                            setNotes(
                                event.target.value
                            )
                        }
                        rows="4"
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border px-4 py-2 text-sm"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                        {saving
                            ? "Saving..."
                            : "Save Follow-up"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

function Input({
    label,
    value,
    onChange,
    type = "text",
    step,
    required = false,
}) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
                {label}
            </label>

            <input
                type={type}
                step={step}
                required={required}
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
            />
        </div>
    );
}

function Modal({
    title,
    children,
    onClose,
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {title}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xl text-gray-400 hover:text-gray-700"
                    >
                        ×
                    </button>
                </div>

                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}