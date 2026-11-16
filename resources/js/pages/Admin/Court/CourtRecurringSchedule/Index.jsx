import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, Pencil, Trash2, Plus, Loader2, Search, RefreshCw } from "lucide-react";
import PageHeader from "@components/common/PageHeader";
import AlertMessage from "@components/AlertMessage";
import { getRecurringSchedules, deleteRecurringSchedule } from "@services/courtRecurringScheduleService";
import { getCourts } from "@services/courtService";
import RecurringScheduleModal from "./modal/RecurringScheduleModal";

const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

const formatDate = (date) => {
    if (!date) return "Ongoing";
    const [year, month, day] = String(date).slice(0, 10).split("-");
    return `${day}/${month}/${year}`;
};

const formatTime = (time) => {
    if (!time) return "—";
    return String(time).slice(0, 5);
};

const extractData = (response) => {
    const payload = response?.data ?? response;
    return Array.isArray(payload) ? payload : payload?.data ?? [];
};

const getError = (error) => {
    const errors = error.response?.data?.errors;

    if (errors) {
        return Object.values(errors).flat().join(" ");
    }

    return error.response?.data?.message || "Something went wrong.";
};

export default function CourtRecurringScheduleIndex() {
    const [schedules, setSchedules] = useState([]);
    const [courts, setCourts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [search, setSearch] = useState("");
    const [courtFilter, setCourtFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);

        try {
            const [scheduleResponse, courtResponse] = await Promise.all([
                getRecurringSchedules(),
                getCourts(),
            ]);

            setSchedules(extractData(scheduleResponse));
            setCourts(extractData(courtResponse));
        } catch (err) {
            setError(getError(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredSchedules = useMemo(() => {
        return schedules.filter((schedule) => {
            const courtName = schedule.court?.name ?? "";

            const matchesSearch =
                courtName.toLowerCase().includes(search.toLowerCase()) ||
                (schedule.notes ?? "")
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchesCourt =
                !courtFilter ||
                String(schedule.court_id) === String(courtFilter);

            const matchesStatus =
                !statusFilter || schedule.status === statusFilter;

            return matchesSearch && matchesCourt && matchesStatus;
        });
    }, [schedules, search, courtFilter, statusFilter]);

    const stats = useMemo(
        () => ({
            total: schedules.length,
            active: schedules.filter((item) => item.is_active).length,
            open: schedules.filter((item) => item.status === "open").length,
            closed: schedules.filter((item) => item.status === "closed").length,
        }),
        [schedules]
    );

    const openCreate = () => {
        setEditing(null);
        setError("");
        setSuccess("");
        setModalOpen(true);
    };

    const openEdit = (schedule) => {
        setEditing(schedule);
        setError("");
        setSuccess("");
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditing(null);
    };

    const handleModalSuccess = (message) => {
        setSuccess(message);
        setError("");
        loadData();
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        setDeleting(true);
        setError("");

        try {
            await deleteRecurringSchedule(deleteTarget.id);

            setDeleteTarget(null);
            setSuccess("Recurring schedule deleted successfully.");

            await loadData();
        } catch (err) {
            setError(getError(err));
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6 p-6 lg:p-10">
            <PageHeader
                title="Recurring Court Schedules"
                description="Manage repeating operating hours and weekly court availability."
                showButton
                buttonText="Add Schedule"
                buttonIcon={Plus}
                onButtonClick={openCreate}
            />

            <AlertMessage
                type="error"
                message={error}
                onClose={() => setError("")}
            />

            <AlertMessage
                type="success"
                message={success}
                onClose={() => setSuccess("")}
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                    { label: "Total Schedules", value: stats.total },
                    { label: "Active Rules", value: stats.active },
                    { label: "Open Rules", value: stats.open },
                    { label: "Closed Rules", value: stats.closed },
                ].map((item) => (
                    <div
                        key={item.label}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <p className="text-sm text-slate-500">
                            {item.label}
                        </p>

                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {loading ? "—" : item.value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5">
                    <div>
                        <h2 className="font-semibold text-slate-900">
                            Schedule Rules
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {filteredSchedules.length} recurring schedules
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={loadData}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={16}
                            className={loading ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>
                </div>

                <div className="grid gap-3 border-b border-slate-200 p-5 md:grid-cols-3">
                    <div className="relative">
                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search schedules..."
                            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-red-500"
                        />
                    </div>

                    <select
                        value={courtFilter}
                        onChange={(e) => setCourtFilter(e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500"
                    >
                        <option value="">All Courts</option>

                        {courts.map((court) => (
                            <option key={court.id} value={court.id}>
                                {court.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[950px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                                {[
                                    "Court",
                                    "Day",
                                    "Operating Hours",
                                    "Effective Period",
                                    "Status",
                                    "Active",
                                    "Actions",
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        className="px-5 py-4 font-semibold"
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-5 py-12 text-center text-slate-500"
                                    >
                                        <Loader2
                                            size={24}
                                            className="mx-auto mb-2 animate-spin"
                                        />
                                        Loading schedules...
                                    </td>
                                </tr>
                            ) : filteredSchedules.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-5 py-12 text-center text-slate-500"
                                    >
                                        <CalendarClock
                                            size={32}
                                            className="mx-auto mb-3 text-slate-300"
                                        />
                                        No recurring schedules found.
                                    </td>
                                </tr>
                            ) : (
                                filteredSchedules.map((schedule) => (
                                    <tr
                                        key={schedule.id}
                                        className="hover:bg-slate-50"
                                    >
                                        <td className="px-5 py-4 font-medium text-slate-900">
                                            {schedule.court?.name ??
                                                `Court ${schedule.court_id}`}
                                        </td>

                                        <td className="px-5 py-4 text-slate-700">
                                            {weekdays[
                                                Number(schedule.day_of_week)
                                            ] ?? "—"}
                                        </td>

                                        <td className="px-5 py-4 text-slate-600">
                                            {schedule.status === "closed"
                                                ? "Closed"
                                                : `${formatTime(
                                                      schedule.opening_time
                                                  )} - ${formatTime(
                                                      schedule.closing_time
                                                  )}`}
                                        </td>

                                        <td className="px-5 py-4 text-slate-600">
                                            {formatDate(
                                                schedule.effective_from
                                            )}
                                            {" - "}
                                            {formatDate(
                                                schedule.effective_until
                                            )}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                    schedule.status === "open"
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-red-50 text-red-700"
                                                }`}
                                            >
                                                {schedule.status === "open"
                                                    ? "Open"
                                                    : "Closed"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                    schedule.is_active
                                                        ? "bg-blue-50 text-blue-700"
                                                        : "bg-slate-100 text-slate-500"
                                                }`}
                                            >
                                                {schedule.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEdit(schedule)
                                                    }
                                                    className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                                                    title="Edit"
                                                >
                                                    <Pencil size={17} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setError("");
                                                        setDeleteTarget(
                                                            schedule
                                                        );
                                                    }}
                                                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={17} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <RecurringScheduleModal
                open={modalOpen}
                schedule={editing}
                courts={courts}
                onClose={closeModal}
                onSuccess={handleModalSuccess}
            />

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="text-lg font-bold text-slate-900">
                            Delete Recurring Schedule?
                        </h2>

                        <p className="mt-3 text-sm text-slate-600">
                            This will permanently remove the recurring rule
                            for{" "}
                            <strong>
                                {deleteTarget.court?.name ??
                                    `Court ${deleteTarget.court_id}`}
                            </strong>.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleting}
                                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                            >
                                {deleting && (
                                    <Loader2
                                        size={16}
                                        className="animate-spin"
                                    />
                                )}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
