import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

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

    useEffect(() => {
        const preferences = JSON.parse(localStorage.getItem("itinerary_preferences") || "{}");

        // Mock logic to generate itinerary based on preferences
        // In a real app, this would call an API or use a more sophisticated algorithm
        setTimeout(() => {
            const allWorks: Work[] = [
                { id: "1", title: "A Noite Estrelada", artist: "Vincent van Gogh", category: "Pintura", room: "Sala 1" },
                { id: "2", title: "Mona Lisa", artist: "Leonardo da Vinci", category: "Pintura", room: "Sala 2" },
                { id: "3", title: "O Pensador", artist: "Auguste Rodin", category: "Escultura", room: "Jardim" },
                { id: "4", title: "Guernica", artist: "Pablo Picasso", category: "Moderno", room: "Sala 3" },
                { id: "5", title: "Persistência da Memória", artist: "Salvador Dalí", category: "Moderno", room: "Sala 3" },
            ];

            let filtered = allWorks;

            // Filter by interests if selected
            if (preferences.interests && preferences.interests.length > 0) {
                filtered = allWorks.filter(w => preferences.interests.includes(w.category));
            }

            // Limit based on time (approx 15 min per work)
            const maxWorks = Math.floor((preferences.timeAvailable || 60) / 15);
            setItinerary(filtered.slice(0, maxWorks));
            setLoading(false);
        }, 1500); // Simulate processing
    }, []);

    if (loading) {
        return (
            <div className="page-container" style={{ textAlign: "center", marginTop: "4rem" }}>
                <div className="spinner" style={{ fontSize: "3rem" }}>🤖</div>
                <h2>{t("visitor.itinerary.generating", "Criando seu roteiro personalizado...")}</h2>
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
                {itinerary.map((work, index) => (
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
                ))}
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
