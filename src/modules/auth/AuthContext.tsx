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
  email: string | null;
  name: string | null;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  role: Role | null;
  token: string | null;
  tenantId: string | null;
  email: string | null;
  name: string | null;
  login: (params: { email: string; password: string }) => Promise<Role>;
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
      const receivedEmail = data.user?.email ?? email;
      const receivedName = data.user?.name ?? null;

      setToken(receivedToken);
      setRole(mappedRole);
      setTenantId(receivedTenantId);
      setEmail(receivedEmail);
      setName(receivedName);

      const toStore: StoredAuth = {
        token: receivedToken,
        role: mappedRole,
        tenantId: receivedTenantId,
        email: receivedEmail,
        name: receivedName
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));

      return mappedRole;
    } else {
      // modo demo
      const simulatedRole: Role =
        email.includes("master") ? "master" : "admin";

      const fakeToken = "demo-token";
      setToken(fakeToken);
      setRole(simulatedRole);
      setTenantId(null);
      setEmail(email);
      setName("Usuário Demo");

      const toStore: StoredAuth = {
        token: fakeToken,
        role: simulatedRole,
        tenantId: null,
        email: email,
        name: "Usuário Demo"
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));

      return simulatedRole;
    }
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setTenantId(null);
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
    // Manter email atual

    const toStore: StoredAuth = {
      token: newToken,
      role: mappedRole,
      tenantId: newTenantId,
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
