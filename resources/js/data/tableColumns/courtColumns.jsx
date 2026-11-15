import { Pencil, Trash2, MapPin, Users, Clock3, CalendarClock} from "lucide-react";
import { statusConfig, courtStatusOptions } from "@config/index";
import { TIME_ZONE, BOOKING_INTERVALS, formatPrice, formatOperatingTime, formatDuration, hasValidBookingConfiguration, getAllowedBookingDurations, calculateBookingPrice, getCurrentUaeTime, getOperatingStatus } from "@utils";

export const courtColumns = ({
    onEdit,
    onDelete,
    currentTime,
}) => {

    const uaeTime = currentTime || getCurrentUaeTime();

    return [
        {
            key: "name",
            label: "Court",
            render: (value, court) => (
                <div>
                    <p className="font-semibold text-gray-900">
                        {value}
                    </p>
                    <p className="text-xs text-gray-500">
                        {court.sport_category?.name ?? court.sportCategory?.name ?? "—"}
                    </p>
                </div>
            ),
        }, {
            key: "location",
            label: "Location",
            render: (value) => (
                <span className="inline-flex items-center gap-2">
                    <MapPin
                        size={15}
                        className="text-gray-400"
                    />
                    {value || "—"}
                </span>
            ),
        }, {
            key: "court_type",
            label: "Type",
            render: (value) => (
                <span className="capitalize">
                    {value || "—"}
                </span>
            ),
        }, {
            key: "min_players",
            label: "Player Capacity",
            render: (value, court) => (
                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                    <Users
                        size={16}
                        className="text-red-700"
                    />
                    <span className="font-medium text-gray-900">
                        {value != null && court.max_players != null ? `${value}–${court.max_players} players` : "—"}
                    </span>
                </span>
            ),
        }, {
            key: "price_per_hour",
            label: "Hourly Price",
            render: (value) => (
                <div className="flex flex-col gap-1">
                    <span className="whitespace-nowrap font-semibold text-gray-900">
                        {value != null && value !== "" ? `AED ${formatPrice(value)}` : "—"}
                    </span>
                    <span className="text-xs text-gray-400">
                        Per hour
                    </span>
                </div>
            ),
        }, {
            key: "booking_interval_minutes",
            label: "Booking Interval",
            render: (value) => (
                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                    <CalendarClock
                        size={16}
                        className="text-red-700"
                    />
                    <span className="font-medium text-gray-900">
                        {BOOKING_INTERVALS.includes(Number(value)) && value != null ? `${value} min` : "—"}
                    </span>
                </span>
            ),
        }, {
            key: "min_booking_minutes",
            label: "Booking Duration",
            render: (_, court) => {
                const isValid = hasValidBookingConfiguration(court);

                if (!isValid) {
                    return (
                        <span className="text-xs font-medium text-red-600">
                            Invalid configuration
                        </span>
                    );
                }

                return (
                    <div className="flex flex-col gap-1">
                        <span className="whitespace-nowrap text-sm font-semibold text-gray-900">
                            {formatDuration(court.min_booking_minutes)}
                            {" – "}
                            {formatDuration(court.max_booking_minutes)}
                        </span>
                        <span className="text-xs text-gray-400">
                            Min – Max
                        </span>
                    </div>
                );
            },
        }, {
            key: "opening_time",
            label: "Operating Hours",
            render: (_, court) => (
                <div className="flex flex-col gap-1">
                    <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        <Clock3
                            size={15}
                            className="text-red-700"
                        />

                        {formatOperatingTime(court.opening_time)}
                        {" – "}
                        {formatOperatingTime(court.closing_time)}
                    </span>

                    <span className="pl-[23px] text-xs text-gray-400">
                        UAE Time
                    </span>
                </div>
            ),
        }, {
            key: "status",
            label: "Status",
            render: (value) => {
                const status = statusConfig[value] ?? {
                    label: "Unknown",
                    styles: "bg-gray-100 text-gray-600",
                };

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
        }, {
            key: "operating_status",
            label: "Open / Closed",
            render: (_, court) => {
                const operatingStatus = getOperatingStatus(court, uaeTime);
                return (
                    <span
                        className={`
                            inline-flex items-center
                            whitespace-nowrap rounded-full
                            px-3 py-1 text-xs font-semibold
                            ${operatingStatus.styles}
                        `}
                    >
                        {operatingStatus.label}
                    </span>
                );
            },
        }, {
            key: "actions",
            label: "Actions",
            align: "right",
            render: (_, court) => (
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => onEdit(court)}
                        aria-label={`Edit ${court.name}`}
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-700"
                    >
                        <Pencil size={17} />
                    </button>

                    <button
                        type="button"
                        onClick={() => onDelete(court)}
                        aria-label={`Delete ${court.name}`}
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-700"
                    >
                        <Trash2 size={17} />
                    </button>
                </div>
            ),
        },
    ];
};
