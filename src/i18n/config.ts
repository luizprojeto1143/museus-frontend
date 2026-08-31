import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ptBR from "./locales/pt-br.json";
import en from "./locales/en.json";
import es from "./locales/es.json";

const normalizeLanguage = (lng?: string | null) => {
    if (!lng) return "pt-BR";
    const normalized = lng.toLowerCase();
    if (normalized.startsWith("en")) return "en";
    if (normalized.startsWith("es")) return "es";
    return "pt-BR";
};

// Restore saved language preference
const savedLang = (() => { try { return normalizeLanguage(localStorage.getItem("cv_language")); } catch { return "pt-BR"; } })();

i18n
    .use(initReactI18next)
    .init({
        resources: {
            "pt-BR": { translation: ptBR },
            en: { translation: en },
            es: { translation: es }
        },
        lng: savedLang,
        fallbackLng: "pt-BR",
        supportedLngs: ["pt-BR", "en", "es"],
        nonExplicitSupportedLngs: true,

        interpolation: {
            escapeValue: false
        },
        react: {
            useSuspense: false
        },
        debug: false
    });

export default i18n;
