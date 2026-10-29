import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { CalendarDays, MapPin, Clock, X, AlertCircle } from 'lucide-react';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function Calendar() {
    const [courts, setCourts] = useState([]);
    const [events, setEvents] = useState([]);

    const [selectedCourt, setSelectedCourt] = useState('');
    const [loading, setLoading] = useState(false);

    const [selectedEvent, setSelectedEvent] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCourts();
    }, []);

    const fetchCourts = async () => {
        try {
            const response = await fetch('/api/v1/courts', {
                headers: {
                    Accept: 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ?? 'Failed to load courts'
                );
            }

            setCourts(data.data ?? data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchCalendar = async (start, end) => {
        try {
            setLoading(true);
            setError('');

            const params = new URLSearchParams({
                start: start.toISOString().split('T')[0],
                end: end.toISOString().split('T')[0],
            });

            if (selectedCourt) {
                params.append('court_id', selectedCourt);
            }

            const response = await fetch(
                `/api/v1/court-calendar?${params}`,
                {
                    headers: {
                        Accept: 'application/json',
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ?? 'Failed to load calendar'
                );
            }

            const calendarData = data.data ?? data;

            const formattedEvents = calendarData.map((item) => {
                const status = item.status ?? 'available';

                return {
                    id: `${item.type ?? 'schedule'}-${item.id}-${item.date}`,
                    title:
                        item.title ??
                        `${getCourtName(item.court_id)} - ${capitalize(
                            status
                        )}`,
                    start: item.start
                        ? `${item.date}T${item.start}`
                        : item.date,
                    end: item.end
                        ? `${item.date}T${item.end}`
                        : undefined,
                    allDay: !item.start,
                    extendedProps: {
                        ...item,
                        status,
                    },
                    classNames: [`status-${status}`],
                };
            });

            setEvents(formattedEvents);
        } catch (err) {
            console.error(err);
            setError(err.message ?? 'Failed to load calendar. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getCourtName = (courtId) => {
        const court = courts.find(
            (item) => Number(item.id) === Number(courtId)
        );

        return court?.name ?? `Court #${courtId}`;
    };

    const capitalize = (value) => {
        if (!value) return '';

        return value.charAt(0).toUpperCase() + value.slice(1);
    };

    const handleDatesSet = (info) => {
        fetchCalendar(info.start, info.end);
    };

    useEffect(() => {
        if (!courts.length) {
            return;
        }

        // Calendar will call datesSet as well.
    }, [selectedCourt]);

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                                    <CalendarDays size={22} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                        Court Calendar
                                    </h1>
                                    <p className="mt-1 text-sm text-slate-500">
                                        View court schedules, availability, maintenance, closures, and overrides.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                            <label htmlFor="court-filter" className="text-sm font-medium text-slate-600">
                                Filter by court
                            </label>
                            <select
                                id="court-filter"
                                value={selectedCourt}
                                onChange={(e) => setSelectedCourt(e.target.value)}
                                className="min-w-48 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">All Courts</option>
                                {courts.map((court) => (
                                    <option key={court.id} value={court.id}>
                                        {court.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Courts</p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">{courts.length}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Calendar Events</p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">{events.length}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected View</p>
                            <p className="mt-2 text-base font-bold text-blue-700">Court schedules</p>
                        </div>
                        <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-1">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current Filter</p>
                            <p className="mt-2 truncate text-base font-bold text-slate-900">
                                {selectedCourt
                                    ? courts.find((court) => String(court.id) === String(selectedCourt))?.name ?? 'Selected court'
                                    : 'All Courts'}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                        <div className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900">Schedule Overview</h2>
                                <p className="mt-1 text-sm text-slate-500">Select an event to see its schedule details.</p>
                            </div>
                            {loading && (
                                <span className="inline-flex items-center gap-2 self-start rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 sm:self-auto">
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
                                    Loading calendar...
                                </span>
                            )}
                        </div>

                        {error && (
                            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 rounded-xl bg-slate-50 px-3 py-3">
                            <Legend color="bg-green-500" label="Available" />
                            <Legend color="bg-blue-500" label="Reserved" />
                            <Legend color="bg-yellow-500" label="Held" />
                            <Legend color="bg-red-500" label="Blocked" />
                            <Legend color="bg-orange-500" label="Maintenance" />
                            <Legend color="bg-slate-500" label="Closed" />
                            <Legend color="bg-purple-500" label="Holiday" />
                        </div>

                        <style>
                            {`
                                .court-calendar .fc {
                                    --fc-border-color: #e2e8f0;
                                    --fc-page-bg-color: #ffffff;
                                    --fc-neutral-bg-color: #f8fafc;
                                    --fc-today-bg-color: #eff6ff;
                                    color: #334155;
                                    font-size: 0.875rem;
                                }
                                .court-calendar .fc .fc-toolbar {
                                    gap: 0.75rem;
                                    flex-wrap: wrap;
                                }
                                .court-calendar .fc .fc-toolbar-title {
                                    color: #0f172a;
                                    font-size: 1.1rem;
                                    font-weight: 700;
                                }
                                .court-calendar .fc .fc-button {
                                    border-color: #2563eb;
                                    background: #2563eb;
                                    border-radius: 0.5rem;
                                    box-shadow: none;
                                    font-size: 0.8rem;
                                    font-weight: 600;
                                    text-transform: capitalize;
                                }
                                .court-calendar .fc .fc-button:hover,
                                .court-calendar .fc .fc-button:focus {
                                    border-color: #1d4ed8;
                                    background: #1d4ed8;
                                    box-shadow: none;
                                }
                                .court-calendar .fc .fc-button-primary:disabled {
                                    border-color: #93c5fd;
                                    background: #93c5fd;
                                }
                                .court-calendar .fc .fc-col-header-cell-cushion,
                                .court-calendar .fc .fc-daygrid-day-number {
                                    color: #475569;
                                    padding: 0.4rem;
                                    text-decoration: none;
                                }
                                .court-calendar .fc .fc-event {
                                    cursor: pointer;
                                    border-radius: 0.35rem;
                                    padding: 1px 3px;
                                    font-size: 0.75rem;
                                }
                                .court-calendar .fc .status-available { background-color: #22c55e !important; border-color: #16a34a !important; }
                                .court-calendar .fc .status-reserved { background-color: #3b82f6 !important; border-color: #2563eb !important; }
                                .court-calendar .fc .status-held { background-color: #eab308 !important; border-color: #ca8a04 !important; color: #422006 !important; }
                                .court-calendar .fc .status-blocked { background-color: #ef4444 !important; border-color: #dc2626 !important; }
                                .court-calendar .fc .status-maintenance { background-color: #f97316 !important; border-color: #ea580c !important; }
                                .court-calendar .fc .status-closed { background-color: #64748b !important; border-color: #475569 !important; }
                                .court-calendar .fc .status-holiday { background-color: #8b5cf6 !important; border-color: #7c3aed !important; }
                                @media (max-width: 640px) {
                                    .court-calendar .fc .fc-toolbar-title { font-size: 1rem; }
                                    .court-calendar .fc .fc-button { padding: 0.35rem 0.5rem; }
                                }
                            `}
                        </style>

                        <div className="court-calendar min-w-0">
                            <FullCalendar
                                key={selectedCourt}
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="timeGridWeek"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                                }}
                                height="auto"
                                slotMinTime="06:00:00"
                                slotMaxTime="23:00:00"
                                allDaySlot={true}
                                events={events}
                                datesSet={handleDatesSet}
                                eventClick={(info) => setSelectedEvent(info.event.extendedProps)}
                            />
                        </div>
                    </div>
                </div>

                {selectedEvent && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setSelectedEvent(null);
                        }}
                    >
                        <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Schedule Details</h2>
                                    <p className="mt-1 text-sm text-slate-500">Information for the selected calendar event.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedEvent(null)}
                                    aria-label="Close schedule details"
                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="grid gap-5 p-6 sm:grid-cols-2">
                                <Detail icon={<MapPin size={16} />} label="Court">
                                    {getCourtName(selectedEvent.court_id)}
                                </Detail>
                                <Detail icon={<CalendarDays size={16} />} label="Date">
                                    {selectedEvent.date ?? '—'}
                                </Detail>
                                <Detail icon={<Clock size={16} />} label="Time">
                                    {selectedEvent.start && selectedEvent.end
                                        ? `${selectedEvent.start} - ${selectedEvent.end}`
                                        : 'Whole Day'}
                                </Detail>
                                <Detail label="Status">
                                    <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold capitalize text-blue-700">
                                        {selectedEvent.status ?? 'available'}
                                    </span>
                                </Detail>
                                {selectedEvent.title && (
                                    <Detail label="Title" wide>{selectedEvent.title}</Detail>
                                )}
                                {selectedEvent.reason && (
                                    <Detail label="Reason" wide>{selectedEvent.reason}</Detail>
                                )}
                            </div>

                            <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-4">
                                <button
                                    type="button"
                                    onClick={() => setSelectedEvent(null)}
                                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}

function Legend({ color, label }) {
    return (
        <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
            <span>{label}</span>
        </div>
    );
}

function Detail({ icon, label, children, wide = false }) {
    return (
        <div className={wide ? 'sm:col-span-2' : ''}>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {icon}
                {label}
            </p>
            <div className="mt-2 break-words text-sm font-medium text-slate-800">{children}</div>
        </div>
    );
}
