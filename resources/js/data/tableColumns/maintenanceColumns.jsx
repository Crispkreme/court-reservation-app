
import { Pencil, Trash2, CalendarClock, Clock3 } from "lucide-react";
import { formatDateTime } from "@utils/index.js";

export const getMaintenanceStatus = (period, now = Date.now()) => {
    if (!period || typeof period !== "object") {
        return {
            key: "unknown",
            label: "Unknown",
            styles: "bg-gray-100 text-gray-600",
        };
    }

    const start = new Date(period.start_at).getTime();
    const end = new Date(period.end_at).getTime();

    if (!Number.isFinite(start) || !Number.isFinite(end)) {
        return {
            key: "unknown",
            label: "Unknown",
            styles: "bg-gray-100 text-gray-600",
        };
    }

    if (now < start) {
        return {
            key: "upcoming",
            label: "Upcoming",
            styles: "bg-blue-100 text-blue-700",
        };
    }

    if (now >= end) {
        return {
            key: "completed",
            label: "Completed",
            styles: "bg-gray-100 text-gray-600",
        };
    }

    return {
        key: "active",
        label: "In Progress",
        styles: "bg-amber-100 text-amber-700",
    };
};

export const maintenanceColumns = ({
    onEdit,
    onDelete,
    currentTime = Date.now(),
}) => {
    return [
        {
            key: "court",
            label: "Court",
            render: (_, period) => (
                <div>
                    <p className="font-semibold text-gray-900">
                        {period.court?.name ?? "—"}
                    </p>
                    <p className="text-xs text-gray-500">
                        Court ID: {period.court_id}
                    </p>
                </div>
            ),
        },
        {
            key: "start_at",
            label: "Start Date",
            render: (value) => (
                <div className="flex flex-col gap-1">
                    <span className="inline-flex items-center gap-2 whitespace-nowrap font-medium text-gray-900">
                        <CalendarClock
                            size={15}
                            className="text-red-700"
                        />
                        {formatDateTime(value)}
                    </span>
                    <span className="pl-[23px] text-xs text-gray-400">
                        UAE Time
                    </span>
                </div>
            ),
        },
        {
            key: "end_at",
            label: "End Date",
            render: (value) => (
                <div className="flex flex-col gap-1">
                    <span className="inline-flex items-center gap-2 whitespace-nowrap font-medium text-gray-900">
                        <Clock3
                            size={15}
                            className="text-red-700"
                        />
                        {formatDateTime(value)}
                    </span>
                    <span className="pl-[23px] text-xs text-gray-400">
                        UAE Time
                    </span>
                </div>
            ),
        },
        {
            key: "reason",
            label: "Reason",
            render: (value) => (
                <span
                    className="block max-w-xs truncate text-gray-600"
                    title={value ?? ""}
                >
                    {value || "—"}
                </span>
            ),
        },
        {
            key: "maintenance_status",
            label: "Status",
            render: (_, period) => {
                const status = getMaintenanceStatus(
                    period,
                    currentTime
                );

                return (
                    <span
                        className={`
                            inline-flex items-center
                            whitespace-nowrap rounded-full
                            px-3 py-1 text-xs font-semibold
                            ${status.styles}
                        `}
                    >
                        {status.label}
                    </span>
                );
            },
        },
        {
            key: "actions",
            label: "Actions",
            align: "right",
            render: (_, period) => (
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => onEdit(period)}
                        aria-label={`Edit maintenance for ${period.court?.name ?? "court"}`}
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-700"
                    >
                        <Pencil size={17} />
                    </button>

                    <button
                        type="button"
                        onClick={() => onDelete(period)}
                        aria-label={`Delete maintenance for ${period.court?.name ?? "court"}`}
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-700"
                    >
                        <Trash2 size={17} />
                    </button>
                </div>
            ),
        },
    ];
};
