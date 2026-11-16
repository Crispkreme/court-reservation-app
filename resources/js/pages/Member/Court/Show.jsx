import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ArrowLeft, MapPin, Users, Clock3, Trophy, House, Sun, CalendarDays, CalendarClock, AlertCircle, Wrench, LockKeyhole, Sunrise, Sunset } from "lucide-react";

import { getCourt } from "@services/courtService";
import { getCourtMaintenancePeriods } from "@services/courtMaintenanceService";
import { formatPrice, getBookingDurations, calculatePrice, formatDuration, getOperatingStatus, formatOperatingTime, getCurrentUaeTime, formatDateTime } from "@utils";
import { statusConfig } from "@data/init/court"

export default function MemberCourtShow() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [court, setCourt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentTime, setCurrentTime] = useState("");
    const [selectedDuration, setSelectedDuration] = useState("");
    const [maintenancePeriods, setMaintenancePeriods] = useState([]);
    const [maintenanceError, setMaintenanceError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadCourt = async () => {
            try {
                setLoading(true);
                setError("");
                setCourt(null);
                setMaintenancePeriods([]);
                setMaintenanceError("");

                const [courtResult, maintenanceResult] = await Promise.allSettled([
                    getCourt(id),
                    getCourtMaintenancePeriods(id),
                ]);

                if (courtResult.status === "rejected") {
                    throw courtResult.reason;
                }

                const response = courtResult.value;

                if (!cancelled) {
                    setCourt(response.data);
                    setSelectedDuration("");
                    if (maintenanceResult.status === "fulfilled") {
                        setMaintenancePeriods(
                            Array.isArray(maintenanceResult.value?.data)
                                ? maintenanceResult.value.data
                                : []
                        );
                    } else {
                        setMaintenanceError("Maintenance information is temporarily unavailable.");
                    }
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.status === 404
                            ? "This court does not exist or is not accessible."
                            : err.response?.data?.message ||
                              "Failed to load court details."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadCourt();

        return () => {
            cancelled = true;
        };
    }, [id]);

    useEffect(() => {
        const updateTime = () => {
            setCurrentTime(getCurrentUaeTime());
        };

        updateTime();

        const interval = setInterval(updateTime, 30000);

        return () => clearInterval(interval);
    }, []);

    const goBack = () => navigate("/member/courts");
    if (loading) {
        return (
            <div className="animate-pulse space-y-6 p-6 lg:p-10">
                <div className="h-6 w-36 rounded bg-slate-200" />
                <div className="h-64 rounded-2xl bg-slate-100" />
                <div className="h-12 w-64 rounded bg-slate-100" />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-24 rounded-xl bg-slate-100"
                        />
                    ))}
                </div>
            </div>
        );
    }
    if (error || !court) {
        return (
            <div className="space-y-6 p-6 lg:p-10">
                <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-700"
                >
                    <ArrowLeft size={18} />
                    Back to Courts
                </button>

                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
                    <AlertCircle
                        size={44}
                        className="mx-auto mb-4 text-red-600"
                    />

                    <h2 className="text-xl font-bold text-slate-900">
                        Court Not Found
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        {error || "Court not found."}
                    </p>

                    <button
                        type="button"
                        onClick={goBack}
                        className="mt-6 rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white hover:bg-red-800"
                    >
                        Browse Other Courts
                    </button>
                </div>
            </div>
        );
    }

    const allowedDurations = getBookingDurations(court);
    const activeDuration = allowedDurations.includes(Number(selectedDuration)) ? Number(selectedDuration) : allowedDurations[0] ?? null;
    const estimatedPrice = activeDuration == null ? null : calculatePrice(court.price_per_hour, activeDuration);
    const isIndoor = court.court_type === "indoor";
    const status = statusConfig[court.status] ?? {
        label: "Unknown",
        styles: "bg-gray-100 text-gray-600",
        icon: AlertCircle,
        message:
            "This court is not currently available for booking.",
    };

    const StatusIcon = status.icon;
    const isAvailable = court.status === "available";
    const operatingStatus = getOperatingStatus(court, currentTime);
    const isOpenNow = operatingStatus.key === "open";
    const now = Date.now();
    const activeMaintenance = maintenancePeriods.find((period) => {
        const start = new Date(period.start_at).getTime();
        const end = new Date(period.end_at).getTime();
        return Number.isFinite(start) && Number.isFinite(end) && start <= now && now < end;
    });
    const visibleMaintenance = maintenancePeriods.filter((period) =>
        new Date(period.end_at).getTime() > now
    );
    const playerCapacity =
        court.min_players != null &&
        court.max_players != null
            ? `${court.min_players}–${court.max_players} players`
            : "—";
    const details = [
        {
            label: "Sport Category",
            value: court.sport_category?.name ?? court.sportCategory?.name ?? "—",
            icon: Trophy,
        },
        {
            label: "Court Type",
            value: isIndoor ? "Indoor" : "Outdoor",
            icon: isIndoor ? House : Sun,
        },
        {
            label: "Location",
            value: court.location || "—",
            icon: MapPin,
        },
        {
            label: "Player Capacity",
            value: playerCapacity,
            icon: Users,
        },
        {
            label: "Booking Interval",
            value: allowedDurations.length ? `${court.booking_interval_minutes} min` : "Not configured",
            icon: CalendarClock,
        },
        {
            label: "Booking Duration",
            value: allowedDurations.length ? `${formatDuration(allowedDurations[0])} – ${formatDuration(allowedDurations[allowedDurations.length - 1])}` : "Not configured",
            icon: CalendarDays,
        },
        {
            label: "Opening Time",
            value: formatOperatingTime(court.opening_time),
            icon: Sunrise,
        },
        {
            label: "Closing Time",
            value: formatOperatingTime(court.closing_time),
            icon: Sunset,
        },
    ];

    return (
        <div className="p-6 lg:p-10">
            <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-red-700"
            >
                <ArrowLeft size={18} />
                Back to Courts
            </button>
            <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="relative flex h-56 items-center justify-center bg-gradient-to-br from-red-50 via-white to-slate-100 sm:h-72">
                    <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-white bg-white/80 shadow-sm">
                        {isIndoor ? (
                            <House
                                size={60}
                                className="text-red-700"
                            />
                        ) : (
                            <Sun
                                size={60}
                                className="text-red-700"
                            />
                        )}
                    </div>
                    <span className="absolute left-5 top-5 max-w-[45%] truncate rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm">
                        {court.sport_category?.name ??
                            court.sportCategory?.name ??
                            "Sport"}
                    </span>
                    <span
                        className={`
                            absolute right-5 top-5
                            inline-flex max-w-[50%] items-center
                            gap-1.5 rounded-full px-3 py-2
                            text-xs font-semibold
                            ${status.styles}
                        `}
                    >
                        <StatusIcon
                            size={15}
                            className="shrink-0"
                        />
                        {status.label}
                    </span>
                </div>
                <div className="flex flex-wrap items-start justify-between gap-5 p-6 lg:p-8">
                    <div className="max-w-2xl">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-red-700">
                            {court.court_type} Court
                        </p>

                        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                            {court.name}
                        </h1>

                        <p className="mt-3 text-sm leading-7 text-slate-600">
                            {court.description ||
                                "Enjoy your game at this sports facility."}
                        </p>
                        <div className="mt-4">
                            <span
                                className={`
                                    inline-flex items-center gap-2
                                    rounded-full px-3 py-1.5
                                    text-xs font-semibold
                                    ${operatingStatus.styles}
                                `}
                            >
                                <span
                                    className={`h-2 w-2 rounded-full ${
                                        isOpenNow
                                            ? "bg-emerald-500"
                                            : "bg-gray-400"
                                    }`}
                                />

                                {operatingStatus.label}
                            </span>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-5">
                        <p className="text-xs font-medium text-slate-500">
                            Price per hour
                        </p>

                        <p className="mt-1 text-2xl font-bold text-red-700">
                            PHP {formatPrice(court.price_per_hour)}
                        </p>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-5 lg:col-span-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900">
                            Court Information
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Everything you need to know about this court.
                        </p>

                        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {details.map(
                                ({ label, value, icon: Icon }) => (
                                    <div
                                        key={label}
                                        className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700">
                                            <Icon size={19} />
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                {label}
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-slate-900">
                                                {value}
                                            </p>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-lg font-bold text-slate-900">
                                Operating Hours
                            </h2>

                            <span
                                className={`
                                    rounded-full px-3 py-1
                                    text-xs font-semibold
                                    ${operatingStatus.styles}
                                `}
                            >
                                {operatingStatus.label}
                            </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                            {operatingStatus.message}
                        </p>

                        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                                <Sunrise
                                    size={22}
                                    className="text-amber-600"
                                />

                                <div>
                                    <p className="text-xs text-slate-500">
                                        Opening Time
                                    </p>

                                    <p className="mt-1 text-sm font-bold text-slate-900">
                                        {formatOperatingTime(
                                            court.opening_time
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                                <Sunset
                                    size={22}
                                    className="text-red-700"
                                />

                                <div>
                                    <p className="text-xs text-slate-500">
                                        Closing Time
                                    </p>

                                    <p className="mt-1 text-sm font-bold text-slate-900">
                                        {formatOperatingTime(
                                            court.closing_time
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                            <Clock3 size={14} />
                            All times are shown in UAE time
                            (Asia/Dubai).
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                                <Wrench size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Court Maintenance</h2>
                                <p className="text-sm text-slate-500">Current and upcoming maintenance schedules</p>
                            </div>
                        </div>

                        {maintenanceError ? (
                            <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                                {maintenanceError}
                            </p>
                        ) : visibleMaintenance.length === 0 ? (
                            <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                                No active or upcoming maintenance is scheduled.
                            </p>
                        ) : (
                            <div className="mt-5 space-y-3">
                                {visibleMaintenance.map((period) => {
                                    const isActive = new Date(period.start_at).getTime() <= now;
                                    return (
                                        <div key={period.id} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <span className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                                                    <CalendarClock size={17} />
                                                    {isActive ? "Maintenance in Progress" : "Scheduled Maintenance"}
                                                </span>
                                                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-700">
                                                    {isActive ? "Active" : "Upcoming"}
                                                </span>
                                            </div>
                                            <div className="mt-3 space-y-2 text-sm text-slate-700">
                                                <p><span className="font-semibold">Start:</span> {formatDateTime(period.start_at)}</p>
                                                <p><span className="font-semibold">End:</span> {formatDateTime(period.end_at)}</p>
                                                {period.reason && <p><span className="font-semibold">Reason:</span> {period.reason}</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <p className="mt-4 text-xs text-slate-400">All times are shown in UAE time (Asia/Dubai).</p>
                    </div>
                </div>
                <div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                            <CalendarDays
                                size={24}
                                className="text-red-700"
                            />
                        </div>

                        <h2 className="text-lg font-bold text-slate-900">
                            {activeMaintenance
                                ? "Court Under Maintenance"
                                : isAvailable
                                  ? "Book This Court"
                                  : "Court Unavailable"}
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            {activeMaintenance
                                ? `Maintenance is scheduled until ${formatDateTime(activeMaintenance.end_at)}.`
                                : maintenanceError
                                  ? maintenanceError
                                  : isAvailable
                                ? isOpenNow
                                    ? status.message
                                    : operatingStatus.message
                                : status.message}
                        </p>

                        <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4">
                            <div className="flex items-center justify-between gap-3 text-sm">
                                <span className="text-slate-500">
                                    Hourly Rate
                                </span>

                                <span className="font-bold text-slate-900">
                                    PHP {formatPrice(court.price_per_hour)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3 text-sm">
                                <span className="text-slate-500">
                                    Player Capacity
                                </span>

                                <span className="font-semibold text-slate-900">
                                    {playerCapacity}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3 text-sm">
                                <span className="text-slate-500">
                                    Court Status
                                </span>

                                <span
                                    className={`font-semibold ${
                                        isAvailable
                                            ? "text-emerald-700"
                                            : "text-slate-700"
                                    }`}
                                >
                                    {activeMaintenance ? "Under Maintenance" : status.label}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3 text-sm">
                                <span className="text-slate-500">
                                    Operating Status
                                </span>

                                <span
                                    className={`font-semibold ${
                                        isOpenNow
                                            ? "text-emerald-700"
                                            : "text-slate-700"
                                    }`}
                                >
                                    {operatingStatus.label}
                                </span>
                            </div>
                        </div>
                        <div className="mt-5 rounded-xl border border-slate-200 p-4">
                            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                <CalendarClock size={17} className="text-red-700" />
                                Booking Configuration
                            </h3>

                            {allowedDurations.length ? (
                                <>
                                    <div className="mt-3 space-y-2 text-sm">
                                        <div className="flex justify-between gap-3">
                                            <span className="text-slate-500">Interval</span>
                                            <span className="font-semibold">{court.booking_interval_minutes} min</span>
                                        </div>
                                        <div className="flex justify-between gap-3">
                                            <span className="text-slate-500">Minimum</span>
                                            <span className="font-semibold">{formatDuration(allowedDurations[0])}</span>
                                        </div>
                                        <div className="flex justify-between gap-3">
                                            <span className="text-slate-500">Maximum</span>
                                            <span className="font-semibold">{formatDuration(allowedDurations[allowedDurations.length - 1])}</span>
                                        </div>
                                    </div>

                                    <label htmlFor="court-booking-duration" className="mt-4 block text-xs font-semibold text-slate-600">
                                        Preview booking duration
                                    </label>
                                    <select
                                        id="court-booking-duration"
                                        value={activeDuration ?? ""}
                                        onChange={(event) => setSelectedDuration(event.target.value)}
                                        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
                                    >
                                        {allowedDurations.map((minutes) => (
                                            <option key={minutes} value={minutes}>
                                                {formatDuration(minutes)}
                                            </option>
                                        ))}
                                    </select>

                                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                                        <span className="text-sm text-slate-500">Estimated price</span>
                                        <span className="text-lg font-bold text-red-700">
                                            {estimatedPrice === null ? "—" : `PHP ${formatPrice(estimatedPrice)}`}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-xs text-slate-400">
                                        Price preview only. Time-slot availability and reservations are not enabled yet.
                                    </p>
                                </>
                            ) : (
                                <p className="mt-3 text-sm text-red-600">
                                    Booking rules unavailable. Please contact the administrator.
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            disabled
                            className="mt-5 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-500"
                        >
                            {isAvailable && isOpenNow && !activeMaintenance && !maintenanceError ? (
                                <CalendarDays size={18} />
                            ) : (
                                <LockKeyhole size={18} />
                            )}

                            {activeMaintenance
                                ? "Under Maintenance"
                                : maintenanceError
                                  ? "Availability Unconfirmed"
                                  : !isAvailable || !allowedDurations.length
                                ? "Booking Unavailable"
                                : !isOpenNow
                                  ? "Court Currently Closed"
                                  : "Booking Coming Soon"}
                        </button>

                        <p className="mt-3 text-center text-xs text-slate-400">
                            {activeMaintenance
                                ? "This court is currently undergoing maintenance."
                                : maintenanceError
                                  ? "Maintenance availability could not be confirmed."
                                  : !isAvailable
                                ? "This court must be available before it can be booked."
                                : !allowedDurations.length
                                  ? "Booking configuration is unavailable."
                                  : !isOpenNow
                                  ? "Please check the court operating hours."
                                  : "Time-slot availability is not yet enabled."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}