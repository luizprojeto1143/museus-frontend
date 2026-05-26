import { useTranslation } from "react-i18next";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    FileText,
    Download,
    Calendar,
    ChevronRight,
    BarChart3,
    PieChart,
    TrendingUp,
    ShieldCheck,
    ArrowRight,
    Search,
    Globe,
    Zap,
    Scale,
    Activity,
    FileSearch,
    Share2
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "../../api/client";
import { useAuth } from "../auth/AuthContext";
import { 
    Button, 
    Card, 
    Badge, 
    AnimateIn, 
    AnimatedCounter 
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";

export const MunicipalReports: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<any>(null);
    const [compliance, setCompliance] = useState<any>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [summaryRes, complianceRes] = await Promise.all([
                api.get("/executive-reports/summary", { params: { tenantId } }),
                api.get("/secretary/legal-compliance", { params: { tenantId } })
            ]);
            setSummary(summaryRes.data);
            setCompliance(complianceRes.data);
        } catch (err) {
            console.error("Error fetching report data", err);
            toast.error(t("municipal.reports.error_fetch", "Erro ao consolidar indicadores executivos."));
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDownloadPDF = async () => {
        try {
            window.open(`${api.defaults.baseURL}/executive-reports/pdf?tenantId=${tenantId}`, '_blank');
            toast.success(t("municipal.reports.generating_pdf", "Gerando relatório em PDF..."));
        } catch (err) {
            console.error("Error downloading PDF", err);
            toast.error(t("municipal.reports.error_pdf", "Erro ao gerar documento."));
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">{t("municipal.reports.loading", "Compilando Indicadores de Impacto...")}</p>
        </div>
    );

    const reportCards = [
        { title: t("municipal.reports.card1_title", "Resumo Executivo Mensal"), icon: <FileText size={24} />, desc: t("municipal.reports.card1_desc", "Panorama consolidado de todos os equipamentos culturais municipais."), date: t("municipal.reports.generated_today", "Gerado hoje"), color: "text-emerald-400", bg: "bg-emerald-400/10" },
        { title: t("municipal.reports.card2_title", "Relatório de Conformidade LBI"), icon: <ShieldCheck size={24} />, desc: t("municipal.reports.card2_desc", "Status legal e acessibilidade perante a Lei Brasileira de Inclusão."), date: t("municipal.reports.updated_realtime", "Atualizado em tempo real"), color: "text-indigo-400", bg: "bg-indigo-400/10" },
        { title: t("municipal.reports.card3_title", "Evolução do Impacto Público"), icon: <TrendingUp size={24} />, desc: t("municipal.reports.card3_desc", "Análise histórica de frequência, engajamento e ROI social."), date: t("municipal.reports.consolidated_metrics", "Métricas consolidadas"), color: "text-amber-400", bg: "bg-amber-400/10" }
    ];

    return (
        <AnimateIn className="space-y-12 pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                            {t("municipal.reports.title_central", "Central de")} <span className="text-emerald-500">{t("municipal.reports.title_reports", "Relatórios")}</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 font-medium text-lg max-w-2xl leading-relaxed">
                        {t("municipal.reports.subtitle", "Inteligência governamental e indicadores estratégicos para suporte à tomada de decisão.")}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="glass" className="h-14 px-6 rounded-2xl border-white/5 text-slate-400 font-black uppercase text-[10px] tracking-widest">
                        <Share2 size={16} className="mr-2" /> {t("municipal.reports.share_portal", "Compartilhar Portal")}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Column: Intelligence Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="p-10 bg-gradient-to-br from-emerald-600 to-emerald-800 border-none rounded-[48px] text-white shadow-2xl shadow-emerald-900/30 relative overflow-hidden group">
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <Badge className="bg-white/20 text-white border-none text-[8px] font-black uppercase tracking-widest px-4 py-1.5">{t("municipal.reports.global_metric", "Métrica Global")}</Badge>
                                <Globe size={24} className="opacity-40" />
                            </div>
                            
                            <div className="space-y-1">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200 opacity-80">{t("municipal.reports.lbi_compliance_rate", "Taxa de Adesão LBI")}</h3>
                                <div className="text-7xl font-black tracking-tighter flex items-end gap-2">
                                    <AnimatedCounter value={summary?.summary?.accessibilityPlanRate || 0} />
                                    <span className="text-3xl mb-2">%</span>
                                </div>
                            </div>
                            
                            <p className="text-emerald-100 text-sm font-medium leading-relaxed opacity-80 italic">
                                {t("municipal.reports.insight_quote", "\"A maioria dos projetos ativos já incorporou planos de tecnologia assistiva homologados.\"")}
                            </p>
                            
                            <div className="pt-8 border-t border-white/10 flex justify-between gap-4">
                                <div>
                                    <div className="text-2xl font-black leading-none">128</div>
                                    <div className="text-[9px] font-black uppercase tracking-widest opacity-60 mt-1">{t("municipal.reports.active_projects", "Projetos Ativos")}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black leading-none">42</div>
                                    <div className="text-[9px] font-black uppercase tracking-widest opacity-60 mt-1">{t("municipal.reports.units", "Unidades")}</div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Decorative Glow */}
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:bg-white/20 transition-all duration-700" />
                    </Card>

                    <Card className="p-8 bg-white/[0.02] border-white/5 rounded-[40px] space-y-8">
                        <div className="flex items-center gap-3">
                            <PieChart size={20} className="text-emerald-500" />
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">{t("municipal.reports.actions_by_type", "Ações por Tipologia")}</h4>
                        </div>
                        <div className="space-y-4">
                            {Object.entries(summary?.summary?.accessibilityByType || {}).map(([type, count]: [string, any], idx) => (
                                <div key={type} className="flex justify-between items-center group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 group-hover:bg-emerald-400 transition-colors" />
                                        <span className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">{type.replace('_', ' ')}</span>
                                    </div>
                                    <span className="font-black text-white group-hover:text-emerald-400 transition-colors">{count}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Right Column: Reports & Compliance */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {reportCards.map((card, idx) => (
                            <motion.div 
                                key={idx}
                                whileHover={{ y: -5 }}
                            >
                                <Card className="h-full p-8 bg-white/[0.02] border-white/5 rounded-[40px] group hover:bg-white/[0.04] transition-all flex flex-col justify-between">
                                    <div className="space-y-6">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${card.bg} ${card.color}`}>
                                            {card.icon}
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-black text-white tracking-tight group-hover:text-emerald-400 transition-colors italic">{card.title}</h3>
                                            <p className="text-sm text-slate-500 leading-relaxed font-medium">{card.desc}</p>
                                        </div>
                                    </div>
                                    <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
                                            <Calendar size={12} className="text-emerald-500/50" /> {card.date}
                                        </div>
                                        <Button
                                            onClick={handleDownloadPDF}
                                            className="h-10 px-6 rounded-xl bg-white/5 border border-white/5 text-white font-black text-[9px] uppercase tracking-widest hover:bg-emerald-600 hover:border-emerald-500 transition-all flex items-center gap-2"
                                        >
                                            <Download size={14} /> PDF
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}

                        <Card className="bg-[#0f172a] p-8 rounded-[40px] border-white/5 shadow-2xl flex flex-col justify-center items-center text-center space-y-6 group relative overflow-hidden">
                            <div className="relative z-10 space-y-6">
                                <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-emerald-500 group-hover:rotate-12 transition-transform">
                                    <FileSearch size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-white tracking-tight italic">{t("municipal.reports.transparency", "Transparência")}</h3>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[200px] mx-auto">{t("municipal.reports.transparency_desc", "Exportação de dados brutos para o Portal da Transparência.")}</p>
                                </div>
                                <Button 
                                    variant="glass" 
                                    onClick={() => toast(t("municipal.reports.export_dataset", "Exportação de dataset bruto em processamento."), { icon: "📊" })} 
                                    className="h-12 w-full rounded-2xl border-white/5 text-emerald-400 font-black text-[9px] uppercase tracking-widest hover:bg-emerald-500/10"
                                >
                                    {t("municipal.reports.prepare_dataset", "Preparar Dataset (CSV)")}
                                </Button>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/5 to-transparent pointer-events-none" />
                        </Card>
                    </div>

                    {/* Legal Compliance Summary */}
                    <Card className="p-0 bg-white/[0.02] border-white/5 rounded-[48px] overflow-hidden">
                        <div className="p-10 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 bg-white/[0.01]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center">
                                    <Scale size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tighter italic">{t("municipal.reports.legal_compliance", "Compliance Jurídico")}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{t("municipal.reports.legal_compliance_subtitle", "Verificação obrigatória LBI")}</p>
                                </div>
                            </div>
                            <Badge variant="glass" className="h-10 px-6 rounded-xl bg-emerald-500/10 text-emerald-400 border-none uppercase text-[10px] font-black tracking-widest">
                                {compliance?.summary?.complianceRate || 0}% {t("municipal.reports.compliance_suffix", "de Conformidade")}
                            </Badge>
                        </div>
                        
                        <div className="p-10 space-y-6">
                            {(compliance?.matrix || []).slice(0, 3).map((item: any, idx: number) => (
                                <motion.div 
                                    key={idx}
                                    whileHover={{ x: 5 }}
                                    className={`flex items-center justify-between p-6 rounded-3xl border transition-all ${
                                        item.compliant 
                                        ? 'bg-white/[0.02] border-white/5 group' 
                                        : 'bg-rose-500/5 border-rose-500/20'
                                    }`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xl ${
                                            item.compliant ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-rose-500 shadow-rose-500/20'
                                        }`}>
                                            {item.compliant ? <ShieldCheck size={20} /> : <Zap size={20} />}
                                        </div>
                                        <div className="space-y-1">
                                            <span className="font-black text-white text-sm tracking-tight">{item.law}</span>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest truncate max-w-[200px] md:max-w-md">{item.requirement}</p>
                                        </div>
                                    </div>
                                    <Badge className={`bg-transparent border-none uppercase text-[9px] font-black tracking-widest ${item.compliant ? 'text-emerald-500' : 'text-rose-500 animate-pulse'}`}>
                                        {item.compliant ? t("municipal.reports.consolidated", "Consolidado") : t("municipal.reports.action_needed", "Ação Necessária")}
                                    </Badge>
                                </motion.div>
                            ))}
                            {(!compliance?.matrix || compliance.matrix.length === 0) && (
                                <div className="flex flex-col items-center justify-center py-10 opacity-30 gap-4">
                                    <Activity size={40} />
                                    <p className="text-sm font-medium italic">{t("municipal.reports.starting_audit", "Iniciando auditoria legal...")}</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-10 pt-0">
                            <Button 
                                variant="glass" 
                                className="w-full h-14 rounded-2xl border-white/5 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-white hover:bg-white/5 transition-all flex items-center justify-between px-8"
                                onClick={() => navigate('/municipal/compliance')}
                            >
                                {t("municipal.reports.access_full_report", "Acessar Relatório Completo de Conformidade")} <ChevronRight size={18} />
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </AnimateIn>
    );
};
