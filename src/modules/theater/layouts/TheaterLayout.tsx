import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../../components/LanguageSwitcher";
import { 
  LayoutDashboard, 
  Theater, 
  Armchair, 
  Users2, 
  Zap, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  FileText,
  Ticket
} from "lucide-react";
import "./TheaterLayout.css";

interface TheaterLayoutProps {
  children: React.ReactNode;
}

export const TheaterLayout: React.FC<TheaterLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { name, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { path: "/theater", label: "Painel Geral", icon: <LayoutDashboard size={20} /> },
    { path: "/theater/sessoes", label: "Sessões e Bilheteria", icon: <Ticket size={20} /> },
    { path: "/theater/assentos", label: "Mapa de Assentos", icon: <Armchair size={20} /> },
    { path: "/theater/playbill", label: "Programação (Playbill)", icon: <FileText size={20} /> },
    { path: "/theater/elenco", label: "Elenco e Staff", icon: <Users2 size={20} /> },
    { path: "/theater/theater-club", label: "Clube de Teatro", icon: <Theater size={20} /> },
  ];

  const getInitials = (n: string) => n.split(" ").map(p => p[0]).join("").toUpperCase().substring(0, 2);

  return (
    <div className="theater-layout-container">
      {/* Sidebar for Desktop */}
      <aside className={`theater-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <Theater size={28} className="text-gold" />
          <span className="sidebar-title">Cultura Viva <small>Teatro</small></span>
          <button className="mobile-close-btn" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`menu-item ${isActive ? "active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">{name ? getInitials(name) : "OP"}</div>
            <div className="user-info">
              <span className="user-name">{name || "Operador"}</span>
              <span className="user-role">Bilheteria/Teatro</span>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>
            <LogOut size={18} />
            <span>{t("common.logout", "Sair")}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="theater-main-content">
        <header className="theater-header">
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="header-actions">
            <LanguageSwitcher />
          </div>
        </header>

        <main className="theater-page-wrapper">
          {children}
        </main>
      </div>
    </div>
  );
};
