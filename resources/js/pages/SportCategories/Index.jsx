
import { useEffect, useMemo, useState } from "react";
import { Tags, Plus, Search, SlidersHorizontal, Pencil, Trash2, ChevronLeft, ChevronRight, X, RefreshCw } from "lucide-react";
import Layout from "../../components/layout/Layout";
import SummaryCard from "../../components/SummaryCard";
import LoadingState from "../../components/LoadingState";
import TableHeader from "../../components/TableHeader";
import TablePagination from "../../components/TablePagination";
import EmptyState from "../../components/EmptyState";
import TableHead from "../../components/TableHead";
import SportCategoryModal from "../../components/modal/SportCategoryModal";
import FilterPanel from "../../components/FilterPanel";

import {
    getSportCategories,
    createSportCategory,
    updateSportCategory,
    deleteSportCategory,
} from "../../services/sportCategoryService";

const emptyForm = {
    name: "",
    description: "",
    status: "ACTIVE",
};

export default function SportCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const pageSize = 5;
    const filteredCategories = useMemo(() => {
        const query = search.trim().toLowerCase();

        return categories.filter((category) => {
            const name = String(category.name || "").toLowerCase();
            const description = String(category.description || "").toLowerCase();
            const categoryStatus = String(category.status || "").toLowerCase();
            const matchesSearch = name.includes(query) || description.includes(query);
            const matchesStatus = !status || categoryStatus === status.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    }, [categories, search, status]);
    const paginatedCategories = filteredCategories.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    const openCreateModal = () => {
        setEditingCategory(null);
        setForm(emptyForm);
        setFormError("");
        setShowModal(true);
    };
    const openEditModal = (category) => {
        setEditingCategory(category);
        setForm({
            name: category.name || "",
            description: category.description || "",
            status: category.status?.toUpperCase() || "ACTIVE",
        });
        setFormError("");
        setShowModal(true);
    };
    const closeModal = () => {
        if (saving) return;
        setShowModal(false);
        setEditingCategory(null);
        setForm(emptyForm);
        setFormError("");
    };

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getSportCategories({
                page: 1,
                per_page: 100,
            });

            const records = Array.isArray(response)
                ? response
                : response?.data || [];

            setCategories(records);
        } catch (err) {
            console.error("Failed to load sport categories:", err);
            setError(
                err.response?.data?.message ||
                "Failed to load sport categories."
            );
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name.trim()) {
            setFormError("Please enter a sport category name.");
            return;
        }

        try {
            setSaving(true);
            setFormError("");

            const payload = {
                name: form.name.trim(),
                description: form.description.trim(),
                status: form.status,
            };

            if (editingCategory) {
                await updateSportCategory(editingCategory.id, payload);
            } else {
                await createSportCategory(payload);
            }

            closeModal();
            await fetchCategories();
        } catch (err) {
            console.error("Failed to save category:", err);

            setFormError(
                err.response?.data?.message ||
                "Unable to save the sport category. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };
    const handleDelete = async (category) => {
        const confirmed = window.confirm(`Are you sure you want to delete "${category.name}"?`);

        if (!confirmed) return;

        try {
            await deleteSportCategory(category.id);
            await fetchCategories();
        } catch (err) {
            console.error("Failed to delete category:", err);
            alert(
                err.response?.data?.message ||
                "Unable to delete this sport category."
            );
        }
    };
    const resetFilters = () => {
        setSearch("");
        setStatus("");
        setPage(1);
    };

    return (
        <Layout title="Sport Categories">
            <div className="mx-auto w-full max-w-[1800px] space-y-6">

                {/* Page Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Tags size={24} />
                        </div>

                        <div>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                                Sport Categories
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Manage the sports available for court reservations.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <Plus size={17} />
                        Add Sport Category
                    </button>
                </div>

                {/* Search and Filters */}
                <FilterPanel
                    title="Filter Sport Categories"
                    search={search}
                    setSearch={(value) => {
                        setSearch(value);
                        setPage(1);
                    }}
                    searchPlaceholder="Search by sport name or description..."
                    searchLabel="Search"
                    status={status}
                    setStatus={(value) => {
                        setStatus(value);
                        setPage(1);
                    }}
                    statusLabel="Category Status"
                    statusOptions={[
                        { value: "", label: "All statuses" },
                        { value: "active", label: "Active" },
                        { value: "inactive", label: "Inactive" },
                    ]}
                    onReset={() => {
                        setSearch("");
                        setStatus("");
                        setPage(1);
                    }}
                />

                {/* Categories Table */}
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        
                    <TableHeader
                        title="All Sport Categories"
                        description="View and manage your available sports."
                        count={filteredCategories.length}
                        countLabel="Categories"
                    />

                    {loading ? (
                        <LoadingState message="Loading booking rules..." />
                    ) : categories.length === 0 ? (
                        <EmptyState
                            icon={ShieldCheck}
                            title="No booking rules found"
                            description="Create your first booking rule to configure booking limits and restrictions."
                        />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px] divide-y divide-slate-200 text-left">
                                    <TableHead
                                        columns={[
                                            "Sport Category",
                                            "Description",
                                            "Status",
                                            { label: "Actions", align: "right" },
                                        ]}
                                    />
                                    <tbody className="divide-y divide-slate-100">
                                        {paginatedCategories.length > 0 ? (
                                            paginatedCategories.map((category) => (
                                                <tr
                                                    key={category.id}
                                                    className="transition hover:bg-slate-50/80"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                                                <Tags size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-800">{category.name}</p>
                                                                <p className="mt-0.5 text-xs text-slate-400">ID: {category.id}</p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-slate-600">
                                                        {category.description || "—"}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                                category.is_active
                                                                    ? "bg-emerald-50 text-emerald-700"
                                                                    : "bg-slate-100 text-slate-600"
                                                            }`}
                                                        >
                                                            <span
                                                                className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                                                                    category.is_active
                                                                        ? "bg-emerald-500"
                                                                        : "bg-slate-400"
                                                                }`}
                                                            />
                                                            {category.is_active ? "Active" : "Inactive"}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditModal(category)}
                                                                title="Edit category"
                                                                className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                                                            >
                                                                <Pencil size={16} />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(category)}
                                                                title="Delete category"
                                                                className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="4"
                                                    className="px-5 py-14 text-center"
                                                >
                                                    <Tags
                                                        size={30}
                                                        className="mx-auto mb-3 text-slate-300"
                                                    />
                                                    <p className="text-sm font-medium text-slate-600">
                                                        No sport categories found
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-400">
                                                        Try changing your search or add a new category.
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <TablePagination
                                currentPage={page}
                                setPage={setPage}
                                totalItems={filteredCategories.length}
                                pageSize={pageSize}
                            />
                        </>
                    )}

                </section>
            </div>
            
            <SportCategoryModal
                isOpen={showModal}
                onClose={closeModal}
                editingCategory={editingCategory}
                form={form}
                setForm={setForm}
                handleSubmit={handleSubmit}
                formError={formError}
                saving={saving}
            />
        </Layout>
    );
}