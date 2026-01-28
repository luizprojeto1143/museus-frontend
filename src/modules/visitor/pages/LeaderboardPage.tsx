import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { getFullUrl } from "../../../utils/url";
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
            <header className="leaderboard-page-header">
                <h1 className="leaderboard-page-title">{t("visitor.leaderboard.title", "Ranking Global")}</h1>
                <p className="leaderboard-page-subtitle">{t("visitor.leaderboard.subtitle", "Os maiores exploradores da cultura")}</p>
            </header>

            {/* My Rank Card */}
            {myRank && (
                <div className="my-rank-card-premium">
                    <div className="my-rank-left">
                        <div className="my-rank-circle">
                            <span className="my-rank-label">RANK</span>
                            <span className="my-rank-value">#{myRank.rank}</span>
                        </div>
                        <div className="my-rank-info-text">
                            <span className="my-rank-position-label">{t("visitor.leaderboard.myRank", "Sua Posição")}</span>
                            <span className="my-rank-name">{myRank.name}</span>
                        </div>
                    </div>

                    <div className="my-rank-right">
                        <div className="my-rank-xp">{myRank.xp}</div>
                        <div className="my-rank-xp-label">{t("visitor.leaderboard.xpTotal", "XP TOTAL")}</div>
                    </div>
                </div>
            )}

            {/* Podium */}
            {entries.length > 0 && (
                <div className="podium-container">
                    {entries[1] && renderPodiumItem(entries[1], 2)}
                    {entries[0] && renderPodiumItem(entries[0], 1)}
                    {entries[2] && renderPodiumItem(entries[2], 3)}
                </div>
            )}

            {/* Ranking List */}
            <div className="ranking-list">
                {rest.length === 0 && entries.length === 0 ? (
                    <div className="ranking-empty">
                        <span className="ranking-empty-icon">🏆</span>
                        <p>{t("visitor.leaderboard.empty", "Nenhum visitante pontuou ainda.")}</p>
                    </div>
                ) : (
                    rest.map((entry) => renderListItem(entry))
                )}
            </div>

            {/* Sticky User Rank Bar */}
            {myRank && (
                <div className="sticky-rank-bottom">
                    <div className="sticky-rank-content">
                        <div className="sticky-rank-left">
                            <div className="sticky-rank-circle">
                                #{myRank.rank}
                            </div>
                            <div className="sticky-rank-text">
                                <span className="sticky-rank-label">{t("visitor.leaderboard.myRank", "Sua Posição")}</span>
                                <span className="sticky-rank-name">{t("common.you", "Você")}</span>
                            </div>
                        </div>
                        <div className="sticky-rank-xp">
                            {myRank.xp} XP
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
