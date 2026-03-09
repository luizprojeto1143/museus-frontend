import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Trophy, Medal, Star, TrendingUp } from "lucide-react";
import "./AdminShared.css";


export const AdminMuseumBattle: React.FC = () => {
  const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [ranking, setRanking] = useState<any[]>([]);
    const [month, setMonth] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/museum-battle/ranking?month=${month}`);
            setRanking(res.data.ranking || []);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    }, [month]);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}><Loader2 className="animate-spin" style={{ color: "#d4af37" }} /></div>;

    const medals = ['🥇', '🥈', '🥉'];
    const myRank = ranking.find(r => r.tenantId === tenantId);

    return (
        <div style={{ display: "grid", gap: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 className="section-title" style={{ margin: 0 }}>Battle de Museus</h1>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>Ranking competitivo entre equipamentos culturais</p>
                </div>
                <input type="month" value={month} onChange={e => setMonth(e.target.value)} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.5rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }} />
            </div>

            {/* My Position */}
            {myRank && (
                <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-3xl p-8 text-center">
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">{t("admin.museumbattle.suaPosio", `Sua Posição`)}</p>
                    <p className="text-6xl font-black text-amber-400">#{myRank.rank}</p>
                    <p className="text-white font-bold mt-1">{myRank.name}</p>
                    <p className="text-2xl font-black text-white mt-2">{myRank.score} <span className="text-zinc-400 text-sm">pts</span></p>
                    <div className="flex justify-center gap-6 mt-4 text-sm">
                        <span className="text-gray-400">{myRank.visitors} visitantes</span>
                        <span className="text-gray-400">{myRank.events} eventos</span>
                        <span className="text-gray-400">★ {myRank.avgRating}</span>
                    </div>
                </div>
            )}

            {/* Ranking */}
            <div className="card" style={{ overflow: "hidden", padding: 0 }}>
                <div className="px-6 py-4 border-b border-white/5">
                    <h2 className="card-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}><Trophy size={20} className="text-amber-500" /> Ranking Mensal</h2>
                </div>
                {ranking.length === 0 ? (
                    <div className="py-16 text-center">
                        <Trophy size={48} style={{ margin: "0 auto 1rem", color: "#64748b", opacity: 0.3 }} />
                        <p style={{ color: "#64748b" }}>{t("admin.museumbattle.nenhumRankingParaEsteMs", `Nenhum ranking para este mês`)}</p>
                        <p className="text-zinc-300 text-xs mt-1">O Master precisa calcular o ranking primeiro</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {ranking.map((r: any) => {
                            const isMe = r.tenantId === tenantId;
                            return (
                                <div key={r.tenantId} className={`px-6 py-4 flex items-center gap-4 ${isMe ? 'bg-amber-500/5' : 'hover:bg-zinc-900/40 border border-gold/20/5'} transition-colors`}>
                                    <span className="text-2xl w-10 text-center shrink-0">
                                        {r.rank <= 3 ? medals[r.rank - 1] : <span className="text-zinc-300 text-lg font-bold">{r.rank}</span>}
                                    </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p className={`font-bold text-sm truncate ${isMe ? 'text-amber-400' : 'text-white'}`}>{r.name} {isMe && '(você)'}</p>
                                        <p style={{ color: "#64748b", fontSize: "0.75rem" }}>{r.city || 'Cidade não informada'}</p>
                                    </div>
                                    <div className="flex items-center gap-6 text-xs text-gray-400 shrink-0">
                                        <span>{r.visitors} 👥</span>
                                        <span>{r.events} 📅</span>
                                        <span>★ {r.avgRating}</span>
                                    </div>
                                    <span className={`text-lg font-black w-16 text-right ${r.rank === 1 ? 'text-amber-400' : r.rank <= 3 ? 'text-gray-300' : 'text-zinc-400'}`}>{r.score}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
