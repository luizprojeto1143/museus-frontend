import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Crown, Users, TrendingUp, Plus, CreditCard } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { toast } from "react-hot-toast";

export const AdminMemberships: React.FC = () => {
    const { tenantId } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPlanForm, setShowPlanForm] = useState(false);
    const [planForm, setPlanForm] = useState({ name: '', description: '', monthlyPrice: '', yearlyPrice: '', shopDiscount: '' });

    const fetchData = useCallback(async () => {
        try {
            const [s, m] = await Promise.all([
                api.get(`/memberships/stats?tenantId=${tenantId}`),
                api.get(`/memberships?tenantId=${tenantId}`)
            ]);
            setStats(s.data);
            setMembers(m.data);
        } catch (error) { console.error(error); toast.error("Erro ao carregar"); }
        finally { setLoading(false); }
    }, [tenantId]);

    useEffect(() => { if (tenantId) fetchData(); }, [tenantId, fetchData]);

    const onSavePlan = async () => {
        if (!planForm.name || !planForm.monthlyPrice) return toast.error("Preencha nome e preço");
        try {
            await api.post("/memberships/plans", { ...planForm, monthlyPrice: parseFloat(planForm.monthlyPrice), yearlyPrice: planForm.yearlyPrice ? parseFloat(planForm.yearlyPrice) : null, shopDiscount: planForm.shopDiscount ? parseInt(planForm.shopDiscount) : null });
            toast.success("Plano criado!");
            setShowPlanForm(false);
            setPlanForm({ name: '', description: '', monthlyPrice: '', yearlyPrice: '', shopDiscount: '' });
            fetchData();
        } catch (err) { toast.error("Erro ao criar plano"); }
    };

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}><Loader2 className="animate-spin" style={{ color: "#d4af37" }} /></div>;

    return (
        <div style={{ display: "grid", gap: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 className="section-title" style={{ margin: 0 }}>Amigo do Museu</h1>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>Assinaturas e planos de fidelidade</p>
                </div>
                <Button onClick={() => setShowPlanForm(true)} leftIcon={<Plus size={16} />}>Novo Plano</Button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="card-grid">
                    <div className="stat-card">
                        <Users style={{ margin: "0 auto 0.5rem", color: "#d4af37" }} size={24} />
                        <p className="stat-value">{stats.active}</p>
                        <p className="stat-label">Assinantes Ativos</p>
                    </div>
                    <div className="stat-card">
                        <TrendingUp className="mx-auto text-green-500 mb-2" size={24} />
                        <p className="stat-value" style={{ color: "#22c55e" }}>R$ {stats.mrr?.toFixed(2)}</p>
                        <p className="stat-label">MRR</p>
                    </div>
                    <div className="stat-card">
                        <Crown className="mx-auto text-purple-500 mb-2" size={24} />
                        <p className="stat-value">{stats.plans?.length || 0}</p>
                        <p className="stat-label">Planos</p>
                    </div>
                </div>
            )}

            {/* Plans */}
            {stats?.plans && stats.plans.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stats.plans.map((p: any) => (
                        <div key={p.id} className="card">
                            <Crown className="text-amber-500 mb-3" size={28} />
                            <h3 className="text-white font-bold text-lg">{p.name}</h3>
                            <p className="text-amber-400 text-2xl font-black mt-1">R$ {Number(p.monthlyPrice).toFixed(2)}<span className="text-zinc-400 text-sm font-normal">/mês</span></p>
                            {p.description && <p className="text-zinc-400 text-sm mt-2">{p.description}</p>}
                            <p className="text-zinc-300 text-xs mt-3">{p._count?.memberships || 0} assinantes</p>
                        </div>
                    ))}
                </div>
            )}

            {showPlanForm && (
                <div className="card" style={{ display: "grid", gap: "1rem" }}>
                    <h2 className="card-title" style={{ margin: 0 }}>Novo Plano</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Nome</label><input value={planForm.name} onChange={e => setPlanForm({ ...planForm, name: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }} placeholder="Amigo do Museu" /></div>
                        <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Preço Mensal (R$)</label><input type="number" value={planForm.monthlyPrice} onChange={e => setPlanForm({ ...planForm, monthlyPrice: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }} /></div>
                        <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Preço Anual (R$)</label><input type="number" value={planForm.yearlyPrice} onChange={e => setPlanForm({ ...planForm, yearlyPrice: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }} /></div>
                        <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Desconto Loja (%)</label><input type="number" value={planForm.shopDiscount} onChange={e => setPlanForm({ ...planForm, shopDiscount: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }} /></div>
                    </div>
                    <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Descrição</label><textarea value={planForm.description} onChange={e => setPlanForm({ ...planForm, description: e.target.value })} rows={2} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none", resize: "none" }} /></div>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <Button variant="outline" onClick={() => setShowPlanForm(false)}>Cancelar</Button>
                        <Button onClick={onSavePlan}>Criar Plano</Button>
                    </div>
                </div>
            )}

            {/* Members List */}
            <div className="card" style={{ overflow: "hidden", padding: 0 }}>
                <div className="px-6 py-4 border-b border-white/5"><h2 className="card-title" style={{ margin: 0 }}>Assinantes</h2></div>
                <table className="w-full text-left">
                    <thead className="bg-black/40 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        <tr><th className="px-6 py-3">Membro</th><th className="px-6 py-3">Plano</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Desde</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {members.map((m: any) => (
                            <tr key={m.id} className="hover:bg-white/5">
                                <td className="px-6 py-3"><p style={{ color: "white", fontWeight: 700, fontSize: "0.9rem" }}>{m.visitorName}</p><p style={{ color: "#64748b", fontSize: "0.75rem" }}>{m.visitorEmail}</p></td>
                                <td className="px-6 py-3 text-gray-300 text-sm">{m.plan?.name || '—'}</td>
                                <td className="px-6 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${m.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{m.status}</span></td>
                                <td className="px-6 py-3 text-zinc-400 text-xs">{new Date(m.startDate).toLocaleDateString("pt-BR")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
