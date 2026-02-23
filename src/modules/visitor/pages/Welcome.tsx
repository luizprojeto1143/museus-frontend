import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../../components/LanguageSwitcher";
import { Smartphone, Lock, Eye } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import "./Welcome.css";

export const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { enterAsGuest } = useAuth();

  return (
    <div className="welcome-container">
      <div className="welcome-texture"></div>

      <div className="welcome-lang-switcher">
        <LanguageSwitcher />
      </div>

      {/* Logo e título */}
      <div className="welcome-hero">
        <h1 className="welcome-title">🏛 {t("welcome.title")}</h1>
        <p className="welcome-subtitle">{t("welcome.subtitle")}</p>
      </div>

      {/* Botão principal de destaque */}
      <button
        onClick={() => navigate("/select-museum")}
        className="welcome-primary-btn"
      >
        <Smartphone size={24} /> {t("welcome.explore")}
      </button>

      {/* Grupo de ações secundárias */}
      <div className="welcome-actions-group">
        <button
          onClick={() => navigate("/events")}
          className="welcome-secondary-btn agenda"
        >
          <Smartphone size={18} /> Agenda Cultural
        </button>

        <button
          onClick={() => navigate("/select-museum")}
          className="welcome-secondary-btn guest"
        >
          <Eye size={18} /> Explorar sem Conta
        </button>

        <button
          onClick={() => navigate("/login")}
          className="welcome-secondary-btn login"
        >
          <Lock size={14} /> {t("welcome.login")}
        </button>
      </div>

      {/* Decorações */}
      <div className="welcome-decor top-left">🏺</div>
      <div className="welcome-decor bottom-right">🖼</div>
    </div>
  );
};
