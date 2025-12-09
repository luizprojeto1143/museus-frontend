export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string; // Emoji or icon name
    xpReward: number;
    unlockedAt?: string; // ISO date string
}

export interface UserStats {
    xp: number;
    level: number;
    achievements: Achievement[];
    visitedWorks: string[]; // IDs of visited works
    visitedTrails: string[]; // IDs of completed trails
}

export const LEVELS = [
    { level: 1, minXp: 0, title: "Explorador Iniciante" },
    { level: 2, minXp: 100, title: "Curioso da Arte" },
    { level: 3, minXp: 300, title: "Conhecedor" },
    { level: 4, minXp: 600, title: "Mestre do Museu" },
    { level: 5, minXp: 1000, title: "Guardião da Cultura" },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
    {
        id: "first_visit",
        title: "Primeiros Passos",
        description: "Acessou o aplicativo pela primeira vez.",
        icon: "👋",
        xpReward: 50,
    },
    {
        id: "art_lover",
        title: "Amante da Arte",
        description: "Visitou 5 obras de arte.",
        icon: "🎨",
        xpReward: 100,
    },
    {
        id: "trail_blazer",
        title: "Desbravador",
        description: "Completou sua primeira trilha.",
        icon: "🗺️",
        xpReward: 150,
    },
    {
        id: "social_butterfly",
        title: "Sociável",
        description: "Compartilhou uma obra ou conquista.",
        icon: "🦋",
        xpReward: 75,
    },
];
