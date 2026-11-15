
import { useEffect, useState } from "react";
import { Trophy, CircleCheck, CirclePause } from "lucide-react";

import { getSportCategories, updateSportCategory, deleteSportCategory } from "@services/sportCategoryService";

import PageHeader from "@components/common/PageHeader";
import AlertMessage from "@components/AlertMessage";
import StatCard from "@components/common/StatCard";

import TableRows from "@components/common/table/TableRows";
import TableFilter from "@components/common/table/TableFilter";
import TablePagination from "@components/common/table/TablePagination";
import TableHeader from "@components/common/table/TableHeader";
import TableEmptyState from "@components/common/table/TableEmptyState";
import TableLoader from "@components/common/table/TableLoader";

import SportCategoryModal from "./modal/SportCategoryModal";

import { sportCategoryColumns } from "@data/tableColumns/sportCategoryColumns";
import { filterData, paginate } from "@utils/pagination";

export default function SportCategoryIndex() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Load categories
    const loadCategories = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getSportCategories();
            setCategories(response.data ?? []);
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to load sport categories."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    // Filtering and pagination
    const filteredCategories = filterData(categories, {
        search,
        searchFields: ["name", "description"],
        filters: { status: statusFilter },
    });

    const {
        paginatedData: paginatedCategories,
        totalItems,
        safePage,
    } = paginate(filteredCategories, currentPage, perPage);

    // Modal controls
    const openCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (category) => {
        setEditing(category);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditing(null);
    };

    const handleModalSuccess = async (successMessage) => {
        setMessage(successMessage);
        await loadCategories();
    };

    // Toggle status
    const handleToggleStatus = async (category) => {
        const nextStatus =
            category.status === "active" ? "inactive" : "active";

        try {
            setError("");
            setMessage("");

            await updateSportCategory(category.id, {
                name: category.name,
                description: category.description || null,
                status: nextStatus,
            });

            setMessage("Category status updated successfully.");
            await loadCategories();
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to update category status."
            );
        }
    };

    // Delete category
    const handleDelete = async (category) => {
        if (!window.confirm(`Delete "${category.name}"? This cannot be undone.`)) {
            return;
        }

        try {
            setError("");
            setMessage("");

            await deleteSportCategory(category.id);

            setMessage("Sport category deleted successfully.");
            await loadCategories();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to delete sport category."
            );
        }
    };

    // Table columns
    const columns = sportCategoryColumns({
        onToggleStatus: handleToggleStatus,
        onEdit: openEdit,
        onDelete: handleDelete,
    });

    // Statistics
    const activeCount = categories.filter((category) => category.status === "active").length;

    return (
        <div className="p-6 lg:p-10">
            <PageHeader
                title="Sport Categories"
                description="Manage sports available in CourtBook."
                buttonText="Add Category"
                onButtonClick={openCreate}
                showButton
            />

            {/* Statistics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                    label="Total Categories"
                    value={categories.length}
                    icon={Trophy}
                />

                <StatCard
                    label="Active"
                    value={activeCount}
                    icon={CircleCheck}
                    iconClassName="text-green-600"
                />

                <StatCard
                    label="Inactive"
                    value={categories.length - activeCount}
                    icon={CirclePause}
                    iconClassName="text-gray-500"
                />
            </div>

            {/* Alerts */}
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

            {/* Table */}
            <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <TableFilter
                    search={search}
                    onSearchChange={(value) => {
                        setSearch(value);
                        setCurrentPage(1);
                    }}
                    searchPlaceholder="Search sport categories..."
                    status={statusFilter}
                    onStatusChange={(value) => {
                        setStatusFilter(value);
                        setCurrentPage(1);
                    }}
                />

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <TableHeader columns={columns} />

                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <TableLoader
                                    rows={5}
                                    columns={columns.length}
                                    variant="categories"
                                />
                            ) : paginatedCategories.length === 0 ? (
                                <TableEmptyState
                                    colSpan={columns.length}
                                    icon={Trophy}
                                    title="No sport categories found."
                                    description="Try adjusting your search or status filter."
                                />
                            ) : (
                                <TableRows
                                    data={paginatedCategories}
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
                    itemName="categories"
                />
            </div>

            {/* Create / Edit Modal */}
            <SportCategoryModal
                isOpen={modalOpen}
                category={editing}
                onClose={closeModal}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
}