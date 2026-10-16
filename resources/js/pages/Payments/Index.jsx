import React, {
    useEffect,
    useRef,
    useState,
} from "react";

const API = "/api/v1";

export default function PaymentIndex() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

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
                return "text-green-600";

            case "FAILED":
                return "text-red-600";

            case "REFUNDED":
                return "text-purple-600";

            case "PARTIALLY_REFUNDED":
                return "text-orange-600";

            default:
                return "text-yellow-600";
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">
                    Payments
                </h1>

                <p className="text-gray-600">
                    Manage online, manual, refund,
                    and payment reconciliation.
                </p>
            </div>

            {message && (
                <div className="mb-4 rounded bg-green-100 p-3 text-green-800">
                    {message}
                </div>
            )}

            {error && (
                <div className="mb-4 rounded bg-red-100 p-3 text-red-800">
                    {error}
                </div>
            )}

            {selectedPayment && (
                <div className="mb-6 rounded-lg border bg-white p-5 shadow">
                    <h2 className="mb-3 text-lg font-semibold">
                        PayPal Sandbox Checkout
                    </h2>

                    <div className="mb-4">
                        <p>
                            Payment Reference:{" "}
                            <strong>
                                {
                                    selectedPayment.payment_reference
                                }
                            </strong>
                        </p>

                        <p>
                            Amount:{" "}
                            <strong>
                                {
                                    selectedPayment.currency
                                }{" "}
                                {
                                    selectedPayment.amount
                                }
                            </strong>
                        </p>
                    </div>

                    <div
                        ref={
                            paypalContainer
                        }
                    />

                    <button
                        type="button"
                        className="mt-3 rounded bg-gray-200 px-4 py-2"
                        onClick={() =>
                            setSelectedPayment(
                                null
                            )
                        }
                    >
                        Close
                    </button>
                </div>
            )}

            <div className="overflow-x-auto rounded-lg border bg-white">
                {loading ? (
                    <div className="p-6">
                        Loading payments...
                    </div>
                ) : (
                    <table className="min-w-full">
                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left">
                                    Reference
                                </th>

                                <th className="px-4 py-3 text-left">
                                    Booking
                                </th>

                                <th className="px-4 py-3 text-left">
                                    Method
                                </th>

                                <th className="px-4 py-3 text-left">
                                    Amount
                                </th>

                                <th className="px-4 py-3 text-left">
                                    Refunded
                                </th>

                                <th className="px-4 py-3 text-left">
                                    Status
                                </th>

                                <th className="px-4 py-3 text-left">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {payments.map(
                                (payment) => (
                                    <tr
                                        key={
                                            payment.id
                                        }
                                        className="border-b"
                                    >
                                        <td className="px-4 py-3">
                                            {
                                                payment.payment_reference
                                            }
                                        </td>

                                        <td className="px-4 py-3">
                                            {
                                                payment
                                                    .booking
                                                    ?.booking_reference
                                            }
                                        </td>

                                        <td className="px-4 py-3">
                                            {
                                                payment.payment_method
                                            }
                                        </td>

                                        <td className="px-4 py-3">
                                            {
                                                payment.currency
                                            }{" "}
                                            {
                                                payment.amount
                                            }
                                        </td>

                                        <td className="px-4 py-3">
                                            {
                                                payment.refunded_amount
                                            }
                                        </td>

                                        <td
                                            className={`px-4 py-3 font-semibold ${statusClass(
                                                payment.status
                                            )}`}
                                        >
                                            {
                                                payment.status
                                            }
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-2">
                                                {payment.status ===
                                                    "PENDING" &&
                                                    payment.payment_method ===
                                                        "PAYPAL" && (
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                processing
                                                            }
                                                            onClick={() =>
                                                                startPaypalPayment(
                                                                    payment
                                                                )
                                                            }
                                                            className="rounded bg-blue-600 px-3 py-2 text-sm text-white"
                                                        >
                                                            Pay with PayPal
                                                        </button>
                                                    )}

                                                {payment.status ===
                                                    "PENDING" &&
                                                    payment.payment_method !==
                                                        "PAYPAL" && (
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                processing
                                                            }
                                                            onClick={() =>
                                                                confirmManualPayment(
                                                                    payment
                                                                )
                                                            }
                                                            className="rounded bg-green-600 px-3 py-2 text-sm text-white"
                                                        >
                                                            Confirm
                                                        </button>
                                                    )}

                                                {(payment.status ===
                                                    "PAID" ||
                                                    payment.status ===
                                                        "PARTIALLY_REFUNDED") && (
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            processing
                                                        }
                                                        onClick={() =>
                                                            refundPayment(
                                                                payment
                                                            )
                                                        }
                                                        className="rounded bg-red-600 px-3 py-2 text-sm text-white"
                                                    >
                                                        Refund
                                                    </button>
                                                )}

                                                {payment.gateway ===
                                                    "PAYPAL" &&
                                                    payment.gateway_order_id && (
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                processing
                                                            }
                                                            onClick={() =>
                                                                reconcilePayment(
                                                                    payment
                                                                )
                                                            }
                                                            className="rounded bg-gray-700 px-3 py-2 text-sm text-white"
                                                        >
                                                            Reconcile
                                                        </button>
                                                    )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                )}

                {!loading &&
                    payments.length === 0 && (
                        <div className="p-6 text-center text-gray-500">
                            No payments found.
                        </div>
                    )}
            </div>
        </div>
    );
}