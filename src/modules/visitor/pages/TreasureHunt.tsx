import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useGamification } from "../../gamification/context/GamificationContext";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

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

    useEffect(() => {
        if (tenantId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoading(true);
            api.get("/gamification/treasure-hunt", { params: { tenantId } })
                .then(res => {
                    setClues(res.data.clues || []);
                    setSolvedClues(res.data.solved || []);
                })
                .catch(() => console.error("Error loading treasure hunt"))
                .finally(() => setLoading(false));
        }
    }, [tenantId]);

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
            <div style={{ padding: "2rem", textAlign: "center" }}>
                <div className="spinner" style={{ width: "40px", height: "40px", border: "4px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }}></div>
                <p>{t("common.loading")}</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="page-container">
            <h1 className="section-title">{t("visitor.treasure.title", "Caça ao Tesouro")}</h1>
            <p className="section-subtitle">{t("visitor.treasure.subtitle", "Decifre as pistas e encontre as obras escondidas!")}</p>

            {clues.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🗺️</div>
                    <h3>{t("visitor.treasure.noCluesTitle", "Sem pistas no momento")}</h3>
                    <p style={{ color: "#6b7280" }}>
                        {t("visitor.treasure.noClues", "O museu ainda não criou pistas para a caça ao tesouro. Volte mais tarde!")}
                    </p>
                </div>
            ) : (
                <div className="card-grid">
                    {clues.map((clue) => {
                        const isSolved = solvedClues.includes(clue.id);
                        const isAnswering = answeringClueId === clue.id;

                        return (
                            <div
                                key={clue.id}
                                className="card"
                                style={{
                                    borderLeft: isSolved ? "4px solid #10b981" : "4px solid #f59e0b",
                                    opacity: isSolved ? 0.8 : 1,
                                    transition: "all 0.3s ease"
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                                    <div>
                                        <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem" }}>
                                            {isSolved ? "✅ " + t("common.solved", "Resolvido!") : "🕵️ " + t("visitor.treasure.clue", "Pista")}
                                        </h3>
                                        <p style={{ fontSize: "1rem", color: "var(--text-primary)" }}>{clue.riddle}</p>
                                    </div>
                                    <div className="badge badge-primary">+{clue.xpReward} XP</div>
                                </div>

                                {isSolved && (
                                    <div style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#10b981", fontWeight: "bold" }}>
                                        {t("visitor.treasure.completed", "Você encontrou o tesouro!")}
                                    </div>
                                )}

                                {!isSolved && !isAnswering && (
                                    <button
                                        onClick={() => handleSolveClick(clue.id)}
                                        className="btn btn-primary"
                                        style={{ marginTop: "1rem", width: "100%" }}
                                    >
                                        {t("visitor.treasure.solve", "Responder")}
                                    </button>
                                )}

                                {isAnswering && (
                                    <div style={{ marginTop: "1rem", padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "0.5rem" }}>
                                        <p style={{ marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                                            {t("visitor.treasure.enterId", "Digite o ID da obra ou escaneie o QR Code:")}
                                        </p>

                                        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                            <input
                                                type="text"
                                                className="input"
                                                style={{ flex: 1 }}
                                                placeholder="Ex: 1"
                                                value={answerInput}
                                                onChange={(e) => setAnswerInput(e.target.value)}
                                            />
                                            <button
                                                onClick={() => navigate("/scanner")}
                                                className="btn btn-secondary"
                                                title="Escanear QR Code"
                                            >
                                                📷
                                            </button>
                                        </div>

                                        {feedback && (
                                            <div style={{
                                                marginBottom: "0.5rem",
                                                color: feedback.type === 'success' ? '#10b981' : '#ef4444',
                                                fontSize: "0.9rem"
                                            }}>
                                                {feedback.message}
                                            </div>
                                        )}

                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <button
                                                onClick={() => handleSubmitAnswer(clue)}
                                                className="btn btn-primary"
                                                style={{ flex: 1 }}
                                            >
                                                {t("common.confirm", "Confirmar")}
                                            </button>
                                            <button
                                                onClick={handleCancelAnswer}
                                                className="btn btn-secondary"
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
