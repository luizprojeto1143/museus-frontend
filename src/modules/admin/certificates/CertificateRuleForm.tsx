import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../api/client';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../auth/AuthContext';

export const CertificateRuleForm: React.FC = () => {
  const { t } = useTranslation();
    const navigate = useNavigate();
    const { tenantId } = useAuth();
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
                api.get('/trails', { params: { tenantId } })
            ]);
            setTemplates(tplRes.data);
            setTrails(trailRes.data);
        } catch (err) {
            console.error("Failed to load data", err);
        }
    };

    useEffect(() => {
        loadData();
         
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
        <div className="visitor-card max-w-2xl m-6">
            <h1 className="text-2xl font-bold mb-6 text-[var(--accent-primary)]">{t("admin.certificaterule.novaRegraDeAutomao", `Nova Regra de Automação`)}</h1>

            <div className="space-y-4">
                <div className="visitor-input-group">
                    <label>Nome da Regra</label>
                    <input
                        className="visitor-input"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder={t("admin.certificaterule.exCertificadoTrilhaHistrica", `Ex: Certificado Trilha Histórica`)}
                    />
                </div>

                <div className="visitor-input-group">
                    <label>Gatilho (Quando emitir?)</label>
                    <select
                        className="visitor-input"
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
                    <div className="p-4 bg-black/20 rounded-xl border border-[var(--border-default)]">
                        <label className="block text-sm font-medium mb-2 text-[#c9b58c]">Qual Trilha?</label>
                        <select
                            className="visitor-input"
                            onChange={e => setConditions({ ...conditions, trail_id: e.target.value })}
                        >
                            <option value="">Qualquer Trilha</option>
                            {trails.map(trail => (
                                <option key={trail.id} value={trail.id}>{trail.title}</option>
                            ))}
                        </select>
                    </div>
                )}

                {triggerType === 'XP_THRESHOLD' && (
                    <div className="p-4 bg-black/20 rounded-xl border border-[var(--border-default)]">
                        <label className="block text-sm font-medium mb-2 text-[#c9b58c]">{t("admin.certificaterule.mnimoDeXp", `Mínimo de XP`)}</label>
                        <input
                            type="number"
                            className="visitor-input"
                            onChange={e => setConditions({ ...conditions, min_xp: Number(e.target.value) })}
                            placeholder="Ex: 1000"
                        />
                    </div>
                )}

                <div className="visitor-input-group">
                    <label>Modelo de Certificado</label>
                    <select
                        className="visitor-input"
                        value={templateId}
                        onChange={e => setTemplateId(e.target.value)}
                    >
                        <option value="">Selecione um modelo...</option>
                        {templates.map(item => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                    </select>
                </div>

                <div className="pt-4">
                    <Button onClick={handleSave} disabled={!name || !templateId}>{t("admin.certificaterule.salvarRegraAutomtica", `Salvar Regra Automática`)}</Button>
                </div>
            </div>
        </div>
    );
};
