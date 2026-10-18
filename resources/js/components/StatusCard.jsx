
const statusStyles = {
    Confirmed: {
        icon: "✓",
        color: "border-emerald-500 bg-emerald-50 text-emerald-700",
        iconBg: "bg-emerald-100",
    },
    Pending: {
        icon: "◷",
        color: "border-amber-500 bg-amber-50 text-amber-700",
        iconBg: "bg-amber-100",
    },
    Cancelled: {
        icon: "×",
        color: "border-rose-500 bg-rose-50 text-rose-700",
        iconBg: "bg-rose-100",
    },
    Completed: {
        icon: "✓",
        color: "border-blue-500 bg-blue-50 text-blue-700",
        iconBg: "bg-blue-100",
    },
    Failed: {
        icon: "!",
        color: "border-slate-400 bg-slate-100 text-slate-700",
        iconBg: "bg-slate-200",
    },
};

export default function StatusCard({ label, value }) {
    const style = statusStyles[label] ?? statusStyles.Failed;

    return (
        <div
            className={`rounded-xl border border-l-4 border-gray-100 ${style.color.split(" ").slice(0, 1).join(" ")} bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md`}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-gray-500">
                        {label}
                    </p>

                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                        {value ?? 0}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                        {label === "Confirmed"
                            ? "Bookings approved"
                            : label === "Pending"
                              ? "Awaiting approval"
                              : label === "Cancelled"
                                ? "Bookings cancelled"
                                : label === "Completed"
                                  ? "Sessions finished"
                                  : "Unsuccessful bookings"}
                    </p>
                </div>

                <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl font-bold ${style.iconBg} ${style.color.split(" ").slice(-1)[0]}`}
                >
                    {style.icon}
                </span>
            </div>
        </div>
    );
}
