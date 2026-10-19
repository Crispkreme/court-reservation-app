
const inputClass =
    "w-full min-w-0 border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

const labelClass =
    "mb-1.5 block text-sm font-medium text-slate-700";

function FormField({ label, children }) {
    return (
        <div>
            <label className={labelClass}>{label}</label>
            {children}
        </div>
    );
}

export default function MembershipCreateModal({
    isOpen,
    form,
    types,
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
                aria-labelledby="membership-create-title"
                className="flex max-h-[92vh] w-full max-w-3xl flex-col border border-slate-200 bg-white shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
                    <div>
                        <h2
                            id="membership-create-title"
                            className="text-lg font-bold text-slate-900"
                        >
                            Create Membership
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Enter the member and membership details below.
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
                            <path d="m18 6-12 12M6 6l12-12" />
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

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <FormField label="User ID">
                                <input
                                    type="number"
                                    name="user_id"
                                    min="1"
                                    required
                                    value={form.user_id}
                                    onChange={onChange}
                                    className={inputClass}
                                    placeholder="Enter user ID"
                                />
                            </FormField>

                            <FormField label="Membership Type">
                                <select
                                    name="membership_type_id"
                                    required
                                    value={form.membership_type_id}
                                    onChange={onChange}
                                    className={inputClass}
                                >
                                    <option value="">
                                        Select membership
                                    </option>

                                    {types.map((type) => (
                                        <option
                                            key={type.id}
                                            value={type.id}
                                        >
                                            {type.name} - ₱
                                            {Number(
                                                type.price
                                            ).toLocaleString()}
                                        </option>
                                    ))}
                                </select>
                            </FormField>

                            <FormField label="Start Date">
                                <input
                                    type="date"
                                    name="start_date"
                                    required
                                    value={form.start_date}
                                    onChange={onChange}
                                    className={inputClass}
                                />
                            </FormField>

                            <FormField label="Status">
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={onChange}
                                    className={inputClass}
                                >
                                    <option value="pending">
                                        Pending
                                    </option>
                                    <option value="active">
                                        Active
                                    </option>
                                    <option value="suspended">
                                        Suspended
                                    </option>
                                </select>
                            </FormField>

                            <div className="sm:col-span-2">
                                <FormField label="Price Paid (₱)">
                                    <input
                                        type="number"
                                        name="price_paid"
                                        min="0"
                                        step="0.01"
                                        value={form.price_paid}
                                        onChange={onChange}
                                        className={inputClass}
                                        placeholder="0.00"
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
                            {loading ? "Creating..." : "Create Membership"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
