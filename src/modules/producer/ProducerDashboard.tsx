import React from "react";
import { DollarSign, Ticket, Calendar, TrendingUp, Plus, ExternalLink, BarChart3, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { api } from "../../api/client";

export const ProducerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { tenantId } = useAuth();
    const [loading, setLoading] = React.useState(true);
    const [stats, setStats] = React.useState({
        ticketsSold: 0,
        revenue: "R$ 0,00",
        activeEvents: 0,
        raisedAmount: "R$ 0,00"
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [nextEvents, setNextEvents] = React.useState<any[]>([]);

    React.useEffect(() => {
        if (!tenantId) return;

        const fetchData = async () => {
            try {
                // Parallel fetch: Sales Summary & Next Events
                const [salesRes, eventsRes] = await Promise.all([
                    api.get("/analytics/sales-summary"),
                    api.get("/events") // Assuming this returns all events for the tenant
                ]);

                const sold = salesRes.data.ticketsSold || 0;
                const rev = salesRes.data.totalRevenue || 0;
                const raised = salesRes.data.raisedAmount || 0;

                // Process events
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const allEvents = (eventsRes.data.data ? eventsRes.data.data : eventsRes.data) as any[];
                // Filter active
                const activeCount = allEvents.filter(e => e.status !== 'INACTIVE').length;
                // Get next 3
                const upcoming = allEvents
                    .filter(e => new Date(e.startDate) >= new Date())
                    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                    .slice(0, 3)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .map((e: any) => ({
                        id: e.id,
                        name: e.title,
                        date: new Date(e.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                        sales: "N/A" // Would need separate count per event
                    }));

                setStats({
                    ticketsSold: sold,
                    revenue: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rev),
                    activeEvents: activeCount,
                    raisedAmount: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(raised)
                });
                setNextEvents(upcoming);
            } catch (err) {
                console.error("Error fetching producer dashboard", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tenantId]);


    return (
        <div className="producer-dashboard">
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "2rem", color: "#d4af37", marginBottom: "0.5rem" }}>{t("producer.dashboard.title")}</h1>
                <p style={{ opacity: 0.7 }}>{t("producer.dashboard.subtitle")}</p>
            </div>

            {/* METRICS GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                        <span style={{ opacity: 0.7 }}>{t("producer.dashboard.metrics.revenue")}</span>
                        <DollarSign color="#4cd964" />
                    </div>
                    <h2 style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.revenue}</h2>
                    <span style={{ color: "#4cd964", fontSize: "0.9rem" }}>+12% {t("producer.dashboard.metrics.vsLastMonth")}</span>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                        <span style={{ opacity: 0.7 }}>{t("producer.dashboard.metrics.ticketsSold")}</span>
                        <Ticket color="#d4af37" />
                    </div>
                    <h2 style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.ticketsSold}</h2>
                    <span style={{ opacity: 0.5, fontSize: "0.9rem" }}>{t("producer.dashboard.metrics.accumulated")}</span>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                        <span style={{ opacity: 0.7 }}>{t("producer.dashboard.metrics.activeEvents")}</span>
                        <Calendar color="#3b82f6" />
                    </div>
                    <h2 style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.activeEvents}</h2>
                    <button onClick={() => navigate("/producer/events/new")} style={{ fontSize: "0.8rem", color: "#3b82f6", background: "none", border: "none", cursor: "pointer", marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        + {t("producer.dashboard.metrics.createNew")}
                    </button>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                        <span style={{ opacity: 0.7 }}>{t("producer.dashboard.metrics.raisedAmount", "Valor Captado")}</span>
                        <BarChart3 color="#ef4444" />
                    </div>
                    <h2 style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.raisedAmount}</h2>
                    <span style={{ opacity: 0.5, fontSize: "0.9rem" }}>{t("producer.dashboard.metrics.approvedProjects", "Em projetos aprovados")}</span>
                </div>
            </div>

            {/* ACTION & EVENTS */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>

                {/* Próximos Eventos */}
                <div style={{ background: "#1a1108", borderRadius: "1rem", padding: "2rem", border: "1px solid rgba(212,175,55,0.2)" }}>
                    <h3 style={{ marginBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem", display: "flex", justifyContent: "space-between" }}>
                        {t("producer.dashboard.nextEvents.title")}
                        <button onClick={() => navigate("/producer/events")} style={{ background: "none", border: "none", color: "#d4af37", cursor: "pointer", fontSize: "0.9rem" }}>{t("producer.dashboard.nextEvents.viewAll")}</button>
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {nextEvents.map(evt => (
                            <div key={evt.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "0.5rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <div style={{ background: "#d4af37", color: "#000", padding: "0.5rem 0.8rem", borderRadius: "0.5rem", fontWeight: "bold", textAlign: "center" }}>
                                        15<br /><small style={{ fontSize: "0.7rem" }}>JUL</small>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: "bold" }}>{evt.name}</div>
                                        <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>{t("producer.dashboard.nextEvents.sales")}: {evt.sales}</div>
                                    </div>
                                </div>
                                <button onClick={() => navigate(`/producer/events/${evt.id}`)} style={{ padding: "0.5rem 1rem", border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "#fff", borderRadius: "0.5rem", cursor: "pointer" }}>
                                    {t("producer.dashboard.nextEvents.manage")}
                                </button>
                            </div>
                        ))}
                        <button onClick={() => navigate("/producer/events/new")} style={{ padding: "1rem", border: "2px dashed rgba(212,175,55,0.3)", background: "transparent", color: "#d4af37", borderRadius: "0.5rem", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
                            <Plus size={20} /> {t("producer.dashboard.nextEvents.create", "Novo Evento")}
                        </button>
                    </div>
                </div>

                {/* Serviços / Marketplace */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    <div style={{ background: "linear-gradient(145deg, #1e1e24, #15151a)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <AlertCircle size={20} color="#d4af37" /> {t("producer.dashboard.services.lbiTitle")}
                        </h3>
                        <p style={{ fontSize: "0.9rem", opacity: 0.8, marginBottom: "1rem" }}>
                            {t("producer.dashboard.services.lbiText")}
                        </p>
                        <button onClick={() => navigate("/producer/services")} style={{ width: "100%", padding: "0.8rem", background: "#d4af37", color: "#000", border: "none", borderRadius: "0.5rem", fontWeight: "bold", cursor: "pointer" }}>
                            {t("producer.dashboard.services.hire")}
                        </button>
                    </div>

                    <div style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <h3 style={{ marginBottom: "1rem" }}>{t("producer.dashboard.services.reports")}</h3>
                        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                            <li style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
                                <span>{t("producer.dashboard.services.minc")}</span>
                                <ExternalLink size={14} />
                            </li>
                            <li style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
                                <span>{t("producer.dashboard.services.participants")}</span>
                                <ExternalLink size={14} />
                            </li>
                        </ul>
                    </div>

                </div>

            </div>
        </div>
    );
};
