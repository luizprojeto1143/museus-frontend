import React from "react";
import { useTranslation } from "react-i18next";

interface LanguageSwitcherProps {
    style?: React.CSSProperties;
    className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ style, className }) => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const currentLang = i18n.language.split("-")[0]; // pt-BR -> pt

    return (
        <div
            className={className}
            style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                zIndex: 10,
                display: "flex",
                gap: "0.5rem",
                ...style
            }}
        >
            <button
                onClick={() => changeLanguage("pt-BR")}
                style={{
                    background: currentLang === "pt" ? "rgba(212, 175, 55, 0.2)" : "transparent",
                    border: "1px solid #d4af37",
                    color: "#d4af37",
                    padding: "0.3rem 0.6rem",
                    borderRadius: "0.4rem",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    transition: "all 0.2s"
                }}
                title="Português"
            >
                🇧🇷 PT
            </button>
            <button
                onClick={() => changeLanguage("en")}
                style={{
                    background: currentLang === "en" ? "rgba(212, 175, 55, 0.2)" : "transparent",
                    border: "1px solid #d4af37",
                    color: "#d4af37",
                    padding: "0.3rem 0.6rem",
                    borderRadius: "0.4rem",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    transition: "all 0.2s"
                }}
                title="English"
            >
                🇺🇸 EN
            </button>
            <button
                onClick={() => changeLanguage("es")}
                style={{
                    background: currentLang === "es" ? "rgba(212, 175, 55, 0.2)" : "transparent",
                    border: "1px solid #d4af37",
                    color: "#d4af37",
                    padding: "0.3rem 0.6rem",
                    borderRadius: "0.4rem",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    transition: "all 0.2s"
                }}
                title="Español"
            >
                🇪🇸 ES
            </button>
        </div>
    );
};
