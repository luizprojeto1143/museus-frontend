import React from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/cn";

interface LanguageSwitcherProps {
    style?: React.CSSProperties;
    className?: string;
    absolute?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ style, className, absolute = true }) => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const currentLang = i18n.language.split("-")[0]; // pt-BR -> pt

    const languages = [
        { code: "pt-BR", label: "PT", flag: "🇧🇷", title: "Português" },
        { code: "en", label: "EN", flag: "🇺🇸", title: "English" },
        { code: "es", label: "ES", flag: "🇪🇸", title: "Español" },
    ];

    return (
        <div
            className={cn(
                "flex items-center gap-1.5 p-1 rounded-2xl",
                absolute && "absolute top-6 right-6",
                className
            )}
            style={{
                ...style,
                background: "var(--bg-surface)",
                border: "2px solid var(--accent-primary)",
                borderRadius: "40px",
                padding: "0.25rem 1rem",
            }}
        >
            {languages.map((lang) => {
                const isActive = i18n.language.startsWith(lang.code.split("-")[0]);
                return (
                    <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 text-[10px] font-black tracking-[0.2em] uppercase",
                            isActive 
                                ? "bg-[var(--accent-primary)] text-black shadow-[0_4px_12px_rgba(212,175,55,0.3)]" 
                                : "text-[var(--fg-main)] hover:bg-white/5 opacity-60 hover:opacity-100"
                        )}
                        title={lang.title}
                    >
                        <span className="text-base">{lang.flag}</span>
                        <span className="hidden xs:inline">{lang.label}</span>
                    </button>
                );
            })}
        </div>
    );
};
