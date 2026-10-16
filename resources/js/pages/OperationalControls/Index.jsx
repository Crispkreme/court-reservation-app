import React, { useEffect, useState } from "react";

const API = "/api/v1";

const CONTROL_TYPES = [
    { value: "manual_booking", label: "Manual Booking" },
    { value: "court_block", label: "Court Block" },
    { value: "temporary_closure", label: "Temporary Closure" },
    { value: "maintenance", label: "Maintenance" },
    { value: "tournament_event", label: "Tournament / Event" },
    { value: "booking_window", label: "Limited Booking Window" },
    { value: "manual_cancellation", label: "Manual Cancellation" },
    { value: "manual_reschedule", label: "Manual Reschedule" },
    { value: "manual_refund", label: "Manual Refund" },
    { value: "rule_override", label: "Rule Override" },
];

const STATUS_OPTIONS = [
    "active",
    "completed",
    "cancelled",
    "expired",
];

export default function OperationalControls() {
    const [controls, setControls] = useState([]);
    const [summary, setSummary] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [filters, setFilters] = useState({
        control_type: "",
        status: "",
    });

    const [form, setForm] = useState({
        control_type: "court_block",
        court_id: "",
        booking_id: "",
        status: "active",
        starts_at: "",
        ends_at: "",
        minimum_advance_hours: "",
        maximum_advance_days: "",
        new_booking_date: "",
        new_start_time: "",
        new_duration_minutes: "",
        refund_amount: "",
        refund_reference: "",
        reason: "",
        notes: "",
        allowed_roles: "admin,manager,operations",
        override_rules: "",
    });

    const token = localStorage.getItem("auth_token");

    const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
    };

    const loadControls = async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();

            if (filters.control_type) {
                params.append(
                    "control_type",
                    filters.control_type
                );
            }

            if (filters.status) {
                params.append(
                    "status",
                    filters.status
                );
            }

            const response = await fetch(
                `${API}/operational-controls?${params.toString()}`,
                {
                    headers,
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to load operational controls."
                );
            }

            const data = await response.json();

            setControls(data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadSummary = async () => {
        try {
            const response = await fetch(
                `${API}/operational-controls/summary`,
                {
                    headers,
                }
            );

            if (!response.ok) {
                return;
            }

            setSummary(await response.json());
        } catch {
            // Summary failure should not prevent page usage.
        }
    };

    useEffect(() => {
        loadControls();
        loadSummary();
    }, [filters.control_type, filters.status]);

    const updateField = (field, value) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const submit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");

            let overrideRules = null;

            if (form.override_rules.trim()) {
                try {
                    overrideRules = JSON.parse(
                        form.override_rules
                    );
                } catch {
                    throw new Error(
                        "Override Rules must contain valid JSON."
                    );
                }
            }

            const payload = {
                control_type: form.control_type,
                court_id: form.court_id
                    ? Number(form.court_id)
                    : null,
                booking_id: form.booking_id
                    ? Number(form.booking_id)
                    : null,
                status: form.status,
                starts_at: form.starts_at || null,
                ends_at: form.ends_at || null,
                minimum_advance_hours:
                    form.minimum_advance_hours
                        ? Number(form.minimum_advance_hours)
                        : null,
                maximum_advance_days:
                    form.maximum_advance_days
                        ? Number(form.maximum_advance_days)
                        : null,
                new_booking_date:
                    form.new_booking_date || null,
                new_start_time:
                    form.new_start_time || null,
                new_duration_minutes:
                    form.new_duration_minutes
                        ? Number(form.new_duration_minutes)
                        : null,
                refund_amount:
                    form.refund_amount || null,
                refund_reference:
                    form.refund_reference || null,
                reason: form.reason || null,
                notes: form.notes || null,
                allowed_roles: form.allowed_roles
                    .split(",")
                    .map((role) => role.trim())
                    .filter(Boolean),
                override_rules: overrideRules,
            };

            const response = await fetch(
                `${API}/operational-controls`,
                {
                    method: "POST",
                    headers,
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to create operational control."
                );
            }

            setForm({
                control_type: "court_block",
                court_id: "",
                booking_id: "",
                status: "active",
                starts_at: "",
                ends_at: "",
                minimum_advance_hours: "",
                maximum_advance_days: "",
                new_booking_date: "",
                new_start_time: "",
                new_duration_minutes: "",
                refund_amount: "",
                refund_reference: "",
                reason: "",
                notes: "",
                allowed_roles:
                    "admin,manager,operations",
                override_rules: "",
            });

            await loadControls();
            await loadSummary();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const cancelControl = async (id) => {
        if (
            !window.confirm(
                "Cancel this operational control?"
            )
        ) {
            return;
        }

        try {
            const response = await fetch(
                `${API}/operational-controls/${id}`,
                {
                    method: "DELETE",
                    headers,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to cancel control."
                );
            }

            await loadControls();
            await loadSummary();
        } catch (err) {
            setError(err.message);
        }
    };

    const formatType = (type) => {
        return (
            CONTROL_TYPES.find(
                (item) => item.value === type
            )?.label || type
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Admin & Operational Controls
                    </h1>

                    <p className="mt-1 text-sm text-gray-600">
                        Manage court operations, manual booking
                        actions, closures, refunds, and booking
                        rule overrides.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {summary && (
                    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
                        <SummaryCard
                            label="Total"
                            value={summary.total}
                        />

                        <SummaryCard
                            label="Active"
                            value={summary.active}
                        />

                        <SummaryCard
                            label="Court Blocks"
                            value={summary.court_blocks}
                        />

                        <SummaryCard
                            label="Manual Bookings"
                            value={summary.manual_bookings}
                        />

                        <SummaryCard
                            label="Cancellations"
                            value={
                                summary.manual_cancellations
                            }
                        />

                        <SummaryCard
                            label="Reschedules"
                            value={
                                summary.manual_reschedules
                            }
                        />

                        <SummaryCard
                            label="Refunds"
                            value={summary.manual_refunds}
                        />

                        <SummaryCard
                            label="Overrides"
                            value={summary.rule_overrides}
                        />
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-1">
                        <h2 className="mb-4 text-lg font-semibold">
                            Create Operational Control
                        </h2>

                        <form
                            onSubmit={submit}
                            className="space-y-4"
                        >
                            <Field label="Control Type">
                                <select
                                    value={
                                        form.control_type
                                    }
                                    onChange={(e) =>
                                        updateField(
                                            "control_type",
                                            e.target.value
                                        )
                                    }
                                    className="input"
                                >
                                    {CONTROL_TYPES.map(
                                        (type) => (
                                            <option
                                                key={
                                                    type.value
                                                }
                                                value={
                                                    type.value
                                                }
                                            >
                                                {type.label}
                                            </option>
                                        )
                                    )}
                                </select>
                            </Field>

                            <Field label="Court ID">
                                <input
                                    type="number"
                                    value={form.court_id}
                                    onChange={(e) =>
                                        updateField(
                                            "court_id",
                                            e.target.value
                                        )
                                    }
                                    className="input"
                                    placeholder="Optional"
                                />
                            </Field>

                            <Field label="Booking ID">
                                <input
                                    type="number"
                                    value={form.booking_id}
                                    onChange={(e) =>
                                        updateField(
                                            "booking_id",
                                            e.target.value
                                        )
                                    }
                                    className="input"
                                    placeholder="Optional"
                                />
                            </Field>

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Starts At">
                                    <input
                                        type="datetime-local"
                                        value={
                                            form.starts_at
                                        }
                                        onChange={(e) =>
                                            updateField(
                                                "starts_at",
                                                e.target.value
                                            )
                                        }
                                        className="input"
                                    />
                                </Field>

                                <Field label="Ends At">
                                    <input
                                        type="datetime-local"
                                        value={
                                            form.ends_at
                                        }
                                        onChange={(e) =>
                                            updateField(
                                                "ends_at",
                                                e.target.value
                                            )
                                        }
                                        className="input"
                                    />
                                </Field>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Min Advance Hours">
                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            form.minimum_advance_hours
                                        }
                                        onChange={(e) =>
                                            updateField(
                                                "minimum_advance_hours",
                                                e.target.value
                                            )
                                        }
                                        className="input"
                                    />
                                </Field>

                                <Field label="Max Advance Days">
                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            form.maximum_advance_days
                                        }
                                        onChange={(e) =>
                                            updateField(
                                                "maximum_advance_days",
                                                e.target.value
                                            )
                                        }
                                        className="input"
                                    />
                                </Field>
                            </div>

                            <Field label="New Booking Date">
                                <input
                                    type="date"
                                    value={
                                        form.new_booking_date
                                    }
                                    onChange={(e) =>
                                        updateField(
                                            "new_booking_date",
                                            e.target.value
                                        )
                                    }
                                    className="input"
                                />
                            </Field>

                            <Field label="New Start Time">
                                <input
                                    type="time"
                                    value={
                                        form.new_start_time
                                    }
                                    onChange={(e) =>
                                        updateField(
                                            "new_start_time",
                                            e.target.value
                                        )
                                    }
                                    className="input"
                                />
                            </Field>

                            <Field label="Refund Amount">
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                        form.refund_amount
                                    }
                                    onChange={(e) =>
                                        updateField(
                                            "refund_amount",
                                            e.target.value
                                        )
                                    }
                                    className="input"
                                />
                            </Field>

                            <Field label="Refund Reference">
                                <input
                                    type="text"
                                    value={
                                        form.refund_reference
                                    }
                                    onChange={(e) =>
                                        updateField(
                                            "refund_reference",
                                            e.target.value
                                        )
                                    }
                                    className="input"
                                />
                            </Field>

                            <Field label="Allowed Roles">
                                <input
                                    type="text"
                                    value={
                                        form.allowed_roles
                                    }
                                    onChange={(e) =>
                                        updateField(
                                            "allowed_roles",
                                            e.target.value
                                        )
                                    }
                                    className="input"
                                    placeholder="admin,manager,operations"
                                />
                            </Field>

                            <Field label="Reason">
                                <textarea
                                    value={form.reason}
                                    onChange={(e) =>
                                        updateField(
                                            "reason",
                                            e.target.value
                                        )
                                    }
                                    className="input min-h-20"
                                    required
                                />
                            </Field>

                            <Field label="Operational Notes">
                                <textarea
                                    value={form.notes}
                                    onChange={(e) =>
                                        updateField(
                                            "notes",
                                            e.target.value
                                        )
                                    }
                                    className="input min-h-20"
                                />
                            </Field>

                            <Field label="Override Rules JSON">
                                <textarea
                                    value={
                                        form.override_rules
                                    }
                                    onChange={(e) =>
                                        updateField(
                                            "override_rules",
                                            e.target.value
                                        )
                                    }
                                    className="input min-h-24 font-mono text-xs"
                                    placeholder='{"daily_booking_limit":5,"max_duration_minutes":240}'
                                />
                            </Field>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving
                                    ? "Saving..."
                                    : "Create Control"}
                            </button>
                        </form>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-lg font-semibold">
                                Operational History
                            </h2>

                            <div className="flex gap-2">
                                <select
                                    value={
                                        filters.control_type
                                    }
                                    onChange={(e) =>
                                        setFilters(
                                            (current) => ({
                                                ...current,
                                                control_type:
                                                    e.target
                                                        .value,
                                            })
                                        )
                                    }
                                    className="rounded-lg border px-3 py-2 text-sm"
                                >
                                    <option value="">
                                        All Types
                                    </option>

                                    {CONTROL_TYPES.map(
                                        (type) => (
                                            <option
                                                key={
                                                    type.value
                                                }
                                                value={
                                                    type.value
                                                }
                                            >
                                                {type.label}
                                            </option>
                                        )
                                    )}
                                </select>

                                <select
                                    value={filters.status}
                                    onChange={(e) =>
                                        setFilters(
                                            (current) => ({
                                                ...current,
                                                status:
                                                    e.target
                                                        .value,
                                            })
                                        )
                                    }
                                    className="rounded-lg border px-3 py-2 text-sm"
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
                                                {status}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="py-12 text-center text-gray-500">
                                Loading...
                            </div>
                        ) : controls.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-10 text-center text-gray-500">
                                No operational controls found.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="px-3 py-3">
                                                Type
                                            </th>
                                            <th className="px-3 py-3">
                                                Court
                                            </th>
                                            <th className="px-3 py-3">
                                                Booking
                                            </th>
                                            <th className="px-3 py-3">
                                                Period
                                            </th>
                                            <th className="px-3 py-3">
                                                Status
                                            </th>
                                            <th className="px-3 py-3">
                                                Reason
                                            </th>
                                            <th className="px-3 py-3">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {controls.map(
                                            (control) => (
                                                <tr
                                                    key={
                                                        control.id
                                                    }
                                                    className="border-b last:border-0"
                                                >
                                                    <td className="px-3 py-3 font-medium">
                                                        {formatType(
                                                            control.control_type
                                                        )}
                                                    </td>

                                                    <td className="px-3 py-3">
                                                        {control.court
                                                            ?.name ||
                                                            control.court_id ||
                                                            "—"}
                                                    </td>

                                                    <td className="px-3 py-3">
                                                        {control.booking
                                                            ?.booking_reference ||
                                                            control.booking_id ||
                                                            "—"}
                                                    </td>

                                                    <td className="px-3 py-3 whitespace-nowrap">
                                                        {formatDate(
                                                            control.starts_at
                                                        )}

                                                        {control.ends_at && (
                                                            <>
                                                                <br />
                                                                <span className="text-gray-500">
                                                                    to{" "}
                                                                    {formatDate(
                                                                        control.ends_at
                                                                    )}
                                                                </span>
                                                            </>
                                                        )}
                                                    </td>

                                                    <td className="px-3 py-3">
                                                        <StatusBadge
                                                            status={
                                                                control.status
                                                            }
                                                        />
                                                    </td>

                                                    <td className="max-w-xs px-3 py-3">
                                                        <div className="truncate">
                                                            {
                                                                control.reason
                                                            }
                                                        </div>
                                                    </td>

                                                    <td className="px-3 py-3">
                                                        {control.status ===
                                                            "active" && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    cancelControl(
                                                                        control.id
                                                                    )
                                                                }
                                                                className="rounded bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .input {
                    width: 100%;
                    border: 1px solid #d1d5db;
                    border-radius: 0.5rem;
                    padding: 0.625rem 0.75rem;
                    font-size: 0.875rem;
                    outline: none;
                }

                .input:focus {
                    border-color: #2563eb;
                    box-shadow: 0 0 0 1px #2563eb;
                }
            `}</style>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {label}
            </label>
            {children}
        </div>
    );
}

function SummaryCard({ label, value }) {
    return (
        <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {label}
            </div>

            <div className="mt-1 text-2xl font-bold text-gray-900">
                {value ?? 0}
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const classes = {
        active: "bg-green-100 text-green-700",
        completed: "bg-blue-100 text-blue-700",
        cancelled: "bg-red-100 text-red-700",
        expired: "bg-gray-100 text-gray-700",
    };

    return (
        <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                classes[status] ||
                "bg-gray-100 text-gray-700"
            }`}
        >
            {status}
        </span>
    );
}

function formatDate(value) {
    if (!value) {
        return "—";
    }

    return new Date(value).toLocaleString();
}