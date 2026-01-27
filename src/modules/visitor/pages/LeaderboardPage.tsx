import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { getFullUrl } from "../../../utils/url";

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
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid var(--accent-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p>{t("common.loading")}</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    const top3 = entries.slice(0, 3);
    const rest = entries.slice(3);

    const renderPodiumItem = (entry: LeaderboardEntry, place: number) => {
        const placeClass = place === 1 ? 'first' : place === 2 ? 'second' : 'third';

        return (
            <div key={entry.id} className={`podium-item ${placeClass}`}>
                <div className="podium-avatar-container">
                    {entry.photoUrl ? (
                        <img src={getFullUrl(entry.photoUrl) ?? undefined} alt={entry.name || "User"} className="podium-avatar" />
                    ) : (
                        <div className="podium-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>👤</div>
                    )}
                    <div className="podium-rank-badge">
                        {place}
                    </div>
                </div>
                <div className="podium-name">
                    {entry.name || t("common.anonymous", "Anônimo")}
                </div>
                <div className="podium-xp">
                    {entry.xp} XP
                </div>
            </div>
        );
    };

    const renderListItem = (entry: LeaderboardEntry, index: number, isMe: boolean = false) => (
        <div key={entry.id || index} className={`leaderboard-item ${isMe ? 'is-me' : ''}`}>
            <div className="item-rank">
                #{entry.rank}
            </div>

            {entry.photoUrl ? (
                <img src={getFullUrl(entry.photoUrl) ?? undefined} alt={entry.name || "User"} className="item-avatar" />
            ) : (
                <div className="item-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', background: 'var(--bg-elevated)' }}>👤</div>
            )}

            <div className="item-info">
                <div className="item-name">
                    {entry.name || t("common.anonymous", "Anônimo")}
                    {isMe && <span className="item-me-tag">{t("common.you", "(Você)")}</span>}
                </div>
            </div>

            <div style={{ textAlign: 'right' }}>
                <div className="item-xp">{entry.xp}</div>
                <span className="item-xp-label">{t("visitor.leaderboard.xpTotal", "XP TOTAL")}</span>
            </div>
        </div>
    );

    return (
        <div className="page-container" style={{ paddingBottom: '100px' }}>
            <div className="leaderboard-header">
                <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{t("visitor.leaderboard.title", "Ranking Global")}</h1>
                <p className="section-subtitle" style={{ fontSize: '1.1rem' }}>{t("visitor.leaderboard.subtitle", "Os maiores exploradores da cultura")}</p>
            </div>

            {/* My Rank Top Card */}
            {myRank && (
                <div className="my-rank-card">
                    <div className="my-rank-info">
                        <div className="my-rank-number">
                            <span className="rank-label">RANK</span>
                            <span className="rank-value">#{myRank.rank}</span>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--fg-muted)', textTransform: 'uppercase' }}>{t("visitor.leaderboard.myRank", "Sua Posição")}</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--fg-main)' }}>{myRank.name}</div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{myRank.xp}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--fg-soft)', fontWeight: 'bold' }}>{t("visitor.leaderboard.xpTotal", "XP TOTAL")}</div>
                    </div>
                </div>
            )}

            {/* Podium */}
            {entries.length > 0 && (
                <div className="leaderboard-podium">
                    {entries[1] && renderPodiumItem(entries[1], 2)}
                    {entries[0] && renderPodiumItem(entries[0], 1)}
                    {entries[2] && renderPodiumItem(entries[2], 3)}
                </div>
            )}

            {/* List */}
            <div className="leaderboard-list">
                {rest.length === 0 && top3.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
                        <p style={{ color: 'var(--fg-muted)' }}>{t("visitor.leaderboard.empty", "Nenhum visitante pontuou ainda.")}</p>
                    </div>
                ) : (
                    rest.map((entry) => renderListItem(entry, -1))
                )}
            </div>

            {/* Sticky User Rank (Bottom) */}
            {myRank && (
                <div className="sticky-rank-bar">
                    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                background: 'var(--accent-gold)', color: 'var(--bg-page)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                            }}>
                                #{myRank.rank}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--fg-muted)' }}>{t("visitor.leaderboard.myRank", "Sua Posição")}</div>
                                <div style={{ fontWeight: 'bold' }}>{t("common.you", "Você")}</div>
                            </div>
                        </div>
                        <div style={{ fontWeight: 'bold', color: 'var(--accent-gold)', fontSize: '1.2rem' }}>
                            {myRank.xp} XP
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
