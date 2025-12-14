import axios from "axios";

const baseURL = (import.meta.env.VITE_API_URL as string | undefined) || "https://museus-backend.onrender.com";

export const api = axios.create({
  baseURL,
  withCredentials: false
});

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

// Anexa automaticamente o token JWT (quando existir) em todas as requisições.
api.interceptors.request.use((config) => {
  try {
    const raw = window.localStorage.getItem("museus_auth_v1");
    if (raw) {
      const parsed = JSON.parse(raw) as { token?: string };
      if (parsed.token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
  } catch {
    // ignora erro de leitura do storage
  }
  return config;
});
