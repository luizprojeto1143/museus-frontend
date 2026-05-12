import { api } from "./client";

export const theaterApi = {
    getSessions: () => api.get("/theater/sessions"),
    getSessionSeats: (sessionId: string) => api.get(`/theater/sessions/${sessionId}/seats`),
    reserveSeats: (sessionId: string, seatIds: string[]) => 
        api.post(`/theater/sessions/${sessionId}/reserve`, { seatIds }),
    sellSeats: (sessionId: string, data: { seatIds: string[], paymentMethod: string, visitorId?: string }) => 
        api.post(`/theater/sessions/${sessionId}/sell`, data),
    getAnalytics: () => api.get("/theater/analytics"),
    // Cast & Crew
    getMembers: () => api.get("/theater/members"),
    saveMember: (data: any) => api.post("/theater/members", data),
    // Cues
    getCues: (sessionId: string) => api.get(`/theater/sessions/${sessionId}/cues`),
    saveCue: (sessionId: string, data: any) => api.post(`/theater/sessions/${sessionId}/cues`, data),
};
