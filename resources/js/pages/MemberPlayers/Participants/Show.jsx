import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import TableHead from '../../../components/table/TableHead';
import { getBooking, getPlayers, addBookingPlayer, removeBookingPlayer, createBookingPlayerInvitation} from '../../../services/bookingService'

export default function ParticipantsShow() {
    const { id } = useParams();

    const [booking, setBooking] = useState(null);
    const [players, setPlayers] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [showInvite, setShowInvite] = useState(false);

    const [selectedPlayer, setSelectedPlayer] = useState("");
    const [guestName, setGuestName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");

    const loadData = async () => {
        try {
            const [bookingResponse, playersResponse] = await Promise.all([
                getBooking(id),
                getPlayers(),
            ]);

            setBooking(
                bookingResponse.data.booking ?? bookingResponse.data
            );

            setPlayers(playersResponse.data.data ?? []);
        } catch (error) {
            console.error(
                "Failed to load booking data:",
                error.response?.data?.message || error.message
            );
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const participants =
        booking?.booking_players ??
        booking?.players ??
        [];

    const capacity = booking?.court?.capacity ?? 0;
    const remaining = Math.max(
        capacity - participants.length,
        0
    );

    const addPlayer = async () => {
        if (!selectedPlayer) return;

        try {
            await addBookingPlayer(id, {
                player_id: selectedPlayer,
                participant_status: "confirmed",
            });

            setSelectedPlayer("");
            setShowAdd(false);

            await loadData();
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Unable to add player."
            );
        }
    };
    const invitePlayer = async () => {
        if (!guestName) return;

        try {
            await createBookingPlayerInvitation(id, {
                name: guestName,
                email: guestEmail || null,
            });

            setGuestName("");
            setGuestEmail("");
            setShowInvite(false);

            await loadData();

            alert("Invitation created successfully.");
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Unable to create invitation."
            );
        }
    };
    const removePlayer = async (participantId) => {
        if (!window.confirm("Remove this player from the booking?")) {
            return;
        }

        try {
            await removeBookingPlayer(id, participantId);

            await loadData();
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Unable to remove player."
            );
        }
    };

    if (!booking) {
        return (
            <div className="p-6">
                Loading booking...
            </div>
        );
    }

    return (
        <div className="p-6">
            <Link
                to="/bookings"
                className="text-sm text-gray-500 hover:text-black"
            >
                ← Bookings
            </Link>

            <div className="mb-6 mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">
                        Booking Participants
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage players participating in this
                        booking.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setShowInvite(true)}
                        disabled={remaining === 0}
                        className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
                    >
                        Invite Player
                    </button>

                    <button
                        onClick={() => setShowAdd(true)}
                        disabled={remaining === 0}
                        className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                    >
                        Add Player
                    </button>
                </div>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border bg-white p-5">
                    <p className="text-sm text-gray-500">
                        Court
                    </p>

                    <p className="mt-1 text-lg font-semibold">
                        {booking.court?.name || "—"}
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-5">
                    <p className="text-sm text-gray-500">
                        Capacity
                    </p>

                    <p className="mt-1 text-lg font-semibold">
                        {participants.length} / {capacity}
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-5">
                    <p className="text-sm text-gray-500">
                        Remaining
                    </p>

                    <p className="mt-1 text-lg font-semibold">
                        {remaining}
                    </p>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border bg-white">
                <div className="border-b p-6">
                    <h2 className="text-lg font-semibold">
                        Participants
                    </h2>
                </div>

                {participants.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No participants yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <TableHead
                                columns={[
                                    "Player",
                                    "Type",
                                    "Status",
                                    { label: "Action", align: "right" },
                                ]}
                            />
                            <tbody>
                                {participants.map(
                                    (participant) => {
                                        const player =
                                            participant.player ??
                                            participant;

                                        return (
                                            <tr
                                                key={
                                                    participant.id
                                                }
                                                className="border-t"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="font-medium">
                                                        {
                                                            player.full_name
                                                        }
                                                    </div>

                                                    <div className="text-xs text-gray-500">
                                                        {
                                                            player.email
                                                        }
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 capitalize">
                                                    {
                                                        player.player_type
                                                    }
                                                </td>

                                                <td className="px-6 py-4 capitalize">
                                                    {participant.participant_status ||
                                                        "confirmed"}
                                                </td>

                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() =>
                                                            removePlayer(
                                                                participant.id
                                                            )
                                                        }
                                                        className="text-red-600 hover:underline"
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showAdd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6">
                        <h2 className="text-lg font-semibold">
                            Add Player
                        </h2>

                        <select
                            value={selectedPlayer}
                            onChange={(e) =>
                                setSelectedPlayer(
                                    e.target.value
                                )
                            }
                            className="mt-4 w-full rounded-lg border px-4 py-2"
                        >
                            <option value="">
                                Select player
                            </option>

                            {players
                                .filter(
                                    (player) =>
                                        player.is_active
                                )
                                .map((player) => (
                                    <option
                                        key={player.id}
                                        value={player.id}
                                    >
                                        {player.full_name} (
                                        {
                                            player.player_type
                                        }
                                        )
                                    </option>
                                ))}
                        </select>

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                onClick={() =>
                                    setShowAdd(false)
                                }
                                className="rounded-lg border px-4 py-2"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={addPlayer}
                                className="rounded-lg bg-black px-4 py-2 text-white"
                            >
                                Add Player
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showInvite && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6">
                        <h2 className="text-lg font-semibold">
                            Invite Player
                        </h2>

                        <input
                            value={guestName}
                            onChange={(e) =>
                                setGuestName(e.target.value)
                            }
                            placeholder="Player name"
                            className="mt-4 w-full rounded-lg border px-4 py-2"
                        />

                        <input
                            type="email"
                            value={guestEmail}
                            onChange={(e) =>
                                setGuestEmail(e.target.value)
                            }
                            placeholder="Email address"
                            className="mt-3 w-full rounded-lg border px-4 py-2"
                        />

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                onClick={() =>
                                    setShowInvite(false)
                                }
                                className="rounded-lg border px-4 py-2"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={invitePlayer}
                                className="rounded-lg bg-black px-4 py-2 text-white"
                            >
                                Send Invitation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}