import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
    LayoutDashboard,
    Calendar,
    Ticket,
    Users,
    ShoppingBag,
    FileText,
    LogOut,
    Menu,
    Briefcase
} from "lucide-react";
import "./ProducerLayout.css";

export const ProducerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { t } = useTranslation();
    const { logout, name } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const links = [
        { to: "/producer", label: t("producer.layout.menu.overview"), icon: <LayoutDashboard size={20} /> },
        { to: "/producer/events", label: t("producer.layout.menu.projects"), icon: <Calendar size={20} /> },
        { to: "/producer/tickets", label: t("producer.layout.menu.tickets"), icon: <Ticket size={20} /> },
        { to: "/producer/audience", label: t("producer.layout.menu.audience"), icon: <Users size={20} /> },
        { to: "/producer/services", label: t("producer.layout.menu.services"), icon: <Briefcase size={20} /> }, // Marketplace
        { to: "/producer/reports", label: t("producer.layout.menu.reports"), icon: <FileText size={20} /> },
    ];

    return (
        <div id="producer-layout" className="layout-wrapper">
            {/* Mobile Overlay */}
            <div
                className={`mobile-overlay ${isSidebarOpen ? "open" : ""}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`layout-sidebar ${isSidebarOpen ? "open" : ""}`}>
                <div className="sidebar-header">
                    <div className="app-brand">
                        <span className="app-logo">PC</span>
                        <div>
                            <div className="app-title">{t("producer.layout.title")}</div>
                            <div className="app-subtitle">{name}</div>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-content">
                    <div style={{ padding: "0 1rem", marginBottom: "0.5rem", fontSize: "0.75rem", textTransform: "uppercase", opacity: 0.5, letterSpacing: "1px", color: "var(--text-secondary)" }}>{t("producer.layout.menu.management")}</div>
                    {links.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`nav-item ${location.pathname === link.to ? "active" : ""}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span style={{ marginRight: "0.8rem" }}>{link.icon}</span>
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button
                        onClick={logout}
                        className="btn-secondary"
                        style={{ width: "100%", justifyContent: "center", color: "#ff4444", borderColor: "#ff4444" }}
                    >
                        <LogOut size={16} style={{ marginRight: "0.5rem" }} /> {t("producer.layout.logout")}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="layout-main">
                <header className="layout-header">
                    <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "1rem" }}>
                        <span className="badge-gold">PRODUTOR CULTURAL</span>
                    </div>
                </header>

                <div className="layout-content">
                    <div className="layout-content-inner">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};
