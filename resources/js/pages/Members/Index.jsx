import React, { useEffect, useMemo, useState } from "react";
import StatCard from '../../components/StatCard';
import { formatDate, formatCurrency } from '../../utils/formatters';
import MembershipCreateModal from "../../components/modal/MembershipCreateModal";
import MembershipRenewModal from "../../components/modal/MembershipRenewModal";
import { createMembership, getMemberships, getMembershipTypes, getMembershipStatistics } from '../../services/membershipService';
import { getMemberUsers } from '../../services/userService';
import PageHeader from '../../components/PageHeader';

const statusClasses = {
    active: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    expired: "bg-gray-100 text-gray-700",
    suspended: "bg-orange-100 text-orange-700",
    cancelled: "bg-red-100 text-red-700",
};

export default function Index() {
    const [memberships, setMemberships] = useState([]);
    const [membershipTypes, setMembershipTypes] = useState([]);
    const [members, setMembers] = useState([]);
    const [types, setTypes] = useState([]);
    const [statistics, setStatistics] = useState(null);

    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");

    const [showCreate, setShowCreate] = useState(false);
    const [showRenew, setShowRenew] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedMembership, setSelectedMembership] = useState(null);

    const [createLoading, setCreateLoading] = useState(false);
    const [renewLoading, setRenewLoading] = useState(false);

    const [createError, setCreateError] = useState("");
    const [renewError, setRenewError] = useState("");

    const [loadingMembers, setLoadingMembers] = useState(false);

    const [form, setForm] = useState({
        member_id: "",
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

            if (search?.trim()) {
                params.append('search', search.trim());
            }

            if (status) {
                params.append('status', status);
            }

            const [
                membersUserResponse,
                membershipsResponse,
                typesResponse,
                statisticsResponse,
            ] = await Promise.all([
                getMemberUsers(),
                getMemberships(params.toString()),
                getMembershipTypes(),
                getMembershipStatistics(),
            ]);

            setMembers(membersUserResponse.data.data ?? membersUserResponse.data);
            setMemberships(membershipsResponse.data.data ?? []);
            setMembershipTypes(typesResponse.data.data ?? typesResponse.data);
            setStatistics(statisticsResponse.data);

        } catch (error) {
            console.error('Failed to load membership data:', error);
            console.error('Response:', error.response?.data);
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
            const name = membership.user?.name?.toLowerCase() ?? "";
            const email = membership.user?.email?.toLowerCase() ?? "";
            const type = membership.membership_type?.name?.toLowerCase() ?? "";

            return (
                name.includes(value) ||
                email.includes(value) ||
                type.includes(value)
            );
        });
    }, [memberships, search]);

    const handleCreate = async (event) => {
        event.preventDefault();

        setCreateLoading(true);
        setCreateError('');

        try {
            await createMembership(form);

            setIsCreateModalOpen(false);

            setForm({
                user_id: '',
                membership_type_id: '',
                start_date: new Date().toISOString().split('T')[0],
                status: 'active',
                price_paid: '',
                notes: '',
            });

            await loadData();
        } catch (error) {
            console.error('Create membership error:', error);

            setCreateError(
                error.response?.data?.message ??
                'Failed to create membership. Please try again.'
            );
        } finally {
            setCreateLoading(false);
        }
    };
    const handleCreateCloseModal = () => {
        setIsCreateModalOpen(false);

        setForm({
            user_id: '',
            membership_type_id: '',
            start_date: '',
            status: 'pending',
            price_paid: '',
        });
    };
    const handleRenew = async () => {
        if (!selectedMembership) return;

        setRenewLoading(true);
        setRenewError("");

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
                            selectedMembership.membership_type?.price,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setRenewError(
                    data.message ?? "Failed to renew membership."
                );
                return;
            }

            setShowRenew(false);
            setSelectedMembership(null);

            await loadData();
        } catch (error) {
            console.error("Renew membership error:", error);
            setRenewError("Something went wrong. Please try again.");
        } finally {
            setRenewLoading(false);
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
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="p-6 space-y-6">

            <MembershipCreateModal
                isOpen={isCreateModalOpen}
                form={form}
                types={membershipTypes}
                members={members}
                loadingMembers={loadingMembers}
                loading={loading}
                error={createError}
                onChange={handleChange}
                onSubmit={handleCreate}
                onClose={handleCreateCloseModal}
            />

            <MembershipRenewModal
                isOpen={showRenew}
                selectedMembership={selectedMembership}
                loading={loading}
                error={renewError}
                onClose={() => {
                    setShowRenew(false);
                    setSelectedMembership(null);
                }}
                onRenew={handleRenew}
            />

            {statistics && (
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Total Memberships"
                        value={statistics.total}
                        type="total"
                        description="All registered memberships"
                    />

                    <StatCard
                        label="Active"
                        value={statistics.active}
                        type="active"
                        description="Currently active memberships"
                    />

                    <StatCard
                        label="Pending"
                        value={statistics.pending}
                        type="pending"
                        description="Awaiting activation"
                    />

                    <StatCard
                        label="Expired"
                        value={statistics.expired}
                        type="expired"
                        description="Memberships past expiration"
                    />

                    <StatCard
                        label="Suspended"
                        value={statistics.suspended}
                        type="suspended"
                        description="Temporarily suspended"
                    />

                    <StatCard
                        label="Cancelled"
                        value={statistics.cancelled}
                        type="cancelled"
                        description="Cancelled memberships"
                    />

                    <StatCard
                        label="Expiring Soon"
                        value={statistics.expiring_7_days}
                        type="expiring"
                        description="Expiring within 7 days"
                    />
                </div>
            )}

            <div className="min-w-0 overflow-hidden border border-slate-200 bg-white shadow-sm rounded-sm">
                <PageHeader
                    title="Membership Management"
                    description="Manage membership types, member subscriptions, benefits, discounts, access rules, and renewals."
                    count={memberships.length}
                    countLabel="memberships total"
                />

                {/* <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    Add Membership
                </button> */}

                <div className="grid grid-cols-1 gap-3 border-b border-slate-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="sm:col-span-2 xl:col-span-1">
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Search Membership
                        </label>

                        <div className="relative">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                            >
                                <circle cx="11" cy="11" r="7" />
                                <path d="m20 20-4-4" />
                            </svg>

                            <input
                                type="text"
                                placeholder="Search member..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Status
                        </label>
                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(event.target.value)
                            }
                            className="w-full min-w-0 border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="expired">Expired</option>
                            <option value="suspended">Suspended</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div>
                    </div>
                    
                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={handleCreate}
                            className="inline-flex w-full items-center justify-center gap-2 bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 sm:w-auto xl:w-full"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-4 w-4"
                            >
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            Add Court
                        </button>
                    </div>
                </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="whitespace-nowrap px-5 py-4 font-semibold">
                                    Member
                                </th>
                                <th className="whitespace-nowrap px-5 py-4 font-semibold">
                                    Membership
                                </th>
                                <th className="whitespace-nowrap px-5 py-4 font-semibold">
                                    Dates
                                </th>
                                <th className="whitespace-nowrap px-5 py-4 font-semibold">
                                    Status
                                </th>
                                <th className="whitespace-nowrap px-5 py-4 font-semibold">
                                    Remaining
                                </th>
                                <th className="whitespace-nowrap px-5 py-4 font-semibold">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
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
                                            key={membership.id}
                                            className="transition-colors hover:bg-slate-50/80"
                                        >
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="font-semibold text-slate-800">
                                                    { membership.user?.name }
                                                </div>

                                                <div className="text-sm text-gray-500">
                                                    { membership.user?.email }
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="font-semibold text-slate-800">
                                                    { membership.membership_type?.name }
                                                </div>

                                                <div className="text-sm text-gray-500">
                                                    { formatCurrency(membership.price_paid) }
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                                <div>
                                                    { formatDate(membership.start_date) }
                                                </div>
                                                <div>
                                                    { formatDate(membership.expiration_date) }
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                        statusClasses[membership.status ] ?? "bg-gray-100 text-gray-700"
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
                                                            membership.days_remaining <= 7 ? "font-semibold text-red-600" : "text-gray-600"
                                                        }
                                                    >
                                                        { membership.days_remaining }{" "} days
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
        </div>
        
    );
}

