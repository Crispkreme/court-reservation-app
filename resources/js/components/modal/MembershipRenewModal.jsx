
export default function MembershipRenewModal({
    isOpen,
    selectedMembership,
    loading,
    error,
    onClose,
    onRenew,
}) {
    if (!isOpen || !selectedMembership) return null;

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
                aria-labelledby="membership-renew-title"
                className="flex max-h-[92vh] w-full max-w-xl flex-col border border-slate-200 bg-white shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
                    <div>
                        <h2
                            id="membership-renew-title"
                            className="text-lg font-bold text-slate-900"
                        >
                            Renew Membership
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Review the details before confirming renewal.
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

                {/* Membership Details */}
                <div className="overflow-y-auto p-5 sm:p-6">
                    {error && (
                        <div
                            role="alert"
                            className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        >
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="border border-slate-200 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Member
                            </p>
                            <p className="mt-1 text-base font-bold text-slate-900">
                                {selectedMembership.user?.name ||
                                    "Unknown member"}
                            </p>

                            <div className="mt-4 border-t border-slate-100 pt-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Membership Type
                                </p>
                                <p className="mt-1 text-sm font-medium text-slate-800">
                                    {selectedMembership.membership_type?.name ||
                                        "—"}
                                </p>
                            </div>

                            <div className="mt-4 border-t border-slate-100 pt-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Current Expiration
                                </p>
                                <p className="mt-1 text-sm font-medium text-slate-800">
                                    {selectedMembership.expiration_date ||
                                        "—"}
                                </p>
                            </div>
                        </div>

                        <div className="border border-emerald-200 bg-emerald-50 px-4 py-3">
                            <p className="text-sm font-semibold text-emerald-800">
                                Confirm Membership Renewal
                            </p>
                            <p className="mt-1 text-sm text-emerald-700">
                                A new membership period will be created
                                using the current membership type and
                                duration.
                            </p>
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
                        type="button"
                        onClick={onRenew}
                        disabled={loading}
                        className="inline-flex items-center gap-2 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading && (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        )}
                        {loading ? "Renewing..." : "Confirm Renewal"}
                    </button>
                </div>
            </div>
        </div>
    );
}
