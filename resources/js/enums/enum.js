export const PLAYER_TYPES = Object.freeze({
    RECREATIONAL: "RECREATIONAL",
    COMPETITIVE: "COMPETITIVE",
    PROFESSIONAL: "PROFESSIONAL",
});

export const SKILL_LEVELS = Object.freeze({
    BEGINNER: "BEGINNER",
    INTERMEDIATE: "INTERMEDIATE",
    ADVANCED: "ADVANCED",
    EXPERT: "EXPERT",
});

export const BOOKING_STATUS = Object.freeze({
    DRAFT: "DRAFT",
    PENDING_PAYMENT: "PENDING_PAYMENT",
    CONFIRMED: "CONFIRMED",
    CHECKED_IN: "CHECKED_IN",
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
    RESCHEDULED: "RESCHEDULED",
    NO_SHOW: "NO_SHOW",
    EXPIRED: "EXPIRED",
    FAILED: "FAILED",
});

export const BOOKING_STATUS_OPTIONS = Object.values(BOOKING_STATUS);

export const BOOKING_STATUS_CLASSES = Object.freeze({
    [BOOKING_STATUS.DRAFT]: "bg-slate-100 text-slate-700 ring-slate-500/20",
    [BOOKING_STATUS.PENDING_PAYMENT]: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
    [BOOKING_STATUS.CONFIRMED]: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    [BOOKING_STATUS.CHECKED_IN]: "bg-blue-50 text-blue-700 ring-blue-600/20",
    [BOOKING_STATUS.IN_PROGRESS]: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
    [BOOKING_STATUS.COMPLETED]: "bg-blue-50 text-blue-700 ring-blue-600/20",
    [BOOKING_STATUS.CANCELLED]: "bg-rose-50 text-rose-700 ring-rose-600/20",
    [BOOKING_STATUS.RESCHEDULED]: "bg-purple-50 text-purple-700 ring-purple-600/20",
    [BOOKING_STATUS.NO_SHOW]: "bg-rose-50 text-rose-700 ring-rose-600/20",
    [BOOKING_STATUS.EXPIRED]: "bg-rose-50 text-rose-700 ring-rose-600/20",
    [BOOKING_STATUS.FAILED]: "bg-rose-50 text-rose-700 ring-rose-600/20",
});

// Other application statuses (holds, payments, courts, etc.)
export const GENERAL_STATUS_CLASSES = Object.freeze({
    ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    PAID: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    AVAILABLE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    SUCCESS: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    SUCCESSFUL: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",

    PENDING: "bg-amber-50 text-amber-700 ring-amber-600/20",
    HELD: "bg-amber-50 text-amber-700 ring-amber-600/20",
    RESERVED: "bg-amber-50 text-amber-700 ring-amber-600/20",
    PROCESSING: "bg-amber-50 text-amber-700 ring-amber-600/20",
    WAITING: "bg-amber-50 text-amber-700 ring-amber-600/20",

    CLOSED: "bg-rose-50 text-rose-700 ring-rose-600/20",
    MAINTENANCE: "bg-rose-50 text-rose-700 ring-rose-600/20",

    INACTIVE: "bg-slate-100 text-slate-600 ring-slate-500/20",
});

export const getBookingStatusClass = (status) =>
    BOOKING_STATUS_CLASSES[String(status || "").toUpperCase()] || "bg-slate-100 text-slate-600 ring-slate-500/20";

export const getGeneralStatusClass = (status) =>
    GENERAL_STATUS_CLASSES[String(status || "").toUpperCase()] || "bg-slate-100 text-slate-600 ring-slate-500/20";

export const getStatusClass = (status) => {
    const normalized = String(status || "").toUpperCase();

    return (
        BOOKING_STATUS_CLASSES[normalized] ||
        GENERAL_STATUS_CLASSES[normalized] ||
        "bg-slate-100 text-slate-600 ring-slate-500/20"
    );
};