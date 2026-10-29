import React, { useEffect, useRef, useState } from "react";
import {
    Activity,
    CheckCircle2,
    CreditCard,
    DollarSign,
    RefreshCw,
    Wallet,
    AlertCircle,
    Check,
    X,
    RotateCcw,
    ExternalLink,
} from "lucide-react";
import Layout from "../../components/layout/Layout";

const API = "/api/v1";

export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [selectedPayment, setSelectedPayment] =
        useState(null);

    const paypalContainer =
        useRef(null);

    const token =
        localStorage.getItem("auth_token");

    const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };

    const loadPayments = async () => {
        try {
            setLoading(true);

            const response = await fetch(
                `${API}/payments`,
                {
                    headers,
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Unable to load payments."
                );
            }

            setPayments(data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPayments();
    }, []);

    const createPayment = async (
        bookingId,
        paymentMethod
    ) => {
        const response = await fetch(
            `${API}/payments`,
            {
                method: "POST",
                headers,
                credentials: "include",
                body: JSON.stringify({
                    booking_id: bookingId,
                    payment_method:
                        paymentMethod,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                    "Unable to create payment."
            );
        }

        return data.payment;
    };

    const loadPaypalSdk = () => {
        return new Promise(
            (resolve, reject) => {
                if (window.paypal) {
                    resolve(window.paypal);
                    return;
                }

                const clientId =
                    import.meta.env
                        .VITE_PAYPAL_CLIENT_ID;

                if (!clientId) {
                    reject(
                        new Error(
                            "VITE_PAYPAL_CLIENT_ID is not configured."
                        )
                    );

                    return;
                }

                const script =
                    document.createElement("script");

                script.src =
                    `https://www.sandbox.paypal.com/sdk/js?` +
                    `client-id=${clientId}` +
                    `&currency=USD` +
                    `&components=buttons`;

                script.onload = () => {
                    resolve(window.paypal);
                };

                script.onerror = () => {
                    reject(
                        new Error(
                            "Unable to load PayPal Sandbox."
                        )
                    );
                };

                document.body.appendChild(script);
            }
        );
    };

    const startPaypalPayment = async (
        payment
    ) => {
        try {
            setError("");
            setMessage("");
            setProcessing(true);

            setSelectedPayment(payment);

            const paypal =
                await loadPaypalSdk();

            const createOrderResponse =
                await fetch(
                    `${API}/payments/paypal/create-order`,
                    {
                        method: "POST",
                        headers,
                        credentials: "include",
                        body: JSON.stringify({
                            payment_id:
                                payment.id,
                        }),
                    }
                );

            const order =
                await createOrderResponse.json();

            if (!createOrderResponse.ok) {
                throw new Error(
                    order.message ||
                        "Unable to create PayPal order."
                );
            }

            paypal
                .Buttons({
                    createOrder: () => {
                        return order.id;
                    },

                    onApprove: async (
                        data
                    ) => {
                        const response =
                            await fetch(
                                `${API}/payments/paypal/capture-order`,
                                {
                                    method: "POST",
                                    headers,
                                    credentials:
                                        "include",
                                    body:
                                        JSON.stringify(
                                            {
                                                payment_id:
                                                    payment.id,
                                                order_id:
                                                    data.orderID,
                                            }
                                        ),
                                }
                            );

                        const result =
                            await response.json();

                        if (!response.ok) {
                            throw new Error(
                                result.message ||
                                    "Payment capture failed."
                            );
                        }

                        setMessage(
                            "Payment completed successfully."
                        );

                        setSelectedPayment(
                            result.payment
                        );

                        await loadPayments();
                    },

                    onCancel: () => {
                        setMessage(
                            "PayPal payment was cancelled."
                        );
                    },

                    onError: (
                        paypalError
                    ) => {
                        console.error(
                            paypalError
                        );

                        setError(
                            "PayPal payment failed. Please try again."
                        );
                    },
                })
                .render(
                    paypalContainer.current
                );
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const confirmManualPayment = async (
        payment
    ) => {
        try {
            setProcessing(true);
            setError("");

            const response =
                await fetch(
                    `${API}/payments/${payment.id}/manual-confirm`,
                    {
                        method: "POST",
                        headers,
                        credentials: "include",
                        body: JSON.stringify({
                            notes:
                                "Confirmed by administrator.",
                        }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Unable to confirm payment."
                );
            }

            setMessage(
                "Manual payment confirmed."
            );

            await loadPayments();
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const refundPayment = async (
        payment
    ) => {
        const maxRefund =
            Number(payment.amount) -
            Number(payment.refunded_amount);

        const amount = window.prompt(
            `Refund amount (maximum ${maxRefund.toFixed(
                2
            )}):`,
            maxRefund.toFixed(2)
        );

        if (!amount) {
            return;
        }

        const numericAmount =
            Number(amount);

        if (
            Number.isNaN(numericAmount) ||
            numericAmount <= 0 ||
            numericAmount > maxRefund
        ) {
            setError(
                "Invalid refund amount."
            );

            return;
        }

        try {
            setProcessing(true);
            setError("");

            const response =
                await fetch(
                    `${API}/payments/${payment.id}/refund`,
                    {
                        method: "POST",
                        headers,
                        credentials: "include",
                        body: JSON.stringify({
                            amount:
                                numericAmount,
                            reason:
                                "Court booking refund",
                        }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Refund failed."
                );
            }

            setMessage(
                "Refund processed successfully."
            );

            await loadPayments();
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const reconcilePayment = async (
        payment
    ) => {
        try {
            setProcessing(true);
            setError("");

            const response =
                await fetch(
                    `${API}/payments/reconcile`,
                    {
                        method: "POST",
                        headers,
                        credentials: "include",
                        body: JSON.stringify({
                            payment_id:
                                payment.id,
                        }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Reconciliation failed."
                );
            }

            setMessage(
                "Payment reconciliation completed."
            );

            await loadPayments();
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const statusClass = (status) => {
        switch (status) {
            case "PAID":
                return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
            case "FAILED":
                return "bg-red-50 text-red-700 ring-red-600/20";
            case "REFUNDED":
                return "bg-violet-50 text-violet-700 ring-violet-600/20";
            case "PARTIALLY_REFUNDED":
                return "bg-amber-50 text-amber-700 ring-amber-600/20";
            case "PENDING":
                return "bg-blue-50 text-blue-700 ring-blue-600/20";
            default:
                return "bg-slate-100 text-slate-700 ring-slate-500/20";
        }
    };

    const formatAmount = (amount) =>
        Number(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const paidCount = payments.filter((payment) => payment.status === "PAID").length;
    const pendingCount = payments.filter((payment) => payment.status === "PENDING").length;
    const refundedTotal = payments.reduce(
        (total, payment) => total + Number(payment.refunded_amount || 0),
        0
    );
    const totalCollected = payments.reduce(
        (total, payment) =>
            total + (["PAID", "PARTIALLY_REFUNDED"].includes(payment.status)
                ? Number(payment.amount || 0) - Number(payment.refunded_amount || 0)
                : 0),
        0
    );

    const outstandingCount = payments.filter(
        (payment) => payment.status === "PENDING"
    ).length;

    const filteredPayments = statusFilter === "ALL"
        ? payments
        : statusFilter === "OUTSTANDING"
            ? payments.filter((payment) => payment.status === "PENDING")
            : payments.filter((payment) => payment.status === statusFilter);

    return (
        <Layout>
            <div className="min-h-full bg-slate-50/70 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-screen-2xl space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Payments
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Manage online and manual payments, refunds, and payment reconciliation.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <button
                                type="button"
                                onClick={() => setStatusFilter((current) => current === "OUTSTANDING" ? "ALL" : "OUTSTANDING")}
                                aria-pressed={statusFilter === "OUTSTANDING"}
                                className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold shadow-sm transition ${
                                    statusFilter === "OUTSTANDING"
                                        ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
                                        : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                }`}
                            >
                                <Wallet size={16} />
                                Outstanding Payments
                                <span className={`rounded-full px-2 py-0.5 text-xs ${
                                    statusFilter === "OUTSTANDING" ? "bg-white/20 text-white" : "bg-blue-100 text-blue-800"
                                }`}>
                                    {outstandingCount}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={loadPayments}
                                disabled={loading}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {message && (
                        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                            <p className="flex-1">{message}</p>
                            <button type="button" onClick={() => setMessage("")} className="rounded p-1 hover:bg-emerald-100" aria-label="Dismiss message">
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                            <AlertCircle size={18} className="mt-0.5 shrink-0" />
                            <p className="flex-1">{error}</p>
                            <button type="button" onClick={() => setError("")} className="rounded p-1 hover:bg-red-100" aria-label="Dismiss error">
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-slate-500">Total payments</p>
                                <span className="rounded-lg bg-blue-50 p-2 text-blue-600"><CreditCard size={19} /></span>
                            </div>
                            <p className="mt-3 text-2xl font-bold text-slate-900">{payments.length}</p>
                            <p className="mt-1 text-xs text-slate-500">All recorded transactions</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-slate-500">Paid payments</p>
                                <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><CheckCircle2 size={19} /></span>
                            </div>
                            <p className="mt-3 text-2xl font-bold text-slate-900">{paidCount}</p>
                            <p className="mt-1 text-xs text-slate-500">Status marked as paid</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-slate-500">Pending payments</p>
                                <span className="rounded-lg bg-amber-50 p-2 text-amber-600"><Activity size={19} /></span>
                            </div>
                            <p className="mt-3 text-2xl font-bold text-slate-900">{pendingCount}</p>
                            <p className="mt-1 text-xs text-slate-500">Awaiting confirmation</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-slate-500">Net collected</p>
                                <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600"><DollarSign size={19} /></span>
                            </div>
                            <p className="mt-3 text-2xl font-bold text-slate-900">{formatAmount(totalCollected)}</p>
                            <p className="mt-1 text-xs text-slate-500">After recorded refunds</p>
                        </div>
                    </div>

                    {selectedPayment && (
                        <section className="overflow-hidden rounded-xl border border-blue-200 bg-white shadow-sm">
                            <div className="flex flex-col gap-3 border-b border-slate-200 bg-blue-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">PayPal Sandbox Checkout</h2>
                                    <p className="mt-1 text-sm text-slate-600">Complete the selected payment using PayPal Sandbox.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedPayment(null)}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    <X size={16} /> Close checkout
                                </button>
                            </div>
                            <div className="p-5">
                                <div className="mb-4 grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-lg bg-slate-50 p-3">
                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Payment reference</p>
                                        <p className="mt-1 break-all font-semibold text-slate-900">{selectedPayment.payment_reference || "—"}</p>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 p-3">
                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Amount</p>
                                        <p className="mt-1 font-semibold text-slate-900">{selectedPayment.currency || ""} {formatAmount(selectedPayment.amount)}</p>
                                    </div>
                                </div>
                                <div ref={paypalContainer} className="max-w-md" />
                            </div>
                        </section>
                    )}

                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Payment transactions</h2>
                                <p className="mt-1 text-sm text-slate-500">Review payment status and manage payment actions.</p>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <label htmlFor="payment-status-filter" className="text-sm font-medium text-slate-600">
                                    Payment status
                                </label>
                                <select
                                    id="payment-status-filter"
                                    value={statusFilter}
                                    onChange={(event) => setStatusFilter(event.target.value)}
                                    className="min-w-[190px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="ALL">All payments</option>
                                    <option value="OUTSTANDING">Outstanding / Pending</option>
                                    <option value="PAID">Paid</option>
                                    <option value="FAILED">Failed</option>
                                    <option value="REFUNDED">Refunded</option>
                                    <option value="PARTIALLY_REFUNDED">Partially refunded</option>
                                </select>
                                <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                    {filteredPayments.length} {filteredPayments.length === 1 ? "record" : "records"}
                                </span>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-slate-500">
                                <RefreshCw size={18} className="animate-spin text-blue-600" />
                                Loading payments...
                            </div>
                        ) : filteredPayments.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                    <Wallet size={22} />
                                </div>
                                <h3 className="mt-4 text-sm font-semibold text-slate-900">No matching payments</h3>
                                <p className="mt-1 text-sm text-slate-500">{statusFilter === "ALL" ? "Payments will appear here once transactions are recorded." : "Try selecting a different payment status filter."}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-[950px] w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            {["Reference", "Booking", "Method", "Amount", "Refunded", "Status", "Actions"].map((heading) => (
                                                <th key={heading} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                    {heading}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredPayments.map((payment) => (
                                            <tr key={payment.id} className="transition hover:bg-slate-50/80">
                                                <td className="px-5 py-4">
                                                    <span className="font-semibold text-slate-900">{payment.payment_reference || "—"}</span>
                                                    <p className="mt-1 text-xs text-slate-500">ID: {payment.id}</p>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-slate-700">{payment.booking?.booking_reference || "—"}</td>
                                                <td className="px-5 py-4">
                                                    <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                                        {(payment.payment_method || "—").replaceAll("_", " ")}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900">
                                                    {payment.currency || ""} {formatAmount(payment.amount)}
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                                                    {payment.currency || ""} {formatAmount(payment.refunded_amount)}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass(payment.status)}`}>
                                                        {(payment.status || "UNKNOWN").replaceAll("_", " ")}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex min-w-[240px] flex-wrap items-center gap-2">
                                                        {payment.status === "PENDING" && payment.payment_method === "PAYPAL" && (
                                                            <button type="button" disabled={processing} onClick={() => startPaypalPayment(payment)} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                                                                <ExternalLink size={14} /> PayPal
                                                            </button>
                                                        )}
                                                        {payment.status === "PENDING" && payment.payment_method !== "PAYPAL" && (
                                                            <button type="button" disabled={processing} onClick={() => confirmManualPayment(payment)} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                                                                <Check size={14} /> Confirm
                                                            </button>
                                                        )}
                                                        {(payment.status === "PAID" || payment.status === "PARTIALLY_REFUNDED") && (
                                                            <button type="button" disabled={processing} onClick={() => refundPayment(payment)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                                                                <RotateCcw size={14} /> Refund
                                                            </button>
                                                        )}
                                                        {payment.gateway === "PAYPAL" && payment.gateway_order_id && (
                                                            <button type="button" disabled={processing} onClick={() => reconcilePayment(payment)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                                                                <RefreshCw size={14} /> Reconcile
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50/70 px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                            <span>Showing {filteredPayments.length} of {payments.length} payment {payments.length === 1 ? "record" : "records"}</span>
                            <span>Total refunded: <strong className="font-semibold text-slate-700">{formatAmount(refundedTotal)}</strong></span>
                        </div>
                    </section>
                </div>
            </div>
        </Layout>
    );
}
