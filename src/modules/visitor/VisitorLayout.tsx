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
    { to: "/guestbook", label: t("visitor.sidebar.guestbook"), icon: "✍️" },
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
    <div id="visitor-layout" className="app-shell" style={themeStyles}>
      {showWelcome && name && email && (
        <WelcomeAnimation
          name={name}
          email={email}
          onComplete={() => setShowWelcome(false)}
        />
      )}

      {/* SIDEBAR (Desktop) */}
      <aside className="app-sidebar">
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

        <nav className="app-sidebar-nav">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="app-sidebar-link"
          >
            🔍 {t("visitor.search.title", "Buscar")}
          </button>
          <button
            onClick={() => setIsDialerOpen(true)}
            className="app-sidebar-link"
          >
            🔢 {t("visitor.dialer.button", "Digitar Código")}
          </button>
          {renderNavLinks(false)}
        </nav>

        <div className="app-sidebar-footer">
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="btn btn-primary"
            >
              ⬇️ {t("visitor.sidebar.installApp", "Instalar App")}
            </button>
          )}
          <div style={{ padding: "0.5rem", display: "flex", justifyContent: "center" }}>
            <LanguageSwitcher style={{ position: "static" }} />
          </div>
          <button
            onClick={() => navigate("/select-museum")}
            className="btn btn-secondary"
          >
            {t("visitor.sidebar.changeMuseum")}
          </button>
          <button
            onClick={logout}
            className="btn btn-logout"
          >
            {t("visitor.sidebar.logout")}
          </button>
        </div>
      </aside>

      {/* HEADER (Mobile Only) */}
      <header className="app-header mobile-only">
        <div className="app-brand">
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="app-logo-img" style={{ width: 32, height: 32, borderRadius: 6, objectFit: "contain" }} />
          ) : (
            <span className="app-logo">CV</span>
          )}
          <div>
            <div className="app-title">{settings?.name || t("welcome.title")}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className="btn btn-secondary icon-btn"
            onClick={() => setIsSearchOpen(true)}
          >
            🔍
          </button>
          <button
            className="btn btn-secondary icon-btn"
            onClick={() => setIsDialerOpen(true)}
          >
            🔢
          </button>
          <button
            className="btn btn-secondary icon-btn"
            onClick={() => setIsMenuOpen(true)}
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu Backdrop */}
        {isMenuOpen && (
          <div
            className="mobile-menu-backdrop"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        {/* Mobile Menu Drawer */}
        <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>
          <button
            className="mobile-menu-close"
            onClick={() => setIsMenuOpen(false)}
          >
            ×
          </button>

          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <div className="app-title" style={{ fontSize: "1.5rem" }}>{t("common.menu", "Menu")}</div>
          </div>

          <nav className="app-sidebar-nav">
            {renderNavLinks(true)}
            <button
              onClick={() => { setIsMenuOpen(false); setIsSearchOpen(true); }}
              className="app-sidebar-link"
            >
              🔍 {t("visitor.search.title", "Buscar")}
            </button>
            <button
              onClick={() => { setIsMenuOpen(false); setIsDialerOpen(true); }}
              className="app-sidebar-link"
            >
              🔢 {t("visitor.dialer.button", "Digitar Código")}
            </button>
          </nav>

          <div className="app-sidebar-footer">
            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="btn btn-primary"
              >
                ⬇️ {t("visitor.sidebar.installApp", "Instalar App")}
              </button>
            )}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <LanguageSwitcher style={{ position: "static" }} />
            </div>
            <button
              onClick={() => navigate("/select-museum")}
              className="btn btn-secondary"
            >
              {t("visitor.sidebar.changeMuseum")}
            </button>
            <button
              onClick={logout}
              className="btn btn-logout"
            >
              {t("visitor.sidebar.logout")}
            </button>
          </div>
        </div>
      </header>

      <main className="app-content">{children}</main>

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <DialerModal isOpen={isDialerOpen} onClose={() => setIsDialerOpen(false)} />
      <AiChatWidget />
    </div>
  );
};
