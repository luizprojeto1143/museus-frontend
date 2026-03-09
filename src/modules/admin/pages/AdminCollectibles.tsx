import { useTranslation } from "react-i18next";
﻿import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Sparkles, Plus, Star, Zap, Crown, Diamond } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { toast } from "react-hot-toast";
import "./AdminShared.css";


const rarityConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    COMMON: { label: 'Comum', color: 'text-gray-400', bg: '0/10', icon: <Star size={14} /> },
    RARE: { label: 'Raro', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: <Zap size={14} /> },
    EPIC: { label: 'Épico', color: 'text-purple-400', bg: 'bg-purple-500/10', icon: <Crown size={14} /> },
    LEGENDARY: { label: 'Lendário', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: <Diamond size={14} /> }
};

export const AdminCollectibles: React.FC = () => {
  const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [cards, setCards] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [works, setWorks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', rarity: 'COMMON', workId: '', totalMinted: '100', xpReward: '10' });

    const fetchData = useCallback(async () => {
        try {
            const [c, s, w] = await Promise.all([
                api.get(`/collectibles?tenantId=${tenantId}`),
                api.get(`/collectibles/stats?tenantId=${tenantId}`),
                api.get(`/works?tenantId=${tenantId}`)
            ]);
            setCards(c.data);
            setStats(s.data);
            setWorks(Array.isArray(w.data) ? w.data : (w.data.data || []));
        } catch (error) { console.error(error); toast.error("Erro ao carregar"); }
        finally { setLoading(false); }
    }, [tenantId]);

    useEffect(() => { if (tenantId) fetchData(); }, [tenantId, fetchData]);

    const onSave = async () => {
        if (!form.title) return toast.error("Nome obrigatório");
        try {
            await api.post("/collectibles", { ...form, totalMinted: parseInt(form.totalMinted), xpReward: parseInt(form.xpReward), workId: form.workId || null });
            toast.success("Card criado!");
            setShowForm(false);
            setForm({ title: '', description: '', rarity: 'COMMON', workId: '', totalMinted: '100', xpReward: '10' });
            fetchData();
        } catch (err) { toast.error("Erro ao criar"); }
    };

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}><Loader2 className="animate-spin" style={{ color: "#d4af37" }} /></div>;

    return (
        <div style={{ display: "grid", gap: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 className="section-title" style={{ margin: 0 }}>{t("admin.collectibles.cardsColecionveis", "Cards Colecionáveis")}</h1>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>Crie cards digitais para visitantes colecionarem</p>
                </div>
                <Button onClick={() => setShowForm(true)} leftIcon={<Plus size={16} />}>Novo Card</Button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="card-grid">
                    <div className="stat-card">
                        <Sparkles style={{ margin: "0 auto 0.5rem", color: "#d4af37" }} size={24} />
                        <p className="stat-value">{stats.totalCards}</p>
                        <p className="stat-label">Cards Criados</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-value" style={{ color: "#22c55e" }}>{stats.totalOwned}</p>
                        <p className="stat-label">Total Coletados</p>
                    </div>
                    <div className="card">
                        <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginBottom: "0.5rem" }}>Por Raridade</p>
                        {stats.byRarity?.map((r: any) => (
                            <div key={r.rarity} className="flex items-center justify-between text-sm">
                                <span className={rarityConfig[r.rarity]?.color || 'text-gray-400'}>{rarityConfig[r.rarity]?.label || r.rarity}</span>
                                <span style={{ color: "white", fontWeight: 700 }}>{r.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showForm && (
                <div className="card" style={{ display: "grid", gap: "1rem" }}>
                    <h2 className="card-title" style={{ margin: 0 }}>{t("admin.collectibles.novoCardColecionvel", "Novo Card Colecionável")}</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Nome</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }} /></div>
                        <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Raridade</label>
                            <select value={form.rarity} onChange={e => setForm({ ...form, rarity: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }}>
                                <option value="COMMON">Comum</option><option value="RARE">Raro</option><option value="EPIC">{t("admin.collectibles.pico", "Épico")}</option><option value="LEGENDARY">{t("admin.collectibles.lendrio", "Lendário")}</option>
                            </select>
                        </div>
                        <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Obra Vinculada</label>
                            <select value={form.workId} onChange={e => setForm({ ...form, workId: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }}>
                                <option value="">Nenhuma</option>
                                {works.map((w: any) => <option key={w.id} value={w.id}>{w.title}</option>)}
                            </select>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Unidades</label><input type="number" value={form.totalMinted} onChange={e => setForm({ ...form, totalMinted: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }} /></div>
                            <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>XP Reward</label><input type="number" value={form.xpReward} onChange={e => setForm({ ...form, xpReward: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }} /></div>
                        </div>
                    </div>
                    <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>{t("admin.collectibles.descrio", "Descrição")}</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none", resize: "none" }} /></div>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                        <Button onClick={onSave}>Criar Card</Button>
                    </div>
                </div>
            )}

            {/* Card Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                {cards.map((card: any) => {
                    const r = rarityConfig[card.rarity] || rarityConfig.COMMON;
                    return (
                        <div key={card.id} className="card" style={{ padding: "1.25rem", textAlign: "center" }}>
                            {card.imageUrl ? (
                                <img src={card.imageUrl} alt={card.title} style={{ width: "80px", height: "80px", borderRadius: "12px", margin: "0 auto 0.75rem", objectFit: "cover" }} />
                            ) : (
                                <div style={{ width: "80px", height: "80px", borderRadius: "12px", margin: "0 auto 0.75rem", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Sparkles size={28} className={r.color} />
                                </div>
                            )}
                            <h3 style={{ color: "white", fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.25rem" }}>{card.title}</h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${r.bg} ${r.color} inline-flex items-center gap-1`}>{r.icon} {r.label}</span>
                            <div className="flex justify-between text-[10px] text-zinc-300 mt-3">
                                <span>{card._count?.owners || 0}/{card.totalMinted}</span>
                                <span>+{card.xpReward} XP</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
