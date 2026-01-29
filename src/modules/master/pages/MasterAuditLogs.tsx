import React, { useState, useEffect } from 'react';
import { Clock, User, Database, Filter, ChevronDown, ChevronRight, Activity, Search } from 'lucide-react';
import { api } from '../../../api/client';
import { useTranslation } from 'react-i18next';
import "./MasterShared.css";

interface AuditLogEntry {
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    userId: string | null;
    userEmail: string | null;
    tenantId: string;
    oldData: Record<string, unknown> | null;
    newData: Record<string, unknown> | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
}

export const MasterAuditLogs: React.FC = () => {
    const { t } = useTranslation();
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        entity: '',
        action: '',
        tenantId: ''
    });
    const [expandedLog, setExpandedLog] = useState<string | null>(null);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchLogs();
    }, [filters]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.entity) params.append('entity', filters.entity);
            if (filters.action) params.append('action', filters.action);
            if (filters.tenantId) params.append('tenantId', filters.tenantId);
            params.append('limit', '100');

            const res = await api.get(`/audit-logs?${params}`);
            setLogs(res.data.logs);
            setTotal(res.data.total);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action: string) => {
        switch (action.toUpperCase()) {
            case 'CREATE': return 'rgba(34, 197, 94, 0.2)';
            case 'UPDATE': return 'rgba(59, 130, 246, 0.2)';
            case 'DELETE': return 'rgba(239, 68, 68, 0.2)';
            default: return 'rgba(156, 163, 175, 0.2)';
        }
    };

    const getActionTextColor = (action: string) => {
        switch (action.toUpperCase()) {
            case 'CREATE': return '#4ade80';
            case 'UPDATE': return '#60a5fa';
            case 'DELETE': return '#f87171';
            default: return '#9ca3af';
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('pt-BR');
    };

    return (
        <div className="master-page-container">
            {/* HERO SECTION */}
            <section className="master-hero">
                <div className="master-hero-content">
                    <span className="master-badge">
                        🔍 Segurança & Auditoria
                    </span>
                    <h1 className="master-title">
                        Logs do Sistema
                    </h1>
                    <p className="master-subtitle">
                        Monitore todas as ações realizadas no painel administrativo para segurança e conformidade.
                    </p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Activity size={24} color="#a78bfa" />
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{total}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registros</div>
                    </div>
                </div>
            </section>

            {/* FILTERS CARD */}
            <div className="master-card" style={{ marginBottom: '2rem' }}>
                <div className="master-card-header">
                    <div className="master-icon-wrapper master-icon-blue">
                        <Filter size={24} />
                    </div>
                    <h3>Filtros de Busca</h3>
                </div>
                <div className="master-grid-3">
                    <div className="master-input-group">
                        <label>Entidade</label>
                        <select
                            value={filters.entity}
                            onChange={(e) => setFilters(f => ({ ...f, entity: e.target.value }))}
                        >
                            <option value="">Todas Entidades</option>
                            <option value="Work">Obras</option>
                            <option value="Event">Eventos</option>
                            <option value="Visitor">Visitantes</option>
                            <option value="User">Usuários</option>
                            <option value="Trail">Trilhas</option>
                            <option value="Product">Produtos</option>
                        </select>
                    </div>

                    <div className="master-input-group">
                        <label>Ação</label>
                        <select
                            value={filters.action}
                            onChange={(e) => setFilters(f => ({ ...f, action: e.target.value }))}
                        >
                            <option value="">Todas Ações</option>
                            <option value="CREATE">Criar</option>
                            <option value="UPDATE">Atualizar</option>
                            <option value="DELETE">Excluir</option>
                            <option value="LOGIN">Login</option>
                        </select>
                    </div>

                    <div className="master-input-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button className="master-btn btn-primary" onClick={fetchLogs} style={{ height: '42px', marginTop: 0 }}>
                            <Search size={18} />
                            Atualizar
                        </button>
                    </div>
                </div>
            </div>

            {/* LOGS LIST */}
            <div className="master-card">
                <div className="master-card-header">
                    <div className="master-icon-wrapper master-icon-purple">
                        <Database size={24} />
                    </div>
                    <h3>Histórico de Ações</h3>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                        {t('common.loading', 'Carregando logs...')}
                    </div>
                ) : logs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                        <p>{t('master.audit.empty', 'Nenhum log encontrado')}</p>
                    </div>
                ) : (
                    <div className="master-table-container">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {logs.map(log => (
                                <div
                                    key={log.id}
                                    style={{
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '8px',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            cursor: 'pointer',
                                            flexWrap: 'wrap'
                                        }}
                                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                    >
                                        <span style={{
                                            padding: '0.25rem 0.6rem',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            background: getActionColor(log.action),
                                            color: getActionTextColor(log.action),
                                            minWidth: '70px',
                                            textAlign: 'center'
                                        }}>
                                            {log.action}
                                        </span>

                                        <div style={{ flex: 1, color: '#e2e8f0', fontWeight: 500 }}>
                                            {log.entity}
                                            {log.entityId && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace' }}>#{log.entityId.slice(0, 8)}</span>}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>
                                            <User size={14} />
                                            {log.userEmail || 'Sistema'}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#94a3b8', minWidth: '150px', justifyContent: 'flex-end' }}>
                                            <Clock size={14} />
                                            {formatDate(log.createdAt)}
                                        </div>

                                        <div style={{ color: '#64748b' }}>
                                            {expandedLog === log.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                        </div>
                                    </div>

                                    {expandedLog === log.id && (
                                        <div style={{
                                            padding: '1rem',
                                            background: 'rgba(0,0,0,0.2)',
                                            borderTop: '1px solid rgba(255,255,255,0.05)',
                                            fontSize: '0.9rem'
                                        }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                                <div><strong style={{ color: '#94a3b8' }}>IP:</strong> <span style={{ color: '#e2e8f0' }}>{log.ipAddress || 'N/A'}</span></div>
                                                <div><strong style={{ color: '#94a3b8' }}>Agent:</strong> <span style={{ color: '#e2e8f0' }}>{log.userAgent?.slice(0, 30) || 'N/A'}...</span></div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                {log.oldData && (
                                                    <div>
                                                        <div style={{ marginBottom: '0.5rem', color: '#f87171', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Dados Anteriores</div>
                                                        <pre style={{
                                                            background: '#0f172a',
                                                            padding: '1rem',
                                                            borderRadius: '8px',
                                                            border: '1px solid rgba(255,255,255,0.05)',
                                                            overflowX: 'auto',
                                                            fontSize: '0.8rem',
                                                            color: '#94a3b8'
                                                        }}>{JSON.stringify(log.oldData, null, 2)}</pre>
                                                    </div>
                                                )}
                                                {log.newData && (
                                                    <div>
                                                        <div style={{ marginBottom: '0.5rem', color: '#4ade80', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Novos Dados</div>
                                                        <pre style={{
                                                            background: '#0f172a',
                                                            padding: '1rem',
                                                            borderRadius: '8px',
                                                            border: '1px solid rgba(255,255,255,0.05)',
                                                            overflowX: 'auto',
                                                            fontSize: '0.8rem',
                                                            color: '#e2e8f0'
                                                        }}>{JSON.stringify(log.newData, null, 2)}</pre>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
