import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Cpu, HardDrive, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../../api/client';
import { useTranslation } from 'react-i18next';
import "./MasterShared.css";

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
    const { t } = useTranslation();
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
        <div className="master-page-container">
            {/* HERO SECTION */}
            <section className="master-hero">
                <div className="master-hero-content">
                    <span className="master-badge">
                        🖥️ Monitoramento
                    </span>
                    <h1 className="master-title">
                        Saúde do Sistema
                    </h1>
                    <p className="master-subtitle">
                        Acompanhe o status dos serviços, uso de recursos e conectividade em tempo real.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <label className="master-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 0, cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            style={{ width: '16px', height: '16px' }}
                        />
                        <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>Auto-atualizar</span>
                    </label>

                    <button
                        className="master-btn btn-primary"
                        onClick={fetchHealth}
                        disabled={loading}
                        style={{ width: 'auto', marginTop: 0 }}
                    >
                        <RefreshCw size={18} className={loading ? 'spinning' : ''} />
                        Atualizar
                    </button>

                    <style>{`
                        .spinning { animation: spin 1s linear infinite; }
                        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    `}</style>
                </div>
            </section>

            {/* MAIN STATUS BANNER */}
            <div
                className="master-card"
                style={{
                    marginBottom: '2rem',
                    background: isHealthy ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.05))' : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
                    border: isHealthy ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    padding: '2rem'
                }}
            >
                <div className="master-icon-wrapper" style={{ background: isHealthy ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: isHealthy ? '#4ade80' : '#f87171', width: '64px', height: '64px' }}>
                    {isHealthy ? <CheckCircle size={32} /> : <XCircle size={32} />}
                </div>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: isHealthy ? '#4ade80' : '#f87171', marginBottom: '0.5rem' }}>
                        {isHealthy ? 'Sistema Operacional e Estável' : 'Atenção: Problemas Detectados'}
                    </h2>
                    <p style={{ color: '#94a3b8', margin: 0 }}>
                        Última verificação: <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{lastUpdate?.toLocaleTimeString('pt-BR') || 'N/A'}</span>
                    </p>
                </div>
            </div>

            {/* METRICS GRID */}
            <div className="master-grid-3">
                {/* Database */}
                <div className="master-card">
                    <div className="master-card-header">
                        <div className="master-icon-wrapper master-icon-purple">
                            <Database size={24} />
                        </div>
                        <h3>Banco de Dados</h3>
                    </div>

                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            color: health?.services?.database?.status === 'connected' ? '#4ade80' : '#f87171',
                            marginBottom: '0.5rem'
                        }}>
                            {health?.services?.database?.status === 'connected' ? '✅ Conectado' : '❌ Desconectado'}
                        </div>
                        {health?.services?.database?.latency && (
                            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                Latência: <strong style={{ color: '#e2e8f0' }}>{health?.services?.database?.latency}</strong>
                            </div>
                        )}
                        {health?.services?.database?.error && (
                            <div style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                {health?.services?.database?.error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Uptime */}
                <div className="master-card">
                    <div className="master-card-header">
                        <div className="master-icon-wrapper master-icon-blue">
                            <Activity size={24} />
                        </div>
                        <h3>Tempo de Atividade</h3>
                    </div>

                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.5rem' }}>
                            {health ? formatUptime(health.uptime) : '-'}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                            Versão: <strong style={{ color: '#e2e8f0' }}>{health?.version || 'N/A'}</strong>
                        </div>
                    </div>
                </div>

                {/* Server */}
                <div className="master-card">
                    <div className="master-card-header">
                        <div className="master-icon-wrapper master-icon-yellow">
                            <Server size={24} />
                        </div>
                        <h3>Servidor</h3>
                    </div>

                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem', wordBreak: 'break-all' }}>
                            {health?.system?.hostname || '-'}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                            Ambiente: <strong style={{ color: '#e2e8f0', textTransform: 'uppercase' }}>{import.meta.env.MODE || 'development'}</strong>
                        </div>
                    </div>
                </div>

                {/* Memory */}
                <div className="master-card">
                    <div className="master-card-header">
                        <div className="master-icon-wrapper master-icon-pink">
                            <HardDrive size={24} />
                        </div>
                        <h3>Memória</h3>
                    </div>

                    <div style={{ padding: '0.5rem 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                            <span>Usado: <strong>{health?.system?.memory?.used || '0Mb'}</strong></span>
                            <span>Total: <span style={{ color: '#94a3b8' }}>{health?.system?.memory?.total || '-'}</span></span>
                        </div>

                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                width: (health?.system?.memory?.used && health?.system?.memory?.total) ?
                                    `${(parseInt(health?.system?.memory?.used || '0') / parseInt(health?.system?.memory?.total || '1')) * 100}%`
                                    : '0%',
                                height: '100%',
                                background: 'linear-gradient(90deg, #ec4899, #be185d)',
                                transition: 'width 0.5s ease'
                            }} />
                        </div>
                    </div>
                </div>

                {/* CPU */}
                <div className="master-card">
                    <div className="master-card-header">
                        <div className="master-icon-wrapper" style={{ background: 'rgba(14, 165, 233, 0.2)', color: '#38bdf8' }}>
                            <Cpu size={24} />
                        </div>
                        <h3>Processador</h3>
                    </div>

                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.5rem' }}>
                            {health?.system?.cpu || '-'}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                            Plataforma: <strong style={{ color: '#e2e8f0' }}>{health?.system?.platform || 'N/A'}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
