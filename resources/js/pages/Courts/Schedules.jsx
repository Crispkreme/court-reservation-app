import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { CalendarDays, Plus, Search, Pencil, Trash2, Clock3, CheckCircle2, Wrench, CalendarCheck, X } from 'lucide-react';

const DAYS = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
];

const STATUSES = [
    'available',
    'blocked',
    'maintenance',
    'closed',
];

export default function Schedules() {
    const [schedules, setSchedules] = useState([]);
    const [courts, setCourts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [selectedCourt, setSelectedCourt] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [error, setError] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);

    const [form, setForm] = useState({
        court_id: '',
        day_of_week: 1,
        start_time: '08:00',
        end_time: '22:00',
        status: 'available',
        start_date: '',
        end_date: '',
        is_active: true,
        notes: '',
    });

    useEffect(() => {
        fetchCourts();
        fetchSchedules();
    }, []);

    const fetchCourts = async () => {
        try {
            const response = await fetch('/api/v1/courts', {
                headers: {
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to load courts');
            }

            const data = await response.json();

            setCourts(data.data ?? data);
        } catch (error) {
            console.error(error);
            setError('Unable to load courts. Please refresh and try again.');
        }
    };

    const fetchSchedules = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();

            if (selectedCourt) {
                params.append('court_id', selectedCourt);
            }

            if (selectedStatus) {
                params.append('status', selectedStatus);
            }

            const url = `/api/v1/court-schedules${
                params.toString() ? `?${params}` : ''
            }`;

            const response = await fetch(url, {
                headers: {
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to load schedules');
            }

            const data = await response.json();

            setSchedules(data.data ?? data);
        } catch (error) {
            console.error(error);
            setError('Unable to load court schedules. Please refresh and try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, [selectedCourt, selectedStatus]);

    const resetForm = () => {
        setForm({
            court_id: courts[0]?.id ?? '',
            day_of_week: 1,
            start_time: '08:00',
            end_time: '22:00',
            status: 'available',
            start_date: '',
            end_date: '',
            is_active: true,
            notes: '',
        });
    };

    const openCreateModal = () => {
        setEditingSchedule(null);
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (schedule) => {
        setEditingSchedule(schedule);

        setForm({
            court_id: schedule.court_id ?? '',
            day_of_week: schedule.day_of_week,
            start_time: schedule.start_time?.substring(0, 5) ?? '08:00',
            end_time: schedule.end_time?.substring(0, 5) ?? '22:00',
            status: schedule.status ?? 'available',
            start_date: schedule.start_date ?? '',
            end_date: schedule.end_date ?? '',
            is_active: Boolean(schedule.is_active),
            notes: schedule.notes ?? '',
        });

        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const saveSchedule = async (e) => {
        e.preventDefault();

        setSaving(true);
        setError('');

        try {
            const url = editingSchedule
                ? `/api/v1/court-schedules/${editingSchedule.id}`
                : '/api/v1/court-schedules';

            const method = editingSchedule ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ?? 'Failed to save schedule'
                );
            }

            setShowModal(false);
            fetchSchedules();
        } catch (error) {
            setError(error.message || 'Unable to save schedule.');
        } finally {
            setSaving(false);
        }
    };

    const deleteSchedule = async (id) => {
        if (!confirm('Delete this court schedule?')) {
            return;
        }

        try {
            const response = await fetch(
                `/api/v1/court-schedules/${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Accept: 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete schedule');
            }

            fetchSchedules();
        } catch (error) {
            setError(error.message || 'Unable to delete schedule.');
        }
    };

    const getCourtName = (courtId) => {
        const court = courts.find(
            (item) => Number(item.id) === Number(courtId)
        );

        return court?.name ?? `Court #${courtId}`;
    };

    const getDayName = (day) => {
        return (
            DAYS.find(
                (item) => Number(item.value) === Number(day)
            )?.label ?? '-'
        );
    };

    const statusClasses = {
        available: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        blocked: 'bg-red-50 text-red-700 ring-red-600/20',
        maintenance: 'bg-amber-50 text-amber-700 ring-amber-600/20',
        closed: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    };

    const filteredSchedules = schedules.filter((schedule) => {
        const query = searchTerm.trim().toLowerCase();
        return [getCourtName(schedule.court_id), getDayName(schedule.day_of_week), schedule.status, schedule.notes]
            .some((value) => String(value ?? '').toLowerCase().includes(query));
    });
    const totalPages = Math.max(1, Math.ceil(filteredSchedules.length / perPage));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * perPage;
    const paginatedSchedules = filteredSchedules.slice(startIndex, startIndex + perPage);
    const startEntry = filteredSchedules.length ? startIndex + 1 : 0;
    const endEntry = Math.min(startIndex + perPage, filteredSchedules.length);
    const availableCount = schedules.filter((item) => item.status === 'available' && item.is_active).length;
    const maintenanceCount = schedules.filter((item) => item.status === 'maintenance').length;
    const activeCount = schedules.filter((item) => item.is_active).length;

    return (
        <Layout>
            <div className="min-w-0 space-y-6 p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                            <CalendarDays className="h-4 w-4" />
                            Court Scheduling
                        </div>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                            Court Schedules
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage recurring weekly operating schedules and availability for your courts.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                        <Plus className="h-4 w-4" />
                        Add Schedule
                    </button>
                </div>

                {error && (
                    <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                        <span>{error}</span>
                        <button type="button" onClick={() => setError('')} className="rounded p-0.5 hover:bg-red-100" aria-label="Dismiss error">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">Total Schedules</p>
                            <span className="rounded-lg bg-blue-50 p-2 text-blue-700"><CalendarDays className="h-5 w-5" /></span>
                        </div>
                        <p className="mt-3 text-2xl font-bold text-slate-900">{schedules.length}</p>
                        <p className="mt-1 text-xs text-slate-500">All configured schedules</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">Active Schedules</p>
                            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700"><CheckCircle2 className="h-5 w-5" /></span>
                        </div>
                        <p className="mt-3 text-2xl font-bold text-slate-900">{activeCount}</p>
                        <p className="mt-1 text-xs text-slate-500">Currently enabled</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">Available</p>
                            <span className="rounded-lg bg-indigo-50 p-2 text-indigo-700"><Clock3 className="h-5 w-5" /></span>
                        </div>
                        <p className="mt-3 text-2xl font-bold text-slate-900">{availableCount}</p>
                        <p className="mt-1 text-xs text-slate-500">Active availability windows</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">Maintenance</p>
                            <span className="rounded-lg bg-amber-50 p-2 text-amber-700"><Wrench className="h-5 w-5" /></span>
                        </div>
                        <p className="mt-3 text-2xl font-bold text-slate-900">{maintenanceCount}</p>
                        <p className="mt-1 text-xs text-slate-500">Maintenance windows</p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 p-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="md:col-span-2">
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Search Schedules
                                </label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="search"
                                        value={searchTerm}
                                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                        placeholder="Search court, day, status, notes..."
                                        className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Court</label>
                                <select
                                    value={selectedCourt}
                                    onChange={(e) => { setSelectedCourt(e.target.value); setCurrentPage(1); }}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="">All Courts</option>
                                    {courts.map((court) => <option key={court.id} value={court.id}>{court.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Status</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="">All Statuses</option>
                                    {STATUSES.map((status) => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                            <button
                                type="button"
                                onClick={() => { setSelectedCourt(''); setSelectedStatus(''); setSearchTerm(''); setCurrentPage(1); }}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    <div className="w-full overflow-x-auto">
                        <table className="w-full min-w-[850px] border-collapse text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="whitespace-nowrap px-5 py-4 font-semibold">Court</th>
                                    <th className="whitespace-nowrap px-5 py-4 font-semibold">Day</th>
                                    <th className="whitespace-nowrap px-5 py-4 font-semibold">Operating Hours</th>
                                    <th className="whitespace-nowrap px-5 py-4 font-semibold">Status</th>
                                    <th className="whitespace-nowrap px-5 py-4 font-semibold">Active</th>
                                    <th className="whitespace-nowrap px-5 py-4 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-5 py-14 text-center text-sm text-slate-500">Loading schedules...</td></tr>
                                ) : paginatedSchedules.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-14 text-center">
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                                <CalendarCheck className="h-6 w-6" />
                                            </div>
                                            <p className="mt-3 font-semibold text-slate-800">{schedules.length === 0 ? 'No schedules found' : 'No matching schedules found'}</p>
                                            <p className="mt-1 text-sm text-slate-500">{schedules.length === 0 ? 'Create a recurring schedule to get started.' : 'Try adjusting your search or filters.'}</p>
                                            {schedules.length > 0 && (
                                                <button type="button" onClick={() => { setSelectedCourt(''); setSelectedStatus(''); setSearchTerm(''); setCurrentPage(1); }} className="mt-4 rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">
                                                    Clear Filters
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : paginatedSchedules.map((schedule) => (
                                    <tr key={schedule.id} className="transition-colors hover:bg-slate-50/80">
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-slate-800">{getCourtName(schedule.court_id)}</div>
                                            {schedule.notes && <div className="mt-1 max-w-xs truncate text-xs text-slate-500">{schedule.notes}</div>}
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">{getDayName(schedule.day_of_week)}</td>
                                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                            {schedule.start_time?.substring(0, 5) || '--:--'} <span className="mx-1 text-slate-400">–</span> {schedule.end_time?.substring(0, 5) || '--:--'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusClasses[schedule.status] ?? 'bg-slate-100 text-slate-600 ring-slate-500/20'}`}>
                                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                                {schedule.status || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${schedule.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {schedule.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button type="button" onClick={() => openEditModal(schedule)} title="Edit schedule" aria-label={`Edit schedule ${schedule.id}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200">
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button type="button" onClick={() => deleteSchedule(schedule.id)} title="Delete schedule" aria-label={`Delete schedule ${schedule.id}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-500 transition hover:border-red-500 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-200">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!loading && filteredSchedules.length > 0 && (
                        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                <span>Showing <span className="font-semibold text-slate-700">{startEntry}–{endEntry}</span> of <span className="font-semibold text-slate-700">{filteredSchedules.length}</span> schedules</span>
                                <label className="flex items-center gap-2">
                                    Rows
                                    <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }} className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                                        <option value={5}>5</option><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
                                    </select>
                                </label>
                            </div>
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={safePage <= 1} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
                                <span className="text-xs font-medium text-slate-600">Page {safePage} of {totalPages}</span>
                                <button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={safePage >= totalPages} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
                            </div>
                        </div>
                    )}
                </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    {editingSchedule
                                        ? 'Edit Court Schedule'
                                        : 'Add Court Schedule'}
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Configure recurring court availability.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowModal(false)}
                                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                ×
                            </button>
                        </div>

                        <form
                            onSubmit={saveSchedule}
                            className="space-y-5 p-6"
                        >
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Court
                                </label>

                                <select
                                    name="court_id"
                                    value={form.court_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="">
                                        Select Court
                                    </option>

                                    {courts.map((court) => (
                                        <option
                                            key={court.id}
                                            value={court.id}
                                        >
                                            {court.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Day
                                </label>

                                <select
                                    name="day_of_week"
                                    value={form.day_of_week}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    {DAYS.map((day) => (
                                        <option
                                            key={day.value}
                                            value={day.value}
                                        >
                                            {day.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Start Time
                                    </label>

                                    <input
                                        type="time"
                                        name="start_time"
                                        value={form.start_time}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        End Time
                                    </label>

                                    <input
                                        type="time"
                                        name="end_time"
                                        value={form.end_time}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    className="w-full rounded-lg rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    {STATUSES.map((status) => (
                                        <option key={status} value={status}>
                                            {status
                                                .charAt(0)
                                                .toUpperCase() +
                                                status.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Start Date
                                    </label>

                                    <input
                                        type="date"
                                        name="start_date"
                                        value={form.start_date}
                                        onChange={handleChange}
                                        className="w-full rounded-lg rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        End Date
                                    </label>

                                    <input
                                        type="date"
                                        name="end_date"
                                        value={form.end_date}
                                        onChange={handleChange}
                                        className="w-full rounded-lg rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Notes
                                </label>

                                <textarea
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full rounded-lg rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    placeholder="Optional notes..."
                                />
                            </div>

                            <label className="flex items-center gap-2 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={form.is_active}
                                    onChange={handleChange}
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />

                                Schedule is active
                            </label>

                            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving
                                        ? 'Saving...'
                                        : editingSchedule
                                        ? 'Update Schedule'
                                        : 'Save Schedule'}
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