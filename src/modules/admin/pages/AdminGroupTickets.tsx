import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Users, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "react-hot-toast";

export const AdminGroupTickets: React.FC = () => {
    const { tenantId } = useAuth();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get(`/group-tickets?tenantId=${tenantId}`);
            setTickets(res.data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    }, [tenantId]);

    useEffect(() => { if (tenantId) fetchData(); }, [tenantId, fetchData]);

    const onUpdateStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/group-tickets/${id}`, { status });
            toast.success(`Status atualizado para ${status}`);
            fetchData();
        } catch (err) { toast.error("Erro"); }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
            <Loader2 className="animate-spin" style={{ color: '#d4af37' }} />
        </div>
    );

    const pending = tickets.filter(t => t.status === 'PENDING').length;
    const confirmed = tickets.filter(t => t.status === 'CONFIRMED').length;
    const totalIngressos = tickets.reduce((sum, t) => sum + t.totalTickets, 0);

    const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
        PENDING: { label: 'Pendente', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <Clock size={14} /> },
        CONFIRMED: { label: 'Confirmado', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: <CheckCircle size={14} /> },
        CANCELED: { label: 'Cancelado', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: <XCircle size={14} /> }
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="section-title">👥 Ingressos de Grupo</h1>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Gerencie solicitações de ingressos para grupos e escolas</p>
            </div>

            {/* Stats */}
            <div className="card-grid" style={{ marginBottom: '2rem' }}>
                <div className="stat-card">
                    <div className="stat-value">{tickets.length}</div>
                    <div className="stat-label">Total Solicitações</div>
                </div>
                <div className="stat-card" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
                    <div className="stat-value" style={{ color: '#f59e0b' }}>{pending}</div>
                    <div className="stat-label">Pendentes</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: '#22c55e' }}>{confirmed}</div>
                    <div className="stat-label">Confirmados</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{totalIngressos}</div>
                    <div className="stat-label">Ingressos Totais</div>
                </div>
            </div>

            {/* List */}
            {tickets.map((t: any) => {
                const st = statusConfig[t.status] || statusConfig.PENDING;
                return (
                    <div key={t.id} className="card" style={{ marginBottom: '0.75rem', padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1rem', margin: 0 }}>{t.groupName}</h3>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                        fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem',
                                        borderRadius: '1rem', background: st.bg, color: st.color
                                    }}>{st.icon} {st.label}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: '#94a3b8', flexWrap: 'wrap' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <Users size={13} /> {t.totalTickets} ingressos
                                    </span>
                                    <span>📧 {t.contactEmail}</span>
                                    <span>👤 {t.contactName}</span>
                                    {t.contactPhone && <span>📱 {t.contactPhone}</span>}
                                </div>
                                <p style={{ color: '#475569', fontSize: '0.7rem', marginTop: '0.5rem' }}>
                                    {new Date(t.createdAt).toLocaleString("pt-BR")}
                                </p>
                            </div>

                            {t.status === 'PENDING' && (
                                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, marginLeft: '1rem' }}>
                                    <button
                                        onClick={() => onUpdateStatus(t.id, 'CONFIRMED')}
                                        style={{
                                            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                                            borderRadius: '0.75rem', padding: '0.5rem 1rem', cursor: 'pointer',
                                            color: '#22c55e', fontWeight: 700, fontSize: '0.8rem',
                                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                                            transition: 'all 0.2s'
                                        }}
                                    ><CheckCircle size={14} /> Confirmar</button>
                                    <button
                                        onClick={() => onUpdateStatus(t.id, 'CANCELED')}
                                        style={{
                                            background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)',
                                            borderRadius: '0.75rem', padding: '0.5rem 1rem', cursor: 'pointer',
                                            color: '#ef4444', fontWeight: 700, fontSize: '0.8rem',
                                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                                            transition: 'all 0.2s'
                                        }}
                                    ><XCircle size={14} /> Cancelar</button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            {tickets.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', border: '2px dashed rgba(212,175,55,0.15)' }}>
                    <Users size={48} style={{ margin: '0 auto 1rem', color: '#64748b', opacity: 0.3 }} />
                    <h3 style={{ color: 'white', fontWeight: 700, marginBottom: '0.5rem' }}>Nenhuma solicitação de grupo</h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Solicitações de ingressos em grupo aparecerão aqui</p>
                </div>
            )}
        </div>
    );
};
