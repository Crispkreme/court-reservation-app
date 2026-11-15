
import api from "./api";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const USER_ROLES = {
    ADMIN: "admin",
    MEMBER: "member",
};

export const USER_STATUSES = {
    ACTIVE: "active",
    INACTIVE: "inactive",
};

const storeAuth = (data) => {
    if (!data?.token || !data?.user) {
        throw new Error(
            "Invalid authentication response from server."
        );
    }

    const user = data.user;

    if (user.status !== USER_STATUSES.ACTIVE) {
        throw new Error("This account is not active.");
    }

    if (
        user.role !== USER_ROLES.ADMIN &&
        user.role !== USER_ROLES.MEMBER
    ) {
        throw new Error("Invalid user role.");
    }

    localStorage.setItem(TOKEN_KEY, data.token);

    localStorage.setItem(
        USER_KEY,
        JSON.stringify(user)
    );

    return user;
};

export const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

export const login = async (credentials) => {
    const response = await api.post("/auth/login", {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
    });

    return storeAuth(response.data);
};

export const register = async (data) => {
    const payload = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        password: data.password,
        password_confirmation: data.password_confirmation,
    };

    const response = await api.post(
        "/auth/register",
        payload
    );

    return response.data;
};

export const logout = async () => {
    try {
        if (localStorage.getItem(TOKEN_KEY)) {
            await api.post("/auth/logout");
        }
    } finally {
        clearAuth();
    }
};

export const getCurrentUser = async () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
        clearAuth();
        return null;
    }

    try {
        const response = await api.get("/auth/user");

        const user = response.data?.user;

        if (
            !user ||
            user.status !== USER_STATUSES.ACTIVE ||
            !Object.values(USER_ROLES).includes(user.role)
        ) {
            clearAuth();
            return null;
        }

        localStorage.setItem(
            USER_KEY,
            JSON.stringify(user)
        );

        return user;
    } catch (error) {
        if ([401, 403].includes(error.response?.status)) {
            clearAuth();
        }

        throw error;
    }
};

export const getStoredUser = () => {
    const user = localStorage.getItem(USER_KEY);

    if (!user) return null;

    try {
        const parsed = JSON.parse(user);

        if (
            !parsed ||
            typeof parsed !== "object" ||
            Array.isArray(parsed)
        ) {
            localStorage.removeItem(USER_KEY);
            return null;
        }

        return parsed;
    } catch {
        localStorage.removeItem(USER_KEY);
        return null;
    }
};

export const getAuthToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

export const getUserRole = () => {
    return getStoredUser()?.role ?? null;
};

export const getUserStatus = () => {
    return getStoredUser()?.status ?? null;
};

export const isActiveUser = () => {
    return (
        getUserStatus() === USER_STATUSES.ACTIVE
    );
};

export const isAdmin = () => {
    return (
        isAuthenticated() &&
        isActiveUser() &&
        getUserRole() === USER_ROLES.ADMIN
    );
};

export const isMember = () => {
    return (
        isAuthenticated() &&
        isActiveUser() &&
        getUserRole() === USER_ROLES.MEMBER
    );
};

export const isAuthenticated = () => {
    return Boolean(getAuthToken());
};

export const getDashboardRoute = (user = getStoredUser()) => {
    if (!user || user.status !== USER_STATUSES.ACTIVE) {
        return "/login";
    }

    switch (user.role) {
        case USER_ROLES.ADMIN:
            return "/admin/dashboard";

        case USER_ROLES.MEMBER:
            return "/member/dashboard";

        default:
            return "/login";
    }
};
