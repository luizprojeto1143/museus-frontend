import { useIsCityMode } from "../modules/auth/TenantContext";

// Nomenclaturas dinâmicas baseadas no modo (Museu vs Cidade)
export interface Terminology {
    // Singular
    work: string;
    trail: string;
    room: string;
    floor: string;
    artist: string;

    // Plural
    works: string;
    trails: string;
    rooms: string;
    floors: string;
    artists: string;

    // Actions/Labels
    viewWork: string;
    allWorks: string;
    featuredWorks: string;
    relatedWorks: string;
    workDetail: string;
    scanWork: string;
}

const MUSEUM_TERMINOLOGY: Terminology = {
    work: "Obra",
    trail: "Trilha",
    room: "Sala",
    floor: "Andar",
    artist: "Artista",

    works: "Obras",
    trails: "Trilhas",
    rooms: "Salas",
    floors: "Andares",
    artists: "Artistas",

    viewWork: "Ver Obra",
    allWorks: "Todas as Obras",
    featuredWorks: "Obras em Destaque",
    relatedWorks: "Obras Relacionadas",
    workDetail: "Detalhes da Obra",
    scanWork: "Escanear Obra"
};

const CITY_TERMINOLOGY: Terminology = {
    work: "Local",
    trail: "Roteiro",
    room: "Bairro",
    floor: "Zona",
    artist: "Responsável",

    works: "Locais",
    trails: "Roteiros",
    rooms: "Bairros",
    floors: "Zonas",
    artists: "Responsáveis",

    viewWork: "Ver Local",
    allWorks: "Todos os Locais",
    featuredWorks: "Locais em Destaque",
    relatedWorks: "Locais Próximos",
    workDetail: "Detalhes do Local",
    scanWork: "Escanear Local"
};

export function useTerminology(): Terminology {
    const isCityMode = useIsCityMode();
    return isCityMode ? CITY_TERMINOLOGY : MUSEUM_TERMINOLOGY;
}

// Utility for components that can't use hooks
export function getTerminology(isCityMode: boolean): Terminology {
    return isCityMode ? CITY_TERMINOLOGY : MUSEUM_TERMINOLOGY;
}
