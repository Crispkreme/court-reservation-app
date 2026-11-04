
import { X } from "lucide-react";
import { COURT_OVERRIDE_STATUS_OPTIONS } from "../../enums/enum";

export default function CourtScheduleOverrideModal({
    showModal,
    setShowModal,
    editingOverride,
    form,
    handleChange,
    handleSubmit,
    saving,
    courts,
}) {
    if (!showModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-4">
            <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            {editingOverride
                                ? "Edit Schedule Override"
                                : "Add Schedule Override"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Configure a date-specific court exception.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        aria-label="Close modal"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">

                        {/* Court */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Court
                            </label>

                            <select
                                name="court_id"
                                value={form.court_id}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">Select Court</option>

                                {courts.map((court) => (
                                    <option
                                        key={court.id}
                                        value={court.id}
                                    >
                                        {court.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Date
                            </label>

                            <input
                                type="date"
                                name="date"
                                value={form.date}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Status
                            </label>

                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                {COURT_OVERRIDE_STATUS_OPTIONS
                                    .filter((option) => option.value !== "")
                                    .map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Start / End Time */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Start Time
                                </label>

                                <input
                                    type="time"
                                    name="start_time"
                                    value={form.start_time}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    End Time
                                </label>

                                <input
                                    type="time"
                                    name="end_time"
                                    value={form.end_time}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <p className="text-xs text-slate-500">
                            Leave the time fields empty to apply the
                            override for the whole day.
                        </p>

                        {/* Title */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Title
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="e.g. Private Event"
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Reason */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Reason
                            </label>

                            <textarea
                                name="reason"
                                value={form.reason}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Reason for this override..."
                                className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Active */}
                        <label className="flex cursor-pointer items-center gap-2">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={form.is_active}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />

                            <span className="text-sm text-slate-700">
                                Active
                            </span>
                        </label>
                    </div>

                    {/* Footer */}
                    <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-6">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving
                                ? "Saving..."
                                : editingOverride
                                  ? "Update Override"
                                  : "Create Override"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
