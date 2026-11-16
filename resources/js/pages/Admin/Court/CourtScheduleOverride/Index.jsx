import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, Plus, CalendarDays, CalendarCheck, CalendarX, Building2, RefreshCw } from "lucide-react";

import PageHeader from "@components/common/PageHeader";
import AlertMessage from "@components/AlertMessage";

import StatCard from "@components/common/StatCard";
import FormInput from "@components/common/FormInput";
import FormSelect from "@components/common/FormSelect";

import TableHeader from "@components/common/table/TableHeader";
import TableLoader from "@components/common/table/TableLoader";
import TableRows from "@components/common/table/TableRows";
import TableEmptyState from "@components/common/table/TableEmptyState";
import TablePagination from "@components/common/table/TablePagination";

import { getCourts } from "@services/courtService";
import { getScheduleOverrides } from "@services/courtScheduleOverrideService";

import { courtScheduleOverrideColumns } from "@data/tableColumns/courtScheduleOverrideColumns";

import ScheduleOverrideModal from "./modal/ScheduleOverrideModal";
import DeleteScheduleOverrideModal from "./modal/DeleteScheduleOverrideModal";

const extractData = (response) => {
    const payload = response?.data ?? response;

    return Array.isArray(payload)
        ? payload
        : payload?.data ?? [];
};

const getError = (error) => {
    const errors = error.response?.data?.errors;

    if (errors) {
        return Object.values(errors).flat().join(" ");
    }

    return error.response?.data?.message || "Something went wrong.";
};

export default function CourtScheduleOverrideIndex() {
    const [overrides, setOverrides] = useState([]);
    const [courts, setCourts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [courtFilter, setCourtFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const [overrideResponse, courtResponse] = await Promise.all([
                getScheduleOverrides(),
                getCourts(),
            ]);

            setOverrides(extractData(overrideResponse));
            setCourts(extractData(courtResponse));
        } catch (err) {
            setError(getError(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredOverrides = useMemo(() => {
        const query = search.trim().toLowerCase();

        return overrides.filter((item) => {
            const courtName = item.court?.name || "";

            const matchesSearch =
                courtName.toLowerCase().includes(query) ||
                (item.notes || "").toLowerCase().includes(query);

            const matchesCourt =
                !courtFilter ||
                String(item.court_id) === String(courtFilter);

            const matchesStatus =
                !statusFilter || item.status === statusFilter;

            const matchesDate =
                !dateFilter ||
                String(item.date).slice(0, 10) === dateFilter;

            return (
                matchesSearch &&
                matchesCourt &&
                matchesStatus &&
                matchesDate
            );
        });
    }, [overrides, search, courtFilter, statusFilter, dateFilter]);

    const stats = useMemo(
        () => ({
            total: overrides.length,
            open: overrides.filter((item) => item.status === "open").length,
            closed: overrides.filter((item) => item.status === "closed").length,
            courts: new Set(overrides.map((item) => item.court_id)).size,
        }),
        [overrides]
    );

    const totalPages = Math.max(
        1,
        Math.ceil(filteredOverrides.length / perPage)
    );

    const safeCurrentPage = Math.min(currentPage, totalPages);

    const paginatedOverrides = useMemo(() => {
        const start = (safeCurrentPage - 1) * perPage;

        return filteredOverrides.slice(start, start + perPage);
    }, [filteredOverrides, safeCurrentPage, perPage]);

    const openCreate = () => {
        setEditing(null);
        setError("");
        setSuccess("");
        setModalOpen(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        setError("");
        setSuccess("");
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditing(null);
    };

    const handleModalSuccess = (message) => {
        setSuccess(
            typeof message === "string" && message
                ? message
                : "Schedule override saved successfully."
        );

        setError("");
        loadData();
    };

    const openDelete = (item) => {
        setError("");
        setSuccess("");
        setDeleteTarget(item);
    };

    const handleDeleteSuccess = () => {
        setDeleteTarget(null);
        setSuccess("Schedule override deleted successfully.");
        loadData();
    };

    const columns = courtScheduleOverrideColumns({
        onEdit: openEdit,
        onDelete: openDelete,
    });

    return (
        <div className="space-y-6 p-6 lg:p-10">
            <PageHeader
                title="Schedule Overrides"
                description="Manage date-specific court operating hours and closures."
                showButton
                buttonText="Add Override"
                buttonIcon={Plus}
                onButtonClick={openCreate}
            />

            <AlertMessage
                type="error"
                message={error}
                onClose={() => setError("")}
            />

            <AlertMessage
                type="success"
                message={success}
                onClose={() => setSuccess("")}
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                    {
                        label: "Total Overrides",
                        value: stats.total,
                        icon: CalendarDays,
                    },
                    {
                        label: "Open Overrides",
                        value: stats.open,
                        icon: CalendarCheck,
                    },
                    {
                        label: "Closed Overrides",
                        value: stats.closed,
                        icon: CalendarX,
                    },
                    {
                        label: "Affected Courts",
                        value: stats.courts,
                        icon: Building2,
                    },
                ].map((item) => (
                    <StatCard
                        key={item.label}
                        label={item.label}
                        value={loading ? "—" : item.value}
                        icon={item.icon}
                    />
                ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5">
                    <div>
                        <h2 className="font-semibold text-slate-900">
                            Date Overrides
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {filteredOverrides.length} overrides found
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={loadData}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={16}
                            className={loading ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>
                </div>

                <div className="grid gap-3 border-b border-slate-200 p-5 md:grid-cols-2 xl:grid-cols-4">
                    <FormInput
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Search overrides..."
                    />

                    <FormSelect
                        value={courtFilter}
                        onChange={(e) => {
                            setCourtFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        options={[
                            { value: "", label: "All Courts" },
                            ...courts.map((court) => ({
                                value: String(court.id),
                                label: court.name,
                            })),
                        ]}
                    />

                    <FormSelect
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        options={[
                            { value: "", label: "All Statuses" },
                            { value: "open", label: "Open" },
                            { value: "closed", label: "Closed" },
                        ]}
                    />

                    <FormInput
                        type="date"
                        value={dateFilter}
                        onChange={(e) => {
                            setDateFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[950px] text-left text-sm">
                        <TableHeader columns={columns} />

                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <TableLoader
                                    rows={5}
                                    columns={columns.length}
                                    variant="default"
                                />
                            ) : filteredOverrides.length === 0 ? (
                                <TableEmptyState
                                    colSpan={columns.length}
                                    icon={CalendarClock}
                                    title="No Schedule Overrides Found"
                                    description="No records match your current filters."
                                />
                            ) : (
                                <TableRows
                                    data={paginatedOverrides}
                                    columns={columns}
                                    rowKey="id"
                                />
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && (
                    <TablePagination
                        currentPage={safeCurrentPage}
                        totalItems={filteredOverrides.length}
                        perPage={perPage}
                        onPageChange={setCurrentPage}
                        onPerPageChange={(value) => {
                            setPerPage(value);
                            setCurrentPage(1);
                        }}
                        itemName="overrides"
                    />
                )}
            </div>

            <ScheduleOverrideModal
                open={modalOpen}
                schedule={editing}
                courts={courts}
                onClose={closeModal}
                onSuccess={handleModalSuccess}
            />

            <DeleteScheduleOverrideModal
                open={Boolean(deleteTarget)}
                schedule={deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onSuccess={handleDeleteSuccess}
            />
        </div>
    );
}
