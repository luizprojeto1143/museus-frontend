import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../../api/client";
import { 
  Cpu, 
  Activity, 
  Database, 
  DollarSign, 
  BarChart3, 
  Zap, 
  ShieldCheck, 
  AlertTriangle,
  History,
  TrendingUp,
  ArrowUpRight,
  Sparkles
} from "lucide-react";
import { 
  Card, 
  Button, 
  Badge, 
  AnimateIn, 
  AnimatedCounter 
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";

type AIUsageData = {
    current: {
        month: number;
        year: number;
        analysesCount: number;
        tokensUsed: number;
        estimatedCost: number;
        limit: number;
        percentUsed: number;
    };
    history: {
        month: number;
        year: number;
        label: string;
        analysesCount: number;
        tokensUsed: number;
        estimatedCost: number;
    }[];
    totals: {
        totalAnalyses: number;
        totalTokens: number;
        totalCost: number;
    };
};

type LimitData = {
    allowed: boolean;
    current: number;
    limit: number;
    remaining: number;
    percentUsed: number;
    tier: string;
    tierLabel: string;
};

const AIUsageDashboard: React.FC = () => {
    const { t } = useTranslation();
    const [usage, setUsage] = useState<AIUsageData | null>(null);
    const [limits, setLimits] = useState<LimitData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [usageRes, limitsRes] = await Promise.all([
                api.get("/ai-costs/usage?months=6"),
                api.get("/ai-costs/limits")
            ]);
            setUsage(usageRes.data);
            setLimits(limitsRes.data);
        } catch (err) {
            console.error("Erro ao carregar dados de IA", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">Sincronizando Telemetria...</p>
            </div>
        );
    }

    if (!usage || !limits) {
        return (
            <Card className="max-w-md mx-auto mt-20 p-8 text-center bg-red-500/5 border-red-500/20 rounded-[40px]">
                <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
                <h3 className="text-xl font-bold text-white">Falha na Sincronização</h3>
                <p className="text-slate-400 mt-2">Não foi possível carregar os dados de consumo de IA.</p>
                <Button className="mt-6 bg-red-500 text-white rounded-xl" onClick={fetchData}>Tentar Novamente</Button>
            </Card>
        );
    }

    const getProgressColor = (percent: number) => {
        if (percent >= 90) return "from-red-500 to-red-600 shadow-red-500/50";
        if (percent >= 70) return "from-amber-400 to-amber-500 shadow-amber-400/50";
        return "from-gold-400 to-gold-500 shadow-gold-400/50";
    };

    return (
        <AnimateIn className="space-y-8 pb-32 max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                        <Cpu className="text-gold-400" size={32} />
                        Consumo de <span className="text-gold-400">Inteligência Artificial</span>
                    </h1>
                    <p className="text-slate-400 font-medium">Monitoramento de processamento, tokens e custos operacionais.</p>
                </div>

                <Badge variant="glass" className="h-12 px-6 rounded-2xl border-gold-400/20 text-gold-400 text-xs font-black tracking-widest">
                    <ShieldCheck className="mr-2" size={16} />
                    TIER: {limits.tierLabel.toUpperCase()}
                </Badge>
            </div>

            {/* Main Usage Card */}
            <Card className="p-8 md:p-12 bg-white/[0.02] border-white/5 rounded-[48px] relative overflow-hidden group">
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Progress Circle/Info */}
                    <div className="lg:col-span-4 flex flex-col items-center text-center space-y-6">
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="96" cy="96" r="88" className="stroke-white/5 fill-none" strokeWidth="12" />
                                <motion.circle 
                                    cx="96" cy="96" r="88" 
                                    className={`fill-none stroke-current transition-all duration-1000 ${limits.percentUsed >= 90 ? 'text-red-500' : 'text-gold-400'}`} 
                                    strokeWidth="12"
                                    strokeDasharray={553}
                                    initial={{ strokeDashoffset: 553 }}
                                    animate={{ strokeDashoffset: 553 - (553 * Math.min(limits.percentUsed, 100)) / 100 }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-white"><AnimatedCounter value={limits.percentUsed} />%</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Capacidade</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Badge className={`${limits.percentUsed >= 90 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'} border-none`}>
                                {limits.remaining.toLocaleString()} ANÁLISES DISPONÍVEIS
                            </Badge>
                            <p className="text-xs text-slate-500 font-medium">Ciclo mensal renova em breve.</p>
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center text-gold-400">
                                    <Activity size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Análises Mês</p>
                                    <h4 className="text-2xl font-black text-white mt-1"><AnimatedCounter value={usage.current.analysesCount} /></h4>
                                </div>
                            </div>

                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                    <Database size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tokens Processados</p>
                                    <h4 className="text-2xl font-black text-white mt-1">{usage.current.tokensUsed.toLocaleString()}</h4>
                                </div>
                            </div>

                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                                    <DollarSign size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Custo Estimado</p>
                                    <h4 className="text-2xl font-black text-white mt-1">US$ {usage.current.estimatedCost.toFixed(2)}</h4>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar Detailed */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-bold text-white flex items-center gap-2">
                                    <Zap size={16} className="text-gold-400" />
                                    Quota de Processamento
                                </span>
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                    {usage.current.analysesCount} / {limits.limit}
                                </span>
                            </div>
                            <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
                                <motion.div 
                                    className={`h-full rounded-full bg-gradient-to-r shadow-lg ${getProgressColor(limits.percentUsed)}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(limits.percentUsed, 100)}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Warning Overlay */}
                {limits.percentUsed >= 80 && (
                    <div className={`mt-12 p-6 rounded-[32px] flex items-center gap-6 border ${limits.percentUsed >= 90 ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                        <div className="shrink-0 w-12 h-12 rounded-2xl bg-current opacity-20 flex items-center justify-center">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-black uppercase tracking-widest leading-none mb-1">Aviso de Capacidade</p>
                            <p className="text-xs font-medium opacity-80 leading-relaxed">
                                Você atingiu {limits.percentUsed}% do limite. {limits.percentUsed >= 90 ? 'Upgrade de plano recomendado para evitar interrupções.' : 'Monitore o uso nas próximas semanas.'}
                            </p>
                        </div>
                        <Button variant="glass" className="rounded-xl h-10 px-6 border-current text-[10px] font-black uppercase">Fazer Upgrade</Button>
                    </div>
                )}

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400/5 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />
            </Card>

            {/* History & Cumulative Data */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Cumulative Stats */}
                <Card className="lg:col-span-4 p-8 bg-white/[0.02] border-white/5 rounded-[40px] space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Acumulado</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Histórico Total de Operações</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-center p-6 bg-white/[0.03] rounded-[24px] border border-white/5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Análises</span>
                            <span className="text-xl font-black text-white">{usage.totals.totalAnalyses.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-6 bg-white/[0.03] rounded-[24px] border border-white/5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tokens</span>
                            <span className="text-xl font-black text-white">{(usage.totals.totalTokens / 1000000).toFixed(1)}M</span>
                        </div>
                        <div className="flex justify-between items-center p-6 bg-white/[0.03] rounded-[24px] border border-white/5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Custo Total</span>
                            <span className="text-xl font-black text-gold-400">US$ {usage.totals.totalCost.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="p-6 bg-gold-400/5 rounded-[32px] border border-gold-400/10 space-y-4">
                         <div className="flex items-center gap-3">
                            <Sparkles size={16} className="text-gold-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gold-400">Insights de Eficiência</span>
                         </div>
                         <p className="text-xs text-slate-500 leading-relaxed font-medium italic">
                            Sua média de tokens por análise está 12% mais eficiente que no mês anterior. Ótimo trabalho de otimização!
                         </p>
                    </div>
                </Card>

                {/* History Table/List */}
                <Card className="lg:col-span-8 p-0 bg-white/[0.02] border-white/5 rounded-[40px] overflow-hidden">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400">
                                <History size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Histórico Semestral</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Consumo Retroativo</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-600 border-b border-white/5">
                                    <th className="px-8 py-6 text-left font-black">Período</th>
                                    <th className="px-8 py-6 text-right font-black">Análises</th>
                                    <th className="px-8 py-6 text-right font-black">Tokens</th>
                                    <th className="px-8 py-6 text-right font-black">Investimento</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {usage.history.map((h, idx) => (
                                    <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-black text-white group-hover:text-gold-400 transition-colors">{h.label}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="text-sm font-bold text-slate-400">{h.analysesCount}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="text-sm font-medium text-slate-500">{h.tokensUsed.toLocaleString()}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 text-slate-400">
                                                <span className="text-sm font-black">US$ {h.estimatedCost.toFixed(2)}</span>
                                                <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AnimateIn>
    );
};

export default AIUsageDashboard;
