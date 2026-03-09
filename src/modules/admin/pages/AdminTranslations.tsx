import { useTranslation } from "react-i18next";
﻿import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Globe, Plus, Languages } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { toast } from "react-hot-toast";

const languageOptions = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

export const AdminTranslations: React.FC = () => {
  const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [data, setData] = useState<any>(null);
    const [works, setWorks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ workId: '', language: 'en', title: '', description: '' });

    const fetchData = useCallback(async () => {
        try {
            const [t, w] = await Promise.all([
                api.get(`/translations/all?tenantId=${tenantId}`),
                api.get(`/works?tenantId=${tenantId}`)
            ]);
            setData(t.data);
            setWorks(Array.isArray(w.data) ? w.data : (w.data.data || []));
        } catch (error) { console.error(error); toast.error("Erro ao carregar"); }
        finally { setLoading(false); }
    }, [tenantId]);

    useEffect(() => { if (tenantId) fetchData(); }, [tenantId, fetchData]);

    const onSave = async () => {
        if (!form.workId || !form.language) return toast.error("Selecione obra e idioma");
        try {
            await api.post("/translations", form);
            toast.success("Tradução salva!");
            setShowForm(false);
            fetchData();
        } catch (err) { toast.error("Erro"); }
    };

    const onDelete = async (id: string) => {
        if (!confirm("Excluir tradução?")) return;
        try { await api.delete(`/translations/${id}`); toast.success("Excluída"); fetchData(); } catch { toast.error("Erro"); }
    };

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}><Loader2 className="animate-spin" style={{ color: "#d4af37" }} /></div>;

    return (
        <div style={{ display: "grid", gap: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 className="section-title" style={{ margin: 0 }}>{t("admin.translations.internacionalizao", "Internacionalização")}</h1>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>{t("admin.translations.traduesDasFichasDasObras", "Traduções das fichas das obras")}</p>
                </div>
                <Button onClick={() => setShowForm(true)} leftIcon={<Plus size={16} />{t("admin.translations.novaTraduo", "}>Nova Tradução")}</Button>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="stat-card">
                    <Globe className="mx-auto text-blue-500 mb-2" size={24} />
                    <p className="stat-value">{data?.total || 0}</p>
                    <p className="stat-label">{t("admin.translations.totalTradues", "Total Traduções")}</p>
                </div>
                <div className="stat-card">
                    <Languages style={{ margin: "0 auto 0.5rem", color: "#d4af37" }} size={24} />
                    <p className="stat-value">{data?.languages?.length || 0}</p>
                    <p className="stat-label">Idiomas</p>
                    {data?.languages && <div className="flex gap-1 justify-center mt-2 flex-wrap">
                        {data.languages.map((l: string) => {
                            const lang = languageOptions.find(o => o.code === l);
                            return <span key={l} className="text-lg">{lang?.flag || l}</span>;
                        })}
                    </div>}
                </div>
            </div>

            {showForm && (
                <div className="card" style={{ display: "grid", gap: "1rem" }}>
                    <h2 className="card-title" style={{ margin: 0 }}>{t("admin.translations.novaTraduo", "Nova Tradução")}</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Obra</label>
                            <select value={form.workId} onChange={e => setForm({ ...form, workId: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }}>
                                <option value="">Selecione...</option>{works.map((w: any) => <option key={w.id} value={w.id}>{w.title}</option>)}
                            </select>
                        </div>
                        <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Idioma</label>
                            <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }}>
                                {languageOptions.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>{t("admin.translations.ttuloTraduzido", "Título Traduzido")}</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }} /></div>
                    <div><label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>{t("admin.translations.descrioTraduzida", "Descrição Traduzida")}</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none", resize: "none" }} /></div>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                        <Button onClick={onSave}>Salvar</Button>
                    </div>
                </div>
            )}

            {/* Works with translations */}
            <div style={{ display: "grid", gap: "0.75rem" }}>
                {data?.byWork && Object.entries(data.byWork).map(([workId, translations]: [string, any]) => {
                    const work = works.find(w => w.id === workId);
                    return (
                        <div key={workId} className="card" style={{ padding: "1.25rem" }}>
                            <h3 className="text-white font-bold text-sm mb-3">{work?.title || workId}</h3>
                            <div className="flex gap-2 flex-wrap">
                                {(translations as any[]).map((t: any) => {
                                    const lang = languageOptions.find(o => o.code === t.language);
                                    return (
                                        <div key={t.id} className="bg-black/30 rounded-xl px-3 py-2 flex items-center gap-2 group">
                                            <span className="text-lg">{lang?.flag || '🌐'}</span>
                                            <div>
                                                <p className="text-white text-xs font-bold">{lang?.name || t.language}</p>
                                                <p className="text-zinc-400 text-[10px]">{t.isAutoGenerated ? 'Auto' : 'Manual'}</p>
                                            </div>
                                            <button onClick={() => onDelete(t.id)} className="text-zinc-300 hover:text-red-400 text-xs ml-2 opacity-0 group-hover:opacity-100">✕</button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
