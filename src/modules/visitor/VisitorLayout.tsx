import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";

import { useAuth } from "../auth/AuthContext";
import { WelcomeAnimation } from "./components/WelcomeAnimation";

import { GlobalSearch } from "./components/GlobalSearch";
import { AiChatWidget } from "./components/AiChatWidget";

export const VisitorLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { logout, name, email } = useAuth();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          // accepted
        } else {
          // dismissed
        }
        setDeferredPrompt(null);
      });
    }
  };


  const links = [
    { to: "/", label: t("visitor.sidebar.home") },
    { to: "/obras", label: t("visitor.sidebar.artworks") },
    { to: "/trilhas", label: t("visitor.sidebar.trails") },
    { to: "/mapa", label: t("visitor.sidebar.map", "Mapa"), icon: "🗺️" },
    { to: "/eventos", label: t("visitor.sidebar.events") },
    { to: "/agendamento", label: t("visitor.sidebar.scheduling", "Agendamento"), icon: "📅" },
    { to: "/favoritos", label: t("visitor.sidebar.favorites") },
    { to: "/chat", label: t("visitor.sidebar.aiChat") },
    { to: "/roteiro-inteligente", label: t("visitor.sidebar.smartItinerary", "Roteiro Inteligente"), icon: "🤖" },
    { to: "/scanner", label: t("visitor.sidebar.scanner", "QR Scanner"), icon: "📷" },
    { to: "/scanner-visual", label: t("visitor.sidebar.visualScanner", "Scanner Visual (IA)"), icon: "👁️" },
    { to: "/caca-tesouro", label: t("visitor.sidebar.treasureHunt", "Caça ao Tesouro"), icon: "🏴‍☠️" },
    { to: "/livro-visitas", label: t("visitor.sidebar.guestbook", "Livro de Visitas"), icon: "📖" },
    { to: "/souvenir", label: t("visitor.sidebar.souvenir") },
    { to: "/passaporte", label: t("visitor.sidebar.passport") },
    { to: "/conquistas", label: t("visitor.sidebar.achievements", "Conquistas"), icon: "🏆" },
    { to: "/ranking", label: t("visitor.sidebar.leaderboard", "Ranking"), icon: "📊" }
  ];

  // NavLinks logic moved to render or separate component
  const renderNavLinks = (mobile = false) => (
    <>
      {links.map((link) => {
        const isActive = location.pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            onClick={() => mobile && setIsMenuOpen(false)}
            className="app-nav-link"
            style={{
              backgroundColor: isActive ? "rgba(15,23,42,0.06)" : "transparent",
              fontSize: mobile ? "1.1rem" : "0.85rem",
              justifyContent: mobile ? "center" : "flex-start"
            }}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );

  const [showWelcome, setShowWelcome] = React.useState(false);

  React.useEffect(() => {
    if (location.state?.justLoggedIn) {
      setShowWelcome(true);
      // Limpar o state para não mostrar novamente ao recarregar (opcional, mas bom pra UX)
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div className="app-shell">
      {showWelcome && name && email && (
        <WelcomeAnimation
          name={name}
          email={email}
          onComplete={() => setShowWelcome(false)}
        />
      )}

      {/* SIDEBAR (Desktop) */}
      <aside className="app-sidebar">
        {/* ... existing brand ... */}
        <div className="app-brand" style={{ marginBottom: "1rem" }}>
          <span className="app-logo">CV</span>
          <div>
            <div className="app-title">{t("welcome.title")}</div>
            <div className="app-subtitle">{t("visitor.sidebar.home")}</div>
          </div>
        </div>

        <nav className="app-sidebar-nav">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="app-sidebar-link"
            style={{ textAlign: "left", cursor: "pointer", background: "none", border: "none", width: "100%" }}
          >
            🔍 {t("visitor.search.title", "Buscar")}
          </button>
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`app-sidebar-link ${isActive ? "active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "flex-start", marginBottom: "0.5rem" }}
            >
              ⬇️ {t("visitor.sidebar.installApp", "Instalar App")}
            </button>
          )}
          <div style={{ padding: "0.5rem", display: "flex", justifyContent: "center" }}>
            <LanguageSwitcher style={{ position: "static" }} />
          </div>
          <button
            onClick={() => window.location.href = "/select-museum"}
            className="btn btn-secondary"
            style={{ width: "100%", justifyContent: "flex-start" }}
          >
            {t("visitor.sidebar.changeMuseum")}
          </button>
          <button
            onClick={logout}
            className="btn"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              color: "#ef4444",
              borderColor: "rgba(239, 68, 68, 0.5)",
              width: "100%",
              justifyContent: "flex-start"
            }}
          >
            {t("visitor.sidebar.logout")}
          </button>
        </div>
      </aside>

      {/* HEADER (Mobile Only) */}
      <header className="app-header mobile-only">
        <div className="app-brand">
          <span className="app-logo">CV</span>
          <div>
            <div className="app-title">{t("welcome.title")}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className="btn btn-secondary"
            onClick={() => setIsSearchOpen(true)}
            style={{ padding: "0.5rem", fontSize: "1.2rem", border: "none", boxShadow: "none" }}
          >
            🔍
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setIsMenuOpen(true)}
            style={{ padding: "0.5rem", fontSize: "1.5rem", border: "none", boxShadow: "none" }}
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>
          <button
            className="mobile-menu-close"
            onClick={() => setIsMenuOpen(false)}
          >
            ×
          </button>

          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <div className="app-title" style={{ fontSize: "1.5rem" }}>Menu</div>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto" }}>
            {renderNavLinks(true)}
          </nav>

          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "1rem", paddingBottom: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <LanguageSwitcher style={{ position: "static" }} />
            </div>
            <button
              onClick={() => window.location.href = "/select-museum"}
              className="btn btn-secondary"
            >
              {t("visitor.sidebar.changeMuseum")}
            </button>
            <button
              onClick={logout}
              className="btn"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
                borderColor: "rgba(239, 68, 68, 0.5)"
              }}
            >
              {t("visitor.sidebar.logout")}
            </button>
          </div>
        </div>
      </header>

      <main className="app-content">{children}</main>

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <AiChatWidget />
    </div>
  );
};
