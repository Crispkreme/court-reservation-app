import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Trophy,
  UserRound,
} from "lucide-react";

import Layout from "../../components/layout/Layout";
import ErrorText from "../../components/ErrorText";
import Section from "../../components/Section";
import Field from "../../components/Field";

import api from "../../services/api";
import { getSportCategories } from "../../services/sportCategoryService";
import { getCourts } from "../../services/courtService";

import {
  calculateDuration,
  calculateTotalAmount,
  formatCurrency,
  getTodayDate,
} from "../../utils/formatters";

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

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const getCollection = (response) => {
  // Supports Laravel pagination: { data: { data: [...] } }
  // and ordinary Laravel collections: { data: [...] }.
  const body = response?.data;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray(response?.data?.data?.data)) return response.data.data.data;
  return [];
};

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Something went wrong. Please try again.";

export default function CreateBooking() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [courts, setCourts] = useState([]);
  const [sportCategories, setSportCategories] = useState([]);
  const [loadingCourts, setLoadingCourts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const minimumDate = getTodayDate();

  useEffect(() => {
    let active = true;

    const fetchSportCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await getSportCategories();

        if (active) {
          setSportCategories(getCollection(response));
        }
      } catch (error) {
        console.error("Failed to load sport categories:", error);
        if (active) {
          setSubmitError(
            error?.response?.data?.message ||
              "Unable to load sport categories. Please refresh the page."
          );
        }
      } finally {
        if (active) setLoadingCategories(false);
      }
    };

    fetchSportCategories();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const fetchCourts = async () => {
      try {
        setLoadingCourts(true);
        const response = await getCourts({ per_page: 100 });

        if (active) {
          setCourts(getCollection(response));
        }
      } catch (error) {
        console.error("Failed to load courts:", error);
        if (active) {
          setSubmitError(
            error?.response?.data?.message ||
              "Unable to load courts. Please refresh the page."
          );
        }
      } finally {
        if (active) setLoadingCourts(false);
      }
    };

    fetchCourts();

    return () => {
      active = false;
    };
  }, []);

  const duration = useMemo(
    () => calculateDuration(form.start_time, form.end_time),
    [form.start_time, form.end_time]
  );

  const totalAmount = useMemo(
    () => calculateTotalAmount(duration, form.unit_price),
    [duration, form.unit_price]
  );

  const availableCourts = useMemo(() => {
    if (!form.sport_category_id) return [];

    return courts.filter((court) => {
      const categoryId =
        court.sport_category_id ?? court.sport_category?.id;

      const active =
        court.is_active !== false &&
        court.is_available !== false &&
        court.status !== "inactive";

      return (
        Number(categoryId) === Number(form.sport_category_id) && active
      );
    });
  }, [courts, form.sport_category_id]);

  const updateField = (name, value) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "sport_category_id" ? { court_id: "" } : {}),
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      ...(name === "sport_category_id" ? { court_id: "" } : {}),
    }));

    setSubmitError("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.customer_name.trim()) {
      nextErrors.customer_name = "Customer name is required.";
    }

    if (
      form.customer_email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customer_email.trim())
    ) {
      nextErrors.customer_email = "Enter a valid email address.";
    }

    if (!form.sport_category_id) {
      nextErrors.sport_category_id = "Select a sport category.";
    }

    if (!form.court_id) {
      nextErrors.court_id = "Select a court.";
    } else if (
      !availableCourts.some(
        (court) => Number(court.id) === Number(form.court_id)
      )
    ) {
      nextErrors.court_id =
        "The selected court is not available for this sport category.";
    }

    if (!form.booking_date) {
      nextErrors.booking_date = "Select a booking date.";
    } else if (form.booking_date < minimumDate) {
      nextErrors.booking_date = "Booking date cannot be in the past.";
    }

    if (!form.start_time || !form.end_time || duration <= 0) {
      nextErrors.end_time = "End time must be later than start time.";
    }

    const playersCount = Number(form.players_count);
    if (!Number.isInteger(playersCount) || playersCount < 1) {
      nextErrors.players_count = "Enter a valid number of players (at least 1).";
    }

    const unitPrice = Number(form.unit_price);
    if (
      form.unit_price === "" ||
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      nextErrors.unit_price = "Enter a valid price.";
    }

    if (form.user_id && (!Number.isInteger(Number(form.user_id)) || Number(form.user_id) < 1)) {
      nextErrors.user_id = "Enter a valid user ID.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting || !validate()) return;

    setSubmitting(true);
    setSubmitError("");

    // Send the booking fields expected by the bookings API.
    // Time values are normalized to HH:mm:ss for Laravel.
    const payload = {
      user_id: form.user_id ? Number(form.user_id) : null,
      sport_category_id: Number(form.sport_category_id),
      court_id: Number(form.court_id),
      booking_reference: form.booking_reference.trim() || null,
      booking_date: form.booking_date,
      start_time: `${form.start_time}:00`,
      end_time: `${form.end_time}:00`,
      duration_minutes: duration,
      players_count: Number(form.players_count),
      unit_price: Number(form.unit_price),
      total_amount: Number(totalAmount.toFixed(2)),
      booking_source: form.booking_source,
      status: form.status,
      customer_name: form.customer_name.trim(),
      customer_email: form.customer_email.trim() || null,
      customer_phone: form.customer_phone.trim() || null,
      notes: form.notes.trim() || null,
    };

    try {
      await api.post("/bookings", payload);

      navigate("/bookings", {
        state: { successMessage: "Booking created successfully." },
      });
    } catch (error) {
      const responseErrors = error?.response?.data?.errors;

      if (error?.response?.status === 422 && responseErrors) {
        const normalizedErrors = Object.fromEntries(
          Object.entries(responseErrors).map(([key, value]) => [
            key,
            Array.isArray(value) ? value[0] : value,
          ])
        );

        setErrors((previous) => ({ ...previous, ...normalizedErrors }));
        setSubmitError("Please correct the highlighted fields.");
      } else {
        setSubmitError(getErrorMessage(error));
      }

      console.error("Failed to create booking:", error);
    } finally {
      setSubmitting(false);
    }
  };

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
                onChange={(event) =>
                  updateField("customer_name", event.target.value)
                }
                placeholder="Enter customer name"
                autoComplete="name"
                required
              />
              <ErrorText error={errors.customer_name} />
            </Field>

            <Field label="Customer Email">
              <input
                type="email"
                className={inputClass}
                value={form.customer_email}
                onChange={(event) =>
                  updateField("customer_email", event.target.value)
                }
                placeholder="customer@example.com"
                autoComplete="email"
              />
              <ErrorText error={errors.customer_email} />
            </Field>

            <Field label="Phone Number">
              <input
                type="tel"
                className={inputClass}
                value={form.customer_phone}
                onChange={(event) =>
                  updateField("customer_phone", event.target.value)
                }
                placeholder="Enter phone number"
                autoComplete="tel"
              />
              <ErrorText error={errors.customer_phone} />
            </Field>

            <Field label="Existing User ID">
              <input
                type="number"
                min="1"
                step="1"
                className={inputClass}
                value={form.user_id}
                onChange={(event) =>
                  updateField("user_id", event.target.value)
                }
                placeholder="Optional user ID"
              />
              <ErrorText error={errors.user_id} />
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
            <Field label="Sport Category" required>
              <select
                className={inputClass}
                value={form.sport_category_id}
                onChange={(event) =>
                  updateField("sport_category_id", event.target.value)
                }
                required
                disabled={loadingCategories}
              >
                <option value="">
                  {loadingCategories
                    ? "Loading sport categories..."
                    : "Select a sport category"}
                </option>

                {sportCategories
                  .filter((category) => category.is_active !== false)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
              <ErrorText error={errors.sport_category_id} />
              {!loadingCategories && sportCategories.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  No sport categories were returned by the server.
                </p>
              )}
            </Field>

            <Field label="Court" required>
              <select
                className={inputClass}
                value={form.court_id}
                onChange={(event) =>
                  updateField("court_id", event.target.value)
                }
                disabled={
                  !form.sport_category_id ||
                  loadingCourts ||
                  availableCourts.length === 0
                }
                required
              >
                <option value="">
                  {!form.sport_category_id
                    ? "Select a sport category first"
                    : loadingCourts
                      ? "Loading courts..."
                      : availableCourts.length === 0
                        ? "No active courts for this category"
                        : "Select a court"}
                </option>

                {availableCourts.map((court) => (
                  <option key={court.id} value={court.id}>
                    {court.name}
                  </option>
                ))}
              </select>
              <ErrorText error={errors.court_id} />
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
                  onChange={(event) =>
                    updateField("booking_date", event.target.value)
                  }
                  required
                />
              </div>
              <ErrorText error={errors.booking_date} />
            </Field>

            <Field label="Number of Players" required>
              <input
                type="number"
                min="1"
                step="1"
                className={inputClass}
                value={form.players_count}
                onChange={(event) =>
                  updateField("players_count", event.target.value)
                }
                required
              />
              <ErrorText error={errors.players_count} />
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
                  onChange={(event) =>
                    updateField("start_time", event.target.value)
                  }
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
                  onChange={(event) =>
                    updateField("end_time", event.target.value)
                  }
                  required
                />
              </div>
              <ErrorText error={errors.end_time} />
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
              <p className="mt-1 text-xs text-blue-700">{duration} minutes</p>
            </div>
          </Section>

          <Section
            icon={CreditCard}
            title="Pricing and Membership"
            description="Set the hourly price and review the estimated booking total."
          >
            <Field label="Unit Price per Hour" required>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={form.unit_price}
                onChange={(event) =>
                  updateField("unit_price", event.target.value)
                }
                required
              />
              <ErrorText error={errors.unit_price} />
              <p className="mt-1 text-xs text-slate-400">
                Enter the hourly rate in the currency configured for your system.
              </p>
            </Field>

            <Field label="Membership Type">
              <select
                className={inputClass}
                value={form.membership_type}
                onChange={(event) =>
                  updateField("membership_type", event.target.value)
                }
              >
                <option value="none">No Membership</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="vip">VIP</option>
              </select>
              <p className="mt-1 text-xs text-slate-400">
                This is currently a form-only field until your booking API
                supports membership types.
              </p>
            </Field>

            <Field label="Membership Required">
              <label className="flex min-h-10 items-center gap-3 rounded-lg border border-slate-200 px-3.5 py-2.5">
                <input
                  type="checkbox"
                  checked={form.membership_required}
                  onChange={(event) =>
                    updateField("membership_required", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">
                  Customer must have a membership
                </span>
              </label>
              <p className="mt-1 text-xs text-slate-400">
                This setting is displayed here but is not submitted unless the
                Laravel booking endpoint is configured to accept it.
              </p>
            </Field>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Estimated Total</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {formatCurrency(totalAmount)}
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
                onChange={(event) =>
                  updateField("booking_reference", event.target.value)
                }
                placeholder="Leave blank to generate on the server"
              />
              <ErrorText error={errors.booking_reference} />
            </Field>

            <Field label="Booking Source" required>
              <select
                className={inputClass}
                value={form.booking_source}
                onChange={(event) =>
                  updateField("booking_source", event.target.value)
                }
                required
              >
                <option value="admin">Admin</option>
                <option value="website">Website</option>
                <option value="mobile">Mobile App</option>
              </select>
              <ErrorText error={errors.booking_source} />
            </Field>

            <Field label="Initial Status" required>
              <select
                className={inputClass}
                value={form.status}
                onChange={(event) => updateField("status", event.target.value)}
                required
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
              </select>
              <ErrorText error={errors.status} />
              <p className="mt-1 text-xs text-slate-400">
                Make sure these values match the status rules in your Laravel
                validation.
              </p>
            </Field>

            <Field label="Notes" className="sm:col-span-2">
              <textarea
                rows={4}
                maxLength={2000}
                className={inputClass}
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                placeholder="Additional booking notes or customer requests..."
              />
              <ErrorText error={errors.notes} />
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
              Fields marked with * are required.
            </p>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/bookings")}
                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  submitting ||
                  loadingCategories ||
                  loadingCourts ||
                  !sportCategories.length ||
                  !courts.length
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2 size={17} />
                {submitting ? "Creating Booking..." : "Create Booking"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
