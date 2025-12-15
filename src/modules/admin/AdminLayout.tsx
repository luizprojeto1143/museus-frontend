import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, name } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const links = [
    { to: "/admin", label: t("admin.sidebar.dashboard"), icon: "📊" },
    { to: "/admin/obras", label: t("admin.sidebar.artworks"), icon: "🖼️" },
    { to: "/admin/trilhas", label: t("admin.sidebar.trails"), icon: "🧭" },
    { to: "/admin/eventos", label: t("admin.sidebar.events"), icon: "🎭" },
    { to: "/admin/qrcodes", label: t("admin.sidebar.qrcodes"), icon: "📱" },
    { to: "/admin/categorias", label: t("admin.sidebar.categories"), icon: "🏷️" },
    { to: "/admin/visitantes", label: t("admin.sidebar.visitors"), icon: "👥" },
    { to: "/admin/treasure-hunt", label: t("admin.sidebar.treasureHunt", "Caça ao Tesouro"), icon: "🏴‍☠️" },
    { to: "/admin/conquistas", label: t("admin.sidebar.achievements", "Conquistas"), icon: "🏅" },
    { to: "/admin/ia", label: t("admin.sidebar.ai", "Assistente IA"), icon: "🤖" },
    { to: "/admin/analytics", label: t("admin.sidebar.analytics", "Analytics"), icon: "📈" },
    { to: "/admin/uploads", label: t("admin.sidebar.uploads", "Arquivos"), icon: "📂" },
    { to: "/admin/usuarios", label: t("admin.sidebar.users", "Usuários"), icon: "👤" },
    { to: "/admin/configuracoes", label: t("admin.sidebar.settings"), icon: "⚙️" }
  ];

  return (
    <div className="layout-wrapper">
      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${isSidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`layout-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="app-brand">
            <span className="app-logo">AD</span>
            <div>
              <div className="app-title">{t("dashboard.title")}</div>
              <div className="app-subtitle">{t("admin.museums.title")}</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-content">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-item ${location.pathname === link.to ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span style={{ fontSize: "1.2rem" }}>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center" }}>
            <LanguageSwitcher style={{ position: "static" }} />
          </div>
          <button
            onClick={logout}
            className="btn btn-secondary"
            style={{ width: "100%", justifyContent: "center", borderColor: "#ef4444", color: "#ef4444" }}
          >
            {t("admin.sidebar.logout")}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="layout-main">
        <header className="layout-header">
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
            ☰
          </button>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "1rem" }}>
            <span className="welcome-text" style={{ fontSize: "0.9rem", color: "var(--fg-muted)" }}>
              {t("welcome.returning", { name: name || "Admin" })}
            </span>
            <span className="badge">ADMIN</span>
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
