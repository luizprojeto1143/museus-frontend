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

// C1: Auth is handled exclusively via httpOnly cookies (set by the backend).
// withCredentials:true ensures they are sent on every cross-origin request.
// DO NOT add any localStorage read here — that is the XSS attack surface we are eliminating.

// Log API URL for debugging
// Log API URL for debugging (Removed for production)
// console.debug(`🔌 API Client Initialized with baseURL: ${baseURL}`);


// C1: Token Refresh — cookie-based, no localStorage.
// The browser sends the httpOnly refresh-token cookie automatically.
// We do NOT read or write any token to localStorage.
let isRefreshing = false;
let refreshSubscribers: Array<() => void> = [];

const subscribeTokenRefresh = (cb: () => void) => refreshSubscribers.push(cb);
const onRefreshDone = () => { refreshSubscribers.forEach(cb => cb()); refreshSubscribers = []; };

// Global Error Handler for API & Token Refresh Logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until the ongoing refresh resolves
        return new Promise(resolve => {
          subscribeTokenRefresh(() => resolve(api(originalRequest)));
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // C1: The refresh-token httpOnly cookie is sent automatically — no body needed.
        await axios.post(baseURL + "/auth/refresh", {}, { withCredentials: true });

        isRefreshing = false;
        onRefreshDone();

        // Retry the original request — the new access-token cookie is now set
        return api(originalRequest);
      } catch (refreshError) {
        console.warn("[API] Session expired or refresh failed.");
        isRefreshing = false;
        refreshSubscribers = [];

        const publicRoutes = ["/login", "/welcome", "/register", "/", "/select-museum"];
        const currentPath = window.location.pathname;
        const isPublicRoute = publicRoutes.includes(currentPath)
          || currentPath.startsWith("/verify/")
          || currentPath.startsWith("/p/");

        if (!isPublicRoute && !originalRequest.url?.includes("/auth/me")) {
          console.warn("[API] Redirecting to login.");
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status !== 401 && error.response?.status !== 404) {
      console.error("❌ API Error:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message
      });
    }

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
