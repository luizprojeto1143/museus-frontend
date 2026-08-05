import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { logger } from "@/utils/logger";

import { api } from "../../../../api/client";
import { useAuth } from "../../../auth/AuthContext";
import { Loader2, Target, Plus, Trash2 } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { toast } from "react-hot-toast";
import { isAxiosError } from "axios";
import { z } from "zod";

interface PPAGoal {
    id: string;
    title: string;
    description?: string | null;
    metric: string;
    targetValue: number;
    currentValue: number;
    year: number;
    quarter?: number | null;
}

interface PPAFormState {
    title: string;
    description: string;
    metric: string;
    targetValue: string;
    year: number;
    quarter: string;
}

interface ApiErrorResponse {
    error?: string;
    message?: string;
}

const ppaFormSchema = z.object({
    title: z.string().trim().min(2, "Preencha o titulo da meta."),
    targetValue: z.string().refine((value) => Number(value) > 0, "Informe um valor alvo maior que zero."),
    year: z.number().int().min(2024).max(2035),
    quarter: z.string().refine((value) => value === "" || ["1", "2", "3", "4"].includes(value), "Trimestre invalido.")
});

function getApiErrorMessage(err: unknown, fallback: string) {
    if (isAxiosError<ApiErrorResponse>(err)) {
        return err.response?.data?.message || err.response?.data?.error || fallback;
    }
    return fallback;
}

export const MunicipalPPA: React.FC = () => {
  const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [goals, setGoals] = useState<PPAGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<PPAFormState>({ title: '', description: '', metric: 'visitantes', targetValue: '', year: new Date().getFullYear(), quarter: '' });
    const [deleteTarget, setDeleteTarget] = useState<PPAGoal | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get<PPAGoal[]>(`/ppa`, { params: { tenantId, year } });
            setGoals(res.data);
        } catch (error: unknown) { logger.error("Erro ao carregar metas PPA.", error); toast.error(getApiErrorMessage(error, "Erro ao carregar metas")); }
        finally { setLoading(false); }
    }, [tenantId, year]);

    useEffect(() => { if (tenantId) fetchData(); }, [tenantId, fetchData]);

    const onSave = async () => {
        const validation = ppaFormSchema.safeParse(form);
        if (!validation.success) return toast.error(validation.error.issues[0]?.message || "Revise os dados da meta.");
        try {
            await api.post("/ppa", { ...form, targetValue: Number(form.targetValue), quarter: form.quarter ? Number(form.quarter) : null });
            toast.success("Meta criada!");
            setShowForm(false);
            setForm({ title: '', description: '', metric: 'visitantes', targetValue: '', year, quarter: '' });
            fetchData();
        } catch (err: unknown) { toast.error(getApiErrorMessage(err, "Erro ao criar meta")); }
    };

    const onDelete = async () => {
        if (!deleteTarget) return;
        try { await api.delete(`/ppa/${deleteTarget.id}`); toast.success("Meta excluida"); setDeleteTarget(null); fetchData(); } catch (err: unknown) { toast.error(getApiErrorMessage(err, "Erro ao excluir meta")); }
    };

    const _onUpdateProgress = async (id: string, currentValue: number) => {
        try {
            await api.patch(`/ppa/${id}`, { currentValue });
            fetchData();
        } catch (err: unknown) { toast.error(getApiErrorMessage(err, "Erro ao atualizar progresso")); }
    };
    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}><Loader2 className="animate-spin" style={{ color: "var(--accent-primary)" }} /></div>;

    return (
        <div style={{ display: "grid", gap: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 className="section-title" style={{ margin: 0 }}>Metas PPA</h1>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>Plano Plurianual � acompanhamento de metas</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.5rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }}>
                        {[2024, 2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <Button onClick={() => setShowForm(true)} leftIcon={<Plus size={16} />}>Nova Meta</Button>
                </div>
            </div>

            {showForm && (
                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 transition-colors" style={{ display: "grid", gap: "1rem" }}>
                    <h2 className="card-title" style={{ margin: 0 }}>Nova Meta</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div><label style={{ display: "block", color: "var(--accent-primary)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>{t("admin.ppa.ttulo", `T�tulo`)}</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Atender 50.000 visitantes" style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }} /></div>
                        <div><label style={{ display: "block", color: "var(--accent-primary)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Valor Alvo</label><input type="number" value={form.targetValue} onChange={e => setForm({ ...form, targetValue: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }} /></div>
                        <div><label style={{ display: "block", color: "var(--accent-primary)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>{t("admin.ppa.mtrica", `M�trica`)}</label>
                            <select value={form.metric} onChange={e => setForm({ ...form, metric: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }}>
                                <option value="visitantes">Visitantes</option><option value="eventos">Eventos</option><option value="projetos">Projetos</option><option value="oficinas">Oficinas</option><option value="receita">Receita (R$)</option>
                            </select>
                        </div>
                        <div><label style={{ display: "block", color: "var(--accent-primary)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Trimestre (opcional)</label>
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
                    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 transition-colors" style={{ textAlign: "center", padding: "4rem 2rem", border: "2px dashed rgba(212,175,55,0.15)" }}>
                        <Target size={48} style={{ margin: "0 auto 1rem", color: "#64748b", opacity: 0.3 }} />
                        <p style={{ color: "#64748b" }}>Nenhuma meta definida para {year}</p>
                    </div>
                ) : goals.map((g) => {
                    const pct = g.targetValue > 0 ? Math.min(Math.round((g.currentValue / g.targetValue) * 100), 100) : 0;
                    const color = pct >= 100 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';
                    const textColor = pct >= 100 ? 'text-green-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400';
                    return (
                        <div key={g.id} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 style={{ color: "white", fontWeight: 700 }}>{g.title}</h3>
                                    <p style={{ color: "#64748b", fontSize: "0.75rem" }}>{g.metric} {g.quarter ? `� Q${g.quarter}` : '� Anual'}</p>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <span className={`text-2xl font-black ${textColor}`}>{pct}%</span>
                                    <button onClick={() => setDeleteTarget(g)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-zinc-300 hover:text-red-400"><Trash2 size={14} /></button>
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
            {deleteTarget && (
                <div className="bg-[var(--bg-surface)] border border-red-500/20 shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 transition-colors" style={{ display: "grid", gap: "1rem" }}>
                    <div>
                        <h2 className="card-title" style={{ margin: 0 }}>Excluir meta?</h2>
                        <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "0.4rem" }}>{deleteTarget.title}</p>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
                        <Button onClick={onDelete}>Excluir</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

