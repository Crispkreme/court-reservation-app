import { useEffect, useState } from "react";

const emptyForm = {
    name: "",
    cancellation_type: "",
    minimum_hours_before_booking: 0,
    maximum_hours_before_booking: "",
    refund_percentage: 0,
    description: "",
    priority: 0,
    is_active: true,
};

const cancellationTypes = [
    {
        value: "",
        label: "All Cancellation Types",
    },
    {
        value: "customer",
        label: "Customer Cancellation",
    },
    {
        value: "admin",
        label: "Admin Cancellation",
    },
    {
        value: "court_closure",
        label: "Court Closure",
    },
    {
        value: "no_show",
        label: "No-Show",
    },
];

const typeLabel = (type) => {
    const item = cancellationTypes.find(
        (option) => option.value === type
    );

    return item?.label || "All Cancellation Types";
};

export default function CancellationPoliciesIndex() {
    const [policies, setPolicies] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [editingPolicy, setEditingPolicy] =
        useState(null);

    const [form, setForm] = useState(emptyForm);

    const [errors, setErrors] = useState({});

    const loadPolicies = async () => {
        try {
            const response = await fetch(
                "/api/v1/cancellation-policies",
                {
                    headers: {
                        Accept: "application/json",
                    },
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to load cancellation policies."
                );
            }

            setPolicies(data.data || []);
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            await loadPolicies();

            setLoading(false);
        };

        loadData();
    }, []);

    const updateField = (field, value) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingPolicy(null);
        setErrors({});
    };

    const editPolicy = (policy) => {
        setEditingPolicy(policy);

        setForm({
            name: policy.name ?? "",
            cancellation_type:
                policy.cancellation_type ?? "",
            minimum_hours_before_booking:
                policy.minimum_hours_before_booking ?? 0,
            maximum_hours_before_booking:
                policy.maximum_hours_before_booking ?? "",
            refund_percentage:
                policy.refund_percentage ?? 0,
            description:
                policy.description ?? "",
            priority: policy.priority ?? 0,
            is_active: Boolean(policy.is_active),
        });

        setErrors({});

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const submit = async (event) => {
        event.preventDefault();

        setSaving(true);
        setErrors({});

        const url = editingPolicy
            ? `/api/v1/cancellation-policies/${editingPolicy.id}`
            : "/api/v1/cancellation-policies";

        const method = editingPolicy
            ? "PUT"
            : "POST";

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type":
                        "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    ...form,

                    cancellation_type:
                        form.cancellation_type ||
                        null,

                    maximum_hours_before_booking:
                        form.maximum_hours_before_booking ||
                        null,

                    minimum_hours_before_booking:
                        Number(
                            form.minimum_hours_before_booking
                        ),

                    refund_percentage:
                        Number(
                            form.refund_percentage
                        ),

                    priority: Number(form.priority),

                    is_active: Boolean(
                        form.is_active
                    ),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 422) {
                    setErrors(data.errors || {});
                    return;
                }

                throw new Error(
                    data.message ||
                        "Failed to save cancellation policy."
                );
            }

            resetForm();

            await loadPolicies();
        } catch (error) {
            console.error(error);

            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    const deletePolicy = async (policy) => {
        const confirmed = window.confirm(
            `Delete "${policy.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `/api/v1/cancellation-policies/${policy.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Accept: "application/json",
                    },
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to delete cancellation policy."
                );
            }

            await loadPolicies();
        } catch (error) {
            console.error(error);

            alert(error.message);
        }
    };

    const getError = (field) => {
        return errors[field]?.[0] || "";
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="rounded-lg border bg-white p-6">
                    Loading cancellation policies...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Cancellation & Refund Policies
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Configure cancellation windows and
                    refund percentages for court bookings.
                </p>
            </div>

            {/* Form */}
            <form
                onSubmit={submit}
                className="rounded-lg border bg-white p-6 shadow-sm"
            >
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">
                            {editingPolicy
                                ? "Edit Cancellation Policy"
                                : "Create Cancellation Policy"}
                        </h2>

                        <p className="text-sm text-gray-500">
                            Define when a booking can be
                            refunded and how much.
                        </p>
                    </div>

                    {editingPolicy && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium">
                            Policy Name
                        </label>

                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) =>
                                updateField(
                                    "name",
                                    e.target.value
                                )
                            }
                            className="mt-1 w-full rounded-md border p-2"
                            placeholder="Customer Cancellation - Within 24 Hours"
                            required
                        />

                        {getError("name") && (
                            <p className="mt-1 text-sm text-red-600">
                                {getError("name")}
                            </p>
                        )}
                    </div>

                    {/* Cancellation Type */}
                    <div>
                        <label className="block text-sm font-medium">
                            Cancellation Type
                        </label>

                        <select
                            value={
                                form.cancellation_type
                            }
                            onChange={(e) =>
                                updateField(
                                    "cancellation_type",
                                    e.target.value
                                )
                            }
                            className="mt-1 w-full rounded-md border p-2"
                        >
                            {cancellationTypes.map(
                                (type) => (
                                    <option
                                        key={type.value}
                                        value={type.value}
                                    >
                                        {type.label}
                                    </option>
                                )
                            )}
                        </select>

                        {getError(
                            "cancellation_type"
                        ) && (
                            <p className="mt-1 text-sm text-red-600">
                                {getError(
                                    "cancellation_type"
                                )}
                            </p>
                        )}
                    </div>

                    {/* Minimum hours */}
                    <div>
                        <label className="block text-sm font-medium">
                            Minimum Hours Before Booking
                        </label>

                        <input
                            type="number"
                            min="0"
                            value={
                                form.minimum_hours_before_booking
                            }
                            onChange={(e) =>
                                updateField(
                                    "minimum_hours_before_booking",
                                    e.target.value
                                )
                            }
                            className="mt-1 w-full rounded-md border p-2"
                        />

                        <p className="mt-1 text-xs text-gray-500">
                            The cancellation must happen at
                            least this many hours before the
                            booking.
                        </p>

                        {getError(
                            "minimum_hours_before_booking"
                        ) && (
                            <p className="mt-1 text-sm text-red-600">
                                {getError(
                                    "minimum_hours_before_booking"
                                )}
                            </p>
                        )}
                    </div>

                    {/* Maximum hours */}
                    <div>
                        <label className="block text-sm font-medium">
                            Maximum Hours Before Booking
                        </label>

                        <input
                            type="number"
                            min="0"
                            value={
                                form.maximum_hours_before_booking
                            }
                            onChange={(e) =>
                                updateField(
                                    "maximum_hours_before_booking",
                                    e.target.value
                                )
                            }
                            className="mt-1 w-full rounded-md border p-2"
                            placeholder="Leave empty for no upper limit"
                        />

                        <p className="mt-1 text-xs text-gray-500">
                            Leave empty if this policy has
                            no upper time limit.
                        </p>

                        {getError(
                            "maximum_hours_before_booking"
                        ) && (
                            <p className="mt-1 text-sm text-red-600">
                                {getError(
                                    "maximum_hours_before_booking"
                                )}
                            </p>
                        )}
                    </div>

                    {/* Refund */}
                    <div>
                        <label className="block text-sm font-medium">
                            Refund Percentage
                        </label>

                        <div className="mt-1 flex">
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={
                                    form.refund_percentage
                                }
                                onChange={(e) =>
                                    updateField(
                                        "refund_percentage",
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-l-md border p-2"
                            />

                            <span className="flex items-center rounded-r-md border border-l-0 bg-gray-50 px-3 text-sm text-gray-500">
                                %
                            </span>
                        </div>

                        <p className="mt-1 text-xs text-gray-500">
                            0% = no refund, 50% = partial
                            refund, 100% = full refund.
                        </p>

                        {getError(
                            "refund_percentage"
                        ) && (
                            <p className="mt-1 text-sm text-red-600">
                                {getError(
                                    "refund_percentage"
                                )}
                            </p>
                        )}
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium">
                            Priority
                        </label>

                        <input
                            type="number"
                            min="0"
                            value={form.priority}
                            onChange={(e) =>
                                updateField(
                                    "priority",
                                    e.target.value
                                )
                            }
                            className="mt-1 w-full rounded-md border p-2"
                        />

                        <p className="mt-1 text-xs text-gray-500">
                            Higher priority policies are
                            selected first.
                        </p>
                    </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                    <label className="block text-sm font-medium">
                        Description
                    </label>

                    <textarea
                        value={form.description}
                        onChange={(e) =>
                            updateField(
                                "description",
                                e.target.value
                            )
                        }
                        rows="3"
                        className="mt-1 w-full rounded-md border p-2"
                        placeholder="Describe when this policy applies..."
                    />
                </div>

                {/* Active */}
                <div className="mt-6">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={form.is_active}
                            onChange={(e) =>
                                updateField(
                                    "is_active",
                                    e.target.checked
                                )
                            }
                        />

                        <span className="text-sm">
                            Policy is active
                        </span>
                    </label>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-md bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                        {saving
                            ? "Saving..."
                            : editingPolicy
                              ? "Update Policy"
                              : "Create Policy"}
                    </button>

                    {editingPolicy && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="rounded-md border px-5 py-2 text-sm hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {/* Information */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
                <h2 className="font-semibold text-blue-900">
                    Refund Calculation
                </h2>

                <p className="mt-2 text-sm text-blue-800">
                    The system calculates the eligible
                    refund using the booking amount and
                    the refund percentage configured in
                    the applicable policy.
                </p>

                <div className="mt-3 text-sm text-blue-800">
                    <strong>Example:</strong> A ₱1,000
                    booking with a 50% refund policy
                    produces an eligible refund of ₱500.
                </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-white shadow-sm">
                <div className="border-b p-5">
                    <h2 className="font-semibold">
                        Configured Cancellation Policies
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">
                                    Policy
                                </th>

                                <th className="px-4 py-3">
                                    Type
                                </th>

                                <th className="px-4 py-3">
                                    Time Window
                                </th>

                                <th className="px-4 py-3">
                                    Refund
                                </th>

                                <th className="px-4 py-3">
                                    Priority
                                </th>

                                <th className="px-4 py-3">
                                    Status
                                </th>

                                <th className="px-4 py-3">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {policies.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="px-4 py-8 text-center text-gray-500"
                                    >
                                        No cancellation
                                        policies configured.
                                    </td>
                                </tr>
                            ) : (
                                policies.map(
                                    (policy) => (
                                        <tr
                                            key={
                                                policy.id
                                            }
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="font-medium">
                                                    {
                                                        policy.name
                                                    }
                                                </div>

                                                {policy.description && (
                                                    <div className="mt-1 text-xs text-gray-500">
                                                        {
                                                            policy.description
                                                        }
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-4 py-3">
                                                {typeLabel(
                                                    policy.cancellation_type
                                                )}
                                            </td>

                                            <td className="px-4 py-3">
                                                {policy.minimum_hours_before_booking}
                                                {" - "}
                                                {policy.maximum_hours_before_booking !==
                                                null
                                                    ? `${policy.maximum_hours_before_booking} hours`
                                                    : "∞"}
                                            </td>

                                            <td className="px-4 py-3 font-medium">
                                                {
                                                    policy.refund_percentage
                                                }
                                                %
                                            </td>

                                            <td className="px-4 py-3">
                                                {
                                                    policy.priority
                                                }
                                            </td>

                                            <td className="px-4 py-3">
                                                {policy.is_active ? (
                                                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            editPolicy(
                                                                policy
                                                            )
                                                        }
                                                        className="rounded border px-3 py-1 hover:bg-gray-50"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deletePolicy(
                                                                policy
                                                            )
                                                        }
                                                        className="rounded border border-red-200 px-3 py-1 text-red-600 hover:bg-red-50"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}