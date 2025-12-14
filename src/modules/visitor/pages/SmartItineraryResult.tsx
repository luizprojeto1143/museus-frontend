import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

interface Work {
    id: string;
    title: string;
    artist: string;
    category: string;
    room: string;
    imageUrl?: string;
}

export const SmartItineraryResult: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [itinerary, setItinerary] = useState<Work[]>([]);
    const [loading, setLoading] = useState(true);

    const { tenantId } = useAuth();

    useEffect(() => {
        const generate = async () => {
            const preferences = JSON.parse(localStorage.getItem("itinerary_preferences") || "{}");
            if (!tenantId) return;

            try {
                const res = await api.post("/ai/itinerary", {
                    tenantId,
                    preferences
                });
                setItinerary(res.data);
            } catch (error) {
                console.error("Failed to generate itinerary", error);
                // Fallback mock if API fails
                setItinerary([]);
            } finally {
                setLoading(false);
            }
        };

        generate();
    }, [tenantId]);

    if (loading) {
        return (
            <div className="page-container" style={{ textAlign: "center", marginTop: "4rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                <div className="spinner" style={{ width: "50px", height: "50px", border: "4px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                <h2>{t("visitor.itinerary.generating", "Criando seu roteiro personalizado...")}</h2>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="page-container">
            <header style={{ marginBottom: "2rem" }}>
                <h1 className="page-title">{t("visitor.itinerary.resultTitle", "Seu Roteiro Personalizado")}</h1>
                <p className="page-subtitle">
                    {t("visitor.itinerary.resultSubtitle", "Baseado nos seus interesses e tempo disponível.")}
                </p>
            </header>

            <div className="timeline" style={{ position: "relative", paddingLeft: "2rem", borderLeft: "2px solid var(--border)" }}>
                {itinerary.length === 0 ? (
                    <div style={{ padding: "2rem", background: "var(--bg-card)", borderRadius: "0.5rem", border: "1px solid var(--border)" }}>
                        <p>{t("visitor.itinerary.empty", "Não encontramos obras correspondentes a todas as suas preferências. Tente ajustar os filtros.")}</p>
                    </div>
                ) : (
                    itinerary.map((work, index) => (
                        <div key={work.id} style={{ marginBottom: "2rem", position: "relative" }}>
                            <div
                                style={{
                                    position: "absolute",
                                    left: "-2.6rem",
                                    top: "0",
                                    width: "1.2rem",
                                    height: "1.2rem",
                                    borderRadius: "50%",
                                    backgroundColor: "var(--primary)",
                                    border: "4px solid var(--bg-main)"
                                }}
                            />
                            <div className="card">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                                    <div>
                                        <h3 className="card-title">{index + 1}. {work.title}</h3>
                                        <p className="card-subtitle">{work.artist} • {work.room}</p>
                                    </div>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => navigate(`/obras/${work.id}`)}
                                    >
                                        {t("common.details", "Ver Detalhes")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate("/mapa")}>
                    {t("visitor.itinerary.start", "Iniciar Roteiro no Mapa")}
                </button>
                <button className="btn btn-secondary" onClick={() => navigate("/roteiro-inteligente")}>
                    {t("visitor.itinerary.new", "Criar Novo Roteiro")}
                </button>
            </div>
        </div>
    );
};
