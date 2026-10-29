import FormField from "../FormField";
import { X, Users, CreditCard, CalendarDays, Info, AlertCircle, Plus } from "lucide-react";

const inputClass =
  "w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50";

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
        aria-labelledby="membership-create-title"
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
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
              id="membership-create-title"
              className="text-lg font-bold tracking-tight text-slate-900"
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
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
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

            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Info size={17} className="text-blue-600" />
                <h3 className="text-sm font-semibold text-slate-800">
                  Membership details
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="membership-user-id"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    Member <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="membership-user-id"
                    name="user_id"
                    value={form.user_id ?? ""}
                    onChange={onChange}
                    required
                    disabled={loadingMembers}
                    className={inputClass}
                  >
                    <option value="">
                      {loadingMembers ? "Loading members..." : "Select a member"}
                    </option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.email})
                      </option>
                    ))}
                  </select>
                  {members.length === 0 && !loadingMembers && (
                    <p className="mt-1.5 text-xs text-amber-700">
                      No members are available to select.
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="membership-type-id"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    Membership Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="membership-type-id"
                    name="membership_type_id"
                    required
                    value={form.membership_type_id}
                    onChange={onChange}
                    className={inputClass}
                  >
                    <option value="">Select membership type</option>
                    {types.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} -{" "}
                        {Number(type.price).toLocaleString("en-PH", {
                          style: "currency",
                          currency: "PHP",
                        })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="membership-start-date"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="membership-start-date"
                    type="date"
                    name="start_date"
                    required
                    value={form.start_date}
                    onChange={onChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="membership-status"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    Status
                  </label>
                  <select
                    id="membership-status"
                    name="status"
                    value={form.status}
                    onChange={onChange}
                    className={inputClass}
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="membership-price-paid"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    Price Paid (₱)
                  </label>
                  <div className="relative">
                    <CreditCard
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="membership-price-paid"
                      type="number"
                      name="price_paid"
                      min="0"
                      step="0.01"
                      value={form.price_paid}
                      onChange={onChange}
                      className={`${inputClass} pl-9`}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-sm text-blue-700">
                    <CalendarDays size={16} />
                    <span>Check the start date before creating the membership.</span>
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
              type="submit"
              disabled={loading || loadingMembers || members.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Plus size={17} />
              )}
              {loading ? "Creating..." : "Create Membership"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
