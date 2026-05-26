import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../auth/AuthContext";
import { 
    Button, 
    Card, 
    Badge, 
    AnimateIn 
} from "@/components/ui";
import {
    ArrowLeft, 
    FileText, 
    Calendar, 
    Users, 
    Sparkles,
    ExternalLink, 
    MapPin, 
    DollarSign, 
    Download, 
    Share,
    Filter, 
    SortAsc, 
    TrendingUp,
    Search,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    Activity,
    Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

type Project = {
    id: string;
    title: string;
    status: string;
    culturalCategory?: string;
    targetRegion?: string;
    requestedBudget?: number;
    finalScore?: number;
    humanScore?: number;
    proponent?: {
        name: string;
    };
    aiAnalysis?: {
        scores: Record<string, number>;
        recommendation: 'APPROVE' | 'REJECT' | 'REVIEW';
    };
    createdAt: string;
    tenant?: { name: string };
};

type Notice = {
    id: string;
    title: string;
    status: string;
};

export const MunicipalNoticeProjects: React.FC = () => {
    const { t } = useTranslation();

    const statusLabels: Record<string, { label: string; color: string; bg: string; border: string }> = {
        DRAFT: { label: t("municipal.projects.status_draft", "Rascunho"), color: "text-slate-400", bg: "bg-white/5", border: "border-white/5" },
        SUBMITTED: { label: t("municipal.projects.status_submitted", "Enviado"), color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
        UNDER_REVIEW: { label: t("municipal.projects.status_under_review", "Em Análise"), color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
        APPROVED: { label: t("municipal.projects.status_approved", "Aprovado"), color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
        REJECTED: { label: t("municipal.projects.status_rejected", "Reprovado"), color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
        IN_EXECUTION: { label: t("municipal.projects.status_in_execution", "Em Execução"), color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
        COMPLETED: { label: t("municipal.projects.status_completed", "Concluído"), color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
        CANCELED: { label: t("municipal.projects.status_canceled", "Cancelado"), color: "text-slate-600", bg: "bg-white/5", border: "border-white/5" }
    };

    const { id } = useParams<{ id: string }>();
    const { tenantId } = useAuth();
    const navigate = useNavigate();

    const [notice, setNotice] = useState<Notice | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const [statusFilter, setStatusFilter] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");

    const fetchData = useCallback(async () => {
        if (!tenantId) return;

        try {
            setLoading(true);
            const projectsUrl = id ? `/projects?noticeId=${id}&tenantId=${tenantId}` : `/projects?tenantId=${tenantId}&consolidated=true`;
            
            const promises = [api.get(projectsUrl)];
            if (id) promises.push(api.get(`/notices/${id}`));

            const [projectsRes, noticeRes] = await Promise.all(promises);
            setProjects(projectsRes.data);
            if (noticeRes) setNotice(noticeRes.data);
        } catch (err) {
            console.error(err);
            toast.error(t("municipal.projects.error_load", "Erro ao carregar pipeline de projetos."));
        } finally {
            setLoading(false);
        }
    }, [id, tenantId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
            const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 p.proponent?.name?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        }).sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));
    }, [projects, statusFilter, searchTerm]);

    const formatCurrency = (value?: number) => {
        if (!value) return "-";
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">{t("municipal.projects.loading", "Sincronizando Projetos...")}</p>
        </div>
    );

    return (
        <AnimateIn className="space-y-12 pb-32">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="flex items-center gap-6">
                    <Button 
                        variant="glass" 
                        onClick={() => navigate(-1)} 
                        className="rounded-2xl w-14 h-14 p-0 border-white/5 hover:bg-white/10"
                    >
                        <ArrowLeft size={24} className="text-white" />
                    </Button>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Badge variant="glass" className="bg-emerald-500/10 text-emerald-400 border-none text-[8px] font-black uppercase tracking-widest px-3 py-1">
                                <Activity size={12} className="mr-1.5" /> {t("municipal.projects.pipeline_municipal", "Pipeline Municipal")}
                            </Badge>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter leading-none">
                            {id ? t("municipal.projects.title_notice", "Projetos do Edital") : t("municipal.projects.title_panorama", "Panorama de Projetos")}
                        </h1>
                        <p className="text-slate-500 font-medium">
                            {notice?.title || t("municipal.projects.subtitle", "Visão estratégica consolidada de todas as unidades.")}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="relative group w-full md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder={t("municipal.projects.search_placeholder", "Buscar projeto ou proponente...")}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
                        />
                    </div>
                    
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-xl">
                        {["ALL", "SUBMITTED", "UNDER_REVIEW", "APPROVED"].map(val => (
                            <button
                                key={val}
                                onClick={() => setStatusFilter(val)}
                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                    statusFilter === val 
                                    ? 'bg-emerald-600 text-white shadow-lg' 
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                {val === "ALL" ? t("municipal.projects.filter_all", "Todos") : val === "SUBMITTED" ? t("municipal.projects.filter_new", "Novos") : val === "UNDER_REVIEW" ? t("municipal.projects.filter_review", "Análise") : t("municipal.projects.filter_approved", "Aprovados")}
                            </button>
                        ))}
                    </div>
                    
                    <Button variant="glass" className="h-12 px-6 rounded-xl border-white/5 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-white">
                        <Download size={16} className="mr-2" /> CSV
                    </Button>
                </div>
            </div>

            {/* Projects List */}
            <div className="space-y-6">
                {filteredProjects.length === 0 ? (
                    <Card className="py-32 text-center bg-white/[0.02] border-white/5 rounded-[48px] border-dashed">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FileText size={40} className="text-slate-700" />
                        </div>
                        <h3 className="text-xl font-black text-slate-600 uppercase tracking-widest">{t("municipal.projects.empty_title", "Nenhum projeto identificado")}</h3>
                        <p className="text-slate-500 text-sm mt-2">{t("municipal.projects.empty_desc", "Ajuste os filtros para visualizar outros registros.")}</p>
                    </Card>
                ) : (
                    filteredProjects.map((project, idx) => {
                        const statusInfo = statusLabels[project.status] || statusLabels.DRAFT;
                        const score = project.finalScore || 0;
                        const scoreColor = score >= 8 ? 'text-emerald-400' : score >= 5 ? 'text-amber-400' : 'text-rose-500';

                        return (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="p-0 bg-white/[0.02] border-white/5 rounded-[32px] group hover:bg-white/[0.04] transition-all overflow-hidden border-l-4" style={{ borderLeftColor: statusInfo.color.replace('text-', '') }}>
                                    <div className="flex flex-col lg:flex-row items-stretch">
                                        {/* Score Section */}
                                        <div className="p-8 flex lg:flex-col items-center justify-center min-w-[140px] bg-white/[0.01] border-r border-white/5 gap-2 group-hover:bg-white/[0.03] transition-colors">
                                            <div className={`font-black text-4xl tracking-tighter ${scoreColor}`}>
                                                {score.toFixed(1)}
                                            </div>
                                            <div className="text-[9px] text-slate-600 uppercase font-black tracking-[0.2em]">{t("municipal.projects.global_score", "Score Global")}</div>
                                            <div className="mt-2 w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div className={`h-full ${scoreColor.replace('text-', 'bg-')} transition-all duration-1000`} style={{ width: `${score * 10}%` }} />
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="flex-1 p-8 space-y-5">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <Badge variant="glass" className={`${statusInfo.bg} ${statusInfo.color} border-${statusInfo.color.replace('text-', '')}/20 uppercase text-[8px] font-black tracking-widest px-3 py-1`}>
                                                    {statusInfo.label}
                                                </Badge>
                                                {project.culturalCategory && (
                                                    <Badge variant="glass" className="bg-white/5 text-slate-500 border-white/5 uppercase text-[8px] font-black tracking-widest px-3 py-1">
                                                        {project.culturalCategory}
                                                    </Badge>
                                                )}
                                                {project.aiAnalysis && (
                                                    <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 uppercase text-[8px] font-black flex items-center gap-1.5 px-3 py-1">
                                                        <Sparkles size={10} /> {t("municipal.projects.ai_analyzed", "IA Analisado")}
                                                    </Badge>
                                                )}
                                            </div>
                                            
                                            <div className="space-y-1">
                                                <h3 className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors tracking-tight">
                                                    {project.title}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                                    <div className="flex items-center gap-2 group-hover:text-slate-300 transition-colors">
                                                        <Users size={14} className="text-emerald-500" /> {project.proponent?.name || t("municipal.projects.unknown_proponent", "Proponente Desconhecido")}
                                                    </div>
                                                    <div className="flex items-center gap-2 group-hover:text-slate-300 transition-colors">
                                                        <MapPin size={14} className="text-emerald-500" /> {project.targetRegion || t("municipal.projects.municipal_region", "Região Municipal")}
                                                    </div>
                                                    <div className="flex items-center gap-2 group-hover:text-slate-300 transition-colors font-black text-white/60">
                                                        <Target size={14} className="text-emerald-500" /> {formatCurrency(project.requestedBudget)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions Section */}
                                        <div className="p-8 flex items-center justify-end bg-white/[0.01] border-l border-white/5 min-w-[180px]">
                                            <Button
                                                onClick={() => navigate(`/municipal/projects/${project.id}`)}
                                                className="h-12 w-full lg:w-auto px-6 rounded-2xl bg-white/5 text-white font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2"
                                            >
                                                {t("municipal.projects.evaluate", "Avaliar")} <ChevronRight size={16} />
                                            </Button>
                                        </div>
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
