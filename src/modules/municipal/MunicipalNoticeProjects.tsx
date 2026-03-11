import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Button } from "../../components/ui";
import {
    ArrowLeft, FileText, Calendar, Users, Sparkles,
    ExternalLink, MapPin, DollarSign, Download, Share,
    Filter, SortAsc, TrendingUp
} from "lucide-react";

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

const statusLabels: Record<string, { label: string; color: string; bg: string; border: string }> = {
    DRAFT: { label: "Rascunho", color: "text-zinc-400", bg: "bg-zinc-500/10", border: "border-zinc-500/20" },
    SUBMITTED: { label: "Enviado", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    UNDER_REVIEW: { label: "Em Análise", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    APPROVED: { label: "Aprovado", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    REJECTED: { label: "Reprovado", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    IN_EXECUTION: { label: "Em Execução", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    COMPLETED: { label: "Concluído", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    CANCELED: { label: "Cancelado", color: "text-zinc-500", bg: "bg-zinc-500/10", border: "border-zinc-500/20" }
};

export const MunicipalNoticeProjects: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const { tenantId } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [notice, setNotice] = useState<Notice | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("score");

    const fetchAll = () => {
        if (!tenantId) return;

        setLoading(true);
        const projectsUrl = id ? `/projects?noticeId=${id}&tenantId=${tenantId}` : `/projects?tenantId=${tenantId}&consolidated=true`;
        
        const promises = [api.get(projectsUrl)];
        if (id) promises.push(api.get(`/notices/${id}`));

        Promise.all(promises).then(([projectsRes, noticeRes]) => {
            setProjects(projectsRes.data);
            if (noticeRes) setNotice(noticeRes.data);
        }).catch(err => {
            console.error(err);
            addToast("Erro ao carregar projetos", "error");
        }).finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchAll();
    }, [id, tenantId]);

    const formatCurrency = (value?: number) => {
        if (!value) return "-";
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
    };

    if (loading) return <div className="p-20 text-center text-blue-600 font-bold">Carregando projetos consolidados...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-full w-10 h-10 p-0 hover:bg-slate-100">
                        <ArrowLeft size={20} className="text-slate-600" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            {id ? "Projetos do Edital" : "Panorama de Projetos Municipais"}
                        </h1>
                        <p className="text-sm text-slate-500 font-medium">
                            {notice?.title || "Visão consolidada de todas as unidades culturais"}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                        <Filter size={14} className="text-slate-400" />
                        <select
                            className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">Todos Status</option>
                            <option value="SUBMITTED">Novos</option>
                            <option value="UNDER_REVIEW">Em Análise</option>
                            <option value="APPROVED">Aprovados</option>
                        </select>
                    </div>
                    <Button variant="outline" className="gap-2 font-bold px-4 border-slate-200 text-slate-600">
                        <Download size={16} /> Exportar CSV
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {projects.length === 0 ? (
                    <div className="py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <Users className="mx-auto mb-4 text-slate-200" size={48} />
                        <h3 className="text-lg font-bold text-slate-400 font-mono tracking-tight uppercase">Nenhum projeto encontrado</h3>
                    </div>
                ) : (
                    projects
                        .filter(p => statusFilter === "ALL" || p.status === statusFilter)
                        .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
                        .map(project => {
                            const statusInfo = statusLabels[project.status] || statusLabels.DRAFT;
                            return (
                                <div key={project.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex md:flex-col items-center justify-center min-w-[80px] border-r border-slate-100 pr-6 gap-1">
                                            <div className="text-blue-600 font-black text-2xl">
                                                {project.finalScore?.toFixed(1) || "--"}
                                            </div>
                                            <div className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Score</div>
                                        </div>

                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
                                                    {statusInfo.label}
                                                </span>
                                                {project.tenant && (
                                                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                        {project.tenant.name}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {project.title}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
                                                <div className="flex items-center gap-1.5"><Users size={12} className="text-blue-500" /> {project.proponent?.name}</div>
                                                <div className="flex items-center gap-1.5"><MapPin size={12} /> {project.targetRegion}</div>
                                                <div className="flex items-center gap-1.5"><DollarSign size={12} /> {formatCurrency(project.requestedBudget)}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            <Button
                                                variant="ghost"
                                                onClick={() => navigate(`/admin/projetos/${project.id}`)}
                                                className="text-blue-600 font-bold hover:bg-blue-50 gap-2"
                                            >
                                                Detalhes <ExternalLink size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                )}
            </div>
        </div>
    );
};
