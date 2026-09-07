import api from "./api";
export const getUser = id => api.get(`/users/${id}`);
export const updateProfile = payload => api.put("/users/profile", payload);
