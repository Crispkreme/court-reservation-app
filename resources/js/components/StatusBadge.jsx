
export default function StatusBadge({ status }) {
    const normalized = String(status || "unknown").toLowerCase();

    const statusStyles = {
        confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        completed: "bg-blue-50 text-blue-700 ring-blue-600/20",
        active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        available: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        successful: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",

        pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
        held: "bg-amber-50 text-amber-700 ring-amber-600/20",
        reserved: "bg-amber-50 text-amber-700 ring-amber-600/20",
        processing: "bg-amber-50 text-amber-700 ring-amber-600/20",
        waiting: "bg-amber-50 text-amber-700 ring-amber-600/20",

        cancelled: "bg-rose-50 text-rose-700 ring-rose-600/20",
        failed: "bg-rose-50 text-rose-700 ring-rose-600/20",
        expired: "bg-rose-50 text-rose-700 ring-rose-600/20",
        closed: "bg-rose-50 text-rose-700 ring-rose-600/20",
        maintenance: "bg-rose-50 text-rose-700 ring-rose-600/20",
        no_show: "bg-rose-50 text-rose-700 ring-rose-600/20",
    };

    const classes =
        statusStyles[normalized] ||
        "bg-slate-100 text-slate-600 ring-slate-500/20";

    const label = String(status || "Unknown")
        .replaceAll("_", " ");

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${classes}`}
        >
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
            {label}
        </span>
    );
}
