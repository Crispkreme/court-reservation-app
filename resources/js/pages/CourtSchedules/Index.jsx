import { useCallback, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const statusClasses = {
    available: 'bg-green-500',
    reserved: 'bg-blue-500',
    held: 'bg-yellow-500',
    blocked: 'bg-gray-500',
    maintenance: 'bg-orange-500',
    closed: 'bg-red-500',
    holiday: 'bg-purple-500',
};

export default function CourtSchedules() {
    const [courts, setCourts] = useState([]);
    const [selectedCourt, setSelectedCourt] = useState('');
    const [events, setEvents] = useState([]);

    const [showScheduleModal, setShowScheduleModal] =
        useState(false);

    const [showOverrideModal, setShowOverrideModal] =
        useState(false);

    const [selectedDate, setSelectedDate] = useState(null);

    const [scheduleForm, setScheduleForm] = useState({
        court_id: '',
        day_of_week: 1,
        start_time: '08:00',
        end_time: '22:00',
        status: 'available',
        start_date: '',
        end_date: '',
        notes: '',
    });

    const [overrideForm, setOverrideForm] = useState({
        court_id: '',
        date: '',
        start_time: '',
        end_time: '',
        status: 'blocked',
        title: '',
        reason: '',
    });

    /*
    |--------------------------------------------------------------------------
    | Load courts
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        fetch('/api/v1/courts')
            .then((response) => response.json())
            .then((result) => {
                setCourts(result.data ?? []);
            });
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Load calendar
    |--------------------------------------------------------------------------
    */

    const loadCalendar = useCallback(
        (start, end) => {
            const params = new URLSearchParams({
                start,
                end,
            });

            if (selectedCourt) {
                params.append(
                    'court_id',
                    selectedCourt
                );
            }

            fetch(`/api/v1/court-calendar?${params}`)
                .then((response) => response.json())
                .then((result) => {
                    setEvents(result.data ?? []);
                });
        },
        [selectedCourt]
    );

    /*
    |--------------------------------------------------------------------------
    | Calendar date range
    |--------------------------------------------------------------------------
    */

    const handleDatesSet = (info) => {
        loadCalendar(
            info.startStr,
            info.endStr
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Select date/time
    |--------------------------------------------------------------------------
    */

    const handleDateSelect = (info) => {
        setSelectedDate(info);

        setOverrideForm({
            court_id: selectedCourt,
            date: info.startStr.substring(0, 10),
            start_time: info.allDay
                ? ''
                : info.startStr.substring(11, 16),
            end_time: info.allDay
                ? ''
                : info.endStr?.substring(11, 16) ?? '',
            status: 'blocked',
            title: '',
            reason: '',
        });

        setShowOverrideModal(true);
    };

    /*
    |--------------------------------------------------------------------------
    | Submit recurring schedule
    |--------------------------------------------------------------------------
    */

    const submitSchedule = async (event) => {
        event.preventDefault();

        const response = await fetch(
            '/api/v1/court-schedules',
            {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(scheduleForm),
            }
        );

        if (!response.ok) {
            const error = await response.json();

            console.error(error);

            return;
        }

        setShowScheduleModal(false);

        window.location.reload();
    };

    /*
    |--------------------------------------------------------------------------
    | Submit override
    |--------------------------------------------------------------------------
    */

    const submitOverride = async (event) => {
        event.preventDefault();

        const response = await fetch(
            '/api/v1/court-schedule-overrides',
            {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(overrideForm),
            }
        );

        if (!response.ok) {
            const error = await response.json();

            console.error(error);

            return;
        }

        setShowOverrideModal(false);

        window.location.reload();
    };

    /*
    |--------------------------------------------------------------------------
    | Event rendering
    |--------------------------------------------------------------------------
    */

    const renderEvent = (info) => {
        const status = info.event.extendedProps.status;

        const colorClass =
            statusClasses[status] ??
            'bg-gray-500';

        return (
            <div
                className={`w-full rounded px-2 py-1 text-xs text-white ${colorClass}`}
            >
                <div className="font-semibold">
                    {info.event.title}
                </div>

                <div>
                    {info.event.extendedProps.court_name}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-7xl">

                {/* Header */}

                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Court Schedule & Calendar
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage recurring court schedules,
                            availability, holidays and overrides.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setScheduleForm({
                                ...scheduleForm,
                                court_id:
                                    selectedCourt ||
                                    '',
                            });

                            setShowScheduleModal(true);
                        }}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        + Add Schedule
                    </button>
                </div>

                {/* Filters */}

                <div className="mb-6 rounded-xl bg-white p-4 shadow">
                    <div className="flex flex-wrap items-end gap-4">

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Court
                            </label>

                            <select
                                value={selectedCourt}
                                onChange={(event) =>
                                    setSelectedCourt(
                                        event.target.value
                                    )
                                }
                                className="rounded-lg border border-gray-300 px-3 py-2"
                            >
                                <option value="">
                                    All Courts
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

                    </div>
                </div>

                {/* Calendar */}

                <div className="rounded-xl bg-white p-4 shadow">

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
                            right:
                                'dayGridMonth,timeGridWeek,timeGridDay',
                        }}
                        selectable={true}
                        selectMirror={true}
                        nowIndicator={true}
                        height="auto"
                        slotMinTime="06:00:00"
                        slotMaxTime="24:00:00"
                        events={events}
                        datesSet={handleDatesSet}
                        select={handleDateSelect}
                        eventContent={renderEvent}
                    />

                </div>

                {/* Legend */}

                <div className="mt-6 rounded-xl bg-white p-4 shadow">

                    <h3 className="mb-3 font-semibold">
                        Schedule Status
                    </h3>

                    <div className="flex flex-wrap gap-4 text-sm">

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
                            color="bg-gray-500"
                            label="Blocked"
                        />

                        <Legend
                            color="bg-orange-500"
                            label="Maintenance"
                        />

                        <Legend
                            color="bg-red-500"
                            label="Closed"
                        />

                        <Legend
                            color="bg-purple-500"
                            label="Holiday"
                        />

                    </div>
                </div>
            </div>

            {/* Schedule Modal */}

            {showScheduleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

                        <h2 className="mb-6 text-xl font-bold">
                            Add Recurring Schedule
                        </h2>

                        <form
                            onSubmit={submitSchedule}
                            className="space-y-4"
                        >

                            <FormSelect
                                label="Court"
                                value={scheduleForm.court_id}
                                onChange={(value) =>
                                    setScheduleForm({
                                        ...scheduleForm,
                                        court_id: value,
                                    })
                                }
                                options={courts.map(
                                    (court) => ({
                                        value: court.id,
                                        label: court.name,
                                    })
                                )}
                            />

                            <FormSelect
                                label="Day"
                                value={scheduleForm.day_of_week}
                                onChange={(value) =>
                                    setScheduleForm({
                                        ...scheduleForm,
                                        day_of_week:
                                            Number(value),
                                    })
                                }
                                options={[
                                    {
                                        value: 0,
                                        label: 'Sunday',
                                    },
                                    {
                                        value: 1,
                                        label: 'Monday',
                                    },
                                    {
                                        value: 2,
                                        label: 'Tuesday',
                                    },
                                    {
                                        value: 3,
                                        label: 'Wednesday',
                                    },
                                    {
                                        value: 4,
                                        label: 'Thursday',
                                    },
                                    {
                                        value: 5,
                                        label: 'Friday',
                                    },
                                    {
                                        value: 6,
                                        label: 'Saturday',
                                    },
                                ]}
                            />

                            <div className="grid grid-cols-2 gap-4">

                                <FormInput
                                    label="Start Time"
                                    type="time"
                                    value={
                                        scheduleForm.start_time
                                    }
                                    onChange={(value) =>
                                        setScheduleForm({
                                            ...scheduleForm,
                                            start_time: value,
                                        })
                                    }
                                />

                                <FormInput
                                    label="End Time"
                                    type="time"
                                    value={
                                        scheduleForm.end_time
                                    }
                                    onChange={(value) =>
                                        setScheduleForm({
                                            ...scheduleForm,
                                            end_time: value,
                                        })
                                    }
                                />

                            </div>

                            <FormSelect
                                label="Status"
                                value={scheduleForm.status}
                                onChange={(value) =>
                                    setScheduleForm({
                                        ...scheduleForm,
                                        status: value,
                                    })
                                }
                                options={[
                                    {
                                        value: 'available',
                                        label: 'Available',
                                    },
                                    {
                                        value: 'blocked',
                                        label: 'Blocked',
                                    },
                                    {
                                        value: 'maintenance',
                                        label: 'Maintenance',
                                    },
                                    {
                                        value: 'closed',
                                        label: 'Closed',
                                    },
                                ]}
                            />

                            <FormInput
                                label="Start Date"
                                type="date"
                                value={
                                    scheduleForm.start_date
                                }
                                onChange={(value) =>
                                    setScheduleForm({
                                        ...scheduleForm,
                                        start_date: value,
                                    })
                                }
                            />

                            <FormInput
                                label="End Date"
                                type="date"
                                value={
                                    scheduleForm.end_date
                                }
                                onChange={(value) =>
                                    setScheduleForm({
                                        ...scheduleForm,
                                        end_date: value,
                                    })
                                }
                            />

                            <textarea
                                placeholder="Notes"
                                value={scheduleForm.notes}
                                onChange={(event) =>
                                    setScheduleForm({
                                        ...scheduleForm,
                                        notes: event.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />

                            <div className="flex justify-end gap-3 pt-4">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowScheduleModal(false)
                                    }
                                    className="rounded-lg border px-4 py-2"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                                >
                                    Save Schedule
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}

            {/* Override Modal */}

            {showOverrideModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

                        <h2 className="mb-6 text-xl font-bold">
                            Schedule Override
                        </h2>

                        <form
                            onSubmit={submitOverride}
                            className="space-y-4"
                        >

                            <FormSelect
                                label="Court"
                                value={overrideForm.court_id}
                                onChange={(value) =>
                                    setOverrideForm({
                                        ...overrideForm,
                                        court_id: value,
                                    })
                                }
                                options={courts.map(
                                    (court) => ({
                                        value: court.id,
                                        label: court.name,
                                    })
                                )}
                            />

                            <FormInput
                                label="Date"
                                type="date"
                                value={overrideForm.date}
                                onChange={(value) =>
                                    setOverrideForm({
                                        ...overrideForm,
                                        date: value,
                                    })
                                }
                            />

                            <div className="grid grid-cols-2 gap-4">

                                <FormInput
                                    label="Start Time"
                                    type="time"
                                    value={
                                        overrideForm.start_time
                                    }
                                    onChange={(value) =>
                                        setOverrideForm({
                                            ...overrideForm,
                                            start_time: value,
                                        })
                                    }
                                />

                                <FormInput
                                    label="End Time"
                                    type="time"
                                    value={
                                        overrideForm.end_time
                                    }
                                    onChange={(value) =>
                                        setOverrideForm({
                                            ...overrideForm,
                                            end_time: value,
                                        })
                                    }
                                />

                            </div>

                            <FormSelect
                                label="Status"
                                value={overrideForm.status}
                                onChange={(value) =>
                                    setOverrideForm({
                                        ...overrideForm,
                                        status: value,
                                    })
                                }
                                options={[
                                    {
                                        value: 'available',
                                        label: 'Available',
                                    },
                                    {
                                        value: 'blocked',
                                        label: 'Blocked',
                                    },
                                    {
                                        value: 'maintenance',
                                        label: 'Maintenance',
                                    },
                                    {
                                        value: 'closed',
                                        label: 'Closed',
                                    },
                                    {
                                        value: 'holiday',
                                        label: 'Holiday',
                                    },
                                ]}
                            />

                            <FormInput
                                label="Title"
                                type="text"
                                value={overrideForm.title}
                                onChange={(value) =>
                                    setOverrideForm({
                                        ...overrideForm,
                                        title: value,
                                    })
                                }
                            />

                            <textarea
                                placeholder="Reason"
                                value={overrideForm.reason}
                                onChange={(event) =>
                                    setOverrideForm({
                                        ...overrideForm,
                                        reason: event.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />

                            <div className="flex justify-end gap-3 pt-4">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowOverrideModal(false)
                                    }
                                    className="rounded-lg border px-4 py-2"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                                >
                                    Save Override
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}
        </div>
    );
}


/*
|--------------------------------------------------------------------------
| Reusable Components
|--------------------------------------------------------------------------
*/

function FormInput({
    label,
    type,
    value,
    onChange,
}) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
                {label}
            </label>

            <input
                type={type}
                value={value ?? ''}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
        </div>
    );
}


function FormSelect({
    label,
    value,
    onChange,
    options,
}) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
                {label}
            </label>

            <select
                value={value ?? ''}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
                <option value="">
                    Select {label}
                </option>

                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}


function Legend({ color, label }) {
    return (
        <div className="flex items-center gap-2">
            <span
                className={`h-3 w-3 rounded-full ${color}`}
            />

            <span>{label}</span>
        </div>
    );
}