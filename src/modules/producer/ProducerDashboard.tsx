import React from "react";
import { DollarSign, Ticket, Calendar, TrendingUp, Plus, ExternalLink, BarChart3, AlertCircle, Briefcase, Rocket } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { api } from "../../api/client";
import "./ProducerDashboard.css";

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
                            <div className="skeleton-line" style={{ width: "60%", height: 28 }} />
                            <div className="skeleton-line" style={{ width: "40%", height: 14, marginTop: 8 }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="producer-dashboard-header">
                <h1 className="section-title">
                    <Rocket className="inline-block mr-2 text-[var(--accent-primary)]" size={28} />
                    {t("producer.dashboard.title")}
                </h1>
                <p className="section-subtitle">{t("producer.dashboard.subtitle")}</p>
            </div>

            {/* New Producer Onboarding CTA */}
            {isNewProducer && (
                <div className="card onboarding-card">
                    <Rocket size={48} className="onboarding-icon" />
                    <h2 className="onboarding-title">
                        Bem-vindo ao Cultura Viva!
                    </h2>
                    <p className="onboarding-text">
                        Comece criando seu primeiro evento para atrair visitantes e vender ingressos. Em poucos passos, seu espaço cultural estará no mapa!
                    </p>
                    <div className="onboarding-actions">
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
                    <div className="flex justify-between items-start mb-3">
                        <span className="stat-label">{t("producer.dashboard.metrics.revenue")}</span>
                        <div className="metric-icon-box metric-icon-revenue">
                            <DollarSign size={18} />
                        </div>
                    </div>
                    <div className="stat-value">{stats.revenue}</div>
                    {stats.revenueGrowth !== null && (
                        <div className={`growth-indicator ${stats.revenueGrowth >= 0 ? "growth-up" : "growth-down"}`}>
                            <TrendingUp size={14} style={stats.revenueGrowth < 0 ? { transform: "rotate(180deg)" } : undefined} />
                            <span>{stats.revenueGrowth >= 0 ? "+" : ""}{stats.revenueGrowth}% {t("producer.dashboard.metrics.vsLastMonth")}</span>
                        </div>
                    )}
                </div>

                {/* Ingressos Vendidos */}
                <div className="stat-card">
                    <div className="flex justify-between items-start mb-3">
                        <span className="stat-label">{t("producer.dashboard.metrics.ticketsSold")}</span>
                        <div className="metric-icon-box metric-icon-tickets">
                            <Ticket size={18} />
                        </div>
                    </div>
                    <div className="stat-value">{stats.ticketsSold}</div>
                    <span className="text-[0.75rem] text-[var(--fg-tertiary)]">{t("producer.dashboard.metrics.accumulated")}</span>
                </div>

                {/* Eventos Ativos */}
                <div className="stat-card">
                    <div className="flex justify-between items-start mb-3">
                        <span className="stat-label">{t("producer.dashboard.metrics.activeEvents")}</span>
                        <div className="metric-icon-box metric-icon-events">
                            <Calendar size={18} />
                        </div>
                    </div>
                    <div className="stat-value">{stats.activeEvents}</div>
                    <button onClick={() => navigate("/producer/events/new")} className="create-event-link">
                        <Plus size={14} /> {t("producer.dashboard.metrics.createNew")}
                    </button>
                </div>

                {/* Valor Captado */}
                <div className="stat-card">
                    <div className="flex justify-between items-start mb-3">
                        <span className="stat-label">{t("producer.dashboard.metrics.raisedAmount", "Valor Captado")}</span>
                        <div className="metric-icon-box metric-icon-raised">
                            <BarChart3 size={18} />
                        </div>
                    </div>
                    <div className="stat-value">{stats.raisedAmount}</div>
                    <span className="text-[0.75rem] text-[var(--fg-tertiary)]">{t("producer.dashboard.metrics.approvedProjects", "Em projetos aprovados")}</span>
                </div>
            </div>

            {/* EVENTS & SERVICES */}
            <div className="event-grid-container">
                {/* Próximos Eventos */}
                <div className="card" style={{ gridColumn: nextEvents.length > 0 ? "span 2" : undefined }}>
                    <div className="card-header-flex">
                        <h2 className="card-title" style={{ margin: 0 }}>📅 {t("producer.dashboard.nextEvents.title")}</h2>
                        <button onClick={() => navigate("/producer/events")} className="btn btn-ghost text-[0.85rem]">
                            {t("producer.dashboard.nextEvents.viewAll")}
                        </button>
                    </div>

                    <div className="event-list">
                        {nextEvents.length > 0 ? nextEvents.map(evt => (
                            <div key={evt.id} className="event-item-card" onClick={() => navigate(`/producer/events/${evt.id}`)}>
                                <div className="flex items-center gap-4">
                                    <div className="event-date-badge">
                                        <span className="event-day">{evt.date.split('/')[0]}</span>
                                        <span className="event-month">
                                            {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][parseInt(evt.date.split('/')[1]) - 1]}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="event-name">{evt.name}</div>
                                        <div className="event-sales-info">{t("producer.dashboard.nextEvents.sales")}: {evt.sales}</div>
                                    </div>
                                </div>
                                <button
                                    className="btn btn-outline text-[0.8rem]"
                                    onClick={(e) => { e.stopPropagation(); navigate(`/producer/events/${evt.id}`); }}
                                >
                                    {t("producer.dashboard.nextEvents.manage")}
                                </button>
                            </div>
                        )) : (
                            <div className="empty-events-state">
                                <Calendar size={32} className="mb-2 opacity-50 inline-block" />
                                <p className="mb-4">Nenhum evento agendado. Crie seu primeiro evento!</p>
                                <button className="btn btn-primary" onClick={() => navigate("/producer/events/new")}>
                                    <Plus size={16} /> Criar Evento
                                </button>
                            </div>
                        )}

                        {nextEvents.length > 0 && (
                            <button onClick={() => navigate("/producer/events/new")} className="btn btn-outline create-event-dashed-btn">
                                <Plus size={18} /> {t("producer.dashboard.nextEvents.create", "Novo Evento")}
                            </button>
                        )}
                    </div>
                </div>

                {/* Sidebar Cards */}
                <div className="sidebar-cards-stack">
                    {/* Lei de Incentivo */}
                    <div className="card lbi-card">
                        <div className="lbi-card-bg-icon">
                            <Briefcase size={80} />
                        </div>
                        <h3 className="lbi-title">
                            <AlertCircle size={18} /> {t("producer.dashboard.services.lbiTitle")}
                        </h3>
                        <p className="lbi-description">
                            {t("producer.dashboard.services.lbiText")}
                        </p>
                        <button className="btn btn-primary w-full relative z-10" onClick={() => navigate("/producer/services")}>
                            {t("producer.dashboard.services.hire")}
                        </button>
                    </div>

                    {/* Relatórios */}
                    <div className="card">
                        <h3 className="card-title mb-4">📊 {t("producer.dashboard.services.reports")}</h3>
                        <div className="report-button-list">
                            <button className="report-button">
                                <span>{t("producer.dashboard.services.minc")}</span>
                                <ExternalLink size={14} />
                            </button>
                            <button className="report-button">
                                <span>{t("producer.dashboard.services.participants")}</span>
                                <ExternalLink size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
