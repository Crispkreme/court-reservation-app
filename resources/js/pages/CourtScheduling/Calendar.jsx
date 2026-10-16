import { useEffect, useState } from 'react';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function CourtCalendar() {
    const [courts, setCourts] = useState([]);
    const [events, setEvents] = useState([]);

    const [selectedCourt, setSelectedCourt] = useState('');
    const [loading, setLoading] = useState(false);

    const [selectedEvent, setSelectedEvent] = useState(null);

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
        } catch (error) {
            console.error(error);
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
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Court Calendar
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            View court schedules, availability, maintenance,
                            closures, and overrides.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={selectedCourt}
                            onChange={(e) =>
                                setSelectedCourt(e.target.value)
                            }
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium"
                        >
                            <option value="">All Courts</option>

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
                </div>

                {/* Legend */}
                <div className="mb-4 flex flex-wrap gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <Legend
                        color="bg-green-500"
                        label="Available"
                    />

                    <Legend
                        color="bg-blue-500"
                        label="Reserved"
                    />

                    <Legend
                        color="bg-yellow-500"
                        label="Held"
                    />

                    <Legend
                        color="bg-red-500"
                        label="Blocked"
                    />

                    <Legend
                        color="bg-orange-500"
                        label="Maintenance"
                    />

                    <Legend
                        color="bg-gray-500"
                        label="Closed"
                    />

                    <Legend
                        color="bg-purple-500"
                        label="Holiday"
                    />
                </div>

                {/* Calendar */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

                    {loading && (
                        <div className="mb-3 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">
                            Loading calendar...
                        </div>
                    )}

                    <style>
                        {`
                            .status-available {
                                background-color: #22c55e !important;
                                border-color: #16a34a !important;
                            }

                            .status-reserved {
                                background-color: #3b82f6 !important;
                                border-color: #2563eb !important;
                            }

                            .status-held {
                                background-color: #eab308 !important;
                                border-color: #ca8a04 !important;
                            }

                            .status-blocked {
                                background-color: #ef4444 !important;
                                border-color: #dc2626 !important;
                            }

                            .status-maintenance {
                                background-color: #f97316 !important;
                                border-color: #ea580c !important;
                            }

                            .status-closed {
                                background-color: #6b7280 !important;
                                border-color: #4b5563 !important;
                            }

                            .status-holiday {
                                background-color: #8b5cf6 !important;
                                border-color: #7c3aed !important;
                            }
                        `}
                    </style>

                    <FullCalendar
                        plugins={[
                            dayGridPlugin,
                            timeGridPlugin,
                            interactionPlugin,
                        ]}
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
                        eventClick={(info) => {
                            setSelectedEvent(
                                info.event.extendedProps
                            );
                        }}
                    />
                </div>
            </div>

            {/* Event Details */}
            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <h2 className="text-lg font-bold text-gray-900">
                                Schedule Details
                            </h2>

                            <button
                                onClick={() =>
                                    setSelectedEvent(null)
                                }
                                className="text-2xl text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4 p-6">

                            <div>
                                <p className="text-xs font-semibold uppercase text-gray-400">
                                    Court
                                </p>

                                <p className="mt-1 font-medium text-gray-900">
                                    {getCourtName(
                                        selectedEvent.court_id
                                    )}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase text-gray-400">
                                    Date
                                </p>

                                <p className="mt-1 text-gray-900">
                                    {selectedEvent.date ?? '—'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase text-gray-400">
                                    Time
                                </p>

                                <p className="mt-1 text-gray-900">
                                    {selectedEvent.start &&
                                    selectedEvent.end
                                        ? `${selectedEvent.start} - ${selectedEvent.end}`
                                        : 'Whole Day'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase text-gray-400">
                                    Status
                                </p>

                                <p className="mt-1 font-semibold capitalize text-gray-900">
                                    {selectedEvent.status}
                                </p>
                            </div>

                            {selectedEvent.title && (
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-400">
                                        Title
                                    </p>

                                    <p className="mt-1 text-gray-900">
                                        {selectedEvent.title}
                                    </p>
                                </div>
                            )}

                            {selectedEvent.reason && (
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-400">
                                        Reason
                                    </p>

                                    <p className="mt-1 text-gray-700">
                                        {selectedEvent.reason}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="border-t px-6 py-4 text-right">
                            <button
                                onClick={() =>
                                    setSelectedEvent(null)
                                }
                                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Legend({ color, label }) {
    return (
        <div className="flex items-center gap-2 text-sm text-gray-600">
            <span
                className={`h-3 w-3 rounded-full ${color}`}
            />

            <span>{label}</span>
        </div>
    );
}