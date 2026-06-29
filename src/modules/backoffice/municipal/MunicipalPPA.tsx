import React, { useEffect, useState, useCallback, useMemo } from "react";
import { logger } from "@/utils/logger";

import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { 
    Loader2, 
    Target, 
    TrendingUp, 
    Building, 
    Coins,
    ChevronRight,
    Search,
    Calendar,
    Activity,
    Flag,
    ArrowUpRight,
    Zap,
    Download,
    Globe
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

export const MunicipalPPA: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());

    const fetchData = useCallback(async () => {
        if (!tenantId) return;
        try {
            setLoading(true);
            const res = await api.get(`/ppa/consolidated?tenantId=${tenantId}&year=${year}`);
            setGoals(res.data);
        } catch (error) { 
            logger.error(error); 
            toast.error(t("municipal.ppa.error_load", "Erro ao consolidar metas do PPA."));
        } finally { 
            setLoading(false); 
        }
    }, [tenantId, year]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const globalProgress = useMemo(() => {
        if (goals.length === 0) return 0;
        const total = goals.reduce((acc, g) => acc + (g.targetValue > 0 ? (g.currentValue / g.targetValue) : 0), 0);
        return Math.round((total / goals.length) * 100);
    }, [goals]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">{t("municipal.ppa.loading", "Consolidando Orçamento & Ciclos PPA...")}</p>
        </div>
    );

    return (
        <AnimateIn className="space-y-12 pb-32">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                            {t("municipal.ppa.title_goals", "Metas")} <span className="text-emerald-500">{t("municipal.ppa.title_ppa", "PPA")}</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 font-medium text-lg">{t("municipal.ppa.subtitle", "Plano Plurianual — Monitoramento Estratégico Municipal.")}</p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-xl">
                        {[2024, 2025, 2026, 2027].map(y => (
                            <button
                                key={y}
                                onClick={() => setYear(y)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    year === y 
                                    ? 'bg-emerald-600 text-white shadow-lg' 
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                {y}
                            </button>
                        ))}
                    </div>
                    
                    <Button variant="glass" className="h-14 px-6 rounded-2xl border-white/5 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-white">
                        <Download size={16} className="mr-2" /> {t("municipal.ppa.ppa_report", "Relatório PPA")}
                    </Button>
                </div>
            </div>

            {/* Global Summary Card */}
            <Card className="p-10 bg-gradient-to-br from-[#0f172a] to-[#020617] border-white/5 rounded-[48px] shadow-2xl relative overflow-hidden group">
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[8px] font-black uppercase tracking-widest px-4 py-1.5">{t("municipal.ppa.executive_vision", "Visão Executiva")}</Badge>
                            <Globe size={18} className="text-emerald-500/50" />
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tighter italic leading-tight">{t("municipal.ppa.management_cycle", "Ciclo de Gestão")} {year}</h2>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            {t("municipal.ppa.management_cycle_desc", "Acompanhamento consolidado da execução orçamentária e metas sociais estabelecidas para o exercício atual.")}
                        </p>
                    </div>

                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="relative w-40 h-40">
                             <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    className="text-white/5"
                                    strokeWidth="8"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="70"
                                    cx="80"
                                    cy="80"
                                />
                                <motion.circle
                                    className="text-emerald-500"
                                    strokeWidth="8"
                                    strokeDasharray={440}
                                    initial={{ strokeDashoffset: 440 }}
                                    animate={{ strokeDashoffset: 440 - (440 * globalProgress) / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="70"
                                    cx="80"
                                    cy="80"
                                />
                             </svg>
                             <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-white tracking-tighter">{globalProgress}%</span>
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t("municipal.ppa.execution", "Execução")}</span>
                             </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                            <div className="text-2xl font-black text-emerald-400"><AnimatedCounter value={goals.length} /></div>
                            <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">{t("municipal.ppa.active_goals", "Metas Ativas")}</div>
                        </div>
                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                            <div className="text-2xl font-black text-white"><AnimatedCounter value={goals.reduce((acc, g) => acc + g.goals.length, 0)} /></div>
                            <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">{t("municipal.ppa.indicators", "Indicadores")}</div>
                        </div>
                    </div>
                </div>
                
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[100px] -mr-48 -mt-48" />
            </Card>

            {/* Goals Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {goals.length === 0 ? (
                    <Card className="lg:col-span-2 py-32 text-center bg-white/[0.02] border-white/5 rounded-[48px] border-dashed">
                        <Target size={64} className="mx-auto text-slate-800 mb-6" />
                        <h3 className="text-xl font-black text-slate-600 uppercase tracking-widest">{t("municipal.ppa.plan_in_progress", "Plano em Elaboração")}</h3>
                        <p className="text-slate-500 text-sm mt-2">{t("municipal.ppa.no_goals_consolidated", "Nenhuma meta estratégica foi consolidada para o ciclo {{year}}.", { year })}</p>
                    </Card>
                ) : (
                    goals.map((g, idx) => {
                        const pct = g.targetValue > 0 ? Math.min(Math.round((g.currentValue / g.targetValue) * 100), 100) : 0;
                        const statusColor = pct >= 90 ? 'text-emerald-400' : pct >= 50 ? 'text-indigo-400' : 'text-amber-500';
                        const progressColor = pct >= 90 ? 'bg-emerald-500' : pct >= 50 ? 'bg-indigo-500' : 'bg-amber-500';

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card className="p-10 bg-white/[0.02] border-white/5 rounded-[48px] group hover:bg-white/[0.04] transition-all relative overflow-hidden">
                                    <div className="relative z-10 space-y-10">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-2 flex-1">
                                                <Badge variant="glass" className="bg-white/5 text-slate-500 border-white/5 text-[8px] font-black uppercase tracking-widest px-3 py-1">
                                                    {g.metric || t("municipal.ppa.government_indicator", "Indicador Governamental")}
                                                </Badge>
                                                <h3 className="text-2xl font-black text-white tracking-tight leading-tight group-hover:text-emerald-400 transition-colors">{g.title}</h3>
                                            </div>
                                            <div className={`text-4xl font-black ${statusColor} italic tracking-tighter`}>{pct}%</div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-600">
                                                <span>{t("municipal.ppa.goal_progress", "Progresso da Meta")}</span>
                                                <span>{g.currentValue.toLocaleString()} / {g.targetValue.toLocaleString()}</span>
                                            </div>
                                            <div className="w-full bg-white/5 rounded-full h-2 relative overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pct}%` }}
                                                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                                    className={`h-full rounded-full ${progressColor} shadow-[0_0_10px_rgba(16,185,129,0.3)]`} 
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-6 border-t border-white/5">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Flag size={14} className="text-emerald-500" />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("municipal.ppa.execution_by_unit", "Execução por Unidade")}</span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-3">
                                                {g.goals.map((item: unknown, i: number) => (
                                                    <div key={i} className="flex items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.03] rounded-2xl border border-white/5 transition-all">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${item.currentValue >= item.targetValue ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`} />
                                                            <span className="text-xs font-bold text-slate-400">{item.tenantName}</span>
                                                        </div>
                                                        <div className="text-xs font-black text-white">
                                                            {item.currentValue.toLocaleString()} <span className="text-slate-600 mx-1">/</span> {item.targetValue.toLocaleString()}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Background decorative zap */}
                                    <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                        <Zap size={140} />
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </AnimateIn>
    );
};
