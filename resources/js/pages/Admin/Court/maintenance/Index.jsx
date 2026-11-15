import { useCallback, useEffect, useState } from "react";
import { CalendarClock, Clock3, Wrench, CircleCheck } from "lucide-react";

import { getMaintenancePeriods, deleteMaintenancePeriod, createMaintenancePeriod, updateMaintenancePeriod } from "@services/courtMaintenanceService";
import { getCourts } from "@services/courtService";

import PageHeader from "@components/common/PageHeader";
import AlertMessage from "@components/AlertMessage";
import StatCard from "@components/common/StatCard";

import TableRows from "@components/common/table/TableRows";
import TableFilter from "@components/common/table/TableFilter";
import TablePagination from "@components/common/table/TablePagination";
import TableHeader from "@components/common/table/TableHeader";
import TableEmptyState from "@components/common/table/TableEmptyState";
import TableLoader from "@components/common/table/TableLoader";

import MaintenanceModal from "./modal/MaintenanceModal";

import { maintenanceColumns, getMaintenanceStatus } from "@data/tableColumns/maintenanceColumns";
import { filterData, paginate } from "@utils/pagination";

const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "Upcoming", value: "upcoming" },
    { label: "In Progress", value: "active" },
    { label: "Completed", value: "completed" },
];

export default function CourtMaintenanceIndex() {
    const [periods, setPeriods] = useState([]);
    const [courts, setCourts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [currentTime, setCurrentTime] = useState(Date.now);

    const loadMaintenance = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const [maintenanceResponse, courtResponse] = await Promise.all([
                getMaintenancePeriods(),
                getCourts(),
            ]);

            setPeriods(
                Array.isArray(maintenanceResponse.data)
                    ? maintenanceResponse.data
                    : []
            );

            setCourts(
                Array.isArray(courtResponse.data)
                    ? courtResponse.data
                    : []
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load maintenance periods."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMaintenance();
    }, [loadMaintenance]);

    useEffect(() => {
        const updateTime = () => {
            setCurrentTime(Date.now());
        };

        updateTime();

        const interval = setInterval(updateTime, 30000);

        return () => clearInterval(interval);
    }, []);

    const periodsWithStatus = periods.map((period) => ({
        ...period,
        maintenance_status: getMaintenanceStatus(
            period,
            currentTime
        ).key,
        court_name: period.court?.name ?? "",
    }));

    const filteredPeriods = filterData(periodsWithStatus, {
        search,
        searchFields: ["court_name", "reason"],
        filters: {
            maintenance_status: statusFilter,
        },
    });

    const {
        paginatedData: paginatedPeriods,
        totalItems,
        safePage,
    } = paginate(filteredPeriods, currentPage, perPage);

    const openCreate = () => {
        setError("");
        setMessage("");
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (period) => {
        setError("");
        setMessage("");
        setEditing(period);
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;

        setModalOpen(false);
        setEditing(null);
    };

    const handleSave = async (data) => {
        try {
            setSaving(true);
            setError("");
            setMessage("");

            let successMessage;

            if (editing?.id) {
                await updateMaintenancePeriod(editing.id, data);
                successMessage = "Maintenance period updated successfully.";
            } else {
                await createMaintenancePeriod(data);
                successMessage = "Maintenance period created successfully.";
            }

            await loadMaintenance();

            setModalOpen(false);
            setEditing(null);
            setMessage(successMessage);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save maintenance period."
            );

            throw err;
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (period) => {
        const confirmed = window.confirm(
            `Delete maintenance for "${period.court?.name ?? "this court"}"? This cannot be undone.`
        );

        if (!confirmed) return;

        try {
            setError("");
            setMessage("");

            await deleteMaintenancePeriod(period.id);
            await loadMaintenance();

            setMessage("Maintenance period deleted successfully.");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete maintenance period."
            );
        }
    };

    const totalCount = periods.length;

    const upcomingCount = periodsWithStatus.filter(
        (period) => period.maintenance_status === "upcoming"
    ).length;

    const activeCount = periodsWithStatus.filter(
        (period) => period.maintenance_status === "active"
    ).length;

    const completedCount = periodsWithStatus.filter(
        (period) => period.maintenance_status === "completed"
    ).length;

    const columns = maintenanceColumns({
        onEdit: openEdit,
        onDelete: handleDelete,
        currentTime,
    });

    return (
        <div className="p-6 lg:p-10">
            <PageHeader
                title="Court Maintenance"
                description="Manage scheduled maintenance periods and court availability."
                buttonText="Schedule Maintenance"
                onButtonClick={openCreate}
                showButton
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Total Periods"
                    value={totalCount}
                    icon={CalendarClock}
                />

                <StatCard
                    label="Upcoming"
                    value={upcomingCount}
                    icon={Clock3}
                    iconClassName="text-blue-600"
                />

                <StatCard
                    label="In Progress"
                    value={activeCount}
                    icon={Wrench}
                    iconClassName="text-amber-600"
                />

                <StatCard
                    label="Completed"
                    value={completedCount}
                    icon={CircleCheck}
                    iconClassName="text-green-600"
                />
            </div>

            <AlertMessage
                type="success"
                message={message}
                onClose={() => setMessage("")}
                className="mt-5"
            />

            <AlertMessage
                type="error"
                message={error}
                onClose={() => setError("")}
                className="mt-5"
            />

            <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <TableFilter
                    search={search}
                    onSearchChange={(value) => {
                        setSearch(value);
                        setCurrentPage(1);
                    }}
                    searchPlaceholder="Search maintenance..."
                    status={statusFilter}
                    onStatusChange={(value) => {
                        setStatusFilter(value);
                        setCurrentPage(1);
                    }}
                    statusOptions={statusOptions}
                />

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <TableHeader columns={columns} />

                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <TableLoader
                                    rows={5}
                                    columns={columns.length}
                                />
                            ) : paginatedPeriods.length === 0 ? (
                                <TableEmptyState
                                    colSpan={columns.length}
                                    icon={CalendarClock}
                                    title="No maintenance periods found."
                                    description="Schedule maintenance or adjust your filters."
                                />
                            ) : (
                                <TableRows
                                    data={paginatedPeriods}
                                    columns={columns}
                                />
                            )}
                        </tbody>
                    </table>
                </div>

                <TablePagination
                    currentPage={safePage}
                    totalItems={totalItems}
                    perPage={perPage}
                    onPageChange={setCurrentPage}
                    onPerPageChange={(value) => {
                        setPerPage(value);
                        setCurrentPage(1);
                    }}
                    itemName="maintenance periods"
                />
            </div>

            <MaintenanceModal
                isOpen={modalOpen}
                maintenance={editing}
                courts={courts}
                onClose={closeModal}
                onSave={handleSave}
                saving={saving}
            />
        </div>
    );
}
