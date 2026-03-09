import { useTranslation } from "react-i18next";
﻿import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Wrench, Plus, ArrowLeftRight, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { toast } from "react-hot-toast";
import "./AdminShared.css";


export const AdminConservation: React.FC = () => {
  const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [records, setRecords] = useState<any[]>([]);
    const [loans, setLoans] = useState<any[]>([]);
    const [works, setWorks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'conservation' | 'loans'>('conservation');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ workId: '', type: 'VISTORIA', description: '', responsibleName: '', condition: 'BOM', notes: '' });

    const fetchData = useCallback(async () => {
        try {
            const [r, l, w] = await Promise.all([
                api.get(`/conservation?tenantId=${tenantId}`),
                api.get(`/conservation/loans?tenantId=${tenantId}`),
                api.get(`/works?tenantId=${tenantId}`)
            ]);
            setRecords(r.data);
            setLoans(l.data);
            setWorks(Array.isArray(w.data) ? w.data : (w.data.data || []));
        } catch (error) { console.error(error); toast.error("Erro ao carregar"); }
        finally { setLoading(false); }
    }, [tenantId]);

    useEffect(() => { if (tenantId) fetchData(); }, [tenantId, fetchData]);

    const onSave = async () => {
        if (!form.workId || !form.responsibleName) return toast.error("Selecione obra e responsável");
        try {
            await api.post("/conservation", form);
            toast.success("Registro criado!");
            setShowForm(false);
            fetchData();
        } catch (err) { toast.error("Erro ao criar registro"); }
    };

    const conditionColor: Record<string, string> = { BOM: 'text-green-400', REGULAR: 'text-amber-400', RUIM: 'text-orange-400', CRITICO: 'text-red-400' };
    const typeLabel: Record<string, string> = { LIMPEZA: '🧹 Limpeza', RESTAURO: '🔧 Restauro', FUMIGACAO: '🧪 Fumigação', VISTORIA: '🔍 Vistoria' };

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}><Loader2 className="animate-spin" style={{ color: "#d4af37" }} /></div>;

    return (
        <div style={{ display: "grid", gap: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 className="section-title" style={{ margin: 0 }}>{t("admin.conservation.conservaoDoAcervo", "Conservação do Acervo")}</h1>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>{t("admin.conservation.manutenoRestauroEmprstimosDeOb", "Manutenção, restauro, empréstimos de obras")}</p>
                </div>
                <Button onClick={() => setShowForm(true)} leftIcon={<Plus size={16} />}>Novo Registro</Button>
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => setTab('conservation')} className={`px-4 py-2 rounded-full text-xs font-bold ${tab === 'conservation' ? 'bg-amber-500 text-black' : 'bg-zinc-900/40 border border-gold/20/5 text-gray-400'}`}>
                    <Wrench size={14} style={{ display: "inline", marginRight: "0.25rem" }} /> Conservação ({records.length})
                </button>
                <button onClick={() => setTab('loans')} className={`px-4 py-2 rounded-full text-xs font-bold ${tab === 'loans' ? 'bg-amber-500 text-black' : 'bg-zinc-900/40 border border-gold/20/5 text-gray-400'}`}>
                    <ArrowLeftRight size={14} style={{ display: "inline", marginRight: "0.25rem" }} /> Empréstimos ({loans.length})
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ display: "grid", gap: "1rem" }}>
                    <h2 className="card-title" style={{ margin: 0 }}>{t("admin.conservation.novoRegistroDeConservao", "Novo Registro de Conservação")}</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Obra</label>
                            <select value={form.workId} onChange={e => setForm({ ...form, workId: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }}>
                                <option value="">Selecione...</option>
                                {works.map((w: any) => <option key={w.id} value={w.id}>{w.title}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Tipo</label>
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }}>
                                <option value="VISTORIA">Vistoria</option><option value="LIMPEZA">Limpeza</option><option value="RESTAURO">Restauro</option><option value="FUMIGACAO">{t("admin.conservation.fumigao", "Fumigação")}</option>
                            </select>
                        </div>
                        <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>{t("admin.conservation.responsvel", "Responsável")}</label><input value={form.responsibleName} onChange={e => setForm({ ...form, responsibleName: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }} /></div>
                        <div>
                            <label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>{t("admin.conservation.condio", "Condição")}</label>
                            <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }}>
                                <option value="BOM">Bom</option><option value="REGULAR">Regular</option><option value="RUIM">Ruim</option><option value="CRITICO">{t("admin.conservation.crtico", "Crítico")}</option>
                            </select>
                        </div>
                    </div>
                    <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Notas</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none", resize: "none" }} /></div>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                        <Button onClick={onSave}>Salvar</Button>
                    </div>
                </div>
            )}

            {tab === 'conservation' && (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                    {records.map((r: any) => {
                        const work = works.find(w => w.id === r.workId);
                        return (
                            <div key={r.id} className="card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                                        <span style={{ color: "white", fontWeight: 700, fontSize: "0.9rem" }}>{work?.title || 'Obra não encontrada'}</span>
                                        <span className="badge">{typeLabel[r.type] || r.type}</span>
                                        <span className={`text-xs font-bold ${conditionColor[r.condition] || 'text-gray-400'}`}>{r.condition}</span>
                                    </div>
                                    <p style={{ color: "#64748b", fontSize: "0.75rem" }}>{r.responsibleName} • {new Date(r.performedAt).toLocaleDateString("pt-BR")}</p>
                                    {r.notes && <p style={{ color: "#94a3b8", fontSize: "0.75rem", marginTop: "0.25rem" }}>{r.notes}</p>}
                                </div>
                                {r.nextScheduled && (
                                    <div style={{ flexShrink: 0, textAlign: "right" }}>
                                        <p style={{ fontSize: "0.65rem", color: "#475569", textTransform: "uppercase" }}>{t("admin.conservation.prxima", "Próxima")}</p>
                                        <p style={{ color: "#d4af37", fontSize: "0.75rem", fontWeight: 700 }}>{new Date(r.nextScheduled).toLocaleDateString("pt-BR")}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {tab === 'loans' && (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                    {loans.length === 0 ? (
                        <div className="card" style={{ textAlign: "center", padding: "4rem 2rem", border: "2px dashed rgba(212,175,55,0.15)" }}>
                            <ArrowLeftRight size={48} style={{ margin: "0 auto 1rem", color: "#64748b", opacity: 0.3 }} />
                            <p style={{ color: "#64748b" }}>{t("admin.conservation.nenhumEmprstimoRegistrado", "Nenhum empréstimo registrado")}</p>
                        </div>
                    ) : loans.map((l: any) => {
                        const work = works.find(w => w.id === l.workId);
                        const isOverdue = l.expectedReturn && new Date(l.expectedReturn) < new Date() && l.status === 'ACTIVE';
                        return (
                            <div key={l.id} className="card" style={{ padding: "1.25rem", borderColor: isOverdue ? 'border-red-500/30' : 'border-white/5' }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    {isOverdue && <AlertTriangle size={16} style={{ color: "#f87171", flexShrink: 0 }} />}
                                    {l.status === 'RETURNED' && <CheckCircle size={16} style={{ color: "#22c55e", flexShrink: 0 }} />}
                                    <div style={{ flex: 1 }}>
                                        <p style={{ color: "white", fontWeight: 700, fontSize: "0.9rem" }}>{work?.title} → {l.borrowerName}</p>
                                        <p style={{ color: "#64748b", fontSize: "0.75rem" }}>{l.purpose} • Saída: {new Date(l.departureDate).toLocaleDateString("pt-BR")} {l.expectedReturn ? `• Retorno previsto: ${new Date(l.expectedReturn).toLocaleDateString("pt-BR")}` : ''}</p>
                                    </div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${l.status === 'RETURNED' ? 'bg-green-500/10 text-green-400' : isOverdue ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>{isOverdue ? 'ATRASADO' : l.status}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
