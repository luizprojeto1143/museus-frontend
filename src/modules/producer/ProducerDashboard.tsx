import React from "react";
import { DollarSign, Ticket, Calendar, TrendingUp, Plus, ExternalLink, BarChart3, AlertCircle, Briefcase, Rocket } from "lucide-react";
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
        raisedAmount: "R$ 0,00",
        revenueGrowth: null as number | null
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [nextEvents, setNextEvents] = React.useState<any[]>([]);

    React.useEffect(() => {
        if (!tenantId) return;

        const fetchData = async () => {
            try {
                const [salesRes, eventsRes] = await Promise.all([
                    api.get("/analytics/sales-summary"),
                    api.get("/events")
                ]);

                const sold = salesRes.data.ticketsSold || 0;
                const rev = salesRes.data.totalRevenue || 0;
                const raised = salesRes.data.raisedAmount || 0;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const allEvents = (eventsRes.data.data ? eventsRes.data.data : eventsRes.data) as any[];

                const activeCount = allEvents.filter(e => e.status !== 'INACTIVE').length;

                const upcomingRaw = allEvents
                    .filter(e => new Date(e.startDate) >= new Date())
                    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                    .slice(0, 3);

                const upcoming = await Promise.all(upcomingRaw.map(async (e: any) => {
                    try {
                        const reportRes = await api.get(`/events/${e.id}/report`);
                        return {
                            id: e.id,
                            name: e.title,
                            date: new Date(e.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                            sales: `${reportRes.data.ticketsSold || 0} vendidos`
                        };
                    } catch {
                        return {
                            id: e.id,
                            name: e.title,
                            date: new Date(e.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                            sales: "0 vendidos"
                        };
                    }
                }));

                const lastMonthRev = salesRes.data.lastMonthRevenue;
                const revenueGrowth = (lastMonthRev != null && lastMonthRev > 0)
                    ? Math.round(((rev - lastMonthRev) / lastMonthRev) * 100)
                    : null;

                setStats({
                    ticketsSold: sold,
                    revenue: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rev),
                    activeEvents: activeCount,
                    raisedAmount: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(raised),
                    revenueGrowth
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

    const isNewProducer = !loading && stats.activeEvents === 0 && nextEvents.length === 0;

    // Loading skeleton
    if (loading) {
        return (
            <div>
                <h1 className="section-title">🎪 {t("producer.dashboard.title")}</h1>
                <div className="card-grid" style={{ marginBottom: "2rem" }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="stat-card" style={{ minHeight: 90 }}>
                            <div style={{
                                width: "60%", height: 28, borderRadius: 6,
                                background: "linear-gradient(90deg, rgba(212,175,55,0.08) 25%, rgba(212,175,55,0.15) 50%, rgba(212,175,55,0.08) 75%)",
                                backgroundSize: "200% 100%",
                                animation: "shimmer 1.5s infinite"
                            }} />
                            <div style={{ width: "40%", height: 14, borderRadius: 4, marginTop: 8, background: "rgba(212,175,55,0.06)" }} />
                        </div>
                    ))}
                </div>
                <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <h1 className="section-title">🎪 {t("producer.dashboard.title")}</h1>
                <p className="section-subtitle">{t("producer.dashboard.subtitle")}</p>
            </div>

            {/* New Producer Onboarding CTA */}
            {isNewProducer && (
                <div className="card" style={{
                    textAlign: "center",
                    padding: "3rem 2rem",
                    marginBottom: "2rem",
                    border: "1px solid rgba(212, 175, 55, 0.3)",
                    background: "linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(42, 24, 16, 0.95))"
                }}>
                    <Rocket size={48} style={{ color: "var(--accent-primary)", marginBottom: "1rem", display: "inline-block" }} />
                    <h2 style={{ color: "var(--accent-primary)", fontSize: "1.4rem", fontFamily: "Georgia, serif", marginBottom: "0.5rem" }}>
                        Bem-vindo ao Cultura Viva!
                    </h2>
                    <p style={{ color: "var(--fg-secondary)", marginBottom: "1.5rem", fontSize: "0.95rem", maxWidth: 480, margin: "0 auto 1.5rem" }}>
                        Comece criando seu primeiro evento para atrair visitantes e vender ingressos. Em poucos passos, seu espaço cultural estará no mapa!
                    </p>
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <button className="btn btn-primary btn-lg" onClick={() => navigate("/producer/events/new")}>
                            <Plus size={18} /> Criar Primeiro Evento
                        </button>
                        <button className="btn btn-outline" onClick={() => navigate("/producer/profile")}>
                            Completar Perfil
                        </button>
                    </div>
                </div>
            )}

            {/* METRICS GRID */}
            <div className="card-grid" style={{ marginBottom: "2rem" }}>
                {/* Receita */}
                <div className="stat-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                        <span className="stat-label">{t("producer.dashboard.metrics.revenue")}</span>
                        <div style={{ padding: 6, borderRadius: "50%", background: "rgba(76, 217, 100, 0.1)", color: "#4cd964" }}>
                            <DollarSign size={18} />
                        </div>
                    </div>
                    <div className="stat-value">{stats.revenue}</div>
                    {stats.revenueGrowth !== null && (
                        <div style={{
                            display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", marginTop: 4,
                            color: stats.revenueGrowth >= 0 ? "#4cd964" : "#ef4444"
                        }}>
                            <TrendingUp size={14} style={stats.revenueGrowth < 0 ? { transform: "rotate(180deg)" } : undefined} />
                            <span>{stats.revenueGrowth >= 0 ? "+" : ""}{stats.revenueGrowth}% {t("producer.dashboard.metrics.vsLastMonth")}</span>
                        </div>
                    )}
                </div>

                {/* Ingressos Vendidos */}
                <div className="stat-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                        <span className="stat-label">{t("producer.dashboard.metrics.ticketsSold")}</span>
                        <div style={{ padding: 6, borderRadius: "50%", background: "rgba(212, 175, 55, 0.1)", color: "var(--accent-primary)" }}>
                            <Ticket size={18} />
                        </div>
                    </div>
                    <div className="stat-value">{stats.ticketsSold}</div>
                    <span style={{ fontSize: "0.75rem", color: "var(--fg-tertiary)" }}>{t("producer.dashboard.metrics.accumulated")}</span>
                </div>

                {/* Eventos Ativos */}
                <div className="stat-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                        <span className="stat-label">{t("producer.dashboard.metrics.activeEvents")}</span>
                        <div style={{ padding: 6, borderRadius: "50%", background: "rgba(59, 130, 246, 0.1)", color: "#60a5fa" }}>
                            <Calendar size={18} />
                        </div>
                    </div>
                    <div className="stat-value">{stats.activeEvents}</div>
                    <button
                        onClick={() => navigate("/producer/events/new")}
                        style={{
                            background: "none", border: "none", color: "#60a5fa", fontSize: "0.75rem",
                            cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0, marginTop: 4
                        }}
                    >
                        <Plus size={14} /> {t("producer.dashboard.metrics.createNew")}
                    </button>
                </div>

                {/* Valor Captado */}
                <div className="stat-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                        <span className="stat-label">{t("producer.dashboard.metrics.raisedAmount", "Valor Captado")}</span>
                        <div style={{ padding: 6, borderRadius: "50%", background: "rgba(239, 68, 68, 0.1)", color: "#f87171" }}>
                            <BarChart3 size={18} />
                        </div>
                    </div>
                    <div className="stat-value">{stats.raisedAmount}</div>
                    <span style={{ fontSize: "0.75rem", color: "var(--fg-tertiary)" }}>{t("producer.dashboard.metrics.approvedProjects", "Em projetos aprovados")}</span>
                </div>
            </div>

            {/* EVENTS & SERVICES */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
                {/* use @media to make 2/3 + 1/3 on large screens via CSS grid inside the card */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>

                    {/* Próximos Eventos */}
                    <div className="card" style={{ gridColumn: nextEvents.length > 0 ? "span 2" : undefined }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border-subtle)" }}>
                            <h2 className="card-title" style={{ margin: 0 }}>📅 {t("producer.dashboard.nextEvents.title")}</h2>
                            <button
                                onClick={() => navigate("/producer/events")}
                                className="btn btn-ghost"
                                style={{ fontSize: "0.85rem" }}
                            >
                                {t("producer.dashboard.nextEvents.viewAll")}
                            </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {nextEvents.length > 0 ? nextEvents.map(evt => (
                                <div key={evt.id} style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    padding: "1rem", borderRadius: "var(--radius-md)",
                                    background: "rgba(0,0,0,0.2)", border: "1px solid transparent",
                                    transition: "all 0.2s", cursor: "pointer"
                                }}
                                    onClick={() => navigate(`/producer/events/${evt.id}`)}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <div style={{
                                            background: "var(--accent-primary)", color: "var(--bg-page)",
                                            width: 50, height: 50, borderRadius: "var(--radius-md)",
                                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                            fontWeight: 700, boxShadow: "0 4px 10px rgba(212,175,55,0.2)"
                                        }}>
                                            <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>{evt.date.split('/')[0]}</span>
                                            <span style={{ fontSize: "0.6rem", textTransform: "uppercase" }}>
                                                {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][parseInt(evt.date.split('/')[1]) - 1]}
                                            </span>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: "var(--fg-main)", fontSize: "1rem" }}>{evt.name}</div>
                                            <div style={{ fontSize: "0.85rem", color: "var(--fg-tertiary)" }}>{t("producer.dashboard.nextEvents.sales")}: {evt.sales}</div>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-outline"
                                        style={{ fontSize: "0.8rem" }}
                                        onClick={(e) => { e.stopPropagation(); navigate(`/producer/events/${evt.id}`); }}
                                    >
                                        {t("producer.dashboard.nextEvents.manage")}
                                    </button>
                                </div>
                            )) : (
                                <div style={{
                                    textAlign: "center", padding: "2rem", color: "var(--fg-tertiary)",
                                    background: "rgba(0,0,0,0.15)", borderRadius: "var(--radius-md)"
                                }}>
                                    <Calendar size={32} style={{ marginBottom: "0.5rem", opacity: 0.5, display: "inline-block" }} />
                                    <p style={{ marginBottom: "1rem" }}>Nenhum evento agendado. Crie seu primeiro evento!</p>
                                    <button className="btn btn-primary" onClick={() => navigate("/producer/events/new")}>
                                        <Plus size={16} /> Criar Evento
                                    </button>
                                </div>
                            )}

                            {nextEvents.length > 0 && (
                                <button
                                    onClick={() => navigate("/producer/events/new")}
                                    className="btn btn-outline"
                                    style={{
                                        width: "100%", padding: "1rem", borderStyle: "dashed",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
                                    }}
                                >
                                    <Plus size={18} /> {t("producer.dashboard.nextEvents.create", "Novo Evento")}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Cards */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        {/* Lei de Incentivo */}
                        <div className="card" style={{ position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", top: 0, right: 0, padding: "1rem", opacity: 0.08 }}>
                                <Briefcase size={80} />
                            </div>
                            <h3 style={{ color: "var(--accent-primary)", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", position: "relative", zIndex: 1 }}>
                                <AlertCircle size={18} /> {t("producer.dashboard.services.lbiTitle")}
                            </h3>
                            <p style={{ fontSize: "0.85rem", color: "var(--fg-secondary)", marginBottom: "1.5rem", lineHeight: 1.6, position: "relative", zIndex: 1 }}>
                                {t("producer.dashboard.services.lbiText")}
                            </p>
                            <button
                                className="btn btn-primary"
                                style={{ width: "100%", position: "relative", zIndex: 1 }}
                                onClick={() => navigate("/producer/services")}
                            >
                                {t("producer.dashboard.services.hire")}
                            </button>
                        </div>

                        {/* Relatórios */}
                        <div className="card">
                            <h3 className="card-title" style={{ marginBottom: "1rem" }}>📊 {t("producer.dashboard.services.reports")}</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                <button
                                    style={{
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                        padding: "0.75rem", borderRadius: "var(--radius-md)", background: "none",
                                        border: "none", color: "var(--fg-secondary)", cursor: "pointer",
                                        transition: "all 0.2s", width: "100%", textAlign: "left", fontFamily: "inherit", fontSize: "0.9rem"
                                    }}
                                >
                                    <span>{t("producer.dashboard.services.minc")}</span>
                                    <ExternalLink size={14} />
                                </button>
                                <button
                                    style={{
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                        padding: "0.75rem", borderRadius: "var(--radius-md)", background: "none",
                                        border: "none", color: "var(--fg-secondary)", cursor: "pointer",
                                        transition: "all 0.2s", width: "100%", textAlign: "left", fontFamily: "inherit", fontSize: "0.9rem"
                                    }}
                                >
                                    <span>{t("producer.dashboard.services.participants")}</span>
                                    <ExternalLink size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
