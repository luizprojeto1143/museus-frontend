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
    resetTheme: () => void;
}

const defaultTheme: ThemeSettings = {
    primaryColor: "#d4af37", // Gold
    secondaryColor: "#cd7f32", // Bronze
    theme: "dark",
    historicalFont: true
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const VisitorThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);

    const applyTheme = (settings: ThemeSettings) => {
        const root = document.documentElement;
        
        // Unify standard variable names used across different components
        const primary = settings.primaryColor;
        const secondary = settings.secondaryColor;

        // Primary mappings (Gold variations)
        root.style.setProperty("--primary-color", primary);
        root.style.setProperty("--accent-primary", primary);
        root.style.setProperty("--accent-gold", primary);
        root.style.setProperty("--gold", primary);
        root.style.setProperty("--color-gold-400", primary);
        
        // Secondary mappings (Bronze variations)
        root.style.setProperty("--secondary-color", secondary);
        root.style.setProperty("--accent-secondary", secondary);
        root.style.setProperty("--accent-bronze", secondary);
        root.style.setProperty("--bronze", secondary);
        root.style.setProperty("--color-bronze-400", secondary);

        // Theme and Fonts
        const fontStack = settings.historicalFont ? "Georgia, serif" : "Inter, system-ui, sans-serif";
        root.setAttribute("data-theme", settings.theme);
        root.style.setProperty("--font-fb", fontStack);
        root.style.setProperty("--font-body", fontStack);
        root.style.setProperty("--font-heading", settings.historicalFont ? "Georgia, serif" : "Syne, sans-serif");
        root.style.setProperty("--fb", fontStack);
        root.style.setProperty("--fd", settings.historicalFont ? "Georgia, serif" : "Syne, sans-serif");
        
        // Background and Text logic
        if (settings.theme === "light") {
            root.style.setProperty("--bg-page", "#ffffff");
            root.style.setProperty("--bg-primary", "#f8fafc");
            root.style.setProperty("--fg-main", "#0f172a");
            root.style.setProperty("--text-primary", "#0f172a");
            root.style.setProperty("--text-secondary", "rgba(15, 23, 42, 0.7)");
            root.style.setProperty("--bg", "#ffffff");
            root.style.setProperty("--cream", "#1a1108");
            root.style.setProperty("--gold", settings.primaryColor || "#c9943a");
            root.style.setProperty("--gold-hi", settings.primaryColor || "#0f172a");
            root.style.setProperty("--gold-dim", "rgba(15, 23, 42, 0.05)");
            root.style.setProperty("--gold-glow", "rgba(15, 23, 42, 0.1)");
            root.style.setProperty("--muted", "rgba(15, 23, 42, 0.5)");
            root.style.setProperty("--faint", "rgba(0, 0, 0, 0.03)");
            root.style.setProperty("--border", "rgba(0, 0, 0, 0.08)");
            root.style.setProperty("--border-color", "rgba(0, 0, 0, 0.08)");
            root.style.setProperty("--surface", "rgba(255, 255, 255, 0.9)");
            root.style.setProperty("--surface2", "rgba(240, 242, 245, 0.7)");
            root.style.setProperty("--bg-card", "rgba(0, 0, 0, 0.03)");
            root.style.setProperty("--bg-hover", "rgba(0, 0, 0, 0.05)");
        } else {
            root.style.setProperty("--bg-page", "#05050c");
            root.style.setProperty("--bg-primary", "#0a0a0b");
            root.style.setProperty("--fg-main", "#f5e6d3");
            root.style.setProperty("--text-primary", "#ffffff");
            root.style.setProperty("--text-secondary", "rgba(255, 255, 255, 0.6)");
            root.style.setProperty("--bg", "#05050c");
            root.style.setProperty("--cream", "#ede8d8");
            root.style.setProperty("--gold", "#c9943a");
            root.style.setProperty("--gold-hi", "#f0c060");
            root.style.setProperty("--gold-dim", "rgba(201,148,58,.14)");
            root.style.setProperty("--gold-glow", "rgba(201,148,58,.28)");
            root.style.setProperty("--muted", "rgba(237,232,216,.5)");
            root.style.setProperty("--faint", "rgba(237,232,216,.07)");
            root.style.setProperty("--border", "rgba(237,232,216,.07)");
            root.style.setProperty("--border-color", "rgba(255, 255, 255, 0.08)");
            root.style.setProperty("--surface", "rgba(9,9,15,.82)");
            root.style.setProperty("--surface2", "rgba(12,12,22,.7)");
            root.style.setProperty("--bg-card", "rgba(255, 255, 255, 0.03)");
            root.style.setProperty("--bg-hover", "rgba(255, 255, 255, 0.05)");
        }
    };

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const setSpaceTheme = (settings: Partial<ThemeSettings>) => {
        setTheme(prev => ({ ...prev, ...settings }));
    };

    const resetTheme = () => {
        setTheme(defaultTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setSpaceTheme, resetTheme }}>
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
