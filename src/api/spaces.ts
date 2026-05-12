import { api } from "./client";

export const spacesApi = {
    list: (params?: { equipamentoId?: string }) => api.get("/spaces", { params }),
    get: (id: string) => api.get(`/spaces/${id}`),
    create: (data: any) => api.post("/spaces", data),
    update: (id: string, data: any) => api.put(`/spaces/${id}`, data),
    delete: (id: string) => api.delete(`/spaces/${id}`),
};
