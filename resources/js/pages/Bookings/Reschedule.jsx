
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  UserRound,
  Trophy,
  CreditCard,
  FileText,
  CheckCircle2,
} from "lucide-react";
import Layout from "../../components/layout/Layout";

const initialForm = {
  user_id: "",
  sport_category_id: "",
  court_id: "",
  booking_reference: "",
  booking_date: "",
  start_time: "09:00",
  end_time: "10:00",
  players_count: "1",
  unit_price: "0",
  booking_source: "admin",
  status: "pending",
  membership_type: "none",
  membership_required: false,
  customer_name: "",
  customer_email: "",
  customer_phone: "",
  notes: "",
};

function calculateDuration(start, end) {
  if (!start || !end) return 0;

  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  return endMinutes > startMinutes ? endMinutes - startMinutes : 0;
}

function Section({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 p-5 sm:p-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={20} />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
        {children}
      </div>
    </section>
  );
}

function Field({ label, required, children, className = "" }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function CreateBooking() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const duration = useMemo(
    () => calculateDuration(form.start_time, form.end_time),
    [form.start_time, form.end_time]
  );

  const totalAmount = useMemo(
    () => (duration / 60) * (Number(form.unit_price) || 0),
    [duration, form.unit_price]
  );

  const updateField = (name, value) => {
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
    setSubmitError("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.customer_name.trim()) {
      nextErrors.customer_name = "Customer name is required.";
    }

    if (
      form.customer_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customer_email)
    ) {
      nextErrors.customer_email = "Enter a valid email address.";
    }

    if (!form.sport_category_id) {
      nextErrors.sport_category_id = "Select a sport category.";
    }

    if (!form.court_id) {
      nextErrors.court_id = "Select a court.";
    }

    if (!form.booking_date) {
      nextErrors.booking_date = "Select a booking date.";
    } else {
      const today = new Date();
      const minimumDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
      ].join("-");

      if (form.booking_date < minimumDate) {
        nextErrors.booking_date = "Booking date cannot be in the past.";
      }
    }

    if (!form.start_time || !form.end_time || duration <= 0) {
      nextErrors.end_time = "End time must be later than start time.";
    }

    if (!Number.isInteger(Number(form.players_count)) ||
        Number(form.players_count) < 1) {
      nextErrors.players_count = "Enter at least one player.";
    }

    if (!Number.isFinite(Number(form.unit_price)) ||
        Number(form.unit_price) < 0) {
      nextErrors.unit_price = "Enter a valid price.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError("");

    const payload = {
      ...form,
      user_id: form.user_id ? Number(form.user_id) : null,
      sport_category_id: Number(form.sport_category_id),
      court_id: Number(form.court_id),
      duration_minutes: duration,
      players_count: Number(form.players_count),
      unit_price: Number(form.unit_price),
      total_amount: Number(totalAmount.toFixed(2)),
      membership_required: form.membership_required,
      booking_reference: form.booking_reference.trim() || null,
      customer_name: form.customer_name.trim(),
      customer_email: form.customer_email.trim() || null,
      customer_phone: form.customer_phone.trim() || null,
      notes: form.notes.trim() || null,
    };

    try {
      // Replace this with your Laravel API endpoint.
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          // Add your Laravel API authentication token if required.
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 422 && result.errors) {
          setErrors(result.errors);
          throw new Error("Please correct the highlighted fields.");
        }

        throw new Error(result.message || "Unable to create the booking.");
      }

      navigate("/bookings", {
        state: { successMessage: "Booking created successfully." },
      });
    } catch (error) {
      setSubmitError(
        error.message || "Something went wrong while creating the booking."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const errorText = (name) => {
    const error = errors[name];
    if (!error) return null;

    return (
      <p className="mt-1.5 text-xs text-rose-600">
        {Array.isArray(error) ? error[0] : error}
      </p>
    );
  };

  const today = new Date();
  const minimumDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  return (
    <Layout title="Create Booking">
      <div className="mx-auto w-full max-w-6xl space-y-6 pb-8">
        <div>
          <button
            type="button"
            onClick={() => navigate("/bookings")}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={16} />
            Back to Bookings
          </button>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Create Booking
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create a new court reservation for a customer.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Section
            icon={UserRound}
            title="Customer Information"
            description="Enter the customer's contact and account details."
          >
            <Field label="Customer Name" required>
              <input
                className={inputClass}
                value={form.customer_name}
                onChange={(e) => updateField("customer_name", e.target.value)}
                placeholder="Enter customer name"
                required
              />
              {errorText("customer_name")}
            </Field>

            <Field label="Customer Email">
              <input
                type="email"
                className={inputClass}
                value={form.customer_email}
                onChange={(e) => updateField("customer_email", e.target.value)}
                placeholder="customer@example.com"
              />
              {errorText("customer_email")}
            </Field>

            <Field label="Phone Number">
              <input
                type="tel"
                className={inputClass}
                value={form.customer_phone}
                onChange={(e) => updateField("customer_phone", e.target.value)}
                placeholder="Enter phone number"
              />
            </Field>

            <Field label="Existing User ID">
              <input
                type="number"
                min="1"
                className={inputClass}
                value={form.user_id}
                onChange={(e) => updateField("user_id", e.target.value)}
                placeholder="Optional user ID"
              />
              <p className="mt-1 text-xs text-slate-400">
                Leave blank for a guest booking, if supported by your backend.
              </p>
            </Field>
          </Section>

          <Section
            icon={Trophy}
            title="Booking Details"
            description="Choose the sport, court, date, and reservation time."
          >
            <Field label="Sport Category ID" required>
              <input
                type="number"
                min="1"
                className={inputClass}
                value={form.sport_category_id}
                onChange={(e) =>
                  updateField("sport_category_id", e.target.value)
                }
                placeholder="Enter sport category ID"
                required
              />
              {errorText("sport_category_id")}
              <p className="mt-1 text-xs text-slate-400">
                Replace with a dropdown populated from your sport categories API.
              </p>
            </Field>

            <Field label="Court ID" required>
              <input
                type="number"
                min="1"
                className={inputClass}
                value={form.court_id}
                onChange={(e) => updateField("court_id", e.target.value)}
                placeholder="Enter court ID"
                required
              />
              {errorText("court_id")}
              <p className="mt-1 text-xs text-slate-400">
                Replace with a court dropdown filtered by sport category.
              </p>
            </Field>

            <Field label="Booking Date" required>
              <div className="relative">
                <CalendarDays
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="date"
                  min={minimumDate}
                  className={`${inputClass} pl-10`}
                  value={form.booking_date}
                  onChange={(e) => updateField("booking_date", e.target.value)}
                  required
                />
              </div>
              {errorText("booking_date")}
            </Field>

            <Field label="Number of Players" required>
              <input
                type="number"
                min="1"
                className={inputClass}
                value={form.players_count}
                onChange={(e) => updateField("players_count", e.target.value)}
                required
              />
              {errorText("players_count")}
            </Field>

            <Field label="Start Time" required>
              <div className="relative">
                <Clock
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="time"
                  className={`${inputClass} pl-10`}
                  value={form.start_time}
                  onChange={(e) => updateField("start_time", e.target.value)}
                  required
                />
              </div>
            </Field>

            <Field label="End Time" required>
              <div className="relative">
                <Clock
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="time"
                  className={`${inputClass} pl-10`}
                  value={form.end_time}
                  onChange={(e) => updateField("end_time", e.target.value)}
                  required
                />
              </div>
              {errorText("end_time")}
            </Field>

            <div className="rounded-lg bg-blue-50 p-4 sm:col-span-2">
              <p className="text-xs font-medium text-blue-700">
                Booking Duration
              </p>
              <p className="mt-1 text-xl font-bold text-blue-900">
                {duration > 0
                  ? `${Math.floor(duration / 60)}h ${duration % 60}m`
                  : "Select a valid time range"}
              </p>
              <p className="mt-1 text-xs text-blue-700">
                {duration} minutes
              </p>
            </div>
          </Section>

          <Section
            icon={CreditCard}
            title="Pricing and Membership"
            description="Set the price and membership requirements."
          >
            <Field label="Unit Price per Hour" required>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={form.unit_price}
                onChange={(e) => updateField("unit_price", e.target.value)}
                required
              />
              {errorText("unit_price")}
              <p className="mt-1 text-xs text-slate-400">
                Confirm the currency and pricing rules used by your system.
              </p>
            </Field>

            <Field label="Membership Type">
              <select
                className={inputClass}
                value={form.membership_type}
                onChange={(e) => updateField("membership_type", e.target.value)}
              >
                <option value="none">No Membership</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="vip">VIP</option>
              </select>
              <p className="mt-1 text-xs text-slate-400">
                Update these options to match your database values.
              </p>
            </Field>

            <Field label="Membership Required">
              <label className="flex min-h-10 items-center gap-3 rounded-lg border border-slate-200 px-3.5 py-2.5">
                <input
                  type="checkbox"
                  checked={form.membership_required}
                  onChange={(e) =>
                    updateField("membership_required", e.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">
                  Customer must have a membership
                </span>
              </label>
            </Field>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Estimated Total</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {totalAmount.toLocaleString("en-PH", {
                  style: "currency",
                  currency: "PHP",
                })}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {duration} minutes × hourly rate, before any discounts or fees.
              </p>
            </div>
          </Section>

          <Section
            icon={FileText}
            title="Booking Settings"
            description="Set the booking reference, source, status, and notes."
          >
            <Field label="Booking Reference">
              <input
                className={inputClass}
                value={form.booking_reference}
                onChange={(e) =>
                  updateField("booking_reference", e.target.value)
                }
                placeholder="Leave blank to generate on the server"
              />
            </Field>

            <Field label="Booking Source" required>
              <select
                className={inputClass}
                value={form.booking_source}
                onChange={(e) => updateField("booking_source", e.target.value)}
              >
                <option value="admin">Admin</option>
                <option value="website">Website</option>
                <option value="mobile">Mobile App</option>
              </select>
            </Field>

            <Field label="Initial Status" required>
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
              </select>
              <p className="mt-1 text-xs text-slate-400">
                Only use status values allowed by your Laravel validation.
              </p>
            </Field>

            <Field label="Notes" className="sm:col-span-2">
              <textarea
                rows={4}
                maxLength={2000}
                className={inputClass}
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Additional booking notes or customer requests..."
              />
            </Field>
          </Section>

          {submitError && (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
            >
              {submitError}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <p className="text-xs text-slate-500">
                Review the updated booking details before saving.
            </p>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap">
                <button
                type="button"
                onClick={() => navigate("/bookings")}
                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                Cancel
                </button>

                <button
                type="button"
                onClick={handleReschedule}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                <CalendarDays size={17} />
                Reschedule
                </button>

                <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                <CheckCircle2 size={17} />
                {submitting ? "Updating..." : "Update Booking"}
                </button>
            </div>
            </div>
        </form>
      </div>
    </Layout>
  );
}
