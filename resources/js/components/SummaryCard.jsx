const cardStyles = {
    "Total Booking": {
        icon: "calendar",
        accent: "bg-blue-500",
        iconBg: "bg-blue-50 text-blue-600",
    },
    Confirmed: {
        icon: "confirmed",
        accent: "bg-emerald-500",
        iconBg: "bg-emerald-50 text-emerald-600",
    },
    Pending: {
        icon: "pending",
        accent: "bg-amber-500",
        iconBg: "bg-amber-50 text-amber-600",
    },
    Cancelled: {
        icon: "cancelled",
        accent: "bg-rose-500",
        iconBg: "bg-rose-50 text-rose-600",
    },
    Revenue: {
        icon: "wallet",
        accent: "bg-emerald-500",
        iconBg: "bg-emerald-50 text-emerald-600",
    },
    Courts: {
        icon: "court",
        accent: "bg-violet-500",
        iconBg: "bg-violet-50 text-violet-600",
    },
    Members: {
        icon: "users",
        accent: "bg-amber-500",
        iconBg: "bg-amber-50 text-amber-600",
    },
};

function SummaryIcon({ type }) {
    const commonProps = {
        className: "h-6 w-6",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
    };

    switch (type) {
        // Total Bookings
        case "calendar":
            return (
                <svg {...commonProps}>
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M16 3v4M8 3v4M3 10h18" />
                </svg>
            );

        // Confirmed Bookings
        case "confirmed":
            return (
                <svg {...commonProps}>
                    <rect x="3" y="4" width="18" height="17" rx="2" />
                    <path d="M16 2v4M8 2v4M3 9h18" />
                    <path d="m8 14 2.5 2.5L16 11" />
                </svg>
            );

        // Pending Bookings
        case "pending":
            return (
                <svg {...commonProps}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                </svg>
            );

        // Cancelled Bookings
        case "cancelled":
            return (
                <svg {...commonProps}>
                    <rect x="3" y="4" width="18" height="17" rx="2" />
                    <path d="M16 2v4M8 2v4M3 9h18" />
                    <path d="m9 13 6 6m0-6-6 6" />
                </svg>
            );

        // Revenue
        case "wallet":
            return (
                <svg {...commonProps}>
                    <rect x="3" y="5" width="18" height="15" rx="2" />
                    <path d="M3 9h18M16 14h2" />
                </svg>
            );

        // Courts
        case "court":
            return (
                <svg {...commonProps}>
                    <rect x="3" y="3" width="18" height="18" rx="1" />
                    <path d="M12 3v18M3 12h18" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            );

        // Members
        case "users":
            return (
                <svg {...commonProps}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="10" cy="7" r="4" />
                    <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            );

        default:
            return (
                <svg {...commonProps}>
                    <path d="M4 12h16M12 4v16" />
                </svg>
            );
    }
}

export default function SummaryCard({
    title,
    value,
    icon,
    accentColor,
    iconBg,
}) {
    const matchedStyle =
        Object.entries(cardStyles).find(([key]) =>
            title?.toLowerCase().includes(key.toLowerCase())
        )?.[1] ?? {
            icon: "calendar",
            accent: "bg-emerald-500",
            iconBg: "bg-emerald-50 text-emerald-600",
        };

    const style = {
        ...matchedStyle,
        ...(icon ? { icon } : {}),
        ...(accentColor ? { accent: accentColor } : {}),
        ...(iconBg ? { iconBg } : {}),
    };

    return (
        <div className="group relative overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">

            {/* Top accent border */}
            <div className={`absolute inset-x-0 top-0 h-1 ${style.accent}`} />

            <div className="flex items-start justify-between gap-4 p-5">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <p className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        {value ?? 0}
                    </p>
                </div>

                {/* Matching icon background */}
                <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${style.iconBg}`}
                >
                    <SummaryIcon type={style.icon} />
                </div>
            </div>

            <div className="px-5 pb-4">
                <div
                    className={`h-1 w-10 rounded-full ${style.accent} opacity-20 transition-all duration-200 group-hover:w-16 group-hover:opacity-50`}
                />
            </div>
        </div>
    );
}