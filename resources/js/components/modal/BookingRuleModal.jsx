
import { Save, RotateCcw, X } from "lucide-react";
import { DAYS_OF_WEEK_OPTIONS } from "../../enums/enum";

export default function BookingRuleModal({
    isOpen,
    onClose,
    editingRule,
    form,
    updateField,
    toggleDay,
    submit,
    resetForm,
    saving,
    getError,
    membershipTiers,
    sportCategories,
    courts,
}) {
    if (!isOpen) return null;

    const handleCancel = () => {
        if (editingRule) {
            resetForm();
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            {editingRule
                                ? "Edit Booking Rule"
                                : "Create Booking Rule"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Configure the conditions under which this rule applies.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleCancel}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={submit}
                    className="flex min-h-0 flex-1 flex-col overflow-hidden"
                >
                    <div className="flex-1 space-y-6 overflow-y-auto sp-6">

                        {/* Basic Information */}
                        <div>
                            <h3 className="mb-4 text-base font-semibold text-slate-900">
                                General Settings
                            </h3>

                            <div className="grid gap-5 md:grid-cols-2">

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Rule Name
                                    </label>

                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) =>
                                            updateField("name", e.target.value)
                                        }
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        placeholder="Standard Member Limits"
                                        required
                                    />

                                    {getError("name") && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {getError("name")}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Rule Type
                                    </label>

                                    <select
                                        value={form.rule_type}
                                        onChange={(e) =>
                                            updateField("rule_type", e.target.value)
                                        }
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="general">General</option>
                                        <option value="event">Special Event</option>
                                        <option value="tournament">Tournament</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Membership Tier
                                    </label>

                                    <select
                                        value={form.membership_tier_id}
                                        onChange={(e) =>
                                            updateField("membership_tier_id", e.target.value)
                                        }
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="">All Membership Tiers</option>

                                        {membershipTiers.map((tier) => (
                                            <option key={tier.id} value={tier.id}>
                                                {tier.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Sport
                                    </label>

                                    <select
                                        value={form.sport_category_id}
                                        onChange={(e) =>
                                            updateField("sport_category_id", e.target.value)
                                        }
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="">All Sports</option>

                                        {sportCategories.map((sport) => (
                                            <option key={sport.id} value={sport.id}>
                                                {sport.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Court
                                    </label>

                                    <select
                                        value={form.court_id}
                                        onChange={(e) =>
                                            updateField("court_id", e.target.value)
                                        }
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="">All Courts</option>

                                        {courts.map((court) => (
                                            <option key={court.id} value={court.id}>
                                                {court.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Booking Limits */}
                        <div className="border-t border-slate-100 pt-6">
                            <h3 className="mb-4 text-base font-semibold text-slate-900">
                                Booking Limits
                            </h3>

                            <div className="grid gap-5 md:grid-cols-2">
                                {[
                                    {
                                        label: "Maximum Bookings / Day",
                                        field: "max_bookings_per_day",
                                        placeholder: "3",
                                    },
                                    {
                                        label: "Maximum Minutes / Day",
                                        field: "max_minutes_per_day",
                                        placeholder: "180",
                                    },
                                    {
                                        label: "Maximum Future Bookings",
                                        field: "max_future_bookings",
                                        placeholder: "5",
                                    },
                                    {
                                        label: "Advance Booking Window (Days)",
                                        field: "advance_booking_days",
                                        placeholder: "30",
                                    },
                                ].map((item) => (
                                    <div key={item.field}>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            {item.label}
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            value={form[item.field]}
                                            onChange={(e) =>
                                                updateField(item.field, e.target.value)
                                            }
                                            placeholder={item.placeholder}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Time Restrictions */}
                        <div className="border-t border-slate-100 pt-6">
                            <h3 className="mb-4 text-base font-semibold text-slate-900">
                                Time Restrictions
                            </h3>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Allowed Start Time
                                    </label>

                                    <input
                                        type="time"
                                        value={form.allowed_start_time}
                                        onChange={(e) =>
                                            updateField("allowed_start_time", e.target.value)
                                        }
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Allowed End Time
                                    </label>

                                    <input
                                        type="time"
                                        value={form.allowed_end_time}
                                        onChange={(e) =>
                                            updateField("allowed_end_time", e.target.value)
                                        }
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            <div className="mt-5">
                                <label className="mb-3 block text-sm font-medium text-slate-700">
                                    Allowed Days
                                </label>

                                <div className="flex flex-wrap gap-2">
                                    {DAYS_OF_WEEK_OPTIONS.map((day) => {
                                        const selected =
                                            form.allowed_days.includes(day.value);

                                        return (
                                            <button
                                                type="button"
                                                key={day.value}
                                                onClick={() => toggleDay(day.value)}
                                                className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                                                    selected
                                                        ? "border-blue-600 bg-blue-600 text-white"
                                                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50"
                                                }`}
                                            >
                                                {day.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Event / Tournament */}
                        {(form.rule_type === "event" ||
                            form.rule_type === "tournament") && (
                            <div className="border-t border-slate-100 pt-6">
                                <h3 className="mb-4 text-base font-semibold text-slate-900">
                                    Event / Tournament
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Event Name
                                        </label>

                                        <input
                                            type="text"
                                            value={form.event_name}
                                            onChange={(e) =>
                                                updateField("event_name", e.target.value)
                                            }
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>

                                    <div className="grid gap-5 md:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                                Starts At
                                            </label>

                                            <input
                                                type="datetime-local"
                                                value={form.starts_at}
                                                onChange={(e) =>
                                                    updateField("starts_at", e.target.value)
                                                }
                                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                                Ends At
                                            </label>

                                            <input
                                                type="datetime-local"
                                                value={form.ends_at}
                                                onChange={(e) =>
                                                    updateField("ends_at", e.target.value)
                                                }
                                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Description
                                        </label>

                                        <textarea
                                            value={form.description}
                                            onChange={(e) =>
                                                updateField("description", e.target.value)
                                            }
                                            rows="3"
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>

                                    <label className="flex items-center gap-2.5 text-sm text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={form.booking_blocked}
                                            onChange={(e) =>
                                                updateField("booking_blocked", e.target.checked)
                                            }
                                        />
                                        Block bookings during this event
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Priority / Active */}
                        <div className="border-t border-slate-100 pt-6">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Priority
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={form.priority}
                                        onChange={(e) =>
                                            updateField("priority", e.target.value)
                                        }
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                    <p className="mt-1 text-xs text-slate-500">
                                        Higher priority rules are evaluated first.
                                    </p>
                                </div>

                                <div className="flex items-center">
                                    <label className="flex items-center gap-2.5 text-sm text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={form.is_active}
                                            onChange={(e) =>
                                                updateField("is_active", e.target.checked)
                                            }
                                        />
                                        Rule is active
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-slate-500">
                            Changes apply to bookings matching these conditions.
                        </p>

                        <div className="flex flex-col-reverse gap-2 sm:flex-row">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                            >
                                <RotateCcw size={15} />
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        {editingRule ? "Update Rule" : "Create Rule"}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
