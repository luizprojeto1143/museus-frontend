import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../../api/client';
import { Save, ArrowLeft, RotateCcw, RotateCw, Loader2, Download } from 'lucide-react';

// New Architecture Imports
import { CertificateProvider, useCertificate } from './context/CertificateContext';
import { CertificateCanvas } from './components/CertificateCanvas';
import { Toolbar } from './components/Toolbar';
import { PropertiesPanel } from './components/PropertiesPanel';

const CertificateEditorContent: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [saving, setSaving] = useState(false);

    const {
        name, setName, elements, backgroundUrl,
        undo, redo, canUndo, canRedo,
        loadTemplate
    } = useCertificate();

    // Load Logic
    useEffect(() => {
        if (id) {
            const fetchTemplate = async () => {
                try {
                    const res = await api.get('/certificate-templates');
                    const found = res.data.find((t: any) => t.id === id);
                    if (found) {
                        loadTemplate({
                            id: found.id,
                            name: found.name,
                            backgroundUrl: found.backgroundUrl,
                            elements: found.elements,
                            dimensions: found.dimensions || { width: 842, height: 595 }
                        });
                    }
                } catch (err) {
                    console.error("Failed to load template", err);
                }
            };
            fetchTemplate();
        }
    }, [id, loadTemplate]);

    // Save Logic
    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                name,
                backgroundUrl,
                elements,
                dimensions: { width: 842, height: 595 }
            };

            if (id) {
                await api.put(`/certificate-templates/${id}`, payload);
            } else {
                await api.post('/certificate-templates', payload);
            }
            navigate('/admin/certificates');
        } catch (err) {
            console.error(err);
            alert('Erro ao salvar modelo');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-70px)] -m-8 bg-[var(--bg-page)] overflow-hidden">
            {/* HEADER */}
            <header className="h-16 border-b border-[var(--border-subtle)] px-6 flex items-center justify-between z-10 shrink-0 bg-[var(--bg-elevated)]/80 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/certificates')}
                        className="btn btn-secondary py-1 px-3 text-xs flex items-center gap-2"
                    >
                        <ArrowLeft size={14} /> Voltar
                    </button>
                    <div className="h-6 w-px bg-[var(--border-subtle)]" />
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="input bg-transparent border-transparent hover:border-[var(--border-strong)] focus:border-[var(--accent-gold)] text-lg font-semibold px-2 py-1 w-64 text-[var(--fg-main)] placeholder-[var(--fg-soft)]"
                        placeholder="Nome do Modelo"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {/* Undo/Redo */}
                    <div className="flex items-center bg-[var(--bg-elevated-soft)] rounded border border-[var(--border-subtle)] mr-2">
                        <button onClick={undo} disabled={!canUndo} className="p-2 hover:bg-[var(--bg-elevated)] disabled:opacity-30 transition-colors text-[var(--fg-muted)]">
                            <RotateCcw size={16} />
                        </button>
                        <div className="w-px h-4 bg-[var(--border-subtle)]" />
                        <button onClick={redo} disabled={!canRedo} className="p-2 hover:bg-[var(--bg-elevated)] disabled:opacity-30 transition-colors text-[var(--fg-muted)]">
                            <RotateCw size={16} />
                        </button>
                    </div>

                    <button onClick={handleSave} disabled={saving} className="btn btn-primary gap-2 min-w-[140px]">
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {saving ? 'Salvando...' : 'Salvar Modelo'}
                    </button>
                </div>
            </header>

            {/* EDITOR WORKSPACE */}
            <div className="flex-1 flex flex-row overflow-hidden relative">
                <Toolbar />
                <CertificateCanvas />
                <PropertiesPanel />
            </div>
        </div>
    );
};

export const CertificateEditor: React.FC = () => {
    return (
        <CertificateProvider>
            <CertificateEditorContent />
        </CertificateProvider>
    );
};
