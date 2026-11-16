import React, { useEffect, useState } from "react";
import { X, Check, Loader2, CalendarDays, Clock3, CalendarRange, Building2, Activity, FileText } from "lucide-react";
import FormInput from "@components/common/FormInput";
import FormSelect from "@components/common/FormSelect";
import FormTextarea from "@components/common/FormTextarea";
import { createRecurringSchedule, updateRecurringSchedule, deleteRecurringSchedule } from "@services/courtRecurringScheduleService";

const weekdays = [
    { value: 0, label: "Sun" },
    { value: 1, label: "Mon" },
    { value: 2, label: "Tue" },
    { value: 3, label: "Wed" },
    { value: 4, label: "Thu" },
    { value: 5, label: "Fri" },
    { value: 6, label: "Sat" },
];

const getToday = () => {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Dubai",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());
    const value = (type) => parts.find((part) => part.type === type)?.value;

    return `${value("year")}-${value("month")}-${value("day")}`;
};

const getInitialForm = (schedule) => {
    if (!schedule) {
        return {
            court_id: "",
            days: [],
            opening_time: "08:00",
            closing_time: "22:00",
            status: "open",
            effective_from: getToday(),
            effective_until: "",
            is_active: true,
            notes: "",
        };
    }

    return {
        court_id: String(schedule.court_id),
        days: [Number(schedule.day_of_week)],
        opening_time: schedule.opening_time?.slice(0, 5) || "08:00",
        closing_time: schedule.closing_time?.slice(0, 5) || "22:00",
        status: schedule.status || "open",
        effective_from: schedule.effective_from?.slice(0, 10) || "",
        effective_until: schedule.effective_until?.slice(0, 10) || "",
        is_active: Boolean(schedule.is_active),
        notes: schedule.notes || "",
    };
};

const getError = (error) => {
    const errors = error.response?.data?.errors;

    if (errors) {
        return Object.values(errors).flat().join(" ");
    }

    return error.response?.data?.message || "Something went wrong.";
};

