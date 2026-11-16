import React, { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Clock3, MapPin, CheckCircle2, Loader2, CalendarCheck2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getCourts } from "@/services/courtService";
import { createBooking, getCourtAvailability } from "@/services/bookingService";

import TimeSlotSelector from "@/components/booking/TimeSlotSelector";
import BookingSummary from "@/components/booking/BookingSummary";
import PageHeader from "@/components/common/PageHeader";
import AlertMessage from "@/components/AlertMessage";
import Pagination from "@/components/common/Pagination";
import FormInput from "@/components/common/FormInput";
import FormSelect from "@/components/common/FormSelect";

const localDate = () => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Dubai",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const part = (type) => parts.find((item) => item.type === type)?.value;
    return `${part("year")}-${part("month")}-${part("day")}`;
};

const errorText = (error) => Object.values(error?.response?.data?.errors || {}).flat()[0] || error?.response?.data?.message || "Something went wrong. Please try again.";

export default function Create() {
    const navigate = useNavigate();

    const [courts, setCourts] = useState([]);
    const [courtId, setCourtId] = useState("");
    const [date, setDate] = useState(localDate);
    const [duration, setDuration] = useState(60);
    const [availability, setAvailability] = useState(null);
    const [slot, setSlot] = useState(null);
    const [loadingCourts, setLoadingCourts] = useState(true);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [slotPage, setSlotPage] = useState(1);
    const slotsPerPage = 12;

    useEffect(() => {
        let active = true;

        getCourts()
            .then((result) => {
                if (!active) return;
                const payload = result.data ?? result;
                setCourts(Array.isArray(payload) ? payload : payload.data || []);
            })
            .catch((err) => {
                if (active) setError(errorText(err));
            })
            .finally(() => {
                if (active) setLoadingCourts(false);
            });

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;

        setSlot(null);
        setAvailability(null);
        setSlotPage(1);

        if (!courtId || !date || !duration) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        getCourtAvailability(courtId, {
            date,
            duration_minutes: Number(duration),
        })
            .then((result) => {
                if (active) {
                    setAvailability(result.data ?? result);
                }
            })
            .catch((err) => {
                if (active) {
                    setError(errorText(err));
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [courtId, date, duration]);

    const submit = async (event) => {
        event.preventDefault();

        if (!slot || saving || loading || loadingCourts) return;

        setSaving(true);
        setError("");

        try {
            const result = await createBooking({
                court_id: Number(courtId),
                start_at: slot.start_at,
                end_at: slot.end_at,
                duration_minutes: Number(duration),
            });
            const booking = result.data ?? result;
            navigate(booking?.id ? `/member/reservations/${booking.id}` : "/member/reservations");
        } catch (err) {
            setError(errorText(err));
        } finally {
            setSaving(false);
        }
    };

    const court = courts.find((item) => String(item.id) === String(courtId));
    const allSlots = Array.isArray(availability?.slots) ? availability.slots : [];
    const totalSlots = allSlots.length;

    const lastSlotPage = Math.max(1, Math.ceil(totalSlots / slotsPerPage));
    const currentSlotPage = Math.min(slotPage, lastSlotPage);
    const paginatedSlots = allSlots.slice((currentSlotPage - 1) * slotsPerPage,currentSlotPage * slotsPerPage);
    const canSubmit = Boolean(courtId && date && slot) && !saving && !loading && !loadingCourts;

    return (
        <div className="space-y-6 p-6 lg:p-10">
            <button
                type="button"
                onClick={() => navigate("/member/reservations")}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-red-700"
            >
                <ArrowLeft size={17} />
                Back to Bookings
            </button>

            <PageHeader
                title="New Booking"
                description="Choose your preferred court, schedule, and available time slot."
            />

            {error && (
                <AlertMessage
                    type="error"
                    message={error}
                    onClose={() => setError("")}
                />
            )}

            <form
                onSubmit={submit}
                className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"
            >
                <div className="space-y-6">
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-700">
                                    <CalendarDays size={21} />
                                </div>

                                <div>
                                    <h2 className="text-base font-bold text-slate-900">
                                        Booking Information
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Select your court and preferred schedule.
                                    </p>
                                </div>
                            </div>
                        </div>
         
                        <div className="p-6">
                            <div className="grid gap-5 md:grid-cols-2">
                                <FormSelect
                                    label="Select Court"
                                    id="booking-court"
                                    name="court_id"
                                    icon={MapPin}
                                    required
                                    value={courtId}
                                    disabled={loadingCourts || saving}
                                    onChange={(event) => {
                                        setCourtId(event.target.value);
                                    }}
                                    placeholder={
                                        loadingCourts
                                            ? "Loading courts..."
                                            : "Choose a court"
                                    }
                                    options={courts.map((court) => ({
                                        value: court.id,
                                        label: court.name,
                                    }))}
                                    className="md:col-span-2"
                                />

                                <FormInput
                                    label="Booking Date"
                                    id="booking-date"
                                    name="date"
                                    type="date"
                                    icon={CalendarDays}
                                    required
                                    min={localDate()}
                                    value={date}
                                    disabled={saving}
                                    onChange={(event) => {
                                        setDate(event.target.value);
                                    }}
                                />

                                <FormSelect
                                    label="Duration"
                                    id="booking-duration"
                                    name="duration_minutes"
                                    icon={Clock3}
                                    required
                                    value={duration}
                                    disabled={saving}
                                    onChange={(event) => {
                                        setDuration(Number(event.target.value));
                                    }}
                                    placeholder=""
                                    options={[
                                        { value: 30, label: "30 minutes" },
                                        { value: 60, label: "60 minutes" },
                                        { value: 90, label: "90 minutes" },
                                        { value: 120, label: "120 minutes" },
                                    ]}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-700">
                                    <Clock3 size={21} />
                                </div>

                                <div>
                                    <h2 className="text-base font-bold text-slate-900">
                                        Available Time Slots
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Select an available time for your booking.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            {!courtId ? (
                                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                                    <CalendarDays
                                        size={32}
                                        className="mx-auto text-slate-300"
                                    />

                                    <h3 className="mt-4 text-sm font-semibold text-slate-800">
                                        Select a Court First
                                    </h3>

                                    <p className="mt-2 text-sm text-slate-500">
                                        Choose a court to view its available time slots.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {loading && (
                                        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                                            <Loader2
                                                size={17}
                                                className="animate-spin text-red-700"
                                            />
                                            Checking court availability...
                                        </div>
                                    )}

                                    {!loading && totalSlots > 0 && (
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <p className="text-sm text-slate-500">
                                                <span className="font-semibold text-slate-900">
                                                    {totalSlots}
                                                </span>{" "}
                                                available time slots
                                            </p>

                                            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                                                {slotsPerPage} per page
                                            </span>
                                        </div>
                                    )}

                                    <TimeSlotSelector
                                        slots={paginatedSlots}
                                        value={slot}
                                        onChange={setSlot}
                                        loading={loading}
                                    />

                                    {!loading && lastSlotPage > 1 && (
                                        <Pagination
                                            page={currentSlotPage}
                                            lastPage={lastSlotPage}
                                            total={totalSlots}
                                            perPage={slotsPerPage}
                                            onPageChange={setSlotPage}
                                        />
                                    )}

                                    {slot && !loading && (
                                        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                                            <CheckCircle2 size={18} />
                                            Time slot selected successfully.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <aside className="space-y-5 xl:sticky xl:top-6">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-5 py-4">
                            <div className="flex items-center gap-2">
                                <CalendarCheck2
                                    size={19}
                                    className="text-red-700"
                                />

                                <h2 className="font-bold text-slate-900">
                                    Reservation Summary
                                </h2>
                            </div>

                            <p className="mt-1 text-xs text-slate-500">
                                Review your selection before confirming.
                            </p>
                        </div>

                        <div className="p-5">
                            <BookingSummary
                                court={court}
                                date={date}
                                duration={duration}
                                slot={slot}
                                price={availability?.price}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />
                                Confirming Booking...
                            </>
                        ) : (
                            <>
                                <CalendarCheck2 size={18} />
                                Confirm Booking
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs leading-5 text-slate-500">
                        Please review your reservation details before confirming.
                    </p>
                </aside>
            </form>
        </div>
    );
}
