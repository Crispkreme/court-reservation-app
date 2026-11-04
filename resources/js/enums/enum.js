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

export const GENERAL_STATUS = Object.freeze({
    DRAFT: "DRAFT",
    PENDING_PAYMENT: "PENDING_PAYMENT",
    CONFIRMED: "CONFIRMED",
    CHECKED_IN: "CHECKED_IN",
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
    RESCHEDULED: "RESCHEDULED",
    NO_SHOW: "NO_SHOW",
    ACTIVE: "ACTIVE",
    EXPIRED: "EXPIRED",
    PAID: "PAID",
    AVAILABLE: "AVAILABLE",
    PENDING: "PENDING",
    SUCCESSFUL: "SUCCESSFUL",
    HELD: "HELD",
    SUCCESS: "SUCCESS",
    RESERVED: "RESERVED",
    PROCESSING: "PROCESSING",
    WAITING: "WAITING",
    CLOSED: "CLOSED",
    INACTIVE: "INACTIVE",
    MAINTENANCE: "MAINTENANCE",
    FAILED: "FAILED",
    BLOCKED: "BLOCKED",
    HOLIDAY: "HOLIDAY",
});

export const GENERAL_STATUS_CLASSES = Object.freeze({
    [GENERAL_STATUS.ACTIVE]: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    [GENERAL_STATUS.PAID]: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    [GENERAL_STATUS.AVAILABLE]: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    [GENERAL_STATUS.SUCCESS]: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    [GENERAL_STATUS.SUCCESSFUL]: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    [GENERAL_STATUS.PENDING]: "bg-amber-50 text-amber-700 ring-amber-600/20",
    [GENERAL_STATUS.HELD]: "bg-amber-50 text-amber-700 ring-amber-600/20",
    [GENERAL_STATUS.RESERVED]: "bg-amber-50 text-amber-700 ring-amber-600/20",
    [GENERAL_STATUS.PROCESSING]: "bg-amber-50 text-amber-700 ring-amber-600/20",
    [GENERAL_STATUS.WAITING]: "bg-amber-50 text-amber-700 ring-amber-600/20",
    [GENERAL_STATUS.CLOSED]: "bg-rose-50 text-rose-700 ring-rose-600/20",
    [GENERAL_STATUS.MAINTENANCE]: "bg-rose-50 text-rose-700 ring-rose-600/20",
    [GENERAL_STATUS.INACTIVE]: "bg-slate-100 text-slate-600 ring-slate-500/20",
    [GENERAL_STATUS.BLOCKED]: "bg-red-50 text-red-700 ring-red-600/20",
    [GENERAL_STATUS.HOLIDAY]: "bg-violet-50 text-violet-700 ring-violet-600/20",
});

export const DAYS_OF_WEEK = Object.freeze({
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
});

export const DAYS_OF_WEEK_OPTIONS = Object.freeze([
    { value: DAYS_OF_WEEK.SUNDAY, label: "Sunday" },
    { value: DAYS_OF_WEEK.MONDAY, label: "Monday" },
    { value: DAYS_OF_WEEK.TUESDAY, label: "Tuesday" },
    { value: DAYS_OF_WEEK.WEDNESDAY, label: "Wednesday" },
    { value: DAYS_OF_WEEK.THURSDAY, label: "Thursday" },
    { value: DAYS_OF_WEEK.FRIDAY, label: "Friday" },
    { value: DAYS_OF_WEEK.SATURDAY, label: "Saturday" },
]);

export const COLOR_CLASSES = Object.freeze({
    BLUE: "bg-blue-50 text-blue-700",
    RED: "bg-red-50 text-red-700",
    GREEN: "bg-green-50 text-green-700",
    YELLOW: "bg-yellow-50 text-yellow-700",
    ORANGE: "bg-orange-50 text-orange-700",
    PINK: "bg-pink-50 text-pink-700",
    PURPLE: "bg-purple-50 text-purple-700",
    INDIGO: "bg-indigo-50 text-indigo-700",
    GRAY: "bg-gray-50 text-gray-700",
});

export const BOOKING_STATUS_OPTIONS = Object.values(BOOKING_STATUS);
export const COURT_STATUS_OPTIONS = Object.freeze(Object.values(GENERAL_STATUS));

export const getBookingStatusClass = (status) => BOOKING_STATUS_CLASSES[String(status || "").toUpperCase()] || "bg-slate-100 text-slate-600 ring-slate-500/20";
export const getGeneralStatusClass = (status) => GENERAL_STATUS_CLASSES[String(status || "").toUpperCase()] || "bg-slate-100 text-slate-600 ring-slate-500/20";
export const getStatusClass = (status) => { const normalized = String(status || "").toUpperCase();
    return (
        BOOKING_STATUS_CLASSES[normalized] ||
        GENERAL_STATUS_CLASSES[normalized] ||
        "bg-slate-100 text-slate-600 ring-slate-500/20"
    );
};
export const GENERAL_STATUS_OPTIONS = Object.freeze(
    Object.values(GENERAL_STATUS).map((status) => ({
        value: status.toLowerCase(),
        label: status
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase()),
    }))
);

export const COURT_OVERRIDE_STATUS_OPTIONS = Object.freeze([
    { value: "", label: "All Statuses" },
    ...[
        GENERAL_STATUS.AVAILABLE,
        GENERAL_STATUS.BLOCKED,
        GENERAL_STATUS.MAINTENANCE,
        GENERAL_STATUS.CLOSED,
        GENERAL_STATUS.HOLIDAY,
    ].map((status) => ({
        value: status.toLowerCase(),
        label: status.charAt(0) + status.slice(1).toLowerCase(),
    })),
]);