import React, { useEffect, useMemo, useState } from "react";
import {
    Activity,
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    RefreshCw,
    Search,
    Wallet,
} from "lucide-react";
import Layout from "../../components/layout/Layout";

const API = "/api/v1";

export default function TransactionHistory() {
    const [transactions, setTransactions] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [user, setUser] = useState(null);

    const [filters, setFilters] = useState({
        search: "",
        payment_status: "",
        refund_status: "",
        payment_method: "",
        from_date: "",
        to_date: "",
    });

    const token = localStorage.getItem("auth_token");

    const isAdmin = Boolean(user?.is_admin);

    const loadUser = async () => {
        try {
            const response = await fetch(`${API}/user`, {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data);
            }
        } catch (err) {
            console.error("Failed to load user:", err);
        }
    };

    const loadTransactions = async (page = 1) => {
        setLoading(true);
        setError("");

        try {
            const params = new URLSearchParams();

            params.set("page", page);
            params.set("per_page", "15");

            Object.entries(filters).forEach(([key, value]) => {
                if (value) {
                    params.set(key, value);
                }
            });

            const response = await fetch(
                `${API}/transactions?${params.toString()}`,
                {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to load transaction history."
                );
            }

            setTransactions(data.data || []);
            setPagination(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    useEffect(() => {
        if (user) {
            loadTransactions();
        }
    }, [user]);

    const handleFilterChange = (event) => {
        const { name, value } = event.target;

        setFilters((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const applyFilters = () => {
        loadTransactions(1);
    };

    const clearFilters = () => {
        const emptyFilters = {
            search: "",
            payment_status: "",
            refund_status: "",
            payment_method: "",
            from_date: "",
            to_date: "",
        };

        setFilters(emptyFilters);

        setTimeout(() => {
            loadTransactions(1);
        }, 0);
    };

    const formatCurrency = (amount, currency = "PHP") => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency,
        }).format(Number(amount || 0));
    };

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleString("en-PH", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const statusClass = (status) => {
        switch (status) {
            case "paid":
            case "processed":
                return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
            case "pending":
                return "bg-amber-50 text-amber-700 ring-amber-600/20";
            case "failed":
            case "cancelled":
                return "bg-red-50 text-red-700 ring-red-600/20";
            case "refunded":
            case "partially_refunded":
                return "bg-blue-50 text-blue-700 ring-blue-600/20";
            default:
                return "bg-slate-100 text-slate-700 ring-slate-500/20";
        }
    };

    const totals = useMemo(() => {
        return transactions.reduce(
            (result, transaction) => {
                result.amount += Number(
                    transaction.amount || 0
                );

                result.refund += Number(
                    transaction.refund_amount || 0
                );

                return result;
            },
            {
                amount: 0,
                refund: 0,
            }
        );
    }, [transactions]);

    if (loading && !transactions.length) {
        return (
            <Layout>
                <div className="min-h-full bg-slate-50/70 p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto flex max-w-screen-2xl items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-16 text-sm text-slate-500 shadow-sm">
                        <RefreshCw size={18} className="animate-spin text-blue-600" />
                        Loading transaction history...
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
        <div className="min-h-full bg-slate-50/70 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-screen-2xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Transaction History
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {isAdmin
                            ? "View and manage all customer transactions."
                            : "View your court reservation transactions and refunds."}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => loadTransactions(pagination?.current_page || 1)}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Transactions
                    </p>

                    <p className="mt-3 text-2xl font-bold text-slate-900">
                        {pagination?.total ?? transactions.length}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Current Page Amount
                    </p>

                    <p className="mt-3 text-2xl font-bold text-slate-900">
                        {formatCurrency(totals.amount)}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Current Page Refunds
                    </p>

                    <p className="mt-3 text-2xl font-bold text-slate-900">
                        {formatCurrency(totals.refund)}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Search
                        </label>

                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Transaction ID, gateway reference, member..."
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Payment Status
                        </label>

                        <select
                            name="payment_status"
                            value={filters.payment_status}
                            onChange={handleFilterChange}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">All statuses</option>
                            <option value="pending">
                                Pending
                            </option>
                            <option value="paid">
                                Paid
                            </option>
                            <option value="failed">
                                Failed
                            </option>
                            <option value="cancelled">
                                Cancelled
                            </option>
                            <option value="refunded">
                                Refunded
                            </option>
                            <option value="partially_refunded">
                                Partially Refunded
                            </option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Payment Method
                        </label>

                        <select
                            name="payment_method"
                            value={filters.payment_method}
                            onChange={handleFilterChange}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">All methods</option>
                            <option value="card">Card</option>
                            <option value="paypal">
                                PayPal
                            </option>
                            <option value="e_wallet">
                                E-Wallet
                            </option>
                            <option value="cash">Cash</option>
                            <option value="bank_transfer">
                                Bank Transfer
                            </option>
                        </select>
                    </div>

                    {isAdmin && (
                        <>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Refund Status
                                </label>

                                <select
                                    name="refund_status"
                                    value={filters.refund_status}
                                    onChange={handleFilterChange}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="">
                                        All refund statuses
                                    </option>
                                    <option value="none">
                                        None
                                    </option>
                                    <option value="pending">
                                        Pending
                                    </option>
                                    <option value="processed">
                                        Processed
                                    </option>
                                    <option value="failed">
                                        Failed
                                    </option>
                                    <option value="cancelled">
                                        Cancelled
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    From Date
                                </label>

                                <input
                                    type="date"
                                    name="from_date"
                                    value={filters.from_date}
                                    onChange={handleFilterChange}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    To Date
                                </label>

                                <input
                                    type="date"
                                    name="to_date"
                                    value={filters.to_date}
                                    onChange={handleFilterChange}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                    <button
                        onClick={applyFilters}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                        <Search size={16} /> Apply Filters
                    </button>

                    <button
                        onClick={clearFilters}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Transaction
                                </th>

                                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Booking
                                </th>

                                {isAdmin && (
                                    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Member
                                    </th>
                                )}

                                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Amount
                                </th>

                                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Payment
                                </th>

                                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Date
                                </th>

                                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Status
                                </th>

                                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Refund
                                </th>

                                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Gateway Reference
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={
                                            isAdmin ? 9 : 8
                                        }
                                        className="px-5 py-12 text-center text-sm text-slate-500"
                                    >
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map(
                                    (transaction) => (
                                        <tr
                                            key={
                                                transaction.id
                                            }
                                            className="transition hover:bg-slate-50/80"
                                        >
                                            <td className="px-5 py-4 text-sm text-slate-700">
                                                <div className="font-semibold text-slate-900">
                                                    {
                                                        transaction.transaction_id
                                                    }
                                                </div>

                                                <div className="mt-1 text-xs text-slate-500">
                                                    ID:{" "}
                                                    {
                                                        transaction.id
                                                    }
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-700">
                                                {transaction.booking_id ? (
                                                    <span className="font-medium text-slate-800">
                                                        #
                                                        {
                                                            transaction.booking_id
                                                        }
                                                    </span>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>

                                            {isAdmin && (
                                                <td className="px-5 py-4 text-sm text-slate-700">
                                                    <div className="font-medium text-slate-800">
                                                        {
                                                            transaction
                                                                .user
                                                                ?.name
                                                        }
                                                    </div>

                                                    <div className="mt-1 text-xs text-slate-500">
                                                        {
                                                            transaction
                                                                .user
                                                                ?.email
                                                        }
                                                    </div>
                                                </td>
                                            )}

                                            <td className="px-5 py-4 text-sm text-slate-700">
                                                <div className="font-semibold text-slate-900">
                                                    {formatCurrency(
                                                        transaction.amount,
                                                        transaction.currency
                                                    )}
                                                </div>

                                                {Number(
                                                    transaction.refund_amount
                                                ) >
                                                    0 && (
                                                    <div className="text-xs text-red-600">
                                                        Refund:{" "}
                                                        {formatCurrency(
                                                            transaction.refund_amount,
                                                            transaction.currency
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-700">
                                                <div className="capitalize text-slate-700">
                                                    {(
                                                        transaction.payment_method ||
                                                        "-"
                                                    ).replace(
                                                        "_",
                                                        " "
                                                    )}
                                                </div>

                                                <div className="mt-1 text-xs text-slate-500">
                                                    {
                                                        transaction.gateway
                                                    }
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 text-sm">
                                                {formatDate(
                                                    transaction.transaction_date
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-700">
                                                <span
                                                    className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass(
                                                        transaction.payment_status
                                                    )}`}
                                                >
                                                    {transaction.payment_status.replace(
                                                        "_",
                                                        " "
                                                    )}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-700">
                                                <span
                                                    className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass(
                                                        transaction.refund_status
                                                    )}`}
                                                >
                                                    {transaction.refund_status.replace(
                                                        "_",
                                                        " "
                                                    )}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-700">
                                                <div className="max-w-[180px] truncate font-mono text-xs text-slate-500">
                                                    {transaction.gateway_reference ||
                                                        "-"}
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

            {/* Mobile cards */}
            <div className="space-y-4 md:hidden">
                {transactions.map((transaction) => (
                    <div
                        key={transaction.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="font-semibold text-slate-900">
                                    {
                                        transaction.transaction_id
                                    }
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Booking #
                                    {transaction.booking_id ||
                                        "-"}
                                </p>
                            </div>

                            <span
                                className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass(
                                    transaction.payment_status
                                )}`}
                            >
                                {
                                    transaction.payment_status
                                }
                            </span>
                        </div>

                        {isAdmin && (
                            <div className="mt-3">
                                <p className="mt-1 text-xs text-slate-500">
                                    Member
                                </p>

                                <p className="font-medium text-slate-800">
                                    {
                                        transaction.user?.name
                                    }
                                </p>
                            </div>
                        )}

                        <div className="mt-3 grid grid-cols-2 gap-3">
                            <div>
                                <p className="mt-1 text-xs text-slate-500">
                                    Amount
                                </p>

                                <p className="font-semibold text-slate-900">
                                    {formatCurrency(
                                        transaction.amount,
                                        transaction.currency
                                    )}
                                </p>
                            </div>

                            <div>
                                <p className="mt-1 text-xs text-slate-500">
                                    Payment
                                </p>

                                <p className="capitalize text-slate-700">
                                    {(
                                        transaction.payment_method ||
                                        "-"
                                    ).replace("_", " ")}
                                </p>
                            </div>

                            <div>
                                <p className="mt-1 text-xs text-slate-500">
                                    Date
                                </p>

                                <p className="text-sm text-slate-700">
                                    {formatDate(
                                        transaction.transaction_date
                                    )}
                                </p>
                            </div>

                            <div>
                                <p className="mt-1 text-xs text-slate-500">
                                    Refund
                                </p>

                                <p className="text-sm text-slate-700">
                                    {formatCurrency(
                                        transaction.refund_amount,
                                        transaction.currency
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="mt-3 border-t border-slate-100 pt-3">
                            <p className="mt-1 text-xs text-slate-500">
                                Gateway Reference
                            </p>

                            <p className="break-all font-mono text-xs">
                                {transaction.gateway_reference ||
                                    "-"}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
                <div className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <button
                        disabled={
                            !pagination.prev_page_url
                        }
                        onClick={() =>
                            loadTransactions(
                                pagination.current_page - 1
                            )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ChevronLeft size={16} /> Previous
                    </button>

                    <span className="text-sm text-slate-500">
                        Page {pagination.current_page} of{" "}
                        {pagination.last_page}
                    </span>

                    <button
                        disabled={
                            !pagination.next_page_url
                        }
                        onClick={() =>
                            loadTransactions(
                                pagination.current_page + 1
                            )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            )}
            </div>
        </div>
        </Layout>
    );
}