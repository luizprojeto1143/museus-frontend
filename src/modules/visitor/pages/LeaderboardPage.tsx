import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { getFullUrl } from "../../../utils/url";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Leaderboard.css";

type LeaderboardEntry = {
    id: string;
    name: string | null;
    photoUrl: string | null;
    xp: number;
    rank: number;
    achievementsCount: number;
};

export const LeaderboardPage: React.FC = () => {
    const { t } = useTranslation();
    const { isGuest } = useAuth();
    const navigate = useNavigate();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchLeaderboard = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/leaderboard");
            if (res.data.ranking) {
                setEntries(res.data.ranking);
                setMyRank(res.data.myRank);
            } else {
                setEntries(res.data);
            }
        } catch (err) {
            console.error("Erro ao carregar ranking", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    if (loading) return (
        <div className="leaderboard-loading">
            <div className="leaderboard-spinner"></div>
            <p>{t("common.loading")}</p>
        </div>
    );

    const rest = entries.slice(3);

    const renderPodiumItem = (entry: LeaderboardEntry, place: number) => {
        const placeClass = place === 1 ? 'first' : place === 2 ? 'second' : 'third';

        return (
            <div key={entry.id} className={`podium-item-premium ${placeClass}`}>
                <div className="podium-avatar-wrapper">
                    {entry.photoUrl ? (
                        <img src={getFullUrl(entry.photoUrl) ?? undefined} alt={entry.name || "User"} className="podium-avatar-img" />
                    ) : (
                        <div className="podium-avatar-placeholder">👤</div>
                    )}
                    <div className="podium-rank-number">{place}</div>
                </div>
                <div className="podium-user-name">
                    {entry.name || t("common.anonymous", "Anônimo")}
                </div>
                <div className="podium-user-xp">
                    {entry.xp} XP
                </div>
            </div>
        );
    };

    const renderListItem = (entry: LeaderboardEntry, isMe: boolean = false) => (
        <div key={entry.id} className={`ranking-item ${isMe ? 'is-current-user' : ''}`}>
            <div className="ranking-position">
                #{entry.rank}
            </div>

            {entry.photoUrl ? (
                <img src={getFullUrl(entry.photoUrl) ?? undefined} alt={entry.name || "User"} className="ranking-avatar" />
            ) : (
                <div className="ranking-avatar-placeholder">👤</div>
            )}

            <div className="ranking-info">
                <div className="ranking-name">
                    {entry.name || t("common.anonymous", "Anônimo")}
                    {isMe && <span className="ranking-me-tag">{t("common.you", "(Você)")}</span>}
                </div>
            </div>

            <div className="ranking-xp-container">
                <div className="ranking-xp-value">{entry.xp}</div>
                <span className="ranking-xp-label">{t("visitor.leaderboard.xpTotal", "XP TOTAL")}</span>
            </div>
        </div>
    );

    return (
        <div className="leaderboard-container">
            <header className="leaderboard-header-premium">
                <span className="leaderboard-badge">Panteão dos Exploradores</span>
                <h1 className="leaderboard-title-premium">Ranking Global</h1>
                <p className="hero-subtitle-premium">Os heróis da cultura que mais desbravaram os segredos do nosso acervo e acumularam o maior legado.</p>
            </header>

            {isGuest ? (
                <div className="my-rank-hud-premium cursor-pointer" onClick={() => navigate("/register")}>
                    <div className="my-rank-info-premium">
                        <div className="my-rank-number-premium text-muted">?</div>
                        <div className="my-rank-labels-premium">
                            <span className="my-rank-top-label">Seu Legado</span>
                            <span className="my-rank-user-name text-muted">Aguardando Iniciação</span>
                        </div>
                    </div>
                    <div className="my-rank-xp-premium">
                        <span className="text-gold text-[10px] uppercase font-mono">Crie sua conta para participar</span>
                    </div>
                </div>
            ) : myRank && (
                <div className="my-rank-hud-premium">
                    <div className="my-rank-info-premium">
                        <div className="my-rank-number-premium">#{myRank.rank}</div>
                        <div className="my-rank-labels-premium">
                            <span className="my-rank-top-label">Sua Posição Heroica</span>
                            <span className="my-rank-user-name">{myRank.name} (Você)</span>
                        </div>
                    </div>
                    <div className="my-rank-xp-premium">
                        <div className="my-rank-xp-val">{myRank.xp}</div>
                        <span className="my-rank-top-label">XP TOTAL acumularo</span>
                    </div>
                </div>
            )}

            {/* Podium */}
            {entries.length > 0 && (
                <div className="podium-container-premium">
                    {/* 2nd Place */}
                    {entries[1] && (
                        <div className="podium-item-premium second">
                            <div className="podium-rank-pill">II</div>
                            <img 
                                src={getFullUrl(entries[1].photoUrl) || 'https://via.placeholder.com/80'} 
                                className="podium-avatar-premium" 
                                alt={entries[1].name || ''} 
                            />
                            <div className="ranking-name-premium">{entries[1].name || 'Anônimo'}</div>
                            <div className="ranking-xp-premium !text-center">{entries[1].xp} XP</div>
                        </div>
                    )}

                    {/* 1st Place */}
                    {entries[0] && (
                        <div className="podium-item-premium first">
                            <div className="podium-rank-pill !bg-gold !text-bg">I</div>
                            <img 
                                src={getFullUrl(entries[0].photoUrl) || 'https://via.placeholder.com/80'} 
                                className="podium-avatar-premium" 
                                alt={entries[0].name || ''} 
                            />
                            <div className="ranking-name-premium !text-3xl">{entries[0].name || 'Anônimo'}</div>
                            <div className="ranking-xp-premium !text-center !text-gold-hi">{entries[0].xp} XP</div>
                        </div>
                    )}

                    {/* 3rd Place */}
                    {entries[2] && (
                        <div className="podium-item-premium third">
                            <div className="podium-rank-pill">III</div>
                            <img 
                                src={getFullUrl(entries[2].photoUrl) || 'https://via.placeholder.com/80'} 
                                className="podium-avatar-premium" 
                                alt={entries[2].name || ''} 
                            />
                            <div className="ranking-name-premium">{entries[2].name || 'Anônimo'}</div>
                            <div className="ranking-xp-premium !text-center">{entries[2].xp} XP</div>
                        </div>
                    )}
                </div>
            )}

            {/* Ranking List */}
            <div className="ranking-list-premium mt-10">
                {rest.length > 0 ? (
                    rest.map((entry) => (
                        <div key={entry.id} className={`ranking-row-premium ${entry.id === myRank?.id ? 'is-me' : ''}`}>
                            <span className="ranking-pos-premium">#{entry.rank}</span>
                            <img 
                                src={getFullUrl(entry.photoUrl) || 'https://via.placeholder.com/40'} 
                                className="ranking-avatar-premium" 
                                alt={entry.name || ''} 
                            />
                            <span className="ranking-name-premium">{entry.name || 'Desbravador Anônimo'}</span>
                            <span className="ranking-xp-premium">{entry.xp} XP</span>
                        </div>
                    ))
                ) : entries.length === 0 && (
                    <div className="workslist-empty py-40">
                        <span className="ranking-empty-icon">🏆</span>
                        <p>Nenhum explorador registrou seu legado ainda.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
