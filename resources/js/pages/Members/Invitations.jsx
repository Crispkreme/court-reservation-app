import { useEffect, useState } from "react";
import { RefreshCw, Mail, CheckCircle2, Clock3, XCircle, Timer } from "lucide-react";
import Layout from "../../components/layout/Layout";

export default function Invitations() {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadInvitations = async () => {
        setLoading(true);
        setError("");

        try {
            /*
             * GET /api/v1/player-invitations
             */
            const response = await fetch("/api/v1/player-invitations", {
                headers: {
                    Accept: "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to load invitations.");
            }

            const data = await response.json();
            const records = data.data ?? data.invitations ?? [];
            setInvitations(Array.isArray(records) ? records : []);
        } catch (err) {
            console.error(err);
            setError(err.message || "Unable to load invitations.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInvitations();
    }, []);

    const statusClass = (status) => {
        switch ((status || "").toLowerCase()) {
            case "accepted":
                return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
            case "declined":
                return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200";
            case "pending":
                return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
            case "expired":
                return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
            default:
                return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
        }
    };

    const formatDate = (date) => {
        if (!date) return "—";
        const parsed = new Date(date);
        return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleString();
    };

    const counts = {
        total: invitations.length,
        pending: invitations.filter((item) => item.status === "pending").length,
        accepted: invitations.filter((item) => item.status === "accepted").length,
        expired: invitations.filter((item) => item.status === "expired").length,
    };

    return (
        <Layout>
            <div className="min-h-full bg-slate-50/60 p-4 sm:p-6 lg:p-8">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            Player Invitations
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Track invitations sent to players.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={loadInvitations}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">Total invitations</p>
                            <span className="rounded-lg bg-blue-50 p-2 text-blue-600"><Mail size={18} /></span>
                        </div>
                        <p className="mt-3 text-2xl font-bold text-slate-900">{counts.total}</p>
                        <p className="mt-1 text-xs text-slate-500">Loaded invitation records</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">Pending</p>
                            <span className="rounded-lg bg-amber-50 p-2 text-amber-700"><Clock3 size={18} /></span>
                        </div>
                        <p className="mt-3 text-2xl font-bold text-slate-900">{counts.pending}</p>
                        <p className="mt-1 text-xs text-slate-500">Awaiting a response</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">Accepted</p>
                            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700"><CheckCircle2 size={18} /></span>
                        </div>
                        <p className="mt-3 text-2xl font-bold text-slate-900">{counts.accepted}</p>
                        <p className="mt-1 text-xs text-slate-500">Players who accepted</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">Expired</p>
                            <span className="rounded-lg bg-slate-100 p-2 text-slate-600"><Timer size={18} /></span>
                        </div>
                        <p className="mt-3 text-2xl font-bold text-slate-900">{counts.expired}</p>
                        <p className="mt-1 text-xs text-slate-500">Past the response deadline</p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">Invitation records</h2>
                            <p className="mt-1 text-sm text-slate-500">Review player, booking, status, and expiry details.</p>
                        </div>
                        <span className="text-sm text-slate-500">{invitations.length} records</span>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <RefreshCw className="mx-auto animate-spin text-blue-600" size={24} />
                            <p className="mt-3 text-sm text-slate-500">Loading invitations...</p>
                        </div>
                    ) : error ? (
                        <div className="p-10 text-center">
                            <XCircle className="mx-auto text-red-500" size={28} />
                            <p className="mt-3 font-medium text-slate-800">Could not load invitations</p>
                            <p className="mt-1 text-sm text-slate-500">{error}</p>
                            <button
                                type="button"
                                onClick={loadInvitations}
                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                <RefreshCw size={15} />
                                Try again
                            </button>
                        </div>
                    ) : invitations.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                <Mail size={22} />
                            </div>
                            <p className="mt-3 font-medium text-slate-800">No invitations found</p>
                            <p className="mt-1 text-sm text-slate-500">Invitations will appear here when they are created.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="whitespace-nowrap px-6 py-4 font-semibold">Player</th>
                                        <th className="whitespace-nowrap px-6 py-4 font-semibold">Email</th>
                                        <th className="whitespace-nowrap px-6 py-4 font-semibold">Booking</th>
                                        <th className="whitespace-nowrap px-6 py-4 font-semibold">Status</th>
                                        <th className="whitespace-nowrap px-6 py-4 font-semibold">Expires</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invitations.map((invitation) => (
                                        <tr
                                            key={invitation.id}
                                            className="border-t border-slate-100 transition-colors hover:bg-slate-50"
                                        >
                                            <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">
                                                {invitation.name || "—"}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {invitation.email || "—"}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                                                {invitation.booking_id ? `#${invitation.booking_id}` : "—"}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusClass(invitation.status)}`}>
                                                    {invitation.status || "unknown"}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                                                {formatDate(invitation.expires_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
