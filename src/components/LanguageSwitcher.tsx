import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/cn";

const supportedLanguages = ["pt-BR", "en", "es"] as const;
type SupportedLanguage = typeof supportedLanguages[number];

const normalizeLanguage = (lng?: string | null): SupportedLanguage => {
    if (!lng) return "pt-BR";
    const normalized = lng.toLowerCase();
    if (normalized.startsWith("en")) return "en";
    if (normalized.startsWith("es")) return "es";
    return "pt-BR";
};

interface LanguageSwitcherProps {
    style?: React.CSSProperties;
    className?: string;
    absolute?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ style, className, absolute = true }) => {
    const { i18n } = useTranslation();
    const [currentLang, setCurrentLang] = useState<SupportedLanguage>(normalizeLanguage(i18n.resolvedLanguage || i18n.language));

    useEffect(() => {
        const onLangChanged = (lng: string) => {
            const nextLang = normalizeLanguage(lng);
            setCurrentLang(nextLang);
            document.documentElement.lang = nextLang;
        };
        i18n.on("languageChanged", onLangChanged);
        onLangChanged(i18n.resolvedLanguage || i18n.language);
        return () => { i18n.off("languageChanged", onLangChanged); };
    }, [i18n]);

    const changeLanguage = async (lng: SupportedLanguage) => {
        const nextLang = normalizeLanguage(lng);
        setCurrentLang(nextLang);
        try { localStorage.setItem("cv_language", lng); } catch {}
        await i18n.changeLanguage(nextLang);
        document.documentElement.lang = nextLang;
    };

    const languages: Array<{ code: SupportedLanguage; label: string; flag: string; title: string }> = [
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
                const isActive = currentLang === lang.code || currentLang.startsWith(lang.code.split("-")[0]);
                return (
                    <button
                        key={lang.code}
                        type="button"
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
