import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../api/client';
import { Button } from '../../../components/ui/Button';

export const CertificateRuleForm: React.FC = () => {
    const navigate = useNavigate();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [templates, setTemplates] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [trails, setTrails] = useState<any[]>([]);

    // Form State
    const [name, setName] = useState('');
    const [triggerType, setTriggerType] = useState('TRAIL_COMPLETED');
    const [templateId, setTemplateId] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [conditions, setConditions] = useState<any>({});

    const loadData = async () => {
        try {
            const [tplRes, trailRes] = await Promise.all([
                api.get('/certificate-templates'),
                api.get('/admin/trails') // Assuming generic trail list endpoint exists
            ]);
            setTemplates(tplRes.data);
            setTrails(trailRes.data);
        } catch (err) {
            console.error("Failed to load data", err);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSave = async () => {
        try {
            await api.post('/certificate-rules', {
                name,
                triggerType,
                actionTemplateId: templateId,
                conditions,
                active: true
            });
            navigate('/admin/certificates/rules');
        } catch (err) {
            console.error(err);
            alert("Erro ao salvar regra");
        }
    };

    return (
        <div className="p-6 max-w-2xl bg-white rounded-lg shadow m-6">
            <h1 className="text-2xl font-bold mb-6">Nova Regra de Automação</h1>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Nome da Regra</label>
                    <input
                        className="w-full p-2 border rounded"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Ex: Certificado Trilha Histórica"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Gatilho (Quando emitir?)</label>
                    <select
                        className="w-full p-2 border rounded"
                        value={triggerType}
                        onChange={e => setTriggerType(e.target.value)}
                    >
                        <option value="TRAIL_COMPLETED">Ao completar uma Trilha</option>
                        <option value="EVENT_ATTENDED">Ao participar de um Evento</option>
                        <option value="XP_THRESHOLD">Ao atingir X pontos de XP</option>
                    </select>
                </div>

                {/* Conditional Inputs based on Trigger */}
                {triggerType === 'TRAIL_COMPLETED' && (
                    <div className="p-4 bg-gray-50 rounded border">
                        <label className="block text-sm font-medium mb-1">Qual Trilha?</label>
                        <select
                            className="w-full p-2 border rounded"
                            onChange={e => setConditions({ ...conditions, trail_id: e.target.value })}
                        >
                            <option value="">Qualquer Trilha</option>
                            {trails.map(t => (
                                <option key={t.id} value={t.id}>{t.title}</option>
                            ))}
                        </select>
                    </div>
                )}

                {triggerType === 'XP_THRESHOLD' && (
                    <div className="p-4 bg-gray-50 rounded border">
                        <label className="block text-sm font-medium mb-1">Mínimo de XP</label>
                        <input
                            type="number"
                            className="w-full p-2 border rounded"
                            onChange={e => setConditions({ ...conditions, min_xp: Number(e.target.value) })}
                            placeholder="Ex: 1000"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium mb-1">Modelo de Certificado</label>
                    <select
                        className="w-full p-2 border rounded"
                        value={templateId}
                        onChange={e => setTemplateId(e.target.value)}
                    >
                        <option value="">Selecione um modelo...</option>
                        {templates.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>

                <div className="pt-4">
                    <Button onClick={handleSave} disabled={!name || !templateId}>
                        Salvar Regra Automática
                    </Button>
                </div>
            </div>
        </div>
    );
};
