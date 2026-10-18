
const inputClass = "w-full min-w-0 border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

function FormField({ label, children }) {
    return (
        <div>
            <label className={labelClass}>{label}</label>
            {children}
        </div>
    );
}

export default function CourtModal({
    isOpen,
    editingId,
    form,
    categories,
    loading,
    error,
    onChange,
    onSubmit,
    onClose,
}) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-6"
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !loading
                ) {
                    onClose();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="court-modal-title"
                className="flex max-h-[92vh] w-full max-w-4xl flex-col border border-slate-200 bg-white shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
                    <div>
                        <h2
                            id="court-modal-title"
                            className="text-lg font-bold text-slate-900"
                        >
                            {editingId ? "Edit Court" : "Add New Court"}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Enter the court details below.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Close modal"
                        className="p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-5 w-5"
                        >
                            <path d="m18 6-12 12M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={onSubmit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="overflow-y-auto p-5 sm:p-6">
                        {error && (
                            <div
                                role="alert"
                                className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                            >
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            <FormField label="Sport Category">
                                <select
                                    name="sport_category_id"
                                    value={form.sport_category_id}
                                    onChange={onChange}
                                    required
                                    className={inputClass}
                                >
                                    <option value="">Select category</option>
                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </FormField>

                            <FormField label="Court Name">
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={onChange}
                                    required
                                    className={inputClass}
                                    placeholder="e.g. Basketball Court"
                                />
                            </FormField>

                            <FormField label="Court Number">
                                <input
                                    name="court_number"
                                    value={form.court_number}
                                    onChange={onChange}
                                    className={inputClass}
                                    placeholder="e.g. C-01"
                                />
                            </FormField>

                            <FormField label="Branch">
                                <input
                                    name="branch"
                                    value={form.branch}
                                    onChange={onChange}
                                    className={inputClass}
                                    placeholder="Enter branch"
                                />
                            </FormField>

                            <FormField label="Location">
                                <input
                                    name="location"
                                    value={form.location}
                                    onChange={onChange}
                                    className={inputClass}
                                    placeholder="Enter location"
                                />
                            </FormField>

                            <FormField label="Status">
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={onChange}
                                    className={inputClass}
                                >
                                    <option value="available">Available</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="closed">Closed</option>
                                    <option value="temporarily_blocked">
                                        Temporarily Blocked
                                    </option>
                                </select>
                            </FormField>

                            <FormField label="Minimum Players">
                                <input
                                    type="number"
                                    name="min_players"
                                    min="1"
                                    value={form.min_players}
                                    onChange={onChange}
                                    required
                                    className={inputClass}
                                />
                            </FormField>

                            <FormField label="Maximum Players">
                                <input
                                    type="number"
                                    name="max_players"
                                    min={form.min_players || 1}
                                    value={form.max_players}
                                    onChange={onChange}
                                    required
                                    className={inputClass}
                                />
                            </FormField>

                            <FormField label="Base Price">
                                <input
                                    type="number"
                                    name="base_price"
                                    min="0"
                                    step="0.01"
                                    value={form.base_price}
                                    onChange={onChange}
                                    required
                                    className={inputClass}
                                />
                            </FormField>

                            <FormField label="Opening Time">
                                <input
                                    type="time"
                                    name="opening_time"
                                    value={form.opening_time}
                                    onChange={onChange}
                                    required
                                    className={inputClass}
                                />
                            </FormField>

                            <FormField label="Closing Time">
                                <input
                                    type="time"
                                    name="closing_time"
                                    value={form.closing_time}
                                    onChange={onChange}
                                    required
                                    className={inputClass}
                                />
                            </FormField>

                            <FormField label="Booking Interval (minutes)">
                                <select
                                    name="booking_interval"
                                    value={form.booking_interval}
                                    onChange={onChange}
                                    className={inputClass}
                                >
                                    <option value={15}>15 minutes</option>
                                    <option value={30}>30 minutes</option>
                                    <option value={60}>60 minutes</option>
                                </select>
                            </FormField>

                            <FormField label="Minimum Booking Duration">
                                <select
                                    name="minimum_booking_duration"
                                    value={form.minimum_booking_duration}
                                    onChange={onChange}
                                    className={inputClass}
                                >
                                    <option value={30}>30 minutes</option>
                                    <option value={60}>60 minutes</option>
                                    <option value={90}>90 minutes</option>
                                </select>
                            </FormField>

                            <FormField label="Maximum Booking Duration">
                                <select
                                    name="maximum_booking_duration"
                                    value={form.maximum_booking_duration}
                                    onChange={onChange}
                                    className={inputClass}
                                >
                                    <option value={60}>60 minutes</option>
                                    <option value={90}>90 minutes</option>
                                    <option value={120}>120 minutes</option>
                                    <option value={180}>180 minutes</option>
                                </select>
                            </FormField>

                            <FormField label="Currency">
                                <select
                                    name="currency"
                                    value={form.currency}
                                    onChange={onChange}
                                    className={inputClass}
                                >
                                    <option value="PHP">PHP</option>
                                    <option value="USD">USD</option>
                                </select>
                            </FormField>

                            <div className="flex items-center pt-6">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={Boolean(form.is_active)}
                                        onChange={onChange}
                                        className="h-4 w-4 accent-emerald-600"
                                    />
                                    Active court
                                </label>
                            </div>

                            <div className="sm:col-span-2 lg:col-span-3">
                                <FormField label="Description">
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={onChange}
                                        rows={3}
                                        className={inputClass}
                                        placeholder="Enter court description"
                                    />
                                </FormField>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading && (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            )}
                            {loading
                                ? "Saving..."
                                : editingId
                                  ? "Update Court"
                                  : "Create Court"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
