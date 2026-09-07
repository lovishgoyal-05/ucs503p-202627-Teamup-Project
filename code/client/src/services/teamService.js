import api from "./api";
export const createTeam = payload => api.post("/teams", payload);
export const getMyTeams = () => api.get("/teams/my");
export const getTeam = id => api.get(`/teams/${id}`);
export const requestToJoin = id => api.post(`/teams/${id}/request`);
export const updateRequest = (requestId, status) =>
  api.put(`/teams/requests/${requestId}`, { status });
