import { useTranslation } from "react-i18next";
﻿import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Target, Plus, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { toast } from "react-hot-toast";

export const AdminPPA: React.FC = () => {
  const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', metric: 'visitantes', targetValue: '', year: new Date().getFullYear(), quarter: '' });

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get(`/ppa?tenantId=${tenantId}&year=${year}`);
            setGoals(res.data);
        } catch (error) { console.error(error); toast.error("Erro ao carregar metas"); }
        finally { setLoading(false); }
    }, [tenantId, year]);

    useEffect(() => { if (tenantId) fetchData(); }, [tenantId, fetchData]);

    const onSave = async () => {
        if (!form.title || !form.targetValue) return toast.error("Preencha título e valor");
        try {
            await api.post("/ppa", { ...form, targetValue: parseInt(form.targetValue as string), quarter: form.quarter ? parseInt(form.quarter as string) : null });
            toast.success("Meta criada!");
            setShowForm(false);
            fetchData();
        } catch (err) { toast.error("Erro"); }
    };

    const onDelete = async (id: string) => {
        if (!confirm("Excluir meta?")) return;
        try { await api.delete(`/ppa/${id}`); toast.success("Meta excluída"); fetchData(); } catch (err) { toast.error("Erro"); }
    };

    const onUpdateProgress = async (id: string, currentValue: number) => {
        try {
            await api.patch(`/ppa/${id}`, { currentValue });
            fetchData();
        } catch (err) { toast.error("Erro"); }
    };

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}><Loader2 className="animate-spin" style={{ color: "#d4af37" }} /></div>;

    return (
        <div style={{ display: "grid", gap: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 className="section-title" style={{ margin: 0 }}>Metas PPA</h1>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>Plano Plurianual — acompanhamento de metas</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.5rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }}>
                        {[2024, 2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <Button onClick={() => setShowForm(true)} leftIcon={<Plus size={16} />}>Nova Meta</Button>
                </div>
            </div>

            {showForm && (
                <div className="card" style={{ display: "grid", gap: "1rem" }}>
                    <h2 className="card-title" style={{ margin: 0 }}>Nova Meta</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>{t("admin.ppa.ttulo", "Título")}</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Atender 50.000 visitantes" style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }} /></div>
                        <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Valor Alvo</label><input type="number" value={form.targetValue} onChange={e => setForm({ ...form, targetValue: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }} /></div>
                        <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>{t("admin.ppa.mtrica", "Métrica")}</label>
                            <select value={form.metric} onChange={e => setForm({ ...form, metric: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }}>
                                <option value="visitantes">Visitantes</option><option value="eventos">Eventos</option><option value="projetos">Projetos</option><option value="oficinas">Oficinas</option><option value="receita">Receita (R$)</option>
                            </select>
                        </div>
                        <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Trimestre (opcional)</label>
                            <select value={form.quarter} onChange={e => setForm({ ...form, quarter: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }}>
                                <option value="">Anual</option><option value="1">Q1</option><option value="2">Q2</option><option value="3">Q3</option><option value="4">Q4</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                        <Button onClick={onSave}>Criar Meta</Button>
                    </div>
                </div>
            )}

            <div style={{ display: "grid", gap: "1rem" }}>
                {goals.length === 0 ? (
                    <div className="card" style={{ textAlign: "center", padding: "4rem 2rem", border: "2px dashed rgba(212,175,55,0.15)" }}>
                        <Target size={48} style={{ margin: "0 auto 1rem", color: "#64748b", opacity: 0.3 }} />
                        <p style={{ color: "#64748b" }}>Nenhuma meta definida para {year}</p>
                    </div>
                ) : goals.map((g: any) => {
                    const pct = g.targetValue > 0 ? Math.min(Math.round((g.currentValue / g.targetValue) * 100), 100) : 0;
                    const color = pct >= 100 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';
                    const textColor = pct >= 100 ? 'text-green-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400';
                    return (
                        <div key={g.id} className="card">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 style={{ color: "white", fontWeight: 700 }}>{g.title}</h3>
                                    <p style={{ color: "#64748b", fontSize: "0.75rem" }}>{g.metric} {g.quarter ? `• Q${g.quarter}` : '• Anual'}</p>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <span className={`text-2xl font-black ${textColor}`}>{pct}%</span>
                                    <button onClick={() => onDelete(g.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-zinc-300 hover:text-red-400"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <div className="w-full bg-black/40 rounded-full h-3 mb-2">
                                <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                            </div>
                            <div className="flex justify-between text-xs text-zinc-400">
                                <span>Atual: <span style={{ color: "white", fontWeight: 700 }}>{g.currentValue.toLocaleString("pt-BR")}</span></span>
                                <span>Meta: <span style={{ color: "white", fontWeight: 700 }}>{g.targetValue.toLocaleString("pt-BR")}</span></span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
