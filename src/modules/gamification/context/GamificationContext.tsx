import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserStats, LEVELS, INITIAL_ACHIEVEMENTS } from "../types";
import { api } from "../../../api/client";

interface GamificationContextType {
    stats: UserStats;
    currentLevel: { level: number; minXp: number; title: string };
    nextLevel: { level: number; minXp: number; title: string } | null;
    progressToNextLevel: number; // 0 to 100
    loading: boolean;
    addXp: (amount: number) => void;
    unlockAchievement: (achievementId: string) => void;
    visitWork: (workId: string) => void;
    completeTrail: (trailId: string) => void;
    refreshGamification?: () => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

const STORAGE_KEY = "cultura_viva_gamification";
const AUTH_STORAGE_KEY = "museus_auth_v1";

// Helper to safely get auth data from localStorage
const getAuthFromStorage = (): { email: string | null; tenantId: string | null; isAuthenticated: boolean } => {
    try {
        const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return {
                email: parsed.email ?? null,
                tenantId: parsed.tenantId ?? null,
                isAuthenticated: !!parsed.token
            };
        }
    } catch {
        // Ignore parse errors
    }
    return { email: null, tenantId: null, isAuthenticated: false };
};

export const GamificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [authState, setAuthState] = useState(getAuthFromStorage);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<UserStats>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch {
            // Ignore parse errors
        }
        return {
            xp: 0,
            level: 1,
            achievements: INITIAL_ACHIEVEMENTS,
            visitedWorks: [],
            visitedTrails: [],
        };
    });

    // Listen for storage changes to update auth state
    useEffect(() => {
        const handleStorageChange = () => {
            setAuthState(getAuthFromStorage());
        };

        window.addEventListener("storage", handleStorageChange);

        // Also check periodically in case storage changed in same tab
        const interval = setInterval(() => {
            const newAuth = getAuthFromStorage();
            if (newAuth.email !== authState.email || newAuth.tenantId !== authState.tenantId) {
                setAuthState(newAuth);
            }
        }, 1000);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            clearInterval(interval);
        };
    }, [authState.email, authState.tenantId]);

    const { isAuthenticated, email, tenantId } = authState;

    // Sync with backend on mount/auth change
    useEffect(() => {
        if (isAuthenticated && email && tenantId) {
            fetchBackendData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, email, tenantId]);

    const fetchBackendData = async () => {
        if (!email || !tenantId) return;

        setLoading(true);
        try {
            const res = await api.get(`/visitors/me/summary?email=${email}&tenantId=${tenantId}`);
            const data = res.data;

            // Merge backend data with local stats structure
            setStats(prev => {
                const newXp = data.xp || 0;
                const newLevelInfo = getCurrentLevelInfo(newXp);

                // Map backend achievements to frontend structure
                // Assuming backend returns { id, code, unlockedAt }
                const backendAchievements = data.achievements || [];
                const mergedAchievements = prev.achievements.map(localAch => {
                    const found = backendAchievements.find((ba: any) => ba.code === localAch.id);
                    if (found) {
                        return { ...localAch, unlockedAt: found.unlockedAt };
                    }
                    return localAch;
                });

                return {
                    ...prev,
                    xp: newXp,
                    level: newLevelInfo.level,
                    achievements: mergedAchievements,
                };
            });
        } catch (error) {
            console.error("Error fetching gamification data", error);
        } finally {
            setLoading(false);
        }
    };

    const refreshGamification = () => {
        if (isAuthenticated) fetchBackendData();
    };

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
        } catch {
            // Ignore storage errors
        }
    }, [stats]);

    const getCurrentLevelInfo = (xp: number) => {
        return LEVELS.slice().reverse().find((l) => xp >= l.minXp) || LEVELS[0];
    };

    const currentLevel = getCurrentLevelInfo(stats.xp);
    const nextLevelIndex = LEVELS.findIndex((l) => l.level === currentLevel.level) + 1;
    const nextLevel = nextLevelIndex < LEVELS.length ? LEVELS[nextLevelIndex] : null;

    const progressToNextLevel = nextLevel
        ? Math.min(100, Math.max(0, ((stats.xp - currentLevel.minXp) / (nextLevel.minXp - currentLevel.minXp)) * 100))
        : 100;

    const addXp = (amount: number) => {
        // Optimistic update
        setStats((prev) => {
            const newXp = prev.xp + amount;
            const newLevelInfo = getCurrentLevelInfo(newXp);
            return { ...prev, xp: newXp, level: newLevelInfo.level };
        });
    };

    const unlockAchievement = (achievementId: string) => {
        // Optimistic update
        setStats((prev) => {
            const achievementIndex = prev.achievements.findIndex((a) => a.id === achievementId);
            if (achievementIndex === -1) return prev;
            if (prev.achievements[achievementIndex].unlockedAt) return prev;

            const updatedAchievements = [...prev.achievements];
            updatedAchievements[achievementIndex] = {
                ...prev.achievements[achievementIndex],
                unlockedAt: new Date().toISOString(),
            };

            return { ...prev, achievements: updatedAchievements };
        });
    };

    const visitWork = (workId: string) => {
        setStats((prev) => {
            if (prev.visitedWorks.includes(workId)) return prev;
            return { ...prev, visitedWorks: [...prev.visitedWorks, workId] };
        });
        // Also trigger refresh from backend if connected
        if (isAuthenticated) setTimeout(fetchBackendData, 1000);
    };

    const completeTrail = (trailId: string) => {
        setStats((prev) => {
            if (prev.visitedTrails.includes(trailId)) return prev;
            return { ...prev, visitedTrails: [...prev.visitedTrails, trailId] };
        });
        if (isAuthenticated) setTimeout(fetchBackendData, 1000);
    };

    // Client-side achievement checks (can still run for immediate feedback)
    useEffect(() => {
        if (stats.visitedWorks.length >= 5) unlockAchievement("art_lover");
        if (stats.visitedTrails.length >= 1) unlockAchievement("trail_blazer");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stats.visitedWorks.length, stats.visitedTrails.length]);

    const contextValue: GamificationContextType = {
        stats,
        currentLevel,
        nextLevel,
        progressToNextLevel,
        loading,
        addXp,
        unlockAchievement,
        visitWork,
        completeTrail,
        refreshGamification // Export this so components can trigger refresh
    };

    return (
        <GamificationContext.Provider value={contextValue}>
            {children}
        </GamificationContext.Provider>
    );
};

export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (context === undefined) {
        throw new Error("useGamification must be used within a GamificationProvider");
    }
    return context;
};
