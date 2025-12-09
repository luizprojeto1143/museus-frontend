import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../../components/LanguageSwitcher";

export const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, rgba(26,17,8,0.95), rgba(45,24,16,0.95))," +
          "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0icGFwZXIiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzJhMTgxMCIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXBlcikiLz48L3N2Zz4=')",
        backgroundSize: "cover",
        padding: "2rem",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <LanguageSwitcher />
      {/* Overlay de textura */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABZJREFUeNpi2r9//38gYGAEESAAEGAAasgJOgzJKCoAAAAASUVORK5CYII=')",
        opacity: 0.03,
        pointerEvents: "none"
      }} />

      {/* Logo e título */}
      <div style={{
        textAlign: "center",
        marginBottom: "3rem",
        animation: "fadeIn 1.5s ease-in",
        position: "relative",
        zIndex: 1
      }}>
        <h1 style={{
          fontSize: "3rem",
          color: "#d4af37",
          fontFamily: "serif",
          margin: 0,
          marginBottom: "0.5rem",
          textShadow: "0 4px 16px rgba(212,175,55,0.6), 0 0 40px rgba(212,175,55,0.3)",
          letterSpacing: "2px"
        }}>
          🏛 {t("welcome.title")}
        </h1>
        <p style={{
          color: "#c9b58c",
          fontSize: "1.1rem",
          fontFamily: "serif",
          fontStyle: "italic",
          opacity: 0.9
        }}>
          {t("welcome.subtitle")}
        </p>
      </div>

      {/* Botão principal */}
      <button
        onClick={() => navigate("/select-museum")}
        style={{
          background: "linear-gradient(135deg, #d4af37, #b8941f)",
          color: "#1a1108",
          fontSize: "1.2rem",
          fontWeight: "bold",
          fontFamily: "serif",
          padding: "1rem 3rem",
          border: "2px solid #d4af37",
          borderRadius: "0.8rem",
          cursor: "pointer",
          boxShadow:
            "0 8px 32px rgba(212,175,55,0.5)," +
            "inset 0 1px 0 rgba(255,255,255,0.3)",
          transition: "all 0.3s ease",
          textTransform: "uppercase",
          letterSpacing: "2px",
          position: "relative",
          zIndex: 1,
          marginBottom: "2rem"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px) scale(1.05)";
          e.currentTarget.style.boxShadow =
            "0 12px 48px rgba(212,175,55,0.7)," +
            "inset 0 1px 0 rgba(255,255,255,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
          e.currentTarget.style.boxShadow =
            "0 8px 32px rgba(212,175,55,0.5)," +
            "inset 0 1px 0 rgba(255,255,255,0.3)";
        }}
      >
        📲 {t("welcome.explore")}
      </button>

      {/* Botão secundário */}
      <button
        onClick={() => navigate("/login")}
        style={{
          background: "transparent",
          color: "#8b7355",
          fontSize: "0.9rem",
          fontFamily: "serif",
          padding: "0.6rem 1.5rem",
          border: "1px solid #8b7355",
          borderRadius: "0.5rem",
          cursor: "pointer",
          transition: "all 0.3s ease",
          position: "relative",
          zIndex: 1
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#d4af37";
          e.currentTarget.style.borderColor = "#d4af37";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#8b7355";
          e.currentTarget.style.borderColor = "#8b7355";
        }}
      >
        🔐 {t("welcome.login")}
      </button>

      {/* Decorações */}
      <div style={{
        position: "absolute",
        top: "10%",
        left: "10%",
        fontSize: "4rem",
        opacity: 0.1,
        transform: "rotate(-15deg)",
        filter: "sepia(1) hue-rotate(20deg)"
      }}>
        🏺
      </div>
      <div style={{
        position: "absolute",
        bottom: "15%",
        right: "10%",
        fontSize: "4rem",
        opacity: 0.1,
        transform: "rotate(15deg)",
        filter: "sepia(1) hue-rotate(20deg)"
      }}>
        🖼
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div >
  );
};
