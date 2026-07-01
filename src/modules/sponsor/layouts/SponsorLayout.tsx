import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  Building2, 
  BarChart3, 
  Handshake, 
  Award, 
  LogOut, 
  Menu, 
  X, 
  User as UserIcon,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import "./SponsorLayout.css";

export const SponsorLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      path: "/sponsor/dashboard",
      label: "Painel de Impacto",
      icon: <BarChart3 size={20} />
    },
    {
      path: "/sponsor/opportunities",
      label: "Buscar Oportunidades",
      icon: <Handshake size={20} />
    },
    {
      path: "/sponsor/contracts",
      label: "Meus Contratos & Marca",
      icon: <Building2 size={20} />
    },
    {
      path: "/sponsor/certificates",
      label: "Certificados Culturais",
      icon: <Award size={20} />
    }
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="sponsor-dashboard-layout">
      {/* Sidebar Desktop */}
      <aside className="sponsor-sidebar">
        <div className="sponsor-sidebar-header">
          <ShieldCheck size={28} className="text-amber-500" />
          <div>
            <h2 className="logo-text">Cultura Viva</h2>
            <span className="logo-badge">PATROCINADOR</span>
          </div>
        </div>

        <nav className="sponsor-sidebar-nav">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sponsor-nav-link ${isActive ? "active" : ""}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sponsor-sidebar-footer">
          <div className="sponsor-user-info">
            <div className="user-avatar">
              <UserIcon size={18} />
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name || "Patrocinador"}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="sponsor-logout-btn">
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Layout Mobile */}
      <div className="sponsor-main-wrapper">
        <header className="sponsor-mobile-header">
          <div className="sponsor-brand">
            <ShieldCheck size={24} className="text-amber-500" />
            <span className="brand-title">CULTURA VIVA</span>
          </div>
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {mobileMenuOpen && (
          <div className="sponsor-mobile-menu">
            <nav className="sponsor-mobile-nav">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`sponsor-nav-link ${isActive ? "active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }} 
                className="sponsor-nav-link text-red-500 logout-link"
              >
                <LogOut size={20} />
                <span>Sair da Conta</span>
              </button>
            </nav>
          </div>
        )}

        <main className="sponsor-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
