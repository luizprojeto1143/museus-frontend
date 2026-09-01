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
import { writeMuseumCtx } from "@/config/golive";

interface StoredAuth {
  isGuest?: boolean;
  role?: Role | string | null;
  userId?: string | null;
  email?: string | null;
  name?: string | null;
  cityId?: string | null;
  tenantId?: string | null;
  equipamentoId?: string | null;
  tenantType?: TenantType | null;
  hasProviderProfile?: boolean;
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

type AuthAction =
  | { type: "LOGIN"; payload: AuthState }
  | { type: "LOGOUT" }
  | { type: "UPDATE_SESSION"; payload: Partial<AuthState> };

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

const STORAGE_KEY = "museus_auth_v1";

const DEFAULT_GUEST_STATE: AuthState = {
  role: "visitor",
  tenantId: null,
  equipamentoId: null,
  tenantType: "MUSEUM",
  email: null,
  name: "Visitante",
  userId: "guest-id",
  hasProviderProfile: false,
  isGuest: true,
  cityId: null,
  permissions: null,
};

function readStoredAuth(): AuthState {
  try {
    const raw = storage.get(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_GUEST_STATE;
    }
    const parsed = (typeof raw === "string" ? JSON.parse(raw) : raw) as Partial<StoredAuth>;
    const isGuest = parsed.isGuest ?? (parsed.role === "visitor" && !parsed.userId);
    if (isGuest) {
      return {
        ...DEFAULT_GUEST_STATE,
        cityId: parsed.cityId ?? null,
        tenantId: parsed.tenantId ?? null,
        equipamentoId: parsed.equipamentoId ?? null,
      };
    }
    if (parsed.role || parsed.userId) {
      return {
        ...EMPTY_STATE,
        role: normalizeRole(parsed.role),
        tenantId: parsed.tenantId ?? null,
        equipamentoId: parsed.equipamentoId ?? null,
        tenantType: normalizeTenantType(parsed.tenantType),
        email: parsed.email ?? null,
        name: parsed.name ?? null,
        userId: parsed.userId ?? null,
        hasProviderProfile: parsed.hasProviderProfile ?? false,
        isGuest: false,
        cityId: parsed.cityId ?? null,
      };
    }
    return DEFAULT_GUEST_STATE;
  } catch {
    return DEFAULT_GUEST_STATE;
  }
}

function persistAuth(state: AuthState): void {
  try {
    const toStore: StoredAuth = {
      isGuest: state.isGuest,
      role: state.role,
      userId: state.userId,
      email: state.email,
      name: state.name,
      cityId: state.cityId,
      tenantId: state.tenantId,
      equipamentoId: state.equipamentoId,
      tenantType: state.tenantType,
      hasProviderProfile: state.hasProviderProfile,
    };
    storage.set(STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    // Ignore storage errors (private/incognito)
  }
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, undefined, readStoredAuth);

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
    if (selectedTenantId) {
      writeMuseumCtx({
        tenantId: selectedTenantId,
        equipmentSlug: selectedEquipamentoId || "museu",
        citySlug: "museu",
      });
    }
  };

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
    if (newTenantId) {
      writeMuseumCtx({
        tenantId: newTenantId,
        equipmentSlug: newEquipamentoId || "museu",
        citySlug: "museu",
      });
    }
  };

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
      } catch {
        const stored = readStoredAuth();
        dispatch({ type: "LOGIN", payload: stored });
      } finally {
        setIsRestoring(false);
      }
    };

    if (isDemoMode) {
      setIsRestoring(false);
    } else if (state.isGuest) {
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
    isAuthenticated: !!state.userId || state.isGuest,
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
