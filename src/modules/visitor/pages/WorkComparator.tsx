import { logger } from "@/utils/logger";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, ArrowLeftRight, ChevronDown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./WorkComparator.css";

export const WorkComparator: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [works, setWorks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [leftId, setLeftId] = useState<string>("");
    const [rightId, setRightId] = useState<string>("");

    const fetchWorks = useCallback(async () => {
        try {
            const res = await api.get(`/works?tenantId=${tenantId}`);
            const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setWorks(list);
        } catch (error) {
            logger.error(error);
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        if (tenantId) fetchWorks();
    }, [tenantId, fetchWorks]);

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="animate-spin text-gold" size={40} />
        </div>
    );

    const leftWork = works.find(w => w.id === leftId);
    const rightWork = works.find(w => w.id === rightId);

    const CompareRow = ({ label, left, right }: { label: string; left?: string | null; right?: string | null }) => (
        <div className="compare-row-premium">
            <span className="compare-val-left">{left || "—"}</span>
            <span className="compare-label-premium">{label}</span>
            <span className="compare-val-right">{right || "—"}</span>
        </div>
    );

    return (
        <div className="comparator-container-premium">
            <header className="comparator-header-premium">
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="comparator-badge"
                >
                    <Sparkles size={14} className="inline mr-2" />
                    Análise Comparativa
                </motion.div>
                <h1 className="comparator-title-premium">Dualidade <span className="text-gold italic">Artística</span></h1>
                <p className="comparator-subtitle-premium">
                    Coloque duas obras em diálogo e descubra convergências técnicas e estilísticas entre diferentes eras.
                </p>
                <div className="gold-divider-center" />
            </header>

            <div className="comparator-selectors-grid">
                <div className="selector-box-premium">
                    <label>Obra Primária</label>
                    <div className="select-wrapper-premium">
                        <select value={leftId} onChange={e => setLeftId(e.target.value)}>
                            <option value="">Selecione...</option>
                            {works.filter(w => w.id !== rightId).map(w => (
                                <option key={w.id} value={w.id}>{w.title}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="select-icon" />
                    </div>
                </div>

                <div className="selector-box-premium">
                    <label>Obra Secundária</label>
                    <div className="select-wrapper-premium">
                        <select value={rightId} onChange={e => setRightId(e.target.value)}>
                            <option value="">Selecione...</option>
                            {works.filter(w => w.id !== leftId).map(w => (
                                <option key={w.id} value={w.id}>{w.title}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="select-icon" />
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {leftWork && rightWork ? (
                    <motion.div 
                        key="comparison"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="comparison-card-premium"
                    >
                        <div className="comparison-visuals-grid">
                            <div className="work-side-premium">
                                <div className="work-img-frame">
                                    <img src={leftWork.imageUrl} alt={leftWork.title} />
                                    <div className="work-img-overlay" />
                                </div>
                                <div className="work-meta-overlay">
                                    <h3>{leftWork.title}</h3>
                                    <p>{leftWork.artist}</p>
                                </div>
                            </div>

                            <div className="vs-divider-premium">
                                <div className="vs-line" />
                                <span className="vs-text">VS</span>
                                <div className="vs-line" />
                            </div>

                            <div className="work-side-premium">
                                <div className="work-img-frame">
                                    <img src={rightWork.imageUrl} alt={rightWork.title} />
                                    <div className="work-img-overlay" />
                                </div>
                                <div className="work-meta-overlay">
                                    <h3>{rightWork.title}</h3>
                                    <p>{rightWork.artist}</p>
                                </div>
                            </div>
                        </div>

                        <div className="comparison-stats-table">
                            <CompareRow label="Artista" left={leftWork.artist} right={rightWork.artist} />
                            <CompareRow label="Ano" left={leftWork.year} right={rightWork.year} />
                            <CompareRow label="Período" left={leftWork.period} right={rightWork.period} />
                            <CompareRow label="Técnica" left={leftWork.technique} right={rightWork.technique} />
                            <CompareRow label="Suporte" left={leftWork.medium} right={rightWork.medium} />
                            <CompareRow label="Dimensões" left={leftWork.dimensions} right={rightWork.dimensions} />
                        </div>

                        <div className="comparison-descriptions-grid">
                            <div className="desc-box-premium">
                                <label>Gênese e Contexto</label>
                                <p>{leftWork.description || "Sem descrição disponível para análise."}</p>
                            </div>
                            <div className="desc-box-premium">
                                <label>Gênese e Contexto</label>
                                <p>{rightWork.description || "Sem descrição disponível para análise."}</p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="comparator-empty-state"
                    >
                        <div className="empty-icon-wrapper">
                            <ArrowLeftRight size={32} />
                        </div>
                        <h3>Aguardando Seleção</h3>
                        <p>Escolha duas relíquias do acervo acima para iniciar o processo de análise comparativa.</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
