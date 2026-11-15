
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

        } catch (error) {
            console.error("Logout API failed:", error);

        } finally {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");

            // Reset authentication state
            setUser(null);
            setToken(null);
        }
    };

    // Authentication status
    const isAuthenticated = !!token && !!user;

    // Role disabled - application does not use roles
    const role = user?.role?.toLowerCase() || null;
    const department = user?.department ?? null;
    const position = user?.position ?? null;
    const status = user?.status ?? null;

    // Role checking disabled
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
                position,
                status,
                department,
                isAdmin,
                isMember,
                hasRole,
                authLoading,
                isAuthenticated,
                login,
                register,
                logout,
                refreshUser,
                syncAuth,
                setUser,
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
