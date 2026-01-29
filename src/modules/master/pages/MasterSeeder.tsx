import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../api/client';
import { Users, Trash2, PlayCircle, Activity, Zap, ShieldAlert } from 'lucide-react';
import "./MasterShared.css";

export const MasterSeeder: React.FC = () => {
    const { t } = useTranslation();
    const [tenantId, setTenantId] = useState('');
    const [count, setCount] = useState(10);
    const [loading, setLoading] = useState(false);

    // Simulation State
    const [simSettings, setSimSettings] = useState({
        visitors: 5,
        minVisits: 1,
        maxVisits: 5
    });

    const handleGenerate = async () => {
        if (!tenantId) return alert("Tenant ID required");
        setLoading(true);
        try {
            const res = await api.post('/seeder/generate', { tenantId, count });
            alert(`🎉 Sucesso! ${res.data.message}`);
        } catch (error) {
            console.error(error);
            alert("❌ Erro ao gerar");
        } finally {
            setLoading(false);
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm("Tem certeza? Isso apagará TODOS os visitantes FALSOS deste tenant.")) return;
        if (!tenantId) return alert("Tenant ID required");
        setLoading(true);
        try {
            const res = await api.delete('/seeder/bulk', { data: { tenantId } });
            alert(`🗑️ ${res.data.message}`);
        } catch (error) {
            console.error(error);
            alert("❌ Erro ao apagar");
        } finally {
            setLoading(false);
        }
    };

    const handleSimulate = async () => {
        if (!tenantId) return alert("Tenant ID required");

        setLoading(true);
        try {
            const res = await api.post('/seeder/simulate-traffic', {
                tenantId,
                visitorCount: simSettings.visitors,
                minVisits: simSettings.minVisits,
                maxVisits: simSettings.maxVisits
            });
            alert(`🎭 ${res.data.details}`);
        } catch (e) {
            console.error(e);
            alert("❌ Erro na simulação");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="master-page-container">
            {/* HERO SECTION */}
            <section className="master-hero">
                <div className="master-hero-content">
                    <span className="master-badge">
                        ✨ Traffic Generator
                    </span>
                    <h1 className="master-title">
                        Simulador de Tráfego
                    </h1>
                    <p className="master-subtitle">
                        Crie vida no seu museu. Gere visitantes virtuais e simule interações reais para testar dashboards e recursos.
                    </p>
                </div>
            </section>

            {/* MAIN GRID */}
            <div className="master-grid-3">

                {/* CARD 1: GENERATE */}
                <article className="master-card">
                    <div className="master-card-header">
                        <div className="master-icon-wrapper master-icon-blue">
                            <Users size={24} />
                        </div>
                        <h3>Gerar Visitantes</h3>
                    </div>
                    <p className="master-card-desc">Crie perfis brasileiros realistas com fotos e dados mockados.</p>

                    <div className="master-form">
                        <div className="master-input-group">
                            <label>ID do Museu (UUID)</label>
                            <input
                                value={tenantId}
                                onChange={e => setTenantId(e.target.value)}
                                placeholder="Cole o ID do Tenant aqui..."
                            />
                        </div>
                        <div className="master-input-group">
                            <label>Quantidade ({count})</label>
                            <input
                                type="range"
                                min="1" max="50"
                                value={count}
                                onChange={e => setCount(Number(e.target.value))}
                            />
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="master-btn btn-primary"
                        >
                            {loading ? <Activity className="animate-spin" /> : <Zap size={18} />}
                            Gerar {count} Visitantes
                        </button>
                    </div>
                </article>

                {/* CARD 2: SIMULATE */}
                <article className="master-card">
                    <div className="master-card-header">
                        <div className="master-icon-wrapper master-icon-purple">
                            <PlayCircle size={24} />
                        </div>
                        <h3>Simular Atividade</h3>
                    </div>
                    <p className="master-card-desc">Faça os visitantes "andarem" pelo museu e interagirem com obras.</p>

                    <div className="master-form">
                        <div className="sim-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                            <div className="stat-item" style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Ativos</label>
                                <input
                                    style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '0.5rem', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', textAlign: 'center' }}
                                    type="number" value={simSettings.visitors}
                                    onChange={e => setSimSettings({ ...simSettings, visitors: Number(e.target.value) })}
                                />
                            </div>
                            <div className="stat-item" style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Min Obras</label>
                                <input
                                    style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '0.5rem', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', textAlign: 'center' }}
                                    type="number" value={simSettings.minVisits}
                                    onChange={e => setSimSettings({ ...simSettings, minVisits: Number(e.target.value) })}
                                />
                            </div>
                            <div className="stat-item" style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Max Obras</label>
                                <input
                                    style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '0.5rem', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', textAlign: 'center' }}
                                    type="number" value={simSettings.maxVisits}
                                    onChange={e => setSimSettings({ ...simSettings, maxVisits: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSimulate}
                            disabled={loading}
                            className="master-btn btn-purple"
                        >
                            {loading ? <Activity className="animate-spin" /> : <PlayCircle size={18} />}
                            Rodar Simulação
                        </button>
                    </div>
                </article>

                {/* CARD 3: CLEANUP */}
                <article className="master-card">
                    <div className="master-card-header">
                        <div className="master-icon-wrapper master-icon-red">
                            <Trash2 size={24} />
                        </div>
                        <h3>Zona de Perigo</h3>
                    </div>
                    <p className="master-card-desc">Limpeza de dados. remove apenas usuários marcados como `isFake`.</p>

                    <button
                        onClick={handleBulkDelete}
                        disabled={loading}
                        className="master-btn btn-danger"
                    >
                        <ShieldAlert size={18} />
                        Apagar Fakes
                    </button>
                </article>

            </div>
        </div>
    );
};
