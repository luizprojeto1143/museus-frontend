import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../api/client';
import { Users, Trash2, PlayCircle, Activity, Zap, ShieldAlert } from 'lucide-react';
import "./MasterSeeder.css"; // We will create this css file next

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
        <div className="seeder-container">
            {/* HERO SECTION */}
            <section className="seeder-hero">
                <div className="seeder-hero-content">
                    <span className="seeder-badge">
                        ✨ Traffic Generator
                    </span>
                    <h1 className="seeder-title">
                        Simulador de Tráfego
                    </h1>
                    <p className="seeder-subtitle">
                        Crie vida no seu museu. Gere visitantes virtuais e simule interações reais para testar dashboards e recursos.
                    </p>
                </div>
            </section>

            {/* MAIN GRID */}
            <div className="seeder-grid">

                {/* CARD 1: GENERATE */}
                <article className="seeder-card generate-card">
                    <div className="card-header">
                        <div className="icon-wrapper bg-blue-500/20 text-blue-400">
                            <Users size={24} />
                        </div>
                        <h3>Gerar Visitantes</h3>
                    </div>
                    <p className="card-desc">Crie perfis brasileiros realistas com fotos e dados mockados.</p>

                    <div className="card-form">
                        <div className="input-group">
                            <label>ID do Museu (UUID)</label>
                            <input
                                value={tenantId}
                                onChange={e => setTenantId(e.target.value)}
                                placeholder="Cole o ID do Tenant aqui..."
                            />
                        </div>
                        <div className="input-group">
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
                            className="seeder-btn btn-primary"
                        >
                            {loading ? <Activity className="animate-spin" /> : <Zap size={18} />}
                            Gerar {count} Visitantes
                        </button>
                    </div>
                </article>

                {/* CARD 2: SIMULATE */}
                <article className="seeder-card simulate-card">
                    <div className="card-header">
                        <div className="icon-wrapper bg-purple-500/20 text-purple-400">
                            <PlayCircle size={24} />
                        </div>
                        <h3>Simular Atividade</h3>
                    </div>
                    <p className="card-desc">Faça os visitantes "andarem" pelo museu e interagirem com obras.</p>

                    <div className="card-form">
                        <div className="sim-stats">
                            <div className="stat-item">
                                <label>Ativos</label>
                                <input
                                    type="number" value={simSettings.visitors}
                                    onChange={e => setSimSettings({ ...simSettings, visitors: Number(e.target.value) })}
                                />
                            </div>
                            <div className="stat-item">
                                <label>Min Obras</label>
                                <input
                                    type="number" value={simSettings.minVisits}
                                    onChange={e => setSimSettings({ ...simSettings, minVisits: Number(e.target.value) })}
                                />
                            </div>
                            <div className="stat-item">
                                <label>Max Obras</label>
                                <input
                                    type="number" value={simSettings.maxVisits}
                                    onChange={e => setSimSettings({ ...simSettings, maxVisits: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSimulate}
                            disabled={loading}
                            className="seeder-btn btn-purple"
                        >
                            {loading ? <Activity className="animate-spin" /> : <PlayCircle size={18} />}
                            Rodar Simulação
                        </button>
                    </div>
                </article>

                {/* CARD 3: CLEANUP */}
                <article className="seeder-card danger-card">
                    <div className="card-header">
                        <div className="icon-wrapper bg-red-500/20 text-red-400">
                            <Trash2 size={24} />
                        </div>
                        <h3>Zona de Perigo</h3>
                    </div>
                    <p className="card-desc">Limpeza de dados. remove apenas usuários marcados como `isFake`.</p>

                    <button
                        onClick={handleBulkDelete}
                        disabled={loading}
                        className="seeder-btn btn-danger"
                    >
                        <ShieldAlert size={18} />
                        Apagar Fakes
                    </button>
                </article>

            </div>
        </div>
    );
};
import { useTranslation } from 'react-i18next';
import { api } from '../../../api/client';
import { Users, Trash2, PlayCircle, MessageSquare } from 'lucide-react';


