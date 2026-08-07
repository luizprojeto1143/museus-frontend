import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode
} from "react";
import { api, baseURL, isDemoMode } from "../../api/client";
import { storage } from "@/utils/storage";
import { Role, TenantType, normalizeRole, normalizeTenantType } from "@/types/auth";
import { isAxiosError } from "axios";
export type { Role };

import { logger } from "@/utils/logger";
// ─── Tipos ────────────────────────────────────────────────────────
interface StoredAuth {
  isGuest?: boolean;
  cityId?: string | null;
  tenantId?: string | null;
}

interface AuthState {
  role: Role | null;
  tenantId: string | null;
  equipamentoId: string | null;
  tenantType: TenantType | null;
  email: string | null;
  name: string | null;
  userId: string | null;
  hasProviderProfile: boolean;
  isGuest: boolean;
  cityId: string | null;
  permissions: Record<string, boolean> | null;
  tenantSlug?: string | null;
  user?: { email: string | null; name: string | null; id: string | null; tenantId: string | null } | null;
}

interface AuthUserResponse {
  email?: string | null;
  name?: string | null;
  id?: string | null;
  tenantId?: string | null;
  role?: string | null;
  hasProviderProfile?: boolean | null;
  cityId?: string | null;
  permissions?: Record<string, boolean> | null;
}

interface AuthSessionResponse {
  role?: string | null;
  tenantId?: string | null;
  equipamentoId?: string | null;
  tenantType?: string | null;
  hasProviderProfile?: boolean | null;
  cityId?: string | null;
  permissions?: Record<string, boolean> | null;
  email?: string | null;
  name?: string | null;
  id?: string | null;
  user?: AuthUserResponse | null;
}

interface ApiErrorResponse {
  error?: string;
  message?: string;
}

function getApiErrorMessage(err: unknown, fallback: string) {
  if (isAxiosError<ApiErrorResponse>(err)) {
    return err.response?.data?.message || err.response?.data?.error || fallback;
  }
  return err instanceof Error ? err.message : fallback;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  login: (params: { email: string; password: string }) => Promise<{
    role: Role;
    tenantType: TenantType | null;
    hasProviderProfile: boolean;
  }>;
  enterAsGuest: (selectedTenantId?: string | null, selectedEquipamentoId?: string | null, selectedCityId?: string | null) => void;
  logout: () => void;
  updateSession: (
    newRole: string,
    newTenantId: string | null,
    newName?: string | null,
    newEquipamentoId?: string | null,
    newCityId?: string | null
  ) => void;
  isRestoring: boolean;
  hasPermission: (flag?: string) => boolean;
}

// ─── Actions ──────────────────────────────────────────────────────
type AuthAction =
  | { type: "LOGIN"; payload: AuthState }
  | { type: "LOGOUT" }
  | { type: "UPDATE_SESSION"; payload: Partial<AuthState> };

