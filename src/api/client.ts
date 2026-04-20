import axios from "axios";
import axiosRetry from "axios-retry";
import toast from "react-hot-toast";

export const baseURL = import.meta.env.VITE_API_URL as string;

if (!baseURL) {
  console.error("❌ CRITICAL: VITE_API_URL is not defined in environment variables!");
}

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 20000,
});

// ─── Retry exponencial ─────────────────────────────────────────────
// Tenta até 3x com delay crescente (1s → 2s → 4s)
// Apenas para erros de rede e 5xx. Nunca para 4xx.
axiosRetry(api, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    const status = error.response?.status;
    // Nunca retry para erros do cliente (4xx)
    if (status !== undefined && status >= 400 && status < 500) return false;
    return axiosRetry.isNetworkOrIdempotentRequestError(error);
  },
  onRetry: (retryCount, error) => {
    console.warn(`[API] Retry ${retryCount}/3 — ${error.config?.url} (${error.message})`);
  },
});

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

// Automatically attached cookies will be sent due to withCredentials: true.
// We no longer read tokens from localStorage for security reasons.
// Attached Bearer token from localStorage for reliability across domains.
api.interceptors.request.use((config) => {
  try {
    const raw = window.localStorage.getItem("museus_auth_v1");
    if (raw) {
      const stored = JSON.parse(raw);
      if (stored.token) {
        config.headers.Authorization = `Bearer ${stored.token}`;
      }
    }
  } catch (e) {
    // Fail silently on storage errors
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

// Variables for Refresh Token Race Condition Fix
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Helper to push requests to queue while refreshing
const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

// Helper to resolve all pending requests
const onRerefreshed = (token: string) => {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
};

// Global Error Handler for API & Token Refresh Logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se erro for 401 e ainda não tentamos retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request until refresh is done
        return new Promise(resolve => {
          subscribeTokenRefresh((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

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

          // Resume blocked requests
          isRefreshing = false;
          onRerefreshed(accessToken);

          // Atualizar Header da requisição original
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Re-executar requisição original
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Session expired or refresh failed", refreshError);
        isRefreshing = false;
        refreshSubscribers = []; // clear queue
        
        // Remove potentially invalid token
        window.localStorage.removeItem("museus_auth_v1");

        // 🛑 BREAK LOOP: Só redireciona se não estivermos já em uma rota pública
        const publicRoutes = ["/login", "/welcome", "/register", "/", "/select-museum"];
        const currentPath = window.location.pathname;
        
        const isPublicRoute = publicRoutes.includes(currentPath) || currentPath.startsWith("/verify/") || currentPath.startsWith("/p/");

        if (!isPublicRoute && !originalRequest.url?.includes("/auth/me")) {
          console.warn("[API] Redirecting to login to clear session loop.");
          window.location.href = "/login";
        }
        
        return Promise.reject(refreshError);
      }
    }

    console.error("❌ API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message
      // Data removed from logs to avoid sensitive leakage
    });

    // Show user-friendly toast for API errors
    const errorMessage = error.response?.data?.message || error.message || "Erro de conexão";
    const status = error.response?.status;

    // Don't show toast for 401 (handled by refresh) or network errors during page load
    // For 5xx errors, only show toast if it's not a generic background retry
    if (status !== 401 && error.config?.url) {
      if (status >= 500 && status < 600) {
        console.error(`[API] Server error (5xx) on ${error.config.url}. Check backend logs.`);
      } else {
        toast.error(errorMessage, { id: `api-error-${status}` });
      }
    }

    return Promise.reject(error);
  }
);
