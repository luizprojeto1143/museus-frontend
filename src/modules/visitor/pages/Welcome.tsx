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

      {/* Botão principal */}
      <button
        onClick={() => navigate("/select-museum")}
        className="welcome-primary-btn"
      >
        <Smartphone size={22} /> {t("welcome.explore")}
      </button>

      <button
        onClick={() => navigate("/events")}
        className="welcome-secondary-btn"
        style={{ marginTop: "1rem", borderColor: "#d4af37", color: "#d4af37" }}
      >
        <span style={{ marginRight: "0.5rem" }}>📅</span> Agenda Cultural Unificada
      </button>

      <button
        onClick={() => { enterAsGuest(); navigate("/home"); }}
        className="welcome-secondary-btn"
        style={{ marginTop: "0.75rem", borderColor: "#8B7355", color: "#c9b58c" }}
      >
        <Eye size={16} /> Explorar sem Conta
      </button>


      {/* Botão secundário */}
      <button
        onClick={() => navigate("/login")}
        className="welcome-secondary-btn"
      >
        <Lock size={16} /> {t("welcome.login")}
      </button>

      {/* Decorações */}
      <div className="welcome-decor top-left">🏺</div>
      <div className="welcome-decor bottom-right">🖼</div>
    </div>
  );
};
