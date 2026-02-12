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
    const tenant = useTenant();
    const isCulturalSpace = tenant?.type === "CULTURAL_SPACE";
    const { t } = useTranslation();
    // Fallback if transaction keys are missing, we use hardcoded defaults based on mode

    return {
        // Works / Monuments
        work: isCity ? "Ponto Turístico" : isCulturalSpace ? "Atividade" : t("common.work", "Obra"),
        works: isCity ? "Monumentos e Pontos" : isCulturalSpace ? "Atividades" : t("common.works", "Acervo"),

        // Artist / Author
        artist: isCity ? "Autor / Responsável" : isCulturalSpace ? "Facilitador" : t("common.artist", "Artista"),
        technique: isCity ? "Categoria / Tipo" : isCulturalSpace ? "Tipo de Atividade" : t("common.technique", "Técnica"),
        dimensions: isCity ? "Dimensões / Área" : isCulturalSpace ? "Duração / Carga Horária" : t("common.dimensions", "Dimensões"),

        // Trails / Routes
        trail: isCity ? "Roteiro" : isCulturalSpace ? "Projeto" : t("common.trail", "Trilha"),
        trails: isCity ? "Roteiros Turísticos" : isCulturalSpace ? "Projetos" : t("common.trails", "Trilhas"),

        // Locations
        room: isCity ? "Bairro" : isCulturalSpace ? "Espaço" : t("common.room", "Sala"),
        rooms: isCity ? "Bairros" : isCulturalSpace ? "Espaços" : t("common.rooms", "Salas"),

        floor: isCity ? "Zona" : isCulturalSpace ? "Pavimento" : t("common.floor", "Andar"),
        floors: isCity ? "Zonas" : isCulturalSpace ? "Pavimentos" : t("common.floors", "Andares"),

        // Events
        event: isCity ? "Evento Cultural" : isCulturalSpace ? "Oficina / Evento" : t("common.event", "Evento"),
        events: isCity ? "Agenda Cultural" : isCulturalSpace ? "Programação" : t("common.events", "Eventos"),

        // Visitors / Citizens
        visitor: isCity ? "Cidadão/Turista" : isCulturalSpace ? "Participante" : t("common.visitor", "Visitante"),
        visitors: isCity ? "Cidadãos e Turistas" : isCulturalSpace ? "Participantes" : t("common.visitors", "Visitantes"),

        featuredWorks: isCity ? "Destaques da Cidade" : isCulturalSpace ? "Destaques da Programação" : t("common.featuredWorks", "Obras em Destaque"),
    };
}

