import { useEffect, useMemo, useState } from "react";

const API = "/api/v1";

function Index() {
    const [holds, setHolds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState({
        sport_category_id: "",
        court_id: "",
        booking_date: "",
        start_time: "",
        duration_minutes: 60,
        players_count: 1,
        customer_name: "Test Customer",
        customer_email: "test@example.com",
        customer_phone: "",
        hold_duration_minutes: 10,
    });

    useEffect(() => {
        loadHolds();
    }, []);

    async function loadHolds() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API}/booking-holds`
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Unable to load booking holds."
                );
            }

            setHolds(
                result.data?.data ??
                result.data ??
                []
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function createTestHold(event) {
        event.preventDefault();

        try {
            setProcessing(true);
            setError("");
            setSuccess("");

            const response = await fetch(
                `${API}/booking-holds`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Accept:
                            "application/json",
                    },

                    body: JSON.stringify({
                        ...form,

                        sport_category_id:
                            Number(
                                form.sport_category_id
                            ),

                        court_id:
                            Number(
                                form.court_id
                            ),

                        duration_minutes:
                            Number(
                                form.duration_minutes
                            ),

                        players_count:
                            Number(
                                form.players_count
                            ),

                        hold_duration_minutes:
                            Number(
                                form.hold_duration_minutes
                            ),
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                if (result.errors) {
                    const firstError =
                        Object.values(
                            result.errors
                        )[0];

                    throw new Error(
                        Array.isArray(firstError)
                            ? firstError[0]
                            : firstError
                    );
                }

                throw new Error(
                    result.message ||
                    "Unable to create hold."
                );
            }

            setSuccess(
                "Court successfully placed on hold."
            );

            setForm((current) => ({
                ...current,
                court_id: "",
            }));

            await loadHolds();
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    }

    async function convertHold(id) {
        if (
            !window.confirm(
                "Convert this hold into a confirmed booking?"
            )
        ) {
            return;
        }

        try {
            setProcessing(true);
            setError("");
            setSuccess("");

            const response = await fetch(
                `${API}/booking-holds/${id}/convert`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Accept:
                            "application/json",
                    },

                    body: JSON.stringify({
                        payment_reference:
                            `TEST-PAY-${Date.now()}`,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Unable to convert hold."
                );
            }

            setSuccess(
                `Hold converted successfully. Booking reference: ${result.data.booking.booking_reference}`
            );

            await loadHolds();
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    }

    async function failHold(id) {
        const reason = window.prompt(
            "Enter checkout failure reason:",
            "Payment failed."
        );

        if (!reason) {
            return;
        }

        try {
            setProcessing(true);
            setError("");
            setSuccess("");

            const response = await fetch(
                `${API}/booking-holds/${id}/fail`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Accept:
                            "application/json",
                    },

                    body: JSON.stringify({
                        failure_reason: reason,
                        payment_reference:
                            `FAILED-PAY-${Date.now()}`,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Unable to record failure."
                );
            }

            setSuccess(
                "Checkout failure recorded and court released."
            );

            await loadHolds();
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    }

    async function releaseExpired() {
        try {
            setProcessing(true);
            setError("");
            setSuccess("");

            const response = await fetch(
                `${API}/booking-holds/release-expired`
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Unable to release expired holds."
                );
            }

            setSuccess(
                `${result.data.released_count} expired hold(s) released.`
            );

            await loadHolds();
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    }

    const stats = useMemo(() => {
        return {
            active: holds.filter(
                (hold) =>
                    hold.status === "ACTIVE"
            ).length,

            converted: holds.filter(
                (hold) =>
                    hold.status === "CONVERTED"
            ).length,

            expired: holds.filter(
                (hold) =>
                    hold.status === "EXPIRED"
            ).length,

            failed: holds.filter(
                (hold) =>
                    hold.status === "FAILED"
            ).length,
        };
    }, [holds]);

    function formatDate(date) {
        if (!date) {
            return "-";
        }

        return new Date(
            `${date}T00:00:00`
        ).toLocaleDateString();
    }

    function formatTime(time) {
        if (!time) {
            return "-";
        }

        return time.slice(0, 5);
    }

    function getStatusClass(status) {
        switch (status) {
            case "ACTIVE":
                return "bg-green-100 text-green-700";

            case "CONVERTED":
                return "bg-blue-100 text-blue-700";

            case "EXPIRED":
                return "bg-gray-100 text-gray-700";

            case "FAILED":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Booking Holds
                        </h1>

                        <p className="mt-2 text-gray-600">
                            Temporarily reserve a court while
                            the customer completes checkout.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={releaseExpired}
                        disabled={processing}
                        className="rounded-lg bg-gray-900 px-5 py-2.5 font-semibold text-white hover:bg-gray-800 disabled:bg-gray-400"
                    >
                        Release Expired Holds
                    </button>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
                        {success}
                    </div>
                )}

                <div className="mb-8 grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Active Holds
                        </p>

                        <p className="mt-2 text-3xl font-bold text-green-600">
                            {stats.active}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Converted
                        </p>

                        <p className="mt-2 text-3xl font-bold text-blue-600">
                            {stats.converted}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Expired
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-600">
                            {stats.expired}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Failed
                        </p>

                        <p className="mt-2 text-3xl font-bold text-red-600">
                            {stats.failed}
                        </p>
                    </div>
                </div>

                <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-2 text-xl font-semibold">
                        Test Booking Hold
                    </h2>

                    <p className="mb-6 text-sm text-gray-500">
                        This form is useful for testing the
                        concurrency and hold functionality.
                    </p>

                    <form
                        onSubmit={createTestHold}
                        className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
                    >
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Sport Category ID
                            </label>

                            <input
                                type="number"
                                value={
                                    form.sport_category_id
                                }
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        sport_category_id:
                                            event.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                placeholder="1"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Court ID
                            </label>

                            <input
                                type="number"
                                value={
                                    form.court_id
                                }
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        court_id:
                                            event.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                placeholder="1"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Date
                            </label>

                            <input
                                type="date"
                                value={
                                    form.booking_date
                                }
                                min={
                                    new Date()
                                        .toISOString()
                                        .split("T")[0]
                                }
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        booking_date:
                                            event.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Start Time
                            </label>

                            <input
                                type="time"
                                value={
                                    form.start_time
                                }
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        start_time:
                                            event.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Duration
                            </label>

                            <select
                                value={
                                    form.duration_minutes
                                }
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        duration_minutes:
                                            event.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            >
                                <option value="30">
                                    30 minutes
                                </option>

                                <option value="60">
                                    60 minutes
                                </option>

                                <option value="90">
                                    90 minutes
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Hold Duration
                            </label>

                            <select
                                value={
                                    form.hold_duration_minutes
                                }
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        hold_duration_minutes:
                                            event.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            >
                                <option value="5">
                                    5 minutes
                                </option>

                                <option value="10">
                                    10 minutes
                                </option>

                                <option value="15">
                                    15 minutes
                                </option>

                                <option value="30">
                                    30 minutes
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Players
                            </label>

                            <input
                                type="number"
                                min="1"
                                value={
                                    form.players_count
                                }
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        players_count:
                                            event.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Customer Name
                            </label>

                            <input
                                type="text"
                                value={
                                    form.customer_name
                                }
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        customer_name:
                                            event.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Customer Email
                            </label>

                            <input
                                type="email"
                                value={
                                    form.customer_email
                                }
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        customer_email:
                                            event.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />
                        </div>

                        <div className="md:col-span-2 lg:col-span-3">
                            <button
                                type="submit"
                                disabled={
                                    processing
                                }
                                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                {processing
                                    ? "Processing..."
                                    : "Place Court on Hold"}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="rounded-xl bg-white shadow-sm">
                    <div className="border-b border-gray-200 p-6">
                        <h2 className="text-xl font-semibold">
                            Hold History
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-500">
                            Loading booking holds...
                        </div>
                    ) : holds.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No booking holds found.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {holds.map((hold) => (
                                <div
                                    key={hold.id}
                                    className="p-6"
                                >
                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h3 className="font-semibold text-gray-900">
                                                    Hold #
                                                    {
                                                        hold.id
                                                    }
                                                </h3>

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                                        hold.status
                                                    )}`}
                                                >
                                                    {
                                                        hold.status
                                                    }
                                                </span>
                                            </div>

                                            <p className="mt-2 text-lg font-medium">
                                                {
                                                    hold.court
                                                        ?.name
                                                }
                                            </p>

                                            <div className="mt-2 grid gap-1 text-sm text-gray-500 md:grid-cols-2">
                                                <span>
                                                    Date:{" "}
                                                    {formatDate(
                                                        hold.booking_date
                                                    )}
                                                </span>

                                                <span>
                                                    Time:{" "}
                                                    {formatTime(
                                                        hold.start_time
                                                    )}{" "}
                                                    -{" "}
                                                    {formatTime(
                                                        hold.end_time
                                                    )}
                                                </span>

                                                <span>
                                                    Duration:{" "}
                                                    {
                                                        hold.duration_minutes
                                                    }{" "}
                                                    minutes
                                                </span>

                                                <span>
                                                    Players:{" "}
                                                    {
                                                        hold.players_count
                                                    }
                                                </span>

                                                <span>
                                                    Customer:{" "}
                                                    {
                                                        hold.customer_name ||
                                                        "-"
                                                    }
                                                </span>

                                                <span>
                                                    Email:{" "}
                                                    {
                                                        hold.customer_email ||
                                                        "-"
                                                    }
                                                </span>
                                            </div>

                                            {hold.status ===
                                                "ACTIVE" && (
                                                <p className="mt-3 font-medium text-orange-600">
                                                    Expires:{" "}
                                                    {hold.expires_at
                                                        ? new Date(
                                                              hold.expires_at
                                                          ).toLocaleString()
                                                        : "-"}
                                                </p>
                                            )}

                                            {hold.failure_reason && (
                                                <p className="mt-3 text-sm text-red-600">
                                                    Failure:{" "}
                                                    {
                                                        hold.failure_reason
                                                    }
                                                </p>
                                            )}

                                            {hold.booking && (
                                                <p className="mt-3 text-sm text-blue-600">
                                                    Booking:{" "}
                                                    {
                                                        hold
                                                            .booking
                                                            .booking_reference
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        {hold.status ===
                                            "ACTIVE" && (
                                            <div className="flex flex-col gap-2 sm:flex-row">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        processing
                                                    }
                                                    onClick={() =>
                                                        convertHold(
                                                            hold.id
                                                        )
                                                    }
                                                    className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:bg-gray-400"
                                                >
                                                    Convert to Booking
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        processing
                                                    }
                                                    onClick={() =>
                                                        failHold(
                                                            hold.id
                                                        )
                                                    }
                                                    className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:bg-gray-400"
                                                >
                                                    Payment Failed
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Index;