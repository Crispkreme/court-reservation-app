
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
    createBooking,
    updateBooking,
} from "@/services/bookingService";

const initialForm = {
    court_id: "",
    user_id: "",
    start_at: "",
    end_at: "",
    duration_minutes: 60,
};

const toDateTimeInput = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Dubai",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(date);

    const get = (type) =>
        parts.find((part) => part.type === type)?.value ?? "";

    return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
};

const toApiDateTime = (value) =>
    value ? `${value.replace("T", " ")}:00` : "";

const calculateDuration = (start, end) => {
    if (!start || !end) return 0;

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime())
    ) {
        return 0;
    }

    return Math.round((endDate - startDate) / 60000);
};

export default function BookingModal({
    open,
    booking,
    courts = [],
    members = [],
    onClose,
    onSuccess,
}) {
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");

    const isEdit = Boolean(booking);

    useEffect(() => {
        if (!open) return;

        setForm(
            booking
                ? {
                      court_id: String(booking.court_id),
                      user_id: String(booking.user_id),
                      start_at: toDateTimeInput(booking.start_at),
                      end_at: toDateTimeInput(booking.end_at),
                      duration_minutes: booking.duration_minutes,
                  }
                : initialForm,
        );

        setErrors({});
        setMessage("");
    }, [open, booking]);

    if (!open) return null;

    const setField = (field, value) => {
        setForm((previous) => {
            const next = { ...previous, [field]: value };

            if (field === "start_at" || field === "end_at") {
                next.duration_minutes = calculateDuration(
                    next.start_at,
                    next.end_at,
                );
            }

            return next;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);
        setErrors({});
        setMessage("");

        try {
            const payload = {
                court_id: Number(form.court_id),
                user_id: Number(form.user_id),
                start_at: toApiDateTime(form.start_at),
                end_at: toApiDateTime(form.end_at),
                duration_minutes: Number(form.duration_minutes),
            };

            if (isEdit) {
                await updateBooking(booking.id, payload);
            } else {
                await createBooking(payload);
            }

            onSuccess?.();
            onClose?.();
        } catch (error) {
            setErrors(error.response?.data?.errors ?? {});
            setMessage(
                error.response?.data?.message ??
                    "Unable to save the booking.",
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500";

    const labelClass =
        "mb-1.5 block text-sm font-medium text-gray-700";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {isEdit ? "Edit Booking" : "Create Booking"}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Enter the reservation details.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid max-h-[65vh] grid-cols-1 gap-4 overflow-y-auto p-6 sm:grid-cols-2">
                        {message && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 sm:col-span-2">
                                {message}
                            </div>
                        )}

                        <div>
                            <label className={labelClass}>Court</label>
                            <select
                                required
                                value={form.court_id}
                                onChange={(event) =>
                                    setField("court_id", event.target.value)
                                }
                                className={inputClass}
                            >
                                <option value="">Select court</option>
                                {courts.map((court) => (
                                    <option key={court.id} value={court.id}>
                                        {court.name}
                                    </option>
                                ))}
                            </select>
                            {errors.court_id && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.court_id[0]}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={labelClass}>Member</label>
                            <select
                                required
                                value={form.user_id}
                                onChange={(event) =>
                                    setField("user_id", event.target.value)
                                }
                                className={inputClass}
                            >
                                <option value="">Select member</option>
                                {members.map((member) => (
                                    <option key={member.id} value={member.id}>
                                        {member.name}
                                    </option>
                                ))}
                            </select>
                            {errors.user_id && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.user_id[0]}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={labelClass}>Start Time</label>
                            <input
                                type="datetime-local"
                                required
                                value={form.start_at}
                                onChange={(event) =>
                                    setField("start_at", event.target.value)
                                }
                                className={inputClass}
                            />
                            {errors.start_at && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.start_at[0]}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={labelClass}>End Time</label>
                            <input
                                type="datetime-local"
                                required
                                value={form.end_at}
                                min={form.start_at || undefined}
                                onChange={(event) =>
                                    setField("end_at", event.target.value)
                                }
                                className={inputClass}
                            />
                            {errors.end_at && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.end_at[0]}
                                </p>
                            )}
                        </div>

                        <div className="sm:col-span-2">
                            <label className={labelClass}>
                                Duration (minutes)
                            </label>
                            <input
                                type="number"
                                readOnly
                                value={form.duration_minutes}
                                className={`${inputClass} bg-gray-50`}
                            />
                            {errors.duration_minutes && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.duration_minutes[0]}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
                        >
                            {loading
                                ? "Saving..."
                                : isEdit
                                  ? "Update Booking"
                                  : "Create Booking"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
