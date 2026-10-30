import { X, RefreshCw, CheckCircle2, UserRound, Mail, Phone, MapPin, User, Award, Clock, ShieldCheck } from "lucide-react";
import { PLAYER_TYPES, SKILL_LEVELS } from "../../enums/enum";

export default function ParticipantModal({
    isOpen,
    onClose,
    saving,
    editingParticipant,
    form,
    formErrors,
    onSubmit,
    updateField,
    fieldError,
}) {
    if (!isOpen) return null;

    const labelClass = "block text-sm font-medium text-slate-700";
    const inputClass = "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

    const handleClose = () => {
        if (!saving) onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    handleClose();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="participant-modal-title"
                className="w-full max-w-3xl border border-slate-200 bg-white shadow-xl"
            >
                {/* Modal Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center bg-blue-50 text-blue-600">
                            <UserRound size={21} />
                        </div>

                        <div>
                            <h2
                                id="participant-modal-title"
                                className="text-lg font-semibold text-slate-900"
                            >
                                {editingParticipant
                                    ? "Edit Participant"
                                    : "Add Participant"}
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Manage participant profile and player details.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={saving}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={onSubmit} className="space-y-6 p-6">
                    {/* Validation Summary */}
                    {Object.keys(formErrors).length > 0 && (
                        <div
                            role="alert"
                            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                        >
                            Please correct the highlighted fields and try again.
                        </div>
                    )}

                    {/* Personal Information */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 pb-2">
                            <User size={17} className="text-blue-600" />
                            <h3 className="text-sm font-semibold text-slate-800">
                                Personal Information
                            </h3>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            {/* First Name */}
                            <div>
                                <label className={labelClass}>
                                    First Name *
                                </label>

                                <input
                                    type="text"
                                    value={form.first_name ?? ""}
                                    onChange={(event) =>
                                        updateField("first_name", event.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="Enter first name"
                                    autoComplete="given-name"
                                    required
                                />

                                {fieldError("first_name") && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {fieldError("first_name")}
                                    </p>
                                )}
                            </div>

                            {/* Last Name */}
                            <div>
                                <label className={labelClass}>
                                    Last Name *
                                </label>

                                <input
                                    type="text"
                                    value={form.last_name ?? ""}
                                    onChange={(event) =>
                                        updateField("last_name", event.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="Enter last name"
                                    autoComplete="family-name"
                                    required
                                />

                                {fieldError("last_name") && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {fieldError("last_name")}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className={labelClass}>
                                    Email Address *
                                </label>

                                <div className="relative">
                                    <Mail
                                        size={16}
                                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type="email"
                                        value={form.email ?? ""}
                                        onChange={(event) =>
                                            updateField("email", event.target.value)
                                        }
                                        className={`${inputClass} pl-9`}
                                        placeholder="example@email.com"
                                        autoComplete="email"
                                        required
                                    />
                                </div>

                                {fieldError("email") && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {fieldError("email")}
                                    </p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className={labelClass}>
                                    Phone Number
                                </label>

                                <div className="relative">
                                    <Phone
                                        size={16}
                                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type="tel"
                                        value={form.phone ?? ""}
                                        onChange={(event) =>
                                            updateField("phone", event.target.value)
                                        }
                                        className={`${inputClass} pl-9`}
                                        placeholder="Enter phone number"
                                        autoComplete="tel"
                                    />
                                </div>

                                {fieldError("phone") && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {fieldError("phone")}
                                    </p>
                                )}
                            </div>

                            {/* Member ID */}
                            <div className="sm:col-span-2">
                                <label className={labelClass}>
                                    Member ID
                                </label>

                                <input
                                    type="text"
                                    value={form.member_id ?? ""}
                                    onChange={(event) =>
                                        updateField("member_id", event.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="Optional member ID"
                                />

                                {fieldError("member_id") && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {fieldError("member_id")}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Player Information */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 pb-2">
                            <Award size={17} className="text-blue-600" />
                            <h3 className="text-sm font-semibold text-slate-800">
                                Player Information
                            </h3>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            {/* Player Type */}
                            <div>
                                <label className={labelClass}>
                                    Player Type
                                </label>

                                <select
                                    value={form.player_type ?? ""}
                                    onChange={(event) =>
                                        updateField("player_type", event.target.value)
                                    }
                                    className={inputClass}
                                >
                                    {Object.values(PLAYER_TYPES).map((type) => (
                                        <option key={type} value={type}>
                                            {type.charAt(0) +
                                                type.slice(1).toLowerCase()}
                                        </option>
                                    ))}
                                </select>

                                {fieldError("player_type") && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {fieldError("player_type")}
                                    </p>
                                )}
                            </div>

                            {/* Skill Level */}
                            <div>
                                <label className={labelClass}>
                                    Skill Level
                                </label>

                                <select
                                    value={form.skill_level ?? ""}
                                    onChange={(event) =>
                                        updateField("skill_level", event.target.value)
                                    }
                                    className={inputClass}
                                >
                                    {Object.values(SKILL_LEVELS).map((level) => (
                                        <option key={level} value={level}>
                                            {level.charAt(0) +
                                                level.slice(1).toLowerCase()}
                                        </option>
                                    ))}
                                </select>

                                {fieldError("skill_level") && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {fieldError("skill_level")}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Additional Information */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 pb-2">
                            <MapPin size={17} className="text-blue-600" />
                            <h3 className="text-sm font-semibold text-slate-800">
                                Additional Information
                            </h3>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            {/* Location */}
                            <div>
                                <label className={labelClass}>
                                    Location
                                </label>

                                <input
                                    type="text"
                                    value={form.location ?? ""}
                                    onChange={(event) =>
                                        updateField("location", event.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="City or area"
                                />

                                {fieldError("location") && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {fieldError("location")}
                                    </p>
                                )}
                            </div>

                            {/* Availability */}
                            <div>
                                <label className={labelClass}>
                                    <span className="inline-flex items-center gap-1.5">
                                        <Clock size={14} />
                                        Availability
                                    </span>
                                </label>

                                <textarea
                                    value={form.availability ?? ""}
                                    onChange={(event) =>
                                        updateField("availability", event.target.value)
                                    }
                                    className={inputClass}
                                    rows={3}
                                    placeholder="e.g. Weekdays after 6 PM, weekends"
                                />

                                {fieldError("availability") && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {fieldError("availability")}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Account Status */}
                    <section className="rounded-xl bg-slate-50/70 p-4">
                        <label className="flex cursor-pointer items-start gap-3">
                            <input
                                type="checkbox"
                                checked={Boolean(form.is_active)}
                                onChange={(event) =>
                                    updateField("is_active", event.target.checked)
                                }
                                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />

                            <span>
                                <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
                                    <ShieldCheck size={16} className="text-blue-600" />
                                    Active Participant
                                </span>

                                <span className="mt-1 block text-xs leading-5 text-slate-500">
                                    Inactive participants remain in the directory
                                    but are marked unavailable.
                                </span>
                            </span>
                        </label>
                    </section>

                    {/* Footer */}
                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={saving}
                            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? (
                                <RefreshCw size={16} className="animate-spin" />
                            ) : (
                                <CheckCircle2 size={16} />
                            )}

                            {saving
                                ? "Saving..."
                                : editingParticipant
                                    ? "Update Participant"
                                    : "Create Participant"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}