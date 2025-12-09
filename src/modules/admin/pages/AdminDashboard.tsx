import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

type DashboardData = {
  // 1.1 Indicadores principais
  visitorsThisMonth: number;
  topWorks: Array<{ id: string; title: string; visits: number }>;
  topTrails: Array<{ id: string; title: string; completions: number }>;
  topEvents: Array<{ id: string; title: string; views: number }>;
  totalQRScans: number;
  totalXPDistributed: number;
  weeklyGrowth: number;
  monthlyGrowth: number;

  // 1.2 Gráficos
  visitsByDay: Array<{ date: string; count: number }>;
  visitsByWork: Array<{ workTitle: string; count: number }>;
  xpByCategory: Array<{ category: string; xp: number }>;
  accessBySource: { qr: number; app: number; map: number; trails: number };

  // 1.3 Alertas
  alerts: Array<{
    type: "warning" | "error" | "info";
    message: string;
    link?: string;
  }>;
};

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);



  const loadDashboard = React.useCallback(async () => {
    try {
      if (isDemoMode || !tenantId) {
        // Dados mock para demo
        setData({
          visitorsThisMonth: 342,
          topWorks: [
            { id: "1", title: "Monalisa Colonial", visits: 145 },
            { id: "2", title: "Escultura Barroca", visits: 98 },
            { id: "3", title: "Azulejos Históricos", visits: 87 }
          ],
          topTrails: [
            { id: "1", title: "Arte Sacra", completions: 56 },
            { id: "2", title: "Barroco Mineiro", completions: 43 }
          ],
          topEvents: [
            { id: "1", title: "Exposição de Ouro", views: 234 },
            { id: "2", title: "Semana da Arte", views: 156 }
          ],
          totalQRScans: 876,
          totalXPDistributed: 12450,
          weeklyGrowth: 12.5,
          monthlyGrowth: 34.2,
          visitsByDay: [
            { date: t("admin.dashboard.days.mon"), count: 45 },
            { date: t("admin.dashboard.days.tue"), count: 52 },
            { date: t("admin.dashboard.days.wed"), count: 48 },
            { date: t("admin.dashboard.days.thu"), count: 67 },
            { date: t("admin.dashboard.days.fri"), count: 89 },
            { date: t("admin.dashboard.days.sat"), count: 123 },
            { date: t("admin.dashboard.days.sun"), count: 98 }
          ],
          visitsByWork: [
            { workTitle: "Monalisa Colonial", count: 145 },
            { workTitle: "Escultura Barroca", count: 98 },
            { workTitle: "Azulejos Históricos", count: 87 }
          ],
          xpByCategory: [
            { category: "Arte Sacra", xp: 3400 },
            { category: "Barroco", xp: 2800 },
            { category: "Contemporâneo", xp: 1900 }
          ],
          accessBySource: { qr: 450, app: 320, map: 78, trails: 128 },
          alerts: [
            { type: "warning", message: "3 trilhas sem imagens", link: "/admin/trilhas" },
            { type: "warning", message: "5 obras sem categoria", link: "/admin/obras" },
            { type: "info", message: "2 eventos expirados", link: "/admin/eventos" }
          ]
        });
        setLoading(false);
        return;
      }

      const res = await api.get(`/analytics/dashboard/${tenantId}`);
      setData(res.data);
    } catch (err) {
      console.error("Erro ao carregar dashboard", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [tenantId, t]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div>
        <h1 className="section-title">{t("admin.dashboard.title")}</h1>
        <p>{t("common.loading")}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <h1 className="section-title">{t("admin.dashboard.title")}</h1>
        <p className="section-subtitle" style={{ color: "#ef4444" }}>
          {t("common.error")}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="section-title">🏛 {t("admin.dashboard.title")}</h1>
      <p className="section-subtitle">
        {t("admin.dashboard.subtitle")}
      </p>

      {/* 1.3 ALERTAS E NOTIFICAÇÕES */}
      {data.alerts.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          {data.alerts.map((alert, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                marginBottom: "0.75rem",
                padding: "1rem",
                borderLeft: `4px solid ${alert.type === "error"
                  ? "#ef4444"
                  : alert.type === "warning"
                    ? "#f59e0b"
                    : "#3b82f6"
                  }`,
                background:
                  alert.type === "error"
                    ? "rgba(239, 68, 68, 0.05)"
                    : alert.type === "warning"
                      ? "rgba(245, 158, 11, 0.05)"
                      : "rgba(59, 130, 246, 0.05)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>
                  {alert.type === "error" && "⛔"} {alert.type === "warning" && "⚠️"}{" "}
                  {alert.type === "info" && "ℹ️"} {alert.message}
                </span>
                {alert.link && (
                  <a href={alert.link} className="btn btn-secondary" style={{ fontSize: "0.8rem" }}>
                    {t("common.view")}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 1.1 INDICADORES PRINCIPAIS */}
      <div className="card-grid" style={{ marginBottom: "2rem" }}>
        <div className="stat-card">
          <div className="stat-value">{data.visitorsThisMonth}</div>
          <div className="stat-label">{t("admin.dashboard.stats.visitors")}</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{data.totalQRScans}</div>
          <div className="stat-label">{t("admin.dashboard.stats.qrScans")}</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{data.totalXPDistributed.toLocaleString()}</div>
          <div className="stat-label">{t("admin.dashboard.stats.xpDistributed")}</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: "#22c55e" }}>
            +{data.monthlyGrowth}%
          </div>
          <div className="stat-label">{t("admin.dashboard.stats.monthlyGrowth")}</div>
        </div>
      </div>

      {/* TOP OBRAS, TRILHAS E EVENTOS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Top Obras */}
        <div className="card">
          <h2 className="card-title">🖼 {t("admin.dashboard.topWorks")}</h2>
          {data.topWorks.map((work, idx) => (
            <div
              key={work.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.75rem 0",
                borderBottom: idx < data.topWorks.length - 1 ? "1px solid var(--border-subtle)" : "none"
              }}
            >
              <span>
                {idx + 1}. {work.title}
              </span>
              <span className="badge">{work.visits} {t("admin.dashboard.visits")}</span>
            </div>
          ))}
        </div>

        {/* Top Trilhas */}
        <div className="card">
          <h2 className="card-title">🧭 {t("admin.dashboard.topTrails")}</h2>
          {data.topTrails.map((trail, idx) => (
            <div
              key={trail.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.75rem 0",
                borderBottom: idx < data.topTrails.length - 1 ? "1px solid var(--border-subtle)" : "none"
              }}
            >
              <span>
                {idx + 1}. {trail.title}
              </span>
              <span className="badge">{trail.completions} {t("admin.dashboard.completions")}</span>
            </div>
          ))}
        </div>

        {/* Top Eventos */}
        <div className="card">
          <h2 className="card-title">🎭 {t("admin.dashboard.topEvents")}</h2>
          {data.topEvents.map((event, idx) => (
            <div
              key={event.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.75rem 0",
                borderBottom: idx < data.topEvents.length - 1 ? "1px solid var(--border-subtle)" : "none"
              }}
            >
              <span>
                {idx + 1}. {event.title}
              </span>
              <span className="badge">{event.views} {t("admin.dashboard.views")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 1.2 GRÁFICOS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Gráfico: Visitantes por Dia */}
        <div className="card">
          <h2 className="card-title">📊 {t("admin.dashboard.charts.visitsByDay")}</h2>
          <div style={{ marginTop: "1rem" }}>
            {data.visitsByDay.map((day) => (
              <div key={day.date} style={{ marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                  <span style={{ fontSize: "0.85rem" }}>{day.date}</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{day.count}</span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    background: "rgba(212, 175, 55, 0.2)",
                    borderRadius: "4px",
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      width: `${(day.count / Math.max(...data.visitsByDay.map((d) => d.count))) * 100}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, var(--accent-gold), var(--accent-bronze))",
                      transition: "width 0.3s"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico: Acesso por Origem */}
        <div className="card">
          <h2 className="card-title">📍 {t("admin.dashboard.charts.accessBySource")}</h2>
          <div style={{ marginTop: "1.5rem" }}>
            {Object.entries(data.accessBySource).map(([source, count]) => (
              <div key={source} style={{ marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                  <span style={{ fontSize: "0.85rem", textTransform: "uppercase" }}>{source}</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{count}</span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    background: "rgba(212, 175, 55, 0.2)",
                    borderRadius: "4px",
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      width: `${(count / Math.max(...Object.values(data.accessBySource))) * 100}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, var(--accent-gold), var(--accent-bronze))"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* XP por Categoria */}
        <div className="card">
          <h2 className="card-title">⭐ {t("admin.dashboard.charts.xpByCategory")}</h2>
          <div style={{ marginTop: "1rem" }}>
            {data.xpByCategory.map((cat) => (
              <div key={cat.category} style={{ marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                  <span style={{ fontSize: "0.85rem" }}>{cat.category}</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{cat.xp} XP</span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    background: "rgba(212, 175, 55, 0.2)",
                    borderRadius: "4px",
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      width: `${(cat.xp / Math.max(...data.xpByCategory.map((c) => c.xp))) * 100}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, var(--accent-gold), var(--accent-bronze))"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resumo Final */}
      <div className="card">
        <h2 className="card-title">📈 {t("admin.dashboard.growth.summary")}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.8rem", color: "var(--fg-soft)" }}>{t("admin.dashboard.growth.weekly")}</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "#22c55e" }}>+{data.weeklyGrowth}%</div>
          </div>
          <div>
            <div style={{ fontSize: "0.8rem", color: "var(--fg-soft)" }}>{t("admin.dashboard.growth.monthly")}</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "#22c55e" }}>+{data.monthlyGrowth}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};
