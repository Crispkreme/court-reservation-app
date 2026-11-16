import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getCourtSchedules } from "@services/courtScheduleService";

import ScheduleToolbar, { getUaeToday } from "@/components/ScheduleToolbar";
import ScheduleGrid from "@/components/ScheduleGrid";
import ScheduleLegend from "@/components/ScheduleLegend";
import StatCard from "@components/common/StatCard";
import AlertMessage from "@components/AlertMessage";
import PageHeader from "@components/common/PageHeader";
import { courtScheduleStats } from "@data/init/courtschedule";

export default function CourtScheduleIndex() {
    const [date, setDate] = useState(getUaeToday);
    const [view, setView] = useState("daily");
    const [courtId, setCourtId] = useState("");
    const [courts, setCourts] = useState([]);
    const [period, setPeriod] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    const refresh = useCallback(() => {
        setRefreshKey((prev) => prev + 1);
    }, []);

    useEffect(() => {
        let active = true;

        const loadSchedules = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await getCourtSchedules({ date, view });

                if (!active) return;

                const payload = response?.data ?? response;

                setCourts(
                    Array.isArray(payload?.courts)
                        ? payload.courts
                        : []
                );

                setPeriod(payload?.period ?? null);
            } catch (err) {
                if (!active) return;

                setError(
                    err.response?.data?.message ||
                        "Failed to load court schedules."
                );

                setCourts([]);
                setPeriod(null);
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadSchedules();

        return () => {
            active = false;
        };
    }, [date, view, refreshKey]);

    const courtOptions = useMemo(
        () =>
            courts.map((court) => ({
                id: court.id,
                name: court.name,
            })),
        [courts]
    );

    const visibleCourts = useMemo(() => {
        if (!courtId) return courts;

        return courts.filter(
            (court) => String(court.id) === String(courtId)
        );
    }, [courts, courtId]);

    const stats = useMemo(() => {
        const result = {
            total: 0,
            available: 0,
            booked: 0,
            unavailable: 0,
        };

        visibleCourts.forEach((court) => {
            court.days?.forEach((day) => {
                day.slots?.forEach((slot) => {
                    result.total += 1;

                    if (slot.status === "available") {
                        result.available += 1;
                    } else if (slot.status === "booked") {
                        result.booked += 1;
                    } else {
                        result.unavailable += 1;
                    }
                });
            });
        });

        return result;
    }, [visibleCourts]);

    return (
        <div className="p-6 lg:p-10">
            <PageHeader
                title="Court Schedule Management"
                description="Monitor court availability, reservations, closures and maintenance schedules."
            />

            <ScheduleToolbar
                date={date}
                view={view}
                courtId={courtId}
                courts={courtOptions}
                loading={loading}
                onDateChange={setDate}
                onViewChange={setView}
                onCourtChange={setCourtId}
                onRefresh={refresh}
            />

            <AlertMessage
                type="error"
                message={error}
                onClose={() => setError("")}
            />

            {!error && (
                <div className="space-y-6 mt-5">
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {courtScheduleStats.map((card) => (
                            <StatCard
                                key={card.key}
                                label={card.label}
                                value={
                                    loading
                                        ? "—"
                                        : stats[card.key] ?? 0
                                }
                                icon={card.icon}
                                iconClassName={card.color}
                            />
                        ))}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <h2 className="text-sm font-semibold text-slate-800">
                                Schedule Status
                            </h2>

                            {period && (
                                <span className="text-xs text-slate-500">
                                    {period.start_date}
                                    {" — "}
                                    {period.end_date}
                                    {" · UAE Time"}
                                </span>
                            )}
                        </div>

                        <ScheduleLegend />
                    </div>

                    <ScheduleGrid
                        courts={visibleCourts}
                        view={view}
                        loading={loading}
                    />
                </div>
            )}
        </div>
    );
}