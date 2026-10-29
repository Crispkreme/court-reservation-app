import { useEffect, useMemo, useState } from "react";
import {
    UsersRound,
    UserPlus,
    Search,
    RefreshCw,
    Pencil,
    Trash2,
    X,
    CheckCircle2,
    AlertCircle,
    UserRound,
    Mail,
    Phone,
    MapPin,
    SlidersHorizontal,
} from "lucide-react";
import Layout from "../../components/layout/Layout";

const API = "/api/v1";

const emptyForm = {
    member_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    player_type: "RECREATIONAL",
    is_active: true,
    skill_level: "BEGINNER",
    location: "",
    availability: "",
};

const PLAYER_TYPES = [
    "RECREATIONAL",
    "COMPETITIVE",
    "PROFESSIONAL",
];

const SKILL_LEVELS = [
    "BEGINNER",
    "INTERMEDIATE",
    "ADVANCED",
    "EXPERT",
];

function readErrorMessage(data, fallback) {
    if (data?.errors) {
        const firstError = Object.values(data.errors).flat()[0];
        if (firstError) return firstError;
    }

    return data?.message || fallback;
}

function ParticipantStatus({ active }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                active
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
            }`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${
                    active ? "bg-emerald-500" : "bg-slate-400"
                }`}
            />
            {active ? "Active" : "Inactive"}
        </span>
    );
}

