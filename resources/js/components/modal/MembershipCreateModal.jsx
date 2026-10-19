import FormField from '../FormField';

const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100';

export default function MembershipCreateModal({
    isOpen,
    form,
    types,
    members = [],
    loadingMembers = false,
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
                className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
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
                            Select a member and enter the membership details.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Close modal"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-5 w-5"
                        >
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form
                    onSubmit={onSubmit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="overflow-y-auto p-5 sm:p-6">
                        {error && (
                            <div
                                role="alert"
                                className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                            >
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            {/* Member Dropdown */}
                            <div className="sm:col-span-2">    
                                <FormField label="Member" required>
                                    <select
                                        name="user_id"
                                        value={form.user_id ?? ''}
                                        onChange={onChange}
                                        required
                                        disabled={loadingMembers}
                                        className={inputClass}
                                    >
                                        <option value="">
                                            {loadingMembers
                                                ? 'Loading members...'
                                                : 'Select a member'}
                                        </option>

                                        {members.map((member) => (
                                            <option key={member.id} value={member.id}>
                                                {member.name} ({member.email})
                                            </option>
                                        ))}
                                    </select>
                                </FormField>
                            </div>

                            <FormField label="Membership Type">
                                <select
                                    name="membership_type_id"
                                    required
                                    value={form.membership_type_id}
                                    onChange={onChange}
                                    className={`${inputClass} rounded-lg bg-white`}
                                >
                                    <option value="">
                                        Select membership type
                                    </option>

                                    {types.map((type) => (
                                        <option
                                            key={type.id}
                                            value={type.id}
                                        >
                                            {type.name} -{" "}
                                            {Number(type.price).toLocaleString(
                                                "en-PH",
                                                {
                                                    style: "currency",
                                                    currency: "PHP",
                                                }
                                            )}
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
                                    className={`${inputClass} rounded-lg`}
                                />
                            </FormField>

                            <FormField label="Status">
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={onChange}
                                    className={`${inputClass} rounded-lg bg-white`}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="active">Active</option>
                                    <option value="suspended">Suspended</option>
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
                                        className={`${inputClass} rounded-lg`}
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
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading || members.length === 0}
                            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
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
