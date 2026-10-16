import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "/api/v1";

const durations = [30, 60, 90];

function Index() {
    const navigate = useNavigate();

    const [sports, setSports] = useState([]);
    const [courts, setCourts] = useState([]);

    const [loadingSports, setLoadingSports] = useState(true);
    const [loadingCourts, setLoadingCourts] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [payment, setPayment] = useState(null);
    const [paymentCreating, setPaymentCreating] = useState(false);

    /*
     * Existing booking form
     */
    const [booking, setBooking] = useState({
        sport_category_id: "",
        court_id: "",
        booking_date: "",
        start_time: "",
        duration_minutes: 60,
        players_count: 1,
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        membership_type: "",
        notes: "",
        payment_method: "PAYPAL",
    });

    /*
     * Rescheduling / existing booking section
     */
    const [bookingReference, setBookingReference] = useState("");
    const [bookingEmail, setBookingEmail] = useState("");
    const [rescheduleLoading, setRescheduleLoading] = useState(false);
    const [rescheduleError, setRescheduleError] = useState("");
    
    const endTime = useMemo(() => {
        if (!booking.booking_date || !booking.start_time) {
            return "";
        }

        const [hours, minutes] =
            booking.start_time.split(":").map(Number);

        const date = new Date();

        date.setHours(hours);
        date.setMinutes(
            minutes + Number(booking.duration_minutes)
        );

        return date.toTimeString().slice(0, 5);
    }, [
        booking.booking_date,
        booking.start_time,
        booking.duration_minutes,
    ]);

    useEffect(() => {
        loadSports();
    }, []);

    useEffect(() => {
        if (
            booking.sport_category_id &&
            booking.booking_date &&
            booking.start_time
        ) {
            loadAvailableCourts();
        } else {
            setCourts([]);
        }
    }, [
        booking.sport_category_id,
        booking.booking_date,
        booking.start_time,
        booking.duration_minutes,
    ]);

    async function loadSports() {
        try {
            setLoadingSports(true);

            const response = await fetch(
                `${API}/sport-categories`
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Unable to load sports."
                );
            }

            setSports(
                result.data?.data ??
                result.data ??
                []
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingSports(false);
        }
    }

    async function loadAvailableCourts() {
        try {
            setLoadingCourts(true);
            setError("");

            setBooking((current) => ({
                ...current,
                court_id: "",
            }));

            const params = new URLSearchParams({
                sport_category_id:
                    booking.sport_category_id,

                date:
                    booking.booking_date,

                start_time:
                    booking.start_time,

                duration_minutes:
                    String(
                        booking.duration_minutes
                    ),
            });

            const response = await fetch(
                `${API}/bookings/availability?${params}`
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Unable to calculate availability."
                );
            }

            setCourts(
                result.data?.courts ?? []
            );
        } catch (err) {
            setError(err.message);
            setCourts([]);
        } finally {
            setLoadingCourts(false);
        }
    }

    function handleChange(event) {
        const { name, value } = event.target;

        setBooking((current) => ({
            ...current,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setSuccess("");
        setPayment(null);

        if (!booking.court_id) {
            setError(
                "Please select an available court."
            );

            return;
        }

        if (!booking.payment_method) {
            setError(
                "Please select a payment method."
            );

            return;
        }

        try {
            setSubmitting(true);

            /*
            * =====================================================
            * STEP 1: CREATE BOOKING
            * =====================================================
            */

            const response = await fetch(
                `${API}/bookings`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Accept:
                            "application/json",
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        ...booking,

                        duration_minutes:
                            Number(
                                booking.duration_minutes
                            ),

                        players_count:
                            Number(
                                booking.players_count
                            ),

                        booking_source:
                            "PUBLIC",
                    }),
                }
            );

            const result =
                await response.json();

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
                        "Unable to create booking."
                );
            }

            /*
            * Depending on your BookingController response,
            * the booking may be in result.data.booking
            * or result.data.
            */

            const createdBooking =
                result.data?.booking ??
                result.data;

            if (!createdBooking?.id) {
                throw new Error(
                    "Booking was created but no booking ID was returned."
                );
            }

            /*
            * =====================================================
            * STEP 2: CREATE PAYMENT
            * =====================================================
            */

            const createdPayment =
                await createPayment(
                    createdBooking.id,
                    booking.payment_method
                );

            setPayment(createdPayment);

            /*
            * =====================================================
            * STEP 3: HANDLE PAYMENT METHOD
            * =====================================================
            */

            if (
                booking.payment_method ===
                "PAYPAL"
            ) {
                setSuccess(
                    `Booking created successfully! Reference: ${
                        createdBooking.booking_reference
                    }. Redirecting to PayPal Sandbox...`
                );

                /*
                * Send the payment ID to the Payments page.
                *
                * The Payments page will then start the
                * PayPal Sandbox checkout.
                */

                navigate(
                    `/payments?payment_id=${createdPayment.id}`
                );

                return;
            }

            /*
            * CASH / MANUAL / BANK TRANSFER / E-WALLET
            *
            * These payments remain PENDING until they
            * are confirmed.
            */

            setSuccess(
                `Booking created successfully! Reference: ${
                    createdBooking.booking_reference
                }. Payment Reference: ${
                    createdPayment.payment_reference
                }.`
            );

            /*
            * Reset booking form.
            */

            setBooking({
                sport_category_id: "",
                court_id: "",
                booking_date: "",
                start_time: "",
                duration_minutes: 60,
                players_count: 1,
                customer_name: "",
                customer_email: "",
                customer_phone: "",
                membership_type: "",
                notes: "",
                payment_method: "PAYPAL",
            });

            setCourts([]);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    async function createPayment(bookingId, paymentMethod) {
        setPaymentCreating(true);

        try {
            const token = localStorage.getItem("auth_token");

            const response = await fetch(
                `${API}/payments`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",

                        ...(token
                            ? {
                                Authorization: `Bearer ${token}`,
                            }
                            : {}),
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        booking_id: bookingId,
                        payment_method: paymentMethod,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                if (result.errors) {
                    const firstError =
                        Object.values(result.errors)[0];

                    throw new Error(
                        Array.isArray(firstError)
                            ? firstError[0]
                            : firstError
                    );
                }

                throw new Error(
                    result.message ||
                        "Unable to create payment."
                );
            }

            return result.payment;
        } finally {
            setPaymentCreating(false);
        }
    }

    /*
     * Open reschedule page
     *
     * The booking reference is expected to be
     * the booking ID for the current implementation.
     *
     * The email is retained here so we can later
     * add customer ownership validation.
     */
    async function handleRescheduleLookup(event) {
        event.preventDefault();

        setRescheduleError("");

        if (!bookingReference.trim()) {
            setRescheduleError(
                "Please enter your booking reference."
            );

            return;
        }

        if (!bookingEmail.trim()) {
            setRescheduleError(
                "Please enter the email used for the booking."
            );

            return;
        }

        try {
            setRescheduleLoading(true);

            /*
             * Current implementation:
             * booking reference is used as the booking ID.
             *
             * If your booking_reference is a separate field,
             * create a lookup endpoint later:
             *
             * GET /bookings/reference/{reference}
             */

            const response = await fetch(
                `${API}/bookings/${encodeURIComponent(
                    bookingReference.trim()
                )}/reschedule`,
                {
                    headers: {
                        Accept:
                            "application/json",
                    },

                    credentials: "include",
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Unable to find this booking."
                );
            }

            const existingBooking =
                result.data?.booking;

            if (!existingBooking) {
                throw new Error(
                    "Booking could not be found."
                );
            }

            /*
             * Customer email validation on frontend
             * is only an additional check.
             *
             * Authorization MUST still be handled
             * by Laravel on the backend.
             */
            if (
                existingBooking.customer_email &&
                existingBooking.customer_email.toLowerCase() !==
                    bookingEmail.trim().toLowerCase()
            ) {
                throw new Error(
                    "The email does not match the booking."
                );
            }

            navigate(
                `/bookings/${existingBooking.id}/reschedule`
            );
        } catch (err) {
            setRescheduleError(
                err.message
            );
        } finally {
            setRescheduleLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="mx-auto max-w-5xl">

                {/* =====================================================
                    PAGE HEADER
                ====================================================== */}

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Court Reservation
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Book a court or manage an existing
                        reservation.
                    </p>
                </div>

                {/* =====================================================
                    GLOBAL MESSAGES
                ====================================================== */}

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

                {/* =====================================================
                    MANAGE EXISTING BOOKING
                ====================================================== */}

                <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-6 shadow-sm">

                    <div className="mb-5">

                        <h2 className="text-xl font-semibold text-gray-900">
                            Manage Existing Booking
                        </h2>

                        <p className="mt-1 text-sm text-gray-600">
                            Already have a reservation? Enter
                            your booking reference and email to
                            reschedule your booking.
                        </p>

                    </div>

                    {rescheduleError && (
                        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {rescheduleError}
                        </div>
                    )}

                    <form
                        onSubmit={
                            handleRescheduleLookup
                        }
                    >
                        <div className="grid gap-4 md:grid-cols-3">

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Booking Reference
                                </label>

                                <input
                                    type="text"
                                    value={
                                        bookingReference
                                    }
                                    onChange={(event) =>
                                        setBookingReference(
                                            event.target.value
                                        )
                                    }
                                    placeholder="e.g. 123"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Booking Email
                                </label>

                                <input
                                    type="email"
                                    value={
                                        bookingEmail
                                    }
                                    onChange={(event) =>
                                        setBookingEmail(
                                            event.target.value
                                        )
                                    }
                                    placeholder="you@example.com"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
                                    required
                                />
                            </div>

                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    disabled={
                                        rescheduleLoading
                                    }
                                    className="w-full rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                                >
                                    {rescheduleLoading
                                        ? "Finding Booking..."
                                        : "Manage / Reschedule"}
                                </button>
                            </div>

                        </div>
                    </form>
                </div>

                {/* =====================================================
                    NEW BOOKING
                ====================================================== */}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >

                    {/* =================================================
                        COURT SELECTION
                    ================================================== */}

                    <div className="rounded-xl bg-white p-6 shadow-sm">

                        <h2 className="mb-5 text-xl font-semibold">
                            Book a Court
                        </h2>

                        <div className="grid gap-5 md:grid-cols-2">

                            {/* Sport */}

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Sport
                                </label>

                                <select
                                    name="sport_category_id"
                                    value={
                                        booking.sport_category_id
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    required
                                >
                                    <option value="">
                                        Select sport
                                    </option>

                                    {loadingSports ? (
                                        <option>
                                            Loading...
                                        </option>
                                    ) : (
                                        sports.map(
                                            (sport) => (
                                                <option
                                                    key={
                                                        sport.id
                                                    }
                                                    value={
                                                        sport.id
                                                    }
                                                >
                                                    {
                                                        sport.name
                                                    }
                                                </option>
                                            )
                                        )
                                    )}
                                </select>
                            </div>

                            {/* Date */}

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Date
                                </label>

                                <input
                                    type="date"
                                    name="booking_date"
                                    value={
                                        booking.booking_date
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    min={
                                        new Date()
                                            .toISOString()
                                            .split("T")[0]
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    required
                                />
                            </div>

                            {/* Start Time */}

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Start Time
                                </label>

                                <input
                                    type="time"
                                    name="start_time"
                                    value={
                                        booking.start_time
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    required
                                />
                            </div>

                            {/* Duration */}

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Duration
                                </label>

                                <select
                                    name="duration_minutes"
                                    value={
                                        booking.duration_minutes
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    required
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
                                                {duration} minutes
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            {/* End Time */}

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    End Time
                                </label>

                                <input
                                    type="text"
                                    value={
                                        endTime
                                    }
                                    readOnly
                                    className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2"
                                    placeholder="Calculated automatically"
                                />
                            </div>

                            {/* Players */}

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Players
                                </label>

                                <input
                                    type="number"
                                    name="players_count"
                                    min="1"
                                    value={
                                        booking.players_count
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    required
                                />
                            </div>

                        </div>
                    </div>

                    {/* =================================================
                        AVAILABLE COURTS
                    ================================================== */}

                    <div className="rounded-xl bg-white p-6 shadow-sm">

                        <div className="mb-6">

                            <div className="flex items-center justify-between">

                                <h2 className="text-xl font-semibold text-gray-900">
                                    Available Courts
                                </h2>

                                {booking.sport_category_id &&
                                    booking.booking_date &&
                                    booking.start_time &&
                                    !loadingCourts && (
                                        <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                                            Available Courts:{" "}
                                            {courts.length}
                                        </span>
                                    )}

                            </div>

                            <p className="mt-1 text-sm text-gray-500">
                                Select a court for your booking.
                            </p>

                        </div>

                        {loadingCourts && (
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                                <p className="text-sm text-gray-500">
                                    Checking available courts...
                                </p>
                            </div>
                        )}

                        {!loadingCourts &&
                            booking.sport_category_id &&
                            booking.booking_date &&
                            booking.start_time &&
                            courts.length === 0 && (
                                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-5">

                                    <p className="font-medium text-yellow-800">
                                        No courts available
                                    </p>

                                    <p className="mt-1 text-sm text-yellow-700">
                                        There are no available
                                        courts for the selected
                                        date and time.
                                    </p>

                                </div>
                            )}

                        {!loadingCourts &&
                            courts.length > 0 && (
                                <div>

                                    <div className="mb-4">
                                        <p className="text-sm font-medium text-gray-700">
                                            {courts.length} court
                                            {courts.length !==
                                            1
                                                ? "s"
                                                : ""}{" "}
                                            available
                                        </p>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                                        {courts.map(
                                            (court) => {

                                                const selected =
                                                    String(
                                                        booking.court_id
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
                                                        onClick={() => {
                                                            setBooking(
                                                                (
                                                                    current
                                                                ) => ({
                                                                    ...current,
                                                                    court_id:
                                                                        court.id,
                                                                })
                                                            );
                                                        }}
                                                        className={`rounded-xl border-2 p-5 text-left transition ${
                                                            selected
                                                                ? "border-blue-600 bg-blue-50"
                                                                : "border-gray-200 bg-white hover:border-blue-400"
                                                        }`}
                                                    >

                                                        <div className="flex items-start justify-between">

                                                            <div>

                                                                <h3 className="text-lg font-semibold text-gray-900">
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
                                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
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

                                                        <div className="mt-5 flex items-center gap-2">

                                                            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

                                                            <span className="text-sm font-medium text-green-600">
                                                                Available
                                                            </span>

                                                        </div>

                                                        <div
                                                            className={`mt-4 rounded-lg px-4 py-2 text-center text-sm font-semibold ${
                                                                selected
                                                                    ? "bg-blue-600 text-white"
                                                                    : "bg-gray-100 text-gray-700"
                                                            }`}
                                                        >
                                                            {selected
                                                                ? "Court Selected"
                                                                : "Select Court"}
                                                        </div>

                                                    </button>
                                                );
                                            }
                                        )}

                                    </div>
                                </div>
                            )}
                    </div>

                    {/* =================================================
                        CUSTOMER INFORMATION
                    ================================================== */}

                    <div className="grid gap-5 md:grid-cols-2">

    <div>
        <label className="mb-2 block text-sm font-medium">
            Name
        </label>

        <input
            type="text"
            name="customer_name"
            value={booking.customer_name}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            required
        />
    </div>

    <div>
        <label className="mb-2 block text-sm font-medium">
            Email
        </label>

        <input
            type="email"
            name="customer_email"
            value={booking.customer_email}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            required
        />
    </div>

    <div>
        <label className="mb-2 block text-sm font-medium">
            Phone
        </label>

        <input
            type="text"
            name="customer_phone"
            value={booking.customer_phone}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
    </div>

    <div>
        <label className="mb-2 block text-sm font-medium">
            Membership
        </label>

        <input
            type="text"
            name="membership_type"
            value={booking.membership_type ?? ""}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            placeholder="Optional"
        />
    </div>

    {/* PAYMENT METHOD */}

    <div>
        <label className="mb-2 block text-sm font-medium">
            Payment Method
        </label>

        <select
            name="payment_method"
            value={booking.payment_method}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            required
        >
            <option value="PAYPAL">
                PayPal
            </option>

            <option value="CARD">
                Card
            </option>

            <option value="E_WALLET">
                E-Wallet
            </option>

            <option value="CASH">
                Cash
            </option>

            <option value="BANK_TRANSFER">
                Bank Transfer
            </option>

            <option value="MANUAL">
                Manual Payment
            </option>
        </select>

        <p className="mt-1 text-xs text-gray-500">
            PayPal payments use PayPal Sandbox.
        </p>
    </div>

    <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-medium">
            Notes
        </label>

        <textarea
            name="notes"
            value={booking.notes}
            onChange={handleChange}
            rows="3"
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
    </div>

</div>

                    {/* =================================================
                        BOOKING SUMMARY
                    ================================================== */}

                    <div className="rounded-xl bg-white p-6 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm text-gray-500">
                                    Selected Duration
                                </p>

                                <p className="text-lg font-semibold">
                                    {
                                        booking.duration_minutes
                                    }{" "}
                                    minutes
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Time
                                </p>

                                <p className="text-lg font-semibold">
                                    {
                                        booking.start_time ||
                                        "--:--"
                                    }{" "}
                                    -{" "}
                                    {
                                        endTime ||
                                        "--:--"
                                    }
                                </p>
                            </div>

                        </div>

                        <button
                            type="submit"
                            disabled={
                                submitting ||
                                paymentCreating ||
                                !booking.court_id
                            }
                            className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                            {submitting || paymentCreating
                                ? "Creating Booking & Payment..."
                                : booking.payment_method === "PAYPAL"
                                    ? "Book & Pay with PayPal"
                                    : "Confirm Booking"}
                        </button>

                    </div>

                </form>

            </div>
        </div>
    );
}

export default Index;