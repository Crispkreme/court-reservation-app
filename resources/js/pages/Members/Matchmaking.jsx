import { useEffect, useState } from "react";
import { Users, CalendarDays, Clock3, MapPin, Search, UserPlus, X, CheckCircle2, AlertCircle } from "lucide-react";
import Layout from "../../components/layout/Layout";

const initialForm = {
    booking_id: "",
    sport_category_id: "",
    preferred_date: "",
    preferred_start_time: "",
    preferred_end_time: "",
    required_players: 1,
    skill_level: "any",
    location: "",
    notes: "",
};

export default function Matchmaking() {
    const [requests, setRequests] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [sports, setSports] = useState([]);
    const [players, setPlayers] = useState([]);

    const [form, setForm] = useState(initialForm);

    const [selectedRequest, setSelectedRequest] =
        useState(null);

    const [selectedPlayers, setSelectedPlayers] =
        useState([]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        loadRequests();
        loadBookings();
        loadSports();
    }, []);

    async function loadRequests() {
        try {
            const response = await fetch(
                "/api/v1/matchmaking"
            );

            const result = await response.json();

            if (result.success) {
                setRequests(result.data);
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function loadBookings() {
        try {
            const response = await fetch(
                "/api/v1/bookings"
            );

            const result = await response.json();

            if (result.success) {
                setBookings(
                    result.data?.data ??
                    result.data ??
                    []
                );
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function loadSports() {
        try {
            const response = await fetch(
                "/api/v1/sport-categories"
            );

            const result = await response.json();

            if (result.success) {
                setSports(result.data);
            }
        } catch (err) {
            console.error(err);
        }
    }

    function updateField(name, value) {
        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    function handleBookingChange(bookingId) {
        const booking = bookings.find(
            (item) =>
                Number(item.id) === Number(bookingId)
        );

        setForm((current) => ({
            ...current,
            booking_id: bookingId,
            sport_category_id:
                booking?.sport_category_id ?? "",
            preferred_date:
                booking?.booking_date ?? "",
            preferred_start_time:
                booking?.start_time?.slice(0, 5) ?? "",
            preferred_end_time:
                booking?.end_time?.slice(0, 5) ?? "",
        }));
    }

    async function createRequest(event) {
        event.preventDefault();

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch(
                "/api/v1/matchmaking",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify(form),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Unable to create matchmaking request."
                );
            }

            setMessage(
                "Matchmaking request created successfully."
            );

            setForm(initialForm);

            await loadRequests();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function findPlayers(request) {
        setSelectedRequest(request);
        setSelectedPlayers([]);
        setError("");
        setMessage("");

        try {
            const response = await fetch(
                `/api/v1/matchmaking/${request.id}/compatible-players`
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Unable to find compatible players."
                );
            }

            setPlayers(result.data ?? []);
        } catch (err) {
            setError(err.message);
        }
    }

    function togglePlayer(playerId) {
        setSelectedPlayers((current) => {
            if (current.includes(playerId)) {
                return current.filter(
                    (id) => id !== playerId
                );
            }

            return [...current, playerId];
        });
    }

    async function sendInvitations() {
        if (!selectedRequest) {
            return;
        }

        if (selectedPlayers.length === 0) {
            setError(
                "Select at least one player."
            );
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(
                `/api/v1/matchmaking/${selectedRequest.id}/invite`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        player_ids:
                            selectedPlayers,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Unable to send invitations."
                );
            }

            setMessage(result.message);

            setSelectedPlayers([]);

            await loadRequests();
            await findPlayers(
                selectedRequest
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function closeRequest(request) {
        if (
            !window.confirm(
                "Close this matchmaking request?"
            )
        ) {
            return;
        }

        try {
            const response = await fetch(
                `/api/v1/matchmaking/${request.id}/close`,
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Unable to close request."
                );
            }

            setMessage(
                "Matchmaking request closed."
            );

            await loadRequests();

            if (
                selectedRequest?.id === request.id
            ) {
                setSelectedRequest(null);
                setPlayers([]);
            }
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <Layout>
        <div className="min-h-full space-y-6 bg-slate-50/60 p-4 sm:p-6 lg:p-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Match Making / Find a Player
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Find compatible players for an
                    existing court session.
                </p>
            </div>

            {message && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                    {message}
                </div>
            )}

            {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <form
                    onSubmit={createRequest}
                    className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                    <h2 className="text-lg font-semibold text-slate-900">
                        Find Additional Players
                    </h2>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Booking / Session
                        </label>

                        <select
                            value={form.booking_id}
                            onChange={(event) =>
                                handleBookingChange(
                                    event.target.value
                                )
                            }
                            required
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">
                                Select booking
                            </option>

                            {bookings.map((booking) => (
                                <option
                                    key={booking.id}
                                    value={booking.id}
                                >
                                    {booking.booking_reference}{" "}
                                    -{" "}
                                    {booking.booking_date}{" "}
                                    {booking.start_time}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Sport
                        </label>

                        <select
                            value={
                                form.sport_category_id
                            }
                            onChange={(event) =>
                                updateField(
                                    "sport_category_id",
                                    event.target.value
                                )
                            }
                            required
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">
                                Select sport
                            </option>

                            {sports.map((sport) => (
                                <option
                                    key={sport.id}
                                    value={sport.id}
                                >
                                    {sport.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Preferred Date
                            </label>

                            <input
                                type="date"
                                value={
                                    form.preferred_date
                                }
                                onChange={(event) =>
                                    updateField(
                                        "preferred_date",
                                        event.target.value
                                    )
                                }
                                required
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Required Players
                            </label>

                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={
                                    form.required_players
                                }
                                onChange={(event) =>
                                    updateField(
                                        "required_players",
                                        event.target.value
                                    )
                                }
                                required
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Start Time
                            </label>

                            <input
                                type="time"
                                value={
                                    form.preferred_start_time
                                }
                                onChange={(event) =>
                                    updateField(
                                        "preferred_start_time",
                                        event.target.value
                                    )
                                }
                                required
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                End Time
                            </label>

                            <input
                                type="time"
                                value={
                                    form.preferred_end_time
                                }
                                onChange={(event) =>
                                    updateField(
                                        "preferred_end_time",
                                        event.target.value
                                    )
                                }
                                required
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Skill Level
                        </label>

                        <select
                            value={form.skill_level}
                            onChange={(event) =>
                                updateField(
                                    "skill_level",
                                    event.target.value
                                )
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="any">
                                Any Skill Level
                            </option>

                            <option value="beginner">
                                Beginner
                            </option>

                            <option value="intermediate">
                                Intermediate
                            </option>

                            <option value="advanced">
                                Advanced
                            </option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Location
                        </label>

                        <input
                            type="text"
                            value={form.location}
                            onChange={(event) =>
                                updateField(
                                    "location",
                                    event.target.value
                                )
                            }
                            placeholder="Optional"
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Notes
                        </label>

                        <textarea
                            value={form.notes}
                            onChange={(event) =>
                                updateField(
                                    "notes",
                                    event.target.value
                                )
                            }
                            rows="3"
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading
                            ? "Creating..."
                            : "Create Matchmaking Request"}
                    </button>
                </form>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900">
                        Matchmaking Requests
                    </h2>

                    <div className="space-y-3">
                        {requests.length === 0 && (
                            <p className="text-slate-500">
                                No matchmaking requests found.
                            </p>
                        )}

                        {requests.map((request) => (
                            <div
                                key={request.id}
                                className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="font-semibold">
                                            {request.sport_category
                                                ?.name ??
                                                "Sport"}
                                        </p>

                                        <p className="text-sm text-slate-600">
                                            {
                                                request.preferred_date
                                            }{" "}
                                            •{" "}
                                            {
                                                request.preferred_start_time
                                            }{" "}
                                            -{" "}
                                            {
                                                request.preferred_end_time
                                            }
                                        </p>

                                        <p className="text-sm mt-1">
                                            Need{" "}
                                            <strong>
                                                {
                                                    request.required_players
                                                }
                                            </strong>{" "}
                                            player(s)
                                        </p>

                                        <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${String(request.status || "").toUpperCase() === "OPEN" ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200" : "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200"}`}>
                                            {request.status}
                                        </span>
                                    </div>

                                    {request.status ===
                                        "OPEN" && (
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    findPlayers(
                                                        request
                                                    )
                                                }
                                                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Find Players
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    closeRequest(
                                                        request
                                                    )
                                                }
                                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {selectedRequest && (
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                Compatible Players
                            </h2>

                            <p className="text-sm text-slate-600">
                                Select players to invite.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setSelectedRequest(
                                    null
                                );
                                setPlayers([]);
                                setSelectedPlayers([]);
                            }}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            Close
                        </button>
                    </div>

                    {players.length === 0 ? (
                        <p className="text-slate-500">
                            No compatible players found.
                        </p>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {players.map((player) => (
                                    <label
                                        key={player.id}
                                        className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${selectedPlayers.includes(player.id) ? "border-blue-300 bg-blue-50/60 ring-1 ring-blue-200" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedPlayers.includes(
                                                player.id
                                            )}
                                            onChange={() =>
                                                togglePlayer(
                                                    player.id
                                                )
                                            }
                                        />

                                        <div>
                                            <p className="font-medium">
                                                {
                                                    player.first_name
                                                }{" "}
                                                {
                                                    player.last_name
                                                }
                                            </p>

                                            {player.skill_level && (
                                                <p className="text-sm text-slate-600">
                                                    {
                                                        player.skill_level
                                                    }
                                                </p>
                                            )}

                                            {player.location && (
                                                <p className="text-sm text-slate-600">
                                                    {
                                                        player.location
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={
                                    sendInvitations
                                }
                                disabled={
                                    loading ||
                                    selectedPlayers.length ===
                                        0
                                }
                                className="mt-4 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Send Invitations (
                                {
                                    selectedPlayers.length
                                }
                                )
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    </Layout>
    );
}