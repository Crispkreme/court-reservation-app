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
import StatusBadge from "../../components/StatusBadge";
import FilterSelect from "../../components/FilterSelect";
import ParticipantModal from "../../components/modal/ParticipantModal";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import ErrorAlert from "../../components/ErrorAlert";
import SuccessAlert from "../../components/SuccessAlert";
import { readErrorMessage } from "../../utils/formatters";
import { PLAYER_TYPES, SKILL_LEVELS } from "../../enums/enum";
import { getParticipants, createParticipant, updateParticipant } from "../../services/playerService";

const API = "/api/v1";
const emptyForm = {
    member_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    player_type: PLAYER_TYPES.RECREATIONAL,
    is_active: true,
    skill_level: SKILL_LEVELS.BEGINNER,
    location: "",
    availability: "",
};

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

    async function loadParticipants() {
        setLoading(true);
        setError("");

        try {
            const result = await getParticipants();
            setParticipants(result.data ?? []);
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Unable to load participants.");
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
            player_type: participant.player_type ?? PLAYER_TYPES.RECREATIONAL,
            is_active: Boolean(participant.is_active),
            skill_level: participant.skill_level ?? SKILL_LEVELS.BEGINNER,
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

        if (saving) return;

        setSaving(true);
        setError("");
        setSuccess("");
        setFormErrors({});

        const payload = {
            ...form,
            member_id: form.member_id || null,
            is_active: Boolean(form.is_active),
        };

        console.log('payload: ', payload)

        try {
            const result = editingParticipant
                ? await updateParticipant(editingParticipant.id, payload)
                : await createParticipant(payload);

            setSuccess(
                result.message ||
                    (editingParticipant
                        ? "Participant updated successfully."
                        : "Participant created successfully.")
            );

            setModalOpen(false);
            setEditingParticipant(null);
            setForm(emptyForm);
            setFormErrors({});

            await loadParticipants();

        } catch (err) {
            const validationErrors = err.response?.data?.errors;

            if (validationErrors) {
                setFormErrors(validationErrors);
            } else {
                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Unable to save participant."
                );
            }
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

    const inputClass = "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
    const labelClass = "block text-sm font-medium text-slate-700";

    return (
        <Layout title="Participants">
            <div className="mx-auto w-full max-w-[1800px] space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <UsersRound size={24} />
                        </div>
                        <div>
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

                <ErrorAlert message={error} />

                <SuccessAlert message={success} />

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
                        <LoadingState message="Loading participants..." />
                    ) : filteredParticipants.length === 0 ? (
                        <EmptyState
                            icon={UsersRound}
                            title="No participants found"
                            description="Try changing your filters or add a participant."
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        {["Participant", "Contact", "Player Type", "Skill Level", "Location", "Status", "Actions"].map((heading) => (
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
                                                <StatusBadge active={Boolean(participant.is_active)} />
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
            </div>

            <ParticipantModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                saving={saving}
                editingParticipant={editingParticipant}
                form={form}
                formErrors={formErrors}
                onSubmit={saveParticipant}
                updateField={updateField}
                fieldError={fieldError}
            />

        </Layout>
    );
}
