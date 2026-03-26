import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { api } from "../../api/client";

import { useAuth } from "../auth/AuthContext";
import { NavPill } from "./components/NavPill";
import { HUDRPG } from "./components/HUDRPG";

import { GlobalSearch } from "./components/GlobalSearch";
import { DialerModal } from "./components/DialerModal";
import { AiChatWidget } from "./components/AiChatWidget";
import { GlobalAudioPlayer } from "./components/GlobalAudioPlayer";
import { GlobalMenu } from "./components/GlobalMenu";
import { getVisitorLinks } from "./utils/navigation";

import "./VisitorLayout.css";

// Use the custom hook for PWA installation
import { usePWAInstall } from "../../hooks/usePWA";
import { useTerminology } from "../../hooks/useTerminology";
import { useIsCityMode } from "../auth/TenantContext";
import { useVisitorTheme } from "./context/VisitorThemeProvider";
import { InstallGuideModal } from "./components/InstallGuideModal";
import { useGamification } from "../gamification/context/GamificationContext";
import { GlobalBackground } from "./components/GlobalBackground";

import { WelcomeAnimation } from "./components/WelcomeAnimation";

export const VisitorLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const { logout, name, email, tenantId, equipamentoId, isGuest } = useAuth();

  // Integrated PWA Hook
  const { canInstall, promptInstall, isInstalled } = usePWAInstall();
  // Show manual install guide if native prompt isn't valid but user wants to install
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  // Logic: Show button if NOT installed.
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
  const [showWelcome, setShowWelcome] = useState(false);
  const [isGlobalMenuOpen, setIsGlobalMenuOpen] = useState(false);

  const { currentLevel, stats, progressToNextLevel } = useGamification();

  // Theme and Features State
  const [settings, setSettings] = useState<{
    primaryColor: string;
    secondaryColor: string;
    historicalFont: boolean;
    logoUrl?: string;
    name?: string;
    frameUrl?: string;
    bannerUrl?: string;
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
    theme?: string;
  } | null>(null);

  const { setSpaceTheme } = useVisitorTheme();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (equipamentoId) {
          const res = await api.get(`/equipamentos/public/${equipamentoId}`);
          const equip = res.data;
          const mergedSettings = {
            ...equip,
            primaryColor: equip.corPrimaria || equip.tenant?.primaryColor || "#d4af37",
            secondaryColor: equip.corSecundaria || equip.tenant?.secondaryColor || "#cd7f32",
            logoUrl: equip.logoUrl || equip.tenant?.logoUrl,
            welcomeVideoUrl: equip.welcomeVideoUrl || equip.tenant?.welcomeVideoUrl,
            theme: equip.theme || equip.tenant?.theme || "dark",
            historicalFont: equip.historicalFont !== undefined ? equip.historicalFont : equip.tenant?.historicalFont,
            name: equip.nome,
          };
          setSettings(mergedSettings);
          setSpaceTheme({
            primaryColor: mergedSettings.primaryColor,
            secondaryColor: mergedSettings.secondaryColor,
            theme: (mergedSettings.theme as "light" | "dark") || "dark",
            historicalFont: mergedSettings.historicalFont
          });
        } else if (tenantId) {
          const res = await api.get(`/tenants/${tenantId}/settings`);
          const tenantSettings = res.data;
          setSettings(tenantSettings);
          setSpaceTheme({
            primaryColor: tenantSettings.primaryColor,
            secondaryColor: tenantSettings.secondaryColor,
            theme: (tenantSettings.theme as "light" | "dark") || "dark",
            historicalFont: tenantSettings.historicalFont
          });
        }
      } catch (err) {
        console.error("Error loading settings", err);
      }
    };

    fetchSettings();
  }, [tenantId, equipamentoId, setSpaceTheme]);

  // Welcome Logic: Show only once per mount/session if authenticated
  useEffect(() => {
    if (name && email && settings) {
        const storageKey = `welcome_seen_${email}`;
        if (!localStorage.getItem(storageKey)) {
            setShowWelcome(true);
        }
    }
  }, [name, email, settings]);

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

  const allLinks = getVisitorLinks(t, term, isCityMode);

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

  return (
    <div id="visitor-layout" className="layout-wrapper">

      <GlobalBackground 
        primaryColor={settings?.primaryColor} 
        secondaryColor={settings?.secondaryColor} 
        theme={(settings?.theme as "light" | "dark") || "dark"}
      />

      {/* Moldura de Tela (Frame Overlay) */}
      {settings?.frameUrl && (
        <div 
          className="tenant-frame-overlay"
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 9999,
            backgroundImage: `url(${settings.frameUrl})`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            opacity: 0.8
          }}
        />
      )}

      <header className="layout-header">
        <div className="layout-header-inner">
          <Link to="/home" className="header-logo-container">
            {settings?.logoUrl && <img src={settings.logoUrl} alt={settings.name} className="header-logo" />}
            <span className="app-title">{settings?.name || "Cultura Viva"}</span>
          </Link>
          <div className="header-actions">
             <LanguageSwitcher absolute={false} />
             <button onClick={logout} className="logout-btn-minimal" title="Sair">
               <span className="nav-icon">🚪</span>
             </button>
          </div>
        </div>
      </header>

      <NavPill onMenuClick={() => setIsGlobalMenuOpen(true)} />

      <main className="layout-main-premium">
        {isGuest && (
          <div className="guest-banner-premium">
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

        <div className="layout-content-premium">
          {children}
        </div>
      </main>

      <HUDRPG />

      <GlobalMenu 
        isOpen={isGlobalMenuOpen} 
        onClose={() => setIsGlobalMenuOpen(false)} 
        links={links}
        currentPath={location.pathname}
      />

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <DialerModal isOpen={isDialerOpen} onClose={() => setIsDialerOpen(false)} />
      <GlobalAudioPlayer />
      {settings?.featureChatAI !== false && <AiChatWidget />}
      <InstallGuideModal isOpen={showInstallGuide} onClose={() => setShowInstallGuide(false)} />

      {showWelcome && (
        <WelcomeAnimation
          name={name || "Visitante"}
          email={email || "guest"}
          videoUrl={settings?.welcomeVideoUrl}
          logoUrl={settings?.logoUrl}
          primaryColor={settings?.primaryColor}
          theme={(settings?.theme as "light" | "dark") || "dark"}
          onComplete={() => setShowWelcome(false)}
        />
      )}
    </div>
  );
};
