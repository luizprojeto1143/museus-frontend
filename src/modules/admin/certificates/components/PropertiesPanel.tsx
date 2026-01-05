import React from 'react';
import { useCertificate } from '../context/CertificateContext';
import {
    Trash, Copy, ArrowUp, ArrowDown, Type, AlignLeft, AlignCenter, AlignRight,
    Settings, Move, RotateCw, Maximize2, Palette
} from 'lucide-react';

export const PropertiesPanel: React.FC = () => {
    const {
        selectedIds, elements, updateElement, deleteSelected, duplicateSelected,
        bringToFront, sendToBack
    } = useCertificate();

    const styles = {
        aside: {
            width: '280px',
            background: 'linear-gradient(180deg, #1a1108 0%, #0f0a04 100%)',
            borderLeft: '1px solid rgba(61,46,26,0.5)',
            display: 'flex',
            flexDirection: 'column' as const,
            height: '100%',
            flexShrink: 0,
        },
        emptyState: {
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#6a5a3a',
            textAlign: 'center' as const,
            padding: '32px',
        },
        emptyIcon: {
            width: '80px',
            height: '80px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, transparent 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
        },
        header: {
            padding: '20px',
            borderBottom: '1px solid rgba(61,46,26,0.5)',
            background: 'linear-gradient(90deg, rgba(212,175,55,0.1) 0%, transparent 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
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
        badge: {
            fontSize: '10px',
            background: 'rgba(212,175,55,0.2)',
            color: '#d4af37',
            padding: '4px 12px',
            borderRadius: '20px',
            fontWeight: 600,
            textTransform: 'uppercase' as const,
        },
        content: {
            flex: 1,
            overflowY: 'auto' as const,
            padding: '20px',
        },
        actionsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '4px',
            background: '#1f1610',
            borderRadius: '12px',
            border: '1px solid rgba(61,46,26,0.5)',
            padding: '8px',
            marginBottom: '24px',
        },
        actionBtn: {
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            gap: '6px',
            padding: '12px 4px',
            borderRadius: '8px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#8a7a5a',
            transition: 'all 0.2s ease',
        },
        actionLabel: {
            fontSize: '9px',
            fontWeight: 500,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px',
        },
        sectionTitle: {
            fontSize: '11px',
            fontWeight: 700,
            color: '#a89060',
            textTransform: 'uppercase' as const,
            letterSpacing: '1px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        sectionLine: {
            width: '24px',
            height: '1px',
            background: 'linear-gradient(90deg, rgba(212,175,55,0.5) 0%, transparent 100%)',
        },
        textarea: {
            width: '100%',
            background: '#1f1610',
            border: '1px solid #3d2e1a',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '13px',
            color: '#e8dcc8',
            resize: 'none' as const,
            outline: 'none',
            fontFamily: 'inherit',
        },
        inputRow: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '12px',
        },
        select: {
            background: '#1f1610',
            border: '1px solid #3d2e1a',
            borderRadius: '10px',
            padding: '10px 12px',
            fontSize: '12px',
            color: '#e8dcc8',
            outline: 'none',
            width: '100%',
        },
        inputWrapper: {
            position: 'relative' as const,
        },
        input: {
            width: '100%',
            background: '#1f1610',
            border: '1px solid #3d2e1a',
            borderRadius: '10px',
            padding: '10px 12px 10px 36px',
            fontSize: '12px',
            color: '#e8dcc8',
            outline: 'none',
        },
        inputIcon: {
            position: 'absolute' as const,
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#6a5a3a',
        },
        colorRow: {
            display: 'flex',
            gap: '12px',
        },
        colorWrapper: {
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#1f1610',
            border: '1px solid #3d2e1a',
            borderRadius: '10px',
            padding: '8px 12px',
        },
        colorInput: {
            width: '100%',
            height: '24px',
            borderRadius: '4px',
            cursor: 'pointer',
            background: 'transparent',
            border: 'none',
        },
        alignGroup: {
            display: 'flex',
            background: '#1f1610',
            borderRadius: '10px',
            border: '1px solid #3d2e1a',
            padding: '4px',
        },
        alignBtn: {
            padding: '8px',
            borderRadius: '6px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#6a5a3a',
            transition: 'all 0.2s ease',
        },
        alignBtnActive: {
            background: 'linear-gradient(135deg, #d4af37 0%, #c4a030 100%)',
            color: '#1a1108',
        },
        transformGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginTop: '24px',
        },
        transformItem: {
            background: '#1f1610',
            border: '1px solid rgba(61,46,26,0.5)',
            borderRadius: '10px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        transformLabel: {
            fontSize: '10px',
            color: '#6a5a3a',
            fontWeight: 700,
            width: '16px',
        },
        transformValue: {
            flex: 1,
            textAlign: 'right' as const,
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#d4af37',
        },
    };

    if (selectedIds.length === 0) {
        return (
            <aside style={styles.aside}>
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>
                        <Settings size={36} color="rgba(212,175,55,0.4)" />
                    </div>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#a89060', marginBottom: '12px' }}>
                        Nenhum elemento selecionado
                    </h3>
                    <p style={{ fontSize: '11px', lineHeight: 1.5, opacity: 0.7 }}>
                        Clique em um elemento no canvas para editar suas propriedades
                    </p>
                </div>
            </aside>
        );
    }

    const isMulti = selectedIds.length > 1;
    const firstId = selectedIds[0];
    const selectedElement = elements.find(el => el.id === firstId);

    if (!selectedElement && !isMulti) return null;

    const handleUpdate = (updates: any) => {
        selectedIds.forEach(id => updateElement(id, updates));
    };

    return (
        <aside style={styles.aside}>
            <div style={styles.header}>
                <h2 style={styles.title}>
                    <Settings size={18} style={{ opacity: 0.8 }} />
                    Propriedades
                </h2>
                <span style={styles.badge}>
                    {isMulti ? `${selectedIds.length} itens` : selectedElement?.type}
                </span>
            </div>

            <div style={styles.content}>
                {/* Actions */}
                <div style={styles.actionsGrid}>
                    <button
                        onClick={duplicateSelected}
                        style={styles.actionBtn}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; e.currentTarget.style.color = '#d4af37'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8a7a5a'; }}
                    >
                        <Copy size={18} />
                        <span style={styles.actionLabel}>Copiar</span>
                    </button>
                    <button
                        onClick={bringToFront}
                        style={styles.actionBtn}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; e.currentTarget.style.color = '#d4af37'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8a7a5a'; }}
                    >
                        <ArrowUp size={18} />
                        <span style={styles.actionLabel}>Frente</span>
                    </button>
                    <button
                        onClick={sendToBack}
                        style={styles.actionBtn}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; e.currentTarget.style.color = '#d4af37'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8a7a5a'; }}
                    >
                        <ArrowDown size={18} />
                        <span style={styles.actionLabel}>Trás</span>
                    </button>
                    <button
                        onClick={deleteSelected}
                        style={{ ...styles.actionBtn, color: '#ef4444' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                        <Trash size={18} />
                        <span style={styles.actionLabel}>Excluir</span>
                    </button>
                </div>

                {/* Text Properties */}
                {!isMulti && (selectedElement?.type === 'text' || selectedElement?.type === 'variable') && (
                    <div>
                        <div style={{ marginBottom: '20px' }}>
                            <div style={styles.sectionTitle}>
                                <div style={styles.sectionLine} />
                                Conteúdo
                            </div>
                            <textarea
                                value={selectedElement.text}
                                onChange={e => handleUpdate({ text: e.target.value })}
                                rows={3}
                                style={styles.textarea}
                                placeholder="Digite o texto..."
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={styles.sectionTitle}>
                                <div style={styles.sectionLine} />
                                Tipografia
                            </div>
                            <div style={styles.inputRow}>
                                <select
                                    value={selectedElement.fontFamily}
                                    onChange={e => handleUpdate({ fontFamily: e.target.value })}
                                    style={styles.select}
                                >
                                    <option value="Helvetica">Helvetica</option>
                                    <option value="Times New Roman">Times</option>
                                    <option value="Courier New">Courier</option>
                                    <option value="Georgia">Georgia</option>
                                </select>
                                <div style={styles.inputWrapper}>
                                    <Type size={14} style={styles.inputIcon} />
                                    <input
                                        type="number"
                                        value={selectedElement.fontSize}
                                        onChange={e => handleUpdate({ fontSize: Number(e.target.value) })}
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <div style={styles.colorRow}>
                                <div style={styles.colorWrapper}>
                                    <Palette size={14} color="#6a5a3a" />
                                    <input
                                        type="color"
                                        value={selectedElement.color}
                                        onChange={e => handleUpdate({ color: e.target.value })}
                                        style={styles.colorInput}
                                    />
                                </div>
                                <div style={styles.alignGroup}>
                                    {[
                                        { v: 'left', i: AlignLeft },
                                        { v: 'center', i: AlignCenter },
                                        { v: 'right', i: AlignRight }
                                    ].map(o => (
                                        <button
                                            key={o.v}
                                            onClick={() => handleUpdate({ align: o.v })}
                                            style={selectedElement.align === o.v
                                                ? { ...styles.alignBtn, ...styles.alignBtnActive }
                                                : styles.alignBtn
                                            }
                                        >
                                            <o.i size={16} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Transformation */}
                {!isMulti && selectedElement && (
                    <div>
                        <div style={styles.sectionTitle}>
                            <div style={styles.sectionLine} />
                            Transformação
                        </div>
                        <div style={styles.transformGrid}>
                            <div style={styles.transformItem}>
                                <span style={styles.transformLabel}>X</span>
                                <span style={styles.transformValue}>{Math.round(selectedElement.x || 0)}</span>
                            </div>
                            <div style={styles.transformItem}>
                                <span style={styles.transformLabel}>Y</span>
                                <span style={styles.transformValue}>{Math.round(selectedElement.y || 0)}</span>
                            </div>
                            <div style={styles.transformItem}>
                                <span style={styles.transformLabel}>W</span>
                                <span style={styles.transformValue}>{Math.round(selectedElement.width || 0)}</span>
                            </div>
                            <div style={styles.transformItem}>
                                <span style={styles.transformLabel}>H</span>
                                <span style={styles.transformValue}>{Math.round(selectedElement.height || 0)}</span>
                            </div>
                            <div style={{ ...styles.transformItem, gridColumn: '1 / -1' }}>
                                <RotateCw size={14} color="#6a5a3a" />
                                <span style={{ ...styles.transformLabel, width: 'auto' }}>Rotação</span>
                                <span style={styles.transformValue}>{Math.round(selectedElement.rotate || 0)}°</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};
