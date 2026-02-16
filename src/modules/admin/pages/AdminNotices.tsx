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

    const filteredNotices = notices.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto pb-24 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 flex items-center gap-3">
                        📋 Editais Públicos
                    </h1>
                    <p className="text-zinc-400 text-sm font-medium mt-1">
                        Gerencie os editais de fomento e seus status.
                    </p>
                </div>
                <Link to="/admin/editais/novo">
                    <Button className="bg-gold text-black hover:bg-gold/90 font-bold shadow-lg shadow-gold/10 border-none">
                        <Plus size={18} className="mr-2" /> Novo Edital
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <Input
                        placeholder="Buscar editais..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10 bg-zinc-900/50 border-white/5 text-white focus:border-gold/30"
                    />
                </div>
                <Button variant="outline" className="border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white">
                    <Filter size={18} className="mr-2" /> Filtros
                </Button>
            </div>

            {/* Grid/List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center bg-zinc-900/50 rounded-3xl border border-white/5">
                        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-zinc-500 text-sm">Carregando editais...</p>
                    </div>
                ) : filteredNotices.length === 0 ? (
                    <div className="p-16 text-center text-zinc-500 bg-zinc-900/50 rounded-3xl border border-white/5">
                        <FileText className="mx-auto mb-4 opacity-20" size={48} />
                        <h3 className="text-lg font-bold text-white mb-2">Nenhum edital encontrado</h3>
                        <p className="mb-6 max-w-sm mx-auto">Parece que você ainda não criou nenhum edital público.</p>
                        <Link to="/admin/editais/novo">
                            <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
                                Criar primeiro edital
                            </Button>
                        </Link>
                    </div>
                ) : (
                    filteredNotices.map(notice => {
                        const statusInfo = statusLabels[notice.status] || { label: notice.status, color: "text-zinc-400", bg: "bg-zinc-500/10", border: "border-zinc-500/20" };

                        return (
                            <div key={notice.id} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 hover:border-gold/30 transition-all group backdrop-blur-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative z-10">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
                                                {statusInfo.label}
                                            </span>
                                            {notice.totalBudget !== undefined && (
                                                <span className="text-xs text-zinc-500 flex items-center gap-1">
                                                    <DollarSign size={12} /> {formatCurrency(notice.totalBudget)}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-gold transition-colors truncate mb-1">
                                            {notice.title}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                                            <div className="flex items-center gap-1.5" title="Período de Inscrição">
                                                <Calendar size={14} className="text-zinc-600" />
                                                <span>{formatDate(notice.inscriptionStart)} a {formatDate(notice.inscriptionEnd)}</span>
                                            </div>
                                            {notice._count && (
                                                <div className="flex items-center gap-1.5" title="Projetos Inscritos">
                                                    <FileText size={14} className="text-zinc-600" />
                                                    <span>{notice._count.projects || 0} projetos</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end md:self-center">
                                        <Button
                                            variant="ghost"
                                            className="text-zinc-400 hover:text-white hover:bg-white/10"
                                            onClick={() => navigate(`/admin/editais/${notice.id}`)}
                                        >
                                            <Edit size={18} />
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
