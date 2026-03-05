import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, AlertTriangle, Building, Calendar, TrendingUp } from "lucide-react";

export const AdminMunicipalGaps: React.FC = () => {
    const { tenantId } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [tenants, events] = await Promise.all([
                api.get(`/tenants`).catch(() => ({ data: [] })),
                api.get(`/events?tenantId=${tenantId}&limit=100`).catch(() => ({ data: [] }))
            ]);
            const tenantList = Array.isArray(tenants.data) ? tenants.data : (tenants.data?.data || []);
            const eventList = Array.isArray(events.data) ? events.data : (events.data?.data || []);

            const categories = ['Artes Visuais', 'Música', 'Dança', 'Teatro', 'Literatura', 'Patrimônio', 'Artesanato', 'Cinema'];
            const eventTypes = eventList.map((e: any) => e.type || 'Geral');
            const covered = new Set(eventTypes);
            const gaps = categories.filter(c => !covered.has(c));

            setData({
                totalEquipments: tenantList.length || 1,
                totalEvents: eventList.length,
                coveredCategories: categories.filter(c => covered.has(c)),
                gapCategories: gaps.length > 0 ? gaps : ['Nenhum vazio identificado'],
                coverage: gaps.length > 0 ? Math.round(((categories.length - gaps.length) / categories.length) * 100) : 100,
                allCategories: categories
            });
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    }, [tenantId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
            <Loader2 className="animate-spin" style={{ color: '#d4af37' }} />
        </div>
    );

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="section-title">🗺️ Vazios Culturais</h1>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Mapeamento de áreas e categorias culturais sem cobertura</p>
            </div>

            {data && (
                <>
                    {/* Stats */}
                    <div className="card-grid" style={{ marginBottom: '2rem' }}>
                        <div className="stat-card">
                            <div style={{ marginBottom: '0.5rem' }}><Building size={20} style={{ color: '#60a5fa' }} /></div>
                            <div className="stat-value">{data.totalEquipments}</div>
                            <div className="stat-label">Equipamentos</div>
                        </div>
                        <div className="stat-card">
                            <div style={{ marginBottom: '0.5rem' }}><Calendar size={20} style={{ color: '#d4af37' }} /></div>
                            <div className="stat-value">{data.totalEvents}</div>
                            <div className="stat-label">Eventos Realizados</div>
                        </div>
                        <div className="stat-card" style={{ borderColor: data.coverage < 50 ? 'rgba(239,68,68,0.2)' : 'rgba(212,175,55,0.2)' }}>
                            <div style={{ marginBottom: '0.5rem' }}><TrendingUp size={20} style={{ color: data.coverage >= 75 ? '#22c55e' : data.coverage >= 50 ? '#f59e0b' : '#ef4444' }} /></div>
                            <div className="stat-value" style={{ color: data.coverage >= 75 ? '#22c55e' : data.coverage >= 50 ? '#f59e0b' : '#ef4444' }}>{data.coverage}%</div>
                            <div className="stat-label">Cobertura Cultural</div>
                        </div>
                    </div>

                    {/* Coverage Progress */}
                    <div className="card" style={{ marginBottom: '1.5rem' }}>
                        <h2 className="card-title">📊 Cobertura por Categoria</h2>
                        <div style={{ marginTop: '1rem' }}>
                            {data.allCategories.map((cat: string) => {
                                const isCovered = data.coveredCategories.includes(cat);
                                return (
                                    <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                                        <div style={{
                                            width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                                            background: isCovered ? '#22c55e' : '#ef4444',
                                            boxShadow: isCovered ? '0 0 8px rgba(34,197,94,0.3)' : '0 0 8px rgba(239,68,68,0.3)'
                                        }} />
                                        <span style={{ flex: 1, fontSize: '0.9rem', color: isCovered ? 'white' : '#f87171', fontWeight: isCovered ? 400 : 600 }}>{cat}</span>
                                        <div style={{ width: '120px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: isCovered ? '100%' : '0%', height: '100%',
                                                background: isCovered ? 'linear-gradient(90deg, var(--accent-gold), var(--accent-bronze))' : 'transparent',
                                                borderRadius: '3px', transition: 'width 0.5s'
                                            }} />
                                        </div>
                                        <span className="badge" style={{
                                            background: isCovered ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                            color: isCovered ? '#22c55e' : '#ef4444',
                                            fontSize: '0.65rem', minWidth: '60px', textAlign: 'center'
                                        }}>{isCovered ? 'COBERTO' : 'VAZIO'}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Gaps Alert */}
                    {data.gapCategories.length > 0 && data.gapCategories[0] !== 'Nenhum vazio identificado' && (
                        <div className="card" style={{ border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.03)' }}>
                            <h3 className="card-title" style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertTriangle size={18} /> Vazios Identificados — Ação Recomendada
                            </h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                As seguintes categorias não possuem eventos ou atividades registradas. Considere criar iniciativas para cobrir essas lacunas.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                                {data.gapCategories.map((gap: string) => (
                                    <div key={gap} style={{
                                        background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)',
                                        borderRadius: '1rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem'
                                    }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '8px',
                                            background: 'rgba(239,68,68,0.1)', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                        }}>
                                            <AlertTriangle size={16} style={{ color: '#ef4444' }} />
                                        </div>
                                        <div>
                                            <p style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>{gap}</p>
                                            <p style={{ color: '#64748b', fontSize: '0.7rem' }}>Sem atividades registradas</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
