import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
import { api } from '../../../api/client';
import { Save, ArrowLeft, RotateCcw, RotateCw, Loader2, FileText } from 'lucide-react';

import { CertificateProvider, useCertificate } from './context/CertificateContext';
import { CertificateCanvas } from './components/CertificateCanvas';
import { Toolbar } from './components/Toolbar';
import { PropertiesPanel } from './components/PropertiesPanel';

const CertificateEditorContent: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    // const { t } = useTranslation();
    const [saving, setSaving] = useState(false);

    const {
        name, setName, elements, backgroundUrl,
        undo, redo, canUndo, canRedo,
        loadTemplate
    } = useCertificate();

    useEffect(() => {
        if (id) {
            const fetchTemplate = async () => {
                try {
                    const res = await api.get('/certificate-templates');
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column' as const,
            height: 'calc(100vh - 70px)',
            margin: '-32px',
            overflow: 'hidden',
            background: '#0a0705',
        },
        header: {
            height: '64px',
            borderBottom: '1px solid rgba(61,46,26,0.5)',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            background: 'linear-gradient(to right, rgba(26,17,8,0.95), rgba(15,10,4,0.98))',
            backdropFilter: 'blur(12px)',
            zIndex: 100,
        },
        headerLeft: {
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
        },
        backBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#a89060',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
        },
        divider: {
            height: '32px',
            width: '1px',
            background: 'linear-gradient(to bottom, transparent, #3d2e1a, transparent)',
        },
        titleWrapper: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
        },
        titleIcon: {
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.05) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        titleInput: {
            background: 'transparent',
            border: 'none',
            fontSize: '18px',
            fontWeight: 600,
            color: '#e8dcc8',
            outline: 'none',
            width: '250px',
            padding: '4px 8px',
            borderRadius: '6px',
        },
        headerRight: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
        },
        undoRedoGroup: {
            display: 'flex',
            alignItems: 'center',
            background: '#1a1108',
            borderRadius: '10px',
            border: '1px solid rgba(61,46,26,0.5)',
            padding: '4px',
        },
        undoRedoBtn: {
            width: '36px',
            height: '36px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            color: '#8a7a5a',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
        },
        undoRedoDivider: {
            width: '1px',
            height: '20px',
            background: 'rgba(61,46,26,0.5)',
            margin: '0 2px',
        },
        saveBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 20px',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
        },
        // CRITICAL: The workspace layout
        workspace: {
            flex: 1,
            display: 'flex',
            flexDirection: 'row' as const,
            overflow: 'hidden',
            position: 'relative' as const,
        },
    };

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <button
                        onClick={() => navigate('/admin/certificates')}
                        style={styles.backBtn}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#d4af37'; e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#a89060'; e.currentTarget.style.background = 'transparent'; }}
                    >
                        <ArrowLeft size={16} />
                        <span>Voltar</span>
                    </button>

                    <div style={styles.divider} />

                    <div style={styles.titleWrapper}>
                        <div style={styles.titleIcon}>
                            <FileText size={18} color="#d4af37" />
                        </div>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            style={styles.titleInput}
                            placeholder="Nome do Modelo"
                        />
                    </div>
                </div>

                <div style={styles.headerRight}>
                    <div style={styles.undoRedoGroup}>
                        <button
                            onClick={undo}
                            disabled={!canUndo}
                            style={{ ...styles.undoRedoBtn, opacity: canUndo ? 1 : 0.3 }}
                            title="Desfazer (Ctrl+Z)"
                        >
                            <RotateCcw size={16} />
                        </button>
                        <div style={styles.undoRedoDivider} />
                        <button
                            onClick={redo}
                            disabled={!canRedo}
                            style={{ ...styles.undoRedoBtn, opacity: canRedo ? 1 : 0.3 }}
                            title="Refazer (Ctrl+Y)"
                        >
                            <RotateCw size={16} />
                        </button>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            ...styles.saveBtn,
                            background: saving ? '#3d2e1a' : 'linear-gradient(135deg, #d4af37 0%, #c4a030 50%, #b8942a 100%)',
                            color: saving ? '#8a7a5a' : '#1a1108',
                            boxShadow: saving ? 'none' : '0 4px 20px -4px rgba(212,175,55,0.4)',
                        }}
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {saving ? 'Salvando...' : 'Salvar Modelo'}
                    </button>
                </div>
            </header>

            {/* WORKSPACE: 3 columns side by side */}
            <div style={styles.workspace}>
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
