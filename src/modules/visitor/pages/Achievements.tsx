import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useGamification } from "../../gamification/context/GamificationContext";
import { Trophy, Lock, CheckCircle2 } from "lucide-react";
import "./Achievements.css";

export default function Achievements() {
  const { t } = useTranslation();
  const { stats, loading } = useGamification();

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
