import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
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
  upcomingBookings: Array<{
    id: string;
    startTime: string;
    purpose: string;
    space: { name: string };
    user: { name: string };
  }>;
};

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);



  const loadDashboard = React.useCallback(async () => {
    try {
      if (!tenantId) return;

      const res = await api.get(`/analytics/dashboard/${tenantId}`);
      setData(res.data);
    } catch (err) {
      console.error("Erro ao carregar dashboard", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

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
        <p style={{ color: "#ef4444" }}>
          {t("common.error")}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="section-title">🏛 {t("admin.dashboard.title")}</h1>


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

      {/* 1.4 PRÓXIMAS RESERVAS - New Widget */}
      <div className="card" style={{ marginBottom: "2rem", border: "1px solid rgba(59, 130, 246, 0.2)", background: "rgba(59, 130, 246, 0.02)" }}>
        <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#60a5fa" }}>
          📅 {t("admin.dashboard.upcomingBookings", "Próximas Reservas de Espaço")}
        </h2>
        {data.upcomingBookings && data.upcomingBookings.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            {data.upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                className="card"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: "1rem",
                  transition: "all 0.3s ease",
                  cursor: "default"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#94a3b8" }}>
                    {new Date(booking.startTime).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#60a5fa" }}>
                    {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <h4 style={{ color: "white", fontWeight: 700, fontSize: "1rem", marginBottom: "0.25rem" }}>{booking.purpose}</h4>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "#64748b", marginBottom: "0.5rem" }}>
                  📍 {booking.space.name}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#475569", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.5rem", marginTop: "0.5rem" }}>
                  Por {booking.user.name}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "2rem", color: "#64748b", background: "rgba(255,255,255,0.02)", borderRadius: "1rem" }}>
            Não há reservas agendadas para os próximos dias.
          </div>
        )}
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
