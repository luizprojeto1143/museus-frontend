import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, DollarSign, Plus, ExternalLink, Image as ImageIcon } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { toast } from "react-hot-toast";
import "./AdminShared.css";


export const AdminSponsorships: React.FC = () => {
  const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [works, setWorks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ workId: '', sponsorName: '', sponsorUrl: '', message: '', amount: '' });

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get(`/works?tenantId=${tenantId}`);
            setWorks(Array.isArray(res.data) ? res.data : (res.data.data || []));
        } catch (error) { console.error(error); toast.error("Erro ao carregar"); }
        finally { setLoading(false); }
    }, [tenantId]);

    useEffect(() => { if (tenantId) fetchData(); }, [tenantId, fetchData]);

    // Filter works that have sponsorship data
    const sponsoredWorks = works.filter((w: any) => w.sponsorships && w.sponsorships.length > 0);

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}><Loader2 className="animate-spin" style={{ color: "#d4af37" }} /></div>;

    return (
        <div style={{ display: "grid", gap: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 className="section-title" style={{ margin: 0 }}>{t("admin.sponsorships.patrocnios", `Patrocínios`)}</h1>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>{t("admin.sponsorships.gestoDePatrocniosEApoiosAObrasEspecficas", `Gestão de patrocínios e apoios a obras específicas`)}</p>
                </div>
                <Button onClick={() => setShowForm(true)} leftIcon={<Plus size={16} />}>Novo Patrocínio</Button>
            </div>

            {/* Stats */}
            <div className="card-grid">
                <div className="stat-card">
                    <DollarSign className="mx-auto text-green-500 mb-2" size={24} />
                    <p className="stat-value">{sponsoredWorks.length}</p>
                    <p className="stat-label">Obras Patrocinadas</p>
                </div>
                <div className="stat-card">
                    <p className="stat-value" style={{ color: "#d4af37" }}>{works.length}</p>
                    <p className="stat-label">Total de Obras</p>
                </div>
                <div className="stat-card">
                    <p className="stat-value">{works.length > 0 ? Math.round((sponsoredWorks.length / works.length) * 100) : 0}%</p>
                    <p className="stat-label">Cobertura</p>
                </div>
            </div>

            {showForm && (
                <div className="card" style={{ display: "grid", gap: "1rem" }}>
                    <h2 className="card-title" style={{ margin: 0 }}>{t("admin.sponsorships.novoPatrocnio", `Novo Patrocínio`)}</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Obra</label>
                            <select value={form.workId} onChange={e => setForm({ ...form, workId: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }}>
                                <option value="">Selecione...</option>
                                {works.map((w: any) => <option key={w.id} value={w.id}>{w.title}</option>)}
                            </select>
                        </div>
                        <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Nome do Patrocinador</label><input value={form.sponsorName} onChange={e => setForm({ ...form, sponsorName: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }} /></div>
                        <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Site do Patrocinador</label><input value={form.sponsorUrl} onChange={e => setForm({ ...form, sponsorUrl: e.target.value })} placeholder="https://..." style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }} /></div>
                        <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Valor (R$)</label><input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }} /></div>
                    </div>
                    <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Mensagem do Patrocinador</label><textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={2} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none", resize: "none" }} /></div>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                        <Button onClick={() => { toast.success("Patrocínio salvo!"); setShowForm(false); }}>Salvar</Button>
                    </div>
                </div>
            )}

            {/* Works list with sponsorship status */}
            <div style={{ display: "grid", gap: "0.75rem" }}>
                {works.slice(0, 20).map((w: any) => (
                    <div key={w.id} className="card" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                        {w.imageUrl ? (
                            <img src={w.imageUrl} alt={w.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                        ) : (
                            <div className="w-14 h-14 rounded-xl bg-zinc-900/40 border border-gold/20/5 flex items-center justify-center shrink-0">
                                <ImageIcon size={20} style={{ color: "#475569" }} />
                            </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ color: "white", fontWeight: 700, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.title}</p>
                            <p style={{ color: "#64748b", fontSize: "0.75rem" }}>{w.artist || 'Artista desconhecido'}</p>
                        </div>
                        <div style={{ flexShrink: 0 }}>
                            {w.sponsorships?.length > 0 ? (
                                <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-md font-bold">PATROCINADO</span>
                            ) : (
                                <span className="text-[10px] bg-zinc-900/40 border border-gold/20/5 text-zinc-400 px-2 py-0.5 rounded-md font-bold">{t("admin.sponsorships.disponvel", `DISPONÍVEL`)}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
