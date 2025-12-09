import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGamification } from "../../gamification/context/GamificationContext";

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
    const [searchParams, setSearchParams] = useSearchParams();
    const { addXp } = useGamification();
    const [clues, setClues] = useState<Clue[]>([]);
    const [solvedClues, setSolvedClues] = useState<string[]>([]);

    // Interaction state
    const [answeringClueId, setAnsweringClueId] = useState<string | null>(null);
    const [answerInput, setAnswerInput] = useState("");
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        // Load clues
        const storedClues = JSON.parse(localStorage.getItem("treasure_clues") || "[]");
        const activeClues = storedClues.filter((c: Clue) => c.isActive);
        setClues(activeClues);

        // Load solved status
        const solved = JSON.parse(localStorage.getItem("treasure_solved") || "[]");
        setSolvedClues(solved);

        // Check for scanned ID from scanner return
        const scannedId = searchParams.get("scannedId");
        const clueId = searchParams.get("clueId");

        if (scannedId && clueId) {
            const clue = activeClues.find((c: Clue) => c.id === clueId);
            if (clue) {
                setAnsweringClueId(clueId);
                setAnswerInput(scannedId);

                // Auto submit after a short delay to show the input
                setTimeout(() => {
                    const normalizedInput = scannedId.trim().toLowerCase();
                    const normalizedTarget = clue.targetWorkId.trim().toLowerCase();

                    if (normalizedInput === normalizedTarget) {
                        if (!solved.includes(clue.id)) {
                            const newSolved = [...solved, clue.id];
                            setSolvedClues(newSolved);
                            localStorage.setItem("treasure_solved", JSON.stringify(newSolved));
                            addXp(clue.xpReward);
                            setFeedback({ type: 'success', message: t("visitor.treasure.correct", "Parabéns! Você encontrou o tesouro!") });
                        }
                    } else {
                        setFeedback({ type: 'error', message: t("visitor.treasure.incorrect", "Resposta incorreta. Tente novamente.") });
                    }

                    // Clean URL
                    setSearchParams({});
                }, 500);
            }
        }
    }, [searchParams, setSearchParams, addXp, t]);

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

    const handleSubmitAnswer = (clue: Clue) => {
        const normalizedInput = answerInput.trim().toLowerCase();
        const normalizedTarget = clue.targetWorkId.trim().toLowerCase();

        if (normalizedInput === normalizedTarget) {
            // Correct!
            const newSolved = [...solvedClues, clue.id];
            setSolvedClues(newSolved);
            localStorage.setItem("treasure_solved", JSON.stringify(newSolved));

            addXp(clue.xpReward);
            setFeedback({ type: 'success', message: t("visitor.treasure.correct", "Parabéns! Você encontrou o tesouro!") });

            setTimeout(() => {
                setAnsweringClueId(null);
                setFeedback(null);
            }, 2000);
        } else {
            // Incorrect
            setFeedback({ type: 'error', message: t("visitor.treasure.incorrect", "Resposta incorreta. Tente novamente.") });
        }
    };

    return (
        <div className="page-container">
            <h1 className="page-title">🏴‍☠️ {t("visitor.treasure.title", "Caça ao Tesouro")}</h1>
            <p className="page-subtitle">
                {t("visitor.treasure.subtitle", "Decifre as charadas, encontre as obras e ganhe recompensas!")}
            </p>

            <div style={{ display: "grid", gap: "1rem", marginTop: "2rem" }}>
                {clues.length === 0 && (
                    <p style={{ textAlign: "center", color: "#6b7280" }}>
                        {t("visitor.treasure.noClues", "Nenhuma pista disponível no momento.")}
                    </p>
                )}

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
        </div>
    );
};

export default TreasureHunt;
