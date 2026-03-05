import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { Button } from "../../../components/ui";
import {
    ArrowLeft, FileText, Calendar, Users, Sparkles,
    ExternalLink, MapPin, DollarSign, CheckCircle2, Download, Share, CheckCircle,
    Filter, SortAsc, SortDesc, TrendingUp
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

export const AdminNoticeProjects: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { tenantId } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [notice, setNotice] = useState<Notice | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters & Sorting
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [aiFilter, setAiFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("score"); // 'date', 'score'

    const fetchAll = () => {
        if (!id || !tenantId) return;

        setLoading(true);
        Promise.all([
            api.get(`/notices/${id}`),
            api.get(`/projects?noticeId=${id}&tenantId=${tenantId}`)
        ]).then(([noticeRes, projectsRes]) => {
            setNotice(noticeRes.data);
            setProjects(projectsRes.data);
        }).catch(err => {
            console.error(err);
            addToast("Erro ao carregar projetos do edital", "error");
        }).finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchAll();
    }, [id, tenantId]);

    const handleExportCSV = () => {
        if (projects.length === 0) return;

        const headers = ["ID", "Título", "Proponente", "Status", "Categoria", "Região", "Valor Solicitado", "Score IA", "Nota Humana", "Score Final", "Recomendação IA"];
        const rows = projects.map(p => [
            p.id,
            p.title,
            p.proponent?.name || "N/A",
            statusLabels[p.status]?.label || p.status,
            p.culturalCategory || "",
            p.targetRegion || "",
            p.requestedBudget || 0,
            p.aiAnalysis?.scores ? (Object.values(p.aiAnalysis.scores).reduce((a, b) => a + b, 0) / Object.values(p.aiAnalysis.scores).length).toFixed(1) : "N/A",
            p.humanScore || "0",
            p.finalScore || "0",
            p.aiAnalysis?.recommendation || "N/A"
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `projetos_edital_${id?.slice(0, 8)}.csv`);
        link.click();
    };

    const handlePublishResults = async () => {
        if (!window.confirm("Deseja publicar os resultados finais deste edital? Isso oficializará as decisões tomadas.")) return;

        try {
            await api.put(`/notices/${id}/publish-results`);
            addToast("Resultados publicados com sucesso!", "success");
            fetchAll();
        } catch (err) {
            console.error(err);
            addToast("Erro ao publicar resultados", "error");
        }
    };

    const formatCurrency = (value?: number) => {
        if (!value) return "-";
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-zinc-500">Carregando projetos...</p>
            </div>
        );
    }

    return (
        <div className="admin-form-container max-w-7xl animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="flex items-start gap-4">
                    <Button variant="ghost" onClick={() => navigate("/admin/editais")} className="mt-1 p-1 hover:bg-white/5">
                        <ArrowLeft size={24} className="text-zinc-500" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-white">Projetos Inscritos</h1>
                            <span className="text-zinc-600 font-mono text-sm">#{id?.slice(0, 8)}</span>
                        </div>
                        <p className="text-gold font-medium flex items-center gap-2">
                            <FileText size={18} /> {notice?.title}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 bg-zinc-900/50 border border-white/5 rounded-xl px-3 py-1.5">
                        <Filter size={14} className="text-zinc-500" />
                        <select
                            className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">Todos Status</option>
                            <option value="SUBMITTED">Novos</option>
                            <option value="UNDER_REVIEW">Em Análise</option>
                            <option value="APPROVED">Aprovados</option>
                            <option value="REJECTED">Reprovados</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-zinc-900/50 border border-white/5 rounded-xl px-3 py-1.5">
                        <Sparkles size={14} className="text-purple-500" />
                        <select
                            className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                            value={aiFilter}
                            onChange={(e) => setAiFilter(e.target.value)}
                        >
                            <option value="ALL">Todas IA</option>
                            <option value="APPROVE">Recomendados</option>
                            <option value="REVIEW">Para Revisão</option>
                            <option value="REJECT">Reprovação IA</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-zinc-900/50 border border-white/5 rounded-xl px-3 py-1.5">
                        <SortAsc size={14} className="text-zinc-500" />
                        <select
                            className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="score">Melhores Scores</option>
                            <option value="date">Mais Recentes</option>
                        </select>
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleExportCSV}
                        className="bg-zinc-900/50 border-white/5 hover:bg-gold/10 hover:text-gold h-9 px-3 text-xs"
                    >
                        <Download size={14} className="mr-2" /> CSV
                    </Button>

                    {notice?.status !== "RESULTS_PUBLISHED" && (
                        <Button
                            onClick={handlePublishResults}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 h-9 px-3 text-xs"
                        >
                            <Share size={14} className="mr-2" /> Publicar Resultados
                        </Button>
                    )}

                    <div className="bg-zinc-900/50 border border-white/5 px-4 py-1.5 rounded-xl text-center min-w-[80px]">
                        <div className="text-[9px] text-zinc-500 uppercase font-black tracking-tighter">Inscritos</div>
                        <div className="text-lg font-black text-white leading-none">{projects.length}</div>
                    </div>
                </div>
            </div>

            {/* Project Grid */}
            <div className="grid grid-cols-1 gap-4">
                {projects.length === 0 ? (
                    <div className="py-24 text-center bg-zinc-900/20 rounded-3xl border border-white/5 border-dashed">
                        <Users className="mx-auto mb-4 opacity-10" size={64} />
                        <h3 className="text-xl font-bold text-zinc-500">Nenhum projeto inscrito neste edital ainda.</h3>
                    </div>
                ) : (
                    projects
                        .filter(p => statusFilter === "ALL" || p.status === statusFilter)
                        .filter(p => aiFilter === "ALL" || p.aiAnalysis?.recommendation === aiFilter)
                        .sort((a, b) => {
                            if (sortBy === 'score') {
                                return (b.finalScore || 0) - (a.finalScore || 0);
                            }
                            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                        })
                        .map(project => {
                            const statusInfo = statusLabels[project.status] || statusLabels.DRAFT;
                            const avgScore = project.aiAnalysis?.scores
                                ? Math.round(Object.values(project.aiAnalysis.scores).reduce((a, b) => a + b, 0) / Object.values(project.aiAnalysis.scores).length)
                                : null;

                            return (
                                <div key={project.id} className="media-card group hover:border-gold/30 hover:bg-white/[0.02] transition-all p-5">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Score Side */}
                                        <div className="flex md:flex-col items-center justify-center gap-2 border-b md:border-b-0 md:border-r border-white/5 pb-4 md:pb-0 md:pr-6 min-w-[100px]">
                                            {project.finalScore !== null && project.finalScore !== undefined ? (
                                                <>
                                                    <div className="text-purple-400 font-black text-3xl">{project.finalScore.toFixed(1)}</div>
                                                    <div className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
                                                        <TrendingUp size={10} style={{ color: "#a78bfa" }} /> Score Final
                                                    </div>
                                                </>
                                            ) : avgScore !== null ? (
                                                <>
                                                    <div className="text-zinc-500 font-black text-3xl">{avgScore}</div>
                                                    <div className="text-[10px] text-zinc-600 uppercase font-bold flex items-center gap-1">
                                                        <Sparkles size={10} className="text-purple-500/50" /> IA (Parcial)
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="text-zinc-700 font-black text-3xl">--</div>
                                                    <div className="text-[10px] text-zinc-600 uppercase font-bold">Sem Análise</div>
                                                </>
                                            )}
                                        </div>

                                        {/* Main Content */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
                                                    {statusInfo.label}
                                                </span>
                                                {project.aiAnalysis && (
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-tighter border shadow-md shadow-black/20
                                                    ${project.aiAnalysis.recommendation === 'APPROVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                            project.aiAnalysis.recommendation === 'REJECT' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                                'bg-amber-500/10 text-amber-400 border-amber-500/20'}
                                                `}>
                                                        IA: {project.aiAnalysis.recommendation === 'APPROVE' ? 'RECOMENDADO' :
                                                            project.aiAnalysis.recommendation === 'REJECT' ? 'REPROVAR' : 'REVISAR'}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-xl font-bold text-white group-hover:text-gold transition-colors mb-2">
                                                {project.title}
                                            </h3>

                                            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                                                <div className="flex items-center gap-1.5 font-bold text-zinc-300">
                                                    <Users size={12} className="text-gold/50" /> {project.proponent?.name || 'Proponente'}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin size={12} className="text-zinc-600" /> {project.targetRegion || 'Região não informada'}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <DollarSign size={12} className="text-zinc-600" /> {formatCurrency(project.requestedBudget)}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={12} className="text-zinc-600" /> {new Date(project.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action */}
                                        <div className="flex items-center justify-end md:pl-6 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0">
                                            <Button
                                                variant="ghost"
                                                onClick={() => navigate(`/admin/projetos/${project.id}`)}
                                                className="hover:bg-gold/10 hover:text-gold group/btn"
                                            >
                                                Avaliar Projeto <ExternalLink size={16} className="ml-2 transition-transform group-hover/btn:translate-x-1" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                )}
            </div>
        </div>
    );
};
