import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export const MasterLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const links = [
    { to: "/master", label: "Dashboard", icon: "📊" },
    { to: "/master/messages", label: "Caixa de Entrada", icon: "📨" }, // NEW
    { to: "/master/tenants", label: "Museus / Tenants", icon: "🏛️" },
    { to: "/master/users", label: "Usuários", icon: "👥" },
    { to: "/master/providers", label: "Prestadores", icon: "🛠️" }, // NEW
    { to: "/master/seeder", label: "Traffic Gen", icon: "🚦" }, // Assuming 'Users' was a placeholder and 'path' was meant for 'to'
    { to: "/master/achievements", label: "Conquistas", icon: "🏆" },
    { to: "/master/audit-logs", label: "Logs de Auditoria", icon: "📋" },
    { to: "/master/accessibility-requests", label: "Acessibilidade", icon: "♿" },
    { to: "/master/system-health", label: "Saúde do Sistema", icon: "🖥️" }
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
            <span className="app-logo" style={{ borderColor: "#5eead4", color: "#5eead4" }}>MT</span>
            <div>
              <div className="app-title" style={{ color: "#5eead4" }}>Master Panel</div>
              <div className="app-subtitle">Gestão Global</div>
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
          <button
            onClick={logout}
            className="btn btn-secondary"
            style={{ width: "100%", justifyContent: "center", borderColor: "#ef4444", color: "#ef4444" }}
          >
            Sair
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
            <span className="badge" style={{ borderColor: "#5eead4", color: "#5eead4" }}>MASTER ADMIN</span>
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
