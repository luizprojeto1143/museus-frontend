import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  xpReward: number;
  iconUrl?: string;
  condition: string;
  autoTrigger: boolean;
  active: boolean;
  unlockedCount: number;
}

export const AdminAchievements: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAchievements = React.useCallback(async () => {
    try {
      const res = await api.get(`/achievements?tenantId=${tenantId}`);
      setAchievements(res.data);
    } catch {
      console.error("Erro ao carregar conquistas");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  const handleDelete = async (id: string) => {
    if (!confirm(t("admin.achievements.alerts.confirmDelete"))) return;

    try {
      await api.delete(`/achievements/${id}`);
      loadAchievements();
    } catch {
      alert(t("admin.achievements.alerts.errorDelete"));
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/achievements/${id}`, { active: !currentStatus });
      loadAchievements();
    } catch {
      alert(t("admin.achievements.alerts.errorUpdate"));
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 className="section-title">🏅 {t("admin.achievements.title")}</h1>
          <p className="section-subtitle">
            {t("admin.achievements.subtitle")}
          </p>
        </div>
        <Link to="/admin/conquistas/nova" className="btn btn-primary">
          + {t("admin.achievements.new")}
        </Link>
      </div>

      {/* Stats */}
      <div className="card-grid" style={{ marginBottom: "2rem" }}>
        <div className="stat-card">
          <div className="stat-value">{achievements.length}</div>
          <div className="stat-label">{t("admin.achievements.stats.total")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{achievements.filter(a => a.active).length}</div>
          <div className="stat-label">{t("admin.achievements.stats.active")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {achievements.reduce((acc, a) => acc + a.unlockedCount, 0)}
          </div>
          <div className="stat-label">{t("admin.achievements.stats.unlocked")}</div>
        </div>
      </div>

      {loading && <p>{t("common.loading")}</p>}

      {!loading && achievements.length === 0 && (
        <div className="card">
          <p>{t("admin.achievements.empty")}</p>
          <Link to="/admin/conquistas/nova" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            {t("admin.achievements.createFirst")}
          </Link>
        </div>
      )}

      {!loading && achievements.length > 0 && (
        <div className="card-grid">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="card" style={{ position: "relative" }}>
              {/* Badge de status */}
              <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
                <span
                  className="chip"
                  style={{
                    background: achievement.active ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                    color: achievement.active ? "#22c55e" : "#ef4444",
                    borderColor: achievement.active ? "#22c55e" : "#ef4444"
                  }}
                >
                  {achievement.active ? t("admin.achievements.card.active") : t("admin.achievements.card.inactive")}
                </span>
              </div>

              {/* Ícone */}
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  margin: "0 auto 1rem",
                  borderRadius: "50%",
                  background: achievement.iconUrl
                    ? `url(${achievement.iconUrl}) center/cover`
                    : "linear-gradient(135deg, var(--accent-gold), var(--accent-bronze))",
                  border: "3px solid var(--accent-gold)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  boxShadow: "0 4px 16px rgba(212, 175, 55, 0.4)"
                }}
              >
                {!achievement.iconUrl && "🏆"}
              </div>

              <h3 className="card-title" style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                {achievement.title}
              </h3>

              <p className="card-subtitle" style={{ textAlign: "center", marginBottom: "1rem" }}>
                {achievement.description}
              </p>

              <div style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                  <span>{t("admin.achievements.card.code")}:</span>
                  <span className="badge">{achievement.code}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                  <span>{t("admin.achievements.card.xp")}:</span>
                  <span style={{ fontWeight: 600, color: "var(--accent-gold)" }}>+{achievement.xpReward} XP</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                  <span>{t("admin.achievements.card.condition")}:</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--fg-soft)" }}>{achievement.condition}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                  <span>{t("admin.achievements.card.unlocked")}:</span>
                  <span style={{ fontWeight: 600 }}>{achievement.unlockedCount} {t("admin.achievements.card.times")}</span>
                </div>
              </div>

              {achievement.autoTrigger && (
                <div style={{ marginBottom: "1rem", padding: "0.5rem", background: "rgba(59, 130, 246, 0.1)", borderRadius: "0.5rem", fontSize: "0.8rem", textAlign: "center" }}>
                  🤖 {t("admin.achievements.card.auto")}
                </div>
              )}

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Link to={`/admin/conquistas/${achievement.id}`} className="btn btn-secondary" style={{ flex: 1, fontSize: "0.85rem" }}>
                  {t("admin.achievements.card.edit")}
                </Link>
                <button
                  onClick={() => handleToggleActive(achievement.id, achievement.active)}
                  className="btn btn-secondary"
                  style={{ flex: 1, fontSize: "0.85rem" }}
                >
                  {achievement.active ? t("admin.achievements.card.disable") : t("admin.achievements.card.enable")}
                </button>
                <button
                  onClick={() => handleDelete(achievement.id)}
                  className="btn"
                  style={{
                    padding: "0.5rem",
                    fontSize: "0.85rem",
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "#ef4444",
                    border: "1px solid #ef4444"
                  }}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
