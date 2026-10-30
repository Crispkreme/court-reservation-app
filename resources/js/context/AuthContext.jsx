
import React, { createContext, useContext, useState, useEffect } from "react";
import {
    login as loginService,
    register as registerService,
    logout as logoutService,
    getCurrentUser,
    getStoredUser
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(() => getStoredUser());
    const [token, setToken] = useState(() => localStorage.getItem("auth_token"));
    const [authLoading, setAuthLoading] = useState(false);

    // Synchronize user and token with localStorage
    const syncAuth = () => {
        setUser(getStoredUser());
        setToken(localStorage.getItem("auth_token"));
    };

    // Global Login
    const login = async (credentials) => {
        const loggedInUser = await loginService(credentials);
        syncAuth();
        return loggedInUser;
    };

    // Global Register
    const register = async (data) => {
        const registeredUser = await registerService(data);
        syncAuth();
        return registeredUser;
    };

    // Refresh user information from backend
    const refreshUser = async () => {
        setAuthLoading(true);

        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            return currentUser;
        } finally {
            setAuthLoading(false);
        }
    };

    // Global Logout
    const logout = async () => {
        try {
            await logoutService();
        } finally {
            setUser(null);
            setToken(null);
        }
    };

    const isAuthenticated = !!token && !!user;
    const role = user?.role?.toLowerCase() || null;

    // Role checking
    const hasRole = (requiredRole) => {
        return role === requiredRole.toLowerCase();
    };

    const isAdmin = hasRole("admin");
    const isMember = hasRole("member");

    // Listen for localStorage changes from other tabs
    useEffect(() => {
        const handleStorage = (event) => {
            if (
                event.key === "auth_user" ||
                event.key === "auth_token"
            ) {
                syncAuth();
            }
        };

        window.addEventListener("storage", handleStorage);

        return () => {
            window.removeEventListener("storage", handleStorage);
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                role,
                authLoading,
                isAuthenticated,
                isAdmin,
                isMember,
                hasRole,
                login,
                register,
                logout,
                refreshUser,
                syncAuth,
                setUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Global authentication hook
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
};
