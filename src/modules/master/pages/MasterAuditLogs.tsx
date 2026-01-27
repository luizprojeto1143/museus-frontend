import React, { useState, useEffect } from 'react';
import { Clock, User, Database, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { api } from '../../../api/client';
import { useTranslation } from 'react-i18next';

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
            case 'CREATE': return '#22c55e';
            case 'UPDATE': return '#3b82f6';
            case 'DELETE': return '#ef4444';
            default: return '#9ca3af';
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('pt-BR');
    };

    return (
        <div className="audit-logs-page">
            <header className="page-header">
                <div>
                    <h1>📋 {t('master.audit.title', 'Logs de Auditoria')}</h1>
                    <p className="subtitle">{t('master.audit.subtitle', 'Histórico de todas as ações administrativas do sistema')}</p>
                </div>
                <div className="stats-badge">
                    <span>{total}</span> registros
                </div>
            </header>

            {/* Filters */}
            <div className="filters-bar">
                <div className="filter-group">
                    <Filter size={18} />
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
                <div className="filter-group">
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
            </div>

            {/* Logs List */}
            <div className="logs-list">
                {loading ? (
                    <div className="loading-state">{t('common.loading', 'Carregando logs...')}</div>
                ) : logs.length === 0 ? (
                    <div className="empty-state">
                        <Database size={48} />
                        <p>{t('master.audit.empty', 'Nenhum log encontrado')}</p>
                    </div>
                ) : (
                    logs.map(log => (
                        <div
                            key={log.id}
                            className={`log-entry ${expandedLog === log.id ? 'expanded' : ''}`}
                        >
                            <div
                                className="log-header"
                                onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                            >
                                <div className="log-action" style={{ backgroundColor: getActionColor(log.action) }}>
                                    {log.action}
                                </div>
                                <div className="log-entity">
                                    {log.entity}
                                    {log.entityId && <span className="entity-id">#{log.entityId.slice(0, 8)}</span>}
                                </div>
                                <div className="log-user">
                                    <User size={14} />
                                    {log.userEmail || 'Sistema'}
                                </div>
                                <div className="log-time">
                                    <Clock size={14} />
                                    {formatDate(log.createdAt)}
                                </div>
                                <div className="expand-icon">
                                    {expandedLog === log.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                </div>
                            </div>

                            {expandedLog === log.id && (
                                <div className="log-details">
                                    <div className="detail-row">
                                        <strong>IP:</strong> {log.ipAddress || 'N/A'}
                                    </div>
                                    <div className="detail-row">
                                        <strong>User Agent:</strong> {log.userAgent?.slice(0, 50) || 'N/A'}...
                                    </div>
                                    {log.oldData && (
                                        <div className="detail-section">
                                            <strong>Dados Anteriores:</strong>
                                            <pre>{JSON.stringify(log.oldData, null, 2)}</pre>
                                        </div>
                                    )}
                                    {log.newData && (
                                        <div className="detail-section">
                                            <strong>Novos Dados:</strong>
                                            <pre>{JSON.stringify(log.newData, null, 2)}</pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <style>{`
                .audit-logs-page {
                    padding: 24px;
                }
                
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 24px;
                }
                
                .page-header h1 {
                    margin: 0;
                    font-size: 1.75rem;
                    color: var(--fg-main, #f3f4f6);
                }
                
                .subtitle {
                    margin: 4px 0 0;
                    color: var(--fg-muted, #9ca3af);
                }
                
                .stats-badge {
                    padding: 8px 16px;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    border-radius: 20px;
                    color: white;
                    font-weight: bold;
                }
                
                .filters-bar {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }
                
                .filter-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--fg-muted, #9ca3af);
                }
                
                .filter-group select {
                    padding: 10px 16px;
                    background: var(--bg-card, #1f2937);
                    border: 1px solid var(--border-color, #374151);
                    border-radius: 8px;
                    color: var(--fg-main, #f3f4f6);
                }
                
                .logs-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .log-entry {
                    background: var(--bg-card, #1f2937);
                    border-radius: 12px;
                    overflow: hidden;
                }
                
                .log-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                
                .log-header:hover {
                    background: var(--bg-elevated, #374151);
                }
                
                .log-action {
                    padding: 4px 12px;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: bold;
                    color: white;
                    text-transform: uppercase;
                }
                
                .log-entity {
                    flex: 1;
                    font-weight: 600;
                    color: var(--fg-main, #f3f4f6);
                }
                
                .entity-id {
                    margin-left: 8px;
                    font-weight: normal;
                    font-size: 0.85rem;
                    color: var(--fg-muted, #9ca3af);
                }
                
                .log-user, .log-time {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.85rem;
                    color: var(--fg-muted, #9ca3af);
                }
                
                .expand-icon {
                    color: var(--fg-muted, #9ca3af);
                }
                
                .log-details {
                    padding: 16px;
                    background: var(--bg-elevated, #374151);
                    border-top: 1px solid var(--border-color, #4b5563);
                }
                
                .detail-row {
                    margin-bottom: 8px;
                    font-size: 0.9rem;
                    color: var(--fg-muted, #9ca3af);
                }
                
                .detail-section {
                    margin-top: 12px;
                }
                
                .detail-section pre {
                    margin: 8px 0 0;
                    padding: 12px;
                    background: var(--bg-card, #1f2937);
                    border-radius: 8px;
                    font-size: 0.8rem;
                    overflow-x: auto;
                    color: var(--fg-main, #f3f4f6);
                }
                
                .loading-state, .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: var(--fg-muted, #9ca3af);
                }
                
                .empty-state p {
                    margin: 16px 0 0;
                }
            `}</style>
        </div>
    );
};
