
import { useCallback, useEffect, useState } from "react";
import { LayoutGrid, CircleCheck, Wrench } from "lucide-react";

import { getCourts, deleteCourt } from "@services/courtService";

import PageHeader from "@components/common/PageHeader";
import AlertMessage from "@components/AlertMessage";
import StatCard from "@components/common/StatCard";

import TableRows from "@components/common/table/TableRows";
import TableFilter from "@components/common/table/TableFilter";
import TablePagination from "@components/common/table/TablePagination";
import TableHeader from "@components/common/table/TableHeader";
import TableEmptyState from "@components/common/table/TableEmptyState";
import TableLoader from "@components/common/table/TableLoader";

import CourtModal from "./modal/CourtModal";
import { courtColumns } from "@data/tableColumns/courtColumns";
import { filterData, paginate } from "@utils/pagination";
import { getCurrentUaeTime } from "@utils";

const statusOptions = [
    {
        label: "All Statuses",
        value: "",
    },
    {
        label: "Available",
        value: "available",
    },
    {
        label: "Maintenance",
        value: "maintenance",
    },
    {
        label: "Closed",
        value: "closed",
    },
    {
        label: "Temporarily Blocked",
        value: "temporarily_blocked",
    },
];

export default function CourtIndex() {

    const [courts, setCourts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [currentTime, setCurrentTime] = useState(getCurrentUaeTime);

    const loadCourts = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getCourts();
            setCourts(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load courts.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCourts();
    }, [loadCourts]);

    useEffect(() => {
        const updateTime = () => {
            setCurrentTime(getCurrentUaeTime());
        };

        updateTime();

        const interval = setInterval(updateTime, 30000);
        return () => clearInterval(interval);
    }, []);

    const filteredCourts = filterData(courts, {
        search,
        searchFields: ["name", "location", "court_type"],
        filters: {
            status: statusFilter,
        },
    });

    const { paginatedData: paginatedCourts, totalItems, safePage } = paginate(filteredCourts, currentPage, perPage);
    const openCreate = () => {
        setError("");
        setMessage("");
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (court) => {
        setError("");
        setMessage("");
        setEditing(court);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditing(null);
    };

    const handleModalSuccess = async (successMessage) => {
        await loadCourts();
        setMessage(successMessage ||"Court saved successfully.");
    };

    const handleDelete = async (court) => {
        const confirmed = window.confirm(
            `Delete "${court.name}"? This cannot be undone.`
        );

        if (!confirmed) return;

        try {
            setError("");
            setMessage("");

            await deleteCourt(court.id);
            await loadCourts();

            setMessage("Court deleted successfully.");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete court."
            );
        }
    };

    const columns = courtColumns({
        onEdit: openEdit,
        onDelete: handleDelete,
        currentTime,
    });

    const totalCount = courts.length;
    const availableCount = courts.filter((court) => court.status === "available").length;
    const maintenanceCount = courts.filter((court) => court.status === "maintenance").length;

    return (
        <div className="p-6 lg:p-10">

            <PageHeader
                title="Courts"
                description="Manage courts, booking configurations, pricing, and operating hours."
                buttonText="Add Court"
                onButtonClick={openCreate}
                showButton
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                    label="Total Courts"
                    value={totalCount}
                    icon={LayoutGrid}
                />

                <StatCard
                    label="Available Courts"
                    value={availableCount}
                    icon={CircleCheck}
                    iconClassName="text-green-600"
                />

                <StatCard
                    label="Maintenance"
                    value={maintenanceCount}
                    icon={Wrench}
                    iconClassName="text-amber-600"
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
                    searchPlaceholder="Search courts..."
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
                            ) : paginatedCourts.length === 0 ? (
                                <TableEmptyState
                                    colSpan={columns.length}
                                    icon={LayoutGrid}
                                    title="No courts found."
                                    description="Add a court or adjust your filters."
                                />
                            ) : (
                                <TableRows
                                    data={paginatedCourts}
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
                    itemName="courts"
                />
            </div>

            <CourtModal
                isOpen={modalOpen}
                court={editing}
                onClose={closeModal}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
}
