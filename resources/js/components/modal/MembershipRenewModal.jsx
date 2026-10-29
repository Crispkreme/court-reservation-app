import { X, Users, CalendarClock, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="membership-renew-title"
        className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div>
            <div className="mb-1 flex items-center gap-2 text-blue-700">
              <Users size={17} />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Membership management
              </span>
            </div>
            <h2
              id="membership-renew-title"
              className="text-lg font-bold tracking-tight text-slate-900"
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
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        {/* Membership Details */}
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

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <h3 className="mb-4 text-sm font-semibold text-slate-800">
                Current membership
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Member
                  </p>
                  <p className="mt-1 text-base font-bold text-slate-900">
                    {selectedMembership.user?.name || "Unknown member"}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Membership Type
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {selectedMembership.membership_type?.name || "—"}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Current Expiration
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <CalendarClock size={16} className="text-slate-400" />
                    {selectedMembership.expiration_date || "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <RotateCcw size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Confirm Membership Renewal
                  </p>
                  <p className="mt-1 text-sm leading-5 text-blue-800">
                    A new membership period will be created using the current
                    membership type and duration.
                  </p>
                </div>
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
            type="button"
            onClick={onRenew}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <CheckCircle2 size={16} />
            )}
            {loading ? "Renewing..." : "Confirm Renewal"}
          </button>
        </div>
      </div>
    </div>
  );
}
