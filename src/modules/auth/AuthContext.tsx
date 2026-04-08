import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode
} from "react";
import { api } from "../../api/client";

export type Role = "visitor" | "admin" | "master" | "producer";

// ─── Tipos ────────────────────────────────────────────────────────
interface StoredAuth {
  token: string;
  refreshToken: string;
  role: Role;
  tenantId: string | null;
  equipamentoId: string | null;
  tenantType: "MUSEUM" | "PRODUCER" | null;
  email: string | null;
  name: string | null;
  userId: string | null;
  hasProviderProfile: boolean;
  isGuest?: boolean;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  role: Role | null;
  tenantId: string | null;
  equipamentoId: string | null;
  tenantType: "MUSEUM" | "PRODUCER" | null;
  email: string | null;
  name: string | null;
  userId: string | null;
  hasProviderProfile: boolean;
  isGuest: boolean;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  login: (params: { email: string; password: string }) => Promise<{
    role: Role;
    tenantType: "MUSEUM" | "PRODUCER" | null;
    hasProviderProfile: boolean;
  }>;
  enterAsGuest: (selectedTenantId?: string | null, selectedEquipamentoId?: string | null) => void;
  logout: () => void;
  updateSession: (
    newToken: string,
    newRefreshToken: string,
    newRole: string,
    newTenantId: string | null,
    newName?: string | null,
    newEquipamentoId?: string | null
  ) => void;
}

// ─── Actions ──────────────────────────────────────────────────────
type AuthAction =
  | { type: "LOGIN"; payload: AuthState }
  | { type: "LOGOUT" }
  | { type: "UPDATE_SESSION"; payload: Partial<AuthState> };

// ─── Reducer ──────────────────────────────────────────────────────
const EMPTY_STATE: AuthState = {
  token: null,
  refreshToken: null,
  role: null,
  tenantId: null,
  equipamentoId: null,
  tenantType: null,
  email: null,
  name: null,
  userId: null,
  hasProviderProfile: false,
  isGuest: false,
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
      token: parsed.token ?? null,
      refreshToken: parsed.refreshToken ?? null,
      role: parsed.role ?? null,
      tenantId: parsed.tenantId ?? null,
      equipamentoId: parsed.equipamentoId ?? null,
      tenantType: parsed.tenantType ?? null,
      email: parsed.email ?? null,
      name: parsed.name ?? null,
      userId: parsed.userId ?? null,
      hasProviderProfile: parsed.hasProviderProfile ?? false,
      isGuest: parsed.isGuest ?? false,
    };
  } catch {
    return EMPTY_STATE;
  }
}

function persistAuth(state: AuthState): void {
  try {
    const toStore: StoredAuth = {
      token: state.token ?? "",
      refreshToken: state.refreshToken ?? "",
      role: state.role ?? "visitor",
      tenantId: state.tenantId,
      equipamentoId: state.equipamentoId,
      tenantType: state.tenantType,
      email: state.email,
      name: state.name,
      userId: state.userId,
      hasProviderProfile: state.hasProviderProfile,
      isGuest: state.isGuest,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    // Ignore storage errors (private/incognito)
  }
}

function mapRole(raw: string): Role {
  const upper = (raw || "").toUpperCase();
  if (upper === "MASTER") return "master";
  if (upper === "ADMIN") return "admin";
  if (upper === "PRODUCER") return "producer";
  return "visitor";
}

// ─── Context ──────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Leitura única na inicialização — não 9 chamadas a localStorage
  const [state, dispatch] = useReducer(authReducer, undefined, readStoredAuth);

  // ─── Login ────────────────────────────────────────────────────
  const login: AuthContextValue["login"] = async ({ email, password }) => {
    const baseUrl = import.meta.env.VITE_API_URL as string | undefined;
    const demo = import.meta.env.VITE_DEMO_MODE === "true";

    if (!demo && baseUrl) {
      const res = await fetch(baseUrl + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Falha no login");

      const data = (await res.json()) as {
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
        token,
        refreshToken: data.refreshToken ?? "",
        role: mapRole(data.role ?? ""),
        tenantId: data.tenantId ?? null,
        equipamentoId: data.equipamentoId ?? null,
        tenantType: data.tenantType ?? "MUSEUM",
        email: data.user?.email ?? email,
        name: data.user?.name ?? null,
        userId: data.user?.id ?? null,
        hasProviderProfile: data.hasProviderProfile ?? data.user?.hasProviderProfile ?? false,
        isGuest: false,
      };

      dispatch({ type: "LOGIN", payload: newState });
      persistAuth(newState);

      return {
        role: newState.role!,
        tenantType: newState.tenantType,
        hasProviderProfile: newState.hasProviderProfile,
      };
    } else {
      // Modo demo
      const simulatedRole: Role = email.includes("master") ? "master" : "admin";
      const simulatedTenantType = email.includes("producer") ? "PRODUCER" : "MUSEUM";

      const newState: AuthState = {
        token: "demo-access-token",
        refreshToken: "demo-refresh-token",
        role: simulatedRole,
        tenantId: null,
        equipamentoId: null,
        tenantType: simulatedTenantType,
        email,
        name: "Usuário Demo",
        userId: null,
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
      if (state.refreshToken) {
        const baseUrl = import.meta.env.VITE_API_URL as string | undefined;
        if (baseUrl) {
          await fetch(baseUrl + "/auth/logout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: state.refreshToken }),
          });
        }
      }
    } catch (e) {
      console.error("Erro ao notificar logout", e);
    }

    dispatch({ type: "LOGOUT" });
    window.localStorage.removeItem(STORAGE_KEY);
  };

  // ─── Guest ────────────────────────────────────────────────────
  const enterAsGuest = (selectedTenantId?: string | null, selectedEquipamentoId?: string | null) => {
    const newState: AuthState = {
      token: "guest-anonymous-token",
      refreshToken: "",
      role: "visitor",
      tenantId: selectedTenantId ?? null,
      equipamentoId: selectedEquipamentoId ?? null,
      tenantType: "MUSEUM",
      email: null,
      name: "Visitante",
      userId: null,
      hasProviderProfile: false,
      isGuest: true,
    };

    dispatch({ type: "LOGIN", payload: newState });
    persistAuth(newState);
  };

  // ─── Update Session ───────────────────────────────────────────
  const updateSession = (
    newToken: string,
    newRefreshToken: string,
    newRole: string,
    newTenantId: string | null,
    newName?: string | null,
    newEquipamentoId?: string | null
  ) => {
    const partial: Partial<AuthState> = {
      token: newToken,
      refreshToken: newRefreshToken,
      role: mapRole(newRole),
      tenantId: newTenantId,
      equipamentoId: newEquipamentoId ?? null,
      ...(newName !== undefined ? { name: newName ?? null } : {}),
    };

    dispatch({ type: "UPDATE_SESSION", payload: partial });

    const merged = { ...state, ...partial };
    persistAuth(merged);
  };

  // ─── Interceptor para token refresh ──────────────────────────
  // O api client já lê do localStorage, mas atualizamos o state também
  // quando o token é renovado externamente (ex: interceptor de client.ts)

  const contextValue: AuthContextValue = {
    ...state,
    isAuthenticated: !!state.token,
    login,
    enterAsGuest,
    logout,
    updateSession,
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
