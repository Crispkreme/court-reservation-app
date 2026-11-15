import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ allowedRole }) {
    const { user, isAuthenticated, authLoading } = useAuth();
    const location = useLocation();

    // Wait until authentication initialization is complete.
    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-red-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-200 border-t-red-700" />

                    <div className="text-center">
                        <h2 className="text-lg font-bold text-red-800">
                            CourtBook
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Verifying authentication...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // User is not authenticated or account is inactive.
    if (!isAuthenticated ||!user ||user.status !== "active") {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        );
    }

    const role = user.role?.toLowerCase();

    if (allowedRole &&role !== allowedRole.toLowerCase()) {
        const redirectPath =
            role === "admin"
                ? "/admin/dashboard"
                : role === "member"
                ? "/member/dashboard"
                : "/login";

        return <Navigate to={redirectPath} replace />;
    }

    return <Outlet />;
}