export default function BookingParticipants() {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingParticipant, setEditingParticipant] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [formErrors, setFormErrors] = useState({});

    async function requestJson(url, options = {}) {
        const response = await fetch(url, {
            ...options,
            headers: {
                Accept: "application/json",
                ...(options.body ? { "Content-Type": "application/json" } : {}),
                ...options.headers,
            },
            credentials: "include",
        });

        const contentType = response.headers.get("content-type") || "";
        const rawBody = await response.text();
        let result = {};

        if (rawBody && contentType.includes("application/json")) {
            try {
                result = JSON.parse(rawBody);
            } catch {
                throw new Error("The server returned invalid JSON.");
            }
        } else if (!response.ok) {
            const error = new Error(
                `The server returned an unexpected response (${response.status}). Check the API route and authentication.`
            );
            throw error;
        } else if (rawBody) {
            throw new Error(
                "The API returned HTML instead of JSON. Check the API route and Laravel response."
            );
        }

        if (!response.ok) {
            const error = new Error(readErrorMessage(result, "The request failed."));
            error.validationErrors = result.errors || null;
            throw error;
        }

        return result;
    }

    async function loadParticipants() {
        setLoading(true);
        setError("");

        try {
            const result = await requestJson(`${API}/participants`);
            const records = result.data?.data ?? result.data ?? [];
            setParticipants(Array.isArray(records) ? records : []);
        } catch (err) {
            setError(err.message || "Unable to load participants.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadParticipants();
    }, []);

    const filteredParticipants = useMemo(() => {
        const term = search.trim().toLowerCase();

        return participants.filter((participant) => {
            const fullName = `${participant.first_name ?? ""} ${participant.last_name ?? ""}`.trim().toLowerCase();
            const matchesSearch =
                !term ||
                fullName.includes(term) ||
                String(participant.member_id ?? "").toLowerCase().includes(term) ||
                String(participant.email ?? "").toLowerCase().includes(term) ||
                String(participant.phone ?? "").toLowerCase().includes(term) ||
                String(participant.location ?? "").toLowerCase().includes(term);

            const active = Boolean(participant.is_active);
            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && active) ||
                (statusFilter === "inactive" && !active);

            return matchesSearch && matchesStatus;
        });
    }, [participants, search, statusFilter]);

    const stats = useMemo(
        () => ({
            total: participants.length,
            active: participants.filter((item) => Boolean(item.is_active)).length,
            inactive: participants.filter((item) => !item.is_active).length,
        }),
        [participants]
    );

    function openCreateModal() {
        setEditingParticipant(null);
        setForm(emptyForm);
        setFormErrors({});
        setError("");
        setSuccess("");
        setModalOpen(true);
    }

    function openEditModal(participant) {
        setEditingParticipant(participant);
        setForm({
            member_id: participant.member_id ?? "",
            first_name: participant.first_name ?? "",
            last_name: participant.last_name ?? "",
            email: participant.email ?? "",
            phone: participant.phone ?? "",
            player_type: participant.player_type ?? "RECREATIONAL",
            is_active: Boolean(participant.is_active),
            skill_level: participant.skill_level ?? "BEGINNER",
            location: participant.location ?? "",
            availability: participant.availability ?? "",
        });
        setFormErrors({});
        setError("");
        setSuccess("");
        setModalOpen(true);
    }

    function updateField(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    async function saveParticipant(event) {
        event.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        setFormErrors({});

        const url = editingParticipant
            ? `${API}/participants/${editingParticipant.id}`
            : `${API}/participants`;

        try {
            const result = await requestJson(url, {
                method: editingParticipant ? "PUT" : "POST",
                body: JSON.stringify({
                    ...form,
                    member_id: form.member_id || null,
                    is_active: Boolean(form.is_active),
                }),
            });

            setSuccess(
                result.message ||
                    (editingParticipant
                        ? "Participant updated successfully."
                        : "Participant created successfully.")
            );
            setModalOpen(false);
            setEditingParticipant(null);
            setForm(emptyForm);
            await loadParticipants();
        } catch (err) {
            setError(err.message || "Unable to save participant.");
            if (err.validationErrors) setFormErrors(err.validationErrors);
        } finally {
            setSaving(false);
        }
    }

    async function deleteParticipant(participant) {
        const confirmed = window.confirm(
            `Delete ${participant.first_name} ${participant.last_name}? This action cannot be undone.`
        );

        if (!confirmed) return;

        setDeletingId(participant.id);
        setError("");
        setSuccess("");

        try {
            const result = await requestJson(
                `${API}/participants/${participant.id}`,
                { method: "DELETE" }
            );
            setSuccess(result.message || "Participant deleted successfully.");
            await loadParticipants();
        } catch (err) {
            setError(err.message || "Unable to delete participant.");
        } finally {
            setDeletingId(null);
        }
    }

    function fieldError(field) {
        return formErrors[field]?.[0] || "";
    }

    const inputClass =
        "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
    const labelClass = "block text-sm font-medium text-slate-700";

    return (
        <Layout title="Participants">
            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <UsersRound size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                                Booking Management
                            </p>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                                Participants
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Manage player profiles, membership links, and availability.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={loadParticipants}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                            Refresh
                        </button>
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <UserPlus size={17} />
                            Add Participant
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                        <span>{success}</span>
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">Total Participants</p>
                            <UsersRound size={19} className="text-blue-600" />
                        </div>
                        <p className="mt-3 text-3xl font-bold text-slate-900">{stats.total}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">Active</p>
                            <CheckCircle2 size={19} className="text-emerald-600" />
                        </div>
                        <p className="mt-3 text-3xl font-bold text-emerald-600">{stats.active}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">Inactive</p>
                            <UserRound size={19} className="text-slate-400" />
                        </div>
                        <p className="mt-3 text-3xl font-bold text-slate-600">{stats.inactive}</p>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-end">
                        <div>
                            <label className={labelClass}>Search Participants</label>
                            <div className="relative mt-1.5">
                                <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Name, email, phone, member ID..."
                                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Status</label>
                            <select
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                                className={inputClass}
                            >
                                <option value="all">All Participants</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setSearch("");
                                setStatusFilter("all");
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            <SlidersHorizontal size={16} />
                            Clear Filters
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Participant Directory</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                {filteredParticipants.length} participant{filteredParticipants.length === 1 ? "" : "s"} shown
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-10 text-center text-sm text-slate-500">
                            <RefreshCw size={22} className="mx-auto mb-3 animate-spin text-blue-600" />
                            Loading participants...
                        </div>
                    ) : filteredParticipants.length === 0 ? (
                        <div className="p-10 text-center">
                            <UsersRound size={28} className="mx-auto mb-3 text-slate-300" />
                            <p className="font-medium text-slate-800">No participants found</p>
                            <p className="mt-1 text-sm text-slate-500">
                                Try changing your filters or add a participant.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        {["Participant", "Member ID", "Contact", "Player Type", "Skill Level", "Location", "Status", "Actions"].map((heading) => (
                                            <th key={heading} className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredParticipants.map((participant) => (
                                        <tr key={participant.id} className="transition hover:bg-slate-50/70">
                                            <td className="whitespace-nowrap px-5 py-4">
                                                <div className="font-semibold text-slate-900">
                                                    {participant.first_name} {participant.last_name}
                                                </div>
                                                <div className="mt-0.5 text-xs text-slate-500">{participant.availability || "Availability not set"}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                                {participant.member_id ?? "—"}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <Mail size={14} className="shrink-0 text-slate-400" />
                                                    <span>{participant.email || "—"}</span>
                                                </div>
                                                <div className="mt-1 flex items-center gap-2 text-slate-500">
                                                    <Phone size={14} className="shrink-0 text-slate-400" />
                                                    <span>{participant.phone || "—"}</span>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                                {participant.player_type || "—"}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                                {participant.skill_level || "—"}
                                            </td>
                                            <td className="px-5 py-4 text-slate-600">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <MapPin size={14} className="shrink-0 text-slate-400" />
                                                    {participant.location || "—"}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4">
                                                <ParticipantStatus active={Boolean(participant.is_active)} />
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(participant)}
                                                        title="Edit participant"
                                                        aria-label={`Edit ${participant.first_name} ${participant.last_name}`}
                                                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteParticipant(participant)}
                                                        disabled={deletingId === participant.id}
                                                        title="Delete participant"
                                                        aria-label={`Delete ${participant.first_name} ${participant.last_name}`}
                                                        className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {modalOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget && !saving) setModalOpen(false);
                        }}
                    >
                        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
                            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        {editingParticipant ? "Edit Participant" : "Add Participant"}
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Enter the participant's profile and player details.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => !saving && setModalOpen(false)}
                                    disabled={saving}
                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                                    aria-label="Close form"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={saveParticipant} className="space-y-6 p-6">
                                {Object.keys(formErrors).length > 0 && (
                                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                        Please correct the highlighted fields and try again.
                                    </div>
                                )}

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className={labelClass}>First Name *</label>
                                        <input
                                            value={form.first_name}
                                            onChange={(event) => updateField("first_name", event.target.value)}
                                            className={inputClass}
                                            autoComplete="given-name"
                                            required
                                        />
                                        {fieldError("first_name") && <p className="mt-1 text-xs text-red-600">{fieldError("first_name")}</p>}
                                    </div>
                                    <div>
                                        <label className={labelClass}>Last Name *</label>
                                        <input
                                            value={form.last_name}
                                            onChange={(event) => updateField("last_name", event.target.value)}
                                            className={inputClass}
                                            autoComplete="family-name"
                                            required
                                        />
                                        {fieldError("last_name") && <p className="mt-1 text-xs text-red-600">{fieldError("last_name")}</p>}
                                    </div>
                                    <div>
                                        <label className={labelClass}>Member ID</label>
                                        <input
                                            value={form.member_id}
                                            onChange={(event) => updateField("member_id", event.target.value)}
                                            className={inputClass}
                                            placeholder="Optional member ID"
                                        />
                                        {fieldError("member_id") && <p className="mt-1 text-xs text-red-600">{fieldError("member_id")}</p>}
                                    </div>
                                    <div>
                                        <label className={labelClass}>Email *</label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(event) => updateField("email", event.target.value)}
                                            className={inputClass}
                                            autoComplete="email"
                                            required
                                        />
                                        {fieldError("email") && <p className="mt-1 text-xs text-red-600">{fieldError("email")}</p>}
                                    </div>
                                    <div>
                                        <label className={labelClass}>Phone</label>
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={(event) => updateField("phone", event.target.value)}
                                            className={inputClass}
                                            autoComplete="tel"
                                        />
                                        {fieldError("phone") && <p className="mt-1 text-xs text-red-600">{fieldError("phone")}</p>}
                                    </div>
                                    <div>
                                        <label className={labelClass}>Player Type</label>
                                        <select
                                            value={form.player_type}
                                            onChange={(event) => updateField("player_type", event.target.value)}
                                            className={inputClass}
                                        >
                                            {PLAYER_TYPES.map((type) => <option key={type} value={type}>{type.charAt(0) + type.slice(1).toLowerCase()}</option>)}
                                        </select>
                                        {fieldError("player_type") && <p className="mt-1 text-xs text-red-600">{fieldError("player_type")}</p>}
                                    </div>
                                    <div>
                                        <label className={labelClass}>Skill Level</label>
                                        <select
                                            value={form.skill_level}
                                            onChange={(event) => updateField("skill_level", event.target.value)}
                                            className={inputClass}
                                        >
                                            {SKILL_LEVELS.map((level) => <option key={level} value={level}>{level.charAt(0) + level.slice(1).toLowerCase()}</option>)}
                                        </select>
                                        {fieldError("skill_level") && <p className="mt-1 text-xs text-red-600">{fieldError("skill_level")}</p>}
                                    </div>
                                    <div>
                                        <label className={labelClass}>Location</label>
                                        <input
                                            value={form.location}
                                            onChange={(event) => updateField("location", event.target.value)}
                                            className={inputClass}
                                            placeholder="City or area"
                                        />
                                        {fieldError("location") && <p className="mt-1 text-xs text-red-600">{fieldError("location")}</p>}
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>Availability</label>
                                        <textarea
                                            value={form.availability}
                                            onChange={(event) => updateField("availability", event.target.value)}
                                            className={inputClass}
                                            rows={3}
                                            placeholder="e.g. Weekdays after 6 PM, weekends"
                                        />
                                        {fieldError("availability") && <p className="mt-1 text-xs text-red-600">{fieldError("availability")}</p>}
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="inline-flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={form.is_active}
                                                onChange={(event) => updateField("is_active", event.target.checked)}
                                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span>
                                                <span className="block text-sm font-medium text-slate-800">Active participant</span>
                                                <span className="block text-xs text-slate-500">Inactive participants remain in the directory but are marked unavailable.</span>
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        disabled={saving}
                                        className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {saving ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                        {saving ? "Saving..." : editingParticipant ? "Update Participant" : "Create Participant"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
