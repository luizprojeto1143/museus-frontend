import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { 
    Brain, 
    DollarSign, 
    BarChart3, 
    Cpu, 
    AlertTriangle, 
    Building2, 
    TrendingUp, 
    Zap, 
    ShieldAlert, 
    Globe, 
    Activity, 
    ActivitySquare,
    Layers,
    ArrowUpRight,
    RefreshCw,
    Network,
    Gauge,
    Server,
    LineChart,
    PieChart,
    Search,
    Filter,
    Coins,
    Microchip,
    Target,
    BarChart,
    Wallet,
    Binary,
    Terminal,
    Fingerprint,
    ShieldCheck
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

interface AIReport {
    period: { month: number; year: number };
    summary: {
        totalCost: number;
        totalAnalyses: number;
        totalTokens: number;
        activeTenants: number;
    };
    topConsumers: Array<{
        tenantId: string;
        tenantName: string;
        tenantSlug: string;
        analysesCount: number;
        tokensUsed: number;
        estimatedCost: number;
    }>;
    nearLimitTenants: Array<{
        tenantId: string;
        tenantName: string;
        current: number;
        limit: number;
        percentUsed: number;
    }>;
}

export const MasterAICosts: React.FC = () => {
    const { t } = useTranslation();
    const [report, setReport] = useState<AIReport | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchReport = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/ai-costs/report");
            setReport(res.data);
        } catch (error) {
            toast.error("Erro na sincronização de telemetria neuronal.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    if (loading && !report) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-[0.3em] text-[10px] italic">Lendo Ativos Cognitivos...</p>
        </div>
    );

    if (!report) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] opacity-30 gap-6">
            <Brain size={64} className="text-amber-500 animate-pulse" />
            <div className="text-center space-y-2">
                <p className="text-xl font-black uppercase tracking-[0.4em] text-slate-500 italic">Vácuo Neuronal</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 italic">Nenhum rastro detectado no ciclo atual.</p>
            </div>
            <Button onClick={fetchReport} variant="glass" className="h-12 px-8 rounded-xl border-white/5 text-amber-500 font-black uppercase text-[10px] tracking-widest">
                Tentar Recalibração
            </Button>
        </div>
    );

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const periodLabel = `${monthNames[report.period.month - 1].toUpperCase()} ${report.period.year}`;

    return (
        <AnimateIn className="space-y-12 pb-32">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-amber-500/10 text-amber-500 border-none px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.4em] italic">
                            Neural Telemetry & FinOps Sovereign Audit
                        </Badge>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic leading-none">
                        Tesouro de <span className="text-amber-500">IA Global</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-xl max-w-3xl leading-relaxed">
                        Monitoramento clínico de telemetria neuronal, investimento em tokens e eficiência operacional do cluster de inteligência artificial.
                    </p>
                </div>
                
                <Card className="p-10 bg-[#0b1120]/60 border-2 border-amber-500/20 rounded-[48px] flex items-center gap-8 group min-w-[320px] shadow-2xl relative overflow-hidden border-t-white/10">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 group-hover:rotate-180 transition-all duration-700 cursor-pointer shadow-xl border border-amber-500/20" onClick={fetchReport}>
                        <RefreshCw size={28} className={loading ? 'animate-spin' : ''} />
                    </div>
                    <div className="space-y-1 relative z-10">
                        <p className="text-[11px] font-black text-amber-500/50 uppercase tracking-[0.3em] italic leading-none mb-1">Ciclo de Telemetria</p>
                        <p className="text-3xl font-black text-white tracking-tighter italic uppercase leading-none">{periodLabel}</p>
                    </div>
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-amber-500/10 transition-all" />
                </Card>
            </div>

            {/* Global Telemetry Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                {[
                    { label: "Investimento Global", value: report.summary.totalCost, prefix: "R$", icon: <Coins size={32} />, color: "text-emerald-400", bg: "bg-emerald-600/10", border: "border-emerald-500/20", glow: "shadow-emerald-500/10" },
                    { label: "Análises Neurais", value: report.summary.totalAnalyses, icon: <ActivitySquare size={32} />, color: "text-blue-400", bg: "bg-blue-600/10", border: "border-blue-500/20", glow: "shadow-blue-500/10" },
                    { label: "Consumo de Tokens", value: report.summary.totalTokens, icon: <Microchip size={32} />, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "shadow-amber-500/10" },
                    { label: "Nodes Processando", value: report.summary.activeTenants, icon: <Network size={32} />, color: "text-purple-400", bg: "bg-purple-600/10", border: "border-purple-500/20", glow: "shadow-purple-500/10" }
                ].map((s, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, ease: "circOut" }}
                    >
                        <Card className={`p-12 bg-[#0b1120]/60 border-2 rounded-[56px] group hover:bg-white/[0.04] transition-all duration-500 relative overflow-hidden shadow-2xl ${s.border} ${s.glow} border-t-white/10`}>
                            <div className="relative z-10 space-y-10">
                                <div className={`w-16 h-16 rounded-[24px] ${s.bg} ${s.color} flex items-center justify-center border border-white/5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-xl`}>
                                    {s.icon}
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] italic leading-none">{s.label}</p>
                                    <p className="text-5xl font-black text-white tracking-tighter italic leading-none flex items-baseline">
                                        {s.prefix && <span className="text-xl mr-2 text-slate-700 uppercase tracking-widest not-italic italic opacity-40">{s.prefix}</span>}
                                        <AnimatedCounter value={s.value} decimals={s.prefix ? 2 : 0} />
                                    </p>
                                </div>
                            </div>
                            <div className={`absolute -right-12 -bottom-12 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 transition-all duration-1000 pointer-events-none ${s.color}`}>
                                {s.icon}
                            </div>
                            <div className={`absolute top-0 right-0 w-32 h-32 ${s.bg} rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity`} />
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Matrix & Performance Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Neural Impact Table */}
                <Card className="lg:col-span-2 p-0 bg-[#0b1120]/60 border-2 border-white/5 rounded-[64px] overflow-hidden shadow-2xl relative border-t-white/10">
                    <div className="p-14 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-10 bg-white/[0.02] relative">
                        <div className="flex items-center gap-8 relative z-10">
                            <div className="w-20 h-20 rounded-[28px] bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-xl group-hover:scale-110 transition-transform">
                                <Gauge size={40} />
                            </div>
                            <div>
                                <h3 className="text-4xl font-black text-white tracking-tighter italic uppercase leading-none">Leaderboard de Impacto</h3>
                                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-600 mt-3 italic">Consumo Neural Auditado por Instância Regional</p>
                            </div>
                        </div>
                        <Badge variant="glass" className="bg-amber-500/10 text-amber-500 border-none px-10 py-5 text-[11px] font-black uppercase tracking-[0.3em] italic flex items-center gap-4 rounded-2xl shadow-xl border border-amber-500/20">
                            <Activity size={20} className="animate-pulse" /> Telemetry: Optimized
                        </Badge>
                        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/[0.02]">
                                    <th className="px-14 py-10 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Cidade / Node</th>
                                    <th className="px-14 py-10 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Volume Neural</th>
                                    <th className="px-14 py-10 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Custo Fiscal</th>
                                    <th className="px-14 py-10 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic text-right">Eficiência de Node</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {report.topConsumers.map((c, idx) => (
                                    <tr key={c.tenantId} className="group hover:bg-white/[0.03] transition-all duration-500 cursor-default relative">
                                        <td className="px-14 py-12">
                                            <div className="flex items-center gap-8">
                                                <div className="w-16 h-16 rounded-[22px] bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 border-2 border-white/10 flex items-center justify-center text-amber-500 font-black text-lg group-hover:scale-110 group-hover:border-amber-500/40 transition-all duration-500 shadow-2xl relative overflow-hidden">
                                                    {c.tenantName.substring(0,2).toUpperCase()}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-white font-black text-2xl tracking-tighter group-hover:text-amber-500 transition-colors italic leading-none">{c.tenantName}</span>
                                                    <span className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em] italic leading-none mt-1">PROTOCOL: /{c.tenantSlug}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-14 py-12">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-white font-black text-3xl tracking-tighter italic leading-none group-hover:translate-x-1 transition-transform inline-block">
                                                    <AnimatedCounter value={c.analysesCount} />
                                                </span>
                                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] italic leading-none">
                                                    <AnimatedCounter value={c.tokensUsed} /> tokens processados
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-14 py-12">
                                            <div className="flex items-center gap-3 group-hover:translate-x-1 transition-transform">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                                    <Wallet size={18} />
                                                </div>
                                                <span className="text-emerald-400 font-black text-3xl tracking-tighter italic leading-none">
                                                    <span className="text-sm mr-1.5 opacity-40 uppercase tracking-widest not-italic">R$</span>
                                                    {c.estimatedCost.toFixed(2).replace('.', ',')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-14 py-12 text-right">
                                            <div className="flex flex-col items-end gap-5">
                                                <div className="h-3 w-40 bg-white/5 rounded-full overflow-hidden p-1 border-2 border-white/5 shadow-inner">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: '85%' }}
                                                        transition={{ duration: 2, ease: "circOut", delay: idx * 0.1 }}
                                                        className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                                                    />
                                                </div>
                                                <Badge variant="glass" className="bg-amber-500/5 text-amber-500/50 border-none text-[8px] font-black uppercase tracking-[0.3em] italic">High Density Neural Engine</Badge>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Quota Alerts & FinOps Strategy */}
                <div className="space-y-10">
                    <Card className="p-14 bg-black/60 border-2 border-white/5 rounded-[64px] space-y-14 relative overflow-hidden group border-t-amber-500/20 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
                        <div className="flex justify-between items-center relative z-10">
                            <div className="space-y-3">
                                <h3 className="text-4xl font-black text-white tracking-tighter italic uppercase leading-none">Radar de Quotas</h3>
                                <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] italic leading-none">Anomalias e Limites Neurais</p>
                            </div>
                            <div className="w-20 h-20 rounded-[28px] bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                                <AlertTriangle size={40} />
                            </div>
                        </div>

                        <div className="space-y-12 relative z-10">
                            {report.nearLimitTenants.length === 0 ? (
                                <div className="py-24 text-center opacity-30 flex flex-col items-center gap-10">
                                    <div className="w-28 h-28 rounded-[40px] bg-white/5 flex items-center justify-center border-2 border-white/5 shadow-inner">
                                        <ShieldCheck size={64} className="text-emerald-500 animate-pulse" />
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-lg font-black uppercase tracking-[0.4em] italic leading-none">Cluster Saudável</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest italic">Consumo de infraestrutura em estado de paridade nominal</p>
                                    </div>
                                </div>
                            ) : (
                                report.nearLimitTenants.map((item, idx) => (
                                    <div key={item.tenantId} className="space-y-6 group/item">
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-black text-white uppercase tracking-tighter italic group-hover/item:text-amber-500 transition-colors">{item.tenantName}</span>
                                                    {item.percentUsed >= 90 && <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-600 font-mono italic tracking-widest leading-none">REGISTRY: {item.current.toLocaleString()} / {item.limit.toLocaleString()} OP.</span>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className={`text-4xl font-black italic tracking-tighter leading-none ${item.percentUsed >= 95 ? 'text-rose-500' : 'text-amber-500'}`}>
                                                    {item.percentUsed}%
                                                </span>
                                                <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">Utilização Neural</span>
                                            </div>
                                        </div>
                                        <div className="h-5 bg-white/5 rounded-full overflow-hidden p-1.5 border-2 border-white/5 shadow-inner">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(item.percentUsed, 100)}%` }}
                                                transition={{ duration: 2, ease: "circOut", delay: idx * 0.1 }}
                                                className={`h-full rounded-full transition-all duration-1000 ${item.percentUsed >= 95 ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.5)]' : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.5)]'}`}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-amber-600/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-amber-600/10 transition-all duration-1000" />
                    </Card>

                    <Card className="p-12 bg-amber-500/[0.03] border-2 border-amber-500/10 rounded-[56px] flex items-center gap-10 group relative overflow-hidden shadow-2xl border-t-white/5">
                        <div className="w-20 h-20 bg-amber-500/10 rounded-[28px] flex items-center justify-center text-amber-500 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 shadow-xl border border-amber-500/20">
                            <Binary size={36} />
                        </div>
                        <div className="flex-1 space-y-2">
                            <h4 className="text-white font-black text-2xl italic tracking-tighter uppercase italic leading-none">Eficiência Neural</h4>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed italic mt-2">
                                Latência de processamento reduzida em <strong className="text-amber-500">22ms</strong> através da nova fragmentação de tokens.
                            </p>
                        </div>
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />
                    </Card>
                </div>
            </div>

            {/* Strategic SOC Footer */}
            <div className="bg-[#0f172a]/80 p-14 rounded-[64px] border-2 border-white/5 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group shadow-2xl border-t-white/10">
                <div className="flex items-center gap-10 relative z-10">
                    <div className="w-24 h-24 bg-amber-500/10 rounded-[32px] flex items-center justify-center text-amber-500 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 border border-amber-500/20 shadow-2xl relative overflow-hidden">
                        <Terminal size={48} />
                        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent" />
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-white font-black text-3xl italic tracking-tighter uppercase italic leading-none">Governança FinOps Master</h4>
                        <p className="text-sm text-slate-500 font-medium max-w-2xl leading-relaxed italic mt-2">
                            O faturamento neural é processado de forma isolada por node regional, garantindo transparência fiscal e conformidade com as quotas de governança municipal da federação MSV.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-6 relative z-10">
                    <Badge variant="glass" className="bg-amber-500/10 text-amber-500 border-none px-12 py-6 text-[12px] font-black uppercase tracking-[0.4em] italic rounded-[24px] flex items-center gap-4 shadow-2xl border border-amber-500/20">
                        <Fingerprint size={24} /> Audit: Sovereign Verified
                    </Badge>
                </div>
                <div className="absolute top-[-50%] right-[-10%] w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[200px] pointer-events-none" />
                <div className="absolute left-[-5%] bottom-[-10%] w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </AnimateIn>
    );
};
