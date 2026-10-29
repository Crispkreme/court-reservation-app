import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/layout/Layout";

const emptyType = {
    name: "",
    code: "",
    description: "",
    price: "",
    discount_type: "none",
    discount_value: "",
    duration_days: 30,
    benefits: [""],
    access_rules: {
        booking_enabled: true,
        advance_booking_days: 7,
        max_active_bookings: 2,
        guest_players_allowed: true,
        max_guest_players: 0,
        priority_booking: false,
    },
    is_active: true,
};

const emptyMembership = {
    member_id: "",
    membership_type_id: "",
    start_date: new Date().toISOString().split("T")[0],
    status: "active",
    discount_type: "",
    discount_value: "",
    notes: "",
};

export default function Memberships() {
    const [tab, setTab] = useState("memberships");

    const [membershipTypes, setMembershipTypes] = useState([]);
    const [memberships, setMemberships] = useState([]);
    const [members, setMembers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [typeModal, setTypeModal] = useState(false);
    const [membershipModal, setMembershipModal] =
        useState(false);

    const [editingType, setEditingType] = useState(null);

    const [typeForm, setTypeForm] = useState(emptyType);
    const [membershipForm, setMembershipForm] =
        useState(emptyMembership);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");

    const [saving, setSaving] = useState(false);

    const api = async (url, options = {}) => {
        const response = await fetch(url, {
            ...options,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                ...(options.headers || {}),
            },
            credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Request failed."
            );
        }

        return data;
    };

    const loadData = async () => {
        setLoading(true);

        try {
            const [typesResponse, membershipsResponse, membersResponse] =
                await Promise.all([
                    api("/api/v1/membership-types"),
                    api(
                        `/api/v1/memberships?${new URLSearchParams({
                            ...(search
                                ? { search }
                                : {}),
                            ...(status
                                ? { status }
                                : {}),
                        }).toString()}`
                    ),
                    api("/api/v1/members?per_page=100"),
                ]);

            setMembershipTypes(
                typesResponse.data ?? []
            );

            setMemberships(
                membershipsResponse.data ?? []
            );

            setMembers(
                membersResponse.data ?? []
            );
        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadData();
        }, 250);

        return () => clearTimeout(timer);
    }, [search, status]);

    const updateTypeForm = (field, value) => {
        setTypeForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const updateAccessRule = (field, value) => {
        setTypeForm((current) => ({
            ...current,
            access_rules: {
                ...current.access_rules,
                [field]: value,
            },
        }));
    };

    const updateBenefit = (index, value) => {
        setTypeForm((current) => {
            const benefits = [...current.benefits];

            benefits[index] = value;

            return {
                ...current,
                benefits,
            };
        });
    };

    const addBenefit = () => {
        setTypeForm((current) => ({
            ...current,
            benefits: [
                ...current.benefits,
                "",
            ],
        }));
    };

    const removeBenefit = (index) => {
        setTypeForm((current) => ({
            ...current,
            benefits: current.benefits.filter(
                (_, benefitIndex) =>
                    benefitIndex !== index
            ),
        }));
    };

    const openCreateType = () => {
        setEditingType(null);
        setTypeForm(emptyType);
        setTypeModal(true);
    };

    const openEditType = (type) => {
        setEditingType(type);

        setTypeForm({
            name: type.name || "",
            code: type.code || "",
            description: type.description || "",
            price: type.price || "",
            discount_type:
                type.discount_type || "none",
            discount_value:
                type.discount_value || "",
            duration_days:
                type.duration_days || 30,
            benefits:
                type.benefits?.length
                    ? type.benefits
                    : [""],
            access_rules: {
                ...emptyType.access_rules,
                ...(type.access_rules || {}),
            },
            is_active:
                type.is_active ?? true,
        });

        setTypeModal(true);
    };

    const saveType = async (event) => {
        event.preventDefault();

        setSaving(true);

        try {
            const payload = {
                ...typeForm,
                price: Number(typeForm.price || 0),
                discount_value: Number(
                    typeForm.discount_value || 0
                ),
                duration_days: Number(
                    typeForm.duration_days
                ),
                benefits: typeForm.benefits.filter(
                    (benefit) => benefit.trim() !== ""
                ),
            };

            if (editingType) {
                await api(
                    `/api/v1/membership-types/${editingType.id}`,
                    {
                        method: "PUT",
                        body: JSON.stringify(payload),
                    }
                );
            } else {
                await api(
                    "/api/v1/membership-types",
                    {
                        method: "POST",
                        body: JSON.stringify(payload),
                    }
                );
            }

            setTypeModal(false);
            await loadData();
        } catch (error) {
            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    const deleteType = async (type) => {
        if (
            !confirm(
                `Delete membership type "${type.name}"?`
            )
        ) {
            return;
        }

        try {
            await api(
                `/api/v1/membership-types/${type.id}`,
                {
                    method: "DELETE",
                }
            );

            loadData();
        } catch (error) {
            alert(error.message);
        }
    };

    const saveMembership = async (event) => {
        event.preventDefault();

        setSaving(true);

        try {
            await api("/api/v1/memberships", {
                method: "POST",
                body: JSON.stringify({
                    ...membershipForm,
                    member_id: Number(
                        membershipForm.member_id
                    ),
                    membership_type_id: Number(
                        membershipForm.membership_type_id
                    ),
                    discount_value:
                        membershipForm.discount_value
                            ? Number(
                                  membershipForm.discount_value
                              )
                            : null,
                }),
            });

            setMembershipModal(false);
            setMembershipForm(emptyMembership);

            await loadData();
        } catch (error) {
            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    const renewMembership = async (membership) => {
        const startDate = prompt(
            "Renewal start date (YYYY-MM-DD):",
            new Date().toISOString().split("T")[0]
        );

        if (!startDate) {
            return;
        }

        try {
            await api(
                `/api/v1/memberships/${membership.id}/renew`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        start_date: startDate,
                        status: "active",
                    }),
                }
            );

            await loadData();
        } catch (error) {
            alert(error.message);
        }
    };

    const statusClass = (membershipStatus) => {
        switch (membershipStatus) {
            case "active":
                return "bg-green-100 text-green-700";

            case "pending":
                return "bg-yellow-100 text-yellow-700";

            case "expired":
                return "bg-red-100 text-red-700";

            case "suspended":
                return "bg-orange-100 text-orange-700";

            case "cancelled":
                return "bg-slate-100 text-slate-700";

            default:
                return "bg-slate-100 text-slate-700";
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        return new Date(date).toLocaleDateString();
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat(
            undefined,
            {
                style: "currency",
                currency: "PHP",
            }
        ).format(Number(amount || 0));
    };

    const activeTypes = useMemo(
        () =>
            membershipTypes.filter(
                (type) => type.is_active
            ),
        [membershipTypes]
    );

    return (
        <Layout>
        <div className="min-h-full bg-slate-50/60 p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Membership Management
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage membership plans, pricing,
                        benefits, access rules, and member
                        memberships.
                    </p>
                </div>

                {tab === "membership-types" ? (
                    <button
                        onClick={openCreateType}
                        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        + Add Membership Type
                    </button>
                ) : (
                    <button
                        onClick={() =>
                            setMembershipModal(true)
                        }
                        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        + Assign Membership
                    </button>
                )}
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Member memberships</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{memberships.length}</p>
                    <p className="mt-1 text-xs text-slate-500">Matching current filters</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Active memberships</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{memberships.filter((item) => item.status === "active").length}</p>
                    <p className="mt-1 text-xs text-slate-500">Currently active records</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Membership types</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{membershipTypes.length}</p>
                    <p className="mt-1 text-xs text-slate-500">Available plans</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Active plans</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{activeTypes.length}</p>
                    <p className="mt-1 text-xs text-slate-500">Plans available for assignment</p>
                </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200">
                <button
                    onClick={() =>
                        setTab("memberships")
                    }
                    className={`border-b-2 px-4 py-3 text-sm font-medium ${
                        tab === "memberships"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                    }`}
                >
                    Member Memberships
                </button>

                <button
                    onClick={() =>
                        setTab("membership-types")
                    }
                    className={`border-b-2 px-4 py-3 text-sm font-medium ${
                        tab === "membership-types"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                    }`}
                >
                    Membership Types
                </button>
            </div>

            {tab === "memberships" && (
                <>
                    <div className="mb-6 grid gap-3 md:grid-cols-2">
                        <input
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search member..."
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(
                                    event.target.value
                                )
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">
                                All statuses
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

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        {loading ? (
                            <div className="p-10 text-center text-slate-500">
                                Loading memberships...
                            </div>
                        ) : memberships.length === 0 ? (
                            <div className="p-10 text-center text-slate-500">
                                No memberships found.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                        <tr>
                                            <th className="px-6 py-4 text-left">
                                                Member
                                            </th>

                                            <th className="px-6 py-4 text-left">
                                                Membership
                                            </th>

                                            <th className="px-6 py-4 text-left">
                                                Start
                                            </th>

                                            <th className="px-6 py-4 text-left">
                                                Expiration
                                            </th>

                                            <th className="px-6 py-4 text-left">
                                                Price
                                            </th>

                                            <th className="px-6 py-4 text-left">
                                                Status
                                            </th>

                                            <th className="px-6 py-4 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {memberships.map(
                                            (membership) => (
                                                <tr
                                                    key={
                                                        membership.id
                                                    }
                                                    className="border-t border-slate-100 transition-colors hover:bg-slate-50"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium">
                                                            {
                                                                membership
                                                                    .member
                                                                    ?.full_name
                                                            }
                                                        </div>

                                                        <div className="text-xs text-slate-500">
                                                            {
                                                                membership
                                                                    .member
                                                                    ?.member_number
                                                            }
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        {
                                                            membership
                                                                .membership_type
                                                                ?.name
                                                        }
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        {formatDate(
                                                            membership.start_date
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        {formatDate(
                                                            membership.expiration_date
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        {formatMoney(
                                                            membership.final_price
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusClass(
                                                                membership.status
                                                            )}`}
                                                        >
                                                            {
                                                                membership.status
                                                            }
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-3">
                                                            <Link
                                                                to={`/memberships/${membership.id}`}
                                                                className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
                                                            >
                                                                View
                                                            </Link>

                                                            <button
                                                                onClick={() =>
                                                                    renewMembership(
                                                                        membership
                                                                    )
                                                                }
                                                                className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
                                                            >
                                                                Renew
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {tab === "membership-types" && (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {loading ? (
                        <div className="col-span-full p-10 text-center text-slate-500">
                            Loading membership types...
                        </div>
                    ) : membershipTypes.length === 0 ? (
                        <div className="col-span-full rounded-xl border bg-white p-10 text-center text-slate-500">
                            No membership types found.
                        </div>
                    ) : (
                        membershipTypes.map((type) => (
                            <div
                                key={type.id}
                                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-bold">
                                            {type.name}
                                        </h2>

                                        <p className="text-xs text-slate-500">
                                            {type.code}
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs ${
                                            type.is_active
                                                ? "bg-green-100 text-green-700"
                                                : "bg-slate-100 text-slate-500"
                                        }`}
                                    >
                                        {type.is_active
                                            ? "Active"
                                            : "Inactive"}
                                    </span>
                                </div>

                                <p className="mt-4 text-sm text-slate-600">
                                    {type.description ||
                                        "No description."}
                                </p>

                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                        <p className="text-xs text-slate-500">
                                            Price
                                        </p>

                                        <p className="font-semibold">
                                            {formatMoney(
                                                type.price
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                        <p className="text-xs text-slate-500">
                                            Duration
                                        </p>

                                        <p className="font-semibold">
                                            {
                                                type.duration_days
                                            }{" "}
                                            days
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <h3 className="text-sm font-semibold">
                                        Benefits
                                    </h3>

                                    <ul className="mt-2 space-y-1 text-sm text-slate-600">
                                        {(
                                            type.benefits ||
                                            []
                                        ).map(
                                            (
                                                benefit,
                                                index
                                            ) => (
                                                <li
                                                    key={
                                                        index
                                                    }
                                                >
                                                    •{" "}
                                                    {
                                                        benefit
                                                    }
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>

                                <div className="mt-5">
                                    <h3 className="text-sm font-semibold">
                                        Access Rules
                                    </h3>

                                    <div className="mt-2 space-y-1 text-sm text-slate-600">
                                        <p>
                                            Advance booking:{" "}
                                            {
                                                type
                                                    .access_rules
                                                    ?.advance_booking_days
                                            }{" "}
                                            days
                                        </p>

                                        <p>
                                            Active bookings:{" "}
                                            {
                                                type
                                                    .access_rules
                                                    ?.max_active_bookings
                                            }
                                        </p>

                                        <p>
                                            Guest players:{" "}
                                            {type
                                                .access_rules
                                                ?.guest_players_allowed
                                                ? "Allowed"
                                                : "Not allowed"}
                                        </p>

                                        {type
                                            .access_rules
                                            ?.priority_booking && (
                                            <p>
                                                Priority
                                                booking:
                                                Enabled
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-2 border-t border-slate-200 pt-5">
                                    <button
                                        onClick={() =>
                                            openEditType(
                                                type
                                            )
                                        }
                                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() =>
                                            deleteType(
                                                type
                                            )
                                        }
                                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {typeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-blue-600/50 p-4">
                    <form
                        onSubmit={saveType}
                        className="my-8 w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">
                                {editingType
                                    ? "Edit Membership Type"
                                    : "Create Membership Type"}
                            </h2>

                            <button
                                type="button"
                                onClick={() =>
                                    setTypeModal(false)
                                }
                                className="text-slate-500"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            <input
                                required
                                placeholder="Membership name"
                                value={typeForm.name}
                                onChange={(event) =>
                                    updateTypeForm(
                                        "name",
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                            <input
                                required
                                placeholder="Code"
                                value={typeForm.code}
                                onChange={(event) =>
                                    updateTypeForm(
                                        "code",
                                        event.target.value.toUpperCase()
                                    )
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                placeholder="Price"
                                value={typeForm.price}
                                onChange={(event) =>
                                    updateTypeForm(
                                        "price",
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                            <input
                                type="number"
                                min="1"
                                required
                                placeholder="Duration in days"
                                value={
                                    typeForm.duration_days
                                }
                                onChange={(event) =>
                                    updateTypeForm(
                                        "duration_days",
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                            <select
                                value={
                                    typeForm.discount_type
                                }
                                onChange={(event) =>
                                    updateTypeForm(
                                        "discount_type",
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="none">
                                    No discount
                                </option>

                                <option value="percentage">
                                    Percentage discount
                                </option>

                                <option value="fixed">
                                    Fixed discount
                                </option>
                            </select>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Discount value"
                                value={
                                    typeForm.discount_value
                                }
                                onChange={(event) =>
                                    updateTypeForm(
                                        "discount_value",
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <textarea
                            placeholder="Description"
                            value={typeForm.description}
                            onChange={(event) =>
                                updateTypeForm(
                                    "description",
                                    event.target.value
                                )
                            }
                            rows="3"
                            className="mt-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                        <div className="mt-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">
                                    Benefits
                                </h3>

                                <button
                                    type="button"
                                    onClick={addBenefit}
                                    className="text-sm font-medium"
                                >
                                    + Add Benefit
                                </button>
                            </div>

                            <div className="mt-3 space-y-2">
                                {typeForm.benefits.map(
                                    (
                                        benefit,
                                        index
                                    ) => (
                                        <div
                                            key={index}
                                            className="flex gap-2"
                                        >
                                            <input
                                                value={
                                                    benefit
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    updateBenefit(
                                                        index,
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                placeholder="Membership benefit"
                                                className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeBenefit(
                                                        index
                                                    )
                                                }
                                                className="px-3 text-red-600"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="font-semibold">
                                Access Rules
                            </h3>

                            <div className="mt-3 grid gap-4 md:grid-cols-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={
                                            typeForm
                                                .access_rules
                                                .booking_enabled
                                        }
                                        onChange={(event) =>
                                            updateAccessRule(
                                                "booking_enabled",
                                                event.target
                                                    .checked
                                            )
                                        }
                                    />

                                    Booking enabled
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={
                                            typeForm
                                                .access_rules
                                                .guest_players_allowed
                                        }
                                        onChange={(event) =>
                                            updateAccessRule(
                                                "guest_players_allowed",
                                                event.target
                                                    .checked
                                            )
                                        }
                                    />

                                    Guest players allowed
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={
                                            typeForm
                                                .access_rules
                                                .priority_booking
                                        }
                                        onChange={(event) =>
                                            updateAccessRule(
                                                "priority_booking",
                                                event.target
                                                    .checked
                                            )
                                        }
                                    />

                                    Priority booking
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Advance booking days"
                                    value={
                                        typeForm
                                            .access_rules
                                            .advance_booking_days
                                    }
                                    onChange={(event) =>
                                        updateAccessRule(
                                            "advance_booking_days",
                                            Number(
                                                event.target
                                                    .value
                                            )
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Maximum active bookings"
                                    value={
                                        typeForm
                                            .access_rules
                                            .max_active_bookings
                                    }
                                    onChange={(event) =>
                                        updateAccessRule(
                                            "max_active_bookings",
                                            Number(
                                                event.target
                                                    .value
                                            )
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Maximum guest players"
                                    value={
                                        typeForm
                                            .access_rules
                                            .max_guest_players
                                    }
                                    onChange={(event) =>
                                        updateAccessRule(
                                            "max_guest_players",
                                            Number(
                                                event.target
                                                    .value
                                            )
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <label className="mt-6 flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={
                                    typeForm.is_active
                                }
                                onChange={(event) =>
                                    updateTypeForm(
                                        "is_active",
                                        event.target.checked
                                    )
                                }
                            />

                            Active membership type
                        </label>

                        <div className="mt-6 flex flex-col-reverse justify-end gap-3 border-t border-slate-200 pt-5 sm:flex-row">
                            <button
                                type="button"
                                onClick={() =>
                                    setTypeModal(false)
                                }
                                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving
                                    ? "Saving..."
                                    : editingType
                                    ? "Update Type"
                                    : "Create Type"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {membershipModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-600/50 p-4">
                    <form
                        onSubmit={saveMembership}
                        className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8"
                    >
                        <h2 className="text-xl font-bold">
                            Assign Membership
                        </h2>

                        <div className="mt-6 space-y-4">
                            <select
                                required
                                value={
                                    membershipForm.member_id
                                }
                                onChange={(event) =>
                                    setMembershipForm(
                                        (current) => ({
                                            ...current,
                                            member_id:
                                                event.target
                                                    .value,
                                        })
                                    )
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">
                                    Select member
                                </option>

                                {members.map((member) => (
                                    <option
                                        key={member.id}
                                        value={member.id}
                                    >
                                        {member.full_name} —{" "}
                                        {
                                            member.member_number
                                        }
                                    </option>
                                ))}
                            </select>

                            <select
                                required
                                value={
                                    membershipForm.membership_type_id
                                }
                                onChange={(event) =>
                                    setMembershipForm(
                                        (current) => ({
                                            ...current,
                                            membership_type_id:
                                                event.target
                                                    .value,
                                        })
                                    )
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">
                                    Select membership type
                                </option>

                                {activeTypes.map((type) => (
                                    <option
                                        key={type.id}
                                        value={type.id}
                                    >
                                        {type.name} —{" "}
                                        {formatMoney(
                                            type.price
                                        )}
                                    </option>
                                ))}
                            </select>

                            <div>
                                <label className="mb-1 block text-sm text-slate-600">
                                    Start date
                                </label>

                                <input
                                    type="date"
                                    required
                                    value={
                                        membershipForm.start_date
                                    }
                                    onChange={(event) =>
                                        setMembershipForm(
                                            (current) => ({
                                                ...current,
                                                start_date:
                                                    event.target
                                                        .value,
                                            })
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <select
                                value={
                                    membershipForm.status
                                }
                                onChange={(event) =>
                                    setMembershipForm(
                                        (current) => ({
                                            ...current,
                                            status: event.target
                                                .value,
                                        })
                                    )
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="active">
                                    Active
                                </option>

                                <option value="pending">
                                    Pending
                                </option>
                            </select>

                            <textarea
                                placeholder="Notes"
                                value={
                                    membershipForm.notes
                                }
                                onChange={(event) =>
                                    setMembershipForm(
                                        (current) => ({
                                            ...current,
                                            notes: event.target
                                                .value,
                                        })
                                    )
                                }
                                rows="3"
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={() =>
                                    setMembershipModal(false)
                                }
                                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving
                                    ? "Saving..."
                                    : "Assign Membership"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    </Layout>
    );
}