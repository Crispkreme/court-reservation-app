import { useEffect, useState } from "react";
import { Activity, CalendarDays, Clock3, Wrench, CalendarCheck, RefreshCw } from "lucide-react";
import { getCourtUtilization } from "@services/courtUtilizationService";

import FilterPanel from "@components/common/FilterPanel";
import PageHeader from "@components/common/PageHeader";
import AlertMessage from "@components/AlertMessage";
import TableLoader from "@components/common/table/TableLoader";
import TableHeader from "@components/common/table/TableHeader";
import TablePagination from "@components/common/table/TablePagination";

const philippineDate = (date = new Date()) =>
    new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);

const initialDates = () => {
    const today = philippineDate();

    return {
        start_date: `${today.slice(0, 7)}-01`,
        end_date: today,
    };
};

const number = (value) =>
    Number(value ?? 0).toLocaleString("en-US", {
        maximumFractionDigits: 2,
    });

export default function CourtUtilizationIndex() {
    const [filters, setFilters] = useState(initialDates);
    const [applied, setApplied] = useState(initialDates);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reload, setReload] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    useEffect(() => {
        let active = true;

        const load = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await getCourtUtilization(applied);

                if (active) {
                    setResult(response.data);
                }
            } catch (err) {
                if (active) {
                    setResult(null);
                    setError(
                        err.response?.data?.message ||
                            "Failed to load court utilization."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            active = false;
        };
    }, [applied, reload]);

    const summary = result?.summary;

    const stats = [
        {
            label: "Utilization Rate",
            value: `${number(summary?.utilization_rate)}%`,
            icon: Activity,
        },
        {
            label: "Available Hours",
            value: number(summary?.available_hours),
            icon: Clock3,
        },
        {
            label: "Booked Hours",
            value: number(summary?.booked_hours),
            icon: CalendarCheck,
        },
        {
            label: "Maintenance Hours",
            value: number(summary?.maintenance_hours),
            icon: Wrench,
        },
        {
            label: "Total Bookings",
            value: number(summary?.bookings_count),
            icon: CalendarDays,
        },
    ];

    const courts = result?.courts ?? [];

    const totalItems = courts.length;

    const totalPages = Math.max(
        1,
        Math.ceil(totalItems / perPage)
    );

    const safeCurrentPage = Math.min(
        Math.max(1, currentPage),
        totalPages
    );

    const paginatedCourts = courts.slice(
        (safeCurrentPage - 1) * perPage,
        safeCurrentPage * perPage
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePerPageChange = (value) => {
        setPerPage(value);
        setCurrentPage(1);
    };

    const handleApplyFilters = () => {
        if (
            !filters.start_date ||
            !filters.end_date ||
            filters.start_date > filters.end_date
        ) {
            return;
        }

        setCurrentPage(1);
        setApplied({ ...filters });
    };

    return (
        <div className="space-y-6 p-6 lg:p-10">
            <PageHeader
                title="Court Utilization"
                description="Track bookings, maintenance downtime, and court usage."
                showButton
                buttonText="Refresh"
                buttonIcon={RefreshCw}
                buttonVariant="secondary"
                onButtonClick={() =>
                    setReload((value) => value + 1)
                }
                buttonDisabled={loading}
                buttonLoading={loading}
            />

            <FilterPanel
                title="Court Utilization Filters"
                columns={2}
                showClear={false}
                loading={loading}
                applyDisabled={
                    !filters.start_date ||
                    !filters.end_date ||
                    filters.start_date > filters.end_date
                }
                onApply={handleApplyFilters}
                filters={[
                    {
                        name: "start_date",
                        label: "Start Date",
                        type: "date",
                        value: filters.start_date,
                        onChange: (value) =>
                            setFilters((previous) => ({
                                ...previous,
                                start_date: value,
                            })),
                        required: true,
                        max: filters.end_date || undefined,
                    },
                    {
                        name: "end_date",
                        label: "End Date",
                        type: "date",
                        value: filters.end_date,
                        onChange: (value) =>
                            setFilters((previous) => ({
                                ...previous,
                                end_date: value,
                            })),
                        required: true,
                        min: filters.start_date || undefined,
                    },
                ]}
            />

            <AlertMessage
                message={error}
                type="error"
                dismissible={false}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {stats.map(({ label, value, icon: Icon }) => (
                    <div
                        key={label}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm text-slate-500">
                                {label}
                            </span>

                            <Icon
                                size={19}
                                className="text-red-700"
                            />
                        </div>

                        <div className="mt-3 text-2xl font-bold text-slate-900">
                            {loading ? "…" : value}
                        </div>
                    </div>
                ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                    <h2 className="text-lg font-bold text-slate-900">
                        Utilization by Court
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Confirmed and completed bookings only.
                        Maintenance hours are excluded from
                        available hours.
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                        <TableHeader
                            columns={[
                                {
                                    key: "court",
                                    label: "Court",
                                },
                                {
                                    key: "available",
                                    label: "Available",
                                },
                                {
                                    key: "booked",
                                    label: "Booked",
                                },
                                {
                                    key: "maintenance",
                                    label: "Maintenance",
                                },
                                {
                                    key: "bookings",
                                    label: "Bookings",
                                },
                                {
                                    key: "utilization",
                                    label: "Utilization",
                                },
                            ]}
                        />

                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <TableLoader
                                    rows={5}
                                    columns={6}
                                    variant="default"
                                />
                            ) : !paginatedCourts.length ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-12 text-center text-sm text-slate-500"
                                    >
                                        {error
                                            ? "Unable to load court utilization data."
                                            : "No courts found for this report."}
                                    </td>
                                </tr>
                            ) : (
                                paginatedCourts.map((court) => (
                                    <tr
                                        key={court.court_id}
                                        className="transition-colors hover:bg-slate-50"
                                    >
                                        <td className="px-5 py-4 font-semibold text-slate-900">
                                            {court.court_name}
                                        </td>

                                        <td className="px-5 py-4">
                                            {number(
                                                court.available_hours
                                            )}{" "}
                                            hrs
                                        </td>

                                        <td className="px-5 py-4">
                                            {number(
                                                court.booked_hours
                                            )}{" "}
                                            hrs
                                        </td>

                                        <td className="px-5 py-4">
                                            {number(
                                                court.maintenance_hours
                                            )}{" "}
                                            hrs
                                        </td>

                                        <td className="px-5 py-4">
                                            {number(
                                                court.bookings_count
                                            )}
                                        </td>

                                        <td className="min-w-44 px-5 py-4">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-semibold text-slate-900">
                                                    {number(
                                                        court.utilization_rate
                                                    )}
                                                    %
                                                </span>
                                            </div>

                                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full rounded-full bg-red-700"
                                                    style={{
                                                        width: `${Math.min(
                                                            100,
                                                            Math.max(
                                                                0,
                                                                Number(
                                                                    court.utilization_rate
                                                                ) || 0
                                                            )
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <TablePagination
                    currentPage={safeCurrentPage}
                    totalItems={totalItems}
                    perPage={perPage}
                    onPageChange={handlePageChange}
                    onPerPageChange={handlePerPageChange}
                    perPageOptions={[10, 20, 30, 40, 50]}
                    itemName="courts"
                />
            </div>
        </div>
    );
}