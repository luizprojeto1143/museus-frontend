import { useIsCityMode } from "../modules/auth/TenantContext";
import { useTranslation } from "react-i18next";

export interface Terminology {
    work: string;
    works: string;

    artist: string;
    technique: string;
    dimensions: string;

    trail: string;
    trails: string;

    room: string;
    rooms: string;

    floor: string;
    floors: string;

    event: string;
    events: string;

    visitor: string;
    visitors: string;

    featuredWorks: string;
}

export function useTerminology(): Terminology {
    const isCity = useIsCityMode();
    const { t } = useTranslation();
    // Fallback if transaction keys are missing, we use hardcoded defaults based on mode

    return {
        // Works / Monuments
        work: isCity ? "Ponto Turístico" : t("common.work", "Obra"),
        works: isCity ? "Monumentos e Pontos" : t("common.works", "Acervo"),

        // Artist / Author
        artist: isCity ? "Autor / Responsável" : t("common.artist", "Artista"),
        technique: isCity ? "Categoria / Tipo" : t("common.technique", "Técnica"),
        dimensions: isCity ? "Dimensões / Área" : t("common.dimensions", "Dimensões"),

        // Trails / Routes
        trail: isCity ? "Roteiro" : t("common.trail", "Trilha"),
        trails: isCity ? "Roteiros Turísticos" : t("common.trails", "Trilhas"),

        // Locations
        room: isCity ? "Bairro" : t("common.room", "Sala"),
        rooms: isCity ? "Bairros" : t("common.rooms", "Salas"),

        floor: isCity ? "Zona" : t("common.floor", "Andar"),
        floors: isCity ? "Zonas" : t("common.floors", "Andares"),

        // Events
        event: isCity ? "Evento Cultural" : t("common.event", "Evento"),
        events: isCity ? "Agenda Cultural" : t("common.events", "Eventos"),

        // Visitors / Citizens
        visitor: isCity ? "Cidadão/Turista" : t("common.visitor", "Visitante"),
        visitors: isCity ? "Cidadãos e Turistas" : t("common.visitors", "Visitantes"),

        featuredWorks: isCity ? "Destaques da Cidade" : t("common.featuredWorks", "Obras em Destaque"),
    };
}

