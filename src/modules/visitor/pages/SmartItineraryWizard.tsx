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
                            {["Pintura", "Escultura", "História", "Moderno", "Interativo"].map((interest) => (
                                <label key={interest} className="card" style={{ cursor: "pointer", border: preferences.interests.includes(interest) ? "2px solid var(--primary)" : "1px solid var(--border)" }}>
                                    <input
                                        type="checkbox"
                                        checked={preferences.interests.includes(interest)}
                                        onChange={(e) => {
                                            const newInterests = e.target.checked
                                                ? [...preferences.interests, interest]
                                                : preferences.interests.filter(i => i !== interest);
                                            setPreferences({ ...preferences, interests: newInterests });
                                        }}
                                        style={{ marginRight: "0.5rem" }}
                                    />
                                    {interest}
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
                            {["Cadeirante", "Deficiência Visual", "Deficiência Auditiva", "Neurodivergente"].map((acc) => (
                                <label key={acc} className="card" style={{ cursor: "pointer", border: preferences.accessibility.includes(acc) ? "2px solid var(--primary)" : "1px solid var(--border)" }}>
                                    <input
                                        type="checkbox"
                                        checked={preferences.accessibility.includes(acc)}
                                        onChange={(e) => {
                                            const newAcc = e.target.checked
                                                ? [...preferences.accessibility, acc]
                                                : preferences.accessibility.filter(a => a !== acc);
                                            setPreferences({ ...preferences, accessibility: newAcc });
                                        }}
                                        style={{ marginRight: "0.5rem" }}
                                    />
                                    {acc}
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
