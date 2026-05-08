import React, { createContext, useContext, useEffect, useState } from "react";

interface ThemeSettings {
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
    theme: "light" | "dark";
    historicalFont?: boolean;
}

interface ThemeContextType {
    theme: ThemeSettings;
    setSpaceTheme: (settings: Partial<ThemeSettings>) => void;
    toggleTheme: () => void;
    setThemeMode: (mode: "light" | "dark") => void;
    resetTheme: () => void;
}

import { useTenant } from "../../auth/TenantContext";

const defaultTheme: ThemeSettings = {
    primaryColor: "var(--accent-primary)", // Gold fallback
    secondaryColor: "var(--accent-secondary)", // Bronze fallback
    theme: "dark",
    historicalFont: true
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const VisitorThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const tenant = useTenant();
    
    // Initialize with fallback but check localStorage first
    const getInitialTheme = (): ThemeSettings => {
        const localMode = localStorage.getItem("visitor_theme_mode") as "light" | "dark" | null;
        // Default to dark for cinematic experience
        const initialMode = localMode || "dark";
        return {
            ...defaultTheme,
            theme: initialMode
        };
    };

    const [theme, setTheme] = useState<ThemeSettings>(getInitialTheme());

    const applyTheme = (settings: ThemeSettings) => {
        const root = document.documentElement;
        
        // Dynamic Branding Colors
        const primary = settings.primaryColor;
        const secondary = settings.secondaryColor;

        // Apply primary branding colors to root variables
        root.style.setProperty("--accent-primary", primary);
        root.style.setProperty("--gold", primary);
        root.style.setProperty("--color-gold-400", primary);
        root.style.setProperty("--accent-secondary", secondary);
        root.style.setProperty("--bronze", secondary);

        // Theme and Fonts
        const isHistorical = settings.historicalFont ?? true;
        const fontStack = isHistorical ? "Georgia, serif" : "'Inter', system-ui, sans-serif";
        
        // Trigger CSS data-theme selectors
        root.setAttribute("data-theme", settings.theme);
        
        root.style.setProperty("--font-fb", fontStack);
        root.style.setProperty("--font-body", fontStack);
        root.style.setProperty("--font-heading", isHistorical ? "Georgia, serif" : "'Syne', sans-serif");
    };

    // Auto-sync theme from Tenant context if available (only if no local override)
    useEffect(() => {
        if (tenant) {
            const localMode = localStorage.getItem("visitor_theme_mode");
            
            // SECURITY: If the tenant colors are the old brown/bordeaux, 
            // we favor the cinematic lux colors unless it's a specific custom museum.
            const isOldBranding = tenant.primaryColor === "#2a1108" || tenant.slug === "cultura-viva";
            
            setTheme(prev => ({
                ...prev,
                primaryColor: isOldBranding ? "var(--color-gold-400)" : tenant.primaryColor,
                secondaryColor: isOldBranding ? "#cd7f32" : tenant.secondaryColor,
                theme: (localMode as "light" | "dark") || (tenant.theme as "light" | "dark") || "dark",
                historicalFont: true 
            }));
        }
    }, [tenant]);

    useEffect(() => {
        const root = document.documentElement;
        // Enforce the high-end font stack globally
        root.style.setProperty("--font-heading", "'Bodoni Moda', Georgia, serif");
        root.style.setProperty("--font-body", "'Syne', system-ui, sans-serif");
        applyTheme(theme);
    }, [theme]);

    const setSpaceTheme = (settings: Partial<ThemeSettings>) => {
        setTheme(prev => ({ ...prev, ...settings }));
    };

    const setThemeMode = (mode: "light" | "dark") => {
        setTheme(prev => ({ ...prev, theme: mode }));
        localStorage.setItem("visitor_theme_mode", mode);
    };

    const toggleTheme = () => {
        const newMode = theme.theme === "light" ? "dark" : "light";
        setThemeMode(newMode);
    };

    const resetTheme = () => {
        setTheme(defaultTheme);
        localStorage.removeItem("visitor_theme_mode");
    };

    return (
        <ThemeContext.Provider value={{ theme, setSpaceTheme, toggleTheme, setThemeMode, resetTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useVisitorTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useVisitorTheme must be used within a VisitorThemeProvider");
    }
    return context;
};
