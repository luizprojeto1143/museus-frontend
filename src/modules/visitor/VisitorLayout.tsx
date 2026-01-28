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
import { GlobalAudioPlayer } from "./components/GlobalAudioPlayer";

import "./VisitorLayout.css";

// Use the custom hook for PWA installation
import { usePWAInstall } from "../../hooks/usePWA";
import { useTerminology } from "../../hooks/useTerminology";
import { useIsCityMode } from "../auth/TenantContext";
import { InstallGuideModal } from "./components/InstallGuideModal";

export const VisitorLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const { logout, name, email, tenantId } = useAuth();

  // Integrated PWA Hook
  const { canInstall, promptInstall, isInstalled } = usePWAInstall();
  // Show manual install guide if native prompt isn't valid but user wants to install
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  // Logic: Show button if NOT installed.
  // If canInstall (native) => promptInstall
  // If NOT canInstall => showInstallGuide (iOS / Manual)
  const shouldShowInstallButton = !isInstalled;

  const handleInstallClick = () => {
    if (canInstall) {
      promptInstall();
    } else {
      setShowInstallGuide(true);
    }
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDialerOpen, setIsDialerOpen] = useState(false);

  // Fix: Check session storage so it doesn't show on every route change
  const [showWelcome, setShowWelcome] = useState(() => {
    return !sessionStorage.getItem("hasSeenWelcome");
  });

  // Theme and Features State
  const [settings, setSettings] = useState<{
    primaryColor: string;
    secondaryColor: string;
    historicalFont: boolean;
    logoUrl?: string;
    name?: string;
    // Feature Flags
    featureWorks?: boolean;
    featureTrails?: boolean;
    featureEvents?: boolean;
    featureGamification?: boolean;
    featureQRCodes?: boolean;
    featureChatAI?: boolean;
    featureShop?: boolean;
    featureDonations?: boolean;
    featureCertificates?: boolean;
    featureReviews?: boolean;
    featureGuestbook?: boolean;
    featureAccessibility?: boolean;
  } | null>(null);

  useEffect(() => {
    if (tenantId) {
      api.get(`/tenants/${tenantId}/settings`)
        .then(res => setSettings(res.data))
        .catch(console.error);
    }
  }, [tenantId]);

  const term = useTerminology();
  const isCityMode = useIsCityMode();

  const allLinks = [
    { to: "/home", label: t("visitor.sidebar.home"), icon: "🏠", feature: null }, // Always visible
    { to: "/obras", label: term.works, icon: isCityMode ? "🏛️" : "🎨", feature: "featureWorks" },
    { to: "/trilhas", label: term.trails, icon: "🗺️", feature: "featureTrails" },
    { to: "/mapa", label: t("visitor.sidebar.map", "Mapa"), icon: "📍", feature: null }, // Always visible
    { to: "/eventos", label: t("visitor.sidebar.events"), icon: "📅", feature: "featureEvents" },
    { to: "/desafios", label: t("visitor.sidebar.challenges", "Desafios"), icon: "🎯", feature: "featureGamification" },
    { to: "/loja", label: t("visitor.sidebar.shop", "Loja"), icon: "🛒", feature: "featureShop" },
    { to: "/ranking", label: t("visitor.sidebar.leaderboard", "Ranking"), icon: "🏆", feature: "featureGamification" },
    { to: "/favoritos", label: t("visitor.sidebar.favorites", "Favoritos"), icon: "❤️", feature: "featureReviews" },
    { to: "/chat", label: t("visitor.sidebar.aiChat", "Chat IA"), icon: "🤖", feature: "featureChatAI" },
    { to: "/scanner", label: t("visitor.sidebar.scanner", "Scanner"), icon: "📷", feature: "featureQRCodes" },
    { to: "/perfil", label: t("visitor.sidebar.profile"), icon: "👤", feature: null }, // Always visible
    { to: "/livro-visitas", label: t("visitor.sidebar.guestbook"), icon: "✍️", feature: "featureGuestbook" },
  ];

  // Filter links based on tenant features
  const links = allLinks.filter(link => {
    if (!link.feature) return true; // Always show links without feature requirement
    if (!settings) return true; // Show all while loading
    return (settings as Record<string, unknown>)[link.feature] !== false;
  });

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
          onComplete={() => {
            setShowWelcome(false);
            sessionStorage.setItem("hasSeenWelcome", "true");
          }}
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
              <img src={settings.logoUrl} alt="Logo" className="app-logo-img" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <span className="app-logo">CV</span>
            )}
            <div>
              <div className="app-title">{settings?.name || "Cultura Viva"}</div>
              <div className="app-subtitle">{t("visitor.home.subtitle", "Museus & Cidades Históricas")}</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-content">
          <button
            onClick={() => { setIsMenuOpen(false); setIsSearchOpen(true); }}
            className="nav-item sidebar-action-btn"
            style={{ justifyContent: 'flex-start' }}
          >
            <span>🔍</span> {t("visitor.search.title", "Buscar")}
          </button>
          <button
            onClick={() => { setIsMenuOpen(false); setIsDialerOpen(true); }}
            className="nav-item sidebar-action-btn"
            style={{ justifyContent: 'flex-start' }}
          >
            <span>🔢</span> {t("visitor.dialer.button", "Digitar Código")}
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
                {link.icon && <span style={{ fontSize: "1.2rem" }}>{link.icon}</span>}
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer" style={{ flexShrink: 0 }}>
          {shouldShowInstallButton && (
            <button
              onClick={handleInstallClick}
              className="btn btn-primary"
              style={{ width: "100%", marginBottom: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
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
            style={{ width: "100%", marginBottom: "0.5rem", fontSize: "0.9rem" }}
          >
            {t("visitor.sidebar.changeMuseum")}
          </button>
          <button
            onClick={logout}
            className="btn btn-secondary"
            style={{ width: "100%", color: "#ef4444", borderColor: "#ef4444", fontSize: "0.9rem" }}
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
      <GlobalAudioPlayer />
      {settings?.featureChatAI !== false && <AiChatWidget />}
      <InstallGuideModal isOpen={showInstallGuide} onClose={() => setShowInstallGuide(false)} />
    </div>
  );
};
