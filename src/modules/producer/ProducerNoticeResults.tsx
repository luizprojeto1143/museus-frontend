import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { FileText, Award, User, TrendingUp, ArrowLeft, Trophy } from "lucide-react";
import { Button } from "../../components/ui";

interface ResultProject {
    id: string;
    title: string;
    proponentName: string;
    finalScore: number;
    approvedBudget: number;
    culturalCategory: string;
}

interface NoticeResults {
    noticeTitle: string;
    showScores: boolean;
    projects: ResultProject[];
}

export const ProducerNoticeResults: React.FC = () => {
  const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [results, setResults] = useState<NoticeResults | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        api.get(`/notices/public/${id}/results`)
            .then(res => setResults(res.data))
            .catch(err => {
                console.error(err);
                // addToast("Resultados não encontrados", "error");
            })
            .finally(() => setLoading(false));
    }, [id]);

    const formatCurrency = (value?: number) => {
        if (!value) return "-";
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-zinc-500">{t("producer.producernoticeresults.carregandoClassificao", `Carregando classificação...`)}</p>
            </div>
        );
    }

    if (!results) {
        return (
            <div className="max-w-4xl mx-auto py-20 text-center">
                <FileText size={48} className="mx-auto text-zinc-700 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">{t("producer.producernoticeresults.classificaoIndisponvel", `Classificação Indisponível`)}</h2>
                <p className="text-zinc-500 mb-8">{t("producer.producernoticeresults.osResultadosOficiaisAindaNoForamPublicad", `Os resultados oficiais ainda não foram publicados para este edital.`)}</p>
                <Button onClick={() => navigate(-1)} variant="outline">Voltar</Button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fadeIn">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" onClick={() => navigate(-1)} className="p-2 hover:bg-white/5">
                    <ArrowLeft size={24} className="text-zinc-500" />
                </Button>
                <div>
                    <div className="flex items-center gap-2 text-gold text-xs font-black uppercase tracking-widest mb-1">
                        <Award size={14} /> Resultados Oficiais
                    </div>
                    <h1 className="text-3xl font-bold text-white">{results.noticeTitle}</h1>
                </div>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 to-black rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Trophy size={20} className="text-gold" /> Ranking de Classificados
                        </h2>
                        <span className="text-xs text-zinc-500 font-mono">Total: {results.projects.length} projetos selecionados</span>
                    </div>
                </div>

                <div className="divide-y divide-white/5">
                    {results.projects.length === 0 ? (
                        <div className="p-20 text-center text-zinc-600 italic">
                            Nenhum projeto foi aprovado neste edital.
                        </div>
                    ) : (
                        results.projects.map((project, index) => (
                            <div key={project.id} className="p-6 flex items-center gap-6 hover:bg-white/[0.01] transition-colors group">
                                {/* Position */}
                                <div className="flex flex-col items-center justify-center min-w-[60px]">
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center font-black text-lg
                                        ${index === 0 ? 'bg-gold text-black shadow-lg shadow-gold/20' :
                                            index === 1 ? 'bg-zinc-300 text-black' :
                                                index === 2 ? 'bg-amber-700 text-white' : 'text-zinc-500 border border-white/10'}
                                    `}>
                                        {index + 1}
                                    </div>
                                </div>

                                {/* Main Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter bg-white/5 px-1.5 py-0.5 rounded">
                                            {project.culturalCategory}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white truncate group-hover:text-gold transition-colors">
                                        {project.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-zinc-500 text-sm">
                                        <User size={12} /> {project.proponentName}
                                    </div>
                                </div>

                                {/* Score & Budget */}
                                <div className="text-right flex items-center gap-8">
                                    <div className="hidden md:block">
                                        <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-1 text-right">Budget</div>
                                        <div className="text-white font-mono font-bold text-sm">
                                            {formatCurrency(project.approvedBudget)}
                                        </div>
                                    </div>

                                    {results.showScores && (
                                        <div className="bg-white/5 px-4 py-3 rounded-2xl border border-white/5 text-center min-w-[80px]">
                                            <div className="text-[10px] text-purple-400 font-black uppercase tracking-tighter mb-0.5">Score</div>
                                            <div className="text-2xl font-black text-white leading-none">
                                                {project.finalScore?.toFixed(1) || 'N/A'}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="mt-8 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
                <TrendingUp size={24} className="text-blue-400 shrink-0" />
                <p className="text-xs text-blue-400/80 leading-relaxed">
                    <strong>Nota sobre o Ranking:</strong> A classificação final é composta pela média ponderada entre a análise técnica da Inteligência Artificial (critérios objetivos e aderência ao edital) e a avaliação do Comitê de Cultura (critérios subjetivos e mérito cultural).
                </p>
            </div>
        </div>
    );
};
