import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function PlayersShow() {
    const { id } = useParams();

    const [player, setPlayer] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPlayer = async () => {
            try {
                const response = await fetch(
                    `/api/v1/players/${id}`,
                    {
                        headers: {
                            Accept: "application/json",
                        },
                        credentials: "include",
                    }
                );

                const data = await response.json();

                setPlayer(data.player);

                setHistory(
                    data.booking_history?.data ??
                        data.booking_history ??
                        []
                );
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadPlayer();
    }, [id]);

    if (loading) {
        return (
            <div className="p-6 text-gray-500">
                Loading player...
            </div>
        );
    }

    if (!player) {
        return (
            <div className="p-6">
                Player not found.
            </div>
        );
    }

    return (
        <div className="p-6">
            <Link
                to="/players"
                className="text-sm text-gray-500 hover:text-black"
            >
                ← Players
            </Link>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="rounded-xl border bg-white p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-xl font-bold">
                            {player.first_name?.charAt(0)}
                            {player.last_name?.charAt(0)}
                        </div>

                        <div>
                            <h1 className="text-xl font-bold">
                                {player.full_name}
                            </h1>

                            <span className="text-sm capitalize text-gray-500">
                                {player.player_type} player
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 space-y-4 text-sm">
                        <div>
                            <span className="text-gray-500">
                                Email
                            </span>

                            <p>{player.email || "—"}</p>
                        </div>

                        <div>
                            <span className="text-gray-500">
                                Phone
                            </span>

                            <p>{player.phone || "—"}</p>
                        </div>

                        <div>
                            <span className="text-gray-500">
                                Status
                            </span>

                            <p>
                                {player.is_active
                                    ? "Active"
                                    : "Inactive"}
                            </p>
                        </div>
                    </div>

                    {player.member && (
                        <div className="mt-6 rounded-lg bg-gray-50 p-4">
                            <p className="text-xs text-gray-500">
                                Member
                            </p>

                            <p className="font-medium">
                                {player.member.full_name}
                            </p>

                            <p className="text-sm text-gray-500">
                                {player.member.member_number}
                            </p>

                            <Link
                                to={`/members/${player.member.id}`}
                                className="mt-2 inline-block text-sm underline"
                            >
                                View Member
                            </Link>
                        </div>
                    )}
                </div>

                <div className="rounded-xl border bg-white lg:col-span-2">
                    <div className="border-b p-6">
                        <h2 className="text-lg font-semibold">
                            Booking History
                        </h2>
                    </div>

                    {history.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No booking history.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left">
                                            Date
                                        </th>

                                        <th className="px-6 py-4 text-left">
                                            Court
                                        </th>

                                        <th className="px-6 py-4 text-left">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {history.map((booking) => (
                                        <tr
                                            key={booking.id}
                                            className="border-t"
                                        >
                                            <td className="px-6 py-4">
                                                {booking.booking_date
                                                    ? new Date(
                                                          booking.booking_date
                                                      ).toLocaleDateString()
                                                    : "—"}
                                            </td>

                                            <td className="px-6 py-4">
                                                {booking.court?.name ||
                                                    "—"}
                                            </td>

                                            <td className="px-6 py-4 capitalize">
                                                {booking.status ||
                                                    "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}