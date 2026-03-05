import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, TrendingDown, TrendingUp, AlertTriangle, Star, Lightbulb } from "lucide-react";
import { toast } from "react-hot-toast";
import "./AdminShared.css";


interface SentimentReport {
    summary: {
        total: number;
        avgRating: number;
        sentimentBreakdown: { positive: number; neutral: number; negative: number };
        positivePct: number;
        neutralPct: number;
        negativePct: number;
    };
    byWork: Array<{ workId: string; title: string; avgRating: number; reviewCount: number; positiveCount: number; negativeCount: number }>;
    byRoom: Array<{ room: string; avgRating: number; reviewCount: number }>;
    recentNegative: Array<{ workTitle: string; room: string; rating: number; comment: string; visitorName: string; date: string }>;
    insights: string[];
}

export const AdminSentimentAnalysis: React.FC = () => {
    const { tenantId } = useAuth();
    const [report, setReport] = useState<SentimentReport | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchReport = useCallback(async () => {
        try {
            const res = await api.get(`/sentiment/report?tenantId=${tenantId}`);
            setReport(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar análise");
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        if (tenantId) fetchReport();
    }, [tenantId, fetchReport]);

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}><Loader2 className="animate-spin" style={{ color: "#d4af37" }} /></div>;
    if (!report) return null;

    const s = report.summary;

    return (
        <div style={{ display: "grid", gap: "2rem" }}>
            <div>
                <h1 className="section-title" style={{ margin: 0 }}>Análise de Sentimento</h1>
                <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>Inteligência sobre as avaliações dos visitantes</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card">
                    <Star style={{ margin: "0 auto 0.5rem", color: "#d4af37" }} size={24} />
                    <p className="stat-value">{s.avgRating}</p>
                    <p className="stat-label">Média Geral</p>
                </div>
                <div className="stat-card">
                    <TrendingUp className="mx-auto text-green-500 mb-2" size={24} />
                    <p className="stat-value" style={{ color: "#22c55e" }}>{s.positivePct || 0}%</p>
                    <p className="stat-label">Positivas</p>
                </div>
                <div className="stat-card">
                    <TrendingDown className="mx-auto text-red-500 mb-2" size={24} />
                    <p className="text-3xl font-black text-red-400">{s.negativePct || 0}%</p>
                    <p className="stat-label">Negativas</p>
                </div>
                <div className="stat-card">
                    <p className="stat-value">{s.total}</p>
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-2">Total Avaliações</p>
                </div>
            </div>

            {/* Insights */}
            {report.insights.length > 0 && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-amber-400 mb-3 flex items-center gap-2">
                        <Lightbulb size={20} /> Insights Automáticos
                    </h2>
                    <ul style={{ display: "grid", gap: "0.5rem" }}>
                        {report.insights.map((insight, i) => (
                            <li key={i} className="text-gray-300 text-sm">{insight}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* By Room */}
            {report.byRoom.length > 0 && (
                <div className="card">
                    <h2 className="card-title">Sentimento por Sala</h2>
                    <div style={{ display: "grid", gap: "0.75rem" }}>
                        {report.byRoom.map(room => {
                            const pct = (room.avgRating / 5) * 100;
                            const color = room.avgRating >= 4 ? 'bg-green-500' : room.avgRating >= 3 ? 'bg-amber-500' : 'bg-red-500';
                            return (
                                <div key={room.room} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <span className="text-gray-300 text-sm font-bold w-32 shrink-0 truncate">{room.room}</span>
                                    <div className="flex-1 h-3 bg-black/40 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className={`text-sm font-black w-12 text-right ${room.avgRating >= 4 ? 'text-green-400' : room.avgRating >= 3 ? 'text-amber-400' : 'text-red-400'}`}>
                                        {room.avgRating}
                                    </span>
                                    <span className="text-zinc-300 text-xs w-16 text-right">{room.reviewCount} av.</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* By Work */}
            {report.byWork.length > 0 && (
                <div className="card" style={{ overflow: "hidden", padding: 0 }}>
                    <div className="px-6 py-4 border-b border-white/5">
                        <h2 className="card-title" style={{ margin: 0 }}>Ranking por Obra</h2>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-black/40 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-3">Obra</th>
                                <th className="px-6 py-3 text-center">Média</th>
                                <th className="px-6 py-3 text-center">Avaliações</th>
                                <th className="px-6 py-3 text-center">👍</th>
                                <th className="px-6 py-3 text-center">👎</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {report.byWork.map(w => (
                                <tr key={w.workId} className="hover:bg-zinc-900/40 border border-gold/20/5 transition-colors">
                                    <td className="px-6 py-3 text-white text-sm font-bold">{w.title}</td>
                                    <td className={`px-6 py-3 text-center font-black ${w.avgRating >= 4 ? 'text-green-400' : w.avgRating >= 3 ? 'text-amber-400' : 'text-red-400'}`}>{w.avgRating}</td>
                                    <td className="px-6 py-3 text-center text-gray-400 text-sm">{w.reviewCount}</td>
                                    <td className="px-6 py-3 text-center text-green-400 text-sm">{w.positiveCount}</td>
                                    <td className="px-6 py-3 text-center text-red-400 text-sm">{w.negativeCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Recent Negative */}
            {report.recentNegative.length > 0 && (
                <div className="card" style={{ border: "1px solid rgba(239,68,68,0.2)" }}>
                    <h2 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                        <AlertTriangle size={20} /> Avaliações Negativas Recentes
                    </h2>
                    <div style={{ display: "grid", gap: "0.75rem" }}>
                        {report.recentNegative.map((r, i) => (
                            <div key={i} className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
                                <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center text-xs font-black shrink-0">
                                    {r.rating}
                                </div>
                                <div>
                                    <p className="text-gray-300 text-sm">{r.comment}</p>
                                    <p className="text-zinc-300 text-xs mt-1">{r.workTitle} {r.room ? `• ${r.room}` : ''} • {new Date(r.date).toLocaleDateString("pt-BR")}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
