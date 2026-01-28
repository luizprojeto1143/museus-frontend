import React from 'react';
import { useCertificate } from '../context/CertificateContext';
import {
    Type, QrCode, Image as ImageIcon, LayoutTemplate, ZoomIn, ZoomOut,
    Sparkles, User, Calendar, Clock, Hash
} from 'lucide-react';

export const Toolbar: React.FC = () => {
    const {
        addElement, backgroundUrl, setBackgroundUrl,
        zoom, setZoom
    } = useCertificate();

    const bgInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setBackgroundUrl(url);
        }
    };

    const variables = [
        { label: 'Nome do Visitante', val: '{{nome_visitante}}', icon: User },
        { label: 'Título do Evento', val: '{{nome_evento}}', icon: Sparkles },
        { label: 'Data', val: '{{data_conclusao}}', icon: Calendar },
        { label: 'Carga Horária', val: '{{carga_cultural}}', icon: Clock },
        { label: 'Código Validação', val: '{{code}}', icon: Hash }
    ];

    const styles = {
        aside: {
            width: '280px',
            background: 'linear-gradient(180deg, #1a1108 0%, #0f0a04 100%)',
            borderRight: '1px solid rgba(61,46,26,0.5)',
            display: 'flex',
            flexDirection: 'column' as const,
            height: '100%',
            flexShrink: 0,
        },
        header: {
            padding: '20px',
            borderBottom: '1px solid rgba(61,46,26,0.5)',
            background: 'linear-gradient(90deg, rgba(212,175,55,0.1) 0%, transparent 100%)',
        },
        title: {
            fontSize: '12px',
            fontWeight: 700,
            color: '#d4af37',
            textTransform: 'uppercase' as const,
            letterSpacing: '2px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        subtitle: {
            fontSize: '10px',
            color: '#a89060',
            marginTop: '6px',
            opacity: 0.7,
        },
        content: {
            flex: 1,
            overflowY: 'auto' as const,
            padding: '20px',
        },
        section: {
            marginBottom: '28px',
        },
        sectionTitle: {
            fontSize: '11px',
            fontWeight: 700,
            color: '#a89060',
            textTransform: 'uppercase' as const,
            letterSpacing: '1px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        sectionLine: {
            width: '32px',
            height: '1px',
            background: 'linear-gradient(90deg, rgba(212,175,55,0.5) 0%, transparent 100%)',
        },
        elementsGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
        },
        elementBtn: {
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 12px',
            borderRadius: '12px',
            border: '1px solid #3d2e1a',
            background: 'linear-gradient(180deg, #1f1610 0%, #151009 100%)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
        },
        elementIcon: {
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.05) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
        },
        elementLabel: {
            fontSize: '12px',
            fontWeight: 600,
            color: '#e8dcc8',
        },
        elementSub: {
            fontSize: '9px',
            color: '#8a7a5a',
            marginTop: '4px',
        },
        variableBtn: {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid rgba(61,46,26,0.6)',
            background: 'rgba(26,17,8,0.5)',
            cursor: 'pointer',
            marginBottom: '8px',
            transition: 'all 0.2s ease',
            textAlign: 'left' as const,
        },
        variableIcon: {
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(212,175,55,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
        },
        variableLabel: {
            fontSize: '12px',
            color: '#e8dcc8',
            fontWeight: 500,
        },
        variableCode: {
            fontSize: '9px',
            color: '#6a5a3a',
            fontFamily: 'monospace',
            marginTop: '2px',
        },
        bgUpload: {
            aspectRatio: '16/9',
            background: 'linear-gradient(135deg, #1f1610 0%, #0f0a04 100%)',
            borderRadius: '12px',
            border: '2px dashed #3d2e1a',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative' as const,
        },
        bgIcon: {
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            border: '2px dashed currentColor',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            color: '#6a5a3a',
        },
        bgText: {
            fontSize: '11px',
            fontWeight: 500,
            color: '#6a5a3a',
        },
        bgSubtext: {
            fontSize: '9px',
            color: '#6a5a3a',
            opacity: 0.6,
            marginTop: '4px',
        },
        footer: {
            padding: '16px',
            borderTop: '1px solid rgba(61,46,26,0.5)',
            background: 'rgba(15,10,4,0.8)',
        },
        zoomContainer: {
            display: 'flex',
            alignItems: 'center',
            background: '#1a1108',
            borderRadius: '10px',
            padding: '8px',
            border: '1px solid rgba(61,46,26,0.5)',
        },
        zoomBtn: {
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            color: '#8a7a5a',
            cursor: 'pointer',
        },
        zoomTrack: {
            flex: 1,
            margin: '0 12px',
            height: '6px',
            background: '#2a1f14',
            borderRadius: '3px',
            overflow: 'hidden',
        },
        zoomFill: {
            height: '100%',
            background: 'linear-gradient(90deg, #d4af37 0%, #f0d878 100%)',
            borderRadius: '3px',
            transition: 'width 0.2s ease',
        },
        zoomLabel: {
            fontSize: '12px',
            fontFamily: 'monospace',
            fontWeight: 700,
            color: '#d4af37',
            width: '48px',
            textAlign: 'center' as const,
        },
    };

    return (
        <aside style={styles.aside}>
            <div style={styles.header}>
                <h2 style={styles.title}>
                    <LayoutTemplate size={18} style={{ opacity: 0.8 }} />
                    Ferramentas
                </h2>
                <p style={styles.subtitle}>Arraste elementos para o canvas</p>
            </div>

            <div style={styles.content}>
                {/* Elements */}
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>
                        <div style={styles.sectionLine} />
                        Elementos
                    </h3>
                    <div style={styles.elementsGrid}>
                        <button
                            onClick={() => addElement('text')}
                            style={styles.elementBtn}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(212,175,55,0.6)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#3d2e1a';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={styles.elementIcon}>
                                <Type size={22} color="#d4af37" />
                            </div>
                            <span style={styles.elementLabel}>Texto</span>
                            <span style={styles.elementSub}>Adicionar texto</span>
                        </button>

                        <button
                            onClick={() => addElement('qrcode')}
                            style={styles.elementBtn}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(212,175,55,0.6)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#3d2e1a';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={styles.elementIcon}>
                                <QrCode size={22} color="#d4af37" />
                            </div>
                            <span style={styles.elementLabel}>QR Code</span>
                            <span style={styles.elementSub}>Validação</span>
                        </button>
                    </div>
                </div>

                {/* Variables */}
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>
                        <div style={styles.sectionLine} />
                        Variáveis Dinâmicas
                    </h3>
                    <div>
                        {variables.map(v => (
                            <button
                                key={v.val}
                                onClick={() => addElement('variable', v.val)}
                                style={styles.variableBtn}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(212,175,55,0.1)';
                                    e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(26,17,8,0.5)';
                                    e.currentTarget.style.borderColor = 'rgba(61,46,26,0.6)';
                                }}
                            >
                                <div style={styles.variableIcon}>
                                    <v.icon size={14} color="#d4af37" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={styles.variableLabel}>{v.label}</div>
                                    <div style={styles.variableCode}>{v.val}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Background */}
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>
                        <div style={styles.sectionLine} />
                        Imagem de Fundo
                    </h3>
                    <div
                        style={styles.bgUpload}
                        onClick={() => bgInputRef.current?.click()}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#3d2e1a';
                        }}
                    >
                        {backgroundUrl ? (
                            <img src={backgroundUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="bg" />
                        ) : (
                            <>
                                <div style={styles.bgIcon}>
                                    <ImageIcon size={24} />
                                </div>
                                <span style={styles.bgText}>Clique para adicionar</span>
                                <span style={styles.bgSubtext}>PNG, JPG até 5MB</span>
                            </>
                        )}
                    </div>
                    <input ref={bgInputRef} type="file" id="bg-upload-new" style={{ display: 'none' }} accept="image/*" onChange={handleFileUpload} />
                </div>
            </div>

            {/* Zoom Footer */}
            <div style={styles.footer}>
                <div style={styles.zoomContainer}>
                    <button
                        onClick={() => setZoom((z: number) => Math.max(0.2, z - 0.1))}
                        style={styles.zoomBtn}
                    >
                        <ZoomOut size={16} />
                    </button>
                    <div style={styles.zoomTrack}>
                        <div style={{ ...styles.zoomFill, width: `${Math.min(100, (zoom - 0.2) / 2.8 * 100)}%` }} />
                    </div>
                    <span style={styles.zoomLabel}>{Math.round(zoom * 100)}%</span>
                    <button
                        onClick={() => setZoom((z: number) => Math.min(3, z + 0.1))}
                        style={styles.zoomBtn}
                    >
                        <ZoomIn size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
};
