import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useTranslation } from "react-i18next";
import { Search, Filter, Plus, FileText, ArrowRight, Calendar, Download, TrendingUp } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

interface Notice {
    id: string;
    title: string;
    description: string;
    objectives?: string;
    requirements?: string;
    status: string;
    inscriptionStart: string;
    inscriptionEnd: string;
    totalBudget?: number;
    maxPerProject?: number;
    culturalCategories?: string[];
    documentUrl?: string;
    type: string;
}

export const ProducerNotices: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [canSubmit, setCanSubmit] = useState(true);

    useEffect(() => {
        if (tenantId) {
            api.get(`/tenants/${tenantId}`)
                .then(res => {
                    setCanSubmit(res.data.featureEditaisSubmission !== false);
                })
                .catch(err => console.error("Error fetching features", err));
        }

        api.get("/notices/public")
            .then(res => setNotices(Array.isArray(res.data) ? res.data : []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [tenantId]);

    const handleApply = (noticeId: string) => {
        navigate(`/producer/projects/new?noticeId=${noticeId}`);
    };

    if (loading) return (
        <div className="flex justify-center py-20 animate-in fade-in duration-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
        </div>
    );

    return (
        <div className="pb-16 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#D4AF37] mb-2 font-serif flex items-center gap-3">
                        Editais Abertos
                    </h1>
                    <p className="text-[#B0A090]">Inscreva seus projetos e concorra a recursos disponibilizados.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notices.length === 0 ? (
                    <div className="col-span-full bg-[#2c1e10] rounded-2xl p-12 text-center border border-dashed border-[#463420]">
                        <div className="w-20 h-20 bg-black/20 rounded-full flex items-center justify-center mx-auto mb-6 text-[#463420]">
                            <FileText size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-[#EAE0D5] mb-2">Nenhum edital aberto</h3>
                        <p className="text-[#B0A090] max-w-md mx-auto">{t("producer.producernotices.noMomentoNoHEditaisComInscriesAbertasFiq", `
                            No momento não há editais com inscrições abertas. Fique atento às novidades.
                        `)}</p>
                    </div>
                ) : (
                    notices.map(notice => (
                        <div
                            key={notice.id}
                            className="bg-[#2c1e10] rounded-2xl p-6 border border-[#463420] hover:border-[#D4AF37]/50 transition-all flex flex-col h-full group hover:-translate-y-1 shadow-lg shadow-black/20"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-[#D4AF37]/10 p-3 rounded-xl text-[#D4AF37]">
                                    <FileText size={24} />
                                </div>
                                {notice.status === "INSCRIPTIONS_OPEN" ? (
                                    <span className="bg-[#4cd964]/10 text-[#4cd964] text-xs font-bold px-3 py-1 rounded-full uppercase border border-[#4cd964]/20">{t("producer.producernotices.inscriesAbertas", `
                                        Inscrições Abertas
                                    `)}</span>
                                ) : notice.status === "RESULTS_PUBLISHED" ? (
                                    <span className="bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold px-3 py-1 rounded-full uppercase border border-[#D4AF37]/20">
                                        Resultados Publicados
                                    </span>
                                ) : (
                                    <span className="bg-zinc-500/10 text-zinc-500 text-xs font-bold px-3 py-1 rounded-full uppercase border border-zinc-500/20">
                                        {notice.status}
                                    </span>
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-[#EAE0D5] mb-2 font-serif group-hover:text-[#D4AF37] transition-colors">
                                {notice.title}
                            </h3>

                            <p className="text-[#B0A090] text-sm mb-4 flex-1 line-clamp-3 leading-relaxed">
                                {notice.description}
                            </p>

                            {notice.requirements && (
                                <div className="mb-4 text-xs text-[#B0A090] italic line-clamp-2">
                                    <strong>Requisitos:</strong> {notice.requirements}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2 mb-6">
                                {notice.culturalCategories?.map((cat, i) => (
                                    <span key={i} className="bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#D4AF37]/20">
                                        {cat}
                                    </span>
                                ))}
                            </div>

                            <div className="bg-black/20 p-4 rounded-xl text-sm space-y-2 mb-6 border border-[#463420]/50">
                                {notice.totalBudget && (
                                    <div className="flex justify-between items-center text-[#B0A090] pb-2 border-b border-[#463420]/30">
                                        <span>{t("producer.producernotices.recursoDisponvel", `Recurso disponível`)}</span>
                                        <span className="text-[#EAE0D5] font-bold">R$ {Number(notice.totalBudget).toLocaleString()}</span>
                                    </div>
                                )}
                                {notice.maxPerProject && (
                                    <div className="flex justify-between items-center text-[#B0A090] pb-2 border-b border-[#463420]/30">
                                        <span>{t("producer.producernotices.mximoPorProjeto", `Máximo por projeto`)}</span>
                                        <span className="text-[#D4AF37] font-bold">Até R$ {Number(notice.maxPerProject).toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-[#B0A090]">
                                    <span className="flex items-center gap-2"><Calendar size={14} /> Início</span>
                                    <span className="text-[#EAE0D5] font-bold">{new Date(notice.inscriptionStart).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[#B0A090]">
                                    <span className="flex items-center gap-2"><Calendar size={14} /> Fim</span>
                                    <span className="text-[#D4AF37] font-bold">{new Date(notice.inscriptionEnd).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {notice.documentUrl && (
                                    <a
                                        href={notice.documentUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-3 bg-black/30 text-[#D4AF37] hover:bg-black/50 rounded-xl transition-all border border-[#D4AF37]/20"
                                        title="Baixar Edital"
                                    >
                                        <Download size={18} />
                                    </a>
                                )}
                                {notice.status === "RESULTS_PUBLISHED" ? (
                                    <button
                                        onClick={() => navigate(`/producer/editais/${notice.id}/results`)}
                                        className="flex-1 py-3 bg-[#D4AF37] text-[#1a1108] hover:bg-[#c5a028] rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#D4AF37]/10"
                                    >
                                        Ver Classificação <TrendingUp size={18} />
                                    </button>
                                ) : notice.status === "INSCRIPTIONS_OPEN" && canSubmit ? (
                                    <button
                                        onClick={() => handleApply(notice.id)}
                                        className="flex-1 py-3 bg-[#D4AF37] text-[#1a1108] hover:bg-[#c5a028] rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#D4AF37]/10"
                                    >
                                        Inscrever Projeto <ArrowRight size={18} />
                                    </button>
                                ) : (
                                    <div className="flex-1 py-3 bg-black/20 text-[#B0A090] rounded-xl text-sm font-bold text-center cursor-not-allowed border border-[#463420]">
                                        {notice.status === "INSCRIPTIONS_CLOSED" ? "Inscrições Encerradas" : "Submissão Indisponível"}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
