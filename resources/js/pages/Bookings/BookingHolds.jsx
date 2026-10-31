import { useEffect, useMemo, useState } from "react";
import {
    CalendarClock,
    Clock3,
    RefreshCw,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import { formatDate, formatTime, getStatusClass } from "../../utils/formatters";
import SuccessAlert from "../../components/SuccessAlert";
import ErrorAlert from "../../components/ErrorAlert";
import {
    getBookingHolds,
    createBookingHold,
    convertBookingHold,
    failBookingHold,
    releaseExpiredBookingHolds,
} from "../../services/bookingHoldService";

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

            const result = await getBookingHolds();

            setHolds(
                result.data?.data ??
                result.data ??
                []
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load booking holds."
            );
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

            await createBookingHold(form);

            setSuccess(
                "Court successfully placed on hold."
            );

            setForm((current) => ({
                ...current,
                court_id: "",
            }));

            await loadHolds();
        } catch (err) {
            setError(
                err.response?.data?.errors
                    ? readErrorMessage(err.response.data)
                    : err.response?.data?.message ||
                    err.message ||
                    "Unable to create hold."
            );
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

            const result = await convertBookingHold(
                id,
                `TEST-PAY-${Date.now()}`
            );

            setSuccess(
                `Hold converted successfully. Booking reference: ${
                    result.data.booking.booking_reference
                }`
            );

            await loadHolds();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to convert hold."
            );
        } finally {
            setProcessing(false);
        }
    }
    async function failHold(id) {
        const reason = window.prompt(
            "Enter checkout failure reason:",
            "Payment failed."
        );

        if (!reason) return;

        try {
            setProcessing(true);
            setError("");
            setSuccess("");

            await failBookingHold(
                id,
                reason,
                `FAILED-PAY-${Date.now()}`
            );

            setSuccess(
                "Checkout failure recorded and court released."
            );

            await loadHolds();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to record failure."
            );
        } finally {
            setProcessing(false);
        }
    }
    async function releaseExpired() {
        try {
            setProcessing(true);
            setError("");
            setSuccess("");

            const result = await releaseExpiredBookingHolds();

            setSuccess(
                `${result.data.released_count} expired hold(s) released.`
            );

            await loadHolds();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to release expired holds."
            );
        } finally {
            setProcessing(false);
        }
    }

    const stats = useMemo(() => {
        return {
            active: holds.filter((hold) => hold.status === "ACTIVE").length,
            converted: holds.filter((hold) => hold.status === "CONVERTED").length,
            expired: holds.filter((hold) => hold.status === "EXPIRED").length,
            failed: holds.filter((hold) => hold.status === "FAILED").length,
        };
    }, [holds]);

    return (
        <Layout title="Booking Holds">
            <div className="mx-auto w-full max-w-[1800px] space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <CalendarClock size={24} />
                        </div>
                        <div>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                                Booking Holds
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Temporarily reserve a court while a customer completes checkout.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={loadHolds}
                            disabled={loading || processing}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                            Refresh
                        </button>
                        <button
                            type="button"
                            onClick={releaseExpired}
                            disabled={processing}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Clock3 size={16} />
                            Release Expired Holds
                        </button>
                    </div>
                </div>

                <ErrorAlert message={error} />
                <SuccessAlert message={success} />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">
                            Active Holds
                        </p>

                        <p className="mt-2 text-3xl font-bold text-green-600">
                            {stats.active}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">
                            Converted
                        </p>

                        <p className="mt-2 text-3xl font-bold text-blue-600">
                            {stats.converted}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">
                            Expired
                        </p>

                        <p className="mt-2 text-3xl font-bold text-slate-600">
                            {stats.expired}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">
                            Failed
                        </p>

                        <p className="mt-2 text-3xl font-bold text-red-600">
                            {stats.failed}
                        </p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                    {holds.map((hold) => (
                        <div
                            key={hold.id}
                            className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                            {/* Hold Header */}
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-slate-900">
                                    Hold #{hold.id}
                                </h3>

                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusClass(hold.status)}`}>
                                    {hold.status}
                                </span>
                            </div>

                            {/* Court Details */}
                            <div className="mt-4">
                                <h4 className="text-base font-semibold text-slate-900">
                                    {hold.court?.name || "-"}
                                </h4>

                                <p className="mt-1 break-words text-sm text-slate-500">
                                    {hold.customer_name || "Guest Customer"}
                                    {hold.customer_email && ` · ${hold.customer_email}`}
                                </p>
                            </div>

                            {/* Booking Information */}
                            <div className="mt-5 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500">Booking Date</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        {formatDate(hold.booking_date)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">Schedule</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        {formatTime(hold.start_time)} - {formatTime(hold.end_time)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">Duration</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        {hold.duration_minutes} minutes
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">Players</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        {hold.players_count}
                                    </p>
                                </div>
                            </div>

                            {/* ACTIVE HOLD ONLY */}
                            {hold.status === "ACTIVE" && (
                                <div className="mt-auto pt-5">

                                    {/* Hold Expiration */}
                                    <div className="rounded-xl border border-orange-300 bg-orange-50 p-3">
                                        <div className="flex items-center gap-2">
                                            <svg
                                                className="h-4 w-4 text-orange-600"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>

                                            <span className="text-sm font-semibold text-slate-800">
                                                Hold Expiration
                                            </span>
                                        </div>

                                        <p className="mt-2 text-sm font-medium text-orange-600">
                                            {hold.expires_at
                                                ? new Date(hold.expires_at).toLocaleString("en-PH", {
                                                    timeZone: "Asia/Manila",
                                                    dateStyle: "medium",
                                                    timeStyle: "short",
                                                })
                                                : "-"
                                            }
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        <button
                                            type="button"
                                            disabled={processing}
                                            onClick={() => convertHold(hold.id)}
                                            className="rounded-lg bg-green-600 px-3 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Convert to Booking
                                        </button>

                                        <button
                                            type="button"
                                            disabled={processing}
                                            onClick={() => failHold(hold.id)}
                                            className="rounded-lg border border-red-300 bg-white px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Payment Failed
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Failure Reason */}
                            {hold.failure_reason && (
                                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                                    <p className="text-xs font-semibold text-red-700">
                                        Failure Reason
                                    </p>
                                    <p className="mt-1 text-sm text-red-600">
                                        {hold.failure_reason}
                                    </p>
                                </div>
                            )}

                            {/* Booking Reference */}
                            {hold.booking && (
                                <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                                    <p className="text-xs font-semibold text-blue-700">
                                        Booking Reference
                                    </p>
                                    <p className="mt-1 break-all text-sm text-blue-600">
                                        {hold.booking.booking_reference}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

            </div>
        </Layout>
    );
}

export default Index;