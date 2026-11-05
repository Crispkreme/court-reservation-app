import { useEffect, useState } from "react";
import CourtModal from "../../components/modal/CourtModal";
import PageHeader from "../../components/PageHeader";
import FilterPanel from "../../components/FilterPanel";
import BadgeCard from "../../components/BadgeCard";
import Header from "../../components/Header";
import TableHead from "../../components/TableHead";
import Layout from "../../components/layout/Layout";
import TablePagination from "../../components/TablePagination";
import { Trophy, Users, Activity } from "lucide-react";
import ErrorAlert from '../../components/ErrorAlert';
import SuccessAlert from "../../components/SuccessAlert";
import { getCourts, getSportCategories, createCourt, updateCourt, deleteCourt } from "../../services/courtService";
import { getGeneralStatusClass } from "../../enums/enum";

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
    const [success, setSuccess] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sportFilter, setSportFilter] = useState("all");
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const availableCourts = courts.filter((court) =>["available", "active"].includes(String(court.status || "").toLowerCase())).length;
    const maintenanceCourts = courts.filter((court) => String(court.status || "").toLowerCase() === "maintenance").length;

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
        const query = search.toLowerCase().trim();

        const matchesSearch = [
            court.name,
            court.court_number,
            court.sport_category?.name,
            court.branch,
        ].some((value) =>
            String(value ?? "").toLowerCase().includes(query)
        );

        const matchesStatus = statusFilter === "all" || court.status?.toLowerCase() === statusFilter.toLowerCase();
        const matchesSport = sportFilter === "all" || court.sport_category?.name === sportFilter;
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
            setError(err.response?.data?.message || "Unable to save court.");
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
                
                <ErrorAlert message={error} />
                <SuccessAlert message={success} />

                <CourtModal isOpen={isModalOpen} editingId={editingId} form={form} categories={categories} loading={loading} error={error} onChange={handleChange} onSubmit={handleSubmit} onClose={cancelEdit} success={success}/>

                <Header title="Court" description="Manage court details, sports categories, availability, and court status." icon={Trophy}/>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-2 xl:grid-cols-4">
                    <BadgeCard title="Total Courts" value={courts.length} description="Registered courts" icon={Trophy} colorIndex={0}/>
                    <BadgeCard title="Available" value={availableCourts} description="Ready for booking" icon={Activity} colorIndex={1}/>
                    <BadgeCard title="Maintenance" value={maintenanceCourts} description="Courts needing attention" icon={Activity} colorIndex={2}/>
                    <BadgeCard title="Sport Categories" value={categories.length} description="Available sport types" icon={Users} colorIndex={3}/>
                </div>

                <FilterPanel
                    title="Filter Courts"
                    search={search}
                    setSearch={(value) => {
                        setSearch(value);
                        setCurrentPage(1);
                    }}
                    searchPlaceholder="Search by court name, sport, or branch..."
                    status={statusFilter}
                    setStatus={(value) => {
                        setStatusFilter(value);
                        setCurrentPage(1);
                    }}
                    statusLabel="Court Status"
                    statusOptions={[
                        { value: "all", label: "All statuses" },
                        ...statusOptions.map((status) => ({
                            value: status,
                            label: status.charAt(0).toUpperCase() + status.slice(1),
                        })),
                    ]}
                    onReset={() => {
                        setSearch("");
                        setStatusFilter("all");
                        setSportFilter("all");
                        setCurrentPage(1);
                    }}
                />

                <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                    <PageHeader
                        title="Court Management"
                        description="Manage sports courts, schedules, pricing, capacity and availability."
                        count={courts.length}
                        countLabel="courts total"
                    />

                    <div className="w-full overflow-x-auto">
                        <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
                            <TableHead
                                columns={[
                                    "Court",
                                    "Sport",
                                    "Branch",
                                    "Capacity",
                                    "Operating Hours",
                                    "Price",
                                    "Status",
                                    { label: "Actions", align: "right" },
                                ]}
                            />

                            <tbody className="divide-y divide-slate-100">
                                {paginatedCourts.map((court) => {

                                    const status = court.status || "UNKNOWN";
                                    const formattedStatus = status
                                        .replaceAll("_", " ")
                                        .toLowerCase()
                                        .replace(/\b\w/g, (char) => char.toUpperCase());
                                    const statusClass = getGeneralStatusClass(status);

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
                                                    {formattedStatus}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-2">
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
                                                {courts.length === 0 ? "No courts available" : "No matching courts found"}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {courts.length === 0 ? "Courts will appear here once they are added." : "Try changing your search or filters."}
                                            </p>

                                            {courts.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSearch("");
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

                    <TablePagination
                        currentPage={safePage}
                        setPage={setCurrentPage}
                        totalItems={filteredCourts.length}
                        pageSize={perPage}
                    />
                </div>
            </div>
        </Layout>
    );
}