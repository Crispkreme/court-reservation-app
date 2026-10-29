import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import {
    Users,
    UserPlus,
    Search,
    RefreshCw,
    Eye,
    CalendarDays,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

export default function Members() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const loadMembers = async () => {
        setLoading(true);
        setError("");

        try {
            const params = new URLSearchParams();

            if (search.trim()) {
                params.append("search", search.trim());
            }

            if (status) {
                params.append("status", status);
            }

            const query = params.toString();
            const response = await fetch(
                `/api/v1/members${query ? `?${query}` : ""}`,
                {
                    headers: { Accept: "application/json" },
                    credentials: "include",
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || "Failed to load members.");
            }

            setMembers(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load members:", err);
            setError(err.message || "Unable to load members. Please try again.");
            setMembers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadMembers();
        }, 300);

        return () => clearTimeout(timer);
    }, [search, status]);

    useEffect(() => {
        setPage(1);
    }, [search, status]);

    const getStatusClass = (value) => {
        switch ((value || "inactive").toLowerCase()) {
            case "active":
                return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20";
            case "expired":
                return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20";
            case "suspended":
                return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20";
            case "inactive":
                return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20";
            default:
                return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20";
        }
    };

    const filteredCount = members.length;
    const totalPages = Math.max(1, Math.ceil(filteredCount / perPage));
    const safePage = Math.min(page, totalPages);
    const paginatedMembers = members.slice((safePage - 1) * perPage, safePage * perPage);
    const activeCount = members.filter((member) => (member.membership_status || "").toLowerCase() === "active").length;
    const expiredCount = members.filter((member) => (member.membership_status || "").toLowerCase() === "expired").length;
    const suspendedCount = members.filter((member) => (member.membership_status || "").toLowerCase() === "suspended").length;

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                                <Users size={22} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Members</h1>
                                <p className="mt-1 text-sm text-slate-500">
                                    Manage registered members and their memberships.
                                </p>
                            </div>
                        </div>

                        <Link
                            to="/members/create"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        >
                            <UserPlus size={17} />
                            Register Member
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <SummaryCard label="Total Members" value={members.length} icon={<Users size={19} />} />
                        <SummaryCard label="Active Members" value={activeCount} icon={<UserPlus size={19} />} />
                        <SummaryCard label="Expired Memberships" value={expiredCount} icon={<CalendarDays size={19} />} />
                        <SummaryCard label="Suspended Members" value={suspendedCount} icon={<AlertCircle size={19} />} />
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900">Member Directory</h2>
                                <p className="mt-1 text-sm text-slate-500">Search members and filter by membership status.</p>
                            </div>
                            <button
                                type="button"
                                onClick={loadMembers}
                                disabled={loading}
                                className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                                Refresh
                            </button>
                        </div>

                        <div className="mb-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                            <div className="relative">
                                <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search members..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">All statuses</option>
                                <option value="active">Active</option>
                                <option value="expired">Expired</option>
                                <option value="suspended">Suspended</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {error && (
                            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="overflow-hidden rounded-xl border border-slate-200">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
                                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                    <p className="text-sm text-slate-500">Loading members...</p>
                                </div>
                            ) : members.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 text-center">
                                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                        <Users size={22} />
                                    </div>
                                    <p className="font-semibold text-slate-800">No members found</p>
                                    <p className="mt-1 max-w-sm text-sm text-slate-500">
                                        Try changing your search or status filter, or register a new member.
                                    </p>
                                    <Link
                                        to="/members/create"
                                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                                    >
                                        <UserPlus size={16} />
                                        Register Member
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[850px] text-left text-sm">
                                        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                            <tr>
                                                <th className="px-5 py-3.5 font-semibold">Member</th>
                                                <th className="px-5 py-3.5 font-semibold">Member No.</th>
                                                <th className="px-5 py-3.5 font-semibold">Contact</th>
                                                <th className="px-5 py-3.5 font-semibold">Status</th>
                                                <th className="px-5 py-3.5 font-semibold">Expiration</th>
                                                <th className="px-5 py-3.5 text-right font-semibold">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {paginatedMembers.map((member) => (
                                                <tr key={member.id} className="transition hover:bg-slate-50/80">
                                                    <td className="px-5 py-4">
                                                        <div className="font-semibold text-slate-900">{member.full_name || "—"}</div>
                                                        <div className="mt-0.5 text-xs text-slate-500">{member.email || "No email"}</div>
                                                    </td>
                                                    <td className="px-5 py-4 text-slate-600">{member.member_number || "—"}</td>
                                                    <td className="px-5 py-4 text-slate-600">{member.phone || "—"}</td>
                                                    <td className="px-5 py-4">
                                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClass(member.membership_status)}`}>
                                                            {member.membership_status || "inactive"}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-slate-600">
                                                        {member.membership_expiration_date
                                                            ? new Date(member.membership_expiration_date).toLocaleDateString()
                                                            : "No expiration"}
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        <Link
                                                            to={`/members/${member.id}`}
                                                            aria-label={`View ${member.full_name || "member"}`}
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                                        >
                                                            <Eye size={15} />
                                                            View
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {!loading && members.length > 0 && (
                            <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="text-sm text-slate-500">
                                    Showing <span className="font-semibold text-slate-700">{(safePage - 1) * perPage + 1}</span>
                                    {" "}to{" "}
                                    <span className="font-semibold text-slate-700">{Math.min(safePage * perPage, filteredCount)}</span>
                                    {" "}of{" "}
                                    <span className="font-semibold text-slate-700">{filteredCount}</span> members
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <select
                                        value={perPage}
                                        onChange={(e) => {
                                            setPerPage(Number(e.target.value));
                                            setPage(1);
                                        }}
                                        aria-label="Rows per page"
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value={5}>5 per page</option>
                                        <option value={10}>10 per page</option>
                                        <option value={25}>25 per page</option>
                                        <option value={50}>50 per page</option>
                                    </select>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                                            disabled={safePage <= 1}
                                            aria-label="Previous page"
                                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <ChevronLeft size={17} />
                                        </button>
                                        <span className="min-w-16 text-center text-sm text-slate-600">
                                            {safePage} / {totalPages}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                                            disabled={safePage >= totalPages}
                                            aria-label="Next page"
                                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <ChevronRight size={17} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

function SummaryCard({ label, value, icon }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    {icon}
                </div>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
    );
}
