import React from "react";
import { Sun, Moon } from "lucide-react";
import { useVisitorTheme } from "../context/VisitorThemeProvider";
import { motion, AnimatePresence } from "framer-motion";

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useVisitorTheme();
    const isDark = theme.theme === "dark";

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
            style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                color: "var(--accent-primary)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease"
            }}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={theme.theme}
                    initial={{ y: 20, opacity: 0, rotate: -45 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: -20, opacity: 0, rotate: 45 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                    {isDark ? (
                        <Sun size={20} fill="currentColor" opacity={0.2} />
                    ) : (
                        <Moon size={20} fill="currentColor" opacity={0.2} />
                    )}
                </motion.div>
            </AnimatePresence>
            
            <style>{`
                .theme-toggle-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    transform: scale(1.1);
                    border-color: var(--accent-primary);
                }
                .theme-toggle-btn:active {
                    transform: scale(0.95);
                }
            `}</style>
        </button>
    );
};
