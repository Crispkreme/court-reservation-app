import React, { useEffect, useMemo, useState } from "react";

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
                return "bg-green-100 text-green-700";

            case "pending":
                return "bg-yellow-100 text-yellow-700";

            case "failed":
            case "cancelled":
                return "bg-red-100 text-red-700";

            case "refunded":
            case "partially_refunded":
                return "bg-blue-100 text-blue-700";

            default:
                return "bg-gray-100 text-gray-700";
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
            <div className="p-6">
                <div className="rounded-lg bg-white p-6 shadow">
                    Loading transaction history...
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Transaction History
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    {isAdmin
                        ? "View and manage all customer transactions."
                        : "View your court reservation transactions and refunds."}
                </p>
            </div>

            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            {/* Summary */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-white p-5 shadow">
                    <p className="text-sm text-gray-500">
                        Transactions
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                        {pagination?.total ?? transactions.length}
                    </p>
                </div>

                <div className="rounded-lg bg-white p-5 shadow">
                    <p className="text-sm text-gray-500">
                        Current Page Amount
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                        {formatCurrency(totals.amount)}
                    </p>
                </div>

                <div className="rounded-lg bg-white p-5 shadow">
                    <p className="text-sm text-gray-500">
                        Current Page Refunds
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                        {formatCurrency(totals.refund)}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 rounded-lg bg-white p-5 shadow">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Search
                        </label>

                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Transaction ID, gateway reference, member..."
                            className="w-full rounded-lg border px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Payment Status
                        </label>

                        <select
                            name="payment_status"
                            value={filters.payment_status}
                            onChange={handleFilterChange}
                            className="w-full rounded-lg border px-3 py-2"
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
                        <label className="mb-1 block text-sm font-medium">
                            Payment Method
                        </label>

                        <select
                            name="payment_method"
                            value={filters.payment_method}
                            onChange={handleFilterChange}
                            className="w-full rounded-lg border px-3 py-2"
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
                                <label className="mb-1 block text-sm font-medium">
                                    Refund Status
                                </label>

                                <select
                                    name="refund_status"
                                    value={filters.refund_status}
                                    onChange={handleFilterChange}
                                    className="w-full rounded-lg border px-3 py-2"
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
                                <label className="mb-1 block text-sm font-medium">
                                    From Date
                                </label>

                                <input
                                    type="date"
                                    name="from_date"
                                    value={filters.from_date}
                                    onChange={handleFilterChange}
                                    className="w-full rounded-lg border px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    To Date
                                </label>

                                <input
                                    type="date"
                                    name="to_date"
                                    value={filters.to_date}
                                    onChange={handleFilterChange}
                                    className="w-full rounded-lg border px-3 py-2"
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-4 flex gap-2">
                    <button
                        onClick={applyFilters}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        Apply Filters
                    </button>

                    <button
                        onClick={clearFilters}
                        className="rounded-lg border px-4 py-2 hover:bg-gray-50"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-lg bg-white shadow md:block">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                                    Transaction
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                                    Booking
                                </th>

                                {isAdmin && (
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                                        Member
                                    </th>
                                )}

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                                    Amount
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                                    Payment
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                                    Date
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                                    Status
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                                    Refund
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                                    Gateway Reference
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={
                                            isAdmin ? 9 : 8
                                        }
                                        className="px-4 py-10 text-center text-gray-500"
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
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-4">
                                                <div className="font-semibold">
                                                    {
                                                        transaction.transaction_id
                                                    }
                                                </div>

                                                <div className="text-xs text-gray-500">
                                                    ID:{" "}
                                                    {
                                                        transaction.id
                                                    }
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                {transaction.booking_id ? (
                                                    <span className="font-medium">
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
                                                <td className="px-4 py-4">
                                                    <div className="font-medium">
                                                        {
                                                            transaction
                                                                .user
                                                                ?.name
                                                        }
                                                    </div>

                                                    <div className="text-xs text-gray-500">
                                                        {
                                                            transaction
                                                                .user
                                                                ?.email
                                                        }
                                                    </div>
                                                </td>
                                            )}

                                            <td className="px-4 py-4">
                                                <div className="font-semibold">
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

                                            <td className="px-4 py-4">
                                                <div className="capitalize">
                                                    {(
                                                        transaction.payment_method ||
                                                        "-"
                                                    ).replace(
                                                        "_",
                                                        " "
                                                    )}
                                                </div>

                                                <div className="text-xs text-gray-500">
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

                                            <td className="px-4 py-4">
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass(
                                                        transaction.payment_status
                                                    )}`}
                                                >
                                                    {transaction.payment_status.replace(
                                                        "_",
                                                        " "
                                                    )}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass(
                                                        transaction.refund_status
                                                    )}`}
                                                >
                                                    {transaction.refund_status.replace(
                                                        "_",
                                                        " "
                                                    )}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="max-w-[180px] truncate font-mono text-xs">
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
                        className="rounded-lg bg-white p-4 shadow"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="font-semibold">
                                    {
                                        transaction.transaction_id
                                    }
                                </p>

                                <p className="text-xs text-gray-500">
                                    Booking #
                                    {transaction.booking_id ||
                                        "-"}
                                </p>
                            </div>

                            <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass(
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
                                <p className="text-xs text-gray-500">
                                    Member
                                </p>

                                <p className="font-medium">
                                    {
                                        transaction.user?.name
                                    }
                                </p>
                            </div>
                        )}

                        <div className="mt-3 grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-xs text-gray-500">
                                    Amount
                                </p>

                                <p className="font-semibold">
                                    {formatCurrency(
                                        transaction.amount,
                                        transaction.currency
                                    )}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Payment
                                </p>

                                <p className="capitalize">
                                    {(
                                        transaction.payment_method ||
                                        "-"
                                    ).replace("_", " ")}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Date
                                </p>

                                <p className="text-sm">
                                    {formatDate(
                                        transaction.transaction_date
                                    )}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Refund
                                </p>

                                <p className="text-sm">
                                    {formatCurrency(
                                        transaction.refund_amount,
                                        transaction.currency
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="mt-3 border-t pt-3">
                            <p className="text-xs text-gray-500">
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
                <div className="mt-6 flex items-center justify-between rounded-lg bg-white p-4 shadow">
                    <button
                        disabled={
                            !pagination.prev_page_url
                        }
                        onClick={() =>
                            loadTransactions(
                                pagination.current_page - 1
                            )
                        }
                        className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Previous
                    </button>

                    <span className="text-sm text-gray-600">
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
                        className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}