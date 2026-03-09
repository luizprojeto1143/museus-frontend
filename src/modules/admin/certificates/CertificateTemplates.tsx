import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../api/client';
import { Plus, Edit, Trash, FileText } from 'lucide-react';

interface CertificateTemplate {
    id: string;
    name: string;
    backgroundUrl?: string;
    elements?: unknown[];
}

export const CertificateTemplates: React.FC = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<CertificateTemplate[]>([]);

    const loadTemplates = useCallback(async () => {
        try {
            const res = await api.get('/certificate-templates');
            setTemplates(res.data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => loadTemplates(), 0);
        return () => clearTimeout(timer);
    }, [loadTemplates]);

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja excluir este modelo?')) return;
        try {
            await api.delete(`/certificate-templates/${id}`);
            loadTemplates(); // Reload
        } catch {
            alert('Erro ao excluir');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="section-title text-2xl">Modelos de Certificado</h1>
                <div className="space-x-2">
                    <button className="btn btn-secondary" onClick={() => navigate('/admin/certificates/rules')}>
                        🤖 Regras e Automação
                    </button>
                    <button className="btn btn-primary" onClick={() => navigate('/admin/certificates/new')}>
                        <Plus size={20} className="mr-2" /> Novo Modelo
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {templates.map(t => (
                    <div key={t.id} className="card hover:border-[var(--accent-gold)] transition-colors group">
                        <div
                            className="h-40 bg-[var(--bg-elevated-soft)] rounded mb-4 bg-cover bg-center border border-[var(--border-subtle)]"
                            style={{ backgroundImage: t.backgroundUrl ? `url(${t.backgroundUrl})` : 'none' }}
                        >
                            {!t.backgroundUrl && (
                                <div className="h-full flex items-center justify-center text-[var(--fg-muted)] opacity-50">
                                    <FileText size={48} />
                                </div>
                            )}
                        </div>
                        <h3 className="card-title text-lg">{t.name}</h3>
                        <p className="text-sm text-[var(--fg-muted)] mb-4">{t.elements?.length || 0} elementos</p>

                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate(`/admin/certificates/edit/${t.id}`)}
                                className="flex-1 btn btn-secondary py-2 justify-center hover:bg-[var(--accent-gold)] hover:text-[var(--bg-page)]"
                            >
                                <Edit size={16} className="mr-2" /> Editar
                            </button>
                            <button
                                onClick={() => handleDelete(t.id)}
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
                        <button onClick={() => navigate('/admin/certificates/new')} className="btn btn-primary">
                            Criar Primeiro Modelo
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
