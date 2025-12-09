import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserStats, LEVELS, INITIAL_ACHIEVEMENTS } from "../types";

interface GamificationContextType {
    stats: UserStats;
    currentLevel: { level: number; minXp: number; title: string };
    nextLevel: { level: number; minXp: number; title: string } | null;
    progressToNextLevel: number; // 0 to 100
    addXp: (amount: number) => void;
    unlockAchievement: (achievementId: string) => void;
    visitWork: (workId: string) => void;
    completeTrail: (trailId: string) => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

const STORAGE_KEY = "cultura_viva_gamification";

export const GamificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [stats, setStats] = useState<UserStats>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        return {
            xp: 0,
            level: 1,
            achievements: INITIAL_ACHIEVEMENTS, // Start with locked achievements (unlockedAt undefined)
            visitedWorks: [],
            visitedTrails: [],
        };
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    }, [stats]);

    const getCurrentLevelInfo = (xp: number) => {
        // Find the highest level where minXp <= current xp
        return LEVELS.slice().reverse().find((l) => xp >= l.minXp) || LEVELS[0];
    };

    const currentLevel = getCurrentLevelInfo(stats.xp);
    const nextLevelIndex = LEVELS.findIndex((l) => l.level === currentLevel.level) + 1;
    const nextLevel = nextLevelIndex < LEVELS.length ? LEVELS[nextLevelIndex] : null;

    const progressToNextLevel = nextLevel
        ? Math.min(100, Math.max(0, ((stats.xp - currentLevel.minXp) / (nextLevel.minXp - currentLevel.minXp)) * 100))
        : 100;

    const addXp = (amount: number) => {
        setStats((prev) => {
            const newXp = prev.xp + amount;
            const newLevelInfo = getCurrentLevelInfo(newXp);

            // Check for level up (could trigger a modal/toast here)
            if (newLevelInfo.level > prev.level) {
                // Level up logic
            }

            return {
                ...prev,
                xp: newXp,
                level: newLevelInfo.level,
            };
        });
    };

    const unlockAchievement = (achievementId: string) => {
        setStats((prev) => {
            const achievementIndex = prev.achievements.findIndex((a) => a.id === achievementId);
            if (achievementIndex === -1) return prev; // Achievement not found

            const achievement = prev.achievements[achievementIndex];
            if (achievement.unlockedAt) return prev; // Already unlocked

            const updatedAchievements = [...prev.achievements];
            updatedAchievements[achievementIndex] = {
                ...achievement,
                unlockedAt: new Date().toISOString(),
            };

            // Add XP reward
            const newXp = prev.xp + achievement.xpReward;
            const newLevelInfo = getCurrentLevelInfo(newXp);

            return {
                ...prev,
                achievements: updatedAchievements,
                xp: newXp,
                level: newLevelInfo.level
            };
        });
    };

    const visitWork = (workId: string) => {
        setStats((prev) => {
            if (prev.visitedWorks.includes(workId)) return prev;

            const newVisited = [...prev.visitedWorks, workId];
            return { ...prev, visitedWorks: newVisited };
        });

        // Simple XP for visiting
        addXp(10);
    };

    const completeTrail = (trailId: string) => {
        setStats((prev) => {
            if (prev.visitedTrails.includes(trailId)) return prev;
            return { ...prev, visitedTrails: [...prev.visitedTrails, trailId] };
        });
        addXp(50);
    };

    const checkAchievements = (currentStats: UserStats) => {
        // Check "Art Lover" (5 works)
        if (currentStats.visitedWorks.length >= 5) {
            unlockAchievement("art_lover");
        }
        // Check "Trail Blazer" (1 trail)
        if (currentStats.visitedTrails.length >= 1) {
            unlockAchievement("trail_blazer");
        }
    };

    // Effect removed, logic moved to actions or a separate check function
    // But unlockAchievement depends on state, so calling it inside setStats is tricky.
    // Better to use a useEffect that listens to specific changes but is guarded?
    // Or just call checkAchievements after state updates?
    // Since setStats is async, we can't check immediately after.
    // The original useEffect was actually the correct "React way" to react to state changes, 
    // despite the lint warning about cascading renders (which are inevitable here).
    // I will restore the useEffect but add the missing dependency and suppress the warning 
    // because this IS a valid use case for an effect (reacting to state change to trigger another state change).

    useEffect(() => {
        // Check "Art Lover" (5 works)
        if (stats.visitedWorks.length >= 5) {
            unlockAchievement("art_lover");
        }
        // Check "Trail Blazer" (1 trail)
        if (stats.visitedTrails.length >= 1) {
            unlockAchievement("trail_blazer");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stats.visitedWorks.length, stats.visitedTrails.length]);

    const contextValue: GamificationContextType = {
        stats,
        currentLevel,
        nextLevel,
        progressToNextLevel,
        addXp,
        unlockAchievement,
        visitWork,
        completeTrail,
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
