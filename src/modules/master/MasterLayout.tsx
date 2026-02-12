import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export const MasterLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setCollapsed] = useState(false);
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
      <aside className={`layout-sidebar ${isSidebarOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`} style={{ borderRight: "1px solid #463420", background: "linear-gradient(180deg, #1a1108 0%, #0f0a05 100%)" }}>
        <button
          className="sidebar-collapse-toggle"
          onClick={() => setCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expandir" : "Recolher"}
          style={{ borderColor: "#463420", color: "#d4af37", background: "#2c1e10" }}
        >
          {isCollapsed ? "»" : "«"}
        </button>
        <div className="sidebar-header" style={{ borderBottom: "1px solid #463420" }}>
          <div className="app-brand">
            <span className="app-logo" style={{ borderColor: "#d4af37", color: "#d4af37" }}>MT</span>
            <div>
              <div className="app-title" style={{ color: "#d4af37", fontFamily: "Georgia, serif" }}>Master Panel</div>
              <div className="app-subtitle" style={{ color: "#8b7355" }}>Gestão Global</div>
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
              title={isCollapsed ? link.label : ""}
              style={location.pathname === link.to ? { background: "linear-gradient(90deg, rgba(212, 175, 55, 0.1), transparent)", borderLeft: "3px solid #d4af37", color: "#EAE0D5" } : { color: "#8b7355" }}
            >
              <span style={{ fontSize: "1.2rem", filter: location.pathname === link.to ? "none" : "grayscale(100%) sepia(50%)" }}>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer" style={{ borderTop: "1px solid #463420" }}>
          <button
            onClick={logout}
            className="btn btn-secondary"
            style={{ width: "100%", justifyContent: "center", borderColor: "#ef4444", color: "#ef4444", background: "rgba(239, 68, 68, 0.05)" }}
          >
            <span style={{ fontSize: "1.2rem" }}>🚪</span>
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="layout-main" style={{ background: "#0f0a05" }}>
        <header className="layout-header" style={{ borderBottom: "1px solid #463420", background: "rgba(26, 17, 8, 0.9)" }}>
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)} style={{ color: "#d4af37" }}>
            ☰
          </button>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "1rem" }}>
            <span className="badge" style={{ borderColor: "#d4af37", color: "#d4af37", background: "rgba(212, 175, 55, 0.1)" }}>MASTER ADMIN</span>
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
