import axios from "axios";
import toast from "react-hot-toast";

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

// Log API URL for debugging
// Log API URL for debugging (Removed for production)
// console.debug(`🔌 API Client Initialized with baseURL: ${baseURL}`);


interface StoredAuth {
  token: string;
  refreshToken: string;
  role: string;
  tenantId: string | null;
  tenantType: "MUSEUM" | "PRODUCER" | null;
  email: string | null;
  name: string | null;
}

// Global Error Handler for API & Token Refresh Logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se erro for 401 e ainda não tentamos retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const raw = window.localStorage.getItem("museus_auth_v1");
        if (!raw) throw new Error("No token stored");

        const stored = JSON.parse(raw) as StoredAuth;
        const refreshToken = stored.refreshToken;

        if (!refreshToken) throw new Error("No refresh token");

        // Tentar renovar token (usar axios limpo para evitar loop)
        const response = await axios.post(baseURL + "/auth/refresh", { refreshToken });

        if (response.status === 200) {
          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // Atualizar Storage
          const updatedStorage: StoredAuth = {
            ...stored,
            token: accessToken,
            refreshToken: newRefreshToken
          };
          window.localStorage.setItem("museus_auth_v1", JSON.stringify(updatedStorage));

          // Atualizar Header da requisição original
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Re-executar requisição original
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Session expired or refresh failed", refreshError);
        // Logout forçado
        window.localStorage.removeItem("museus_auth_v1");
        // Opcional: Redirecionar para login
        window.location.href = "/login";
      }
    }

    console.error("❌ API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Show user-friendly toast for API errors
    const errorMessage = error.response?.data?.message || error.message || "Erro de conexão";
    const status = error.response?.status;

    // Don't show toast for 401 (handled by refresh) or network errors during page load
    if (status !== 401 && error.config?.url) {
      toast.error(errorMessage, { id: `api-error-${status}` });
    }

    return Promise.reject(error);
  }
);
