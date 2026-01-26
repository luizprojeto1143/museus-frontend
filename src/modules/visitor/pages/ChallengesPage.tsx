import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Target, Trophy, Map, ChevronRight, Star, Clock } from 'lucide-react';
import { api } from '../../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { DailyChallengeWidget, XpProgressBar } from '../../../components/gamification/ChallengeWidget';

import { Gamepad2 } from 'lucide-react';

interface ScavengerHunt {
    id: string;
    title: string;
    description: string | null;
    xpReward: number;
    _count: { steps: number };
}

// UserProgress type removed - not used in this component

/**
 * Visitor Challenges Page
 * Daily challenges and scavenger hunts
 */
export const ChallengesPage: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [hunts, setHunts] = useState<ScavengerHunt[]>([]);
    const [loading, setLoading] = useState(true);
    const [userXp, setUserXp] = useState(0);

    useEffect(() => {
        if (tenantId) {
            fetchHunts();
            fetchUserStats();
        }
    }, [tenantId]);

    const fetchHunts = async () => {
        try {
            const res = await api.get(`/challenges/hunts?tenantId=${tenantId}`);
            setHunts(res.data);
        } catch (error) {
            console.error('Error fetching hunts:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserStats = async () => {
        try {
            const res = await api.get('/visitors/me');
            setUserXp(res.data.xp || 0);
        } catch (error) {
            console.error('Error fetching user stats:', error);
        }
    };

    const calculateLevel = (xp: number) => {
        // Each level = 500 XP
        return Math.floor(xp / 500) + 1;
    };

    const navigate = useNavigate();

    return (
        <div className="challenges-page">
            <header className="page-header">
                <div className="header-icon">
                    <Target size={32} />
                </div>
                <div>
                    <h1>{t('visitor.challenges.title', 'Desafios')}</h1>
                    <p className="subtitle">
                        {t('visitor.challenges.subtitle', 'Complete missões e ganhe XP!')}
                    </p>
                </div>
            </header>

            {/* User XP */}
            <section className="xp-section">
                <XpProgressBar currentXp={userXp} level={calculateLevel(userXp)} />
            </section>

            {/* Arcade Game Promo */}
            <section className="section bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-6 text-white relative overflow-hidden mb-8 shadow-xl border border-indigo-700">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="bg-white/20 p-4 rounded-full">
                        <Gamepad2 size={40} className="text-yellow-400" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl font-black text-yellow-400 italic">ART RUN</h2>
                        <p className="text-indigo-200 mb-4">Jogue a nova aventura platformer! Colete moedas e ganhe XP real.</p>
                        <button
                            onClick={() => navigate('/arcade')}
                            className="bg-yellow-500 hover:bg-yellow-400 text-indigo-900 font-bold px-8 py-3 rounded-xl transition-transform hover:scale-105 shadow-lg shadow-yellow-500/30"
                        >
                            JOGAR AGORA
                        </button>
                    </div>
                    {/* Decor */}
                    <div className="hidden md:block opacity-20 transform rotate-12">
                        <Trophy size={120} />
                    </div>
                </div>
            </section>




            {/* Daily Challenge */}
            <section className="section">
                <h2 className="section-title">
                    <Clock size={20} />
                    {t('visitor.challenges.daily', 'Desafio do Dia')}
                </h2>
                <DailyChallengeWidget />
            </section>

            {/* Scavenger Hunts */}
            <section className="section">
                <h2 className="section-title">
                    <Map size={20} />
                    {t('visitor.challenges.hunts', 'Caças ao Tesouro')}
                </h2>

                {loading ? (
                    <div className="loading">Carregando...</div>
                ) : hunts.length === 0 ? (
                    <div className="empty-state">
                        <Trophy size={48} />
                        <h3>Nenhuma caça ativa</h3>
                        <p>Volte em breve para novas aventuras!</p>
                    </div>
                ) : (
                    <div className="hunts-list">
                        {hunts.map(hunt => (
                            <HuntCard key={hunt.id} hunt={hunt} />
                        ))}
                    </div>
                )}
            </section>

            <style>{`
                .challenges-page {
                    padding: 20px;
                }
                
                .page-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 24px;
                }
                
                .header-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 16px;
                    background: linear-gradient(135deg, #8b5cf6, #6366f1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }
                
                .page-header h1 {
                    margin: 0;
                    font-size: 1.5rem;
                    color: var(--fg-main, #f3f4f6);
                }
                
                .subtitle {
                    margin: 4px 0 0;
                    color: var(--fg-muted, #9ca3af);
                }
                
                .xp-section {
                    margin-bottom: 24px;
                }
                
                .section {
                    margin-bottom: 32px;
                }
                
                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin: 0 0 16px;
                    font-size: 1.1rem;
                    color: var(--fg-main, #f3f4f6);
                }
                
                .hunts-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .loading, .empty-state {
                    text-align: center;
                    padding: 40px 20px;
                    color: var(--fg-muted, #9ca3af);
                }
                
                .empty-state h3 {
                    margin: 16px 0 8px;
                    color: var(--fg-main, #f3f4f6);
                }
            `}</style>
        </div>
    );
};

// Hunt Card Component
const HuntCard: React.FC<{ hunt: ScavengerHunt }> = ({ hunt }) => {
    const [starting, setStarting] = useState(false);

    const handleStart = async () => {
        setStarting(true);
        try {
            await api.post(`/challenges/hunts/${hunt.id}/start`);
            // Navigate to hunt detail or show first clue
            window.location.href = `/desafios/cacas/${hunt.id}`;
        } catch (error) {
            console.error('Error starting hunt:', error);
        } finally {
            setStarting(false);
        }
    };

    return (
        <div className="hunt-card">
            <div className="hunt-icon">🗺️</div>
            <div className="hunt-info">
                <h4>{hunt.title}</h4>
                <p>{hunt.description}</p>
                <div className="hunt-meta">
                    <span className="hunt-steps">
                        <Map size={14} /> {hunt._count.steps} pistas
                    </span>
                    <span className="hunt-reward">
                        <Star size={14} fill="#fbbf24" /> {hunt.xpReward} XP
                    </span>
                </div>
            </div>
            <button className="start-btn" onClick={handleStart} disabled={starting}>
                {starting ? '...' : <ChevronRight size={20} />}
            </button>

            <style>{`
                .hunt-card {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    background: var(--bg-card, #1f2937);
                    border-radius: 16px;
                    border: 1px solid var(--border-color, #374151);
                }
                
                .hunt-icon {
                    width: 50px;
                    height: 50px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(99, 102, 241, 0.2));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                }
                
                .hunt-info {
                    flex: 1;
                }
                
                .hunt-info h4 {
                    margin: 0 0 4px;
                    color: var(--fg-main, #f3f4f6);
                }
                
                .hunt-info p {
                    margin: 0 0 8px;
                    font-size: 0.85rem;
                    color: var(--fg-muted, #9ca3af);
                }
                
                .hunt-meta {
                    display: flex;
                    gap: 16px;
                }
                
                .hunt-steps, .hunt-reward {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.8rem;
                    color: var(--fg-muted, #9ca3af);
                }
                
                .hunt-reward {
                    color: #fbbf24;
                }
                
                .start-btn {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #8b5cf6, #6366f1);
                    border: none;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `}</style>
        </div>
    );
};
