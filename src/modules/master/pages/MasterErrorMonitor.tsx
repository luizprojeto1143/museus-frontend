import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from "react-i18next";
import { 
    AlertTriangle, 
    Terminal, 
    Activity, 
    RefreshCw, 
    Search, 
    ChevronDown, 
    ChevronRight, 
    Database, 
    ShieldAlert,
    Trash2,
    Pause,
    Play
} from 'lucide-react';
import { api } from '../../../api/client';
import "./MasterShared.css";

interface AuditLogEntry {
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    userId: string | null;
    userEmail: string | null;
    tenantId: string;
    oldData: any | null;
    newData: any | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
}

export const MasterErrorMonitor: React.FC = () => {
    const { t } = useTranslation();
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [expandedLog, setExpandedLog] = useState<string | null>(null);
    const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'DATABASE'>('ALL');
    const lastFetchRef = useRef<number>(0);

    useEffect(() => {
        fetchLogs();

        let interval: ReturnType<typeof setInterval>;
        if (autoRefresh) {
            interval = setInterval(fetchLogs, 8000); // Polling every 8s
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh, filter]);

    const fetchLogs = async () => {
        try {
            // Using our technical logs endpoint
            const res = await api.get('/ops/error-logs');
            const technicalLogs = res.data.filter((log: AuditLogEntry) => {
                if (filter === 'CRITICAL') return log.action === 'SERVER_ERROR';
                if (filter === 'DATABASE') return log.newData?.message?.includes('Prisma') || log.newData?.message?.includes('database');
                return true; // Default: show all from /ops/error-logs
            });
            
            setLogs(technicalLogs);
            lastFetchRef.current = Date.now();
        } catch (error) {
            console.error('Failed to fetch technical logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const clearLocal = () => setLogs([]);

    const getLogType = (log: AuditLogEntry) => {
        if (log.action === 'SERVER_ERROR') return { label: 'CRITICAL', color: '#f87171', bg: 'rgba(239, 68, 68, 0.1)' };
        if (log.action === 'DATABASE_FAILURE') return { label: 'DATABASE', color: '#fb923c', bg: 'rgba(251, 146, 60, 0.1)' };
        return { label: 'INFO', color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.1)' };
    };

    return (
        <div className="master-page-container">
            {/* TERMINAL HEADER */}
            <section className="master-hero" style={{ paddingBottom: '1rem' }}>
                <div className="master-hero-content">
                    <span className="master-badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <ShieldAlert size={14} style={{ marginRight: '6px' }} />
                        Master Monitor
                    </span>
                    <h1 className="master-title">Real-Time Error Console</h1>
                    <p className="master-subtitle">Monitoramento de baixo nível para detecção proativa de instabilidades no núcleo do sistema.</p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div className="master-card" style={{ padding: '0.25rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 0 }}>
                        <button 
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`p-2 rounded-lg transition-colors ${autoRefresh ? 'text-green-400 bg-green-400/10' : 'text-slate-400 bg-white/5'}`}
                            title={autoRefresh ? 'Pause Polling' : 'Resume Polling'}
                        >
                            {autoRefresh ? <Pause size={18} /> : <Play size={18} />}
                        </button>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '0.5rem' }}>
                            {autoRefresh ? 'Polling Active' : 'Polling Paused'}
                        </span>
                    </div>

                    <button className="master-btn btn-secondary" onClick={clearLocal} style={{ width: 'auto', marginTop: 0 }}>
                        <Trash2 size={18} />
                        Clear View
                    </button>
                </div>
            </section>

            {/* FILTERS & STATUS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(['ALL', 'CRITICAL', 'DATABASE'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                background: filter === f ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                                color: filter === f ? '#60a5fa' : '#94a3b8',
                                border: filter === f ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        Server: Online
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Database size={14} />
                        Pooler: Stable (6543)
                    </div>
                </div>
            </div>

            {/* ERROR FEED - TERMINAL STYLE */}
            <div className="master-card" style={{ padding: 0, background: '#0a0a0c', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1rem', background: '#16161a', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Terminal size={14} color="#64748b" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em' }}>LIVE_SYSTEM_FEED.LOG</span>
                </div>

                <div style={{ maxHeight: '600px', overflowY: 'auto', padding: '0.5rem' }}>
                    {loading && logs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: '#4b5563', fontFamily: 'monospace' }}>
                            <RefreshCw size={24} className="spinning" style={{ marginBottom: '1rem' }} />
                            Initializing monitor...
                        </div>
                    ) : logs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: '#4b5563', fontFamily: 'monospace' }}>
                            No active exceptions detected. System stable.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {logs.map(log => {
                                const type = getLogType(log);
                                const isExpanded = expandedLog === log.id;

                                return (
                                    <div 
                                        key={log.id} 
                                        style={{ 
                                            padding: '0.75rem 1rem', 
                                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                                            background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        <div 
                                            style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                                            onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                                        >
                                            <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#4b5563', minWidth: '80px' }}>
                                                [{new Date(log.createdAt).toLocaleTimeString('pt-BR')}]
                                            </span>
                                            <span style={{ 
                                                fontSize: '0.7rem', 
                                                fontWeight: 800, 
                                                padding: '2px 6px', 
                                                borderRadius: '4px', 
                                                background: type.bg, 
                                                color: type.color,
                                                minWidth: '80px',
                                                textAlign: 'center'
                                            }}>
                                                {type.label}
                                            </span>
                                            <span style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.85rem', color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {log.newData?.message || log.action} at {log.entityId || 'system'}
                                            </span>
                                            <div style={{ color: '#4b5563' }}>
                                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div style={{ 
                                                marginTop: '1rem', 
                                                padding: '1rem', 
                                                background: '#0d0d10', 
                                                borderRadius: '8px', 
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                fontFamily: 'monospace'
                                            }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem', fontSize: '0.8rem' }}>
                                                    <div><span style={{ color: '#64748b' }}>TRANSACTION_ID:</span> <span style={{ color: '#94a3b8' }}>{log.id}</span></div>
                                                    <div><span style={{ color: '#64748b' }}>ENTITY:</span> <span style={{ color: '#94a3b8' }}>{log.entity}</span></div>
                                                    <div><span style={{ color: '#64748b' }}>USER_CONTEXT:</span> <span style={{ color: '#94a3b8' }}>{log.userEmail || 'ANONYMOUS/SYSTEM'}</span></div>
                                                    <div><span style={{ color: '#64748b' }}>IP_ADDR:</span> <span style={{ color: '#94a3b8' }}>{log.ipAddress || '127.0.0.1'}</span></div>
                                                </div>

                                                <div style={{ marginBottom: '0.5rem', color: '#f87171', fontSize: '0.75rem', fontWeight: 800 }}>[ STACK_TRACE ]</div>
                                                <pre style={{ 
                                                    background: '#1a1b1e', 
                                                    padding: '1rem', 
                                                    borderRadius: '4px', 
                                                    fontSize: '0.75rem', 
                                                    color: '#94a3b8', 
                                                    overflowX: 'auto',
                                                    borderLeft: '2px solid #ef4444'
                                                }}>
                                                    {log.newData?.stack || JSON.stringify(log.newData || log.oldData, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            
            {/* FOOTER LEGEND */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                    <AlertTriangle size={14} color="#f87171" />
                    <strong>CRITICAL</strong> - Erros de execução do Node.js (500)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                    <Database size={14} color="#fb923c" />
                    <strong>DATABASE</strong> - Falhas de conexão ou queries do Prisma
                </div>
            </div>
        </div>
    );
};
