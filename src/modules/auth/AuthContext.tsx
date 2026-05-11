import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode
} from "react";
import { api, baseURL, isDemoMode } from "../../api/client";

export type Role = "visitor" | "admin" | "master" | "producer" | "collaborator";

// ─── Tipos ────────────────────────────────────────────────────────
interface StoredAuth {
  role: Role;
  tenantId: string | null;
  equipamentoId: string | null;
  tenantType: "MUSEUM" | "PRODUCER" | null;
  email: string | null;
  name: string | null;
  userId: string | null;
  hasProviderProfile: boolean;
  isGuest?: boolean;
  cityId?: string | null;
  permissions?: Record<string, boolean> | null;
}

interface AuthState {
  role: Role | null;
  tenantId: string | null;
  equipamentoId: string | null;
  tenantType: "MUSEUM" | "PRODUCER" | null;
  email: string | null;
  name: string | null;
  userId: string | null;
  hasProviderProfile: boolean;
  isGuest: boolean;
  cityId: string | null;
  permissions: Record<string, boolean> | null;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  login: (params: { email: string; password: string }) => Promise<{
    role: Role;
    tenantType: "MUSEUM" | "PRODUCER" | null;
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
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as Partial<StoredAuth>;
    return {
      role: parsed.role ?? null,
      tenantId: parsed.tenantId ?? null,
      equipamentoId: parsed.equipamentoId ?? null,
      tenantType: parsed.tenantType ?? null,
      email: parsed.email ?? null,
      name: parsed.name ?? null,
      userId: parsed.userId ?? null,
      hasProviderProfile: parsed.hasProviderProfile ?? false,
      isGuest: parsed.isGuest ?? false,
      cityId: parsed.cityId ?? null,
      permissions: parsed.permissions ?? null,
    };
  } catch {
    return EMPTY_STATE;
  }
}

function persistAuth(state: AuthState): void {
  try {
    const toStore: StoredAuth = {
      role: state.role ?? "visitor",
      tenantId: state.tenantId,
      equipamentoId: state.equipamentoId,
      tenantType: state.tenantType,
      email: state.email,
      name: state.name,
      userId: state.userId,
      hasProviderProfile: state.hasProviderProfile,
      isGuest: state.isGuest,
      cityId: state.cityId,
      permissions: state.permissions,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    // Ignore storage errors (private/incognito)
  }
}

function mapRole(raw: string): Role {
  const upper = (raw || "").toLowerCase();
  if (upper === "master") return "master";
  if (upper === "admin") return "admin";
  if (upper === "producer") return "producer";
  if (upper === "collaborator") return "collaborator";
  return "visitor";
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
        const res = await api.post("/auth/login", { email, password });
        const data = res.data as {
        accessToken?: string;
        refreshToken?: string;
        role?: string;
        tenantId?: string | null;
        equipamentoId?: string | null;
        tenantType?: "MUSEUM" | "PRODUCER" | null;
        hasProviderProfile?: boolean;
        user?: { email: string; name?: string; id?: string; hasProviderProfile?: boolean };
      };

      const token = data.accessToken;
      if (!token) throw new Error("Token não recebido do backend");

      const newState: AuthState = {
        role: mapRole(data.role ?? ""),
        tenantId: data.tenantId ?? null,
        equipamentoId: data.equipamentoId ?? null,
        tenantType: data.tenantType ?? "MUSEUM",
        email: data.user?.email ?? email,
        name: data.user?.name ?? null,
        userId: data.user?.id ?? null,
        hasProviderProfile: data.hasProviderProfile ?? data.user?.hasProviderProfile ?? false,
        isGuest: false,
        cityId: (data as any).cityId ?? (data.user as any)?.cityId ?? null,
        permissions: (data as any).permissions ?? (data.user as any)?.permissions ?? null,
      };

      dispatch({ type: "LOGIN", payload: newState });
      persistAuth(newState);

      // C1: Store tokens for hybrid authentication fallback
      if (data.accessToken) localStorage.setItem("museus_access_token", data.accessToken);
      if (data.refreshToken) localStorage.setItem("museus_refresh_token", data.refreshToken);


      return { role: newState.role!, tenantType: newState.tenantType, hasProviderProfile: newState.hasProviderProfile };
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Erro de conexão";
      throw new Error(message);
    }
  } else {
    // Modo demo
      const simulatedRole: Role = email.includes("master") ? "master" : "admin";
      const simulatedTenantType = email.includes("producer") ? "PRODUCER" : "MUSEUM";

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
      };

      dispatch({ type: "LOGIN", payload: newState });
      persistAuth(newState);

      return { role: simulatedRole, tenantType: simulatedTenantType, hasProviderProfile: false };
    }
  };

  // ─── Logout ───────────────────────────────────────────────────
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("Erro ao notificar logout", e);
    }

    dispatch({ type: "LOGOUT" });
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem("museus_access_token");
    window.localStorage.removeItem("museus_refresh_token");

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
      role: mapRole(newRole),
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
        const res = await api.get("/auth/me");
        if (res.data) {
          const user = res.data;
          const restoredState: AuthState = {
            role: mapRole(user.role),
            tenantId: user.tenantId,
            equipamentoId: user.equipamentoId,
            tenantType: user.tenantType || "MUSEUM",
            email: user.email,
            name: user.name,
            userId: user.id,
            hasProviderProfile: user.hasProviderProfile,
            isGuest: false,
            cityId: user.cityId || null,
            permissions: user.permissions || null,
          };
          dispatch({ type: "LOGIN", payload: restoredState });
        }
      } catch (e: any) {
        // Not authenticated or error, clear storage
        if (e.response?.status !== 401) {
          console.log("Session restore failed, treating as guest/logged out.");
        }
        dispatch({ type: "LOGOUT" });
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem("museus_access_token");
        window.localStorage.removeItem("museus_refresh_token");
      } finally {
        setIsRestoring(false);
      }
    };

    if (import.meta.env.VITE_DEMO_MODE === "true") {
      setIsRestoring(false);
    } else {
      restore();
    }
  }, []);

  const hasPermission = (flag?: string) => {
    if (state.role === 'master' || state.role === 'admin') return true;
    if (!flag) return false;
    return !!state.permissions?.[flag];
  };

  const contextValue: AuthContextValue = {
    ...state,
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

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
