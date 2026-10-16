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
            minimum_booking_duration:
                court.minimum_booking_duration,
            maximum_booking_duration:
                court.maximum_booking_duration,
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

            setError(
                err.response?.data?.message ||
                "Unable to delete court."
            );
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

            <div className="overflow-hidden rounded-xl bg-white shadow">

                <div className="border-b p-5">
                    <h2 className="font-semibold">
                        Courts
                    </h2>
                </div>

                <div className="overflow-x-auto">

                    <table className="w-full">

                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 text-left">
                                    Court
                                </th>

                                <th className="p-3 text-left">
                                    Sport
                                </th>

                                <th className="p-3 text-left">
                                    Branch
                                </th>

                                <th className="p-3 text-left">
                                    Capacity
                                </th>

                                <th className="p-3 text-left">
                                    Hours
                                </th>

                                <th className="p-3 text-left">
                                    Price
                                </th>

                                <th className="p-3 text-left">
                                    Status
                                </th>

                                <th className="p-3 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>

                            {courts.map((court) => (
                                <tr
                                    key={court.id}
                                    className="border-t"
                                >

                                    <td className="p-3">
                                        <div className="font-medium">
                                            {court.name}
                                        </div>

                                        {court.court_number && (
                                            <div className="text-sm text-gray-500">
                                                {court.court_number}
                                            </div>
                                        )}
                                    </td>

                                    <td className="p-3">
                                        {court.sport_category?.name}
                                    </td>

                                    <td className="p-3">
                                        {court.branch}
                                    </td>

                                    <td className="p-3">
                                        {court.min_players}
                                        {" - "}
                                        {court.max_players}
                                        {" players"}
                                    </td>

                                    <td className="p-3">
                                        {court.opening_time?.substring(0, 5)}
                                        {" - "}
                                        {court.closing_time?.substring(0, 5)}
                                    </td>

                                    <td className="p-3">
                                        {court.currency}{" "}
                                        {Number(
                                            court.base_price
                                        ).toFixed(2)}
                                    </td>

                                    <td className="p-3">
                                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs capitalize">
                                            {court.status.replace(
                                                "_",
                                                " "
                                            )}
                                        </span>
                                    </td>

                                    <td className="p-3">

                                        <div className="flex justify-end gap-2">

                                            <button
                                                onClick={() =>
                                                    handleEdit(court)
                                                }
                                                className="rounded border px-3 py-1 text-sm"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleDelete(court.id)
                                                }
                                                className="rounded border border-red-300 px-3 py-1 text-sm text-red-600"
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </td>

                                </tr>
                            ))}

                            {courts.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="p-10 text-center text-gray-500"
                                    >
                                        No courts found.
                                    </td>
                                </tr>
                            )}

                        </tbody>

                    </table>

                </div>
            </div>

        </div>
    );
}