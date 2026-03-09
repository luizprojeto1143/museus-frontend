import React, { createContext, useContext, useEffect, useState } from "react";

interface ThemeSettings {
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
    theme: "light" | "dark";
}

interface ThemeContextType {
    theme: ThemeSettings;
    setSpaceTheme: (settings: Partial<ThemeSettings>) => void;
    resetTheme: () => void;
}

const defaultTheme: ThemeSettings = {
    primaryColor: "#d4af37", // Gold
    secondaryColor: "#cd7f32", // Bronze
    theme: "dark"
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const VisitorThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);

    const applyTheme = (settings: ThemeSettings) => {
        const root = document.documentElement;
        root.style.setProperty("--accent-primary", settings.primaryColor);
        root.style.setProperty("--accent-secondary", settings.secondaryColor);
        root.setAttribute("data-theme", settings.theme);
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
