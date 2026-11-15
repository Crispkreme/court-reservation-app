import api from "./api";

export const USER_ROLES = {
    ADMIN: "admin",
    MEMBER: "member",
};

export const USER_STATUSES = {
    ACTIVE: "active",
    INACTIVE: "inactive",
};

export const getUsers = async (params = {}) => {
    const response = await api.get("/users", {
        params,
    });

    return response.data;
};

export const getUser = async (userId) => {
    const response = await api.get(`/users/${userId}`);

    return response.data;
};

export const createUser = async (data) => {
    const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        password: data.password,
        password_confirmation: data.password_confirmation,
    };

    const response = await api.post("/users", payload);

    return response.data;
};

export const updateUser = async (userId, data) => {
    const payload = {};

    if (data.name !== undefined) {
        payload.name = data.name;
    }

    if (data.email !== undefined) {
        payload.email = data.email;
    }

    if (data.phone !== undefined) {
        payload.phone = data.phone || null;
    }

    // Only send password when provided.
    if (data.password) {
        payload.password = data.password;
        payload.password_confirmation =data.password_confirmation;
    }

    const response = await api.put(
        `/users/${userId}`,
        payload
    );

    return response.data;
};

export const deleteUser = async (userId) => {
    const response = await api.delete(`/users/${userId}`);

    return response.data;
};

export const updateUserRole = async (userId, role) => {
    if (!Object.values(USER_ROLES).includes(role)) {
        throw new Error("Invalid user role.");
    }

    const response = await api.patch(
        `/users/${userId}/role`,
        { role }
    );

    return response.data;
};

export const updateUserStatus = async (userId, status) => {
    if (!Object.values(USER_STATUSES).includes(status)) {
        throw new Error("Invalid user status.");
    }

    const response = await api.patch(
        `/users/${userId}/status`,
        { status }
    );

    return response.data;
};

export const getUserStats = async () => {
    const response = await getUsers();
    const users = response.data || [];

    return {
        total: users.length,
        admins: users.filter((user) => user.role === USER_ROLES.ADMIN).length,
        members: users.filter((user) => user.role === USER_ROLES.MEMBER).length,
        active: users.filter((user) => user.status === USER_STATUSES.ACTIVE).length,
        inactive: users.filter((user) => user.status === USER_STATUSES.INACTIVE).length,
    };
};
