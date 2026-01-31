import React, {
  createContext,
  useContext,
  useState,
  ReactNode
} from "react";

export type Role = "visitor" | "admin" | "master";

interface StoredAuth {
  token: string;
  role: Role;
  tenantId: string | null;
  tenantType: "MUSEUM" | "PRODUCER" | null;
  email: string | null;
  name: string | null;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  role: Role | null;
  token: string | null;
  tenantId: string | null;
  tenantType: "MUSEUM" | "PRODUCER" | null;
  email: string | null;
  name: string | null;
  login: (params: { email: string; password: string }) => Promise<{ role: Role; tenantType: "MUSEUM" | "PRODUCER" | null }>;
  logout: () => void;
  updateSession: (newToken: string, newRole: string, newTenantId: string | null, newName?: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "museus_auth_v1";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as StoredAuth;
        return parsed.token;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [role, setRole] = useState<Role | null>(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as StoredAuth;
        return parsed.role;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [tenantId, setTenantId] = useState<string | null>(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as StoredAuth;
        return parsed.tenantId ?? null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [tenantType, setTenantType] = useState<"MUSEUM" | "PRODUCER" | null>(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as StoredAuth;
        return parsed.tenantType ?? null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [email, setEmail] = useState<string | null>(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as StoredAuth;
        return parsed.email ?? null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [name, setName] = useState<string | null>(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as StoredAuth;
        return parsed.name ?? null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const login: AuthContextValue["login"] = async ({ email, password }) => {
    const baseUrl = import.meta.env.VITE_API_URL as string | undefined;
    const demo = import.meta.env.VITE_DEMO_MODE === "true";

    if (!demo && baseUrl) {
      const res = await fetch(baseUrl + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        throw new Error("Falha no login");
      }

      const data = (await res.json()) as {
        accessToken?: string;
        role?: string;
        tenantId?: string | null;
        tenantType?: "MUSEUM" | "PRODUCER" | null;
        user?: { email: string; name?: string };
      };

      const receivedToken = data.accessToken;
      if (!receivedToken) {
        throw new Error("Token não recebido do backend");
      }

      const backendRole = (data.role || "").toUpperCase();

      let mappedRole: Role = "visitor";
      if (backendRole === "MASTER") mappedRole = "master";
      else if (backendRole === "ADMIN") mappedRole = "admin";
      else if (backendRole === "VISITOR") mappedRole = "visitor";

      const receivedTenantId = data.tenantId ?? null;
      const receivedTenantType = data.tenantType ?? "MUSEUM"; // Default to MUSEUM
      const receivedEmail = data.user?.email ?? email;
      const receivedName = data.user?.name ?? null;

      setToken(receivedToken);
      setRole(mappedRole);
      setTenantId(receivedTenantId);
      setTenantType(receivedTenantType);
      setEmail(receivedEmail);
      setName(receivedName);

      const toStore: StoredAuth = {
        token: receivedToken,
        role: mappedRole,
        tenantId: receivedTenantId,
        tenantType: receivedTenantType,
        email: receivedEmail,
        name: receivedName
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));

      return { role: mappedRole, tenantType: receivedTenantType };
    } else {
      // modo demo
      const simulatedRole: Role =
        email.includes("master") ? "master" : "admin";

      const simulatedTenantType = email.includes("producer") ? "PRODUCER" : "MUSEUM";

      const fakeToken = "demo-token";
      setToken(fakeToken);
      setRole(simulatedRole);
      setTenantId(null);
      setTenantType(simulatedTenantType);
      setEmail(email);
      setName("Usuário Demo");

      const toStore: StoredAuth = {
        token: fakeToken,
        role: simulatedRole,
        tenantId: null,
        tenantType: simulatedTenantType,
        email: email,
        name: "Usuário Demo"
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));

      return { role: simulatedRole, tenantType: simulatedTenantType };
    }
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setTenantId(null);
    setTenantType(null);
    setEmail(null);
    setName(null);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const updateSession = (newToken: string, newRole: string, newTenantId: string | null, newName?: string | null) => {
    // Normalizar role para lowercase para garantir compatibilidade
    let mappedRole: Role = "visitor";
    const upperRole = (newRole || "").toUpperCase();

    if (upperRole === "MASTER") mappedRole = "master";
    else if (upperRole === "ADMIN") mappedRole = "admin";
    else if (upperRole === "VISITOR") mappedRole = "visitor";

    setToken(newToken);
    setRole(mappedRole);
    setTenantId(newTenantId);
    if (newName !== undefined) setName(newName ?? null);

    // Maintain existing tenantType or default to MUSEUM if updating session without re-login
    const currentTenantType = tenantType ?? "MUSEUM";

    const toStore: StoredAuth = {
      token: newToken,
      role: mappedRole,
      tenantId: newTenantId,
      tenantType: currentTenantType,
      email: email || "",
      name: newName !== undefined ? (newName ?? null) : name
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        role,
        token,
        tenantId,
        tenantType,
        email,
        name,
        login,
        logout,
        updateSession
      }}
    >
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
