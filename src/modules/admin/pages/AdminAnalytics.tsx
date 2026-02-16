import React, { useEffect, useState } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

interface AnalyticsData {
  // Indicadores globais
  totalVisitors: number;
  recurringVisitors: number;
  averageAge: number;
  accessBySource: { qr: number; app: number; web: number };
  peakHours: Array<{ hour: number; count: number }>;

  // Heatmap
  hotWorks: Array<{ id: string; title: string; heat: number }>;
  hotTrails: Array<{ id: string; title: string; heat: number }>;
  hotEvents: Array<{ id: string; title: string; heat: number }>;

  // Dados para exportação
  visitorsByAge: Array<{ range: string; count: number }>;
  visitorsByDay: Array<{ date: string; count: number; recurring: number }>;
}

export const AdminAnalytics: React.FC = () => {
  const { tenantId } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");

  const loadAnalytics = React.useCallback(async () => {
    try {
      if (!tenantId) return;

      const res = await api.get(`/analytics/advanced/${tenantId}?range=${dateRange}`);
      setData(res.data);
    } catch (err) {
      console.error("Erro ao carregar analytics", err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, dateRange]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleExportCSV = () => {
    if (!data) return;

    const csv = [
      ["Data", "Visitantes", "Recorrentes"],
      ...data.visitorsByDay.map(d => [d.date, d.count, d.recurring])
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${dateRange}-${Date.now()}.csv`;
    a.click();
  };

  const handleExportPDF = async () => {
    try {
      const response = await api.get("/reports/financial", {
        responseType: 'blob',
        params: {
          startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
          endDate: new Date().toISOString()
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro ao baixar PDF", error);
      alert("Erro ao gerar relatório PDF. Tente novamente.");
    }
  };

  if (loading) {
    return <p>Carregando analytics...</p>;
  }

  if (!data) {
    return <p style={{ color: "#ef4444" }}>Erro ao carregar dados</p>;
  }



  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 className="section-title">📊 Analytics Avançado</h1>

        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as "7d" | "30d" | "90d")}
            style={{ padding: "0.5rem 1rem" }}
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
          </select>
          <button onClick={handleExportCSV} className="btn btn-secondary">
            📥 CSV
          </button>
          <button onClick={handleExportPDF} className="btn btn-secondary">
            📄 PDF
          </button>
        </div>
      </div>

      {/* Indicadores Globais */}
      <div className="card-grid" style={{ marginBottom: "2rem" }}>
        <div className="stat-card">
          <div className="stat-value">{data.totalVisitors.toLocaleString()}</div>
          <div className="stat-label">Total de Visitantes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.recurringVisitors}</div>
          <div className="stat-label">Visitantes Recorrentes</div>
          <div style={{ fontSize: "0.75rem", color: "var(--fg-soft)", marginTop: "0.25rem" }}>
            {((data.recurringVisitors / data.totalVisitors) * 100).toFixed(1)}% do total
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.averageAge} anos</div>
          <div className="stat-label">Idade Média</div>
        </div>
      </div>

      {/* Origem de Acessos */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 className="card-title">📍 Origem dos Acessos</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
          {Object.entries(data.accessBySource).map(([source, count]) => (
            <div key={source} className="stat-card">
              <div className="stat-value">{count}</div>
              <div className="stat-label">{source.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Horários de Pico */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 className="card-title">⏰ Horários de Pico</h2>
        <div style={{ marginTop: "1rem" }}>
          {data.peakHours.map((hour) => (
            <div key={hour.hour} style={{ marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                <span style={{ fontSize: "0.85rem" }}>{hour.hour}:00</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{hour.count} visitantes</span>
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
                    width: `${(hour.count / Math.max(...data.peakHours.map(h => h.count))) * 100}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, var(--accent-gold), var(--accent-bronze))"
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 className="card-title">🔥 Heatmap - Obras Mais Quentes</h2>
        <p className="card-subtitle">Intensidade de visitação das obras</p>
        <div style={{ marginTop: "1rem" }}>
          {data.hotWorks.map((work) => (
            <div key={work.id} style={{ marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                <span style={{ fontSize: "0.85rem" }}>{work.title}</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  {work.heat}% 🔥
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "10px",
                  background: "rgba(239, 68, 68, 0.1)",
                  borderRadius: "4px",
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    width: `${work.heat}%`,
                    height: "100%",
                    background: work.heat > 80
                      ? "linear-gradient(90deg, #ef4444, #dc2626)"
                      : work.heat > 60
                        ? "linear-gradient(90deg, #f59e0b, #d97706)"
                        : "linear-gradient(90deg, #22c55e, #16a34a)"
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visitantes por Idade */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 className="card-title">👥 Distribuição por Idade</h2>
        <div style={{ marginTop: "1rem" }}>
          {data.visitorsByAge.map((age) => (
            <div key={age.range} style={{ marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                <span style={{ fontSize: "0.85rem" }}>{age.range} anos</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{age.count}</span>
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
                    width: `${(age.count / Math.max(...data.visitorsByAge.map(a => a.count))) * 100}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, var(--accent-gold), var(--accent-bronze))"
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico de Tendência */}
      <div className="card">
        <h2 className="card-title">📈 Tendência de Visitantes</h2>
        <p className="card-subtitle">Visitantes novos vs recorrentes ao longo do tempo</p>
        <div style={{ marginTop: "1rem", overflowX: "auto" }}>
          <div style={{ minWidth: "600px" }}>
            {data.visitorsByDay.slice(-14).map((day) => (
              <div key={day.date} style={{ marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.8rem" }}>
                  <span>{day.date}</span>
                  <span>
                    {day.count} total ({day.recurring} recorrentes)
                  </span>
                </div>
                <div style={{ display: "flex", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${((day.count - day.recurring) / day.count) * 100}%`,
                      background: "var(--accent-gold)"
                    }}
                    title="Novos"
                  />
                  <div
                    style={{
                      width: `${(day.recurring / day.count) * 100}%`,
                      background: "var(--accent-bronze)"
                    }}
                    title="Recorrentes"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
