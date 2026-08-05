import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Banknote, FileText, ListChecks, Scale, Users } from "lucide-react";
import { api } from "../../../api/client";
import { Button } from "../../../components/ui";
import { logger } from "@/utils/logger";

type TransparencyProject = {
    id: string;
    title: string;
    proponentName: string;
    status: string;
    culturalCategory?: string | null;
    targetRegion?: string | null;
    requestedBudget?: number | string | null;
    approvedBudget?: number | string | null;
    actualAudience?: number | null;
    expectedAudience?: number | null;
    finalScore?: number | null;
    appeals: unknown[];
    signedTerms: unknown[];
    accountabilities: Array<{ id: string; status: string; executionSummary?: string | null; audienceReached?: number | null; amountSpent?: number | string | null }>;
};

type TransparencyResponse = {
    notice: {
        id: string;
        title: string;
        description?: string | null;
        status: string;
        totalBudget?: number | string | null;
        tenant?: { name?: string | null };
    };
    totals: {
        projects: number;
        approved: number;
        requestedBudget: number;
        approvedBudget: number;
        audience: number;
        appeals: number;
        signedTerms: number;
        accountabilities: number;
    };
    projects: TransparencyProject[];
};

function currency(value?: number | string | null) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value || 0));
}

export const ProducerNoticeTransparency: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<TransparencyResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        api.get<TransparencyResponse>(`/notices/public/${id}/transparency`)
            .then(res => setData(res.data))
            .catch(err => {
                logger.error("Erro ao carregar transparência do edital.", err);
                setData(null);
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="flex min-h-[55vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--accent-primary)] border-t-transparent" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="max-w-4xl mx-auto py-20 text-center">
                <FileText size={48} className="mx-auto text-zinc-600 mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Transparência indisponível</h1>
                <p className="text-zinc-500 mb-8">O painel fica disponível após a publicação dos resultados.</p>
                <Button onClick={() => navigate(-1)} variant="outline">Voltar</Button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-fadeIn">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" onClick={() => navigate(-1)} className="p-2 hover:bg-white/5">
                    <ArrowLeft size={24} className="text-zinc-500" />
                </Button>
                <div>
                    <div className="flex items-center gap-2 text-[var(--accent-primary)] text-xs font-black uppercase tracking-widest mb-1">
                        <Scale size={14} /> Painel de Transparência
                    </div>
                    <h1 className="text-3xl font-bold text-white">{data.notice.title}</h1>
                    <p className="text-sm text-zinc-500">{data.notice.tenant?.name || "Cultura Viva"}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Projetos", value: data.totals.projects, icon: <FileText size={18} /> },
                    { label: "Aprovados", value: data.totals.approved, icon: <ListChecks size={18} /> },
                    { label: "Recursos", value: data.totals.appeals, icon: <Scale size={18} /> },
                    { label: "Público", value: data.totals.audience, icon: <Users size={18} /> }
                ].map(item => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                        <div className="mb-3 text-[var(--accent-primary)]">{item.icon}</div>
                        <div className="text-2xl font-black text-white">{item.value}</div>
                        <div className="text-xs uppercase font-bold text-zinc-500">{item.label}</div>
                    </div>
                ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-8">
                <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
                    <Banknote size={18} className="text-[var(--accent-primary)]" /> Orçamento
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div><span className="text-zinc-500">Total do edital:</span> <strong className="text-white">{currency(data.notice.totalBudget)}</strong></div>
                    <div><span className="text-zinc-500">Solicitado:</span> <strong className="text-white">{currency(data.totals.requestedBudget)}</strong></div>
                    <div><span className="text-zinc-500">Aprovado:</span> <strong className="text-white">{currency(data.totals.approvedBudget)}</strong></div>
                </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">Projetos e execução</h2>
                </div>
                <div className="divide-y divide-white/10">
                    {data.projects.map(project => (
                        <div key={project.id} className="p-6">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div>
                                    <div className="text-[10px] uppercase font-black text-[var(--accent-primary)] mb-1">{project.status}</div>
                                    <h3 className="text-lg font-bold text-white">{project.title}</h3>
                                    <p className="text-sm text-zinc-500">{project.proponentName} · {project.culturalCategory || "Categoria não informada"}</p>
                                </div>
                                <div className="text-sm text-right">
                                    <div className="text-zinc-500">Aprovado</div>
                                    <div className="font-bold text-white">{currency(project.approvedBudget)}</div>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-4 gap-3 mt-5 text-xs">
                                <div className="rounded-xl bg-white/[0.03] p-3 text-zinc-400">Recursos: <strong className="text-white">{project.appeals.length}</strong></div>
                                <div className="rounded-xl bg-white/[0.03] p-3 text-zinc-400">Termos: <strong className="text-white">{project.signedTerms.length}</strong></div>
                                <div className="rounded-xl bg-white/[0.03] p-3 text-zinc-400">Contas: <strong className="text-white">{project.accountabilities.length}</strong></div>
                                <div className="rounded-xl bg-white/[0.03] p-3 text-zinc-400">Público: <strong className="text-white">{project.actualAudience || project.expectedAudience || 0}</strong></div>
                            </div>
                            {project.accountabilities[0]?.executionSummary && (
                                <p className="text-sm text-zinc-400 mt-4 leading-relaxed">{project.accountabilities[0].executionSummary}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
