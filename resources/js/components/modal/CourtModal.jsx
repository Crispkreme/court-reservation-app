import { X, Building2, MapPin, Users, Clock3, CircleDollarSign, CalendarClock, Activity, Save, Plus, Info, AlertCircle } from "lucide-react";


const inputClass = "w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50";

const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

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
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
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
                className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
                    <div>
                        <div className="mb-1 flex items-center gap-2 text-blue-700">
                            <Building2 size={17} />
                            <span className="text-xs font-semibold uppercase tracking-wider">Court management</span>
                        </div>
                        <h2
                            id="court-modal-title"
                            className="text-lg font-bold tracking-tight text-slate-900"
                        >
                            {editingId ? "Edit Court" : "Add New Court"}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {editingId ? "Update the court details and booking configuration." : "Add a court and configure its availability and booking rules."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Close modal"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X size={19} />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={onSubmit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="overflow-y-auto bg-slate-50/60 p-5 sm:p-6">
                        {error && (
                            <div
                                role="alert"
                                className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                            >
                                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"><div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3"><Info size={17} className="text-blue-600" /><h3 className="text-sm font-semibold text-slate-800">Court details</h3></div><div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

                            <div className="flex items-center pt-1 sm:pt-6">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={Boolean(form.is_active)}
                                        onChange={onChange}
                                        className="h-4 w-4 rounded border-slate-300 accent-blue-600 focus:ring-blue-500"
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
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading && (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            )}
                            {!loading && (editingId ? <Save size={16} /> : <Plus size={17} />)}
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
