import axios from "axios";
import { storage } from "@/utils/storage";
import { logger } from "@/utils/logger";
import { getApiBaseUrl } from "@/utils/url";
import axiosRetry from "axios-retry";
import toast from "react-hot-toast";

export const baseURL = getApiBaseUrl();

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 120000,
  headers: {
    "X-Requested-With": "XMLHttpRequest"
  }
});

const UNSAFE_METHODS = new Set(["post", "put", "patch", "delete"]);
let csrfToken: string | null = null;
let csrfTokenPromise: Promise<string> | null = null;

async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  if (!csrfTokenPromise) {
    csrfTokenPromise = axios
      .get(`${baseURL}/auth/csrf-token`, { withCredentials: true })
      .then((res) => {
        const token = res.data?.csrfToken;
        if (!token || typeof token !== "string") {
          throw new Error("CSRF token ausente na resposta do servidor");
        }
        csrfToken = token;
        return token;
      })
      .finally(() => {
        csrfTokenPromise = null;
      });
  }
  return csrfTokenPromise;
}

api.interceptors.request.use(async (config) => {
  try {
    const rawAuth = storage.get("museus_auth_v1");
    if (rawAuth) {
      const parsed = JSON.parse(rawAuth);
      if (parsed.tenantId) {
        config.headers["x-tenant-id"] = parsed.tenantId;
        const path = `${config.baseURL || ""}${config.url || ""}`;
        if (/\/(works|trails|events)(\b|\/|\?|$)/.test(path) || /\/(works|trails|events)$/.test(String(config.url || ""))) {
          const params = (config.params || {}) as Record<string, unknown>;
          if (!params.tenantId) {
            config.params = { ...params, tenantId: parsed.tenantId };
          }
        }
      }
    }
  } catch {
    // Ignore malformed local state.
  }

  const method = (config.method || "get").toLowerCase();
  if (UNSAFE_METHODS.has(method) && !config.headers?.["x-csrf-token"]) {
    const token = await getCsrfToken();
    config.headers = config.headers || {};
    config.headers["x-csrf-token"] = token;
  }

  return config;
});

axiosRetry(api, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    const status = error.response?.status;
    if (status !== undefined && status >= 400 && status < 500) return false;
    return axiosRetry.isNetworkOrIdempotentRequestError(error);
  },
  onRetry: (retryCount, error) => {
    logger.warn(`[API] Retry ${retryCount}/3 - ${error.config?.url} (${error.message})`);
  },
});

export const isDemoMode = import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE === "true";

let isRefreshing = false;
let refreshSubscribers: Array<() => void> = [];

const subscribeTokenRefresh = (cb: () => void) => refreshSubscribers.push(cb);
const onRefreshDone = () => {
  refreshSubscribers.forEach(cb => cb());
  refreshSubscribers = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRequest = originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/register");

    if (error.response?.status === 403 && error.response?.data?.message?.includes("CSRF")) {
      csrfToken = null;
    }

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      if (isRefreshing) {
        return new Promise(resolve => {
          subscribeTokenRefresh(() => resolve(api(originalRequest)));
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(baseURL + "/auth/refresh", {}, { withCredentials: true });

        isRefreshing = false;
        onRefreshDone();

        return api(originalRequest);
      } catch (refreshError) {
        logger.warn("[API] Session expired or refresh failed.");
        isRefreshing = false;
        refreshSubscribers = [];

        let isVisitorRole = true;
        try {
          const rawAuth = storage.get<any>("museus_auth_v1");
          if (rawAuth) {
            const parsed = typeof rawAuth === "string" ? JSON.parse(rawAuth) : rawAuth;
            isVisitorRole = !parsed.role || parsed.role === "visitor" || !!parsed.isGuest;
          }
        } catch {
          // ignore
        }

        const currentPath = window.location.pathname;
        const isAdminRoute = [
          "/admin", "/master", "/producer", "/provider", "/municipal", "/theater", "/totem"
        ].some(prefix => currentPath.startsWith(prefix));

        if (isAdminRoute && !isVisitorRole && !originalRequest.url?.includes("/auth/me")) {
          logger.warn("[API] Admin session expired. Redirecting to login.");
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status !== 401 && error.response?.status !== 404) {
      logger.error("API Error:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message
      });
    }

    const errorMessage = error.response?.data?.message || error.message || "Erro de conexao";
    const status = error.response?.status;

    if (status !== 401 && error.config?.url) {
      if (status >= 500 && status < 600) {
        logger.error(`[API] Server error (5xx) on ${error.config.url}. Check backend logs.`);
      } else {
        toast.error(errorMessage, { id: `api-error-${status}` });
      }
    }

    return Promise.reject(error);
  }
);
