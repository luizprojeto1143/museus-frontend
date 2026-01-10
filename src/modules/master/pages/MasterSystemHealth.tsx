import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Cpu, HardDrive, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../../api/client';

interface HealthData {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    uptime: number;
    services: {
        database: {
            status: string;
            latency?: string;
            error?: string;
        };
    };
    system: {
        hostname: string;
        platform: string;
        memory: {
            total: string;
            free: string;
            used: string;
        };
        cpu: string;
    };
    version: string;
}

export const MasterSystemHealth: React.FC = () => {
    const [health, setHealth] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        fetchHealth();

        let interval: ReturnType<typeof setInterval>;
        if (autoRefresh) {
            interval = setInterval(fetchHealth, 30000); // Every 30s
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh]);

    const fetchHealth = async () => {
        try {
            const res = await api.get('/health');
            setHealth(res.data);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Health check failed:', error);
            setHealth({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                uptime: 0,
                services: {
                    database: { status: 'disconnected', error: 'Connection failed' }
                },
                system: { hostname: 'Unknown', platform: 'Unknown', memory: { total: '0', free: '0', used: '0' }, cpu: '0' },
                version: 'Unknown'
            });
        } finally {
            setLoading(false);
        }
    };

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const mins = Math.floor((seconds % 3600) / 60);

        if (days > 0) return `${days}d ${hours}h ${mins}m`;
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
    };

    const isHealthy = health?.status === 'healthy';

    return (
        <div className="system-health-page">
            <header className="page-header">
                <div>
                    <h1>🖥️ Saúde do Sistema</h1>
                    <p className="subtitle">Monitoramento em tempo real da infraestrutura</p>
                </div>
                <div className="header-actions">
                    <label className="auto-refresh">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                        />
                        Auto-atualizar
                    </label>
                    <button className="refresh-btn" onClick={fetchHealth} disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'spinning' : ''} />
                        Atualizar
                    </button>
                </div>
            </header>

            {/* Main Status */}
            <div className={`status-banner ${isHealthy ? 'healthy' : 'unhealthy'}`}>
                {isHealthy ? <CheckCircle size={32} /> : <XCircle size={32} />}
                <div>
                    <h2>{isHealthy ? 'Sistema Operacional' : 'Problemas Detectados'}</h2>
                    <p>Última verificação: {lastUpdate?.toLocaleTimeString('pt-BR') || 'N/A'}</p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="metrics-grid">
                {/* Database */}
                <div className="metric-card">
                    <div className="metric-header">
                        <Database size={24} />
                        <span>Banco de Dados</span>
                    </div>
                    <div className={`metric-status ${health?.services?.database?.status === 'connected' ? 'ok' : 'error'}`}>
                        {health?.services?.database?.status === 'connected' ? '✅ Conectado' : '❌ Desconectado'}
                    </div>
                    {health?.services?.database?.latency && (
                        <div className="metric-detail">
                            Latência: <strong>{health?.services?.database?.latency}</strong>
                        </div>
                    )}
                    {health?.services?.database?.error && (
                        <div className="metric-error">{health?.services?.database?.error}</div>
                    )}
                </div>

                {/* Uptime */}
                <div className="metric-card">
                    <div className="metric-header">
                        <Activity size={24} />
                        <span>Uptime</span>
                    </div>
                    <div className="metric-value">
                        {health ? formatUptime(health.uptime) : '-'}
                    </div>
                    <div className="metric-detail">
                        Versão: <strong>{health?.version || 'N/A'}</strong>
                    </div>
                </div>

                {/* Memory */}
                <div className="metric-card">
                    <div className="metric-header">
                        <HardDrive size={24} />
                        <span>Memória</span>
                    </div>
                    <div className="metric-value">{health?.system?.memory?.used || '-'}</div>
                    <div className="memory-bar">
                        <div
                            className="memory-used"
                            style={{
                                width: (health?.system?.memory?.used && health?.system?.memory?.total) ?
                                    `${(parseInt(health?.system?.memory?.used || '0') / parseInt(health?.system?.memory?.total || '1')) * 100}%`
                                    : '0%'
                            }}
                        />
                    </div>
                    <div className="metric-detail">
                        de {health?.system?.memory?.total || '-'} total
                    </div>
                </div>

                {/* CPU */}
                <div className="metric-card">
                    <div className="metric-header">
                        <Cpu size={24} />
                        <span>CPU</span>
                    </div>
                    <div className="metric-value">{health?.system?.cpu || '-'}</div>
                    <div className="metric-detail">
                        Plataforma: <strong>{health?.system?.platform || 'N/A'}</strong>
                    </div>
                </div>

                {/* Server */}
                <div className="metric-card">
                    <div className="metric-header">
                        <Server size={24} />
                        <span>Servidor</span>
                    </div>
                    <div className="metric-value hostname">{health?.system?.hostname || '-'}</div>
                    <div className="metric-detail">
                        Ambiente: <strong>{import.meta.env.MODE || 'development'}</strong>
                    </div>
                </div>
            </div>

            <style>{`
                .system-health-page {
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
                
                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                
                .auto-refresh {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--fg-muted, #9ca3af);
                    font-size: 0.9rem;
                }
                
                .refresh-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: var(--bg-card, #1f2937);
                    border: 1px solid var(--border-color, #374151);
                    border-radius: 8px;
                    color: var(--fg-main, #f3f4f6);
                    cursor: pointer;
                }
                
                .refresh-btn:disabled {
                    opacity: 0.6;
                }
                
                .spinning {
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                .status-banner {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 24px;
                    border-radius: 16px;
                    margin-bottom: 24px;
                }
                
                .status-banner.healthy {
                    background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.1));
                    border: 1px solid rgba(34, 197, 94, 0.3);
                    color: #22c55e;
                }
                
                .status-banner.unhealthy {
                    background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1));
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    color: #ef4444;
                }
                
                .status-banner h2 {
                    margin: 0;
                    font-size: 1.25rem;
                    color: inherit;
                }
                
                .status-banner p {
                    margin: 4px 0 0;
                    font-size: 0.9rem;
                    opacity: 0.8;
                }
                
                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 16px;
                }
                
                .metric-card {
                    background: var(--bg-card, #1f2937);
                    border-radius: 16px;
                    padding: 20px;
                }
                
                .metric-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 16px;
                    color: var(--fg-muted, #9ca3af);
                }
                
                .metric-status {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin-bottom: 8px;
                }
                
                .metric-status.ok {
                    color: #22c55e;
                }
                
                .metric-status.error {
                    color: #ef4444;
                }
                
                .metric-value {
                    font-size: 1.75rem;
                    font-weight: bold;
                    color: var(--fg-main, #f3f4f6);
                    margin-bottom: 8px;
                }
                
                .metric-value.hostname {
                    font-size: 1.1rem;
                    word-break: break-all;
                }
                
                .metric-detail {
                    font-size: 0.9rem;
                    color: var(--fg-muted, #9ca3af);
                }
                
                .metric-error {
                    font-size: 0.85rem;
                    color: #ef4444;
                    margin-top: 8px;
                }
                
                .memory-bar {
                    height: 8px;
                    background: var(--bg-elevated, #374151);
                    border-radius: 4px;
                    overflow: hidden;
                    margin: 8px 0;
                }
                
                .memory-used {
                    height: 100%;
                    background: linear-gradient(90deg, #22c55e, #16a34a);
                    border-radius: 4px;
                    transition: width 0.3s;
                }
            `}</style>
        </div>
    );
};
