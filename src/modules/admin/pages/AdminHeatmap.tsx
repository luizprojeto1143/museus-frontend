import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, MapPin, Flame, Eye } from "lucide-react";
import { toast } from "react-hot-toast";
import "./AdminShared.css";


interface HeatmapData {
    period: { days: number; since: string };
    totalVisits: number;
    byWork: Array<{ workId: string; title: string; room: string; floor: string; visits: number; imageUrl: string | null }>;
    byRoom: Array<{ room: string; visits: number; works: number }>;
}

export const AdminHeatmap: React.FC = () => {
    const { tenantId } = useAuth();
    const [data, setData] = useState<HeatmapData | null>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/analytics/heatmap?tenantId=${tenantId}&days=${days}`);
            setData(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar heatmap");
        } finally {
            setLoading(false);
        }
    }, [tenantId, days]);

    useEffect(() => {
        if (tenantId) fetchData();
    }, [tenantId, fetchData]);

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}><Loader2 className="animate-spin" style={{ color: "#d4af37" }} /></div>;
    if (!data) return null;

    const maxVisits = Math.max(...(data.byWork.map(w => w.visits) || [1]), 1);
    const maxRoomVisits = Math.max(...(data.byRoom.map(r => r.visits) || [1]), 1);

    const getHeatColor = (visits: number, max: number) => {
        const ratio = visits / max;
        if (ratio >= 0.8) return { bg: "bg-red-500", text: "text-red-400", border: "border-red-500/30" };
        if (ratio >= 0.5) return { bg: "bg-orange-500", text: "text-orange-400", border: "border-orange-500/30" };
        if (ratio >= 0.3) return { bg: "bg-amber-500", text: "text-amber-400", border: "border-amber-500/30" };
        return { bg: "bg-blue-500", text: "text-blue-400", border: "border-blue-500/30" };
    };

    return (
        <div style={{ display: "grid", gap: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 className="section-title" style={{ margin: 0 }}>Heatmap de Circulação</h1>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>Mapa de calor das obras e salas mais visitadas</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ background: "rgba(26,28,34,0.9)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "0.75rem", padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Eye size={16} className="text-amber-500" />
                        <span style={{ color: "white", fontWeight: 700 }}>{data.totalVisits.toLocaleString("pt-BR")}</span>
                        <span className="text-zinc-400 text-sm">visitas</span>
                    </div>
                    <select
                        value={days}
                        onChange={e => setDays(Number(e.target.value))}
                        style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.5rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }}
                    >
                        <option value={7}>7 dias</option>
                        <option value={30}>30 dias</option>
                        <option value={90}>90 dias</option>
                    </select>
                </div>
            </div>

            {/* Room Heatmap */}
            <div className="card">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <MapPin size={20} className="text-amber-500" /> Por Sala
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {data.byRoom.map(room => {
                        const heat = getHeatColor(room.visits, maxRoomVisits);
                        return (
                            <div key={room.room} className={`border ${heat.border} rounded-xl p-4 bg-black/20`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span style={{ color: "white", fontWeight: 700, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{room.room}</span>
                                    <Flame size={14} className={heat.text} />
                                </div>
                                <p className={`text-2xl font-black ${heat.text}`}>{room.visits}</p>
                                <p className="text-zinc-300 text-xs">{room.works} obras</p>
                                <div className="mt-2 w-full bg-black/40 rounded-full h-1.5">
                                    <div className={`h-full rounded-full ${heat.bg}`} style={{ width: `${(room.visits / maxRoomVisits) * 100}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Work Detail */}
            <div className="card" style={{ overflow: "hidden", padding: 0 }}>
                <div className="px-6 py-4 border-b border-white/5">
                    <h2 className="card-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Flame size={20} className="text-red-500" /> Top Obras Visitadas
                    </h2>
                </div>
                <div className="divide-y divide-white/5">
                    {data.byWork.map((work, idx) => {
                        const heat = getHeatColor(work.visits, maxVisits);
                        return (
                            <div key={work.workId} className="px-6 py-4 flex items-center gap-4 hover:bg-zinc-900/40 border border-gold/20/5 transition-colors">
                                <span className="text-zinc-300 text-xs font-bold w-6">{idx + 1}</span>
                                {work.imageUrl ? (
                                    <img src={work.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-lg bg-zinc-900/40 border border-gold/20/5" />
                                )}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ color: "white", fontWeight: 700, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{work.title}</p>
                                    <p style={{ color: "#64748b", fontSize: "0.75rem" }}>{work.room} • {work.floor}º andar</p>
                                </div>
                                <div className="w-32">
                                    <div className="w-full bg-black/40 rounded-full h-2 mb-1">
                                        <div className={`h-full rounded-full ${heat.bg}`} style={{ width: `${(work.visits / maxVisits) * 100}%` }} />
                                    </div>
                                </div>
                                <span className={`font-black text-sm w-16 text-right ${heat.text}`}>{work.visits}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 text-xs text-zinc-400">
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><div className="w-3 h-3 rounded bg-blue-500" /> Baixo</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><div className="w-3 h-3 rounded bg-amber-500" /> Médio</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><div className="w-3 h-3 rounded bg-orange-500" /> Alto</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><div className="w-3 h-3 rounded bg-red-500" /> Muito Alto</div>
            </div>
        </div>
    );
};
