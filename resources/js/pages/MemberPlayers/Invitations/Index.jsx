import { useEffect, useState } from "react";

export default function InvitationsIndex() {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInvitations = async () => {
            try {
                /*
                 * This endpoint should return:
                 * GET /api/v1/player-invitations
                 */
                const response = await fetch(
                    "/api/v1/player-invitations",
                    {
                        headers: {
                            Accept: "application/json",
                        },
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Failed to load invitations."
                    );
                }

                const data = await response.json();

                setInvitations(data.data ?? data.invitations ?? []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadInvitations();
    }, []);

    const statusClass = (status) => {
        switch (status) {
            case "accepted":
                return "bg-green-100 text-green-700";

            case "declined":
                return "bg-red-100 text-red-700";

            case "pending":
                return "bg-yellow-100 text-yellow-700";

            case "expired":
                return "bg-gray-100 text-gray-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">
                    Player Invitations
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Track invitations sent to players.
                </p>
            </div>

            <div className="overflow-hidden rounded-xl border bg-white">
                {loading ? (
                    <div className="p-10 text-center text-gray-500">
                        Loading invitations...
                    </div>
                ) : invitations.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No invitations found.
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
                                        Email
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Booking
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Status
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Expires
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {invitations.map((invitation) => (
                                    <tr
                                        key={invitation.id}
                                        className="border-t"
                                    >
                                        <td className="px-6 py-4">
                                            {invitation.name}
                                        </td>

                                        <td className="px-6 py-4">
                                            {invitation.email ||
                                                "—"}
                                        </td>

                                        <td className="px-6 py-4">
                                            #
                                            {invitation.booking_id}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass(
                                                    invitation.status
                                                )}`}
                                            >
                                                {
                                                    invitation.status
                                                }
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            {invitation.expires_at
                                                ? new Date(
                                                      invitation.expires_at
                                                  ).toLocaleString()
                                                : "—"}
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