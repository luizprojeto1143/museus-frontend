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

import "./VisitorLayout.css";

// Use the custom hook for PWA installation
import { usePWAInstall } from "../../hooks/usePWA";
import { useTerminology } from "../../hooks/useTerminology";
import { useIsCityMode } from "../auth/TenantContext";
import { useVisitorTheme } from "./context/VisitorThemeProvider";
import { InstallGuideModal } from "./components/InstallGuideModal";
import { useGamification } from "../gamification/context/GamificationContext";
import { GlobalBackground } from "./components/GlobalBackground";

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

  const { currentLevel, stats, progressToNextLevel } = useGamification();

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
    const fetchSettings = async () => {
      try {
        if (equipamentoId) {
          const res = await api.get(`/equipamentos/public/${equipamentoId}`);
          const equip = res.data;
          const mergedSettings = {
            ...equip,
            primaryColor: equip.corPrimaria || equip.tenant?.primaryColor || "#d4af37",
            secondaryColor: equip.corSecundaria || equip.tenant?.secondaryColor || "#cd7f32",
            name: equip.nome,
          };
          setSettings(mergedSettings);
          setSpaceTheme({
            primaryColor: mergedSettings.primaryColor,
            secondaryColor: mergedSettings.secondaryColor,
            theme: "dark"
          });
        } else if (tenantId) {
          const res = await api.get(`/tenants/${tenantId}/settings`);
          setSettings(res.data);
          if (res.data?.primaryColor) {
            setSpaceTheme({
              primaryColor: res.data.primaryColor,
              secondaryColor: res.data.secondaryColor,
              theme: "dark"
            });
          }
        }
      } catch (err) {
        console.error("Error loading settings", err);
      }
    };

    fetchSettings();
  }, [tenantId, equipamentoId, setSpaceTheme]);

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
      <GlobalBackground />

      <NavPill />

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

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <DialerModal isOpen={isDialerOpen} onClose={() => setIsDialerOpen(false)} />
      <GlobalAudioPlayer />
      {settings?.featureChatAI !== false && <AiChatWidget />}
      <InstallGuideModal isOpen={showInstallGuide} onClose={() => setShowInstallGuide(false)} />
    </div>
  );
};
