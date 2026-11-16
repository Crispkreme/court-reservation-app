
import { useEffect, useState } from "react";
import { CalendarClock, X } from "lucide-react";
import { toLocalInput, toUtc } from "@utils/index.js";
import FormInput from "@components/common/FormInput";
import FormSelect from "@components/common/FormSelect";
import FormTextarea from "@components/common/FormTextarea";

const emptyForm = {
    court_id: "",
    start_at: "",
    end_at: "",
    reason: "",
};

export default function MaintenanceModal({
    isOpen,
    onClose,
    onSave,
    courts = [],
    maintenance = null,
    saving = false,
}) {
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});

    const isEdit = Boolean(maintenance?.id);

    useEffect(() => {
        if (!isOpen) return;

        setForm(
            maintenance
                ? {
                      court_id: String(maintenance.court_id ?? ""),
                      start_at: toLocalInput(maintenance.start_at),
                      end_at: toLocalInput(maintenance.end_at),
                      reason: maintenance.reason ?? "",
                  }
                : { ...emptyForm }
        );

        setErrors({});
    }, [isOpen, maintenance]);

    if (!isOpen) return null;

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const nextErrors = {};

        if (!form.court_id) {
            nextErrors.court_id = "Please select a court.";
        }

        if (!form.start_at) {
            nextErrors.start_at = "Start date is required.";
        }

        if (!form.end_at) {
            nextErrors.end_at = "End date is required.";
        }

        if (
            form.start_at &&
            form.end_at &&
            form.end_at <= form.start_at
        ) {
            nextErrors.end_at = "End date must be after start date.";
        }

        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            return;
        }

        try {
            await onSave({
                court_id: Number(form.court_id),
                start_at: toUtc(form.start_at),
                end_at: toUtc(form.end_at),
                reason: form.reason.trim() || null,
            });
        } catch (error) {
            const validationErrors = error.response?.data?.errors;

            if (validationErrors) {
                setErrors(
                    Object.fromEntries(
                        Object.entries(validationErrors).map(
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
        }
    };

    const inputClass =
        "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-gray-100";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-red-50 p-3 text-red-600">
                            <CalendarClock size={22} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {isEdit
                                    ? "Edit Maintenance Period"
                                    : "Schedule Maintenance"}
                            </h2>
                            <p className="text-sm text-gray-500">
                                Set the court maintenance schedule.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>
                                
                <form onSubmit={handleSubmit}>
                    <div className="space-y-5 px-6 py-6">
                        <FormSelect
                            label="Court"
                            name="court_id"
                            value={form.court_id}
                            onChange={handleChange}
                            options={[
                                { value: "", label: "Select Court" },
                                ...courts.map((court) => ({
                                    value: String(court.id),
                                    label: court.name,
                                })),
                            ]}
                            disabled={saving}
                            required
                            error={errors.court_id}
                        />

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormInput
                                label="Start Date & Time"
                                type="datetime-local"
                                name="start_at"
                                value={form.start_at}
                                onChange={handleChange}
                                disabled={saving}
                                required
                                error={errors.start_at}
                            />

                            <FormInput
                                label="End Date & Time"
                                type="datetime-local"
                                name="end_at"
                                value={form.end_at}
                                onChange={handleChange}
                                disabled={saving}
                                required
                                error={errors.end_at}
                            />
                        </div>

                        <FormTextarea
                            label="Reason"
                            name="reason"
                            value={form.reason}
                            onChange={handleChange}
                            disabled={saving}
                            maxLength={2000}
                            rows={4}
                            placeholder="Enter maintenance reason..."
                            error={errors.reason}
                        />
                    </div>

                    <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                            {saving
                                ? "Saving..."
                                : isEdit
                                ? "Update Maintenance"
                                : "Schedule Maintenance"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
