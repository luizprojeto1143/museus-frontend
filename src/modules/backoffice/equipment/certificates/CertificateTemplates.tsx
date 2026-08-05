import React, { useEffect, useState, useCallback } from 'react';
import { logger } from "@/utils/logger";

import { useNavigate } from 'react-router-dom';
import { api } from '../../../../api/client';
import { Plus, Edit, Trash, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CertificateTemplate {
    id: string;
    name: string;
    backgroundUrl?: string;
    elements?: Array<Record<string, unknown>>;
}

type TemplateListResponse = CertificateTemplate[] | { data?: CertificateTemplate[] };

export const CertificateTemplates: React.FC = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
    const [templateToDelete, setTemplateToDelete] = useState<CertificateTemplate | null>(null);

    const loadTemplates = useCallback(async () => {
        try {
            const res = await api.get<TemplateListResponse>('/certificate-templates');
            setTemplates(Array.isArray(res.data) ? res.data : res.data.data || []);
        } catch (err) {
            logger.error(err);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => loadTemplates(), 0);
        return () => clearTimeout(timer);
    }, [loadTemplates]);

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/certificate-templates/${id}`);
            setTemplateToDelete(null);
            loadTemplates(); // Reload
        } catch {
            toast.error('Erro ao excluir');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="section-title text-2xl">Modelos de Certificado</h1>
                <div className="space-x-2">
                    <button className="inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors cursor-pointer border bg-[var(--glass-bg-light)] text-[var(--fg-main)] border-[var(--border-default)] backdrop-blur-sm text-[13px] px-5 py-2.5 rounded-[var(--radius-md)]" onClick={() => navigate('/admin/certificates/rules')}>
                        🤖 Regras e Automação
                    </button>
                    <button className="inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors cursor-pointer border bg-[var(--accent-primary)] text-[var(--fg-inverse)] border-transparent shadow-[var(--shadow-glow)] text-[13px] px-5 py-2.5 rounded-[var(--radius-md)]" onClick={() => navigate('/admin/certificates/new')}>
                        <Plus size={20} className="mr-2" /> Novo Modelo
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {templates.map(template => (
                    <div key={template.id} className="card hover:border-[var(--accent-gold)] transition-colors group">
                        <div
                            className="h-40 bg-[var(--bg-elevated-soft)] rounded mb-4 bg-cover bg-center border border-[var(--border-subtle)]"
                            style={{ backgroundImage: template.backgroundUrl ? `url(${template.backgroundUrl})` : 'none' }}
                        >
                            {!template.backgroundUrl && (
                                <div className="h-full flex items-center justify-center text-[var(--fg-muted)] opacity-50">
                                    <FileText size={48} />
                                </div>
                            )}
                        </div>
                        <h3 className="card-title text-lg">{template.name}</h3>
                        <p className="text-sm text-[var(--fg-muted)] mb-4">{template.elements?.length || 0} elementos</p>
 
                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate(`/admin/certificates/edit/${template.id}`)}
                                className="flex-1 btn btn-secondary py-2 justify-center hover:bg-[var(--accent-gold)] hover:text-[var(--bg-page)]"
                            >
                                <Edit size={16} className="mr-2" /> Editar
                            </button>
                            <button
                                onClick={() => setTemplateToDelete(template)}
                                className="p-2 btn btn-secondary text-red-500 hover:bg-red-500/20 border-red-500/30"
                            >
                                <Trash size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {templates.length === 0 && (
                    <div className="col-span-3 text-center py-20 bg-[var(--bg-elevated)] rounded-lg border-2 border-dashed border-[var(--border-subtle)]">
                        <h3 className="text-xl text-[var(--fg-muted)] font-serif mb-4">Nenhum modelo criado ainda</h3>
                        <button onClick={() => navigate('/admin/certificates/new')} className="inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors cursor-pointer border bg-[var(--accent-primary)] text-[var(--fg-inverse)] border-transparent shadow-[var(--shadow-glow)] text-[13px] px-5 py-2.5 rounded-[var(--radius-md)]">
                            Criar Primeiro Modelo
                        </button>
                    </div>
                )}
            </div>

            {templateToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
                    <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[var(--bg-surface)] p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-3">Excluir modelo</h2>
                        <p className="text-sm opacity-80 mb-6">Deseja excluir este modelo? {templateToDelete.name}</p>
                        <div className="flex justify-end gap-3">
                            <button type="button" className="btn btn-secondary" onClick={() => setTemplateToDelete(null)}>
                                Cancelar
                            </button>
                            <button type="button" className="btn btn-primary bg-red-600" onClick={() => void handleDelete(templateToDelete.id)}>
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
