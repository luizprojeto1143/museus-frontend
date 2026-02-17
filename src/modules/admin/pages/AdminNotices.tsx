import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { Button, Input } from "../../../components/ui";
import { Search, Plus, Filter, FileText, Calendar, DollarSign, Clock, MoreHorizontal, Edit, Trash2 } from "lucide-react";

type Notice = {
    id: string;
    title: string;
    status: string;
    inscriptionStart: string;
    inscriptionEnd: string;
    totalBudget?: number;
    _count?: { projects: number };
};

const statusLabels: Record<string, { label: string; color: string; bg: string; border: string }> = {
    DRAFT: { label: "Rascunho", color: "text-zinc-400", bg: "bg-zinc-500/10", border: "border-zinc-500/20" },
    PUBLISHED: { label: "Publicado", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    INSCRIPTIONS_OPEN: { label: "Inscrições Abertas", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    INSCRIPTIONS_CLOSED: { label: "Inscrições Encerradas", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    EVALUATION: { label: "Em Avaliação", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    RESULTS_PUBLISHED: { label: "Resultados", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    FINISHED: { label: "Finalizado", color: "text-zinc-500", bg: "bg-zinc-500/10", border: "border-zinc-500/20" }
};

export const AdminNotices: React.FC = () => {
    const { tenantId } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (!tenantId) return;

        setLoading(true);
        api.get("/notices", { params: { tenantId } })
            .then(res => setNotices(res.data))
            .catch(err => {
                console.error("Erro ao carregar editais", err);
                setNotices([]);
                addToast("Erro ao carregar editais", "error");
            })
            .finally(() => setLoading(false));
    }, [tenantId, addToast]);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatCurrency = (value?: number) => {
        if (!value) return "-";
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
    };

    // Calcs
    const total = notices.length;
    const open = notices.filter(n => n.status === "INSCRIPTIONS_OPEN").length;
    const evaluating = notices.filter(n => n.status === "EVALUATION").length;

    const filteredNotices = notices.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-form-container max-w-7xl animate-fadeIn">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-bold font-heading text-white mb-2 flex items-center gap-3">
                        <FileText className="text-gold" size={36} />
                        Editais & Fomento
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Gerencie processos seletivos e editais de cultura.
                    </p>
                </div>
                <Link to="/admin/editais/novo">
                    <Button className="bg-gold text-black hover:bg-gold/90 font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)] border-none px-6 py-3 rounded-full transition-all hover:scale-105 active:scale-95">
                        <Plus size={20} className="mr-2" /> Novo Edital
                    </Button>
                </Link>
            </div>

            {/* Config Check (if feature is off in backend but accessible via route) */}
            {/* This is handled by sidebar hiding, but good to have stats */}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <FileText size={64} className="text-white" />
                    </div>
                    <p className="text-zinc-400 font-medium mb-1">Total de Editais</p>
                    <h3 className="text-4xl font-bold text-white">{total}</h3>
                </div>
                <div className="bg-emerald-950/20 backdrop-blur-md border border-emerald-500/20 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calendar size={64} className="text-emerald-400" />
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent"></div>
                    <p className="text-emerald-200/70 font-medium mb-1">Inscrições Abertas</p>
                    <h3 className="text-4xl font-bold text-white">{open}</h3>
                </div>
                <div className="bg-purple-950/20 backdrop-blur-md border border-purple-500/20 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle size={64} className="text-purple-400" />
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-transparent"></div>
                    <p className="text-purple-200/70 font-medium mb-1">Em Avaliação</p>
                    <h3 className="text-4xl font-bold text-white">{evaluating}</h3>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-zinc-900/30 border border-white/5 p-4 rounded-xl flex flex-col md:flex-row gap-4 mb-8 backdrop-blur-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por título ou status..."
                        className="w-full bg-zinc-950/50 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white px-6">
                    <Filter size={18} className="mr-2" /> Filtros Avançados
                </Button>
            </div>

            {/* Grid/List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mb-6"></div>
                        <p className="text-zinc-500">Carregando editais...</p>
                    </div>
                ) : filteredNotices.length === 0 ? (
                    <div className="py-24 text-center text-zinc-500 bg-zinc-900/20 rounded-3xl border border-white/5 border-dashed">
                        <FileText className="mx-auto mb-6 opacity-20" size={64} />
                        <h3 className="text-2xl font-bold text-white mb-2">Nenhum edital encontrado</h3>
                        <p className="mb-8 max-w-md mx-auto text-zinc-400">Comece criando seu primeiro edital de fomento cultural para receber inscrições.</p>
                        <Link to="/admin/editais/novo">
                            <Button className="bg-zinc-800 text-white hover:bg-zinc-700 border border-white/10">
                                Criar Edital Agora
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredNotices.map(notice => {
                            const statusInfo = statusLabels[notice.status] || { label: notice.status, color: "text-zinc-400", bg: "bg-zinc-500/10", border: "border-zinc-500/20" };

                            return (
                                <div key={notice.id} className="group bg-zinc-900/40 border border-white/5 hover:border-gold/30 rounded-2xl p-6 transition-all hover:bg-zinc-900/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] relative overflow-hidden backdrop-blur-sm">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                                    <div className="flex flex-col md:flex-row gap-6 relative z-10">
                                        {/* Main Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border} shadow-sm`}>
                                                    {statusInfo.label}
                                                </span>
                                                <span className="text-zinc-600 text-xs">ID: {notice.id.slice(0, 8)}</span>
                                            </div>

                                            <h3 className="text-2xl font-bold text-white group-hover:text-gold transition-colors mb-2">
                                                {notice.title}
                                            </h3>

                                            <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400 mt-4">
                                                <div className="flex items-center gap-2 bg-zinc-950/30 px-3 py-1.5 rounded-lg border border-white/5">
                                                    <Calendar size={14} className="text-gold" />
                                                    <span>Inscrições: <span className="text-zinc-200">{formatDate(notice.inscriptionStart)}</span> a <span className="text-zinc-200">{formatDate(notice.inscriptionEnd)}</span></span>
                                                </div>

                                                {notice.totalBudget !== undefined && (
                                                    <div className="flex items-center gap-2 bg-zinc-950/30 px-3 py-1.5 rounded-lg border border-white/5">
                                                        <DollarSign size={14} className="text-gold" />
                                                        <span className="text-zinc-200 font-medium">{formatCurrency(notice.totalBudget)}</span>
                                                    </div>
                                                )}

                                                {notice._count && (
                                                    <div className="flex items-center gap-2 px-2">
                                                        <FileText size={14} className="text-zinc-500" />
                                                        <span>{notice._count.projects || 0} inscritos</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3 self-start md:self-center border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 mt-4 md:mt-0 w-full md:w-auto justify-end">
                                            <Button
                                                variant="ghost"
                                                className="w-full md:w-auto justify-center text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
                                                onClick={() => navigate(`/admin/editais/${notice.id}`)}
                                            >
                                                <Edit size={18} className="mr-2" /> Gerenciar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
