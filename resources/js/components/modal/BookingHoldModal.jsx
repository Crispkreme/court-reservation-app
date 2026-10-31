
import { X, CalendarDays, Clock, FlaskConical } from "lucide-react";
import { getTodayDate } from "../../utils/formatters";

export default function TestBookingHoldModal({
    isOpen,
    onClose,
    form,
    setForm,
    createTestHold,
    processing,
}) {
    if (!isOpen) return null;

    const handleChange = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
    const labelClass = "mb-2 block text-sm font-medium text-slate-700";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <FlaskConical size={20} />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                Test Booking Hold
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Test booking concurrency and temporary
                                court reservation functionality.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={createTestHold}>
                    <div className="max-h-[65vh] overflow-y-auto p-6">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                            {/* Sport Category ID */}
                            <div>
                                <label className={labelClass}>
                                    Sport Category ID
                                </label>
                                <input
                                    type="number"
                                    value={form.sport_category_id}
                                    onChange={(e) =>
                                        handleChange("sport_category_id", e.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="1"
                                    required
                                />
                            </div>

                            {/* Court ID */}
                            <div>
                                <label className={labelClass}>
                                    Court ID
                                </label>
                                <input
                                    type="number"
                                    value={form.court_id}
                                    onChange={(e) =>
                                        handleChange("court_id", e.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="1"
                                    required
                                />
                            </div>

                            {/* Booking Date */}
                            <div>
                                <label className={labelClass}>
                                    Booking Date
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={form.booking_date}
                                        min={getTodayDate()}
                                        onChange={(e) =>
                                            handleChange("booking_date", e.target.value)
                                        }
                                        className={inputClass}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Start Time */}
                            <div>
                                <label className={labelClass}>
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    value={form.start_time}
                                    onChange={(e) =>
                                        handleChange("start_time", e.target.value)
                                    }
                                    className={inputClass}
                                    required
                                />
                            </div>

                            {/* Duration */}
                            <div>
                                <label className={labelClass}>
                                    Booking Duration
                                </label>
                                <select
                                    value={form.duration_minutes}
                                    onChange={(e) =>
                                        handleChange("duration_minutes", e.target.value)
                                    }
                                    className={inputClass}
                                >
                                    <option value="30">30 minutes</option>
                                    <option value="60">60 minutes</option>
                                    <option value="90">90 minutes</option>
                                </select>
                            </div>

                            {/* Hold Duration */}
                            <div>
                                <label className={labelClass}>
                                    Hold Duration
                                </label>
                                <select
                                    value={form.hold_duration_minutes}
                                    onChange={(e) =>
                                        handleChange("hold_duration_minutes", e.target.value)
                                    }
                                    className={inputClass}
                                >
                                    <option value="5">5 minutes</option>
                                    <option value="10">10 minutes</option>
                                    <option value="15">15 minutes</option>
                                    <option value="30">30 minutes</option>
                                </select>
                            </div>

                            {/* Players */}
                            <div>
                                <label className={labelClass}>
                                    Number of Players
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={form.players_count}
                                    onChange={(e) =>
                                        handleChange("players_count", e.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="1"
                                    required
                                />
                            </div>

                            {/* Customer Name */}
                            <div>
                                <label className={labelClass}>
                                    Customer Name
                                </label>
                                <input
                                    type="text"
                                    value={form.customer_name}
                                    onChange={(e) =>
                                        handleChange("customer_name", e.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="Enter customer name"
                                />
                            </div>

                            {/* Customer Email */}
                            <div className="md:col-span-2">
                                <label className={labelClass}>
                                    Customer Email
                                </label>
                                <input
                                    type="email"
                                    value={form.customer_email}
                                    onChange={(e) =>
                                        handleChange("customer_email", e.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="customer@example.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {processing ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Clock size={16} />
                                    Place Court on Hold
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
