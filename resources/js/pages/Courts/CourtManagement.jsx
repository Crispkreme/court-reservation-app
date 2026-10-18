import { useEffect, useState } from "react";
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

export default function CourtManagement() {
    const [courts, setCourts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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
            [name]: type === "checkbox" ? checked : value,
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

            setForm(initialForm);
            setEditingId(null);

            await loadData();
        } catch (err) {
            console.error(err);

            setError(err.response?.data?.message ||"Unable to save court.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (court) => {
        setEditingId(court.id);

        setForm({
            sport_category_id: court.sport_category_id,
            name: court.name,
            court_number: court.court_number || "",
            branch: court.branch,
            location: court.location || "",
            min_players: court.min_players,
            max_players: court.max_players,
            status: court.status,
            opening_time: court.opening_time?.substring(0, 5) || "08:00",
            closing_time: court.closing_time?.substring(0, 5) || "22:00",
            booking_interval: court.booking_interval,
            minimum_booking_duration: court.minimum_booking_duration,
            maximum_booking_duration: court.maximum_booking_duration,
            base_price: court.base_price,
            currency: court.currency,
            description: court.description || "",
            is_active: court.is_active,
        });
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
        setEditingId(null);
        setForm(initialForm);
    };

    return (
        <div className="p-6 space-y-6">

            <div>
                <h1 className="text-2xl font-bold">
                    Court Management
                </h1>

                <p className="text-gray-500">
                    Manage sports courts, schedules, pricing,
                    capacity and availability.
                </p>
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            <div className="rounded-xl bg-white p-6 shadow">
                <h2 className="mb-6 text-lg font-semibold">
                    {editingId
                        ? "Edit Court"
                        : "Create Court"}
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-5 md:grid-cols-2"
                >

                    {/* Sport Category */}

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Sport Category
                        </label>

                        <select
                            name="sport_category_id"
                            value={form.sport_category_id}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border p-2"
                        >
                            <option value="">
                                Select sport
                            </option>

                            {categories.map((category) => (
                                <option
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Court Name */}

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Court Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Basketball Court 1"
                            required
                            className="w-full rounded-lg border p-2"
                        />
                    </div>

                    {/* Court Number */}

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Court Number
                        </label>

                        <input
                            type="text"
                            name="court_number"
                            value={form.court_number}
                            onChange={handleChange}
                            placeholder="Court 1"
                            className="w-full rounded-lg border p-2"
                        />
                    </div>

                    {/* Branch */}

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Branch
                        </label>

                        <input
                            type="text"
                            name="branch"
                            value={form.branch}
                            onChange={handleChange}
                            placeholder="Main Branch"
                            required
                            className="w-full rounded-lg border p-2"
                        />
                    </div>

                    {/* Location */}

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Location
                        </label>

                        <input
                            type="text"
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            placeholder="2nd Floor"
                            className="w-full rounded-lg border p-2"
                        />
                    </div>

                    {/* Status */}

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Status
                        </label>

                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="w-full rounded-lg border p-2"
                        >
                            <option value="available">
                                Available
                            </option>

                            <option value="maintenance">
                                Maintenance
                            </option>

                            <option value="closed">
                                Closed
                            </option>

                            <option value="temporarily_blocked">
                                Temporarily Blocked
                            </option>
                        </select>
                    </div>

                    {/* Minimum Players */}

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Minimum Players
                        </label>

                        <input
                            type="number"
                            min="1"
                            name="min_players"
                            value={form.min_players}
                            onChange={handleChange}
                            className="w-full rounded-lg border p-2"
                        />
                    </div>

                    {/* Maximum Players */}

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Maximum Players
                        </label>

                        <input
                            type="number"
                            min="1"
                            name="max_players"
                            value={form.max_players}
                            onChange={handleChange}
                            className="w-full rounded-lg border p-2"
                        />
                    </div>

                    {/* Opening */}

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Opening Time
                        </label>

                        <input
                            type="time"
                            name="opening_time"
                            value={form.opening_time}
                            onChange={handleChange}
                            className="w-full rounded-lg border p-2"
                        />
                    </div>

                    {/* Closing */}

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Closing Time
                        </label>

                        <input
                            type="time"
                            name="closing_time"
                            value={form.closing_time}
                            onChange={handleChange}
                            className="w-full rounded-lg border p-2"
                        />
                    </div>

                    {/* Booking Interval */}

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Booking Interval (minutes)
                        </label>

                        <select
                            name="booking_interval"
                            value={form.booking_interval}
                            onChange={handleChange}
                            className="w-full rounded-lg border p-2"
                        >
                            <option value="15">15 minutes</option>
                            <option value="30">30 minutes</option>
                            <option value="60">60 minutes</option>
                        </select>
                    </div>

                    {/* Minimum Duration */}

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Minimum Booking Duration
                        </label>

                        <select
                            name="minimum_booking_duration"
                            value={form.minimum_booking_duration}
                            onChange={handleChange}
                            className="w-full rounded-lg border p-2"
                        >
                            <option value="30">30 minutes</option>
                            <option value="60">1 hour</option>
                            <option value="90">1.5 hours</option>
                        </select>
                    </div>

                    {/* Maximum Duration */}

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Maximum Booking Duration
                        </label>

                        <select
                            name="maximum_booking_duration"
                            value={form.maximum_booking_duration}
                            onChange={handleChange}
                            className="w-full rounded-lg border p-2"
                        >
                            <option value="60">1 hour</option>
                            <option value="90">1.5 hours</option>
                            <option value="120">2 hours</option>
                            <option value="180">3 hours</option>
                        </select>
                    </div>

                    {/* Base Price */}

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Base Price
                        </label>

                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            name="base_price"
                            value={form.base_price}
                            onChange={handleChange}
                            className="w-full rounded-lg border p-2"
                        />
                    </div>

                    {/* Currency */}

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Currency
                        </label>

                        <input
                            type="text"
                            name="currency"
                            maxLength="3"
                            value={form.currency}
                            onChange={handleChange}
                            className="w-full rounded-lg border p-2"
                        />
                    </div>

                    {/* Description */}

                    <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium">
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full rounded-lg border p-2"
                        />
                    </div>

                    {/* Active */}

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={form.is_active}
                            onChange={handleChange}
                        />

                        <label>
                            Active
                        </label>
                    </div>

                    {/* Buttons */}

                    <div className="flex justify-end gap-2 md:col-span-2">

                        {editingId && (
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="rounded-lg border px-4 py-2"
                            >
                                Cancel
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-black px-5 py-2 text-white"
                        >
                            {loading
                                ? "Saving..."
                                : editingId
                                    ? "Update Court"
                                    : "Create Court"}
                        </button>

                    </div>

                </form>
            </div>

            {/* Courts Table */}
            <div className="min-w-0 overflow-hidden border border-slate-200 bg-white shadow-sm rounded-sm">
                <div className="flex flex-col gap-3 border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-bold tracking-tight text-slate-900">
                            Courts
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage courts, pricing, availability, and details.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="h-2 w-2 bg-emerald-500" />
                        {courts.length} {courts.length === 1 ? "court" : "courts"} total
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 border-b border-slate-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="sm:col-span-2 xl:col-span-1">
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Search Courts
                        </label>

                        <div className="relative">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                            >
                                <circle cx="11" cy="11" r="7" />
                                <path d="m20 20-4-4" />
                            </svg>

                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Search name, sport, branch..."
                                className="w-full min-w-0 border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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
                            className="w-full min-w-0 border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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
                            className="w-full min-w-0 border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        >
                            <option value="all">All Sports</option>

                            {sportOptions.map((sport) => (
                                <option key={sport} value={sport}>
                                    {sport}
                                </option>
                            ))}
                        </select>
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
                                                className={`inline-flex items-center gap-2 whitespace-nowrap px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusClass}`}
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
                                                    className="inline-flex h-9 w-9 items-center justify-center border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
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
                                                    className="inline-flex h-9 w-9 items-center justify-center border border-red-200 bg-white text-red-500 transition hover:border-red-500 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"
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
                                                className="mt-4 border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
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
                    <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-3">
                        <p className="text-xs text-slate-500">
                            Showing{" "}
                            <span className="font-semibold text-slate-700">
                                {courts.length}
                            </span>{" "}
                            {courts.length === 1 ? "court" : "courts"}
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
}