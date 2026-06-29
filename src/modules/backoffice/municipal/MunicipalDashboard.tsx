import { useTranslation } from "react-i18next";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users,
    Building2,
    FileText,
    Accessibility,
    TrendingUp,
    AlertCircle,
    ArrowUpRight,
    Search,
    Filter,
    Calendar,
    ChevronRight,
    Clock,
    Sparkles,
    Globe,
    ShieldCheck,
    BarChart3,
    Zap,
    Download
} from "lucide-react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { 
    Button, 
    Card, 
    Badge, 
    AnimateIn, 
    AnimatedCounter 
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export const MunicipalDashboard: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [period, setPeriod] = useState<"30" | "7" | "90" | "365">("30");

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/secretary/dashboard", { params: { periodDays: period, tenantId } });
            setData(res.data);
        } catch (err) {
            console.error("Error fetching municipal dashboard", err);
            toast.error(t("municipal.dashboard.sync_error", "Erro ao sincronizar dados executivos."));
        } finally {
            setLoading(false);
        }
    }, [period, tenantId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading && !data) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">{t("municipal.dashboard.loading", "Consolidando Panorama Municipal...")}</p>
        </div>
    );

    const cards = [
        { label: t("municipal.dashboard.equipments", "Equipamentos"), value: data?.cards?.totalEquipments || 0, icon: <Building2 size={24} />, trend: t("municipal.dashboard.trend_units", "+2 unidades"), color: "text-emerald-400", bg: "bg-emerald-400/10" },
        { label: t("municipal.dashboard.accessibility_actions", "Ações de Acessibilidade"), value: data?.cards?.totalAccessibilityActions || 0, icon: <Accessibility size={24} />, trend: t("municipal.dashboard.trend_completed", "98% concluídas"), color: "text-cyan-400", bg: "bg-cyan-400/10" },
        { label: t("municipal.dashboard.active_projects", "Projetos Ativos"), value: data?.cards?.activeProjects || 0, icon: <FileText size={24} />, trend: t("municipal.dashboard.trend_analysis", "15 em análise"), color: "text-amber-400", bg: "bg-amber-400/10" },
        { label: t("municipal.dashboard.estimated_impact", "Impacto Estimado"), value: data?.cards?.estimatedPublicImpact || 0, icon: <Users size={24} />, trend: "+12.4% MoM", color: "text-indigo-400", bg: "bg-indigo-400/10" }
    ];

    const periodLabels = {
        "7": t("municipal.dashboard.7_days", "7 dias"),
        "30": t("municipal.dashboard.30_days", "30 dias"),
        "90": t("municipal.dashboard.90_days", "90 dias"),
        "365": t("municipal.dashboard.1_year", "1 ano")
    };

    return (
        <AnimateIn className="space-y-12 pb-24">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                            {t("municipal.dashboard.title_management", "Gestão")} <span className="text-emerald-500">{t("municipal.dashboard.title_municipal", "Municipal")}</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 font-medium text-lg">{t("municipal.dashboard.subtitle", "Monitoramento estratégico de equipamentos, projetos e conformidade LBI.")}</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    <div className="flex flex-wrap gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-xl w-full md:w-auto">
                        {(Object.entries(periodLabels) as [keyof typeof periodLabels, string][]).map(([val, label]) => (
                            <button
                                key={val}
                                onClick={() => setPeriod(val as any)}
                                className={`flex-1 md:flex-none min-w-[60px] px-3 md:px-5 py-3 md:py-2.5 rounded-xl text-xs md:text-[10px] font-black uppercase tracking-widest transition-all ${
                                    period === val 
                                    ? 'bg-emerald-600 text-white shadow-lg' 
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    
                    <Button
                        onClick={() => window.open(`${api.defaults.baseURL}/executive-reports/pdf?tenantId=${tenantId}`, '_blank')}
                        className="h-14 w-full md:w-auto px-8 rounded-[20px] bg-white/5 border border-white/5 text-white font-black uppercase text-xs md:text-[10px] tracking-[0.2em] hover:bg-white/10 transition-all shadow-xl shadow-black/20"
                        leftIcon={<Download size={18} />}
                    >
                        {t("municipal.dashboard.executive_report", "Relatório Executivo")}
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {cards.map((card, idx) => (
                    <Card key={idx} className="p-6 md:p-8 bg-white/[0.02] border-white/5 rounded-[32px] md:rounded-[40px] group hover:bg-white/[0.04] transition-all relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center border border-white/5 transition-all group-hover:scale-110 ${card.bg} ${card.color}`}>
                                {card.icon}
                            </div>
                            <Badge variant="glass" className="bg-emerald-500/10 text-emerald-400 border-none text-[9px] md:text-[8px] font-black uppercase tracking-widest px-3 py-1">
                                {card.trend}
                            </Badge>
                        </div>
                        <div className="relative z-10">
                            <div className="text-3xl md:text-4xl font-black text-white leading-none tracking-tighter">
                                <AnimatedCounter value={card.value} />
                            </div>
                            <div className="text-xs md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-4">{card.label}</div>
                        </div>
                        <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity hidden md:block">
                            {React.cloneElement(card.icon as React.ReactElement, { size: 100 })}
                        </div>
                    </Card>
                ))}
            </div>

            {/* ═══ AI EXECUTIVE INSIGHTS ════════ */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative p-6 md:p-10 rounded-[32px] md:rounded-[48px] bg-gradient-to-br from-emerald-600/10 via-[#0a0f1e] to-indigo-600/5 border border-white/5 overflow-hidden group shadow-2xl shadow-emerald-950/20"
            >
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-600 text-white rounded-[24px] md:rounded-[32px] flex items-center justify-center shadow-2xl shadow-emerald-600/40 shrink-0 group-hover:rotate-6 transition-transform duration-700">
                        <Sparkles size={40} />
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-4 py-1.5">{t("municipal.dashboard.ai_analysis", "Análise de IA Ativa")}</Badge>
                            <h3 className="text-2xl font-black text-white tracking-tighter italic">{t("municipal.dashboard.strategic_overview", "Panorama Estratégico")}</h3>
                        </div>
                        <p className="text-lg text-slate-300 leading-relaxed font-medium">
                            {t("municipal.dashboard.ai_insight_part1", "\"Identificamos um crescimento de")} <span className="text-emerald-400 font-black tracking-widest">12%</span> {t("municipal.dashboard.ai_insight_part2", "na acessibilidade física municipal. O foco prioritário deve ser o")} <span className="text-white border-b-2 border-emerald-500/50">{t("municipal.dashboard.ai_insight_equipment", "Equipamento")} {data?.equipmentAccessibility?.[0]?.name || t("municipal.dashboard.ai_insight_default_equipment", "Cultural Central")}</span>, {t("municipal.dashboard.ai_insight_part3", "onde 15 solicitações pendentes impactam diretamente a meta do PPA.\"")}
                        </p>
                    </div>
                    <Button variant="glass" className="h-14 px-8 rounded-2xl border-white/5 text-white font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600/20 hover:text-emerald-400 transition-all shrink-0">
                        {t("municipal.dashboard.view_actions", "Visualizar Ações")} <ArrowUpRight size={18} className="ml-2" />
                    </Button>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/5 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
                {/* Accessibility Compliance List */}
                <Card className="lg:col-span-8 p-0 bg-white/[0.02] border-white/5 rounded-[32px] md:rounded-[48px] overflow-hidden">
                    <div className="p-6 md:p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/[0.01]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight italic">{t("municipal.dashboard.legal_compliance", "Conformidade Legal")}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{t("municipal.dashboard.compliance_status", "Status por unidade cultural")}</p>
                            </div>
                        </div>
                        <Button 
                            variant="glass" 
                            className="h-10 px-6 rounded-xl border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-400"
                            onClick={() => navigate('/municipal/compliance')}
                        >
                            {t("municipal.dashboard.view_details", "Ver Detalhes")} <ChevronRight size={14} className="ml-2" />
                        </Button>
                    </div>
                    
                    <div className="overflow-x-auto pb-4">
                        <table className="w-full text-left min-w-[700px]">
                            <thead className="bg-white/[0.02] text-[11px] md:text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="px-6 md:px-10 py-5 md:py-6 font-black tracking-[0.2em]">{t("municipal.dashboard.table_equipment", "Equipamento")}</th>
                                    <th className="px-6 md:px-10 py-5 md:py-6 font-black tracking-[0.2em]">{t("municipal.dashboard.table_type", "Tipologia")}</th>
                                    <th className="px-6 md:px-10 py-5 md:py-6 font-black tracking-[0.2em]">{t("municipal.dashboard.table_accessibility", "Acessibilidade")}</th>
                                    <th className="px-6 md:px-10 py-5 md:py-6 font-black tracking-[0.2em]">{t("municipal.dashboard.table_pending", "Pendências")}</th>
                                    <th className="px-6 md:px-10 py-5 md:py-6"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {(data?.equipmentAccessibility || []).map((eq: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-white/[0.02] transition-all group">
                                        <td className="px-6 md:px-10 py-6 md:py-8">
                                            <div className="font-bold text-white group-hover:text-emerald-400 transition-colors text-base md:text-lg">{eq.name}</div>
                                            <div className="text-[11px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">{t("municipal.dashboard.ref", "Ref:")} {eq.id.slice(0, 8)}</div>
                                        </td>
                                        <td className="px-6 md:px-10 py-6 md:py-8">
                                            <Badge variant="glass" className="bg-white/5 text-slate-400 border-white/5 uppercase text-[10px] md:text-[9px] font-black tracking-widest px-3 py-1">
                                                {eq.type}
                                            </Badge>
                                        </td>
                                        <td className="px-6 md:px-10 py-6 md:py-8">
                                            {eq.hasAccessibility ? (
                                                <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                    {t("municipal.dashboard.status_approved", "Homologado")}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-rose-500 font-black text-[10px] uppercase tracking-widest">
                                                    <AlertCircle size={14} /> {t("municipal.dashboard.status_review", "Em Revisão")}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 md:px-10 py-6 md:py-8">
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-black ${eq.pendingRequests > 0 ? 'text-amber-500' : 'text-slate-700'}`}>
                                                    {eq.pendingRequests} {t("municipal.dashboard.requests", "Solicitações")}
                                                </span>
                                                <div className="w-24 h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                                                    <div className="h-full bg-emerald-500 w-[70%]" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 md:px-10 py-6 md:py-8 text-right">
                                            <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-600 hover:text-emerald-400 hover:bg-emerald-400/10 transition-all min-h-[44px] min-w-[44px]">
                                                <ArrowUpRight size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Right Column: Operational Flow */}
                <div className="lg:col-span-4 space-y-8 md:space-y-10">
                    {/* Alerts Panel */}
                    <Card className="p-6 md:p-10 bg-[#0f172a] rounded-[32px] md:rounded-[48px] border-white/5 shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10 space-y-6 md:space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-white italic tracking-tighter flex items-center gap-3">
                                    <Zap size={20} className="text-amber-400" /> {t("municipal.dashboard.critical_alerts", "Alertas Críticos")}
                                </h3>
                                <Badge className="bg-amber-500/10 text-amber-500 border-none text-[8px] font-black uppercase">{t("municipal.dashboard.real_time", "Tempo Real")}</Badge>
                            </div>
                            
                            <div className="space-y-4">
                                {(data?.alerts || []).slice(0, 3).map((alert: any, idx: number) => (
                                    <motion.div 
                                        key={idx}
                                        whileHover={{ x: 5 }}
                                        className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl hover:bg-white/[0.06] transition-all cursor-pointer group/alert"
                                    >
                                        <p className="text-sm font-medium text-slate-400 leading-relaxed group-hover/alert:text-slate-200 transition-colors">{alert.message}</p>
                                        <div className="flex justify-between items-center mt-4">
                                            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${alert.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-500' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                                {alert.severity}
                                            </span>
                                            <ChevronRight size={14} className="text-slate-700 group-hover/alert:text-white transition-colors" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Background Glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                    </Card>

                    {/* Project Timeline */}
                    <Card className="p-6 md:p-10 bg-white/[0.02] border-white/5 rounded-[32px] md:rounded-[48px] space-y-8 relative overflow-hidden">
                        <div className="flex items-center gap-3">
                            <BarChart3 size={20} className="text-emerald-500" />
                            <h3 className="text-xl font-black text-white italic tracking-tighter">{t("municipal.dashboard.project_flow", "Fluxo de Projetos")}</h3>
                        </div>
                        
                        <div className="space-y-10 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-4 top-2 bottom-2 w-px bg-white/5" />
                            
                            {(data?.recentProjects || []).slice(0, 4).map((proj: any, idx: number) => (
                                <div key={idx} className="flex gap-6 group relative">
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center text-[10px] font-black shrink-0 transition-all group-hover:scale-110 ${
                                            proj.status === 'APPROVED' 
                                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                                            : 'bg-white/5 border-white/10 text-slate-600'
                                        }`}>
                                            {idx + 1}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-slate-200 text-sm group-hover:text-emerald-400 transition-colors truncate">{proj.title}</div>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                                {new Date(proj.createdAt).toLocaleDateString("pt-BR")}
                                            </span>
                                            <div className="w-1 h-1 bg-slate-800 rounded-full" />
                                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">{proj.status}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </AnimateIn>
    );
};
