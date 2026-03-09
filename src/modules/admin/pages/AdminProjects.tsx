import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { Button, Input, Select } from "../../../components/ui";
import { Search, Filter, Briefcase, MapPin, DollarSign, FileText, ExternalLink, Calendar, Sparkles, TrendingUp } from "lucide-react";
import "./AdminShared.css";


type Project = {
    id: string;
    title: string;
    status: string;
    culturalCategory?: string;
    targetRegion?: string;
    requestedBudget?: number;
    notice?: { id: string; title: string };
    aiAnalysis?: {
        summary: string;
        scores: Record<string, number>;
        recommendation: 'APPROVE' | 'REJECT' | 'REVIEW';
    };
    aiAnalyzedAt?: string;
    createdAt?: string;
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

export const AdminProjects: React.FC = () => {
  const { t } = useTranslation();
    const { tenantId } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("date"); // 'date', 'score'
    const [aiFilter, setAiFilter] = useState(""); // '', 'APPROVE', 'REJECT', 'REVIEW'

    useEffect(() => {
        if (!tenantId) return;

        setLoading(true);
        const params: any = { tenantId };
        if (filter) params.status = filter;

        api.get("/projects", { params })
            .then(res => setProjects(res.data))
            .catch(err => {
                console.error("Erro ao carregar projetos", err);
                setProjects([]);
                addToast("Erro ao carregar projetos", "error");
            })
            .finally(() => setLoading(false));
    }, [tenantId, filter, addToast]);

    const formatCurrency = (value?: number) => {
        if (!value) return "-";
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("pt-BR");
    }

    const filteredProjects = projects
        .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(p => !aiFilter || p.aiAnalysis?.recommendation === aiFilter)
        .sort((a, b) => {
            if (sortBy === "score") {
                const scoreA = a.aiAnalysis?.scores ? (Object.values(a.aiAnalysis.scores).reduce((x, y) => x + y, 0) / Object.values(a.aiAnalysis.scores).length) : 0;
                const scoreB = b.aiAnalysis?.scores ? (Object.values(b.aiAnalysis.scores).reduce((x, y) => x + y, 0) / Object.values(b.aiAnalysis.scores).length) : 0;
                return scoreB - scoreA;
            }
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });

    return (
        <div className="max-w-6xl mx-auto pb-24 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 flex items-center gap-3">
                        🎨 Projetos Culturais
                    </h1>
                    <p className="text-zinc-400 text-sm font-medium mt-1">
                        Acompanhe os projetos inscritos e seus status.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <Input
                        placeholder="Buscar projetos..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10 bg-zinc-900/50 border-white/5 text-white focus:border-gold/30"
                    />
                </div>
                <div className="w-full md:w-48">
                    <Select
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="bg-zinc-900/50 border-white/5 text-white focus:border-gold/30"
                    >
                        <option value="">Todos os status</option>
                        {Object.entries(statusLabels).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </Select>
                </div>
                <div className="w-full md:w-48">
                    <Select
                        value={aiFilter}
                        onChange={e => setAiFilter(e.target.value)}
                        className="bg-zinc-900/50 border-white/5 text-white focus:border-gold/30"
                    >
                        <option value="">IA: Todos</option>
                        <option value="APPROVE">IA: Recomendados</option>
                        <option value="REVIEW">IA: Revisar</option>
                        <option value="REJECT">IA: Reprovados</option>
                    </Select>
                </div>
                <div className="w-full md:w-48">
                    <Select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="bg-zinc-900/50 border-white/5 text-white focus:border-gold/30"
                    >
                        <option value="date">Ordenar por Data</option>
                        <option value="score">Ordenar por Score IA</option>
                    </Select>
                </div>
            </div>

            {/* Content */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-zinc-500 text-sm">Carregando projetos...</p>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="p-12 text-center text-zinc-500">
                        <Briefcase className="mx-auto mb-3 opacity-20" size={48} />
                        <p>Nenhum projeto encontrado.</p>
                    </div>
                ) : (
                    <div className="w-full">
                        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                            <div className="col-span-4">Projeto</div>
                            <div className="col-span-3">Edital/Categoria</div>
                            <div className="col-span-2">{t("admin.projects.oramento", `Orçamento`)}</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-1 text-right"></div>
                        </div>

                        <div className="divide-y divide-white/5">
                            {filteredProjects.map(project => {
                                const statusInfo = statusLabels[project.status] || { label: project.status, color: "text-zinc-400", bg: "bg-zinc-500/10", border: "border-zinc-500/20" };
                                return (
                                    <div key={project.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-zinc-900/40 border border-gold/20/5 transition-colors group">
                                        <div className="md:col-span-4">
                                            <div className="flex items-center gap-2 group-hover:text-gold transition-colors">
                                                <div className="font-bold text-white text-lg md:text-base">
                                                    {project.title}
                                                </div>
                                                {project.aiAnalysis && (
                                                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black tracking-tighter shadow-md shadow-black/20
                                                        ${project.aiAnalysis.recommendation === 'APPROVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' :
                                                            project.aiAnalysis.recommendation === 'REJECT' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                                                                'bg-amber-500/20 text-amber-400 border border-amber-500/20'}
                                                    `}>
                                                        {project.aiAnalysis.recommendation === 'APPROVE' ? 'IA: OK' :
                                                            project.aiAnalysis.recommendation === 'REJECT' ? 'IA: REPROVAR' :
                                                                'IA: REVISAR'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-1">
                                                {project.targetRegion && (
                                                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                                        <MapPin size={12} /> {project.targetRegion}
                                                    </div>
                                                )}
                                                {project.createdAt && <span className="mx-1">• {formatDate(project.createdAt)}</span>}
                                                {project.aiAnalysis && project.aiAnalysis.scores && (
                                                    <div className="flex items-center gap-1 ml-2 text-purple-400 font-bold bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                                                        <Sparkles size={10} /> {Math.round(Object.values(project.aiAnalysis.scores).reduce((a, b) => a + b, 0) / Object.values(project.aiAnalysis.scores).length)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="md:col-span-3 text-sm text-zinc-400">
                                            {project.notice && (
                                                <div className="flex items-center gap-1.5 mb-1 text-zinc-300">
                                                    <FileText size={14} className="text-zinc-600" />
                                                    <span className="truncate">{project.notice.title}</span>
                                                </div>
                                            )}
                                            {project.culturalCategory && (
                                                <span className="inline-block text-[10px] bg-zinc-900/40 border border-gold/20/5 px-1.5 py-0.5 rounded text-zinc-500 border border-white/5">
                                                    {project.culturalCategory}
                                                </span>
                                            )}
                                        </div>

                                        <div className="md:col-span-2 text-sm text-zinc-300 font-mono">
                                            {project.requestedBudget ? formatCurrency(project.requestedBudget) : '-'}
                                        </div>

                                        <div className="md:col-span-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
                                                {statusInfo.label}
                                            </span>
                                        </div>

                                        <div className="md:col-span-1 flex justify-end">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => navigate(`/admin/projetos/${project.id}`)}
                                                className="text-zinc-500 hover:text-white hover:bg-zinc-900/40 border border-gold/20/10"
                                            >
                                                <ExternalLink size={18} />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
