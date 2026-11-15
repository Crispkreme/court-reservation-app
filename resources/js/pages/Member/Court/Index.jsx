import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { MapPin, Users, Clock3, Trophy, House, Sun, ArrowRight, LayoutGrid, RefreshCw, CalendarClock } from "lucide-react";

import { getCourts } from "@services/courtService";
import { getOperatingStatus, getCurrentUaeTime, hasValidBookingConfiguration, formatDuration, formatPrice, TIME_ZONE, formatOperatingTime } from "@utils";
import { statusConfig, statusOptions, operatingOptions } from "@data/init/court"

import PageHeader from "@components/common/PageHeader";
import StatCard from "@components/common/StatCard";
import FilterPanel from "@components/common/FilterPanel";
import AlertMessage from "@components/AlertMessage";
import EmptyState from "@components/common/EmptyState";

function CourtCard({ court, onView, currentTime }) {
    const indoor = court.court_type === "indoor";

    const status = statusConfig[court.status] ?? {
        label: "Unknown",
        styles: "bg-gray-100 text-gray-600",
    };

    const operatingStatus = getOperatingStatus(
        court,
        currentTime
    );

    const bookingConfigured = hasValidBookingConfiguration(court);
    const hourlyPrice =
        court.price_per_hour !== null &&
        court.price_per_hour !== undefined &&
        court.price_per_hour !== "" &&
        Number.isFinite(Number(court.price_per_hour))
            ? `AED ${formatPrice(court.price_per_hour)}`
            : "Price unavailable";

    const playerCapacity =
        court.min_players != null &&
        court.max_players != null
            ? `${court.min_players}–${court.max_players} players`
            : "Not specified";

    return (
        <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
            {/* Court Hero */}
            <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-rose-50 via-white to-slate-100">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white bg-white/80 shadow-sm">
                    {indoor ? (
                        <House
                            size={36}
                            className="text-red-700"
                        />
                    ) : (
                        <Sun
                            size={36}
                            className="text-red-700"
                        />
                    )}
                </div>

                {/* Sport Category */}
                <span className="absolute left-4 top-4 max-w-[45%] truncate rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                    {court.sport_category?.name ??
                        court.sportCategory?.name ??
                        "Sport"}
                </span>

                {/* Court Status */}
                <span
                    className={`
                        absolute right-4 top-4
                        max-w-[50%] rounded-full
                        px-3 py-1 text-center text-xs
                        font-semibold ${status.styles}
                    `}
                >
                    {status.label}
                </span>
            </div>

            {/* Court Content */}
            <div className="flex flex-1 flex-col p-5">
                <div className="mb-3">
                    <h3 className="text-lg font-bold text-slate-900">
                        {court.name}
                    </h3>

                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-red-700">
                        {court.court_type} Court
                    </p>
                </div>

                <p className="mb-4 line-clamp-2 text-sm text-slate-500">
                    {court.description ||
                        "Enjoy your game at this sports facility."}
                </p>

                {/* Operating Status */}
                <div className="mb-5">
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
                                operatingStatus.key === "open"
                                    ? "bg-emerald-500"
                                    : operatingStatus.key === "closed"
                                      ? "bg-gray-400"
                                      : "bg-slate-400"
                            }`}
                        />

                        {operatingStatus.label}
                    </span>
                </div>

                {/* Court Information */}
                <div className="mb-5 space-y-3">
                    {/* Location */}
                    <div className="flex items-start gap-2.5 text-sm text-slate-600">
                        <MapPin
                            size={17}
                            className="mt-0.5 shrink-0 text-red-600"
                        />

                        <span>
                            {court.location || "Not specified"}
                        </span>
                    </div>

                    {/* Capacity */}
                    <div className="flex items-center gap-2.5 text-sm text-slate-600">
                        <Users
                            size={17}
                            className="shrink-0 text-red-600"
                        />

                        <span>
                            Capacity: {playerCapacity}
                        </span>
                    </div>

                    {/* Booking Interval and Duration */}
                    <div className="flex items-start gap-2.5 text-sm text-slate-600">
                        <CalendarClock
                            size={17}
                            className="mt-0.5 shrink-0 text-red-600"
                        />
                        <div>
                            {bookingConfigured ? (
                                <>
                                    <p className="font-medium text-slate-700">
                                        {formatDuration(court.min_booking_minutes)}
                                        {" – "}
                                        {formatDuration(court.max_booking_minutes)}
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-400">
                                        {court.booking_interval_minutes}-min booking intervals
                                    </p>
                                </>
                            ) : (
                                <p className="text-xs text-amber-700">
                                    Booking rules unavailable
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Opening and Closing Hours */}
                    <div className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Clock3
                            size={17}
                            className="mt-0.5 shrink-0 text-red-600"
                        />

                        <div>
                            <p className="font-medium text-slate-700">
                                {formatOperatingTime(
                                    court.opening_time
                                )}
                                {" – "}
                                {formatOperatingTime(
                                    court.closing_time
                                )}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                                UAE Time
                            </p>
                        </div>
                    </div>
                </div>

                {/* Price and Details */}
                <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
                    <div>
                        <p className="text-xs text-slate-500">
                            Price per hour
                        </p>

                        <p className="mt-1 text-xl font-bold text-red-700">
                            {hourlyPrice}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => onView(court)}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800"
                    >
                        Details
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function MemberCourtIndex() {
    const navigate = useNavigate();

    const [courts, setCourts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [sportFilter, setSportFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [operatingFilter, setOperatingFilter] = useState("");

    const [currentTime, setCurrentTime] = useState("");

    // Live UAE time updates
    useEffect(() => {
        const updateTime = () => {
            setCurrentTime(getCurrentUaeTime());
        };

        updateTime();

        const interval = setInterval(updateTime, 30000);

        return () => clearInterval(interval);
    }, []);

    // Load courts
    useEffect(() => {
        let cancelled = false;

        const loadCourts = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getCourts();

                if (!cancelled) {
                    setCourts(
                        Array.isArray(response.data)
                            ? response.data
                            : []
                    );
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                            "Failed to load courts."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadCourts();

        return () => {
            cancelled = true;
        };
    }, []);

    // Manual refresh
    const loadCourts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getCourts();

            setCourts(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Failed to load courts."
            );
        } finally {
            setLoading(false);
        }
    };

    // Sport categories
    const sports = useMemo(() => {
        const unique = new Map();

        courts.forEach((court) => {
            const sport =
                court.sport_category ??
                court.sportCategory;

            if (sport) {
                unique.set(sport.id, sport.name);
            }
        });

        return Array.from(unique, ([id, name]) => ({
            id,
            name,
        }));
    }, [courts]);

    // Filter courts
    const filteredCourts = useMemo(() => {
        return courts.filter((court) => {
            const keyword = search.trim().toLowerCase();
            const sport = court.sport_category ?? court.sportCategory;

            const matchesSearch =
                !keyword ||
                [
                    court.name,
                    court.description,
                    court.location,
                    sport?.name,
                ].some((value) =>
                    String(value ?? "")
                        .toLowerCase()
                        .includes(keyword)
                );

            const matchesSport = !sportFilter || String(court.sport_category_id) === sportFilter;
            const matchesType = !typeFilter || court.court_type === typeFilter;
            const matchesStatus = !statusFilter || court.status === statusFilter;
            const operatingStatus = getOperatingStatus(court, currentTime);
            const matchesOperating = !operatingFilter || operatingStatus.key === operatingFilter;

            return (
                matchesSearch &&
                matchesSport &&
                matchesType &&
                matchesStatus &&
                matchesOperating
            );
        });
    }, [
        courts,
        search,
        sportFilter,
        typeFilter,
        statusFilter,
        operatingFilter,
        currentTime,
    ]);

    // Reset filters
    const resetFilters = () => {
        setSearch("");
        setSportFilter("");
        setTypeFilter("");
        setStatusFilter("");
        setOperatingFilter("");
    };

    const availableCourts = courts.filter((court) => court.status === "available").length;
    const openCourts = courts.filter((court) => getOperatingStatus(court, currentTime).key ==="open").length;

    return (
        <div className="space-y-6 p-6 lg:p-10">
            {/* Page Header */}
            <PageHeader
                title="Browse Courts"
                description="Explore courts, compare hourly prices and booking durations, and check operating hours"
                showButton
                buttonText="Refresh"
                buttonIcon={RefreshCw}
                buttonVariant="secondary"
                buttonDisabled={loading}
                buttonLoading={loading}
                onButtonClick={loadCourts}
                className="!mb-0"
            />

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                    label="Total Courts"
                    value={courts.length}
                    icon={LayoutGrid}
                />

                <StatCard
                    label="Available Courts"
                    value={availableCourts}
                    icon={Trophy}
                />

                <StatCard
                    label="Open Now"
                    value={openCourts}
                    icon={Clock3}
                />
            </div>

            {/* Filters */}
            <FilterPanel
                title="Search & Filter"
                search={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search court or location..."
                columns={4}
                filters={[
                    {
                        name: "sport",
                        label: "Filter by sport category",
                        value: sportFilter,
                        onChange: setSportFilter,
                        placeholder: "All Sports",
                        options: sports.map((sport) => ({
                            label: sport.name,
                            value: String(sport.id),
                        })),
                    },
                    {
                        name: "type",
                        label: "Filter by court type",
                        value: typeFilter,
                        onChange: setTypeFilter,
                        placeholder: "All Court Types",
                        options: [
                            { label: "Indoor", value: "indoor" },
                            { label: "Outdoor", value: "outdoor" },
                        ],
                    },
                    {
                        name: "status",
                        label: "Filter by court status",
                        value: statusFilter,
                        onChange: setStatusFilter,
                        placeholder: "All Statuses",
                        options: statusOptions,
                    },
                    {
                        name: "operating",
                        label: "Filter by operating status",
                        value: operatingFilter,
                        onChange: setOperatingFilter,
                        placeholder: "All Operating Statuses",
                        options: operatingOptions,
                    },
                ]}
                onClear={resetFilters}
            />

            {/* Error */}
            {error && (
                <AlertMessage
                    type="error"
                    message={error}
                />
            )}

            {/* Court Results */}
            {loading ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map(
                        (_, index) => (
                            <div
                                key={index}
                                className="h-96 animate-pulse rounded-2xl bg-slate-100"
                            />
                        )
                    )}
                </div>
            ) : error ? null : filteredCourts.length === 0 ? (
                <EmptyState
                    icon={LayoutGrid}
                    title="No courts found"
                    description="Try adjusting your search or filters."
                    showButton
                    buttonText="Clear Filters"
                    onButtonClick={resetFilters}
                />
            ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {filteredCourts.map((court) => (
                        <CourtCard
                            key={court.id}
                            court={court}
                            currentTime={currentTime}
                            onView={(selected) => navigate(`/member/courts/${selected.id}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}