import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "../../api/client";
import { useAuth } from "./AuthContext";

interface TenantSettings {
    id: string;
    name: string;
    slug: string;
    type: string;
    isCityMode: boolean;
    primaryColor: string;
    secondaryColor: string;
    theme: string;
    logoUrl?: string;
    // Add other settings as needed
}

interface TenantContextValue {
    tenant: TenantSettings | null;
    loading: boolean;
    isCityMode: boolean;
    refetch: () => void;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { tenantId } = useAuth();
    const [tenant, setTenant] = useState<TenantSettings | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchTenant = async () => {
        if (!tenantId) {
            setTenant(null);
            setLoading(false);
            return;
        }

        try {
            const res = await api.get(`/tenants/${tenantId}/settings`);
            setTenant({
                id: tenantId,
                name: res.data.name || "",
                slug: res.data.slug || "",
                type: res.data.type || "MUSEUM",
                isCityMode: res.data.isCityMode || false,
                primaryColor: res.data.primaryColor || "#d4af37",
                secondaryColor: res.data.secondaryColor || "#cd7f32",
                theme: res.data.theme || "dark",
                logoUrl: res.data.logoUrl
            });
        } catch (err) {
            console.error("Erro ao carregar tenant:", err);
            setTenant(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTenant();
    }, [tenantId]);

    return (
        <TenantContext.Provider
            value={{
                tenant,
                loading,
                isCityMode: tenant?.isCityMode ?? false,
                refetch: fetchTenant
            }}
        >
            {children}
        </TenantContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useTenant(): TenantSettings | null {
    const ctx = useContext(TenantContext);
    if (!ctx) {
        // Return null if not in provider (for visitor pages without auth)
        return null;
    }
    return ctx.tenant;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTenantContext(): TenantContextValue {
    const ctx = useContext(TenantContext);
    if (!ctx) {
        throw new Error("useTenantContext must be used within TenantProvider");
    }
    return ctx;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useIsCityMode(): boolean {
    const ctx = useContext(TenantContext);
    return ctx?.isCityMode ?? false;
}
