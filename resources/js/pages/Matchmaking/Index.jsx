import { useEffect, useState } from "react";

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
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">
                    Match Making / Find a Player
                </h1>

                <p className="text-gray-600 mt-1">
                    Find compatible players for an
                    existing court session.
                </p>
            </div>

            {message && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
                    {message}
                </div>
            )}

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <form
                    onSubmit={createRequest}
                    className="rounded-xl border bg-white p-6 shadow-sm space-y-4"
                >
                    <h2 className="text-lg font-semibold">
                        Find Additional Players
                    </h2>

                    <div>
                        <label className="block text-sm font-medium mb-1">
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
                            className="w-full rounded-lg border px-3 py-2"
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
                        <label className="block text-sm font-medium mb-1">
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
                            className="w-full rounded-lg border px-3 py-2"
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
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
                                className="w-full rounded-lg border px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
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
                                className="w-full rounded-lg border px-3 py-2"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
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
                                className="w-full rounded-lg border px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
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
                                className="w-full rounded-lg border px-3 py-2"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
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
                            className="w-full rounded-lg border px-3 py-2"
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
                        <label className="block text-sm font-medium mb-1">
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
                            className="w-full rounded-lg border px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
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
                            className="w-full rounded-lg border px-3 py-2"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
                    >
                        {loading
                            ? "Creating..."
                            : "Create Matchmaking Request"}
                    </button>
                </form>

                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">
                        Matchmaking Requests
                    </h2>

                    <div className="space-y-3">
                        {requests.length === 0 && (
                            <p className="text-gray-500">
                                No matchmaking requests found.
                            </p>
                        )}

                        {requests.map((request) => (
                            <div
                                key={request.id}
                                className="rounded-lg border p-4"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="font-semibold">
                                            {request.sport_category
                                                ?.name ??
                                                "Sport"}
                                        </p>

                                        <p className="text-sm text-gray-600">
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

                                        <span className="inline-block mt-2 rounded-full bg-gray-100 px-2 py-1 text-xs">
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
                                                className="rounded-lg bg-black px-3 py-2 text-sm text-white"
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
                                                className="rounded-lg border px-3 py-2 text-sm"
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
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Compatible Players
                            </h2>

                            <p className="text-sm text-gray-600">
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
                            className="rounded-lg border px-3 py-2 text-sm"
                        >
                            Close
                        </button>
                    </div>

                    {players.length === 0 ? (
                        <p className="text-gray-500">
                            No compatible players found.
                        </p>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {players.map((player) => (
                                    <label
                                        key={player.id}
                                        className="flex cursor-pointer gap-3 rounded-lg border p-4"
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
                                                <p className="text-sm text-gray-600">
                                                    {
                                                        player.skill_level
                                                    }
                                                </p>
                                            )}

                                            {player.location && (
                                                <p className="text-sm text-gray-600">
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
                                className="mt-4 rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
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
    );
}