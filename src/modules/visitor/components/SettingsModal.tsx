import React from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../../components/LanguageSwitcher";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem"
        }}>
            <div className="card" style={{ width: "100%", maxWidth: "400px", position: "relative" }}>
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "1rem",
                        right: "1rem",
                        background: "none",
                        border: "none",
                        fontSize: "1.5rem",
                        cursor: "pointer"
                    }}
                >
                    ×
                </button>

                <h2 className="section-title" style={{ marginBottom: "1.5rem" }}>{t("visitor.settings.title", "Configurações")}</h2>

                <div style={{ marginBottom: "1.5rem" }}>
                    <h3 className="card-title" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>{t("visitor.settings.language", "Idioma")}</h3>
                    <LanguageSwitcher style={{ position: "static", width: "100%" }} />
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                    <h3 className="card-title" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>{t("visitor.settings.theme", "Tema")}</h3>
                    <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>{t("visitor.settings.themeComingSoon", "Em breve: Modo Escuro")}</p>
                </div>

                <button className="btn btn-secondary" onClick={onClose} style={{ width: "100%" }}>
                    {t("common.close", "Fechar")}
                </button>
            </div>
        </div>
    );
};
