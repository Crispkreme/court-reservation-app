import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function PlayersIndex() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [type, setType] = useState("");

    const loadPlayers = async () => {
        setLoading(true);

        try {
            const params = new URLSearchParams();

            if (search) {
                params.append("search", search);
            }

            if (type) {
                params.append("type", type);
            }

            const response = await fetch(
                `/api/v1/players?${params.toString()}`,
                {
                    headers: {
                        Accept: "application/json",
                    },
                    credentials: "include",
                }
            );

            const data = await response.json();

            setPlayers(data.data ?? []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(loadPlayers, 300);

        return () => clearTimeout(timer);
    }, [search, type]);

    return (
        <div className="p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">
                        Players
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage members and guest players.
                    </p>
                </div>

                <Link
                    to="/players/create"
                    className="rounded-lg bg-black px-4 py-2 text-center text-sm text-white"
                >
                    + Add Guest Player
                </Link>
            </div>

            <div className="mb-6 grid gap-3 md:grid-cols-2">
                <input
                    type="text"
                    placeholder="Search players..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="rounded-lg border px-4 py-2"
                />

                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="rounded-lg border px-4 py-2"
                >
                    <option value="">All players</option>
                    <option value="member">Members</option>
                    <option value="guest">Guests</option>
                </select>
            </div>

            <div className="overflow-hidden rounded-xl border bg-white">
                {loading ? (
                    <div className="p-10 text-center text-gray-500">
                        Loading players...
                    </div>
                ) : players.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No players found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left">
                                        Player
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Type
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Member No.
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Contact
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Status
                                    </th>

                                    <th className="px-6 py-4 text-right">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {players.map((player) => (
                                    <tr
                                        key={player.id}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-medium">
                                                {player.full_name}
                                            </div>

                                            {player.email && (
                                                <div className="text-xs text-gray-500">
                                                    {player.email}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                    player.player_type ===
                                                    "member"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {player.player_type}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            {player.member
                                                ?.member_number ||
                                                "—"}
                                        </td>

                                        <td className="px-6 py-4">
                                            {player.phone || "—"}
                                        </td>

                                        <td className="px-6 py-4">
                                            {player.is_active
                                                ? "Active"
                                                : "Inactive"}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                to={`/players/${player.id}`}
                                                className="font-medium hover:underline"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}