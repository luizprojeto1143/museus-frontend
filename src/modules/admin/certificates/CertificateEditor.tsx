import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../../api/client';
import { Save, ArrowLeft, RotateCcw, RotateCw, Loader2, FileText } from 'lucide-react';

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
        <div className="flex flex-col h-[calc(100vh-70px)] -m-8 overflow-hidden" style={{ background: '#0a0705' }}>
            {/* HEADER */}
            <header className="h-16 border-b border-[#3d2e1a]/50 px-6 flex items-center justify-between z-30 shrink-0 backdrop-blur-xl"
                style={{ background: 'linear-gradient(to right, rgba(26,17,8,0.95), rgba(15,10,4,0.98))' }}>
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => navigate('/admin/certificates')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-[#a89060] hover:text-[#d4af37] hover:bg-[#d4af37]/10 transition-all duration-200"
                    >
                        <ArrowLeft size={16} />
                        <span>Voltar</span>
                    </button>

                    <div className="h-8 w-px bg-gradient-to-b from-transparent via-[#3d2e1a] to-transparent" />

                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 flex items-center justify-center">
                            <FileText size={18} className="text-[#d4af37]" />
                        </div>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="bg-transparent border-0 text-lg font-semibold text-[#e8dcc8] placeholder-[#6a5a3a] outline-none focus:ring-0 w-64 hover:bg-[#d4af37]/5 px-2 py-1 rounded-lg transition-colors"
                            placeholder="Nome do Modelo"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Undo/Redo */}
                    <div className="flex items-center bg-[#1a1108] rounded-lg border border-[#3d2e1a]/50 p-1">
                        <button
                            onClick={undo}
                            disabled={!canUndo}
                            className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-[#d4af37]/10 disabled:opacity-20 transition-all text-[#8a7a5a] hover:text-[#d4af37] disabled:hover:bg-transparent"
                            title="Desfazer (Ctrl+Z)"
                        >
                            <RotateCcw size={16} />
                        </button>
                        <div className="w-px h-5 bg-[#3d2e1a]/50 mx-0.5" />
                        <button
                            onClick={redo}
                            disabled={!canRedo}
                            className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-[#d4af37]/10 disabled:opacity-20 transition-all text-[#8a7a5a] hover:text-[#d4af37] disabled:hover:bg-transparent"
                            title="Refazer (Ctrl+Y)"
                        >
                            <RotateCw size={16} />
                        </button>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2.5 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 disabled:opacity-50"
                        style={{
                            background: saving ? '#3d2e1a' : 'linear-gradient(135deg, #d4af37 0%, #c4a030 50%, #b8942a 100%)',
                            color: saving ? '#8a7a5a' : '#1a1108',
                            boxShadow: saving ? 'none' : '0 4px 20px -4px rgba(212,175,55,0.4)'
                        }}
                    >
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
