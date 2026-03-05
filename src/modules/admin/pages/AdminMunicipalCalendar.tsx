import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Calendar, MapPin, Clock, Users, ExternalLink } from "lucide-react";
import { toast } from "react-hot-toast";
import "./AdminShared.css";


export const AdminMunicipalCalendar: React.FC = () => {
    const { tenantId } = useAuth();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/events?tenantId=${tenantId}&limit=50`);
            const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setEvents(data);
        } catch (error) { console.error(error); toast.error("Erro ao carregar"); }
        finally { setLoading(false); }
    }, [tenantId]);

    useEffect(() => { if (tenantId) fetchData(); }, [tenantId, fetchData]);

    // Filter events by selected month
    const filteredEvents = events.filter(e => {
        if (!e.startDate) return false;
        const d = new Date(e.startDate);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === month;
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    // Group by day
    const grouped = new Map<string, any[]>();
    filteredEvents.forEach(e => {
        const day = new Date(e.startDate).toLocaleDateString("pt-BR", { weekday: 'long', day: 'numeric', month: 'long' });
        if (!grouped.has(day)) grouped.set(day, []);
        grouped.get(day)!.push(e);
    });

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}><Loader2 className="animate-spin" style={{ color: "#d4af37" }} /></div>;

    return (
        <div style={{ display: "grid", gap: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 className="section-title" style={{ margin: 0 }}>Calendário Cultural</h1>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>Visão unificada da programação municipal</p>
                </div>
                <input type="month" value={month} onChange={e => setMonth(e.target.value)} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.5rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }} />
            </div>

            {/* Summary */}
            <div className="card-grid">
                <div className="stat-card">
                    <Calendar style={{ margin: "0 auto 0.5rem", color: "#d4af37" }} size={24} />
                    <p className="stat-value">{filteredEvents.length}</p>
                    <p className="stat-label">Eventos no Mês</p>
                </div>
                <div className="stat-card">
                    <p className="stat-value">{grouped.size}</p>
                    <p className="stat-label">Dias com Evento</p>
                </div>
                <div className="stat-card">
                    <p className="stat-value" style={{ color: "#d4af37" }}>{filteredEvents.reduce((sum, e) => sum + (e.maxCapacity || 0), 0)}</p>
                    <p className="stat-label">Capacidade Total</p>
                </div>
            </div>

            {/* Calendar view */}
            {grouped.size === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "4rem 2rem", border: "2px dashed rgba(212,175,55,0.15)" }}>
                    <Calendar size={48} style={{ margin: "0 auto 1rem", color: "#64748b", opacity: 0.3 }} />
                    <p style={{ color: "#64748b" }}>Nenhum evento neste mês</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Array.from(grouped.entries()).map(([day, dayEvents]) => (
                        <div key={day}>
                            <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider mb-3">{day}</h3>
                            <div style={{ display: "grid", gap: "0.5rem" }}>
                                {dayEvents.map((e: any) => (
                                    <div key={e.id} className="card" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer", transition: "all 0.2s" }}>
                                        <div className="w-14 text-center shrink-0">
                                            <p className="text-lg font-black text-white">{new Date(e.startDate).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ color: "white", fontWeight: 700, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</p>
                                            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                                                {e.location && <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><MapPin size={10} />{e.location}</span>}
                                                {e.type && <span className="text-[10px] bg-zinc-900/40 border border-gold/20/5 px-1.5 py-0.5 rounded">{e.type}</span>}
                                                {e.maxCapacity && <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Users size={10} />{e.maxCapacity}</span>}
                                            </div>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${e.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-400' : e.status === 'CANCELED' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>{e.status || 'DRAFT'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
