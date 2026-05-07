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
            title={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
            style={{
                background: "var(--faint)",
                backdropFilter: "blur(10px)",
                border: "1px solid var(--border)",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                color: "var(--gold)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                transition: "all 0.3s ease",
                flexShrink: 0
            }}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={theme.theme}
                    initial={{ y: 16, opacity: 0, rotate: -30 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: -16, opacity: 0, rotate: 30 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}
                >
                    {isDark ? (
                        <Sun size={18} />
                    ) : (
                        <Moon size={18} />
                    )}
                </motion.div>
            </AnimatePresence>

            <style>{`
                .theme-toggle-btn:hover {
                    background: var(--gold-dim) !important;
                    border-color: var(--gold) !important;
                    transform: scale(1.1);
                }
                .theme-toggle-btn:active {
                    transform: scale(0.95);
                }
            `}</style>
        </button>
    );
};
