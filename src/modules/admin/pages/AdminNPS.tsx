import { useTranslation } from "react-i18next";
﻿import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, ThumbsUp, ThumbsDown, Minus, TrendingUp, MessageCircle } from "lucide-react";
import { toast } from "react-hot-toast";

interface NPSReport {
    nps: number;
    total: number;
    promoters: number;
    passives: number;
    detractors: number;
    promoterPct: number;
    passivePct: number;
    detractorPct: number;
    distribution: number[];
    recentComments: Array<{ score: number; comment: string; date: string }>;
    monthlyTrend: Array<{ month: string; nps: number; count: number }>;
}

export const AdminNPS: React.FC = () => {
  const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [report, setReport] = useState<NPSReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [months, setMonths] = useState(6);

    const fetchReport = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/nps/report?tenantId=${tenantId}&months=${months}`);
            setReport(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar NPS");
        } finally {
            setLoading(false);
        }
    }, [tenantId, months]);

    useEffect(() => {
        if (tenantId) fetchReport();
    }, [tenantId, fetchReport]);

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}><Loader2 className="animate-spin" style={{ color: "#d4af37" }} /></div>;
    if (!report) return null;

    const npsColor = report.nps >= 50 ? "text-green-400" : report.nps >= 0 ? "text-amber-400" : "text-red-400";
    const npsLabel = report.nps >= 75 ? "Excelente" : report.nps >= 50 ? "Muito Bom" : report.nps >= 0 ? "Bom" : "Crítico";

    return (
        <div style={{ display: "grid", gap: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 className="section-title" style={{ margin: 0 }}>Net Promoter Score</h1>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>"De 0 a 10, quanto você recomendaria este museu?"</p>
                </div>
                <select
                    value={months}
                    onChange={e => setMonths(Number(e.target.value))}
                    style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.5rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }}
                >
                    <option value={3}>{t("admin.nps.ltimos3Meses", "Últimos 3 meses")}</option>
                    <option value={6}>{t("admin.nps.ltimos6Meses", "Últimos 6 meses")}</option>
                    <option value={12}>{t("admin.nps.ltimoAno", "Último ano")}</option>
                </select>
            </div>

            {/* NPS Score */}
            <div className="card" style={{ padding: "2rem", textAlign: "center", borderRadius: "1.5rem" }}>
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">NPS Score</p>
                <p className={`text-7xl font-black ${npsColor}`}>{report.nps}</p>
                <p className={`text-sm font-bold mt-1 ${npsColor}`}>{npsLabel}</p>
                <p className="text-zinc-300 text-xs mt-2">{report.total} respostas</p>
            </div>

            {/* Breakdown */}
            <div className="card-grid">
                <div className="stat-card">
                    <ThumbsUp className="mx-auto text-green-500 mb-2" size={24} />
                    <p className="text-2xl font-black text-white">{report.promoterPct || 0}%</p>
                    <p className="stat-label">Promotores (9-10)</p>
                    <p className="text-green-500 text-sm font-bold mt-1">{report.promoters}</p>
                </div>
                <div className="stat-card">
                    <Minus style={{ margin: "0 auto 0.5rem", color: "#d4af37" }} size={24} />
                    <p className="text-2xl font-black text-white">{report.passivePct || 0}%</p>
                    <p className="stat-label">Neutros (7-8)</p>
                    <p className="text-amber-500 text-sm font-bold mt-1">{report.passives}</p>
                </div>
                <div className="stat-card">
                    <ThumbsDown className="mx-auto text-red-500 mb-2" size={24} />
                    <p className="text-2xl font-black text-white">{report.detractorPct || 0}%</p>
                    <p className="stat-label">Detratores (0-6)</p>
                    <p className="text-red-500 text-sm font-bold mt-1">{report.detractors}</p>
                </div>
            </div>

            {/* Distribution */}
            <div className="card">
                <h2 className="card-title">{t("admin.nps.distribuioDeNotas", "Distribuição de Notas")}</h2>
                <div className="flex items-end gap-2 h-40">
                    {report.distribution.map((count, score) => {
                        const maxCount = Math.max(...report.distribution, 1);
                        const height = (count / maxCount) * 100;
                        const color = score >= 9 ? 'bg-green-500' : score >= 7 ? 'bg-amber-500' : 'bg-red-500';
                        return (
                            <div key={score} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-zinc-400 text-[10px]">{count}</span>
                                <div className={`w-full rounded-t-md ${color} transition-all`} style={{ height: `${Math.max(height, 4)}%`, opacity: count > 0 ? 1 : 0.2 }} />
                                <span className="text-gray-400 text-xs font-bold">{score}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Monthly Trend */}
            {report.monthlyTrend.length > 1 && (
                <div className="card">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-amber-500" /> Tendência Mensal
                    </h2>
                    <div className="flex items-end gap-3 h-32">
                        {report.monthlyTrend.map(m => {
                            const normalizedNps = Math.max(m.nps + 100, 0); // -100 to 100 → 0 to 200
                            const height = (normalizedNps / 200) * 100;
                            const color = m.nps >= 50 ? 'bg-green-500' : m.nps >= 0 ? 'bg-amber-500' : 'bg-red-500';
                            return (
                                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                                    <span className={`text-xs font-bold ${m.nps >= 0 ? 'text-green-400' : 'text-red-400'}`}>{m.nps}</span>
                                    <div className={`w-full rounded-t-md ${color}`} style={{ height: `${Math.max(height, 4)}%` }} />
                                    <span className="text-zinc-400 text-[10px]">{m.month.slice(5)}/{m.month.slice(2, 4)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Recent Comments */}
            {report.recentComments.length > 0 && (
                <div className="card">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <MessageCircle size={20} style={{ color: "#60a5fa" }} />{t("admin.nps.comentriosRecentes", "Comentários Recentes")}</h2>
                    <div style={{ display: "grid", gap: "0.75rem" }}>
                        {report.recentComments.map((c, i) => (
                            <div key={i} className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${c.score >= 9 ? 'bg-green-500/10 text-green-400' : c.score >= 7 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {c.score}
                                </div>
                                <div>
                                    <p className="text-gray-300 text-sm">{c.comment}</p>
                                    <p className="text-zinc-300 text-xs mt-1">{new Date(c.date).toLocaleDateString("pt-BR")}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
