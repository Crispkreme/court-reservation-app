import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Layout from '../../components/layout/Layout';
import {
    CalendarDays,
    Plus,
    Search,
    Pencil,
    Trash2,
    CheckCircle2,
    Ban,
    Wrench,
    CalendarOff,
    X,
} from 'lucide-react';

const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'available', label: 'Available' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'closed', label: 'Closed' },
    { value: 'holiday', label: 'Holiday' },
];

const statusClasses = {
    available: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    blocked: 'bg-red-50 text-red-700 ring-red-600/20',
    maintenance: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    closed: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    holiday: 'bg-violet-50 text-violet-700 ring-violet-600/20',
};

const emptyForm = {
    court_id: '',
    date: '',
    start_time: '',
    end_time: '',
    status: 'blocked',
    title: '',
    reason: '',
    is_active: true,
};

export default function Overrides() {
    const [courts, setCourts] = useState([]);
    const [overrides, setOverrides] = useState([]);

    const [selectedCourt, setSelectedCourt] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [errorMessage, setErrorMessage] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editingOverride, setEditingOverride] = useState(null);

    const [form, setForm] = useState(emptyForm);

    /*
    |--------------------------------------------------------------------------
    | Load Courts
    |--------------------------------------------------------------------------
    */

    const loadCourts = async () => {
        try {
            const response = await axios.get('/api/v1/courts');

            const data = response.data?.data ?? response.data ?? [];

            setCourts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load courts:', error);
            setErrorMessage('Unable to load courts. Please refresh and try again.');
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Load Overrides
    |--------------------------------------------------------------------------
    */

    const loadOverrides = async () => {
        setLoading(true);

        try {
            const response = await axios.get(
                '/api/v1/court-schedule-overrides'
            );

            const data = response.data?.data ?? response.data ?? [];

            setOverrides(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load overrides:', error);
            setErrorMessage('Unable to load schedule overrides. Please refresh and try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCourts();
        loadOverrides();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Filter Overrides
    |--------------------------------------------------------------------------
    */

    const filteredOverrides = useMemo(() => {
        return overrides.filter((override) => {
            const matchesCourt =
                selectedCourt === '' ||
                String(override.court_id) === String(selectedCourt);

            const matchesStatus =
                selectedStatus === '' ||
                String(override.status).toLowerCase() ===
                    String(selectedStatus).toLowerCase();

            const query = searchTerm.trim().toLowerCase();
            const matchesSearch = [
                getCourtName(override.court_id),
                override.title,
                override.reason,
                override.status,
                override.date,
            ].some((value) => String(value ?? '').toLowerCase().includes(query));

            return matchesCourt && matchesStatus && matchesSearch;
        });
    }, [overrides, selectedCourt, selectedStatus, searchTerm]);

    /*
    |--------------------------------------------------------------------------
    | Form Helpers
    |--------------------------------------------------------------------------
    */

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | Open Add Modal
    |--------------------------------------------------------------------------
    */

    const openCreateModal = () => {
        setEditingOverride(null);

        setForm({
            ...emptyForm,
            court_id: courts.length > 0 ? courts[0].id : '',
        });

        setShowModal(true);
    };

    /*
    |--------------------------------------------------------------------------
    | Open Edit Modal
    |--------------------------------------------------------------------------
    */

    const openEditModal = (override) => {
        setEditingOverride(override);

        setForm({
            court_id: override.court_id ?? '',
            date: override.date ?? '',
            start_time: override.start_time
                ? String(override.start_time).substring(0, 5)
                : '',
            end_time: override.end_time
                ? String(override.end_time).substring(0, 5)
                : '',
            status: override.status ?? 'blocked',
            title: override.title ?? '',
            reason: override.reason ?? '',
            is_active: Boolean(override.is_active),
        });

        setShowModal(true);
    };

    /*
    |--------------------------------------------------------------------------
    | Save
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSaving(true);
        setErrorMessage('');

        try {
            const payload = {
                court_id: form.court_id,
                date: form.date,
                start_time: form.start_time || null,
                end_time: form.end_time || null,
                status: form.status,
                title: form.title || null,
                reason: form.reason || null,
                is_active: form.is_active,
            };

            if (editingOverride) {
                await axios.put(
                    `/api/v1/court-schedule-overrides/${editingOverride.id}`,
                    payload
                );
            } else {
                await axios.post(
                    '/api/v1/court-schedule-overrides',
                    payload
                );
            }

            setShowModal(false);
            setEditingOverride(null);
            setForm(emptyForm);

            await loadOverrides();
        } catch (error) {
            console.error('Failed to save override:', error);

            setErrorMessage(error.response?.data?.message || 'Failed to save schedule override.');
        } finally {
            setSaving(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Delete
    |--------------------------------------------------------------------------
    */

    const handleDelete = async (override) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this schedule override?'
        );

        if (!confirmed) {
            return;
        }

        try {
            await axios.delete(
                `/api/v1/court-schedule-overrides/${override.id}`
            );

            await loadOverrides();
        } catch (error) {
            console.error('Failed to delete override:', error);

            setErrorMessage(error.response?.data?.message || 'Failed to delete schedule override.');
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Court Name
    |--------------------------------------------------------------------------
    */

    const getCourtName = (courtId) => {
        const court = courts.find(
            (item) => String(item.id) === String(courtId)
        );

        return court?.name ?? `Court #${courtId}`;
    };

    /*
    |--------------------------------------------------------------------------
    | Date Formatting
    |--------------------------------------------------------------------------
    */

    const formatDate = (date) => {
        if (!date) {
            return '-';
        }

        return new Date(`${date}T00:00:00`).toLocaleDateString(
            undefined,
            {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            }
        );
    };

    const totalPages = Math.max(1, Math.ceil(filteredOverrides.length / perPage));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * perPage;
    const paginatedOverrides = filteredOverrides.slice(startIndex, startIndex + perPage);
    const startEntry = filteredOverrides.length ? startIndex + 1 : 0;
    const endEntry = Math.min(startIndex + perPage, filteredOverrides.length);
    const activeCount = overrides.filter((item) => item.is_active).length;
    const blockedCount = overrides.filter((item) => item.status === 'blocked' && item.is_active).length;
    const maintenanceCount = overrides.filter((item) => item.status === 'maintenance' && item.is_active).length;

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <Layout>
            <div className="min-w-0 space-y-6 p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                            <CalendarDays className="h-4 w-4" /> Court Scheduling
                        </div>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Schedule Overrides</h1>
                        <p className="mt-1 text-sm text-slate-500">Manage date-specific court schedule exceptions, closures, and special availability.</p>
                    </div>
                    <button type="button" onClick={openCreateModal} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300">
                        <Plus className="h-4 w-4" /> Add Override
                    </button>
                </div>

                {errorMessage && (
                    <div role="alert" className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <span>{errorMessage}</span>
                        <button type="button" onClick={() => setErrorMessage('')} aria-label="Dismiss error" className="rounded p-0.5 transition hover:bg-red-100"><X className="h-4 w-4" /></button>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-500">Total Overrides</p><span className="rounded-lg bg-blue-50 p-2 text-blue-700"><CalendarDays className="h-5 w-5" /></span></div>
                        <p className="mt-3 text-2xl font-bold text-slate-900">{overrides.length}</p><p className="mt-1 text-xs text-slate-500">Configured exceptions</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-500">Active Overrides</p><span className="rounded-lg bg-emerald-50 p-2 text-emerald-700"><CheckCircle2 className="h-5 w-5" /></span></div>
                        <p className="mt-3 text-2xl font-bold text-slate-900">{activeCount}</p><p className="mt-1 text-xs text-slate-500">Currently enabled</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-500">Blocked</p><span className="rounded-lg bg-red-50 p-2 text-red-700"><Ban className="h-5 w-5" /></span></div>
                        <p className="mt-3 text-2xl font-bold text-slate-900">{blockedCount}</p><p className="mt-1 text-xs text-slate-500">Active blocked periods</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-500">Maintenance</p><span className="rounded-lg bg-amber-50 p-2 text-amber-700"><Wrench className="h-5 w-5" /></span></div>
                        <p className="mt-3 text-2xl font-bold text-slate-900">{maintenanceCount}</p><p className="mt-1 text-xs text-slate-500">Active maintenance periods</p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 p-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="md:col-span-2">
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Search Overrides</label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input type="search" value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1); }} placeholder="Search court, title, date, reason..." className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Court</label>
                                <select value={selectedCourt} onChange={(event) => { setSelectedCourt(event.target.value); setCurrentPage(1); }} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                                    <option value="">All Courts</option>{courts.map((court) => <option key={court.id} value={court.id}>{court.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Status</label>
                                <select value={selectedStatus} onChange={(event) => { setSelectedStatus(event.target.value); setCurrentPage(1); }} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                                    {statusOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-xs text-slate-500">Showing <span className="font-semibold text-slate-700">{filteredOverrides.length}</span> of <span className="font-semibold text-slate-700">{overrides.length}</span> overrides</p>
                            <button type="button" onClick={() => { setSelectedCourt(''); setSelectedStatus(''); setSearchTerm(''); setCurrentPage(1); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Clear Filters</button>
                        </div>
                    </div>

                    <div className="w-full overflow-x-auto">
                        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="whitespace-nowrap px-5 py-4 font-semibold">Court</th>
                                    <th className="whitespace-nowrap px-5 py-4 font-semibold">Date</th>
                                    <th className="whitespace-nowrap px-5 py-4 font-semibold">Time</th>
                                    <th className="whitespace-nowrap px-5 py-4 font-semibold">Status</th>
                                    <th className="whitespace-nowrap px-5 py-4 font-semibold">Title</th>
                                    <th className="whitespace-nowrap px-5 py-4 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-5 py-14 text-center text-sm text-slate-500">Loading overrides...</td></tr>
                                ) : paginatedOverrides.length === 0 ? (
                                    <tr><td colSpan={6} className="px-5 py-14 text-center">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><CalendarOff className="h-6 w-6" /></div>
                                        <p className="mt-3 font-semibold text-slate-800">{overrides.length === 0 ? 'No schedule overrides found' : 'No matching overrides found'}</p>
                                        <p className="mt-1 text-sm text-slate-500">{overrides.length === 0 ? 'Add an override for a holiday, closure, or special event.' : 'Try changing your search or filters.'}</p>
                                        {overrides.length > 0 && <button type="button" onClick={() => { setSelectedCourt(''); setSelectedStatus(''); setSearchTerm(''); setCurrentPage(1); }} className="mt-4 rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">Clear Filters</button>}
                                    </td></tr>
                                ) : paginatedOverrides.map((override) => (
                                    <tr key={override.id} className="transition-colors hover:bg-slate-50/80">
                                        <td className="px-5 py-4 font-semibold text-slate-800">{getCourtName(override.court_id)}</td>
                                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDate(override.date)}</td>
                                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">{override.start_time && override.end_time ? `${String(override.start_time).substring(0, 5)} – ${String(override.end_time).substring(0, 5)}` : 'Whole Day'}</td>
                                        <td className="px-5 py-4"><span className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusClasses[override.status] ?? 'bg-slate-100 text-slate-600 ring-slate-500/20'}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{String(override.status ?? 'unknown').charAt(0).toUpperCase() + String(override.status ?? 'unknown').slice(1)}</span></td>
                                        <td className="px-5 py-4 text-slate-600"><div className="font-medium text-slate-800">{override.title || '-'}</div>{override.reason && <div className="mt-1 max-w-xs truncate text-xs text-slate-500">{override.reason}</div>}</td>
                                        <td className="whitespace-nowrap px-5 py-4"><div className="flex items-center justify-end gap-2">
                                            <button type="button" onClick={() => openEditModal(override)} title="Edit override" aria-label={`Edit override ${override.id}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"><Pencil className="h-4 w-4" /></button>
                                            <button type="button" onClick={() => handleDelete(override)} title="Delete override" aria-label={`Delete override ${override.id}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-500 transition hover:border-red-500 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"><Trash2 className="h-4 w-4" /></button>
                                        </div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!loading && filteredOverrides.length > 0 && (
                        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                <span>Showing <span className="font-semibold text-slate-700">{startEntry}–{endEntry}</span> of <span className="font-semibold text-slate-700">{filteredOverrides.length}</span> overrides</span>
                                <label className="flex items-center gap-2">Rows
                                    <select value={perPage} onChange={(event) => { setPerPage(Number(event.target.value)); setCurrentPage(1); }} className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
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
                                <h2 className="text-lg font-bold text-slate-900">{editingOverride ? 'Edit Schedule Override' : 'Add Schedule Override'}</h2>
                                <p className="mt-1 text-sm text-slate-500">Configure a date-specific court exception.</p>
                            </div>
                            <button type="button" onClick={() => setShowModal(false)} aria-label="Close modal" className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className="space-y-4 p-6">

                                {/* Court */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Court
                                    </label>

                                    <select
                                        name="court_id"
                                        value={form.court_id}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

                                {/* Date */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Date
                                    </label>

                                    <input
                                        type="date"
                                        name="date"
                                        value={form.date}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        {statusOptions
                                            .filter(
                                                (option) =>
                                                    option.value !== ''
                                            )
                                            .map((option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                {/* Start / End */}
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
                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>

                                </div>

                                <p className="text-xs text-slate-500">
                                    Leave the time fields empty to apply the
                                    override for the whole day.
                                </p>

                                {/* Title */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Title
                                    </label>

                                    <input
                                        type="text"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="e.g. Private Event"
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                {/* Reason */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Reason
                                    </label>

                                    <textarea
                                        name="reason"
                                        value={form.reason}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Reason for this override..."
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                {/* Active */}
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={form.is_active}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />

                                    <span className="text-sm text-slate-700">
                                        Active
                                    </span>
                                </label>

                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">

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
                                    className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving
                                        ? 'Saving...'
                                        : editingOverride
                                          ? 'Update Override'
                                          : 'Create Override'}
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