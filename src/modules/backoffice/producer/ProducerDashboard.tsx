import React from "react";
import { logger } from "@/utils/logger";

import { DollarSign, Ticket, Calendar, TrendingUp, Plus, ExternalLink, BarChart3, AlertCircle, Briefcase, Rocket, Sparkles, ListChecks, ArrowRight, Wand2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import "./ProducerDashboard.css";

export const ProducerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { tenantId } = useAuth();
    const [loading, setLoading] = React.useState(true);
    const [openNotices, setOpenNotices] = React.useState<any[]>([]);
    const [projectSummary, setProjectSummary] = React.useState({
        drafts: 0,
        submitted: 0,
        approved: 0
    });
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
                const [salesRes, eventsRes, noticesRes, projectsRes] = await Promise.all([
                    api.get("/analytics/sales-summary"),
                    api.get("/events"),
                    api.get("/notices/public"),
                    api.get("/projects/my")
                ]);

                // Sales & Metrics
                const sold = salesRes.data.ticketsSold || 0;
                const rev = salesRes.data.totalRevenue || 0;
                const raised = salesRes.data.raisedAmount || 0;

                // Notices (Recent & Active)
                const notices = (noticesRes.data.data ? noticesRes.data.data : noticesRes.data) as unknown[];
                setOpenNotices(notices.filter(n => new Date(n.inscriptionEnd) >= new Date()).slice(0, 3));

                // Projects Summary
                const projects = (projectsRes.data.data ? projectsRes.data.data : projectsRes.data) as unknown[];
                setProjectSummary({
                    drafts: projects.filter(p => p.status === 'DRAFT').length,
                    submitted: projects.filter(p => p.status === 'SUBMITTED' || p.status === 'UNDER_REVIEW').length,
                    approved: projects.filter(p => p.status === 'APPROVED' || p.status === 'IN_EXECUTION').length,
                });

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const allEvents = (eventsRes.data.data ? eventsRes.data.data : eventsRes.data) as unknown[];

                const activeCount = allEvents.filter(e => e.status !== 'INACTIVE').length;

                const upcomingRaw = allEvents
                    .filter(e => new Date(e.startDate) >= new Date())
                    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                    .slice(0, 3);

                const upcoming = await Promise.all(upcomingRaw.map(async (e: unknown) => {
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
                logger.error("Error fetching producer dashboard", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tenantId]);

    const isNewProducer = !loading && stats.activeEvents === 0 && nextEvents.length === 0 && projectSummary.drafts === 0;

    // Loading skeleton
    if (loading) {
        return (
            <div>
                <h1 className="section-title">🎪 {t("producer.dashboard.title")}</h1>
                <div className="card-grid" style={{ marginBottom: "2rem" }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 mb-4" style={{ minHeight: 90 }}>
                            <div className="skeleton-line" style={{ width: "60%", height: 28 }} />
                            <div className="skeleton-line" style={{ width: "40%", height: 14, marginTop: 8 }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="producer-dashboard-container animate-in fade-in duration-500">
            {/* Header */}
            <div className="producer-dashboard-header mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#EAE0D5] font-serif">
                            <Rocket className="inline-block mr-3 text-[var(--accent-primary)]" size={32} />
                            {t("producer.dashboard.title")}
                        </h1>
                        <p className="text-[#B0A090] mt-1">{t("producer.dashboard.subtitle")}</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => navigate("/producer/projects/new")}
                            className="bg-[var(--accent-primary)] text-black px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-[var(--accent-primary)]/20"
                        >
                            <Plus size={18} /> {t("producer.dashboard.newProposal", "Nova Proposta")}
                        </button>
                    </div>
                </div>
            </div>

            {/* PIPELINE & AI COMMAND CENTER ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* PROJECT PIPELINE */}
                <div className="lg:col-span-2 premium-glass p-8 rounded-[40px] glow-hover">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-white flex items-center gap-3 italic">
                                <ListChecks className="text-[var(--accent-primary)]" size={28} /> {t("producer.dashboard.projectPipeline", "Pipeline de Projetos")}
                            </h2>
                            <p className="text-[10px] text-[#B0A090] uppercase tracking-widest mt-1">{t("producer.dashboard.proposalsManagement", "Gestão de propostas e editais")}</p>
                        </div>
                        <button onClick={() => navigate("/producer/projects")} className="btn-secondary text-[10px] px-4 py-2">{t("producer.dashboard.exploreAll", "Explorar Tudo")}</button>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5 flex flex-col items-center group hover:bg-white/10 transition-all cursor-pointer" onClick={() => navigate("/producer/projects?status=DRAFT")}>
                            <div className="text-4xl font-black text-white mb-1 group-hover:scale-110 transition-transform">{projectSummary.drafts}</div>
                            <div className="text-[9px] text-[#B0A090] font-black uppercase tracking-tighter">{t("producer.dashboard.drafts", "Rascunhos")}</div>
                        </div>
                        <div className="bg-[var(--accent-primary)]/5 rounded-3xl p-6 border border-[var(--accent-primary)]/20 flex flex-col items-center group hover:bg-[var(--accent-primary)]/10 transition-all cursor-pointer" onClick={() => navigate("/producer/projects?status=SUBMITTED")}>
                            <div className="text-4xl font-black text-[var(--accent-primary)] mb-1 group-hover:scale-110 transition-transform">{projectSummary.submitted}</div>
                            <div className="text-[9px] text-[var(--accent-primary)] font-black uppercase tracking-tighter">{t("producer.dashboard.underReview", "Em Análise")}</div>
                        </div>
                        <div className="bg-green-500/5 rounded-3xl p-6 border border-green-500/20 flex flex-col items-center group hover:bg-green-500/10 transition-all cursor-pointer" onClick={() => navigate("/producer/projects?status=APPROVED")}>
                            <div className="text-4xl font-black text-green-400 mb-1 group-hover:scale-110 transition-transform">{projectSummary.approved}</div>
                            <div className="text-[9px] text-green-400/70 font-black uppercase tracking-tighter">{t("producer.dashboard.approved", "Aprovados")}</div>
                        </div>
                    </div>
                </div>

                {/* AI COMMAND CENTER */}
                <div className="premium-glass p-8 rounded-[40px] border-[var(--accent-primary)]/30 relative overflow-hidden flex flex-col justify-between group">
                    <div className="absolute -right-8 -top-8 text-[var(--accent-primary)] opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                        <Wand2 size={160} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-[var(--accent-primary)] font-black text-xs uppercase tracking-widest mb-4">
                            <Sparkles size={16} /> {t("producer.dashboard.aiCommandCenter", "AI Command Center")}
                        </div>
                        <p className="text-sm text-[#EAE0D5] font-medium leading-relaxed mb-6">
                            {t("producer.dashboard.aiAnalysisMessage", "\"Analisei seus rascunhos. O projeto <strong>'{projectName}'</strong> tem 85% de aderência ao edital da Lei Paulo Gustavo.\"", { projectName: projectSummary.drafts > 0 ? "..." : "Novo Projeto" })}
                        </p>
                    </div>
                    <button className="btn-primary w-full text-[10px] font-black italic relative z-10">
                        {t("producer.dashboard.optimizeProposals", "Otimizar Propostas agora")}
                    </button>
                </div>
            </div>

            {/* METRICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="premium-glass p-6 rounded-3xl glow-hover">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black text-[#B0A090] uppercase tracking-widest">{t("producer.dashboard.metrics.revenue")}</span>
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                            <DollarSign size={18} />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white">{stats.revenue}</div>
                </div>

                <div className="premium-glass p-6 rounded-3xl glow-hover">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black text-[#B0A090] uppercase tracking-widest">{t("producer.dashboard.metrics.ticketsSold")}</span>
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                            <Ticket size={18} />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white">{stats.ticketsSold}</div>
                </div>

                <div className="premium-glass p-6 rounded-3xl glow-hover">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black text-[#B0A090] uppercase tracking-widest">{t("producer.dashboard.metrics.activeEvents")}</span>
                        <div className="p-2 bg-[var(--accent-primary)]/10 rounded-lg text-[var(--accent-primary)]">
                            <Calendar size={18} />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white">{stats.activeEvents}</div>
                </div>

                <div className="premium-glass p-6 rounded-3xl glow-hover">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black text-[#B0A090] uppercase tracking-widest">{t("producer.dashboard.metrics.raisedAmount", "Valor Captado")}</span>
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                            <BarChart3 size={18} />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white">{stats.raisedAmount}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* PRÓXIMOS EVENTOS */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-[#EAE0D5] flex items-center gap-2">
                            <Calendar className="text-[var(--accent-primary)]" /> {t("producer.dashboard.nextEvents.title")}
                        </h2>
                        <button onClick={() => navigate("/producer/events")} className="text-xs text-[#B0A090] hover:text-[var(--accent-primary)] font-bold flex items-center gap-1 transition-colors">
                            {t("producer.dashboard.viewAgenda", "Ver Agenda")} <ArrowRight size={14} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {nextEvents.length > 0 ? nextEvents.map(evt => (
                            <div key={evt.id} className="bg-[#2c1e10] border border-[#463420] rounded-2xl p-4 flex items-center justify-between group hover:bg-[#3d2b17] transition-all cursor-pointer" onClick={() => navigate(`/producer/events/${evt.id}`)}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-black/20 flex flex-col items-center justify-center border border-[#463420]">
                                        <span className="text-[10px] font-bold text-[var(--accent-primary)] uppercase">{evt.date.split('/')[1]}</span>
                                        <span className="text-lg font-bold text-[#EAE0D5] leading-none">{evt.date.split('/')[0]}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#EAE0D5] group-hover:text-[var(--accent-primary)] transition-colors">{evt.name}</h3>
                                        <div className="flex items-center gap-3 text-xs text-[#B0A090] mt-1">
                                            <span className="flex items-center gap-1"><Ticket size={12} /> {evt.sales}</span>
                                        </div>
                                    </div>
                                </div>
                                <ArrowRight size={18} className="text-[#463420] group-hover:text-[var(--accent-primary)] transition-all" />
                            </div>
                        )) : (
                            <div className="bg-[#2c1e10]/50 border border-dashed border-[#463420] rounded-3xl p-12 text-center">
                                <Calendar size={40} className="mx-auto mb-4 text-[#463420]" />
                                <p className="text-[#B0A090] mb-4">{t("producer.dashboard.noUpcomingEvents", "Nenhum evento próximo. Que tal criar um agora?")}</p>
                                <button onClick={() => navigate("/producer/events/new")} className="bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 px-6 py-2 rounded-xl font-bold hover:bg-[var(--accent-primary)] hover:text-black transition-all">
                                    {t("producer.dashboard.createEvent", "Criar Evento")}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* OPPORTUNITIES HUB (NOTICES) */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-[#EAE0D5] flex items-center gap-2">
                        <Sparkles className="text-[var(--accent-primary)]" /> {t("producer.dashboard.openNotices", "Editais Abertos")}
                    </h2>
                    <div className="space-y-3">
                        {openNotices.length > 0 ? openNotices.map(notice => (
                            <div key={notice.id} className="bg-gradient-to-br from-[#2c1e10] to-[#1a1108] border border-[#463420] rounded-2xl p-5 hover:border-[var(--accent-primary)]/50 transition-all">
                                <div className="text-[10px] font-bold text-[var(--accent-primary)] uppercase mb-2 tracking-widest">{t("producer.dashboard.opportunity", "Oportunidade")}</div>
                                <h3 className="font-bold text-[#EAE0D5] mb-2 line-clamp-2">{notice.title}</h3>
                                <div className="flex items-center justify-between text-xs text-[#B0A090] mb-4">
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {t("producer.dashboard.until", "Até")} {new Date(notice.inscriptionEnd).toLocaleDateString()}</span>
                                    <span className="text-[var(--accent-primary)] font-bold">R$ {Number(notice.maxPerProject).toLocaleString()}</span>
                                </div>
                                <button 
                                    onClick={() => navigate(`/producer/projects/new?noticeId=${notice.id}`)}
                                    className="w-full bg-white/5 hover:bg-[var(--accent-primary)] hover:text-black border border-white/10 transition-all py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                                >
                                    {t("producer.dashboard.enrollProject", "Inscrever Projeto")} <ArrowRight size={14} />
                                </button>
                            </div>
                        )) : (
                            <div className="bg-[#2c1e10]/30 border border-[#463420] rounded-2xl p-6 text-center italic text-[#B0A090] text-sm">
                                {t("producer.dashboard.noOpenNotices", "Nenhum edital aberto no momento.")}
                            </div>
                        )}
                        <button 
                            onClick={() => navigate("/producer/notices")}
                            className="w-full py-3 text-[#B0A090] hover:text-[var(--accent-primary)] transition-colors text-sm font-bold border border-dashed border-[#463420] rounded-2xl"
                        >
                            {t("producer.dashboard.viewAllNotices", "Ver Todos os Editais")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
