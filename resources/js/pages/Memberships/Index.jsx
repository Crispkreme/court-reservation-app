import React, { useEffect, useMemo, useState } from "react";

const statusClasses = {
    active: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    expired: "bg-gray-100 text-gray-700",
    suspended: "bg-orange-100 text-orange-700",
    cancelled: "bg-red-100 text-red-700",
};

export default function Index() {
    const [memberships, setMemberships] = useState([]);
    const [types, setTypes] = useState([]);
    const [statistics, setStatistics] = useState(null);

    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");

    const [showCreate, setShowCreate] = useState(false);
    const [showRenew, setShowRenew] = useState(false);

    const [selectedMembership, setSelectedMembership] =
        useState(null);

    const [form, setForm] = useState({
        user_id: "",
        membership_type_id: "",
        start_date: new Date()
            .toISOString()
            .split("T")[0],
        status: "active",
        price_paid: "",
        notes: "",
    });

    const loadData = async () => {
        setLoading(true);

        try {
            const params = new URLSearchParams();

            if (search) {
                params.append("search", search);
            }

            if (status) {
                params.append("status", status);
            }

            const [
                membershipsResponse,
                typesResponse,
                statisticsResponse,
            ] = await Promise.all([
                fetch(`/api/v1/memberships?${params}`),
                fetch("/api/v1/membership-types"),
                fetch("/api/v1/memberships/statistics"),
            ]);

            const membershipsData =
                await membershipsResponse.json();

            const typesData =
                await typesResponse.json();

            const statisticsData =
                await statisticsResponse.json();

            setMemberships(
                membershipsData.data ?? []
            );

            setTypes(typesData ?? []);

            setStatistics(statisticsData);
        } catch (error) {
            console.error(
                "Failed to load memberships:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [status]);

    const filteredMemberships = useMemo(() => {
        if (!search) {
            return memberships;
        }

        const value = search.toLowerCase();

        return memberships.filter((membership) => {
            const name =
                membership.user?.name?.toLowerCase() ?? "";

            const email =
                membership.user?.email?.toLowerCase() ?? "";

            const type =
                membership.membership_type?.name?.toLowerCase() ??
                "";

            return (
                name.includes(value) ||
                email.includes(value) ||
                type.includes(value)
            );
        });
    }, [memberships, search]);

    const handleCreate = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch(
                "/api/v1/memberships",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify(form),
                }
            );

            if (!response.ok) {
                const error = await response.json();

                alert(
                    error.message ??
                        "Failed to create membership."
                );

                return;
            }

            setShowCreate(false);

            setForm({
                user_id: "",
                membership_type_id: "",
                start_date: new Date()
                    .toISOString()
                    .split("T")[0],
                status: "active",
                price_paid: "",
                notes: "",
            });

            await loadData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleRenew = async () => {
        if (!selectedMembership) {
            return;
        }

        try {
            const response = await fetch(
                `/api/v1/memberships/${selectedMembership.id}/renew`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        price_paid:
                            selectedMembership.membership_type
                                ?.price,
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();

                alert(
                    error.message ??
                        "Failed to renew membership."
                );

                return;
            }

            setShowRenew(false);
            setSelectedMembership(null);

            await loadData();
        } catch (error) {
            console.error(error);
        }
    };

    const changeStatus = async (
        membership,
        action
    ) => {
        if (
            !window.confirm(
                `Are you sure you want to ${action} this membership?`
            )
        ) {
            return;
        }

        try {
            const response = await fetch(
                `/api/v1/memberships/${membership.id}/${action}`,
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            if (!response.ok) {
                const error = await response.json();

                alert(
                    error.message ??
                        `Failed to ${action} membership.`
                );

                return;
            }

            await loadData();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Membership Management
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage membership types, member
                        subscriptions, benefits, discounts,
                        access rules, and renewals.
                    </p>
                </div>

                <button
                    onClick={() => setShowCreate(true)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    Add Membership
                </button>
            </div>

            {statistics && (
                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
                    <Stat
                        label="Total"
                        value={statistics.total}
                    />

                    <Stat
                        label="Active"
                        value={statistics.active}
                    />

                    <Stat
                        label="Pending"
                        value={statistics.pending}
                    />

                    <Stat
                        label="Expired"
                        value={statistics.expired}
                    />

                    <Stat
                        label="Suspended"
                        value={statistics.suspended}
                    />

                    <Stat
                        label="Cancelled"
                        value={statistics.cancelled}
                    />

                    <Stat
                        label="Expiring"
                        value={
                            statistics.expiring_7_days
                        }
                    />
                </div>
            )}

            <div className="mb-4 flex flex-col gap-3 md:flex-row">
                <input
                    type="text"
                    placeholder="Search member..."
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />

                <select
                    value={status}
                    onChange={(event) =>
                        setStatus(event.target.value)
                    }
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
                >
                    <option value="">
                        All Statuses
                    </option>

                    <option value="active">
                        Active
                    </option>

                    <option value="pending">
                        Pending
                    </option>

                    <option value="expired">
                        Expired
                    </option>

                    <option value="suspended">
                        Suspended
                    </option>

                    <option value="cancelled">
                        Cancelled
                    </option>
                </select>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                    Member
                                </th>

                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                    Membership
                                </th>

                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                    Dates
                                </th>

                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                    Status
                                </th>

                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                    Remaining
                                </th>

                                <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-6 py-10 text-center text-sm text-gray-500"
                                    >
                                        Loading memberships...
                                    </td>
                                </tr>
                            ) : filteredMemberships.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-6 py-10 text-center text-sm text-gray-500"
                                    >
                                        No memberships found.
                                    </td>
                                </tr>
                            ) : (
                                filteredMemberships.map(
                                    (membership) => (
                                        <tr
                                            key={
                                                membership.id
                                            }
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="font-medium text-gray-900">
                                                    {
                                                        membership
                                                            .user
                                                            ?.name
                                                    }
                                                </div>

                                                <div className="text-sm text-gray-500">
                                                    {
                                                        membership
                                                            .user
                                                            ?.email
                                                    }
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="font-medium text-gray-900">
                                                    {
                                                        membership
                                                            .membership_type
                                                            ?.name
                                                    }
                                                </div>

                                                <div className="text-sm text-gray-500">
                                                    ₱
                                                    {Number(
                                                        membership
                                                            .price_paid
                                                    ).toLocaleString()}
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                                <div>
                                                    {
                                                        membership
                                                            .start_date
                                                    }
                                                </div>

                                                <div>
                                                    {
                                                        membership
                                                            .expiration_date
                                                    }
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                        statusClasses[
                                                            membership
                                                                .status
                                                        ] ??
                                                        "bg-gray-100 text-gray-700"
                                                    }`}
                                                >
                                                    {membership.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        membership.status.slice(
                                                            1
                                                        )}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                {membership.status ===
                                                "active" ? (
                                                    <span
                                                        className={
                                                            membership.days_remaining <=
                                                            7
                                                                ? "font-semibold text-red-600"
                                                                : "text-gray-600"
                                                        }
                                                    >
                                                        {
                                                            membership.days_remaining
                                                        }{" "}
                                                        days
                                                    </span>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {[
                                                        "active",
                                                        "expired",
                                                    ].includes(
                                                        membership.status
                                                    ) && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedMembership(
                                                                    membership
                                                                );

                                                                setShowRenew(
                                                                    true
                                                                );
                                                            }}
                                                            className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                                                        >
                                                            Renew
                                                        </button>
                                                    )}

                                                    {membership.status ===
                                                        "active" && (
                                                        <button
                                                            onClick={() =>
                                                                changeStatus(
                                                                    membership,
                                                                    "suspend"
                                                                )
                                                            }
                                                            className="rounded-md bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-100"
                                                        >
                                                            Suspend
                                                        </button>
                                                    )}

                                                    {membership.status !==
                                                        "cancelled" &&
                                                        membership.status !==
                                                            "expired" && (
                                                            <button
                                                                onClick={() =>
                                                                    changeStatus(
                                                                        membership,
                                                                        "cancel"
                                                                    )
                                                                }
                                                                className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
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

            {showCreate && (
                <Modal
                    title="Create Membership"
                    onClose={() =>
                        setShowCreate(false)
                    }
                >
                    <form
                        onSubmit={handleCreate}
                        className="space-y-4"
                    >
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                User ID
                            </label>

                            <input
                                type="number"
                                required
                                value={form.user_id}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        user_id:
                                            event.target
                                                .value,
                                    })
                                }
                                className="w-full rounded-lg border px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Membership Type
                            </label>

                            <select
                                required
                                value={
                                    form.membership_type_id
                                }
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        membership_type_id:
                                            event.target
                                                .value,
                                    })
                                }
                                className="w-full rounded-lg border px-3 py-2"
                            >
                                <option value="">
                                    Select membership
                                </option>

                                {types.map((type) => (
                                    <option
                                        key={type.id}
                                        value={type.id}
                                    >
                                        {type.name} - ₱
                                        {Number(
                                            type.price
                                        ).toLocaleString()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Start Date
                            </label>

                            <input
                                type="date"
                                required
                                value={
                                    form.start_date
                                }
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        start_date:
                                            event.target
                                                .value,
                                    })
                                }
                                className="w-full rounded-lg border px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Status
                            </label>

                            <select
                                value={form.status}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        status:
                                            event.target
                                                .value,
                                    })
                                }
                                className="w-full rounded-lg border px-3 py-2"
                            >
                                <option value="pending">
                                    Pending
                                </option>

                                <option value="active">
                                    Active
                                </option>

                                <option value="suspended">
                                    Suspended
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Price Paid
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                    form.price_paid
                                }
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        price_paid:
                                            event.target
                                                .value,
                                    })
                                }
                                className="w-full rounded-lg border px-3 py-2"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    setShowCreate(false)
                                }
                                className="rounded-lg border px-4 py-2 text-sm"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
                            >
                                Create
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {showRenew && selectedMembership && (
                <Modal
                    title="Renew Membership"
                    onClose={() => {
                        setShowRenew(false);
                        setSelectedMembership(null);
                    }}
                >
                    <div className="space-y-4">
                        <div className="rounded-lg bg-gray-50 p-4">
                            <p className="font-medium">
                                {
                                    selectedMembership
                                        .user?.name
                                }
                            </p>

                            <p className="text-sm text-gray-500">
                                {
                                    selectedMembership
                                        .membership_type
                                        ?.name
                                }
                            </p>

                            <p className="mt-2 text-sm">
                                Current expiration:{" "}
                                <strong>
                                    {
                                        selectedMembership
                                            .expiration_date
                                    }
                                </strong>
                            </p>
                        </div>

                        <p className="text-sm text-gray-600">
                            A new membership period will be
                            created using the current
                            membership type and duration.
                        </p>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowRenew(false);
                                    setSelectedMembership(
                                        null
                                    );
                                }}
                                className="rounded-lg border px-4 py-2 text-sm"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleRenew}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
                            >
                                Confirm Renewal
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

function Stat({ label, value }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase text-gray-500">
                {label}
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
                {value ?? 0}
            </p>
        </div>
    );
}

function Modal({ title, children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h2 className="text-lg font-semibold">
                        {title}
                    </h2>

                    <button
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