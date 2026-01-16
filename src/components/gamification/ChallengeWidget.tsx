import React, { useState, useEffect, useCallback } from 'react';
import { Star, Target, Check } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../modules/auth/AuthContext';

interface Challenge {
    id: string;
    title: string;
    description: string;
    xpReward: number;
    type: string;
    target: number;
    isDefault?: boolean;
}

interface Progress {
    progress: number;
    target: number;
    completed: boolean;
}

/**
 * Daily Challenge Widget
 * Shows today's challenge and user progress
 */
export const DailyChallengeWidget: React.FC = () => {
    const { tenantId } = useAuth();
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [progress, setProgress] = useState<Progress | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchChallenge = useCallback(async () => {
        try {
            const res = await api.get(`/challenges/today?tenantId=${tenantId}`);
            setChallenge(res.data);
        } catch (error) {
            console.error('Error fetching challenge:', error);
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    const fetchProgress = useCallback(async () => {
        try {
            const res = await api.get(`/challenges/my-progress?tenantId=${tenantId}`);
            setProgress(res.data);
        } catch (error) {
            console.error('Error fetching progress:', error);
        }
    }, [tenantId]);

    useEffect(() => {
        if (tenantId) {
            fetchChallenge();
            fetchProgress();
        }
    }, [tenantId, fetchChallenge, fetchProgress]);

    if (loading) {
        return <div className="daily-challenge loading">Carregando...</div>;
    }

    if (!challenge) {
        return null;
    }

    const progressPercent = progress
        ? Math.min(100, (progress.progress / progress.target) * 100)
        : 0;

    const isCompleted = progress?.completed;

    return (
        <div className={`daily-challenge ${isCompleted ? 'completed' : ''}`}>
            <div className="challenge-header">
                <div className="challenge-icon">
                    {isCompleted ? <Check size={24} /> : <Target size={24} />}
                </div>
                <div className="challenge-info">
                    <span className="challenge-label">Desafio do Dia</span>
                    <h4 className="challenge-title">{challenge.title}</h4>
                </div>
                <div className="challenge-reward">
                    <Star size={16} fill="currentColor" />
                    <span>{challenge.xpReward} XP</span>
                </div>
            </div>

            <p className="challenge-description">{challenge.description}</p>

            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            <div className="progress-text">
                {isCompleted ? (
                    <span className="completed-text">🎉 Concluído!</span>
                ) : (
                    <span>{progress?.progress || 0} / {progress?.target || challenge.target}</span>
                )}
            </div>

            <style>{`
                .daily-challenge {
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1));
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    border-radius: 16px;
                    padding: 16px;
                    margin-bottom: 16px;
                }
                
                .daily-challenge.completed {
                    background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1));
                    border-color: rgba(34, 197, 94, 0.3);
                }
                
                .challenge-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 12px;
                }
                
                .challenge-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #8b5cf6, #3b82f6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }
                
                .daily-challenge.completed .challenge-icon {
                    background: linear-gradient(135deg, #22c55e, #10b981);
                }
                
                .challenge-info {
                    flex: 1;
                }
                
                .challenge-label {
                    font-size: 0.75rem;
                    color: var(--fg-muted, #9ca3af);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .challenge-title {
                    margin: 0;
                    font-size: 1rem;
                    color: var(--fg-main, #f3f4f6);
                }
                
                .challenge-reward {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 6px 12px;
                    background: rgba(251, 191, 36, 0.2);
                    border-radius: 20px;
                    color: #fbbf24;
                    font-weight: bold;
                    font-size: 0.9rem;
                }
                
                .challenge-description {
                    margin: 0 0 12px;
                    color: var(--fg-muted, #9ca3af);
                    font-size: 0.9rem;
                }
                
                .progress-bar {
                    height: 8px;
                    background: var(--bg-elevated, #374151);
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 8px;
                }
                
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #8b5cf6, #3b82f6);
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }
                
                .daily-challenge.completed .progress-fill {
                    background: linear-gradient(90deg, #22c55e, #10b981);
                }
                
                .progress-text {
                    text-align: center;
                    font-size: 0.85rem;
                    color: var(--fg-muted, #9ca3af);
                }
                
                .completed-text {
                    color: #22c55e;
                    font-weight: bold;
                }
            `}</style>
        </div>
    );
};

/**
 * XP Progress Bar
 * Shows user's XP and level
 */
interface XpProgressProps {
    currentXp: number;
    level?: number;
}

export const XpProgressBar: React.FC<XpProgressProps> = ({ currentXp, level = 1 }) => {
    // Each level requires 500 XP more than the previous
    const xpForCurrentLevel = level * 500;
    const xpInLevel = currentXp % xpForCurrentLevel;
    const progress = (xpInLevel / xpForCurrentLevel) * 100;

    return (
        <div className="xp-progress">
            <div className="xp-header">
                <span className="level-badge">Nível {level}</span>
                <span className="xp-text">{currentXp} XP</span>
            </div>
            <div className="xp-bar">
                <div className="xp-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="xp-next">{xpForCurrentLevel - xpInLevel} XP para o próximo nível</p>

            <style>{`
                .xp-progress {
                    padding: 16px;
                    background: var(--bg-card, #1f2937);
                    border-radius: 12px;
                }
                
                .xp-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }
                
                .level-badge {
                    padding: 4px 12px;
                    background: linear-gradient(135deg, #fbbf24, #f59e0b);
                    color: #000;
                    border-radius: 20px;
                    font-weight: bold;
                    font-size: 0.85rem;
                }
                
                .xp-text {
                    font-weight: bold;
                    color: var(--fg-main, #f3f4f6);
                }
                
                .xp-bar {
                    height: 12px;
                    background: var(--bg-elevated, #374151);
                    border-radius: 6px;
                    overflow: hidden;
                    margin-bottom: 8px;
                }
                
                .xp-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #fbbf24, #f59e0b);
                    border-radius: 6px;
                    transition: width 0.5s ease;
                }
                
                .xp-next {
                    margin: 0;
                    font-size: 0.8rem;
                    color: var(--fg-muted, #9ca3af);
                    text-align: center;
                }
            `}</style>
        </div>
    );
};
