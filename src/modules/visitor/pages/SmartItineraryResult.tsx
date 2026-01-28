import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { MapPin, RefreshCw, Eye } from "lucide-react";
import "./SmartItinerary.css";

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
                setItinerary([]);
            } finally {
                setLoading(false);
            }
        };

        generate();
    }, [tenantId]);

    if (loading) {
        return (
            <div className="itinerary-result-container">
                <div className="itinerary-loading">
                    <div className="itinerary-loading-spinner"></div>
                    <h2>{t("visitor.itinerary.generating", "Criando seu roteiro personalizado...")}</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="itinerary-result-container">
            <header className="itinerary-result-header">
                <h1 className="itinerary-result-title">
                    📍 {t("visitor.itinerary.resultTitle", "Seu Roteiro Personalizado")}
                </h1>
                <p className="itinerary-result-subtitle">
                    {t("visitor.itinerary.resultSubtitle", "Baseado nos seus interesses e tempo disponível.")}
                </p>
            </header>

            <div className="itinerary-timeline">
                {itinerary.length === 0 ? (
                    <div className="itinerary-empty">
                        <p>{t("visitor.itinerary.empty", "Não encontramos obras correspondentes a todas as suas preferências. Tente ajustar os filtros.")}</p>
                    </div>
                ) : (
                    itinerary.map((work, index) => (
                        <div key={work.id} className="itinerary-result-card">
                            <div className="itinerary-stop">
                                <div className="itinerary-stop-number">{index + 1}</div>
                                <div className="itinerary-stop-info">
                                    <h3>{work.title}</h3>
                                    <p>{work.artist} • {work.room}</p>
                                    <span className="itinerary-stop-duration">~10 min</span>
                                </div>
                            </div>
                            <button
                                className="itinerary-details-btn"
                                onClick={() => navigate(`/obras/${work.id}`)}
                            >
                                <Eye size={16} />
                                {t("common.details", "Ver Detalhes")}
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="itinerary-actions">
                <button className="itinerary-start-btn" onClick={() => navigate("/mapa")}>
                    <MapPin size={18} />
                    {t("visitor.itinerary.start", "Iniciar Roteiro no Mapa")}
                </button>
                <button className="itinerary-new-btn" onClick={() => navigate("/roteiro-inteligente")}>
                    <RefreshCw size={16} />
                    {t("visitor.itinerary.new", "Criar Novo Roteiro")}
                </button>
            </div>
        </div>
    );
};