export default function RecurringScheduleModal({
    open,
    onClose,
    onSuccess,
    schedule = null,
    courts = [],
}) {
    const [form, setForm] = useState(() => getInitialForm(schedule));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    const editing = Boolean(schedule);

    useEffect(() => {
        if (open) {
            setForm(getInitialForm(schedule));
            setError("");
            setFieldErrors({});
        }
    }, [open, schedule]);

    const updateField = (name, value) => {
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        setFieldErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const toggleDay = (day) => {
        if (editing || saving) return;

        setForm((prev) => ({
            ...prev,
            days: prev.days.includes(day)
                ? prev.days.filter((item) => item !== day)
                : [...prev.days, day],
        }));

        setFieldErrors((prev) => ({
            ...prev,
            days: "",
        }));
    };

    const validateForm = () => {
        const errors = {};

        if (!form.court_id) {
            errors.court_id = "Please select a court.";
        }

        if (!form.days.length) {
            errors.days = "Please select at least one weekday.";
        }

        if (form.status === "open") {
            if (!form.opening_time) {
                errors.opening_time = "Opening time is required.";
            }

            if (!form.closing_time) {
                errors.closing_time = "Closing time is required.";
            }

            if (
                form.opening_time &&
                form.closing_time &&
                form.closing_time <= form.opening_time
            ) {
                errors.closing_time = "Closing time must be later than opening time.";
            }
        }

        if (!form.effective_from) {
            errors.effective_from = "Effective start date is required.";
        }

        if (
            form.effective_until &&
            form.effective_from &&
            form.effective_until < form.effective_from
        ) {
            errors.effective_until = "End date cannot be earlier than start date.";
        }

        setFieldErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) return;

        setSaving(true);
        setError("");
        setFieldErrors({});

        try {
            const payload = {
                court_id: Number(form.court_id),
                opening_time: form.status === "open" ? form.opening_time : null,
                closing_time: form.status === "open" ? form.closing_time : null,
                status: form.status,
                effective_from: form.effective_from,
                effective_until: form.effective_until || null,
                is_active: form.is_active,
                notes: form.notes || null,
            };

            if (editing) {
                await updateRecurringSchedule(schedule.id, {
                    ...payload,
                    day_of_week: form.days[0],
                });
            } else {
                const createdIds = [];

                try {
                    for (const day of form.days) {
                        const response = await createRecurringSchedule({
                            ...payload,
                            day_of_week: day,
                        });

                        const created = response?.data;

                        if (created?.id) {
                            createdIds.push(created.id);
                        }
                    }
                } catch (err) {
                    await Promise.allSettled(
                        createdIds.map((id) =>
                            deleteRecurringSchedule(id)
                        )
                    );

                    throw err;
                }
            }

            onSuccess?.(
                editing
                    ? "Recurring schedule updated successfully."
                    : "Recurring schedule created successfully."
            );

            onClose?.();
        } catch (err) {
            const errors = err.response?.data?.errors;

            if (errors) {
                const mappedErrors = {};

                Object.entries(errors).forEach(([key, messages]) => {
                    const field = key === "day_of_week" ? "days" : key;

                    mappedErrors[field] = Array.isArray(messages)
                        ? messages[0]
                        : String(messages);
                });

                setFieldErrors(mappedErrors);
            }

            setError(getError(err));
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            role="presentation"
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="recurring-schedule-title"
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
            >
                <div className="flex items-center justify-between border-b border-slate-200 p-6">
                    <div>
                        <h2
                            id="recurring-schedule-title"
                            className="text-lg font-bold text-slate-900"
                        >
                            {editing
                                ? "Edit Recurring Schedule"
                                : "Create Recurring Schedule"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Configure weekly operating hours and court availability.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close modal"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 p-6">
                    {error && (
                        <div
                            role="alert"
                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        >
                            {error}
                        </div>
                    )}

                    <FormSelect
                        label="Court"
                        name="court_id"
                        icon={Building2}
                        value={form.court_id}
                        onChange={(e) =>
                            updateField("court_id", e.target.value)
                        }
                        options={courts.map((court) => ({
                            value: String(court.id),
                            label: court.name,
                        }))}
                        placeholder="Select Court"
                        error={fieldErrors.court_id}
                        required
                        disabled={saving}
                    />

                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <CalendarDays
                                size={18}
                                className="text-slate-500"
                            />

                            <label className="text-sm font-semibold text-slate-700">
                                Repeat On
                                <span className="ml-1 text-red-600">*</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                            {weekdays.map((day) => {
                                const selected = form.days.includes(day.value);

                                return (
                                    <button
                                        key={day.value}
                                        type="button"
                                        onClick={() => toggleDay(day.value)}
                                        disabled={editing || saving}
                                        aria-pressed={selected}
                                        className={`rounded-xl border px-1 py-3 text-xs font-semibold transition ${
                                            selected
                                                ? "border-red-600 bg-red-50 text-red-700"
                                                : "border-slate-200 bg-[#FAFAFA] text-slate-600 hover:border-slate-300"
                                        } disabled:cursor-not-allowed disabled:opacity-70`}
                                    >
                                        {day.label}
                                    </button>
                                );
                            })}
                        </div>

                        {fieldErrors.days && (
                            <p
                                role="alert"
                                className="mt-2 text-xs font-medium text-red-600"
                            >
                                {fieldErrors.days}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormSelect
                            label="Schedule Status"
                            name="status"
                            icon={Activity}
                            value={form.status}
                            onChange={(e) =>
                                updateField("status", e.target.value)
                            }
                            options={[
                                { value: "open", label: "Open" },
                                { value: "closed", label: "Closed" },
                            ]}
                            placeholder=""
                            error={fieldErrors.status}
                            required
                            disabled={saving}
                        />

                        <div className="flex flex-col justify-end">
                            <label className="flex min-h-[50px] items-center gap-3 rounded-xl border border-slate-200 bg-[#FAFAFA] px-4 py-3">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={form.is_active}
                                    onChange={(e) =>
                                        updateField(
                                            "is_active",
                                            e.target.checked
                                        )
                                    }
                                    disabled={saving}
                                    className="h-4 w-4 accent-red-700"
                                />

                                <span className="text-sm font-semibold text-slate-700">
                                    Active Schedule
                                </span>
                            </label>
                        </div>
                    </div>

                    {form.status === "open" && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormInput
                                label="Opening Time"
                                name="opening_time"
                                type="time"
                                icon={Clock3}
                                value={form.opening_time}
                                onChange={(e) =>
                                    updateField(
                                        "opening_time",
                                        e.target.value
                                    )
                                }
                                error={fieldErrors.opening_time}
                                required
                                disabled={saving}
                            />

                            <FormInput
                                label="Closing Time"
                                name="closing_time"
                                type="time"
                                icon={Clock3}
                                value={form.closing_time}
                                onChange={(e) =>
                                    updateField(
                                        "closing_time",
                                        e.target.value
                                    )
                                }
                                error={fieldErrors.closing_time}
                                required
                                disabled={saving}
                            />
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput
                            label="Effective From"
                            name="effective_from"
                            type="date"
                            icon={CalendarRange}
                            value={form.effective_from}
                            onChange={(e) =>
                                updateField(
                                    "effective_from",
                                    e.target.value
                                )
                            }
                            error={fieldErrors.effective_from}
                            required
                            disabled={saving}
                        />

                        <FormInput
                            label="Effective Until"
                            name="effective_until"
                            type="date"
                            icon={CalendarRange}
                            value={form.effective_until}
                            min={form.effective_from}
                            onChange={(e) =>
                                updateField(
                                    "effective_until",
                                    e.target.value
                                )
                            }
                            error={fieldErrors.effective_until}
                            disabled={saving}
                        />
                    </div>

                    <FormTextarea
                        label="Notes"
                        name="notes"
                        value={form.notes}
                        onChange={(e) =>
                            updateField("notes", e.target.value)
                        }
                        placeholder="Enter optional schedule notes..."
                        rows={3}
                        maxLength={2000}
                        error={fieldErrors.notes}
                        disabled={saving}
                    />

                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? (
                                <Loader2
                                    size={17}
                                    className="animate-spin"
                                />
                            ) : (
                                <Check size={17} />
                            )}

                            {saving
                                ? "Saving..."
                                : editing
                                  ? "Save Changes"
                                  : "Create Schedule"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}