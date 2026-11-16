import React from "react";
import { Pencil, Trash2 } from "lucide-react";

export const bookingStatuses = {
    pending: {
        label: "Pending",
        className: "bg-amber-100 text-amber-700",
    },
    confirmed: {
        label: "Confirmed",
        className: "bg-blue-100 text-blue-700",
    },
    completed: {
        label: "Completed",
        className: "bg-green-100 text-green-700",
    },
    cancelled: {
        label: "Cancelled",
        className: "bg-red-100 text-red-700",
    },
};

export const formatBookingDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleDateString("en-AE", {
              timeZone: "Asia/Dubai",
              year: "numeric",
              month: "short",
              day: "numeric",
          });
};

export const formatBookingTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleTimeString("en-AE", {
              timeZone: "Asia/Dubai",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
          });
};

export const bookingColumns = ({
    onEdit,
    onDelete,
    onStatusChange,
    updatingStatusId,
}) => [
    {
        key: "id",
        label: "Booking ID",
        render: (booking) => (
            <span className="font-semibold text-gray-900">
                #{booking.id}
            </span>
        ),
    },
    {
        key: "court",
        label: "Court",
        render: (booking) => (
            <div>
                <p className="font-medium text-gray-900">
                    {booking.court?.name ?? "Unknown Court"}
                </p>
                <p className="text-xs text-gray-500">
                    {booking.court?.location ?? ""}
                </p>
            </div>
        ),
    },
    {
        key: "member",
        label: "Member",
        render: (booking) => (
            <div>
                <p className="font-medium text-gray-900">
                    {booking.user?.name ?? "Unknown Member"}
                </p>
                <p className="text-xs text-gray-500">
                    {booking.user?.email ?? ""}
                </p>
            </div>
        ),
    },
    {
        key: "date",
        label: "Date",
        render: (booking) => formatBookingDate(booking.start_at),
    },
    {
        key: "time",
        label: "Time",
        render: (booking) => (
            <span className="whitespace-nowrap">
                {formatBookingTime(booking.start_at)}
                {" - "}
                {formatBookingTime(booking.end_at)}
            </span>
        ),
    },
    {
        key: "duration",
        label: "Duration",
        render: (booking) => `${booking.duration_minutes} min`,
    },
    {
        key: "total_price",
        label: "Amount",
        render: (booking) => (
            <span className="font-medium">
                PHP {Number(booking.total_price ?? 0).toFixed(2)}
            </span>
        ),
    },
    {
        key: "status",
        label: "Status",
        render: (booking) => {
            const status = bookingStatuses[booking.status] ?? {
                label: booking.status,
                className: "bg-gray-100 text-gray-700",
            };

            return (
                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                >
                    {status.label}
                </span>
            );
        },
    },
    {
        key: "actions",
        label: "Actions",
        render: (booking) => (
            <div className="flex items-center gap-2">
                <select
                    value={booking.status}
                    disabled={updatingStatusId === booking.id}
                    onChange={(event) =>
                        onStatusChange(booking, event.target.value)
                    }
                    className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-red-500 disabled:opacity-50"
                >
                    {Object.entries(bookingStatuses).map(
                        ([value, status]) => (
                            <option key={value} value={value}>
                                {status.label}
                            </option>
                        ),
                    )}
                </select>

                <button
                    type="button"
                    onClick={() => onEdit(booking)}
                    className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                    title="Edit booking"
                >
                    <Pencil size={16} />
                </button>

                <button
                    type="button"
                    onClick={() => onDelete(booking)}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                    title="Delete booking"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        ),
    },
];
