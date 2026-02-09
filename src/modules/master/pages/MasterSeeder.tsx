import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../api/client';
import { Users, Trash2, PlayCircle, Activity, Zap, ShieldAlert } from 'lucide-react';
import { Button, Input } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import "./MasterShared.css";

export const MasterSeeder: React.FC = () => {
    const { t } = useTranslation();
    const { addToast } = useToast();
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
        if (!tenantId) {
            addToast("Tenant ID required", "info");
            return;
        }
        setLoading(true);
        try {
            const res = await api.post('/seeder/generate', { tenantId, count });
            addToast(`🎉 Sucesso! ${res.data.message}`, "success");
        } catch (error) {
            console.error(error);
            addToast("❌ Erro ao gerar", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm("Tem certeza? Isso apagará TODOS os visitantes FALSOS deste tenant.")) return;
        if (!tenantId) {
            addToast("Tenant ID required", "info");
            return;
        }
        setLoading(true);
        try {
            const res = await api.delete('/seeder/bulk', { data: { tenantId } });
            addToast(`🗑️ ${res.data.message}`, "success");
        } catch (error) {
            console.error(error);
            addToast("❌ Erro ao apagar", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSimulate = async () => {
        if (!tenantId) {
            addToast("Tenant ID required", "info");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/seeder/simulate-traffic', {
                tenantId,
                visitorCount: simSettings.visitors,
                minVisits: simSettings.minVisits,
                maxVisits: simSettings.maxVisits
            });
            addToast(`🎭 ${res.data.details}`, "success");
        } catch (e) {
            console.error(e);
            addToast("❌ Erro na simulação", "error");
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

                    <div className="master-form space-y-4">
                        <Input
                            label="ID do Museu (UUID)"
                            value={tenantId}
                            onChange={e => setTenantId(e.target.value)}
                            placeholder="Cole o ID do Tenant aqui..."
                        />
                        <div className="master-input-group">
                            <label className="text-sm font-semibold mb-2 block">Quantidade ({count})</label>
                            <input
                                type="range"
                                min="1" max="50"
                                value={count}
                                onChange={e => setCount(Number(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                        <Button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full"
                            leftIcon={loading ? <Activity className="animate-spin" size={18} /> : <Zap size={18} />}
                        >
                            Gerar {count} Visitantes
                        </Button>
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

                    <div className="master-form space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                            <Input
                                label="Ativos"
                                type="number"
                                value={simSettings.visitors}
                                onChange={e => setSimSettings({ ...simSettings, visitors: Number(e.target.value) })}
                                className="text-center"
                            />
                            <Input
                                label="Min Obras"
                                type="number"
                                value={simSettings.minVisits}
                                onChange={e => setSimSettings({ ...simSettings, minVisits: Number(e.target.value) })}
                                className="text-center"
                            />
                            <Input
                                label="Max Obras"
                                type="number"
                                value={simSettings.maxVisits}
                                onChange={e => setSimSettings({ ...simSettings, maxVisits: Number(e.target.value) })}
                                className="text-center"
                            />
                        </div>

                        <Button
                            onClick={handleSimulate}
                            disabled={loading}
                            className="w-full bg-purple-600 hover:bg-purple-700 border-none"
                            leftIcon={loading ? <Activity className="animate-spin" size={18} /> : <PlayCircle size={18} />}
                        >
                            Rodar Simulação
                        </Button>
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

                    <Button
                        onClick={handleBulkDelete}
                        disabled={loading}
                        variant="outline"
                        className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10"
                        leftIcon={<ShieldAlert size={18} />}
                    >
                        Apagar Fakes
                    </Button>
                </article>

            </div>
        </div>
    );
};
