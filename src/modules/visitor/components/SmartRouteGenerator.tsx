import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Clock, Loader, MapPin, Play } from "lucide-react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export const SmartRouteGenerator: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [result, setResult] = useState<any[] | null>(null);
    const [time, setTime] = useState(30);
    const [interests, setInterests] = useState<string[]>([]);

    const availableInterests = [
        "História", "Arte Moderna", "Esculturas", "Pintura", "Curiosidades", "Fotografia"
    ];

    const toggleInterest = (interest: string) => {
        setInterests(prev =>
            prev.includes(interest)
                ? prev.filter(i => i !== interest)
                : [...prev, interest]
        );
    };

    const handleGenerate = async () => {
        if (!tenantId) return;
        setLoading(true);
        setResult(null);

        try {
            // Using REAL AI Endpoint
            const res = await api.post("/ai/itinerary", {
                tenantId,
                preferences: {
                    timeAvailable: time,
                    interests: interests.length > 0 ? interests : ["Destaques"],
                    accessibility: []
                }
            });
            setResult(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStart = () => {
        if (result && result.length > 0) {
            // Navigate to first work
            navigate(`/obras/${result[0].id}`);
        }
    };

    return (
        <div className="smart-route-card" style={{
            background: "linear-gradient(135deg, #1e1e24 0%, #15151a 100%)",
            borderRadius: "1rem",
            padding: "1.5rem",
            marginBottom: "2rem",
            border: "1px solid rgba(212, 175, 55, 0.2)",
            color: "white"
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                <div style={{ background: "rgba(212, 175, 55, 0.15)", padding: "0.8rem", borderRadius: "50%" }}>
                    <Clock size={24} color="#d4af37" />
                </div>
                <div>
                    <h2 style={{ fontSize: "1.2rem", color: "#d4af37", fontFamily: "serif" }}>
                        {t("visitor.smartRoute.title")}
                    </h2>
                    <p style={{ fontSize: "0.9rem", opacity: 0.7 }}>
                        {t("visitor.smartRoute.subtitle")}
                    </p>
                </div>
            </div>

            {!result ? (
                <div>
                    <p style={{ fontSize: "0.85rem", marginBottom: "0.5rem", color: "#aaa" }}>Tempo Disponível:</p>
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
                        {[15, 30, 45, 60, 90, 120].map(m => (
                            <button
                                key={m}
                                onClick={() => setTime(m)}
                                style={{
                                    padding: "0.5rem 1rem",
                                    borderRadius: "2rem",
                                    border: time === m ? "1px solid #d4af37" : "1px solid rgba(255,255,255,0.1)",
                                    background: time === m ? "#d4af37" : "transparent",
                                    color: time === m ? "black" : "white",
                                    fontWeight: time === m ? "bold" : "normal",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                {m} min
                            </button>
                        ))}
                    </div>

                    <p style={{ fontSize: "0.85rem", marginBottom: "0.5rem", color: "#aaa" }}>Interesses:</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
                        {availableInterests.map(i => (
                            <button
                                key={i}
                                onClick={() => toggleInterest(i)}
                                style={{
                                    padding: "0.4rem 0.8rem",
                                    borderRadius: "8px",
                                    border: interests.includes(i) ? "1px solid #8b5cf6" : "1px solid rgba(255,255,255,0.1)",
                                    background: interests.includes(i) ? "rgba(139, 92, 246, 0.2)" : "rgba(255,255,255,0.05)",
                                    color: interests.includes(i) ? "#a78bfa" : "white",
                                    cursor: "pointer",
                                    fontSize: "0.85rem"
                                }}
                            >
                                {i}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="btn-primary-gold"
                        style={{
                            width: "100%",
                            padding: "1rem",
                            borderRadius: "0.8rem",
                            background: "linear-gradient(to right, #d4af37, #b4932a)",
                            color: "#1a1108",
                            fontWeight: "bold",
                            border: "none",
                            cursor: loading ? "not-allowed" : "pointer",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "0.5rem"
                        }}
                    >
                        {loading ? <Loader className="spin" size={20} /> : t("visitor.smartRoute.generate")}
                    </button>
                </div>
            ) : (
                <div className="smart-route-result animate-fade-in">
                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "0.8rem", padding: "1rem", marginBottom: "1rem" }}>
                        <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Roteiro Sugerido</h3>
                        <p style={{ fontSize: "0.9rem", color: "#ccc", marginBottom: "1rem" }}>
                            Baseado em {interests.join(", ") || "seus interesses"} e {time} min.
                        </p>

                        <div style={{ display: "flex", gap: "1rem", fontSize: "0.9rem", color: "#d4af37" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                <Clock size={16} /> ~{time} min
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                <MapPin size={16} /> {result.length} obras
                            </span>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button
                            onClick={() => setResult(null)}
                            style={{ flex: 1, padding: "0.8rem", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "0.5rem", color: "white", cursor: "pointer" }}
                        >
                            {t("visitor.smartRoute.tryAgain")}
                        </button>
                        <button
                            onClick={handleStart}
                            style={{ flex: 1, padding: "0.8rem", background: "#d4af37", border: "none", borderRadius: "0.5rem", color: "#000", fontWeight: "bold", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}
                        >
                            <Play size={18} fill="black" /> {t("visitor.smartRoute.start")}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
