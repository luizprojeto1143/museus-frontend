import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Calendar, Clock, MapPin, Ticket, ChevronRight, BarChart2 } from "lucide-react";

type DashboardData = {
  // ... (previous fields remain the same)
  visitorsThisMonth: number;
  topWorks: Array<{ id: string; title: string; visits: number }>;
  topTrails: Array<{ id: string; title: string; completions: number }>;
  topEvents: Array<{ id: string; title: string; views: number }>;
  totalQRScans: number;
  totalXPDistributed: number;
  weeklyGrowth: number;
  monthlyGrowth: number;

  visitsByDay: Array<{ date: string; count: number }>;
  visitsByWork: Array<{ workTitle: string; count: number }>;
  xpByCategory: Array<{ category: string; xp: number }>;
  accessBySource: { qr: number; app: number; map: number; trails: number };

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

type UpcomingEvent = {
  id: string;
  title: string;
  startDate: string;
  location?: string;
  type?: string;
};

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = React.useCallback(async () => {
    try {
      if (!tenantId) return;

      const [dashRes, eventsRes] = await Promise.all([
        api.get(`/analytics/dashboard/${tenantId}`),
        api.get("/events", { params: { tenantId, status: 'PUBLISHED', limit: 3 } })
      ]);

      setData(dashRes.data);
      setUpcomingEvents(eventsRes.data.data || []);
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
        {/* Skeleton Loader */}
        <div className="card-grid" style={{ marginBottom: "2rem" }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="stat-card" style={{ minHeight: 90 }}>
              <div style={{
                width: "60%", height: 28, borderRadius: 6,
                background: "linear-gradient(90deg, rgba(212,175,55,0.08) 25%, rgba(212,175,55,0.15) 50%, rgba(212,175,55,0.08) 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite"
              }} />
              <div style={{
                width: "40%", height: 14, borderRadius: 4, marginTop: 8,
                background: "rgba(212,175,55,0.06)"
              }} />
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card" style={{ minHeight: 200 }}>
              <div style={{ width: "50%", height: 20, borderRadius: 4, background: "rgba(212,175,55,0.1)", marginBottom: 16 }} />
              {[1, 2, 3].map(j => (
                <div key={j} style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: "1px solid var(--border-subtle)" }}>
                  <div style={{ width: "60%", height: 14, borderRadius: 4, background: "rgba(212,175,55,0.06)" }} />
                  <div style={{ width: "20%", height: 14, borderRadius: 4, background: "rgba(212,175,55,0.08)" }} />
                </div>
              ))}
            </div>
          ))}
        </div>
        <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <h1 className="section-title">{t("admin.dashboard.title")}</h1>
        <div className="card" style={{
          textAlign: "center", padding: "3rem 2rem",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          background: "rgba(239, 68, 68, 0.05)"
        }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚠️</div>
          <h2 style={{ color: "#ef4444", marginBottom: "0.5rem", fontSize: "1.2rem" }}>
            {t("common.error")}
          </h2>
          <p style={{ color: "var(--fg-secondary)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            Não foi possível carregar os dados do dashboard. Verifique sua conexão e tente novamente.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => { setLoading(true); loadDashboard(); }}
            aria-label="Tentar carregar dashboard novamente"
          >
            🔄 Tentar Novamente
          </button>
        </div>
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
        {/* ... stats cards ... */}
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

      {/* 1.4 AGENDA DO MUSEU - New Mini Agenda Widget */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 className="card-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            🎨 Agenda do Museu
          </h2>
          <button
            className="btn btn-ghost"
            style={{ fontSize: "0.85rem" }}
            onClick={() => window.location.href = "/admin/eventos"}
          >
            Ver tudo <ChevronRight size={14} />
          </button>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="mini-timeline">
            {upcomingEvents.map((ev, idx) => {
              const d = new Date(ev.startDate);
              const day = d.getDate();
              const month = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
              const hour = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={ev.id} className="mini-timeline-item" style={{ display: "flex", gap: "1rem", marginBottom: idx === upcomingEvents.length - 1 ? 0 : "1.5rem" }}>
                  <div className="mini-date-badge" style={{
                    width: "48px", height: "48px", background: "rgba(212,175,55,0.1)",
                    border: "1px solid rgba(212,175,55,0.2)", borderRadius: "12px",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    flexShrink: 0
                  }}>
                    <span style={{ fontSize: "1rem", fontWeight: 800, color: "#d4af37", lineHeight: 1 }}>{day}</span>
                    <span style={{ fontSize: "0.6rem", textTransform: "uppercase", fontWeight: "bold", color: "#8b7355" }}>{month}</span>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <h4 style={{ margin: 0, color: "white", fontSize: "0.95rem" }}>{ev.title}</h4>
                      <span style={{ fontSize: "0.75rem", color: "#d4af37", fontWeight: 600 }}>{hour}</span>
                    </div>
                    <div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem" }}>
                      {ev.location && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "#52525b" }}>
                          <MapPin size={12} /> {ev.location}
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "#52525b" }}>
                        <Ticket size={12} /> {ev.type || 'Evento'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => window.location.href = `/admin/eventos/${ev.id}/dashboard`}
                    title="Ver Dashboard do Evento"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex", alignItems: "center" }}
                  >
                    <BarChart2 size={16} className="text-zinc-500 hover:text-gold" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "2rem", color: "#64748b", background: "rgba(255,255,255,0.02)", borderRadius: "1rem" }}>
            Não há eventos publicados para os próximos dias.
          </div>
        )}
      </div>

      {/* 1.5 PRÓXIMAS RESERVAS - Moved down */}
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
                  background: "rgba(0,0,0,0.2)",
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
            Não há reservas agendadas.
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
