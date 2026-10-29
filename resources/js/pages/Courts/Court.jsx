import { useEffect, useState } from "react";
import CourtModal from "../../components/modal/CourtModal";
import PageHeader from "../../components/PageHeader";
import Layout from "../../components/layout/Layout";
import { Search, Plus, ChevronLeft, ChevronRight, Trophy, Users, Activity } from "lucide-react";
import {
    getCourts,
    getSportCategories,
    createCourt,
    updateCourt,
    deleteCourt,
} from "../../services/courtService";

const initialForm = {
    sport_category_id: "",
    name: "",
    court_number: "",
    branch: "",
    location: "",
    min_players: 1,
    max_players: 10,
    status: "available",
    opening_time: "08:00",
    closing_time: "22:00",
    booking_interval: 30,
    minimum_booking_duration: 30,
    maximum_booking_duration: 120,
    base_price: 0,
    currency: "PHP",
    description: "",
    is_active: true,
};

export default function Court() {
    const [courts, setCourts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sportFilter, setSportFilter] = useState("all");
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const sportOptions = [
        ...new Set(
            courts
                .map((court) => court.sport_category?.name)
                .filter(Boolean)
        ),
    ];

    const statusOptions = [
        ...new Set(
            courts
                .map((court) => court.status)
                .filter(Boolean)
        ),
    ];

    const filteredCourts = courts.filter((court) => {
        const search = searchTerm.toLowerCase().trim();

        const matchesSearch = [
            court.name,
            court.court_number,
            court.sport_category?.name,
            court.branch,
        ].some((value) =>
            String(value ?? "").toLowerCase().includes(search)
        );

        const matchesStatus =
            statusFilter === "all" ||
            court.status === statusFilter;

        const matchesSport =
            sportFilter === "all" ||
            court.sport_category?.name === sportFilter;

        return matchesSearch && matchesStatus && matchesSport;
    });

    const totalPages = Math.max(1, Math.ceil(filteredCourts.length / perPage));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * perPage;
    const paginatedCourts = filteredCourts.slice(startIndex, startIndex + perPage);
    const startEntry = filteredCourts.length === 0 ? 0 : startIndex + 1;
    const endEntry = Math.min(startIndex + perPage,filteredCourts.length);

    useEffect(() => {
        loadData();
    }, []);
    
    const loadData = async () => {
        try {
            setLoading(true);

            const [
                courtsResponse,
                categoriesResponse,
            ] = await Promise.all([
                getCourts(),
                getSportCategories(),
            ]);

            setCourts(courtsResponse.data.data);
            setCategories(categoriesResponse.data.data);
        } catch (err) {
            console.error(err);
            setError("Unable to load court management data.");
        } finally {
            setLoading(false);
        }
    };
    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]:
                type === "checkbox"
                    ? checked
                    : type === "number"
                    ? Number(value)
                    : value,
        }));
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        try {
            setLoading(true);

            if (editingId) {
                await updateCourt(editingId, form);
            } else {
                await createCourt(form);
            }

            setIsModalOpen(false);
            setEditingId(null);
            setForm({ ...initialForm });

            await loadData();
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to save court."
            );
        } finally {
            setLoading(false);
        }
    };
    const handleEdit = (court) => {
        setEditingId(court.id);

        setForm({
            sport_category_id: court.sport_category_id ?? court.sport_category?.id ?? "",
            name: court.name ?? "",
            court_number: court.court_number ?? "",
            branch: court.branch ?? "",
            location: court.location ?? "",
            min_players: court.min_players ?? 1,
            max_players: court.max_players ?? 10,
            status: court.status ?? "available",
            opening_time: court.opening_time?.substring(0, 5) || "08:00",
            closing_time: court.closing_time?.substring(0, 5) || "22:00",
            booking_interval: court.booking_interval ?? 30,
            minimum_booking_duration: court.minimum_booking_duration ?? 30,
            maximum_booking_duration: court.maximum_booking_duration ?? 120,
            base_price: court.base_price ?? 0,
            currency: court.currency ?? "PHP",
            description: court.description ?? "",
            is_active: court.is_active ?? true,
        });

        setError("");
        setIsModalOpen(true);
    };
    const handleCreate = () => {
        setEditingId(null);
        setForm({ ...initialForm });
        setError("");
        setIsModalOpen(true);
    };
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this court?")) {
            return;
        }

        try {
            await deleteCourt(id);

            await loadData();
        } catch (err) {
            console.error(err);

            setError(err.response?.data?.message ||"Unable to delete court.");
        }
    };
    const cancelEdit = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setForm({ ...initialForm });
        setError("");
    };

    return (
        <Layout>
            <div className="mx-auto w-full max-w-[1800px] space-y-6">
                {error && (
                    <div className="rounded-lg bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                )}

                <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Trophy size={24} />
                    </div>
                    <div>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                            Court
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage court details, sports categories, availability, and court status.
                        </p>
                    </div>
                </div>

                <CourtModal
                    isOpen={isModalOpen}
                    editingId={editingId}
                    form={form}
                    categories={categories}
                    loading={loading}
                    error={error}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onClose={cancelEdit}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">Total Courts</p>
                            <span className="rounded-lg bg-blue-50 p-2 text-blue-700"><Trophy className="h-5 w-5" /></span>
                        </div>
                        <p className="mt-3 text-2xl font-bold text-slate-900">{courts.length}</p>
                        <p className="mt-1 text-xs text-slate-500">Registered courts</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">Available</p>
                            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700"><Activity className="h-5 w-5" /></span>
                        </div>
                        <p className="mt-3 text-2xl font-bold text-slate-900">{courts.filter((court) => ["available", "active"].includes(String(court.status || "").toLowerCase())).length}</p>
                        <p className="mt-1 text-xs text-slate-500">Ready for booking</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">Maintenance</p>
                            <span className="rounded-lg bg-amber-50 p-2 text-amber-700"><Activity className="h-5 w-5" /></span>
                        </div>
                        <p className="mt-3 text-2xl font-bold text-slate-900">{courts.filter((court) => String(court.status || "").toLowerCase() === "maintenance").length}</p>
                        <p className="mt-1 text-xs text-slate-500">Courts needing attention</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">Sport Categories</p>
                            <span className="rounded-lg bg-indigo-50 p-2 text-indigo-700"><Users className="h-5 w-5" /></span>
                        </div>
                        <p className="mt-3 text-2xl font-bold text-slate-900">{categories.length}</p>
                        <p className="mt-1 text-xs text-slate-500">Available sport types</p>
                    </div>
                </div>

                <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <PageHeader
                        title="Court Management"
                        description="Manage sports courts, schedules, pricing, capacity and availability."
                        count={courts.length}
                        countLabel="courts total"
                    />

                    <div className="grid grid-cols-1 gap-4 border-b border-slate-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="sm:col-span-2 xl:col-span-1">
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Search Courts
                            </label>

                            <div className="relative">
    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Search name, sport, branch..."
                                    className="w-full min-w-0 rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Status
                            </label>

                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="all">All Statuses</option>

                                {statusOptions.map((status) => (
                                    <option key={status} value={status}>
                                        {status.replace(/_/g, " ")}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Sport Category
                            </label>

                            <select
                                value={sportFilter}
                                onChange={(e) => {
                                    setSportFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="all">All Sports</option>

                                {sportOptions.map((sport) => (
                                    <option key={sport} value={sport}>
                                        {sport}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={handleCreate}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 sm:w-auto xl:w-full"
                            >
    <Plus className="h-4 w-4" />
                                Add Court
                            </button>
                        </div>
                    </div>

                    <div className="w-full overflow-x-auto">
                        <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="whitespace-nowrap px-5 py-4 font-semibold">
                                        Court
                                    </th>
                                    <th className="whitespace-nowrap px-5 py-4 font-semibold">
                                        Sport
                                    </th>
                                    <th className="whitespace-nowrap px-5 py-4 font-semibold">
                                        Branch
                                    </th>
                                    <th className="whitespace-nowrap px-5 py-4 font-semibold">
                                        Capacity
                                    </th>
                                    <th className="whitespace-nowrap px-5 py-4 font-semibold">
                                        Operating Hours
                                    </th>
                                    <th className="whitespace-nowrap px-5 py-4 font-semibold">
                                        Price
                                    </th>
                                    <th className="whitespace-nowrap px-5 py-4 font-semibold">
                                        Status
                                    </th>
                                    <th className="whitespace-nowrap px-5 py-4 text-right font-semibold">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {paginatedCourts.map((court) => {
                                    const status = (court.status || "unknown").replace(/_/g, " ");
                                    const statusClass = {
                                        active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
                                        available: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
                                        inactive: "bg-slate-100 text-slate-600 ring-slate-500/20",
                                        maintenance: "bg-amber-50 text-amber-700 ring-amber-600/20",
                                        unavailable: "bg-red-50 text-red-700 ring-red-600/20",
                                    }[court.status] || "bg-slate-100 text-slate-600 ring-slate-500/20";

                                    return (
                                        <tr
                                            key={court.id}
                                            className="transition-colors hover:bg-slate-50/80"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-slate-800">
                                                    {court.name}
                                                </div>

                                                {court.court_number && (
                                                    <div className="mt-1 text-xs text-slate-500">
                                                        Court No. {court.court_number}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-slate-600">
                                                {court.sport_category?.name || "-"}
                                            </td>
                                            <td className="px-5 py-4 text-slate-600">
                                                {court.branch || "-"}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                                {court.min_players}–{court.max_players}
                                                <span className="ml-1 text-xs text-slate-400">
                                                    players
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                                {court.opening_time?.substring(0, 5) || "--:--"}
                                                <span className="mx-1 text-slate-400">–</span>
                                                {court.closing_time?.substring(0, 5) || "--:--"}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4">
                                                <span className="font-semibold text-slate-800">
                                                    {court.currency}{" "}
                                                    {Number(court.base_price).toLocaleString(
                                                        "en-PH",
                                                        {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        }
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusClass}`}
                                                >
                                                    <span className="h-1.5 w-1.5 bg-current" />
                                                    {status}
                                                </span>
                                            </td>
                                            
                                            {/* Actions */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-2">

                                                    {/* Edit Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEdit(court)}
                                                        title="Edit court"
                                                        aria-label={`Edit ${court.name}`}
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="1.8"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            className="h-4 w-4"
                                                        >
                                                            <path d="M12 20h9" />
                                                            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
                                                        </svg>
                                                    </button>

                                                    {/* Delete Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(court.id)}
                                                        title="Delete court"
                                                        aria-label={`Delete ${court.name}`}
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-500 transition hover:border-red-500 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="1.8"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            className="h-4 w-4"
                                                        >
                                                            <path d="M3 6h18" />
                                                            <path d="M8 6V4h8v2" />
                                                            <path d="m19 6-1 14H6L5 6" />
                                                            <path d="M10 11v5" />
                                                            <path d="M14 11v5" />
                                                        </svg>
                                                    </button>

                                                </div>
                                            </td>

                                        </tr>
                                    );
                                })}
                                
                                {filteredCourts.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-16 text-center">
                                            <p className="font-semibold text-slate-800">
                                                {courts.length === 0
                                                    ? "No courts available"
                                                    : "No matching courts found"}
                                            </p>

                                            <p className="mt-1 text-sm text-slate-500">
                                                {courts.length === 0
                                                    ? "Courts will appear here once they are added."
                                                    : "Try changing your search or filters."}
                                            </p>

                                            {courts.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSearchTerm("");
                                                        setStatusFilter("all");
                                                        setSportFilter("all");
                                                        setCurrentPage(1);
                                                    }}
                                                    className="mt-4 rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                                                >
                                                    Clear Filters
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    {courts.length > 0 && (
                        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                <span>
                                    Showing <span className="font-semibold text-slate-700">{startEntry}–{endEntry}</span> of{" "}
                                    <span className="font-semibold text-slate-700">{filteredCourts.length}</span> courts
                                </span>
                                <label className="flex items-center gap-2">
                                    Rows
                                    <select
                                        value={perPage}
                                        onChange={(event) => {
                                            setPerPage(Number(event.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </label>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                    disabled={safePage <= 1}
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Previous
                                </button>
                                <span className="text-xs font-medium text-slate-600">Page {safePage} of {totalPages}</span>
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                    disabled={safePage >= totalPages}
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </Layout>
    );
}