export const MasterSeeder: React.FC = () => {
    const { t } = useTranslation();
    const [tenantId, setTenantId] = useState('');
    const [count, setCount] = useState(10);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

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
            setResult(res.data);
            alert(`Sucesso! ${res.data.message}`);
        } catch (error) {
            console.error(error);
            alert("Erro ao gerar");
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
            alert(res.data.message);
            setResult(null);
        } catch (error) {
            console.error(error);
            alert("Erro ao apagar");
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
            alert(res.data.details);
        } catch (e) {
            console.error(e);
            alert("Erro na simulação");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Users className="text-blue-500" />
                    Gerador de Visitantes (Traffic Generator)
                </h1>
                <p className="text-gray-400 mt-2">
                    Simule tráfego real para seus clientes. Gere visitantes com dados brasileiros e e-mails @gmail.com.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Generator Card */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <PlayCircle size={20} className="text-green-500" />
                        Gerar Tráfego
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">ID do Cliente (Tenant UUID)</label>
                            <input
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                                value={tenantId}
                                onChange={e => setTenantId(e.target.value)}
                                placeholder="ex: 123e4567-e89b..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Quantidade</label>
                            <input
                                type="number"
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                                value={count}
                                onChange={e => setCount(Number(e.target.value))}
                                min={1}
                                max={50}
                            />
                            <p className="text-xs text-gray-500 mt-1">Máximo 50 por lote para segurança.</p>
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Gerando...' : '🚀 Gerar Visitantes'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cleanup Card */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Trash2 size={20} className="text-red-500" />
                        Limpeza
                    </h2>
                    <p className="text-gray-300 mb-4">
                        Remove <strong>apenas</strong> os visitantes marcados como `isFake`. Visitantes reais não serão afetados.
                    </p>
                    <button
                        onClick={handleBulkDelete}
                        disabled={loading}
                        className="w-full bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800 font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
                    >
                        🗑️ Remover Todos os Fakes
                    </button>
                </div>

                {/* Simulation Card */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 md:col-span-2">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <PlayCircle size={20} className="text-purple-500" />
                        Simular Atividade (Tráfego)
                    </h2>
                    <p className="text-gray-400 text-sm mb-4">
                        Escolha quantos visitantes "acordar" e quantas obras cada um deve visitar.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Visitantes Ativos</label>
                            <input
                                type="number"
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                                placeholder="Ex: 5"
                                value={simSettings.visitors}
                                onChange={e => setSimSettings({ ...simSettings, visitors: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Min. Obras/Visitante</label>
                            <input
                                type="number"
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                                placeholder="Ex: 1"
                                value={simSettings.minVisits}
                                onChange={e => setSimSettings({ ...simSettings, minVisits: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Max. Obras/Visitante</label>
                            <input
                                type="number"
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                                placeholder="Ex: 5"
                                value={simSettings.maxVisits}
                                onChange={e => setSimSettings({ ...simSettings, maxVisits: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSimulate}
                        disabled={loading}
                        className="mt-4 w-full bg-purple-900/50 hover:bg-purple-900 text-purple-200 border border-purple-800 font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
                    >
                        🎭 Simular Movimento Real
                    </button>
                </div>
            </div>

            {/* Simulation Tips */}
            <div className="mt-8 bg-blue-900/20 border border-blue-800 p-4 rounded-lg">
                <h3 className="font-bold text-blue-300 mb-2 flex items-center gap-2">
                    <MessageSquare size={18} />
                    Dica de Uso
                </h3>
                <p className="text-sm text-blue-100/80">
                    Os visitantes gerados terão nomes brasileiros aleatórios e e-mails do Gmail. Eles aparecerão nos gráficos de Analytics e poderão interagir com o sistema se você usar a API de simulação.
                </p>
            </div>
        </div>
    );
};