// ─── Reducer ──────────────────────────────────────────────────────
const EMPTY_STATE: AuthState = {
  role: null,
  tenantId: null,
  equipamentoId: null,
  tenantType: null,
  email: null,
  name: null,
  userId: null,
  hasProviderProfile: false,
  isGuest: false,
  cityId: null,
  permissions: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN":
      return { ...action.payload };
    case "LOGOUT":
      return { ...EMPTY_STATE };
    case "UPDATE_SESSION":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

// ─── Leitura única do localStorage ────────────────────────────────
const STORAGE_KEY = "museus_auth_v1";

function readStoredAuth(): AuthState {
  try {
    const raw = storage.get(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as Partial<StoredAuth>;
    return {
      ...EMPTY_STATE,
      isGuest: parsed.isGuest ?? false,
      cityId: parsed.cityId ?? null,
      tenantId: parsed.tenantId ?? null,
    };
  } catch {
    return EMPTY_STATE;
  }
}

function persistAuth(state: AuthState): void {
  try {
    const toStore: StoredAuth = {
      isGuest: state.isGuest,
      cityId: state.cityId,
      tenantId: state.tenantId, // Safe to keep for context routing
    };
    storage.set(STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    // Ignore storage errors (private/incognito)
  }
}



// ─── Context ──────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Leitura única na inicialização — não 9 chamadas a localStorage
  const [state, dispatch] = useReducer(authReducer, undefined, readStoredAuth);

  // ─── Login ────────────────────────────────────────────────────
  const login: AuthContextValue["login"] = async ({ email, password }) => {
    if (!isDemoMode && baseURL) {
      try {
        const res = await api.post<AuthSessionResponse>("/auth/login", { email, password });
        const data = res.data;

      const newState: AuthState = {
        role: normalizeRole(data.role),
        tenantId: data.tenantId ?? null,
        equipamentoId: data.equipamentoId ?? null,
        tenantType: normalizeTenantType(data.tenantType),
        email: data.user?.email ?? email,
        name: data.user?.name ?? null,
        userId: data.user?.id ?? null,
        hasProviderProfile: data.hasProviderProfile ?? data.user?.hasProviderProfile ?? false,
        isGuest: false,
        cityId: data.cityId ?? data.user?.cityId ?? null,
        permissions: data.permissions ?? data.user?.permissions ?? null,
      };

      dispatch({ type: "LOGIN", payload: newState });
      persistAuth(newState);

      // Tokens are now securely handled via HttpOnly Cookies by the backend

      return { role: newState.role!, tenantType: newState.tenantType, hasProviderProfile: newState.hasProviderProfile };
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Erro de conexao"));
    }
  } else if (isDemoMode) {
      logger.warn("[Auth] Demo mode is enabled for local development only.");
      const simulatedRole: Role = email.includes("master") ? "master" : normalizeRole("admin");
      const simulatedTenantType = email.includes("producer") ? normalizeTenantType("PRODUCER") : normalizeTenantType("MUSEUM");

      const newState: AuthState = {
        role: simulatedRole,
        tenantId: null,
        equipamentoId: null,
        tenantType: simulatedTenantType,
        email,
        name: "Usuário Demo",
        userId: "demo-user-id",
        hasProviderProfile: false,
        isGuest: false,
        cityId: null,
        permissions: null
      };

      dispatch({ type: "LOGIN", payload: newState });
      persistAuth(newState);

      return { role: simulatedRole, tenantType: simulatedTenantType, hasProviderProfile: false };
    } else {
      throw new Error("Login indisponivel: VITE_API_URL precisa apontar para o backend de producao.");
    }
  };

  // ─── Logout ───────────────────────────────────────────────────
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e: unknown) {
      logger.error("Erro ao notificar logout", e);
    }

    dispatch({ type: "LOGOUT" });
    storage.remove(STORAGE_KEY);
    storage.remove("museus_access_token");
    storage.remove("museus_refresh_token");

  };

  // ─── Guest ────────────────────────────────────────────────────
  const enterAsGuest = (selectedTenantId?: string | null, selectedEquipamentoId?: string | null, selectedCityId?: string | null) => {
    const newState: AuthState = {
      role: "visitor",
      tenantId: selectedTenantId ?? null,
      equipamentoId: selectedEquipamentoId ?? null,
      tenantType: "MUSEUM",
      email: null,
      name: "Visitante",
      userId: "guest-id",
      hasProviderProfile: false,
      isGuest: true,
      cityId: selectedCityId ?? null,
      permissions: null
    };

    dispatch({ type: "LOGIN", payload: newState });
    persistAuth(newState);
  };

  // ─── Update Session ───────────────────────────────────────────
  const updateSession = (
    newRole: string,
    newTenantId: string | null,
    newName?: string | null,
    newEquipamentoId?: string | null,
    newCityId?: string | null
  ) => {
    const partial: Partial<AuthState> = {
      role: normalizeRole(newRole),
      tenantId: newTenantId,
      equipamentoId: newEquipamentoId ?? null,
      cityId: newCityId ?? null,
      ...(newName !== undefined ? { name: newName ?? null } : {}),
    };

    dispatch({ type: "UPDATE_SESSION", payload: partial });

    const merged = { ...state, ...partial };
    persistAuth(merged);
  };

  // ─── Restore Session ─────────────────────────────────────────
  const [isRestoring, setIsRestoring] = React.useState(true);

  React.useEffect(() => {
    const restore = async () => {
      try {
        const res = await api.get<AuthSessionResponse>("/auth/me");
        if (res.data) {
          const user = res.data;
          const restoredState: AuthState = {
            role: normalizeRole(user.role),
            tenantId: user.tenantId ?? null,
            equipamentoId: user.equipamentoId ?? null,
            tenantType: normalizeTenantType(user.tenantType),
            email: user.email ?? null,
            name: user.name ?? null,
            userId: user.id ?? null,
            hasProviderProfile: user.hasProviderProfile ?? false,
            isGuest: false,
            cityId: user.cityId || null,
            permissions: user.permissions || null,
          };
          dispatch({ type: "LOGIN", payload: restoredState });
        }
      } catch (e: unknown) {
        // Not authenticated or error, clear storage
        if (!isAxiosError(e) || e.response?.status !== 401) {
          logger.info("Session restore failed, treating as guest/logged out.");
        }
        dispatch({ type: "LOGOUT" });
        storage.remove(STORAGE_KEY);
        storage.remove("museus_access_token");
        storage.remove("museus_refresh_token");
      } finally {
        setIsRestoring(false);
      }
    };

    if (isDemoMode) {
      setIsRestoring(false);
    } else if (state.isGuest) {
      // Guest sessions are local-only — no server call needed.
      // Restore their role and userId so the app recognises them as a visitor.
      dispatch({
        type: "LOGIN",
        payload: {
          role: "visitor",
          tenantId: state.tenantId,
          equipamentoId: state.equipamentoId,
          tenantType: state.tenantType ?? "MUSEUM",
          email: null,
          name: "Visitante",
          userId: "guest-id",
          hasProviderProfile: false,
          isGuest: true,
          cityId: state.cityId,
          permissions: null,
        },
      });
      setIsRestoring(false);
    } else {
      restore();
    }
  }, []);

  const hasPermission = (flag?: string) => {
    if (state.role === 'master' || state.role === 'equipment_admin' || state.role === 'municipal_admin') return true;
    if (!flag) return false;
    return !!state.permissions?.[flag];
  };

  const contextValue: AuthContextValue = {
    ...state,
    tenantSlug: state.tenantSlug ?? state.tenantId ?? "default",
    user: state.user ?? (state.userId ? {
      email: state.email,
      name: state.name,
      id: state.userId,
      tenantId: state.tenantId
    } : null),
    isAuthenticated: !!state.userId,
    login,
    enterAsGuest,
    logout,
    updateSession,
    isRestoring,
    hasPermission
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

