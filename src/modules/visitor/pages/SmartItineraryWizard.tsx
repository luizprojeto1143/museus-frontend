import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface Preferences {
    timeAvailable: number; // minutes
    interests: string[];
    accessibility: string[];
}

export const SmartItineraryWizard: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [preferences, setPreferences] = useState<Preferences>({
        timeAvailable: 60,
        interests: [],
        accessibility: []
    });

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const generateItinerary = () => {
        // Save preferences and navigate to result
        localStorage.setItem("itinerary_preferences", JSON.stringify(preferences));
        navigate("/roteiro-inteligente/resultado");
    };

    return (
        <div className="page-container">
            <h1 className="page-title">{t("visitor.itinerary.title", "Planeje sua Visita")}</h1>

            <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
                {step === 1 && (
                    <div>
                        <h2 className="card-title">{t("visitor.itinerary.timeQuestion", "Quanto tempo você tem?")}</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                            {[30, 60, 90, 120].map((time) => (
                                <button
                                    key={time}
                                    className={`btn ${preferences.timeAvailable === time ? "btn-primary" : "btn-secondary"}`}
                                    onClick={() => setPreferences({ ...preferences, timeAvailable: time })}
                                >
                                    {time} {t("common.minutes", "minutos")}
                                </button>
                            ))}
                        </div>
                        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
                            <button className="btn btn-primary" onClick={handleNext}>{t("common.next", "Próximo")}</button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h2 className="card-title">{t("visitor.itinerary.interestsQuestion", "O que você gosta?")}</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                            {[
                                { id: "Pintura", label: t("visitor.interests.painting", "Pintura") },
                                { id: "Escultura", label: t("visitor.interests.sculpture", "Escultura") },
                                { id: "História", label: t("visitor.interests.history", "História") },
                                { id: "Moderno", label: t("visitor.interests.modern", "Moderno") },
                                { id: "Interativo", label: t("visitor.interests.interactive", "Interativo") }
                            ].map((interest) => (
                                <label key={interest.id} className="card" style={{ cursor: "pointer", border: preferences.interests.includes(interest.id) ? "2px solid var(--primary)" : "1px solid var(--border)" }}>
                                    <input
                                        type="checkbox"
                                        checked={preferences.interests.includes(interest.id)}
                                        onChange={(e) => {
                                            const newInterests = e.target.checked
                                                ? [...preferences.interests, interest.id]
                                                : preferences.interests.filter(i => i !== interest.id);
                                            setPreferences({ ...preferences, interests: newInterests });
                                        }}
                                        style={{ marginRight: "0.5rem" }}
                                    />
                                    {interest.label}
                                </label>
                            ))}
                        </div>
                        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
                            <button className="btn btn-secondary" onClick={handleBack}>{t("common.back", "Voltar")}</button>
                            <button className="btn btn-primary" onClick={handleNext}>{t("common.next", "Próximo")}</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <h2 className="card-title">{t("visitor.itinerary.accessibilityQuestion", "Necessidades de Acessibilidade")}</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                            {[
                                { id: "Cadeirante", label: t("visitor.accessibility.wheelchair", "Cadeirante") },
                                { id: "Deficiência Visual", label: t("visitor.accessibility.visual", "Deficiência Visual") },
                                { id: "Deficiência Auditiva", label: t("visitor.accessibility.hearing", "Deficiência Auditiva") },
                                { id: "Neurodivergente", label: t("visitor.accessibility.neuro", "Neurodivergente") }
                            ].map((acc) => (
                                <label key={acc.id} className="card" style={{ cursor: "pointer", border: preferences.accessibility.includes(acc.id) ? "2px solid var(--primary)" : "1px solid var(--border)" }}>
                                    <input
                                        type="checkbox"
                                        checked={preferences.accessibility.includes(acc.id)}
                                        onChange={(e) => {
                                            const newAcc = e.target.checked
                                                ? [...preferences.accessibility, acc.id]
                                                : preferences.accessibility.filter(a => a !== acc.id);
                                            setPreferences({ ...preferences, accessibility: newAcc });
                                        }}
                                        style={{ marginRight: "0.5rem" }}
                                    />
                                    {acc.label}
                                </label>
                            ))}
                        </div>
                        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
                            <button className="btn btn-secondary" onClick={handleBack}>{t("common.back", "Voltar")}</button>
                            <button className="btn btn-primary" onClick={generateItinerary}>{t("visitor.itinerary.generate", "Gerar Roteiro")}</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
