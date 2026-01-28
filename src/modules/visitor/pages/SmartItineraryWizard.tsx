import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Sparkles } from "lucide-react";
import "./SmartItinerary.css";

interface Preferences {
    timeAvailable: number;
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
        localStorage.setItem("itinerary_preferences", JSON.stringify(preferences));
        navigate("/roteiro-inteligente/resultado");
    };

    const timeOptions = [30, 60, 90, 120];
    const interestOptions = [
        { id: "Pintura", label: t("visitor.interests.painting", "Pintura") },
        { id: "Escultura", label: t("visitor.interests.sculpture", "Escultura") },
        { id: "História", label: t("visitor.interests.history", "História") },
        { id: "Moderno", label: t("visitor.interests.modern", "Moderno") },
        { id: "Interativo", label: t("visitor.interests.interactive", "Interativo") }
    ];
    const accessibilityOptions = [
        { id: "Cadeirante", label: t("visitor.accessibility.wheelchair", "Cadeirante") },
        { id: "Deficiência Visual", label: t("visitor.accessibility.visual", "Deficiência Visual") },
        { id: "Deficiência Auditiva", label: t("visitor.accessibility.hearing", "Deficiência Auditiva") },
        { id: "Neurodivergente", label: t("visitor.accessibility.neuro", "Neurodivergente") }
    ];

    return (
        <div className="itinerary-container">
            <header className="itinerary-header">
                <h1 className="itinerary-title">{t("visitor.itinerary.title", "Planeje sua Visita")}</h1>
            </header>

            <div className="itinerary-card">
                {/* Progress */}
                <div className="itinerary-progress">
                    {[1, 2, 3].map(s => (
                        <div
                            key={s}
                            className={`itinerary-progress-step ${step === s ? 'active' : ''} ${step > s ? 'completed' : ''}`}
                        ></div>
                    ))}
                </div>

                {/* Step 1: Time */}
                {step === 1 && (
                    <div>
                        <h2 className="itinerary-step-title">{t("visitor.itinerary.timeQuestion", "Quanto tempo você tem?")}</h2>
                        <div className="itinerary-time-options">
                            {timeOptions.map(time => (
                                <button
                                    key={time}
                                    className={`itinerary-time-btn ${preferences.timeAvailable === time ? 'selected' : ''}`}
                                    onClick={() => setPreferences({ ...preferences, timeAvailable: time })}
                                >
                                    {time} {t("common.minutes", "minutos")}
                                </button>
                            ))}
                        </div>
                        <div className="itinerary-nav" style={{ justifyContent: 'flex-end' }}>
                            <button className="itinerary-next-btn" onClick={handleNext}>
                                {t("common.next", "Próximo")} <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Interests */}
                {step === 2 && (
                    <div>
                        <h2 className="itinerary-step-title">{t("visitor.itinerary.interestsQuestion", "O que você gosta?")}</h2>
                        <div className="itinerary-interests-grid">
                            {interestOptions.map(interest => (
                                <label
                                    key={interest.id}
                                    className={`itinerary-interest-option ${preferences.interests.includes(interest.id) ? 'selected' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={preferences.interests.includes(interest.id)}
                                        onChange={(e) => {
                                            const newInterests = e.target.checked
                                                ? [...preferences.interests, interest.id]
                                                : preferences.interests.filter(i => i !== interest.id);
                                            setPreferences({ ...preferences, interests: newInterests });
                                        }}
                                    />
                                    {interest.label}
                                </label>
                            ))}
                        </div>
                        <div className="itinerary-nav">
                            <button className="itinerary-back-btn" onClick={handleBack}>{t("common.back", "Voltar")}</button>
                            <button className="itinerary-next-btn" onClick={handleNext}>
                                {t("common.next", "Próximo")} <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Accessibility */}
                {step === 3 && (
                    <div>
                        <h2 className="itinerary-step-title">{t("visitor.itinerary.accessibilityQuestion", "Necessidades de Acessibilidade")}</h2>
                        <div className="itinerary-accessibility-list">
                            {accessibilityOptions.map(acc => (
                                <label
                                    key={acc.id}
                                    className={`itinerary-accessibility-option ${preferences.accessibility.includes(acc.id) ? 'selected' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={preferences.accessibility.includes(acc.id)}
                                        onChange={(e) => {
                                            const newAcc = e.target.checked
                                                ? [...preferences.accessibility, acc.id]
                                                : preferences.accessibility.filter(a => a !== acc.id);
                                            setPreferences({ ...preferences, accessibility: newAcc });
                                        }}
                                    />
                                    {acc.label}
                                </label>
                            ))}
                        </div>
                        <div className="itinerary-nav">
                            <button className="itinerary-back-btn" onClick={handleBack}>{t("common.back", "Voltar")}</button>
                            <button className="itinerary-generate-btn" onClick={generateItinerary}>
                                <Sparkles size={18} />
                                {t("visitor.itinerary.generate", "Gerar Roteiro")}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
