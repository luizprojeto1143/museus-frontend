import { logger } from "@/utils/logger";
import { storage } from "@/utils/storage";

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { api } from "../../api/client";
import { ThemeToggle } from "./components/ThemeToggle";

import { useAuth } from "../auth/AuthContext";
import { NavPill } from "./components/NavPill";

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
import { isAxiosError } from "axios";

type VisitorThemeMode = "light" | "dark";

interface VisitorSettingsBase {
  primaryColor: string;
  secondaryColor: string;
  historicalFont: boolean;
  logoUrl?: string;
  name?: string;
  frameUrl?: string;
  bannerUrl?: string;
  welcomeVideoUrl?: string;
  theme?: VisitorThemeMode;
  fontFamily?: string;
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
}

interface VisitorSettings extends VisitorSettingsBase {
  [key: string]: string | boolean | undefined;
}

type PublicTenantSettingsResponse = Partial<VisitorSettingsBase>;

interface PublicEquipmentResponse extends Partial<VisitorSettingsBase> {
  nome?: string;
  corPrimaria?: string;
  corSecundaria?: string;
  fontePrincipal?: string;
  tenant?: Partial<VisitorSettingsBase>;
}

interface VisitorMeResponse {
  isTeacher?: boolean;
}

function normalizeTheme(theme: unknown): VisitorThemeMode {
  return theme === "light" ? "light" : "dark";
}

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
  const _shouldShowInstallButton = !isInstalled;

  const _handleInstallClick = () => {
    if (canInstall) {
      promptInstall();
    } else {
      setShowInstallGuide(true);
    }
  };

  const [_isMenuOpen, _setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDialerOpen, setIsDialerOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isGlobalMenuOpen, setIsGlobalMenuOpen] = useState(false);

  const { currentLevel: _currentLevel, stats: _stats, progressToNextLevel: _progressToNextLevel } = useGamification();

  // Theme and Features State
  const [settings, setSettings] = useState<VisitorSettings | null>(null);

  const { setSpaceTheme } = useVisitorTheme();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (equipamentoId) {
          const res = await api.get<PublicEquipmentResponse>(`/equipamentos/public/${equipamentoId}`);
          const equip = res.data;
          const { tenant: _tenant, ...equipSettings } = equip;
          const mergedSettings: VisitorSettings = {
            ...equipSettings,
            primaryColor: equip.corPrimaria || equip.tenant?.primaryColor || "var(--accent-primary)",
            secondaryColor: equip.corSecundaria || equip.tenant?.secondaryColor || "var(--accent-secondary)",
            logoUrl: equip.logoUrl || equip.tenant?.logoUrl,
            bannerUrl: equip.bannerUrl || equip.tenant?.bannerUrl,
            frameUrl: equip.frameUrl || equip.tenant?.frameUrl,
            welcomeVideoUrl: equip.welcomeVideoUrl || equip.tenant?.welcomeVideoUrl,
            theme: normalizeTheme(equip.theme || equip.tenant?.theme),
            historicalFont: equip.historicalFont !== undefined ? Boolean(equip.historicalFont) : Boolean(equip.tenant?.historicalFont),
            name: equip.nome,
            fontFamily: equip.fontePrincipal || equip.tenant?.fontFamily || "'Inter', sans-serif"
          };
          setSettings(mergedSettings);
          setSpaceTheme({
            primaryColor: mergedSettings.primaryColor,
            secondaryColor: mergedSettings.secondaryColor,
            theme: mergedSettings.theme || "dark",
            historicalFont: mergedSettings.historicalFont
          });
        } else if (tenantId && tenantId !== "undefined" && tenantId !== "null") {
          try {
            const res = await api.get<PublicTenantSettingsResponse>(`/tenants/${tenantId}/settings`);
            const tenantSettings: VisitorSettings = {
              primaryColor: res.data.primaryColor || "var(--accent-primary)",
              secondaryColor: res.data.secondaryColor || "var(--accent-secondary)",
              historicalFont: Boolean(res.data.historicalFont),
              ...res.data,
              theme: normalizeTheme(res.data.theme)
            };
            setSettings(tenantSettings);
            setSpaceTheme({
              primaryColor: tenantSettings.primaryColor || "var(--accent-primary)",
              secondaryColor: tenantSettings.secondaryColor || "var(--accent-secondary)",
              theme: tenantSettings.theme || "dark",
              historicalFont: tenantSettings.historicalFont
            });
          } catch (apiErr: unknown) {
            if (!isAxiosError(apiErr) || apiErr.response?.status !== 404) {
               logger.warn("Could not load tenant settings", apiErr);
            }
          }
        }
      } catch (_err: unknown) {
        // Silently skip if it's just a non-existent public equipamento or tenant
        // console.debug("Settings not loaded", err);
      }
    };

    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, equipamentoId]);

  // Welcome Logic: Show only once per mount/session if authenticated
  useEffect(() => {
    if (name && email && settings) {
        const storageKey = `welcome_seen_${email}`;
        if (!storage.get(storageKey)) {
            setShowWelcome(true);
        }
    }
  }, [name, email, settings]);

  // Check if visitor is a teacher
  const [isTeacher, setIsTeacher] = useState(false);
  useEffect(() => {
    if (tenantId && email) {
      api.get<VisitorMeResponse>(`/visitors/me`)
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
    return settings[link.feature] !== false;
  });

  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);
  const _increaseFontSize = () => setFontSizeMultiplier(prev => Math.min(prev + 0.2, 1.6));
  const _decreaseFontSize = () => setFontSizeMultiplier(prev => Math.max(prev - 0.2, 0.8));

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSizeMultiplier * 100}%`;
    return () => { document.documentElement.style.fontSize = ""; };
  }, [fontSizeMultiplier]);

  return (
    <div id="visitor-layout" className="layout-wrapper">

      <GlobalBackground 
        primaryColor={settings?.primaryColor} 
        secondaryColor={settings?.secondaryColor} 
        theme={settings?.theme || "dark"}
        imageUrl={settings?.bannerUrl}
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
          <Link to="/hub" className="header-logo-container">
            {settings?.logoUrl && <img src={settings.logoUrl} alt={settings.name} className="header-logo" />}
            <span className="app-title">{settings?.name || "Cultura Viva"}</span>
          </Link>
          <div className="header-actions">
             <ThemeToggle />
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
            <span>✨ {t("visitor.layout.guest_banner")}</span>
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
          theme={settings?.theme || "dark"}
          onComplete={() => setShowWelcome(false)}
        />
      )}
    </div>
  );
};
