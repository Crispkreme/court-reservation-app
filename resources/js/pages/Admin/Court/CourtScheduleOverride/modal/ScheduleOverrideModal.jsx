import React, { useEffect, useState } from "react";
import { X, Check, Loader2, Building2, CalendarDays, Clock3, Activity } from "lucide-react";
import FormInput from "@components/common/FormInput";
import FormSelect from "@components/common/FormSelect";
import FormTextarea from "@components/common/FormTextarea";
import { createScheduleOverride, updateScheduleOverride } from "@services/courtScheduleOverrideService";

const getToday = () => {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Dubai",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const value = (type) =>
        parts.find((part) => part.type === type)?.value;

    return `${value("year")}-${value("month")}-${value("day")}`;
};

const initialForm = (schedule) => ({
    court_id: schedule ? String(schedule.court_id) : "",
    date: schedule?.date?.slice(0, 10) || getToday(),
    status: schedule?.status || "open",
    opening_time: schedule?.opening_time?.slice(0, 5) || "08:00",
    closing_time: schedule?.closing_time?.slice(0, 5) || "22:00",
    notes: schedule?.notes || "",
});

export default function ScheduleOverrideModal({
    open,
    schedule = null,
    courts = [],
    onClose,
    onSuccess,
}) {
    const [form, setForm] = useState(() => initialForm(schedule));
    const [errors, setErrors] = useState({});
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const editing = Boolean(schedule);

    useEffect(() => {
        if (open) {
            setForm(initialForm(schedule));
            setErrors({});
            setError("");
        }
    }, [open, schedule]);

    const updateField = (name, value) => {
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const validate = () => {
        const nextErrors = {};

        if (!form.court_id) {
            nextErrors.court_id = "Please select a court.";
        }

        if (!form.date) {
            nextErrors.date = "Please select a date.";
        }

        if (form.status === "open") {
            if (!form.opening_time) {
                nextErrors.opening_time = "Opening time is required.";
            }

            if (!form.closing_time) {
                nextErrors.closing_time = "Closing time is required.";
            }

            if (
                form.opening_time &&
                form.closing_time &&
                form.closing_time <= form.opening_time
            ) {
                nextErrors.closing_time =
                    "Closing time must be later than opening time.";
            }
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validate()) return;

        setSaving(true);
        setError("");
        setErrors({});

        try {
            const payload = {
                court_id: Number(form.court_id),
                date: form.date,
                status: form.status,
                opening_time:
                    form.status === "open" ? form.opening_time : null,
                closing_time:
                    form.status === "open" ? form.closing_time : null,
                notes: form.notes.trim() || null,
            };

            if (editing) {
                await updateScheduleOverride(schedule.id, payload);
            } else {
                await createScheduleOverride(payload);
            }

            onSuccess?.(
                editing
                    ? "Schedule override updated successfully."
                    : "Schedule override created successfully."
            );

            onClose?.();
        } catch (err) {
            const backendErrors = err.response?.data?.errors;

            if (backendErrors) {
                setErrors(
                    Object.fromEntries(
                        Object.entries(backendErrors).map(
                            ([key, messages]) => [
                                key,
                                Array.isArray(messages)
                                    ? messages[0]
                                    : String(messages),
                            ]
                        )
                    )
                );
            }

            setError(
                err.response?.data?.message ||
                    "Unable to save schedule override."
            );
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="override-modal-title"
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
            >
                <div className="flex items-center justify-between border-b border-slate-200 p-6">
                    <div>
                        <h2
                            id="override-modal-title"
                            className="text-lg font-bold text-slate-900"
                        >
                            {editing
                                ? "Edit Schedule Override"
                                : "Create Schedule Override"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Override the regular schedule for one specific date.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close"
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 p-6">
                    {error && (
                        <div
                            role="alert"
                            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
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
                        error={errors.court_id}
                        required
                        disabled={saving}
                    />

                    <FormInput
                        label="Override Date"
                        name="date"
                        type="date"
                        icon={CalendarDays}
                        value={form.date}
                        onChange={(e) =>
                            updateField("date", e.target.value)
                        }
                        error={errors.date}
                        required
                        disabled={saving}
                    />

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
                        error={errors.status}
                        required
                        disabled={saving}
                    />

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
                                error={errors.opening_time}
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
                                error={errors.closing_time}
                                required
                                disabled={saving}
                            />
                        </div>
                    )}

                    <FormTextarea
                        label="Reason / Notes"
                        name="notes"
                        value={form.notes}
                        onChange={(e) =>
                            updateField("notes", e.target.value)
                        }
                        placeholder="e.g. Holiday, special event, adjusted operating hours..."
                        rows={3}
                        maxLength={2000}
                        error={errors.notes}
                        disabled={saving}
                    />

                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        This override applies only to the selected date.
                        Existing confirmed bookings may prevent closing
                        the court or reducing its operating hours.
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
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
                                  : "Create Override"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
