import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { api } from "../../api/client";

import { useAuth } from "../auth/AuthContext";
import { WelcomeAnimation } from "./components/WelcomeAnimation";

import { GlobalSearch } from "./components/GlobalSearch";
import { DialerModal } from "./components/DialerModal";
import { AiChatWidget } from "./components/AiChatWidget";

import "./VisitorLayout.css";

export const VisitorLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const { logout, name, email, tenantId } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDialerOpen, setIsDialerOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
        }
        setDeferredPrompt(null);
      });
    }
  };

  const links = [
    { to: "/home", label: t("visitor.sidebar.home"), icon: "🏠" },
    { to: "/obras", label: t("visitor.sidebar.artworks"), icon: "🎨" },
    { to: "/trilhas", label: t("visitor.sidebar.trails"), icon: "🗺️" },
    { to: "/mapa", label: t("visitor.sidebar.map", "Mapa"), icon: "📍" },
    { to: "/eventos", label: t("visitor.sidebar.events"), icon: "📅" },
    { to: "/ranking", label: t("visitor.sidebar.leaderboard", "Ranking"), icon: "🏆" },
    { to: "/chat", label: t("visitor.sidebar.aiChat", "Chat IA"), icon: "🤖" },
    { to: "/scanner", label: t("visitor.sidebar.scanner"), icon: "📸" },
    { to: "/perfil", label: t("visitor.sidebar.profile"), icon: "👤" },
    { to: "/livro-visitas", label: t("visitor.sidebar.guestbook"), icon: "✍️" },
  ];

  const renderNavLinks = (mobile = false) => (
    <>
      {links.map((link) => {
        const isActive = location.pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            onClick={() => mobile && setIsMenuOpen(false)}
            className={`app-sidebar-link ${isActive ? "active" : ""}`}
          >
            {link.icon && <span>{link.icon}</span>}
            {link.label}
          </Link>
        );
      })}
    </>
  );

  // Theme State
  const [settings, setSettings] = useState<{
    primaryColor: string;
    secondaryColor: string;
    historicalFont: boolean;
    logoUrl?: string;
    name?: string;
  } | null>(null);

  useEffect(() => {
    if (tenantId) {
      api.get(`/tenants/${tenantId}/settings`)
        .then(res => setSettings(res.data))
        .catch(console.error);
    }
  }, [tenantId]);

  const themeStyles = settings ? {
    "--primary-color": settings.primaryColor,
    "--secondary-color": settings.secondaryColor,
    fontFamily: settings.historicalFont ? "Georgia, serif" : "system-ui"
  } as React.CSSProperties : {};

  return (
    <div id="visitor-layout" className="layout-wrapper" style={themeStyles}>
      {showWelcome && name && email && (
        <WelcomeAnimation
          name={name}
          email={email}
          onComplete={() => setShowWelcome(false)}
        />
      )}

      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${isMenuOpen ? "open" : ""}`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* SIDEBAR */}
      <aside className={`layout-sidebar ${isMenuOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="app-brand">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="app-logo-img" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "contain" }} />
            ) : (
              <span className="app-logo">CV</span>
            )}
            <div>
              <div className="app-title">{settings?.name || t("welcome.title")}</div>
              <div className="app-subtitle">{t("visitor.sidebar.home")}</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-content">
          <button
            onClick={() => { setIsMenuOpen(false); setIsSearchOpen(true); }}
            className="nav-item sidebar-action-btn"
            style={{ justifyContent: 'flex-start' }}
          >
            🔍 {t("visitor.search.title", "Buscar")}
          </button>
          <button
            onClick={() => { setIsMenuOpen(false); setIsDialerOpen(true); }}
            className="nav-item sidebar-action-btn"
            style={{ justifyContent: 'flex-start' }}
          >
            🔢 {t("visitor.dialer.button", "Digitar Código")}
          </button>

          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className={`nav-item ${isActive ? "active" : ""}`}
              >
                {link.icon && <span>{link.icon}</span>}
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="btn btn-primary"
              style={{ width: "100%", marginBottom: "0.5rem" }}
            >
              ⬇️ {t("visitor.sidebar.installApp", "Instalar App")}
            </button>
          )}
          <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center" }}>
            <LanguageSwitcher style={{ position: "static" }} />
          </div>
          <button
            onClick={() => navigate("/select-museum")}
            className="btn btn-secondary"
            style={{ width: "100%", marginBottom: "0.5rem" }}
          >
            {t("visitor.sidebar.changeMuseum")}
          </button>
          <button
            onClick={logout}
            className="btn btn-logout"
            style={{ width: "100%", color: "#ef4444", borderColor: "#ef4444" }}
          >
            {t("visitor.sidebar.logout")}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="layout-main">
        <header className="layout-header">
          {/* Mobile Toggle */}
          <button className="menu-toggle" onClick={() => setIsMenuOpen(true)}>
            ☰
          </button>

          {/* Desktop/Mobile Common Header Items (if any, e.g. User Profile or Spacer) */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              className="btn btn-secondary icon-btn mobile-only"
              style={{ display: 'flex' }}
              onClick={() => setIsSearchOpen(true)}
            >
              🔍
            </button>
            <button
              className="btn btn-secondary icon-btn mobile-only"
              style={{ display: 'flex' }}
              onClick={() => setIsDialerOpen(true)}
            >
              🔢
            </button>
          </div>
        </header>

        <div className="layout-content">
          <div className="layout-content-inner">
            {children}
          </div>
        </div>
      </main>

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <DialerModal isOpen={isDialerOpen} onClose={() => setIsDialerOpen(false)} />
      <AiChatWidget />
    </div>
  );
};
