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
import { useVisitorTheme } from "./context/VisitorThemeProvider";
import { InstallGuideModal } from "./components/InstallGuideModal";

export const VisitorLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const { logout, name, email, tenantId, isGuest } = useAuth();

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
    // Media
    welcomeVideoUrl?: string;
  } | null>(null);

  const { setSpaceTheme } = useVisitorTheme();

  useEffect(() => {
    if (tenantId) {
      api.get(`/tenants/${tenantId}/settings`)
        .then(res => {
          setSettings(res.data);
          if (res.data?.primaryColor) {
            setSpaceTheme({
              primaryColor: res.data.primaryColor,
              secondaryColor: res.data.secondaryColor,
              theme: "dark"
            });
          }
        })
        .catch(console.error);
    }
  }, [tenantId, setSpaceTheme]);

  // Check if visitor is a teacher
  const [isTeacher, setIsTeacher] = useState(false);
  useEffect(() => {
    if (tenantId && email) {
      api.get(`/visitors/me`)
        .then(res => setIsTeacher(res.data?.isTeacher || false))
        .catch(() => { });
    }
  }, [tenantId, email]);

  const term = useTerminology();
  const isCityMode = useIsCityMode();

  const allLinks = [
    { to: "/home", label: t("visitor.sidebar.home"), icon: <span className="nav-icon">🏠</span>, feature: null },
    { to: "/obras", label: term.works, icon: <span className="nav-icon">{isCityMode ? "🏛️" : "🎨"}</span>, feature: "featureWorks" },
    { to: "/trilhas", label: term.trails, icon: <span className="nav-icon">🗺️</span>, feature: "featureTrails" },
    { to: "/mapa", label: t("visitor.sidebar.map", "Mapa"), icon: <span className="nav-icon">📍</span>, feature: null },
    { to: "/eventos", label: t("visitor.sidebar.events"), icon: <span className="nav-icon">📅</span>, feature: "featureEvents" },
    { to: "/desafios", label: t("visitor.sidebar.challenges", "Desafios"), icon: <span className="nav-icon">🎯</span>, feature: "featureGamification" },
    { to: "/loja", label: t("visitor.sidebar.shop", "Loja"), icon: <span className="nav-icon">🛒</span>, feature: "featureShop" },
    { to: "/ranking", label: t("visitor.sidebar.leaderboard", "Ranking"), icon: <span className="nav-icon">🏆</span>, feature: "featureGamification" },
    { to: "/favoritos", label: t("visitor.sidebar.favorites", "Favoritos"), icon: <span className="nav-icon">❤️</span>, feature: "featureReviews" },
    { to: "/chat", label: t("visitor.sidebar.aiChat", "Chat IA"), icon: <span className="nav-icon">🤖</span>, feature: "featureChatAI" },
    { to: "/scanner", label: t("visitor.sidebar.scanner", "Scanner"), icon: <span className="nav-icon">📷</span>, feature: "featureQRCodes" },
    { to: "/perfil", label: t("visitor.sidebar.profile"), icon: <span className="nav-icon">👤</span>, feature: null },
    { to: "/rpg", label: "Meu Personagem", icon: <span className="nav-icon">🗡️</span>, feature: "featureGamification" },
    { to: "/colecao", label: "Colecionáveis", icon: <span className="nav-icon">✨</span>, feature: "featureGamification" },
    { to: "/meus-certificados", label: "Meus Certificados", icon: <span className="nav-icon">🏅</span>, feature: "featureCertificates" },
  ];

  const links = allLinks.filter(link => {
    if (link.feature === "teacherOnly") return isTeacher;
    if (!link.feature) return true;
    if (!settings) return true;
    return (settings as Record<string, unknown>)[link.feature] !== false;
  });

  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);
  const increaseFontSize = () => setFontSizeMultiplier(prev => Math.min(prev + 0.2, 1.6));
  const decreaseFontSize = () => setFontSizeMultiplier(prev => Math.max(prev - 0.2, 0.8));

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSizeMultiplier * 100}%`;
    return () => { document.documentElement.style.fontSize = ""; };
  }, [fontSizeMultiplier]);

  const themeStyles = settings ? {
    "--primary-color": settings.primaryColor,
    "--secondary-color": settings.secondaryColor,
    "--bg-primary": isCityMode ? "#060b13" : "#0d0a08",
    fontFamily: settings.historicalFont ? "Georgia, serif" : "Inter, sans-serif",
  } as React.CSSProperties : {};

  return (
    <div id="visitor-layout" className="layout-wrapper" style={themeStyles}>
      {/* AMBIENT GLOWS */}
      <div className="visitor-ambient-bg">
        <div className="ambient-glow" style={{ background: settings?.primaryColor || '#D4AF37', top: '-10%', left: '-10%' }} />
        <div className="ambient-glow" style={{ background: settings?.secondaryColor || '#B5952F', bottom: '-10%', right: '-10%', animationDelay: '-5s' }} />
      </div>

      {showWelcome && name && email && (
        <WelcomeAnimation
          name={name}
          email={email}
          videoUrl={settings?.welcomeVideoUrl}
          onComplete={() => {
            setShowWelcome(false);
            sessionStorage.setItem("hasSeenWelcome", "true");
          }}
        />
      )}

      <div className={`mobile-overlay ${isMenuOpen ? "open" : ""}`} onClick={() => setIsMenuOpen(false)} />

      <aside className={`layout-sidebar ${isMenuOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="app-brand">
            <img 
              src={settings?.logoUrl || "/logo-culturaviva.jpg"} 
              alt="Logo" 
              className="app-logo-img" 
            />
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
          >
            <span className="nav-icon">🔍</span> {t("visitor.search.title", "Buscar")}
          </button>
          
          <button
            onClick={() => { setIsMenuOpen(false); setIsDialerOpen(true); }}
            className="nav-item sidebar-action-btn"
          >
            <span className="nav-icon">🔢</span> {t("visitor.dialer.button", "Código")}
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
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {shouldShowInstallButton && (
            <button onClick={handleInstallClick} className="btn btn-primary w-full gap-2">
              ⬇️ {t("visitor.sidebar.installApp", "Instalar App")}
            </button>
          )}
          <LanguageSwitcher style={{ position: "static" }} />
          <button onClick={() => navigate("/select-museum")} className="btn btn-secondary w-full text-[10px]">
            {t("visitor.sidebar.changeMuseum")}
          </button>
          <button onClick={logout} className="btn btn-secondary w-full text-[10px] text-red-500 border-red-500/30">
            {t("visitor.sidebar.logout")}
          </button>
        </div>
      </aside>

      <main className="layout-main">
        {isGuest && (
          <div className="guest-banner">
            <span>✨ {t("visitor.layout.VocEstExplorandoComoVisitanteCrieUmaCont", `Explore como visitante ou crie uma conta para ganhar selos!`)}</span>
            <button
              className="guest-banner-btn"
              onClick={() => navigate("/register", {
                state: { tenantId, tenantName: settings?.name || "Museu" }
              })}
            >
              Criar Conta
            </button>
          </div>
        )}

        <header className="layout-header">
          <button className="menu-toggle" onClick={() => setIsMenuOpen(true)}>
            ☰
          </button>

          <div className="flex items-center gap-2">
            {settings?.featureAccessibility !== false && (
              <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
                <button className="h-8 px-3 text-xs font-black hover:bg-white/10 rounded-lg" onClick={decreaseFontSize}>A-</button>
                <button className="h-8 px-3 text-xs font-black hover:bg-white/10 rounded-lg" onClick={increaseFontSize}>A+</button>
              </div>
            )}
            <button className="menu-toggle lg:hidden" onClick={() => setIsSearchOpen(true)}>🔍</button>
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

      <nav className="mobile-bottom-nav">
        {[
          { to: "/home", label: "Início", icon: "🏠" },
          { to: "/scanner", label: "Scan", icon: "📷" },
          { to: "/mapa", label: "Mapa", icon: "📍" },
          { to: "/passaporte", label: "Selos", icon: "🎫" },
        ].map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`bottom-nav-item ${location.pathname === item.to ? "active" : ""}`}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        ))}
        <button className="bottom-nav-item" onClick={() => setIsMenuOpen(true)}>
          <span className="bottom-nav-icon">☰</span>
          <span className="bottom-nav-label">Menu</span>
        </button>
      </nav>
    </div>
  );
};
