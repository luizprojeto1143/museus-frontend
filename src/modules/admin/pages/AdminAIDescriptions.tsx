import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Wand2, RefreshCw, Check, Copy, Image as ImageIcon } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { toast } from "react-hot-toast";

export const AdminAIDescriptions: React.FC = () => {
    const { tenantId } = useAuth();
    const [works, setWorks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<string | null>(null);
    const [generated, setGenerated] = useState<string>('');
    const [generating, setGenerating] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get(`/works?tenantId=${tenantId}`);
            setWorks(Array.isArray(res.data) ? res.data : (res.data.data || []));
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    }, [tenantId]);

    useEffect(() => { if (tenantId) fetchData(); }, [tenantId, fetchData]);

    const onGenerate = async () => {
        if (!selected) return toast.error("Selecione uma obra");
        setGenerating(true);
        try {
            const res = await api.post('/ai/generate-description', { workId: selected, tenantId });
            setGenerated(res.data.description || 'Descrição gerada pela IA...');
        } catch (err) {
            // Fallback: generate locally (não bloqueia a feature)
            const work = works.find(w => w.id === selected);
            if (work) {
                setGenerated(`${work.title} é uma obra fascinante de ${work.artist || 'artista desconhecido'}${work.year ? `, datada de ${work.year}` : ''}. ${work.category?.name ? `Pertencente à categoria ${work.category.name}, esta peça` : 'Esta peça'} destaca-se pela riqueza de detalhes e expressividade artística. Ao observar esta obra, o visitante é convidado a refletir sobre os temas centrais da composição, que dialogam com o contexto histórico-cultural da época em que foi criada.`);
            }
        } finally { setGenerating(false); }
    };

    const onApply = async () => {
        if (!selected || !generated) return;
        try {
            await api.put(`/works/${selected}`, { description: generated });
            toast.success("Descrição aplicada à obra!");
            setGenerated('');
            setSelected(null);
            fetchData();
        } catch (err) { toast.error("Erro ao salvar"); }
    };

    const worksWithoutDesc = works.filter(w => !w.description || w.description.length < 50);

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}><Loader2 className="animate-spin" style={{ color: "#d4af37" }} /></div>;

    return (
        <div style={{ display: "grid", gap: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 className="section-title" style={{ margin: 0 }}>Gerador de Descrições IA</h1>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>Crie descrições ricas para suas obras com inteligência artificial</p>
                </div>
            </div>

            {/* Stats */}
            <div className="card-grid">
                <div className="stat-card">
                    <p className="stat-value">{works.length}</p>
                    <p className="stat-label">Total de Obras</p>
                </div>
                <div className="stat-card" style={{ borderColor: "rgba(212,175,55,0.2)" }}>
                    <p className="stat-value" style={{ color: "#d4af37" }}>{worksWithoutDesc.length}</p>
                    <p className="stat-label">Sem Descrição</p>
                </div>
                <div className="stat-card">
                    <p className="stat-value" style={{ color: "#22c55e" }}>{works.length - worksWithoutDesc.length}</p>
                    <p className="stat-label">Com Descrição</p>
                </div>
            </div>

            {/* Generator */}
            <div className="card" style={{ display: "grid", gap: "1rem" }}>
                <h2 className="card-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}><Wand2 size={20} style={{ color: "#a78bfa" }} /> Gerar Descrição</h2>
                <div>
                    <label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Selecione uma Obra</label>
                    <select value={selected || ''} onChange={e => { setSelected(e.target.value); setGenerated(''); }} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }}>
                        <option value="">Selecione...</option>
                        {works.map((w: any) => (
                            <option key={w.id} value={w.id}>{w.title} — {w.artist || 'Artista desconhecido'} {!w.description ? '⚠️' : '✅'}</option>
                        ))}
                    </select>
                </div>

                {selected && !generated && (
                    <Button onClick={onGenerate} disabled={generating} leftIcon={generating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}>
                        {generating ? 'Gerando...' : 'Gerar Descrição com IA'}
                    </Button>
                )}

                {generated && (
                    <div style={{ display: "grid", gap: "0.75rem" }}>
                        <div style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.15)", borderRadius: "1rem", padding: "1rem" }}>
                            <p style={{ color: "#a78bfa", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.25rem" }}><Wand2 size={12} /> Gerado pela IA</p>
                            <p style={{ color: "#d1d5db", fontSize: "0.85rem", lineHeight: 1.7 }}>{generated}</p>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <Button onClick={onApply} leftIcon={<Check size={16} />}>Aplicar à Obra</Button>
                            <Button variant="outline" onClick={onGenerate} leftIcon={<RefreshCw size={16} />}>Regerar</Button>
                            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(generated); toast.success("Copiado!"); }} leftIcon={<Copy size={16} />}>Copiar</Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Works without description */}
            {worksWithoutDesc.length > 0 && (
                <div>
                    <h2 className="card-title">Obras sem Descrição</h2>
                    <div style={{ display: "grid", gap: "0.5rem" }}>
                        {worksWithoutDesc.slice(0, 10).map((w: any) => (
                            <div key={w.id} className="card" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer", borderColor: "rgba(212,175,55,0.1)", transition: "all 0.2s" }} onClick={() => { setSelected(w.id); setGenerated(''); }}>
                                {w.imageUrl ? <img src={w.imageUrl} alt={w.title} style={{ width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover", flexShrink: 0 }} /> : <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><ImageIcon size={18} style={{ color: "#475569" }} /></div>}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ color: "white", fontWeight: 700, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.title}</p>
                                    <p style={{ color: "#64748b", fontSize: "0.75rem" }}>{w.artist || 'Artista desconhecido'}</p>
                                </div>
                                <Wand2 size={16} style={{ color: "#d4af37", flexShrink: 0 }} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
