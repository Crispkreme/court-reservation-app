
import { useEffect, useMemo, useState } from "react";
import {
    Tags,
    Plus,
    Search,
    SlidersHorizontal,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    X,
    RefreshCw,
} from "lucide-react";

import Layout from "../../components/layout/Layout";
import SummaryCard from "../../components/SummaryCard";

import {
    getSportCategories,
    createSportCategory,
    updateSportCategory,
    deleteSportCategory,
} from "../../services/sportCategoryService";

function FilterSelect({ label, value, onChange, children }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-500">
                {label}
            </span>
            <select
                value={value}
                onChange={onChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
                {children}
            </select>
        </label>
    );
}

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

    // Load categories
    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getSportCategories({
                page: 1,
                per_page: 100,
            });

            // Supports both Laravel pagination and a plain array response.
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

    // Search and filter
    const filteredCategories = useMemo(() => {
        const query = search.trim().toLowerCase();

        return categories.filter((category) => {
            const name = String(category.name || "").toLowerCase();
            const description = String(
                category.description || ""
            ).toLowerCase();

            const categoryStatus = String(
                category.status || ""
            ).toLowerCase();

            const matchesSearch =
                name.includes(query) ||
                description.includes(query);

            const matchesStatus =
                !status || categoryStatus === status.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    }, [categories, search, status]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredCategories.length / pageSize)
    );

    const currentPage = Math.min(page, totalPages);

    const paginatedCategories = filteredCategories.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Summary counts
    const activeCount = categories.filter(
        (category) => category.status?.toLowerCase() === "active"
    ).length;

    const inactiveCount = categories.filter(
        (category) => category.status?.toLowerCase() === "inactive"
    ).length;

    // Open create modal
    const openCreateModal = () => {
        setEditingCategory(null);
        setForm(emptyForm);
        setFormError("");
        setShowModal(true);
    };

    // Open edit modal
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

    // Save category
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

    // Delete category
    const handleDelete = async (category) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${category.name}"?`
        );

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
                <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="mb-4 flex items-center gap-2">
                        <SlidersHorizontal size={17} className="text-slate-500" />
                        <h2 className="text-sm font-semibold text-slate-900">
                            Filter Sport Categories
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <label className="block xl:col-span-3">
                            <span className="mb-1.5 block text-xs font-medium text-slate-500">
                                Search
                            </span>

                            <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                                <Search
                                    size={17}
                                    className="shrink-0 text-slate-400"
                                />

                                <input
                                    type="search"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Search by sport name or description..."
                                    className="w-full min-w-0 border-0 bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400"
                                />
                            </div>
                        </label>

                        <FilterSelect
                            label="Category Status"
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">All statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </FilterSelect>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                        >
                            Clear Filters
                        </button>
                    </div>
                </section>

                {/* Categories Table */}
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div>
                            <h2 className="text-sm font-semibold text-slate-900">
                                All Sport Categories
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                View and manage your available sports.
                            </p>
                        </div>

                        <span className="text-xs text-slate-500">
                            {filteredCategories.length} categor
                            {filteredCategories.length === 1 ? "y" : "ies"} found
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center gap-2 px-5 py-16 text-sm text-slate-500">
                            <RefreshCw size={17} className="animate-spin" />
                            Loading sport categories...
                        </div>
                    ) : error ? (
                        <div className="px-5 py-12 text-center">
                            <p className="text-sm text-red-600">{error}</p>
                            <button
                                type="button"
                                onClick={fetchCategories}
                                className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px] divide-y divide-slate-200 text-left">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            {[
                                                "Sport Category",
                                                "Description",
                                                "Status",
                                                "Actions",
                                            ].map((heading) => (
                                                <th
                                                    key={heading}
                                                    className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500"
                                                >
                                                    {heading}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

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
                                                                <p className="text-sm font-semibold text-slate-800">
                                                                    {category.name}
                                                                </p>
                                                                <p className="mt-0.5 text-xs text-slate-400">
                                                                    ID: {category.id}
                                                                </p>
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

                            {/* Pagination */}
                            <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                <p className="text-xs text-slate-500">
                                    Showing{" "}
                                    {filteredCategories.length === 0
                                        ? 0
                                        : (currentPage - 1) * pageSize + 1}
                                    {" "}to{" "}
                                    {Math.min(
                                        currentPage * pageSize,
                                        filteredCategories.length
                                    )}
                                    {" "}of {filteredCategories.length} results
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={currentPage === 1}
                                        onClick={() =>
                                            setPage((p) => Math.max(1, p - 1))
                                        }
                                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <ChevronLeft size={15} />
                                        Previous
                                    </button>

                                    <span className="text-xs text-slate-500">
                                        Page {currentPage} of {totalPages}
                                    </span>

                                    <button
                                        type="button"
                                        disabled={currentPage >= totalPages}
                                        onClick={() =>
                                            setPage((p) =>
                                                Math.min(totalPages, p + 1)
                                            )
                                        }
                                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Next
                                        <ChevronRight size={15} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </section>
            </div>

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    {editingCategory
                                        ? "Edit Sport Category"
                                        : "Add Sport Category"}
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    Enter the sport category details below.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={saving}
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4 p-5">
                                {formError && (
                                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                                        {formError}
                                    </div>
                                )}

                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-medium text-slate-600">
                                        Sport Category Name
                                    </span>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                name: e.target.value,
                                            })
                                        }
                                        placeholder="e.g. Basketball"
                                        required
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-medium text-slate-600">
                                        Description
                                    </span>
                                    <textarea
                                        rows="3"
                                        value={form.description}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                description: e.target.value,
                                            })
                                        }
                                        placeholder="Enter a short description..."
                                        className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-medium text-slate-600">
                                        Status
                                    </span>
                                    <select
                                        value={form.status}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                status: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                    </select>
                                </label>
                            </div>

                            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving && (
                                        <RefreshCw size={15} className="animate-spin" />
                                    )}
                                    {saving
                                        ? "Saving..."
                                        : editingCategory
                                            ? "Update Category"
                                            : "Save Category"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}