import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGamification } from "../../gamification/context/GamificationContext";
import { useAuth } from "../../auth/AuthContext";
import { Trophy, Lock, CheckCircle2 } from "lucide-react";
import "./Achievements.css";

export default function Achievements() {
  const { t } = useTranslation();
  const { isGuest } = useAuth();
  const { stats, loading } = useGamification();
  const navigate = useNavigate();

  const progress = useMemo(() => {
    if (!stats?.achievements?.length) return 0;
    const unlocked = stats.achievements.filter(a => a.unlockedAt).length;
    return Math.round((unlocked / stats.achievements.length) * 100);
  }, [stats]);

  if (loading) {
    return (
      <div className="achievements-loading">
        <div className="spinner-gold"></div>
        <p>{t("common.loading")}</p>
      </div>
    );
  }

  if (isGuest) {
    return (
      <div className="achievements-container" style={{ textAlign: "center", padding: "4rem 2rem" }}>
        <div style={{ fontSize: "5rem", marginBottom: "1.5rem" }}>🏆</div>
        <h1 className="achievements-title" style={{ marginBottom: "1rem" }}>{t("visitor.achievements.galeriaDeTrofus", "Galeria de Troféus")}</h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: "450px", margin: "0 auto 2.5rem", lineHeight: "1.6" }}>{t("visitor.achievements.cadaObraVisitadaECadaDesafioCo", "Cada obra visitada e cada desafio concluído rende uma medalha exclusiva. Crie sua conta para começar sua coleção!")}</p>
        <button
          onClick={() => navigate("/register")}
          style={{
            background: "var(--primary-color)",
            color: "#1a1108",
            border: "none",
            padding: "1rem 3rem",
            borderRadius: "2rem",
            fontWeight: "bold",
            fontSize: "1.1rem",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(212, 175, 55, 0.3)"
          }}
        >{t("visitor.achievements.comearMinhaColeo", "Começar minha Coleção")}</button>
      </div>
    );
  }

  return (
    <div className="achievements-container">
      {/* Header with Progress */}
      <div className="achievements-header">
        <h1 className="achievements-title">
          {t("visitor.achievements.title", "Suas Conquistas")}
        </h1>
        <p className="achievements-subtitle">
          {t("visitor.achievements.subtitle", "Complete desafios para subir de nível!")}
        </p>

        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-labels">
            <span>Iniciante</span>
            <span>{progress}% Completo</span>
            <span>Mestre</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="achievements-grid">
        {stats.achievements.length === 0 ? (
          <div className="achievements-empty">
            <Trophy className="empty-icon" />
            <h3>
              {t("visitor.achievements.emptyTitle", "Ainda sem conquistas")}
            </h3>
            <p>
              Explore o museu e interaja com obras para desbloquear medalhas!
            </p>
          </div>
        ) : (
          stats.achievements.map((a, i) => {
            const isUnlocked = !!a.unlockedAt;
            return (
              <div
                key={i}
                className={`achievement-card ${isUnlocked ? "unlocked" : "locked"}`}
              >
                {/* Icon */}
                <div className="achievement-icon">
                  {a.icon}
                </div>

                {/* Content */}
                <div className="achievement-info">
                  <h3 className="achievement-name">
                    {a.title}
                  </h3>
                  <p className="achievement-desc">
                    {a.description}
                  </p>

                  {!isUnlocked && (a as any).condition && (
                    <div className="achievement-condition">
                      <Lock size={10} />
                      {t("visitor.achievements.howToUnlock", "Como desbloquear:")} {(a as any).condition}
                    </div>
                  )}

                  {isUnlocked && (
                    <div className="status-badge unlocked">
                      <CheckCircle2 size={12} />
                      Desbloqueado
                    </div>
                  )}

                  {!isUnlocked && (
                    <div className="status-badge locked">
                      <Lock size={12} />
                      Bloqueado
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
