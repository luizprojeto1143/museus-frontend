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
                "flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md z-[100]",
                absolute && "absolute top-6 right-6",
                className
            )}
            style={style}
        >
            {languages.map((lang) => {
                const isActive = i18n.language.startsWith(lang.code.split("-")[0]);
                return (
                    <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-300 text-[10px] font-bold tracking-widest uppercase",
                            isActive 
                                ? "bg-[var(--accent-primary)] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]" 
                                : "text-white/40 hover:text-white/80 hover:bg-white/5"
                        )}
                        title={lang.title}
                    >
                        <span>{lang.flag}</span>
                        <span className="hidden sm:inline">{lang.label}</span>
                    </button>
                );
            })}
        </div>
    );
};
