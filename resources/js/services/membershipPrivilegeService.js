import api from "./api";

export const getMembershipTypesForPrivileges = () => api.get("/membership-privileges-membership-types");
export const getMembershipPrivileges = () => api.get("/membership-privileges");
export const createMembershipPrivilege = (data) => api.post("/membership-privileges", data);
export const updateMembershipPrivilege = (id, data) => api.put(`/membership-privileges/${id}`, data);
export const deleteMembershipPrivilege = (id) => api.delete(`/membership-privileges/${id}`)