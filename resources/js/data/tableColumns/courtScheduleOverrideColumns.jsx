
import { Pencil, Trash2, Clock3 } from "lucide-react";

const formatDate = (date) => {
    if (!date) return "—";

    const value = String(date).slice(0, 10);
    const [year, month, day] = value.split("-");

    if (!year || !month || !day) return "—";

    return `${day}/${month}/${year}`;
};

const getWeekday = (date) => {
    if (!date) return "—";

    const value = String(date).slice(0, 10);
    const parsed = new Date(`${value}T12:00:00Z`);

    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleDateString("en-US", {
        weekday: "long",
        timeZone: "UTC",
    });
};

const formatTime = (time) => {
    if (!time) return "—";

    const [hours, minutes] = String(time).split(":");

    if (hours === undefined || minutes === undefined) {
        return "—";
    }

    const hour = Number(hours);
    const minute = Number(minutes);

    if (
        !Number.isInteger(hour) ||
        !Number.isInteger(minute) ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59
    ) {
        return "—";
    }

    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;

    return `${formattedHour}:${String(minute).padStart(2, "0")} ${period}`;
};

export const courtScheduleOverrideColumns = ({
    onEdit,
    onDelete,
}) => {
    return [
        {
            key: "court",
            label: "Court",
            render: (_, item) => (
                <div className="flex flex-col gap-1">
                    <span className="font-semibold text-gray-900">
                        {item.court?.name || `Court ${item.court_id}`}
                    </span>
                </div>
            ),
        },
        {
            key: "date",
            label: "Date",
            render: (value) => (
                <span className="whitespace-nowrap font-medium text-gray-900">
                    {formatDate(value)}
                </span>
            ),
        },
        {
            key: "day",
            label: "Day",
            render: (_, item) => (
                <span className="text-gray-600">
                    {getWeekday(item.date)}
                </span>
            ),
        },
        {
            key: "opening_time",
            label: "Operating Hours",
            render: (_, item) => {
                if (item.status === "closed") {
                    return (
                        <span className="text-sm font-medium text-gray-400">
                            Closed
                        </span>
                    );
                }

                return (
                    <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-2 whitespace-nowrap font-medium text-gray-900">
                            <Clock3
                                size={15}
                                className="text-red-700"
                            />

                            {formatTime(item.opening_time)}
                            {" – "}
                            {formatTime(item.closing_time)}
                        </span>

                        <span className="pl-[23px] text-xs text-gray-400">
                            UAE Time
                        </span>
                    </div>
                );
            },
        },
        {
            key: "status",
            label: "Status",
            align: "center",
            render: (value) => {
                const isOpen = value === "open";

                return (
                    <span
                        className={`
                            inline-flex items-center
                            whitespace-nowrap rounded-full
                            px-3 py-1 text-xs font-semibold
                            ${
                                isOpen
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-red-50 text-red-700"
                            }
                        `}
                    >
                        {isOpen ? "Open" : "Closed"}
                    </span>
                );
            },
        },
        {
            key: "notes",
            label: "Reason / Notes",
            render: (value) => (
                <span
                    title={value || ""}
                    className="block max-w-[220px] truncate text-gray-600"
                >
                    {value || "—"}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            align: "right",
            render: (_, item) => (
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => onEdit(item)}
                        aria-label={`Edit schedule override for ${item.court?.name || `Court ${item.court_id}`}`}
                        title="Edit"
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-700"
                    >
                        <Pencil size={17} />
                    </button>

                    <button
                        type="button"
                        onClick={() => onDelete(item)}
                        aria-label={`Delete schedule override for ${item.court?.name || `Court ${item.court_id}`}`}
                        title="Delete"
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-700"
                    >
                        <Trash2 size={17} />
                    </button>
                </div>
            ),
        },
    ];
};
