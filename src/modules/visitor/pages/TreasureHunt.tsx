import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useGamification } from "../../gamification/context/GamificationContext";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Camera, Check } from "lucide-react";
import "./TreasureHunt.css";

interface Clue {
    id: string;
    riddle: string;
    targetWorkId: string;
    xpReward: number;
    isActive: boolean;
}

export const TreasureHunt: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { addXp } = useGamification();
    const [clues, setClues] = useState<Clue[]>([]);
    const [solvedClues, setSolvedClues] = useState<string[]>([]);
    const [answeringClueId, setAnsweringClueId] = useState<string | null>(null);
    const [answerInput, setAnswerInput] = useState("");
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [loading, setLoading] = useState(true);

    const { tenantId } = useAuth();

    const loadTreasureHunt = useCallback(async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const res = await api.get("/gamification/treasure-hunt", { params: { tenantId } });
            setClues(res.data.clues || []);
            setSolvedClues(res.data.solved || []);
        } catch {
            console.error("Error loading treasure hunt");
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        loadTreasureHunt();
    }, [loadTreasureHunt]);

    const handleSolveClick = (clueId: string) => {
        setAnsweringClueId(clueId);
        setAnswerInput("");
        setFeedback(null);
    };

    const handleCancelAnswer = () => {
        setAnsweringClueId(null);
        setAnswerInput("");
        setFeedback(null);
    };

    const handleSubmitAnswer = async (clue: Clue) => {
        if (!answerInput.trim()) return;

        try {
            const res = await api.post(`/gamification/treasure-hunt/${clue.id}/solve`, {
                answer: answerInput,
                tenantId
            });

            if (res.data.success) {
                setFeedback({ type: 'success', message: t("visitor.treasure.correct", "Correto! +{xp} XP", { xp: clue.xpReward }) });
                addXp(clue.xpReward);
                setSolvedClues([...solvedClues, clue.id]);
                setTimeout(() => {
                    setAnsweringClueId(null);
                }, 2000);
            } else {
                setFeedback({ type: 'error', message: t("visitor.treasure.incorrect", "Resposta incorreta. Tente novamente.") });
            }
        } catch {
            setFeedback({ type: 'error', message: t("common.error") });
        }
    };

    if (loading) {
        return (
            <div className="treasure-loading">
                <div className="treasure-spinner"></div>
                <p>{t("common.loading")}</p>
            </div>
        );
    }

    return (
        <div className="treasure-hunt-container">
            <header className="treasure-hunt-header">
                <h1 className="treasure-hunt-title">{t("visitor.treasure.title", "Caça ao Tesouro")}</h1>
                <p className="treasure-hunt-subtitle">{t("visitor.treasure.subtitle", "Decifre as pistas e encontre as obras escondidas!")}</p>
            </header>

            {clues.length === 0 ? (
                <div className="treasure-empty">
                    <span className="treasure-empty-icon">🗺️</span>
                    <h3>{t("visitor.treasure.noCluesTitle", "Sem pistas no momento")}</h3>
                    <p>{t("visitor.treasure.noClues", "O museu ainda não criou pistas para a caça ao tesouro. Volte mais tarde!")}</p>
                </div>
            ) : (
                <div className="treasure-clues-grid">
                    {clues.map((clue) => {
                        const isSolved = solvedClues.includes(clue.id);
                        const isAnswering = answeringClueId === clue.id;

                        return (
                            <div
                                key={clue.id}
                                className={`treasure-clue-card ${isSolved ? 'solved' : ''}`}
                            >
                                <div className="treasure-clue-header">
                                    <div className="treasure-clue-info">
                                        <h3 className={isSolved ? 'solved' : ''}>
                                            {isSolved ? <><Check size={18} /> {t("common.solved", "Resolvido!")}</> : <>🕵️ {t("visitor.treasure.clue", "Pista")}</>}
                                        </h3>
                                        <p className="treasure-clue-riddle">{clue.riddle}</p>
                                    </div>
                                    <span className="treasure-xp-badge">+{clue.xpReward} XP</span>
                                </div>

                                {isSolved && (
                                    <div className="treasure-solved-message">
                                        <Check size={16} />
                                        {t("visitor.treasure.completed", "Você encontrou o tesouro!")}
                                    </div>
                                )}

                                {!isSolved && !isAnswering && (
                                    <button
                                        onClick={() => handleSolveClick(clue.id)}
                                        className="treasure-solve-btn"
                                    >
                                        {t("visitor.treasure.solve", "Responder")}
                                    </button>
                                )}

                                {isAnswering && (
                                    <div className="treasure-answer-form">
                                        <span className="treasure-answer-label">
                                            {t("visitor.treasure.enterId", "Digite o ID da obra ou escaneie o QR Code:")}
                                        </span>

                                        <div className="treasure-answer-input-row">
                                            <input
                                                type="text"
                                                className="treasure-answer-input"
                                                placeholder="Ex: 1"
                                                value={answerInput}
                                                onChange={(e) => setAnswerInput(e.target.value)}
                                            />
                                            <button
                                                onClick={() => navigate("/scanner")}
                                                className="treasure-scan-btn"
                                                title="Escanear QR Code"
                                            >
                                                <Camera size={18} />
                                            </button>
                                        </div>

                                        {feedback && (
                                            <div className={`treasure-feedback ${feedback.type}`}>
                                                {feedback.message}
                                            </div>
                                        )}

                                        <div className="treasure-answer-actions">
                                            <button
                                                onClick={() => handleSubmitAnswer(clue)}
                                                className="treasure-confirm-btn"
                                            >
                                                {t("common.confirm", "Confirmar")}
                                            </button>
                                            <button
                                                onClick={handleCancelAnswer}
                                                className="treasure-cancel-btn"
                                            >
                                                {t("common.cancel", "Cancelar")}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TreasureHunt;
