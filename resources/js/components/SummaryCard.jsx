
const cardStyles = {
    Bookings: {
        icon: "calendar",
        accent: "bg-blue-500",
        iconBg: "bg-blue-50 text-blue-600",
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
    };

    switch (type) {
        case "calendar":
            return (
                <svg {...commonProps}>
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M16 3v4M8 3v4M3 10h18" />
                </svg>
            );

        case "wallet":
            return (
                <svg {...commonProps}>
                    <rect x="3" y="5" width="18" height="15" rx="2" />
                    <path d="M3 9h18M16 14h2" />
                </svg>
            );

        case "court":
            return (
                <svg {...commonProps}>
                    <rect x="3" y="3" width="18" height="18" rx="1" />
                    <path d="M12 3v18M3 12h18" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            );

        case "users":
            return (
                <svg {...commonProps}>
                    <path d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="10" cy="7" r="4" />
                    <path d="M20 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
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

export default function SummaryCard({ title, value, icon, accentColor }) {
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
    };

    return (
        <div className="group relative overflow-hidden border border-slate-100 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
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

                <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${style.iconBg}`}
                >
                    <SummaryIcon type={style.icon} />
                </div>
            </div>

            <div className="px-5 pb-4">
                <div className="h-1 w-10 rounded-full bg-slate-100 transition-all duration-200 group-hover:w-16 group-hover:bg-emerald-400" />
            </div>
        </div>
    );
}
