import React from "react";
import { useTranslation } from "react-i18next";
import { Link, Outlet } from "react-router-dom";
import { LogOut, Home } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export const TotemLayout: React.FC = () => {
    const { t } = useTranslation();
    const { logout } = useAuth();

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            backgroundColor: "#000",
            color: "#fff",
            fontFamily: "var(--font-primary)"
        }}>
            <header style={{
                padding: "1rem 2rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(20,20,20,0.8)",
                backdropFilter: "blur(10px)"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{
                        width: "40px",
                        height: "40px",
                        background: "linear-gradient(135deg, #d4af37, #f1c40f)",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        color: "#000"
                    }}>
                        M
                    </div>
                    <div>
                        <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Modo Totem</h1>
                        <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>Controle de Acesso</span>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                    <Link to="/admin" className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", textDecoration: "none" }}>
                        <Home size={18} />
                        <span className="hidden-mobile">Admin</span>
                    </Link>
                    <button onClick={logout} className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid rgba(255,68,68,0.5)", color: "#ff4444", background: "transparent", cursor: "pointer" }}>
                        <LogOut size={18} />
                        <span className="hidden-mobile">Sair</span>
                    </button>
                </div>
            </header>

            <main style={{ flex: 1, overflow: "auto", position: "relative" }}>
                <Outlet />
            </main>

            <footer style={{
                padding: "1rem",
                textAlign: "center",
                fontSize: "0.8rem",
                opacity: 0.4,
                borderTop: "1px solid rgba(255,255,255,0.05)"
            }}>
                &copy; {new Date().getFullYear()} Museus Conectados - Totem System v1.0
            </footer>
        </div>
    );
};
