import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Filter, Users, QrCode, CalendarCheck, ShoppingBag, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

interface FunnelStage {
    stage: string;
    count: number;
    pct: number;
}

export const AdminFunnel: React.FC = () => {
  const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [funnel, setFunnel] = useState<FunnelStage[]>([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/analytics/funnel?tenantId=${tenantId}&days=${days}`);
            setFunnel(res.data.funnel || []);
        } catch (error) { console.error(error); toast.error("Erro ao carregar funil"); }
        finally { setLoading(false); }
    }, [tenantId, days]);

    useEffect(() => { if (tenantId) fetchData(); }, [tenantId, fetchData]);

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}><Loader2 className="animate-spin" style={{ color: "#d4af37" }} /></div>;

    const icons = [<Users size={20} />, <QrCode size={20} />, <CalendarCheck size={20} />, <ShoppingBag size={20} />, <RefreshCw size={20} />];
    const colors = ['bg-blue-500', 'bg-cyan-500', 'bg-amber-500', 'bg-green-500', 'bg-purple-500'];
    const textColors = ['text-blue-400', 'text-cyan-400', 'text-amber-400', 'text-green-400', 'text-purple-400'];

    return (
        <div style={{ display: "grid", gap: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 className="section-title" style={{ margin: 0 }}>{t("admin.funnel.funilDeConverso", `Funil de Conversão`)}</h1>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>{t("admin.funnel.daPrimeiraVisitaAtAFidelizao", `Da primeira visita até a fidelização`)}</p>
                </div>
                <select value={days} onChange={e => setDays(Number(e.target.value))} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.5rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }}>
                    <option value={7}>7 dias</option><option value={30}>30 dias</option><option value={90}>90 dias</option>
                </select>
            </div>

            <div style={{ display: "grid", gap: "1rem" }}>
                {funnel.map((stage, idx) => {
                    const maxCount = funnel[0]?.count || 1;
                    const widthPct = Math.max((stage.count / maxCount) * 100, 15);
                    return (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[idx]}/10 ${textColors[idx]} shrink-0`}>
                                {icons[idx]}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="flex justify-between items-center mb-1">
                                    <span style={{ color: "white", fontWeight: 700, fontSize: "0.9rem" }}>{stage.stage}</span>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <span className={`text-sm font-black ${textColors[idx]}`}>{stage.count.toLocaleString("pt-BR")}</span>
                                        <span className="text-zinc-300 text-xs">({stage.pct}%)</span>
                                    </div>
                                </div>
                                <div className="w-full bg-black/40 rounded-full h-4 overflow-hidden">
                                    <div className={`h-full rounded-full ${colors[idx]} transition-all duration-700`} style={{ width: `${widthPct}%` }} />
                                </div>
                                {idx > 0 && funnel[idx - 1].count > 0 && (
                                    <p className="text-zinc-300 text-[10px] mt-0.5">
                                        {Math.round((stage.count / funnel[idx - 1].count) * 100)}% do estágio anterior
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {funnel.length >= 2 && (
                <div className="card">
                    <h2 className="card-title">{t("admin.funnel.anlise", `Análise`)}</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div className="bg-black/30 rounded-xl p-4 text-center">
                            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">{t("admin.funnel.taxaDeAtivao", `Taxa de Ativação`)}</p>
                            <p className="text-2xl font-black text-cyan-400">{funnel[0]?.count > 0 ? Math.round((funnel[1]?.count / funnel[0]?.count) * 100) : 0}%</p>
                            <p className="text-zinc-300 text-[10px]">Cadastrados → Ativos</p>
                        </div>
                        <div className="bg-black/30 rounded-xl p-4 text-center">
                            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">{t("admin.funnel.taxaDeReteno", `Taxa de Retenção`)}</p>
                            <p className="text-2xl font-black text-purple-400">{funnel[0]?.count > 0 ? (funnel[4]?.pct || 0) : 0}%</p>
                            <p className="text-zinc-300 text-[10px]">Cadastrados → Retornaram</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
