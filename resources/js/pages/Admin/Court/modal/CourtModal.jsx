
import { useEffect, useState } from "react";
import { X, Loader2, Clock3, Sunrise, Sunset, Info, CalendarClock, Wallet } from "lucide-react";

import AlertMessage from "@components/AlertMessage";
import FormInput from "@components/common/FormInput";
import FormTextarea from "@components/common/FormTextarea";
import FormSelect from "@components/common/FormSelect";

import { createCourt, updateCourt } from "@services/courtService";
import { getSportCategories } from "@services/sportCategoryService";
import { TIME_ZONE, formatPrice, formatOperatingTime, getOperatingStatus, isValidTime, startUaeTimeUpdates, formatDuration } from "@utils/Index";
import { initialForm, typeOptions, bookingIntervalOptions, statusOptions } from "@data/init/court";

export default function CourtModal({
    isOpen,
    court = null,
    onClose,
    onSuccess,
}) {
    const [form, setForm] = useState(initialForm);
    const [sports, setSports] = useState([]);
    const [saving, setSaving] = useState(false);
    const [loadingSports, setLoadingSports] = useState(false);
    const [error, setError] = useState("");
    const [currentTime, setCurrentTime] = useState("");

    const isEditing = Boolean(court);

    useEffect(() => {
        if (!isOpen) return;

        setForm({
            sport_category_id: String(court?.sport_category_id ?? ""),
            name: court?.name ?? "",
            description: court?.description ?? "",
            location: court?.location ?? "",
            court_type: court?.court_type ?? "indoor",
            min_players: String(court?.min_players ?? 1),
            max_players: String(court?.max_players ?? 10),
            price_per_hour: String(court?.price_per_hour ?? ""),
            booking_interval_minutes: String(court?.booking_interval_minutes ?? 30),
            min_booking_minutes: String(court?.min_booking_minutes ?? 60),
            max_booking_minutes: String(court?.max_booking_minutes ?? 180),
            opening_time: String(court?.opening_time ?? "08:00").slice(0, 5),
            closing_time: String(court?.closing_time ?? "22:00").slice(0, 5),
            status: court?.status ?? "available",
        });

        setError("");

        let cancelled = false;

        const loadSports = async () => {
            try {
                setLoadingSports(true);

                const response = await getSportCategories();

                if (!cancelled) {
                    setSports(response.data ?? []);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load sport categories."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingSports(false);
                }
            }
        };

        loadSports();

        return () => {
            cancelled = true;
        };
    }, [isOpen, court]);

    useEffect(() => {
        if (!isOpen) return;

        return startUaeTimeUpdates(setCurrentTime);
    }, [isOpen]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleClose = () => {
        if (saving) return;
        onClose();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (saving) return;

        setError("");

        if (
            !form.name.trim() ||
            !form.location.trim() ||
            !form.sport_category_id
        ) {
            setError("Please complete all required fields.");
            return;
        }

        const minPlayers = Number(form.min_players);
        const maxPlayers = Number(form.max_players);

        if (
            form.min_players === "" ||
            !Number.isInteger(minPlayers) ||
            minPlayers < 1 ||
            minPlayers > 1000
        ) {
            setError("Minimum players must be between 1 and 1000.");
            return;
        }

        if (
            form.max_players === "" ||
            !Number.isInteger(maxPlayers) ||
            maxPlayers < 1 ||
            maxPlayers > 1000
        ) {
            setError("Maximum players must be between 1 and 1000.");
            return;
        }

        if (maxPlayers < minPlayers) {
            setError("Maximum players must be greater than or equal to minimum players.");
            return;
        }

        const price = Number(form.price_per_hour);

        if (
            form.price_per_hour === "" ||
            !Number.isFinite(price) ||
            price < 0 ||
            price > 99999999.99 ||
            !/^\d+(?:\.\d{1,2})?$/.test(form.price_per_hour)
        ) {
            setError("Please enter a valid hourly price.");
            return;
        }

        const intervalMinutes = Number(form.booking_interval_minutes);
        const minBookingMinutes = Number(form.min_booking_minutes);
        const maxBookingMinutes = Number(form.max_booking_minutes);

        if (![15, 30, 60].includes(intervalMinutes)) {
            setError("Booking interval must be 15, 30, or 60 minutes.");
            return;
        }

        if (
            form.min_booking_minutes === "" ||
            !Number.isInteger(minBookingMinutes) ||
            minBookingMinutes < 15 ||
            minBookingMinutes > 1440
        ) {
            setError("Minimum booking duration must be between 15 and 1440 minutes.");
            return;
        }

        if (
            form.max_booking_minutes === "" ||
            !Number.isInteger(maxBookingMinutes) ||
            maxBookingMinutes < minBookingMinutes ||
            maxBookingMinutes > 1440
        ) {
            setError("Maximum booking duration must be at least the minimum and no more than 1440 minutes.");
            return;
        }

        if (
            minBookingMinutes % intervalMinutes !== 0 ||
            maxBookingMinutes % intervalMinutes !== 0
        ) {
            setError("Minimum and maximum durations must be multiples of the booking interval.");
            return;
        }

        if (
            !isValidTime(form.opening_time) ||
            !isValidTime(form.closing_time)
        ) {
            setError("Please enter valid opening and closing times.");
            return;
        }

        if (form.closing_time <= form.opening_time) {
            setError("Closing time must be after opening time. Overnight hours are not supported yet.");
            return;
        }

        if (!statusOptions.some((option) => option.value === form.status)) {
            setError("Please select a valid court status.");
            return;
        }

        try {
            setSaving(true);

            const payload = {
                ...form,
                sport_category_id: Number(form.sport_category_id),
                name: form.name.trim(),
                location: form.location.trim(),
                description: form.description.trim() || null,
                min_players: minPlayers,
                max_players: maxPlayers,
                price_per_hour: price,
                booking_interval_minutes: intervalMinutes,
                min_booking_minutes: minBookingMinutes,
                max_booking_minutes: maxBookingMinutes,
            };

            if (isEditing) {
                await updateCourt(court.id, payload);
            } else {
                await createCourt(payload);
            }

            onClose();

            await onSuccess?.(
                isEditing
                    ? "Court updated successfully."
                    : "Court created successfully."
            );
        } catch (err) {
            const validation = err.response?.data?.errors;

            const firstError = validation
                ? Object.values(validation).flat()[0]
                : null;

            setError(
                firstError ||
                err.response?.data?.message ||
                "Unable to save court."
            );
        } finally {
            setSaving(false);
        }
    };

    const sportOptions = sports
        .filter(
            (sport) =>
                sport.status === "active" ||
                String(sport.id) === form.sport_category_id
        )
        .map((sport) => ({
            label: sport.name,
            value: String(sport.id),
        }));

    const operatingStatus = getOperatingStatus(
        form,
        currentTime
    );

    const intervalMinutes = Number(form.booking_interval_minutes);
    const minBookingMinutes = Number(form.min_booking_minutes);
    const maxBookingMinutes = Number(form.max_booking_minutes);
    const validBookingConfiguration =
        [15, 30, 60].includes(intervalMinutes) &&
        Number.isInteger(minBookingMinutes) &&
        Number.isInteger(maxBookingMinutes) &&
        minBookingMinutes >= 15 &&
        maxBookingMinutes >= minBookingMinutes &&
        maxBookingMinutes <= 1440 &&
        minBookingMinutes % intervalMinutes === 0 &&
        maxBookingMinutes % intervalMinutes === 0;

    const allowedDurations = validBookingConfiguration
        ? Array.from(
              { length: (maxBookingMinutes - minBookingMinutes) / intervalMinutes + 1 },
              (_, index) => minBookingMinutes + index * intervalMinutes
        ) : [];

    const hourlyRate = Number(form.price_per_hour);
    const validPrice =
        form.price_per_hour !== "" &&
        /^\d+(?:\.\d{1,2})?$/.test(form.price_per_hour) &&
        Number.isFinite(hourlyRate) &&
        hourlyRate <= 99999999.99;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="court-modal-title"
                className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                    <h2 id="court-modal-title" className="text-lg font-bold text-gray-900">
                        {isEditing ? "Edit Court" : "Add Court"}
                    </h2>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={saving}
                        aria-label="Close modal"
                        className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
                    {/* Error */}
                    {error && (
                        <AlertMessage
                            type="error"
                            message={error}
                            onClose={() => setError("")}
                        />
                    )}

                    {/* Court Name */}
                    <FormInput
                        label="Court Name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. Basketball Court 1"
                        maxLength={100}
                        required
                        disabled={saving}
                    />

                    {/* Sport Category */}
                    <FormSelect
                        label="Sport Category"
                        name="sport_category_id"
                        value={form.sport_category_id}
                        onChange={handleChange}
                        options={sportOptions}
                        placeholder="Select sport category"
                        required
                        disabled={saving || loadingSports}
                    />

                    {/* Description */}
                    <FormTextarea
                        label="Description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Court description..."
                        rows={3}
                        maxLength={1000}
                        disabled={saving}
                    />

                    {/* Location */}
                    <FormInput
                        label="Location"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="e.g. Building A"
                        required
                        disabled={saving}
                    />

                    {/* Court Type & Player Capacity */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormSelect
                            label="Court Type"
                            name="court_type"
                            value={form.court_type}
                            onChange={handleChange}
                            options={typeOptions}
                            placeholder=""
                            required
                            disabled={saving}
                        />

                        <FormSelect
                            label="Status"
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            options={statusOptions}
                            placeholder=""
                            required
                            disabled={saving}
                        />

                        <FormInput
                            label="Minimum Players"
                            name="min_players"
                            type="number"
                            min={1}
                            max={1000}
                            step={1}
                            value={form.min_players}
                            onChange={handleChange}
                            placeholder="e.g. 2"
                            required
                            disabled={saving}
                        />

                        <FormInput
                            label="Maximum Players"
                            name="max_players"
                            type="number"
                            min={1}
                            max={1000}
                            step={1}
                            value={form.max_players}
                            onChange={handleChange}
                            placeholder="e.g. 10"
                            required
                            disabled={saving}
                        />

                        <FormInput
                            label="Price per Hour (AED)"
                            name="price_per_hour"
                            type="number"
                            min={0}
                            step="0.01"
                            value={form.price_per_hour}
                            onChange={handleChange}
                            placeholder="e.g. 150.00"
                            required
                            disabled={saving}
                        />

                        <div />

                        {/* Opening Time */}
                        <FormInput
                            label="Opening Time"
                            name="opening_time"
                            type="time"
                            value={form.opening_time}
                            onChange={handleChange}
                            required
                            disabled={saving}
                        />

                        {/* Closing Time */}
                        <FormInput
                            label="Closing Time"
                            name="closing_time"
                            type="time"
                            value={form.closing_time}
                            onChange={handleChange}
                            required
                            disabled={saving}
                        />
                    </div>

                    {/* Booking Configuration */}
                    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-2">
                            <CalendarClock size={18} className="text-red-700" />
                            <h3 className="text-sm font-bold text-slate-900">
                                Booking Configuration
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <FormSelect
                                label="Booking Interval"
                                name="booking_interval_minutes"
                                value={form.booking_interval_minutes}
                                onChange={handleChange}
                                options={bookingIntervalOptions}
                                placeholder="Select interval"
                                required
                                disabled={saving}
                            />

                            <FormInput
                                label="Minimum Duration (min)"
                                name="min_booking_minutes"
                                type="text"
                                min={15}
                                max={1440}
                                step={intervalMinutes || 15}
                                value={form.min_booking_minutes}
                                onChange={handleChange}
                                placeholder="e.g. 60"
                                required
                                disabled={saving}
                            />

                            <FormInput
                                label="Maximum Duration (min)"
                                name="max_booking_minutes"
                                type="text"
                                min={15}
                                max={1440}
                                step={intervalMinutes || 15}
                                value={form.max_booking_minutes}
                                onChange={handleChange}
                                placeholder="e.g. 180"
                                required
                                disabled={saving}
                            />
                        </div>

                        <p className="text-xs text-slate-500">
                            Durations must be multiples of the selected interval.
                            Maximum duration cannot exceed 24 hours.
                        </p>

                        <div className="rounded-lg bg-white p-3">
                            <div className="mb-2 flex items-center gap-2">
                                <Wallet size={16} className="text-red-700" />
                                <h4 className="text-sm font-semibold text-slate-900">
                                    Court-Specific Pricing Preview
                                </h4>
                            </div>

                            {!validBookingConfiguration ? (
                                <p className="text-xs text-red-700">
                                    Enter a valid booking interval and duration range.
                                </p>
                            ) : !validPrice ? (
                                <p className="text-xs text-slate-500">
                                    Enter an hourly rate above to preview booking prices.
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {allowedDurations.map((minutes) => (
                                        <div
                                            key={minutes}
                                            className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2 text-xs"
                                        >
                                            <span className="text-slate-600">
                                                {formatDuration(minutes)}
                                            </span>
                                            <span className="font-semibold text-slate-900">
                                                AED {formatPrice(minutes)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Operating Hours Preview */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <Clock3
                                    size={18}
                                    className="text-red-700"
                                />

                                <h3 className="text-sm font-bold text-slate-900">
                                    Operating Hours Preview
                                </h3>
                            </div>

                            <span
                                className={`
                                    rounded-full px-3 py-1
                                    text-xs font-semibold
                                    ${operatingStatus.styles}
                                `}
                            >
                                {operatingStatus.label}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="flex items-center gap-3 rounded-lg bg-white p-3">
                                <Sunrise
                                    size={20}
                                    className="text-amber-600"
                                />

                                <div>
                                    <p className="text-xs text-slate-500">
                                        Opening Time
                                    </p>

                                    <p className="text-sm font-bold text-slate-900">
                                        {formatOperatingTime(
                                            form.opening_time
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-lg bg-white p-3">
                                <Sunset
                                    size={20}
                                    className="text-red-700"
                                />

                                <div>
                                    <p className="text-xs text-slate-500">
                                        Closing Time
                                    </p>

                                    <p className="text-sm font-bold text-slate-900">
                                        {formatOperatingTime(
                                            form.closing_time
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 flex items-start gap-2 text-xs text-slate-500">
                            <Info
                                size={14}
                                className="mt-0.5 shrink-0"
                            />

                            <p>
                                Operating hours use UAE time
                                (Asia/Dubai). Open Now is calculated
                                from the selected court status and
                                operating hours. Overnight hours
                                are not supported.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={saving}
                            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving || loadingSports}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
                        >
                            {saving && (
                                <Loader2
                                    size={16}
                                    className="animate-spin"
                                />
                            )}

                            {saving
                                ? "Saving..."
                                : isEditing
                                  ? "Save Changes"
                                  : "Create Court"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
