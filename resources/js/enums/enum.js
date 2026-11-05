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

export const INPUT_CLASSES = Object.freeze({
    DEFAULT: "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
});
export const AUDIT_MODULES = Object.freeze({
    BOOKING: "booking",
    CANCELLATION: "cancellation",
    RESCHEDULING: "rescheduling",
    PAYMENT: "payment",
    REFUND: "refund",
    ADMINISTRATION: "administration",
    COURT_SCHEDULE: "court_schedule",
    COURT_BLOCKING: "court_blocking",
    MEMBERSHIP: "membership",
    WAITLIST: "waitlist",
    FAILURE_EXCEPTION: "failure_exception",
});

export const AUDIT_ACTIONS = Object.freeze({
    CREATED: "created",
    UPDATED: "updated",
    DELETED: "deleted",
    CANCELLED: "cancelled",
    RESCHEDULED: "rescheduled",
    PAID: "paid",
    PAYMENT_FAILED: "payment_failed",
    REFUNDED: "refunded",
    REFUND_FAILED: "refund_failed",
    BLOCKED: "blocked",
    UNBLOCKED: "unblocked",
    PROMOTED: "promoted",
    EXPIRED: "expired",
    APPROVED: "approved",
    REJECTED: "rejected",
});

export const REPORT_TYPES = Object.freeze({
    DAILY_BOOKING: "daily_booking",
    COURT_UTILIZATION: "court_utilization",
    SPORT_CATEGORY: "sport_category",
    REVENUE: "revenue",
    PAYMENT: "payment",
    OUTSTANDING_FEES: "outstanding_fees",
    CANCELLATION: "cancellation",
    RESCHEDULING: "rescheduling",
    NO_SHOW: "no_show",
    MEMBERSHIP: "membership",
    WAITLIST: "waitlist",
    FAILED_TRANSACTION: "failed_transaction",
    BOOKING_ACTIVITY: "booking_activity",
});

export const REPORT_TYPE_OPTIONS = Object.freeze([
    { value: REPORT_TYPES.DAILY_BOOKING, label: "Daily Booking Report",},
    { value: REPORT_TYPES.COURT_UTILIZATION, label: "Court Utilization Report",},
    { value: REPORT_TYPES.SPORT_CATEGORY, label: "Sport Category Report",},
    { value: REPORT_TYPES.REVENUE, label: "Revenue Report",},
    { value: REPORT_TYPES.PAYMENT, label: "Payment Report",},
    { value: REPORT_TYPES.OUTSTANDING_FEES, label: "Outstanding / Aged Fees",},
    { value: REPORT_TYPES.CANCELLATION, label: "Cancellation Report",},
    { value: REPORT_TYPES.RESCHEDULING, label: "Rescheduling Report",},
    { value: REPORT_TYPES.NO_SHOW, label: "No-Show Report",},
    { value: REPORT_TYPES.MEMBERSHIP, label: "Membership Report",},
    { value: REPORT_TYPES.WAITLIST, label: "Waitlist Report",},
    { value: REPORT_TYPES.FAILED_TRANSACTION, label: "Failed Transaction Report",},
    { value: REPORT_TYPES.BOOKING_ACTIVITY, label: "Booking Activity / History",},
]);

export const AUDIT_ACTION_OPTIONS = Object.freeze(Object.values(AUDIT_ACTIONS));
export const AUDIT_MODULE_OPTIONS = Object.freeze(Object.values(AUDIT_MODULES));
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