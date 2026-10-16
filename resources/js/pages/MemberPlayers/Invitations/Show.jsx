import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function InvitationsShow() {
    const { token } = useParams();

    const [invitation, setInvitation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [responding, setResponding] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const loadInvitation = async () => {
            try {
                /*
                 * This requires a GET endpoint:
                 * GET /api/v1/player-invitations/{token}
                 */
                const response = await fetch(
                    `/api/v1/player-invitations/${token}`,
                    {
                        headers: {
                            Accept: "application/json",
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Invitation not found."
                    );
                }

                setInvitation(data.invitation);
            } catch (error) {
                setMessage(error.message);
            } finally {
                setLoading(false);
            }
        };

        loadInvitation();
    }, [token]);

    const respond = async (status) => {
        setResponding(true);
        setMessage("");

        try {
            const response = await fetch(
                `/api/v1/player-invitations/${token}/respond`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        status,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Unable to respond to invitation."
                );
            }

            setMessage(data.message);
            setInvitation((current) => ({
                ...current,
                status,
            }));
        } catch (error) {
            setMessage(error.message);
        } finally {
            setResponding(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Loading invitation...
            </div>
        );
    }

    if (!invitation) {
        return (
            <div className="flex min-h-screen items-center justify-center p-6">
                <div className="rounded-xl border bg-white p-8 text-center">
                    <h1 className="text-xl font-bold">
                        Invitation unavailable
                    </h1>

                    <p className="mt-2 text-gray-500">
                        {message}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-lg rounded-xl border bg-white p-8">
                <h1 className="text-2xl font-bold">
                    Player Invitation
                </h1>

                <p className="mt-2 text-gray-500">
                    You have been invited to participate in a
                    court booking.
                </p>

                <div className="my-6 rounded-lg bg-gray-50 p-5">
                    <div>
                        <span className="text-sm text-gray-500">
                            Player
                        </span>

                        <p className="font-medium">
                            {invitation.name}
                        </p>
                    </div>

                    <div className="mt-4">
                        <span className="text-sm text-gray-500">
                            Booking
                        </span>

                        <p className="font-medium">
                            Booking #{invitation.booking_id}
                        </p>
                    </div>

                    <div className="mt-4">
                        <span className="text-sm text-gray-500">
                            Status
                        </span>

                        <p className="mt-1 capitalize">
                            {invitation.status}
                        </p>
                    </div>
                </div>

                {message && (
                    <div className="mb-5 rounded-lg bg-gray-100 p-4 text-sm">
                        {message}
                    </div>
                )}

                {invitation.status === "pending" && (
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => respond("declined")}
                            disabled={responding}
                            className="rounded-lg border px-4 py-3 font-medium"
                        >
                            Decline
                        </button>

                        <button
                            onClick={() => respond("accepted")}
                            disabled={responding}
                            className="rounded-lg bg-black px-4 py-3 font-medium text-white"
                        >
                            Accept
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}