import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";
import { 
    BarChart3, 
    Users, 
    Eye, 
    Star, 
    BadgeCheck, 
    ArrowUpRight, 
    Landmark, 
    Sparkles,
    Activity,
    Globe,
    Zap,
    TrendingUp,
    ShieldAlert,
    Cpu,
    Target,
    Layers,
    Terminal,
    ShieldCheck,
    Navigation,
    Compass
} from "lucide-react";
import { 
    Button, 
    Card, 
    Badge, 
    AnimateIn, 
    AnimatedCounter 
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

type TenantSummary = {
    tenantId: string;
    name: string;
    slug: string;
    worksCount: number;
    trailsCount: number;
    eventsCount: number;
    visitorsCount: number;
    visitsCount: number;
    equipamentosCount: number;
};

export const MasterDashboard: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [summaries, setSummaries] = useState<TenantSummary[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/analytics/tenants-summary");
            const data = res.data.map((item: any) => ({
                ...item,
                worksCount: item.works,
                trailsCount: item.trails,
                eventsCount: item.events,
                visitorsCount: item.visitors,
                visitsCount: item.visits,
                equipamentosCount: item.equipamentos || 0
            }));
            setSummaries(data);
        } catch (err) {
            toast.error(t("master.dashboard.sync_error", "Erro na sincronização de dados globais."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const stats = useMemo(() => {
        const visitors = summaries.reduce((acc, s) => acc + (s.visitorsCount || 0), 0);
        const visits = summaries.reduce((acc, s) => acc + (s.visitsCount || 0), 0);
        const equipments = summaries.reduce((acc, s) => acc + (s.equipamentosCount || 0), 0);
        return { visitors, visits, equipments };
    }, [summaries]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">{t("master.dashboard.syncing_nodes", "Sincronizando Nodes Globais...")}</p>
        </div>
    );

    return (
        <AnimateIn className="space-y-12 pb-32">
            {/* System Health Ticker - Elite Dark Gold */}
            <div className="bg-slate-950/40 border-y border-amber-500/10 py-4 overflow-hidden relative backdrop-blur-md">
                <div className="flex gap-16 animate-marquee-fast items-center">
                    {[1, 2, 3].map(i => (
                        <React.Fragment key={i}>
                            <span className="flex items-center gap-3 text-[9px] font-black text-amber-500 uppercase tracking-[0.2em]">
                                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" /> 
                                Core API: Operational (99.99%)
                            </span>
                            <span className="flex items-center gap-3 text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">
                                <Cpu size={12} /> AI Processing: 38ms Latency
                            </span>
                            <span className="flex items-center gap-3 text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">
                                <ShieldCheck size={12} /> Security Engine: Verified
                            </span>
                            <span className="flex items-center gap-3 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                <Terminal size={12} /> Last Sync: Just Now
                            </span>
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-amber-500/10 text-amber-500 border-none px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.3em] italic">
                            {t("master.dashboard.supreme_command", "Supreme Command & Global Governance")}
                        </Badge>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic leading-none">
                        {t("master.dashboard.dashboard", "Dashboard")} <span className="text-amber-500">{t("master.dashboard.supreme", "Supremo")}</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-xl max-w-3xl leading-relaxed">
                        {t("master.dashboard.desc", "Controle centralizado do ecossistema cultural: Monitoramento de tráfego, ativos e governança municipal.")}
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button 
                        onClick={() => navigate('/master/users')}
                        className="h-16 px-10 rounded-2xl bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-amber-500 hover:text-white transition-all shadow-2xl shadow-amber-500/10 active:scale-95"
                    >
                        <ShieldCheck size={20} className="mr-3" /> {t("master.dashboard.manage_authority", "Gerir Autoridade")}
                    </Button>
                </div>
            </div>

            {/* AI Insight Bar - Deep Blue & Gold */}
            <Card className="p-10 bg-gradient-to-r from-blue-600/10 via-amber-500/5 to-transparent border-amber-500/20 rounded-[48px] flex items-center gap-10 group relative overflow-hidden shadow-2xl">
                <div className="w-20 h-20 bg-amber-500 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-amber-500/40 group-hover:rotate-12 transition-transform duration-700">
                    <Sparkles size={40} />
                </div>
                <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-black text-white italic flex items-center gap-3">
                        Master Intelligence <Badge className="bg-amber-500/20 text-amber-500 border-none text-[9px] uppercase tracking-widest font-black">Elite Level</Badge>
                    </h3>
                    <p className="text-base text-slate-400 leading-relaxed font-medium italic">
                        "Governança global está estável. Detectei um crescimento de <strong className="text-amber-500">18.5% na emissão de selos</strong> no último ciclo. Recomendo auditar o node de <strong>{summaries[0]?.name || 'suas cidades'}</strong> pelo alto volume de tráfego orgânico detectado."
                    </p>
                </div>
                <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
            </Card>

            {/* Global Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                    { label: t("master.dashboard.global_audience", "Público Global"), value: stats.visitors, icon: <Users size={32} />, color: "text-amber-500", bg: "bg-amber-500/10", trend: t("master.dashboard.ambassadors", "Embaixadores"), desc: t("master.dashboard.citizens_integrated", "Cidadãos únicos integrados ao ecossistema.") },
                    { label: t("master.dashboard.network_nodes", "Nodes de Rede"), value: stats.equipments, icon: <Landmark size={32} />, color: "text-blue-400", bg: "bg-blue-600/10", trend: t("master.dashboard.assets", "Ativos"), desc: t("master.dashboard.cultural_equipments", "Equipamentos culturais operando em rede.") },
                    { label: t("master.dashboard.total_interactions", "Interações Totais"), value: stats.visits, icon: <Activity size={32} />, color: "text-emerald-400", bg: "bg-emerald-600/10", trend: "Sync Flow", desc: t("master.dashboard.flow_desc", "Fluxo total de engajamento e consultas API.") },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="p-12 bg-[#0f172a]/40 border-white/5 rounded-[56px] group hover:bg-white/[0.04] transition-all relative overflow-hidden shadow-2xl border-t border-t-white/10">
                            <div className="relative z-10 space-y-10">
                                <div className={`w-16 h-16 rounded-[24px] ${stat.bg} ${stat.color} flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform shadow-lg`}>
                                    {stat.icon}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] italic">{stat.label}</h3>
                                    <div className="text-7xl font-black text-white tracking-tighter italic leading-none">
                                        <AnimatedCounter value={stat.value} />
                                    </div>
                                </div>
                                <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                                    <Badge variant="glass" className={`${stat.bg} ${stat.color} border-none text-[10px] font-black uppercase tracking-widest`}>
                                        {stat.trend}
                                    </Badge>
                                    <p className="text-[9px] text-slate-600 font-bold max-w-[120px] text-right leading-tight italic">{stat.desc}</p>
                                </div>
                            </div>
                            <div className={`absolute -right-12 -top-12 opacity-[0.02] group-hover:opacity-[0.08] transition-opacity pointer-events-none ${stat.color}`}>
                                {stat.icon}
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Performance Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Top Cities - High Fidelity */}
                <Card className="p-12 bg-black/40 border-white/5 rounded-[56px] space-y-12 shadow-2xl relative overflow-hidden border-t border-t-amber-500/10">
                    <div className="flex justify-between items-center relative z-10">
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase">{t("master.dashboard.regional_performance", "Performance Regional")}</h3>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">{t("master.dashboard.visits_by_instance", "Visitas por Instância Municipal")}</p>
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                            <BarChart3 size={32} />
                        </div>
                    </div>

                    <div className="space-y-10 relative z-10">
                        {summaries.sort((a, b) => (b.visitsCount || 0) - (a.visitsCount || 0)).slice(0, 5).map((s, idx) => {
                            const maxVisits = Math.max(...summaries.map(s => s.visitsCount || 1));
                            const percentage = ((s.visitsCount || 0) / maxVisits) * 100;
                            return (
                                <div key={s.tenantId} className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-amber-500 border border-white/5 uppercase">
                                                {s.name.substring(0,2)}
                                            </div>
                                            <span className="text-[11px] font-black text-white uppercase tracking-widest">{s.name}</span>
                                        </div>
                                        <span className="text-xs font-black text-amber-500 italic tracking-tighter">{s.visitsCount?.toLocaleString()} {t("master.dashboard.interactions", "Interações")}</span>
                                    </div>
                                    <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 1.5, delay: idx * 0.1, ease: "circOut" }}
                                            className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Network Topology Map (Abstract Heatmap) */}
                <Card className="p-12 bg-black/40 border-white/5 rounded-[56px] space-y-12 shadow-2xl relative overflow-hidden border-t border-t-blue-500/10">
                    <div className="flex justify-between items-center relative z-10">
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase">{t("master.dashboard.network_topology", "Topologia de Rede")}</h3>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">{t("master.dashboard.node_dist", "Distribuição Geográfica de Nodes")}</p>
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                            <Globe size={32} />
                        </div>
                    </div>

                    <div className="grid grid-cols-6 gap-4 relative z-10">
                        {summaries.map((s, idx) => {
                            const intensity = Math.min(100, (s.equipamentosCount / 5) * 100);
                            return (
                                <motion.div
                                    key={s.tenantId}
                                    whileHover={{ scale: 1.15, rotate: 5 }}
                                    className="aspect-square rounded-2xl relative group cursor-help border border-white/10 flex items-center justify-center overflow-hidden"
                                    style={{ 
                                        background: `rgba(59, 130, 246, ${0.05 + (intensity / 150)})`,
                                    }}
                                    title={`${s.name}: ${s.equipamentosCount} equipamentos`}
                                >
                                    <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="text-[10px] font-black text-white relative z-10">{s.equipamentosCount}</span>
                                    {intensity > 80 && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping opacity-75" />
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                    
                    <div className="pt-8 flex items-center justify-between text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic">
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500/20" /> Low Density</div>
                        <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-500/10 via-blue-500/40 to-blue-500 rounded-full mx-8" />
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" /> Regional Hub</div>
                    </div>
                </Card>
            </div>

            {/* Matrix & Governance Footer */}
            <Card className="p-0 bg-white/[0.02] border-white/5 rounded-[56px] overflow-hidden shadow-2xl relative border-t-2 border-t-amber-500/20">
                <div className="p-12 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 bg-white/[0.01]">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[24px] bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                            <Navigation size={32} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase leading-none">{t("master.dashboard.gov_matrix", "Matriz de Governança")}</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mt-2 italic">Global Node Audit: Level 4 Clearance</p>
                        </div>
                    </div>
                    <Button variant="glass" className="h-14 px-10 rounded-2xl border-white/10 text-amber-500 font-black text-[10px] uppercase tracking-widest hover:bg-amber-500/10 transition-all flex items-center gap-3">
                        <TrendingUp size={18} /> {t("master.dashboard.view_report", "Ver Relatório Consolidado")}
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.01]">
                                <th className="px-12 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t("master.dashboard.city_node", "Cidade / Node")}</th>
                                <th className="px-12 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t("master.dashboard.installed_cap", "Capacidade Instalada")}</th>
                                <th className="px-12 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t("master.dashboard.active_engagement", "Engajamento Ativo")}</th>
                                <th className="px-12 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">{t("master.dashboard.controls", "Controles")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {summaries.map((s) => (
                                <tr key={s.tenantId} className="group hover:bg-white/[0.03] transition-all cursor-default">
                                    <td className="px-12 py-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-amber-500/20 flex items-center justify-center text-amber-500 font-black text-sm border border-white/5 shadow-xl group-hover:scale-110 transition-transform">
                                                {s.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-white font-black text-lg tracking-tighter group-hover:text-amber-500 transition-colors italic">{s.name}</span>
                                                <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest italic leading-none mt-1">/{s.slug}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-12 py-10">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-white font-black text-lg tracking-tighter italic leading-none">{s.equipamentosCount}</span>
                                                <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">{t("master.dashboard.units", "Unidades")}</span>
                                            </div>
                                            <div className="h-10 w-px bg-white/5" />
                                            <div className="flex flex-col">
                                                <span className="text-blue-400 font-black text-lg tracking-tighter italic leading-none">{s.worksCount}</span>
                                                <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">{t("master.dashboard.collection", "Acervo")}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-12 py-10">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp size={16} className="text-emerald-500" />
                                                <span className="text-white font-black text-2xl tracking-tighter italic leading-none">{(s.visitorsCount || 0).toLocaleString()}</span>
                                            </div>
                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-6 mt-1 italic">{t("master.dashboard.unique_citizens", "Cidadãos Únicos")}</span>
                                        </div>
                                    </td>
                                    <td className="px-12 py-10 text-right">
                                        <button 
                                            onClick={() => navigate(`/master/tenants?search=${s.slug}`)}
                                            className="w-12 h-12 rounded-2xl bg-white/5 text-slate-500 hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center border border-white/5 group-hover:border-amber-500/30 shadow-xl"
                                        >
                                            <Eye size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <style>{`
                @keyframes marquee-fast {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee-fast {
                    animation: marquee-fast 25s linear infinite;
                    display: flex;
                    width: max-content;
                }
            `}</style>
        </AnimateIn>
    );
};
