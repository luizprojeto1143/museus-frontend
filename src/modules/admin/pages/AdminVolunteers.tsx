import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Heart, Plus, Clock, CheckCircle } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { toast } from "react-hot-toast";

export const AdminVolunteers: React.FC = () => {
    const { tenantId } = useAuth();
    const [volunteers, setVolunteers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '', availability: '', skills: '' });

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get(`/volunteers?tenantId=${tenantId}`);
            setVolunteers(res.data);
        } catch (error) { console.error(error); toast.error("Erro ao carregar"); }
        finally { setLoading(false); }
    }, [tenantId]);

    useEffect(() => { if (tenantId) fetchData(); }, [tenantId, fetchData]);

    const onSave = async () => {
        if (!form.name || !form.email) return toast.error("Preencha nome e email");
        try {
            await api.post("/volunteers", { ...form, skills: form.skills ? form.skills.split(',').map(s => s.trim()) : [] });
            toast.success("Voluntário cadastrado!");
            setShowForm(false);
            setForm({ name: '', email: '', phone: '', availability: '', skills: '' });
            fetchData();
        } catch (err: any) { toast.error(err.response?.data?.message || "Erro"); }
    };

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}><Loader2 className="animate-spin" style={{ color: "#d4af37" }} /></div>;

    return (
        <div style={{ display: "grid", gap: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 className="section-title" style={{ margin: 0 }}>Voluntários</h1>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>Cadastro, escala e horas de voluntariado</p>
                </div>
                <Button onClick={() => setShowForm(true)} leftIcon={<Plus size={16} />}>Novo Voluntário</Button>
            </div>

            {showForm && (
                <div className="card" style={{ display: "grid", gap: "1rem" }}>
                    <h2 className="card-title" style={{ margin: 0 }}>Cadastrar Voluntário</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Nome</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }} /></div>
                        <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }} /></div>
                        <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Telefone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }} /></div>
                        <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Disponibilidade</label>
                            <select value={form.availability} onChange={e => setForm({ ...form, availability: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }}>
                                <option value="">Selecione...</option><option value="manhã">Manhã</option><option value="tarde">Tarde</option><option value="integral">Integral</option><option value="fins de semana">Fins de semana</option>
                            </select>
                        </div>
                    </div>
                    <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Habilidades (separar por vírgula)</label><input value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="Recepção, Guia, Libras, Fotografia" style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }} /></div>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                        <Button onClick={onSave}>Salvar</Button>
                    </div>
                </div>
            )}

            <div className="card" style={{ overflow: "hidden", padding: 0 }}>
                <table className="w-full text-left">
                    <thead className="bg-black/40 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        <tr><th className="px-6 py-3">Voluntário</th><th className="px-6 py-3">Disponibilidade</th><th className="px-6 py-3">Habilidades</th><th className="px-6 py-3 text-center">Horas</th><th className="px-6 py-3 text-center">Turnos</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {volunteers.map((v: any) => (
                            <tr key={v.id} className="hover:bg-white/5">
                                <td className="px-6 py-3"><p style={{ color: "white", fontWeight: 700, fontSize: "0.9rem" }}>{v.name}</p><p style={{ color: "#64748b", fontSize: "0.75rem" }}>{v.email}</p></td>
                                <td className="px-6 py-3 text-gray-300 text-sm">{v.availability || '—'}</td>
                                <td className="px-6 py-3"><div className="flex gap-1 flex-wrap">{(v.skills || []).map((s: string, i: number) => <span key={i} className="text-[10px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded">{s}</span>)}</div></td>
                                <td className="px-6 py-3 text-center text-amber-400 font-bold"><Clock size={12} style={{ display: "inline", marginRight: "0.25rem" }} />{v.totalHours || 0}h</td>
                                <td className="px-6 py-3 text-center text-gray-400">{v._count?.shifts || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
