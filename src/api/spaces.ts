import { api } from "./client";

export const spacesApi = {
    list: (params?: { equipamentoId?: string }) => api.get("/spaces", { params }),
    get: (id: string) => api.get(`/spaces/${id}`),
    create: (data: unknown) => api.post("/spaces", data),
    update: (id: string, data: unknown) => api.put(`/spaces/${id}`, data),
    delete: (id: string) => api.delete(`/spaces/${id}`),
};
