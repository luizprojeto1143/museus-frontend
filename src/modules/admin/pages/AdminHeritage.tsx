import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Plus, Scroll, Music, PartyPopper, BookOpen, MapPin, Trash2, X } from "lucide-react";
import { toast } from "react-hot-toast";

const categoryConfig: Record<string, { label: string; emoji: string; color: string }> = {
    FESTEJO: { label: 'Festejo', emoji: '🎉', color: '#f59e0b' },
    SABER: { label: 'Saber', emoji: '📖', color: '#60a5fa' },
    CELEBRACAO: { label: 'Celebração', emoji: '🎶', color: '#a78bfa' },
    EXPRESSAO: { label: 'Expressão', emoji: '🎭', color: '#34d399' },
    LUGAR: { label: 'Lugar', emoji: '📍', color: '#f87171' }
};

const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.75rem', padding: '0.75rem 1rem', color: 'white', fontSize: '0.85rem', outline: 'none'
};

const labelStyle: React.CSSProperties = {
    display: 'block', color: '#d4af37', fontSize: '0.7rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem'
};

export const AdminHeritage: React.FC = () => {
    const { tenantId } = useAuth();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', category: 'FESTEJO', holders: '', region: '' });

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get(`/heritage?tenantId=${tenantId}`);
            setItems(res.data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    }, [tenantId]);

    useEffect(() => { if (tenantId) fetchData(); }, [tenantId, fetchData]);

    const onSave = async () => {
        if (!form.title) return toast.error("Título obrigatório");
        try {
            await api.post("/heritage", form);
            toast.success("Patrimônio registrado!");
            setShowForm(false);
            setForm({ title: '', description: '', category: 'FESTEJO', holders: '', region: '' });
            fetchData();
        } catch (err) { toast.error("Erro"); }
    };

    const onDelete = async (id: string) => {
        if (!confirm("Excluir?")) return;
        try { await api.delete(`/heritage/${id}`); toast.success("Excluído"); fetchData(); } catch { toast.error("Erro"); }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
            <Loader2 className="animate-spin" style={{ color: '#d4af37' }} />
        </div>
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="section-title" style={{ margin: 0 }}>📜 Patrimônio Imaterial</h1>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>Registro de saberes, celebrações e expressões culturais</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Plus size={16} /> Novo Registro
                </button>
            </div>

            {/* Stats */}
            <div className="card-grid" style={{ marginBottom: '2rem' }}>
                <div className="stat-card">
                    <div className="stat-value">{items.length}</div>
                    <div className="stat-label">Total Registros</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: '#34d399' }}>{items.filter(i => i.status === 'REGISTRADO').length}</div>
                    <div className="stat-label">Registrados</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: '#f59e0b' }}>{items.filter(i => i.status === 'EM_ESTUDO').length}</div>
                    <div className="stat-label">Em Estudo</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: '#60a5fa' }}>{new Set(items.map(i => i.category)).size}</div>
                    <div className="stat-label">Categorias</div>
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="card" style={{ marginBottom: '1.5rem', border: '1px solid rgba(212,175,55,0.2)', background: 'rgba(212,175,55,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 className="card-title" style={{ margin: 0 }}>Registrar Patrimônio Imaterial</h2>
                        <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={20} /></button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Título *</label>
                            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} placeholder="Ex: Congada de Betim" />
                        </div>
                        <div>
                            <label style={labelStyle}>Categoria</label>
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                                {Object.entries(categoryConfig).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Detentores</label>
                            <input value={form.holders} onChange={e => setForm({ ...form, holders: e.target.value })} placeholder="Mestres, comunidades..." style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Região</label>
                            <input value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} placeholder="Bairro, distrito..." style={inputStyle} />
                        </div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>Descrição</label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'none' }} placeholder="Descreva o patrimônio cultural..." />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => setShowForm(false)} className="btn btn-ghost">Cancelar</button>
                        <button onClick={onSave} className="btn btn-primary">Registrar</button>
                    </div>
                </div>
            )}

            {/* List */}
            {items.map((item: any) => {
                const cat = categoryConfig[item.category] || categoryConfig.FESTEJO;
                return (
                    <div key={item.id} className="card" style={{ marginBottom: '0.75rem', padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <div style={{
                                width: '44px', height: '44px', borderRadius: '12px',
                                background: `${cat.color}15`, border: `1px solid ${cat.color}30`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.3rem', flexShrink: 0
                            }}>{cat.emoji}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                    <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>{item.title}</h3>
                                    <span className="badge" style={{
                                        background: item.status === 'REGISTRADO' ? 'rgba(34,197,94,0.1)' : 'rgba(212,175,55,0.1)',
                                        color: item.status === 'REGISTRADO' ? '#22c55e' : '#d4af37',
                                        fontSize: '0.65rem'
                                    }}>{item.status}</span>
                                </div>
                                {item.description && <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.25rem 0' }}>{item.description}</p>}
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                                    {item.holders && <span>👥 {item.holders}</span>}
                                    {item.region && <span>📍 {item.region}</span>}
                                    <span style={{ color: cat.color }}>{cat.emoji} {cat.label}</span>
                                </div>
                            </div>
                            <button onClick={() => onDelete(item.id)} style={{
                                background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)',
                                borderRadius: '0.5rem', padding: '0.4rem', cursor: 'pointer', color: '#ef4444',
                                opacity: 0.5, transition: 'opacity 0.2s'
                            }} onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                );
            })}

            {items.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', border: '2px dashed rgba(212,175,55,0.15)' }}>
                    <Scroll size={48} style={{ margin: '0 auto 1rem', color: '#64748b', opacity: 0.3 }} />
                    <h3 style={{ color: 'white', fontWeight: 700, marginBottom: '0.5rem' }}>Nenhum patrimônio imaterial registrado</h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Clique em "Novo Registro" para começar</p>
                </div>
            )}
        </div>
    );
};
