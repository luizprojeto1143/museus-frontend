import React from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../../components/LanguageSwitcher";
import { Settings, Globe, Palette, X } from "lucide-react";
import "./SettingsModal.css";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="settings-backdrop">
            <div className="settings-modal">
                <button onClick={onClose} className="settings-close-btn">
                    <X size={20} />
                </button>

                <h2 className="settings-title">
                    <Settings size={24} />
                    {t("visitor.settings.title", "Configurações")}
                </h2>

                <div className="settings-section">
                    <h3 className="settings-section-title">
                        <Globe size={18} />
                        {t("visitor.settings.language", "Idioma")}
                    </h3>
                    <LanguageSwitcher style={{ position: "static", width: "100%" }} />
                </div>

                <div className="settings-section">
                    <h3 className="settings-section-title">
                        <Palette size={18} />
                        {t("visitor.settings.theme", "Tema")}
                    </h3>
                    <p className="settings-note">
                        {t("visitor.settings.themeComingSoon", "Em breve: Modo Escuro")}
                    </p>
                </div>

                <button onClick={onClose} className="settings-footer-btn">
                    {t("common.close", "Fechar")}
                </button>
            </div>
        </div>
    );
};
