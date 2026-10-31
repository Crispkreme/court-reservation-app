
import { useEffect } from "react";
import { X } from "lucide-react";

const CancellationPolicyModal = ({
    isOpen,
    onClose,
    editingPolicy,
    form,
    updateField,
    resetForm,
    submit,
    saving,
    getError,
    cancellationTypes,
}) => {
    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        const handleEscape = (event) => {
            if (event.key === "Escape" && !saving) {
                onClose();
            }
        };

        window.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, saving, onClose]);

    if (!isOpen) return null;

    const inputClass =
        "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

    const renderError = (field) =>
        getError(field) ? (
            <p className="mt-1 text-sm text-red-600">
                {getError(field)}
            </p>
        ) : null;

    const handleSubmit = (event) => {
        event.preventDefault();
        submit(event);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-5"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !saving) {
                    onClose();
                }
            }}
        >
            <div className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">
                            {editingPolicy
                                ? "Edit Cancellation Policy"
                                : "Create Cancellation Policy"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Define when a booking can be refunded and how much.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">

                        <div className="grid gap-5 md:grid-cols-2">

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Policy Name
                                </label>

                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) =>
                                        updateField("name", e.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="Customer Cancellation - Within 24 Hours"
                                    required
                                />

                                {renderError("name")}
                            </div>

                            {/* Cancellation Type */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Cancellation Type
                                </label>

                                <select
                                    value={form.cancellation_type}
                                    onChange={(e) =>
                                        updateField(
                                            "cancellation_type",
                                            e.target.value
                                        )
                                    }
                                    className={inputClass}
                                >
                                    {cancellationTypes.map((type) => (
                                        <option
                                            key={type.value}
                                            value={type.value}
                                        >
                                            {type.label}
                                        </option>
                                    ))}
                                </select>

                                {renderError("cancellation_type")}
                            </div>

                            {/* Minimum Hours */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Minimum Hours Before Booking
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={form.minimum_hours_before_booking}
                                    onChange={(e) =>
                                        updateField(
                                            "minimum_hours_before_booking",
                                            e.target.value
                                        )
                                    }
                                    className={inputClass}
                                />

                                <p className="mt-1 text-xs text-slate-500">
                                    The cancellation must happen at least this
                                    many hours before the booking.
                                </p>

                                {renderError("minimum_hours_before_booking")}
                            </div>

                            {/* Maximum Hours */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Maximum Hours Before Booking
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={form.maximum_hours_before_booking}
                                    onChange={(e) =>
                                        updateField(
                                            "maximum_hours_before_booking",
                                            e.target.value
                                        )
                                    }
                                    className={inputClass}
                                    placeholder="Leave empty for no upper limit"
                                />

                                <p className="mt-1 text-xs text-slate-500">
                                    Leave empty if this policy has no upper
                                    time limit.
                                </p>

                                {renderError("maximum_hours_before_booking")}
                            </div>

                            {/* Refund Percentage */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Refund Percentage
                                </label>

                                <div className="mt-1 flex">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={form.refund_percentage}
                                        onChange={(e) =>
                                            updateField(
                                                "refund_percentage",
                                                e.target.value
                                            )
                                        }
                                        className="w-full min-w-0 rounded-l-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                    <span className="flex items-center rounded-r-lg border border-l-0 border-slate-300 bg-slate-50 px-3 text-sm text-slate-500">
                                        %
                                    </span>
                                </div>

                                <p className="mt-1 text-xs text-slate-500">
                                    0% = no refund, 50% = partial refund,
                                    100% = full refund.
                                </p>

                                {renderError("refund_percentage")}
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Priority
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={form.priority}
                                    onChange={(e) =>
                                        updateField("priority", e.target.value)
                                    }
                                    className={inputClass}
                                />

                                <p className="mt-1 text-xs text-slate-500">
                                    Higher priority policies are selected first.
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700">
                                Description
                            </label>

                            <textarea
                                value={form.description}
                                onChange={(e) =>
                                    updateField("description", e.target.value)
                                }
                                rows={3}
                                className={inputClass}
                                placeholder="Describe when this policy applies..."
                            />
                        </div>

                        {/* Active */}
                        <div>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={form.is_active}
                                    onChange={(e) =>
                                        updateField("is_active", e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />

                                <span className="text-sm font-medium text-slate-700">
                                    Policy is active
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        {editingPolicy && (
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={saving}
                                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                                Reset
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving
                                ? "Saving..."
                                : editingPolicy
                                ? "Update Policy"
                                : "Create Policy"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CancellationPolicyModal;