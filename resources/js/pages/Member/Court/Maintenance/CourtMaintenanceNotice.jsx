import { CalendarClock, Wrench } from "lucide-react";
import { formatDateTime } from "@utils";

export default function CourtMaintenanceNotice({
    periods = [],
}) {
    if (!periods.length) return null;

    const now = Date.now();

    return (
        <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                <Wrench size={18} className="text-amber-600" />
                Court Maintenance Schedule
            </h3>

            {periods.map((period) => {
                const isActive =
                    new Date(period.start_at).getTime() <= now &&
                    new Date(period.end_at).getTime() > now;

                return (
                    <div
                        key={period.id}
                        className="rounded-xl border border-amber-200 bg-amber-50 p-4"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <CalendarClock
                                    size={17}
                                    className="text-amber-700"
                                />
                                <span className="text-sm font-semibold text-amber-900">
                                    {isActive
                                        ? "Maintenance in Progress"
                                        : "Scheduled Maintenance"}
                                </span>
                            </div>

                            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-amber-700">
                                {isActive ? "Active" : "Upcoming"}
                            </span>
                        </div>

                        <div className="mt-3 space-y-1 text-sm text-gray-700">
                            <p>
                                <span className="font-medium">Start:</span>{" "}
                                {formatDateTime(period.start_at)}
                            </p>

                            <p>
                                <span className="font-medium">End:</span>{" "}
                                {formatDateTime(period.end_at)}
                            </p>

                            {period.reason && (
                                <p>
                                    <span className="font-medium">Reason:</span>{" "}
                                    {period.reason}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
