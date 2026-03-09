import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Target, Trophy, Map, ChevronRight, Star, Clock } from 'lucide-react';
import { api } from '../../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DailyChallengeWidget, XpProgressBar } from '../../../components/gamification/ChallengeWidget';
import './Challenges.css';

interface ScavengerHunt {
    id: string;
    title: string;
    description: string | null;
    xpReward: number;
    _count: { steps: number };
}

export const ChallengesPage: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId, isGuest } = useAuth();
    const navigate = useNavigate();
    const [hunts, setHunts] = useState<ScavengerHunt[]>([]);
    const [loading, setLoading] = useState(true);
    const [userXp, setUserXp] = useState(0);

    useEffect(() => {
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

        if (tenantId) {
            fetchHunts();
            fetchUserStats();
        }
    }, [tenantId]);

    const calculateLevel = (xp: number) => {
        return Math.floor(xp / 500) + 1;
    };

    return (
        <div className="challenges-container">
            <header className="challenges-header">
                <div className="challenges-header-icon">
                    <Target size={32} />
                </div>
                <div className="challenges-header-text">
                    <h1 className="challenges-header-title">{t('visitor.challenges.title', 'Desafios')}</h1>
                    <p className="challenges-header-subtitle">
                        {t('visitor.challenges.subtitle', 'Complete missões e ganhe XP!')}
                    </p>
                </div>
            </header>

            {isGuest ? (
                <div className="challenges-empty" style={{ marginTop: "2rem", background: "rgba(212, 175, 55, 0.05)", border: "1px dashed #d4af37", padding: "4rem 2rem" }}>
                    <Target size={48} className="text-gold mb-4" />
                    <h2 className="text-xl font-bold text-gold">{t("visitor.challengespage.desafiosECaasAoTesouro", "Desafios e Caças ao Tesouro")}</h2>
                    <p className="max-w-md mx-auto mb-6 text-secondary" style={{ opacity: 0.8 }}>{t("visitor.challengespage.completeMissesInterativasECaas", "Complete missões interativas e caças ao tesouro pelo museu para ganhar XP e subir no ranking. Crie sua conta para registrar seu progresso!")}</p>
                    <button
                        onClick={() => navigate("/register")}
                        className="hunt-start-btn"
                        style={{ width: "auto", padding: "0.8rem 2.5rem", borderRadius: "2rem", display: "flex", alignItems: "center", gap: "0.5rem", margin: "0 auto" }}
                    >
                        Criar Conta <ChevronRight size={18} />
                    </button>
                </div>
            ) : (
                <>
                    {/* User XP */}
                    <section className="challenges-xp-section">
                        <XpProgressBar currentXp={userXp} level={calculateLevel(userXp)} />
                    </section>

                    {/* Daily Challenge */}
                    <section className="challenges-section">
                        <h2 className="challenges-section-title">
                            <Clock size={20} />
                            {t('visitor.challenges.daily', 'Desafio do Dia')}
                        </h2>
                        <DailyChallengeWidget />
                    </section>

                    {/* Scavenger Hunts */}
                    <section className="challenges-section">
                        <h2 className="challenges-section-title">
                            <Map size={20} />
                            {t('visitor.challenges.hunts', 'Caças ao Tesouro')}
                        </h2>

                        {loading ? (
                            <div className="challenges-loading">Carregando...</div>
                        ) : hunts.length === 0 ? (
                            <div className="challenges-empty">
                                <Trophy size={48} />
                                <h3>{t("visitor.challengespage.nenhumaCaaAtiva", "Nenhuma caça ativa")}</h3>
                                <p>Volte em breve para novas aventuras!</p>
                            </div>
                        ) : (
                            <div className="hunts-list-premium">
                                {hunts.map(hunt => (
                                    <HuntCard key={hunt.id} hunt={hunt} />
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}
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
            window.location.href = `/desafios/cacas/${hunt.id}`;
        } catch (error) {
            console.error('Error starting hunt:', error);
        } finally {
            setStarting(false);
        }
    };

    return (
        <div className="hunt-card-premium">
            <div className="hunt-card-icon">🗺️</div>
            <div className="hunt-card-info">
                <h4 className="hunt-card-title">{hunt.title}</h4>
                <p className="hunt-card-description">{hunt.description}</p>
                <div className="hunt-card-meta">
                    <span className="hunt-meta-item">
                        <Map size={14} /> {hunt._count.steps} pistas
                    </span>
                    <span className="hunt-meta-item reward">
                        <Star size={14} /> {hunt.xpReward} XP
                    </span>
                </div>
            </div>
            <button className="hunt-start-btn" onClick={handleStart} disabled={starting}>
                {starting ? '...' : <ChevronRight size={20} />}
            </button>
        </div>
    );
};
