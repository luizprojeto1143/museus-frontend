import { useIsCityMode } from "../modules/auth/TenantContext";
import { useTranslation } from "react-i18next";

export interface Terminology {
    work: string;
    trail: string;
    room: string;
    floor: string;

    works: string;
    trails: string;
    rooms: string;
    floors: string;
    featuredWorks: string;
}

export function useTerminology(): Terminology {
    const isCity = useIsCityMode();
    const { t } = useTranslation();
    const modeKey = isCity ? "city" : "museum";

    return {
        work: t(`common.modes.${modeKey}.work`),
        trail: t(`common.modes.${modeKey}.trail`),
        room: t(`common.modes.${modeKey}.room`),
        floor: t(`common.modes.${modeKey}.floor`),

        works: t(`common.modes.${modeKey}.works`),
        trails: t(`common.modes.${modeKey}.trails`),
        rooms: t(`common.modes.${modeKey}.rooms`) || (isCity ? "Bairros" : "Salas"),
        floors: t(`common.modes.${modeKey}.floors`) || (isCity ? "Zonas" : "Andares"),

        featuredWorks: isCity ? t("city.featuredWorks", "Destaques da Cidade") : t("museum.featuredWorks", "Obras em Destaque"),
    };
}

