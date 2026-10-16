import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API = "/api/v1";

const durations = [30, 60, 90];

function Reschedule() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [booking, setBooking] = useState(null);
    const [reschedules, setReschedules] = useState([]);

    const [courts, setCourts] = useState([]);

    const [bookingReference, setBookingReference] =
        useState("");

    const [customerEmail, setCustomerEmail] =
        useState("");

    const [bookingDate, setBookingDate] =
        useState("");

    const [startTime, setStartTime] =
        useState("");

    const [durationMinutes, setDurationMinutes] =
        useState(60);

    const [courtId, setCourtId] =
        useState("");

    const [reason, setReason] =
        useState("");

    const [preview, setPreview] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [loadingCourts, setLoadingCourts] =
        useState(false);

    const [previewLoading, setPreviewLoading] =
        useState(false);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    /*
     * Calculate end time.
     */
    const endTime = useMemo(() => {
        if (!startTime) {
            return "";
        }

        const [hours, minutes] =
            startTime
                .split(":")
                .map(Number);

        const date = new Date();

        date.setHours(hours);
        date.setMinutes(
            minutes +
                Number(durationMinutes)
        );

        return date
            .toTimeString()
            .slice(0, 5);
    }, [
        startTime,
        durationMinutes,
    ]);

    /*
     * Load verified booking credentials
     * and booking information.
     */
    useEffect(() => {
        const reference =
            sessionStorage.getItem(
                "reschedule_booking_reference"
            );

        const email =
            sessionStorage.getItem(
                "reschedule_customer_email"
            );

        if (!reference || !email) {
            navigate("/bookings", {
                replace: true,
            });

            return;
        }

        setBookingReference(reference);
        setCustomerEmail(email);

        loadBooking(
            reference,
            email
        );
    }, [id]);

    async function loadBooking(
        reference,
        email
    ) {
        try {
            setLoading(true);
            setError("");

            /*
             * We use the public lookup again instead
             * of trusting the booking ID in the URL.
             */
            const response =
                await fetch(
                    `${API}/bookings/lookup`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Accept:
                                "application/json",
                        },

                        body: JSON.stringify({
                            booking_reference:
                                reference,

                            customer_email:
                                email,
                        }),
                    }
                );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Unable to verify your booking."
                );
            }

            const foundBooking =
                result.data?.booking;

            if (
                !foundBooking ||
                String(foundBooking.id) !==
                    String(id)
            ) {
                throw new Error(
                    "The booking could not be verified."
                );
            }

            setBooking(foundBooking);

            setBookingDate(
                foundBooking.booking_date
            );

            setStartTime(
                foundBooking.start_time
            );

            setCourtId(
                foundBooking.court_id
            );

            setDurationMinutes(
                calculateDuration(
                    foundBooking.start_time,
                    foundBooking.end_time
                )
            );

            setReschedules(
                result.data?.booking
                    ?.reschedules ?? []
            );

            /*
             * Load available courts using
             * the current booking's sport.
             */
            await loadAvailableCourts(
                foundBooking.sport_category_id,
                foundBooking.booking_date,
                foundBooking.start_time,
                calculateDuration(
                    foundBooking.start_time,
                    foundBooking.end_time
                )
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function calculateDuration(
        start,
        end
    ) {
        if (!start || !end) {
            return 60;
        }

        const startDate =
            new Date(
                `1970-01-01T${start}`
            );

        const endDate =
            new Date(
                `1970-01-01T${end}`
            );

        let difference =
            (endDate - startDate) /
            60000;

        /*
         * Handle a booking that crosses midnight.
         */
        if (difference < 0) {
            difference += 1440;
        }

        if (
            durations.includes(
                difference
            )
        ) {
            return difference;
        }

        return 60;
    }

    async function loadAvailableCourts(
        sportCategoryId,
        date,
        time,
        duration
    ) {
        if (
            !sportCategoryId ||
            !date ||
            !time
        ) {
            return;
        }

        try {
            setLoadingCourts(true);
            setError("");

            const params =
                new URLSearchParams({
                    sport_category_id:
                        sportCategoryId,

                    date,

                    start_time:
                        time,

                    duration_minutes:
                        String(duration),
                });

            const response =
                await fetch(
                    `${API}/bookings/availability?${params}`
                );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Unable to load available courts."
                );
            }

            setCourts(
                result.data?.courts ?? []
            );
        } catch (err) {
            setCourts([]);
            setError(err.message);
        } finally {
            setLoadingCourts(false);
        }
    }

    async function handleDateTimeChange(
        date,
        time,
        duration
    ) {
        setBookingDate(date);
        setStartTime(time);
        setDurationMinutes(duration);
        setCourtId("");
        setPreview(null);

        if (
            booking?.sport_category_id &&
            date &&
            time
        ) {
            await loadAvailableCourts(
                booking.sport_category_id,
                date,
                time,
                duration
            );
        }
    }

    async function handlePreview(
        event
    ) {
        event.preventDefault();

        setError("");
        setSuccess("");
        setPreview(null);

        if (!courtId) {
            setError(
                "Please select an available court."
            );

            return;
        }

        if (!endTime) {
            setError(
                "Please select a valid start time and duration."
            );

            return;
        }

        try {
            setPreviewLoading(true);

            const response =
                await fetch(
                    `${API}/bookings/${id}/reschedule/preview`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Accept:
                                "application/json",
                        },

                        body: JSON.stringify({
                            booking_reference:
                                bookingReference,

                            customer_email:
                                customerEmail,

                            booking_date:
                                bookingDate,

                            start_time:
                                startTime,

                            end_time:
                                endTime,

                            court_id:
                                Number(courtId),
                        }),
                    }
                );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Unable to calculate the reschedule."
                );
            }

            setPreview(
                result.data
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setPreviewLoading(false);
        }
    }

    async function handleSubmit(
        event
    ) {
        event.preventDefault();

        if (!preview) {
            setError(
                "Please preview the reschedule before confirming."
            );

            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to reschedule this booking?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            const response =
                await fetch(
                    `${API}/bookings/${id}/reschedule`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Accept:
                                "application/json",
                        },

                        body: JSON.stringify({
                            booking_reference:
                                bookingReference,

                            customer_email:
                                customerEmail,

                            booking_date:
                                bookingDate,

                            start_time:
                                startTime,

                            end_time:
                                endTime,

                            court_id:
                                Number(courtId),

                            reason:
                                reason || null,
                        }),
                    }
                );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Unable to reschedule the booking."
                );
            }

            setSuccess(
                result.message ||
                    "Booking rescheduled successfully."
            );

            setPreview(null);

            /*
             * Refresh the booking information.
             */
            await loadBooking(
                bookingReference,
                customerEmail
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    function clearRescheduleSession() {
        sessionStorage.removeItem(
            "reschedule_booking_reference"
        );

        sessionStorage.removeItem(
            "reschedule_customer_email"
        );

        navigate("/bookings");
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-8">
                <div className="mx-auto max-w-4xl">
                    <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                        <p className="text-gray-500">
                            Verifying your booking...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-8">
                <div className="mx-auto max-w-4xl">
                    <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                        <h1 className="text-xl font-semibold text-red-800">
                            Booking Not Found
                        </h1>

                        <p className="mt-2 text-red-700">
                            {error ||
                                "Unable to verify your booking."}
                        </p>

                        <button
                            type="button"
                            onClick={
                                clearRescheduleSession
                            }
                            className="mt-5 rounded-lg bg-gray-900 px-5 py-2.5 font-semibold text-white"
                        >
                            Back to Bookings
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="mx-auto max-w-4xl">

                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Reschedule Booking
                        </h1>

                        <p className="mt-2 text-gray-600">
                            Change the date, time, or
                            court of your booking.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={
                            clearRescheduleSession
                        }
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Exit
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

                {/* CURRENT BOOKING */}

                <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-xl font-semibold">
                        Current Booking
                    </h2>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                        <div>
                            <p className="text-sm text-gray-500">
                                Reference
                            </p>

                            <p className="mt-1 font-semibold text-gray-900">
                                {
                                    booking.booking_reference
                                }
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Sport
                            </p>

                            <p className="mt-1 font-semibold text-gray-900">
                                {
                                    booking
                                        .sport_category
                                        ?.name ??
                                    "-"
                                }
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Court
                            </p>

                            <p className="mt-1 font-semibold text-gray-900">
                                {
                                    booking.court
                                        ?.name ??
                                    "-"
                                }
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Current Price
                            </p>

                            <p className="mt-1 font-semibold text-gray-900">
                                ₱
                                {Number(
                                    booking.total_amount ||
                                        0
                                ).toFixed(2)}
                            </p>
                        </div>

                    </div>

                    <div className="mt-5 grid gap-5 sm:grid-cols-3">

                        <div>
                            <p className="text-sm text-gray-500">
                                Date
                            </p>

                            <p className="mt-1 font-semibold">
                                {
                                    booking.booking_date
                                }
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Time
                            </p>

                            <p className="mt-1 font-semibold">
                                {
                                    booking.start_time
                                }{" "}
                                -{" "}
                                {
                                    booking.end_time
                                }
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Customer
                            </p>

                            <p className="mt-1 font-semibold">
                                {
                                    booking.customer_name
                                }
                            </p>
                        </div>

                    </div>
                </div>

                {/* RESCHEDULE FORM */}

                <form
                    onSubmit={handlePreview}
                    className="space-y-6"
                >

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-xl font-semibold">
                            New Booking Details
                        </h2>

                        <div className="grid gap-5 md:grid-cols-2">

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    New Date
                                </label>

                                <input
                                    type="date"
                                    value={
                                        bookingDate
                                    }
                                    min={
                                        new Date()
                                            .toISOString()
                                            .split(
                                                "T"
                                            )[0]
                                    }
                                    onChange={(event) =>
                                        handleDateTimeChange(
                                            event
                                                .target
                                                .value,
                                            startTime,
                                            durationMinutes
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    New Start Time
                                </label>

                                <input
                                    type="time"
                                    value={
                                        startTime
                                    }
                                    onChange={(event) =>
                                        handleDateTimeChange(
                                            bookingDate,
                                            event
                                                .target
                                                .value,
                                            durationMinutes
                                        )
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
                                        durationMinutes
                                    }
                                    onChange={(event) =>
                                        handleDateTimeChange(
                                            bookingDate,
                                            startTime,
                                            Number(
                                                event
                                                    .target
                                                    .value
                                            )
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                >
                                    {durations.map(
                                        (duration) => (
                                            <option
                                                key={
                                                    duration
                                                }
                                                value={
                                                    duration
                                                }
                                            >
                                                {
                                                    duration
                                                }{" "}
                                                minutes
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    New End Time
                                </label>

                                <input
                                    type="text"
                                    value={
                                        endTime
                                    }
                                    readOnly
                                    className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2"
                                />
                            </div>

                        </div>
                    </div>

                    {/* COURTS */}

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-xl font-semibold">
                            Available Courts
                        </h2>

                        {loadingCourts && (
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 text-center">
                                <p className="text-sm text-gray-500">
                                    Checking court
                                    availability...
                                </p>
                            </div>
                        )}

                        {!loadingCourts &&
                            courts.length === 0 && (
                                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-5">
                                    <p className="font-medium text-yellow-800">
                                        No courts available
                                    </p>

                                    <p className="mt-1 text-sm text-yellow-700">
                                        Try another date
                                        or time.
                                    </p>
                                </div>
                            )}

                        {!loadingCourts &&
                            courts.length > 0 && (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {courts.map(
                                        (court) => {
                                            const selected =
                                                String(
                                                    courtId
                                                ) ===
                                                String(
                                                    court.id
                                                );

                                            return (
                                                <button
                                                    key={
                                                        court.id
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        setCourtId(
                                                            court.id
                                                        )
                                                    }
                                                    className={`rounded-xl border-2 p-5 text-left ${
                                                        selected
                                                            ? "border-blue-600 bg-blue-50"
                                                            : "border-gray-200 bg-white hover:border-blue-400"
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900">
                                                                {
                                                                    court.name
                                                                }
                                                            </h3>

                                                            {court.court_number && (
                                                                <p className="mt-1 text-sm text-gray-500">
                                                                    Court #
                                                                    {
                                                                        court.court_number
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>

                                                        <span
                                                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                                                selected
                                                                    ? "bg-blue-600 text-white"
                                                                    : "bg-green-100 text-green-700"
                                                            }`}
                                                        >
                                                            {selected
                                                                ? "Selected"
                                                                : "Available"}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        }
                                    )}
                                </div>
                            )}
                    </div>

                    {/* REASON */}

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-semibold">
                            Reschedule Reason
                        </h2>

                        <textarea
                            value={reason}
                            onChange={(event) =>
                                setReason(
                                    event.target.value
                                )
                            }
                            rows="4"
                            maxLength="1000"
                            placeholder="Optional reason for rescheduling..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        />
                    </div>

                    {/* PREVIEW */}

                    {preview && (
                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">

                            <h2 className="mb-5 text-xl font-semibold text-blue-900">
                                Reschedule Summary
                            </h2>

                            <div className="grid gap-5 sm:grid-cols-3">

                                <div>
                                    <p className="text-sm text-blue-700">
                                        Original Price
                                    </p>

                                    <p className="mt-1 text-lg font-bold text-blue-900">
                                        ₱
                                        {Number(
                                            preview.original_price
                                        ).toFixed(2)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-blue-700">
                                        New Price
                                    </p>

                                    <p className="mt-1 text-lg font-bold text-blue-900">
                                        ₱
                                        {Number(
                                            preview.new_price
                                        ).toFixed(2)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-blue-700">
                                        Price Difference
                                    </p>

                                    <p className="mt-1 text-lg font-bold text-blue-900">
                                        ₱
                                        {Number(
                                            preview.price_difference
                                        ).toFixed(2)}
                                    </p>
                                </div>

                            </div>

                            {preview.payment_required && (
                                <div className="mt-5 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
                                    Additional payment is
                                    required before the
                                    price difference can be
                                    settled.
                                </div>
                            )}

                            {preview.refund_required && (
                                <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
                                    The price decreased.
                                    A refund of ₱
                                    {Number(
                                        preview.price_difference
                                    ).toFixed(2)}{" "}
                                    is required.
                                </div>
                            )}
                        </div>
                    )}

                    {/* ACTION */}

                    <div className="rounded-xl bg-white p-6 shadow-sm">

                        {!preview ? (
                            <button
                                type="submit"
                                disabled={
                                    previewLoading ||
                                    !courtId
                                }
                                className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                            >
                                {previewLoading
                                    ? "Checking..."
                                    : "Preview Reschedule"}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={
                                    handleSubmit
                                }
                                disabled={
                                    submitting
                                }
                                className="w-full rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                            >
                                {submitting
                                    ? "Rescheduling..."
                                    : "Confirm Reschedule"}
                            </button>
                        )}

                    </div>

                </form>

                {/* HISTORY */}

                <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-xl font-semibold">
                        Reschedule History
                    </h2>

                    {reschedules.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            No previous reschedules.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {reschedules.map(
                                (item) => (
                                    <div
                                        key={
                                            item.id
                                        }
                                        className="rounded-lg border border-gray-200 p-4"
                                    >
                                        <div className="flex flex-wrap justify-between gap-3">

                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {
                                                        item.original_booking_date
                                                    }{" "}
                                                    →
                                                    {" "}
                                                    {
                                                        item.new_booking_date
                                                    }
                                                </p>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    {
                                                        item.original_start_time
                                                    }{" "}
                                                    -
                                                    {" "}
                                                    {
                                                        item.original_end_time
                                                    }
                                                    {" "}
                                                    →
                                                    {" "}
                                                    {
                                                        item.new_start_time
                                                    }{" "}
                                                    -
                                                    {" "}
                                                    {
                                                        item.new_end_time
                                                    }
                                                </p>
                                            </div>

                                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                {
                                                    item.status
                                                }
                                            </span>

                                        </div>

                                        {item.reason && (
                                            <p className="mt-3 text-sm text-gray-600">
                                                <span className="font-medium">
                                                    Reason:
                                                </span>{" "}
                                                {
                                                    item.reason
                                                }
                                            </p>
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default Reschedule;