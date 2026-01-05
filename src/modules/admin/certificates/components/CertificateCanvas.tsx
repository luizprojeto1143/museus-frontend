import React, { useRef, useEffect, useState } from 'react';
import Moveable from 'react-moveable';
import Selecto from 'react-selecto';
import { useCertificate } from '../context/CertificateContext';
import { CertificateElement } from '../types';
import { QrCode } from 'lucide-react';

interface ElementRendererProps {
    element: CertificateElement;
    onSelect: (id: string) => void;
}

const ElementRenderer: React.FC<ElementRendererProps> = ({ element, onSelect }) => {
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent container click from clearing selection
        onSelect(element.id);
    };

    return (
        <div
            className="certificate-element"
            style={{
                position: 'absolute',
                left: 0,
                top: 0,
                transform: `translate(${element.x}px, ${element.y}px) rotate(${element.rotate || 0}deg)`,
                width: element.width,
                height: element.height,
                fontSize: element.fontSize,
                fontFamily: element.fontFamily,
                color: element.color,
                textAlign: element.align as any,
                opacity: element.opacity ?? 1,
                whiteSpace: 'pre-wrap',
                lineHeight: 1.2,
                cursor: 'pointer',
                touchAction: 'none',
                userSelect: 'none',
                display: element.type === 'qrcode' ? 'flex' : 'block',
                flexDirection: 'column',
                alignItems: element.type === 'qrcode' ? 'center' : undefined,
                justifyContent: element.type === 'qrcode' ? 'center' : undefined,
                background: element.type === 'qrcode' ? 'linear-gradient(135deg, #1a1a1a 0%, #000 100%)' : 'transparent',
                borderRadius: element.type === 'qrcode' ? '8px' : undefined,
            }}
            data-id={element.id}
            onClick={handleClick}
        >
            {element.type === 'qrcode' ? (
                <>
                    <QrCode size={element.width ? element.width * 0.5 : 24} color="rgba(255,255,255,0.6)" />
                    <span style={{ fontSize: '10px', marginTop: '4px', opacity: 0.6, color: 'white' }}>QR Code</span>
                </>
            ) : (
                element.text
            )}
        </div>
    );
};

export const CertificateCanvas: React.FC = () => {
    const {
        elements, selectedIds, setSelectedIds, updateElement,
        backgroundUrl, zoom, saveSnapshot
    } = useCertificate();

    const containerRef = useRef<HTMLDivElement>(null);
    const moveableRef = useRef<Moveable>(null);
    const selectoRef = useRef<Selecto>(null);
    const [targets, setTargets] = useState<(HTMLElement | SVGElement)[]>([]);

    // Sync targets when selection changes
    useEffect(() => {
        const domTargets: (HTMLElement | SVGElement)[] = [];
        selectedIds.forEach(id => {
            const el = document.querySelector(`[data-id="${id}"]`);
            if (el) domTargets.push(el as HTMLElement);
        });
        setTargets(domTargets);
    }, [selectedIds, elements]);

    // Handle element selection
    const handleElementSelect = (id: string) => {
        setSelectedIds([id]);
    };

    // Handle container click (clear selection)
    const handleContainerClick = () => {
        setSelectedIds([]);
    };

    const styles = {
        wrapper: {
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative' as const,
            overflow: 'hidden',
            padding: '32px',
            background: 'radial-gradient(ellipse at center, #1f1610 0%, #0f0a04 100%)',
            minWidth: 0,
        },
        gridPattern: {
            position: 'absolute' as const,
            inset: 0,
            pointerEvents: 'none' as const,
            backgroundImage: 'radial-gradient(#d4af37 0.5px, transparent 0.5px)',
            backgroundSize: '32px 32px',
            opacity: 0.08,
        },
        ambientGlow: {
            position: 'absolute' as const,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '800px',
            height: '600px',
            borderRadius: '50%',
            pointerEvents: 'none' as const,
            background: 'radial-gradient(ellipse, rgba(212,175,55,0.05) 0%, transparent 70%)',
        },
        canvasContainer: {
            position: 'relative' as const,
        },
        canvasShadow: {
            position: 'absolute' as const,
            inset: 0,
            borderRadius: '8px',
            pointerEvents: 'none' as const,
            width: '842px',
            height: '595px',
            boxShadow: '0 25px 80px -20px rgba(0,0,0,0.6), 0 0 60px -15px rgba(212,175,55,0.15)',
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
        },
        certificate: {
            position: 'relative' as const,
            width: '842px',
            height: '595px',
            backgroundColor: '#ffffff',
            backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease-out',
            borderRadius: '4px',
            overflow: 'hidden',
            userSelect: 'none' as const,
        },
        emptyState: {
            position: 'absolute' as const,
            inset: 0,
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #e5e7eb',
            color: '#9ca3af',
            pointerEvents: 'none' as const,
        },
        emptyIcon: {
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            border: '2px dashed #d1d5db',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
        },
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.gridPattern} />
            <div style={styles.ambientGlow} />

            <div style={styles.canvasContainer}>
                <div style={styles.canvasShadow} />

                <div
                    ref={containerRef}
                    style={styles.certificate}
                    onClick={handleContainerClick}
                >
                    {!backgroundUrl && (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyIcon}>
                                <span style={{ fontSize: '36px', opacity: 0.3 }}>📜</span>
                            </div>
                            <span style={{ fontSize: '18px', fontWeight: 500, opacity: 0.4 }}>Área do Certificado</span>
                            <span style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px', opacity: 0.5 }}>842 × 595 px (A4 Paisagem)</span>
                        </div>
                    )}

                    {elements.map(el => (
                        <ElementRenderer
                            key={el.id}
                            element={el}
                            onSelect={handleElementSelect}
                        />
                    ))}
                </div>

                <Moveable
                    ref={moveableRef}
                    target={targets}
                    draggable={true}
                    resizable={true}
                    rotatable={true}
                    snappable={true}
                    snapDirections={{ top: true, left: true, bottom: true, right: true, center: true, middle: true }}
                    elementGuidelines={Array.from(document.querySelectorAll('.certificate-element'))}

                    onDragStart={() => saveSnapshot()}
                    onDrag={e => {
                        e.target.style.transform = e.transform;
                    }}
                    onDragEnd={e => {
                        if (e.isDrag) {
                            const target = e.target as HTMLElement;
                            const id = target.getAttribute('data-id');
                            if (id) {
                                const match = target.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
                                if (match) {
                                    updateElement(id, {
                                        x: parseFloat(match[1]),
                                        y: parseFloat(match[2])
                                    });
                                }
                            }
                        }
                    }}
                    onDragGroupStart={() => saveSnapshot()}
                    onDragGroup={e => {
                        e.events.forEach(ev => {
                            ev.target.style.transform = ev.transform;
                        });
                    }}
                    onDragGroupEnd={e => {
                        e.events.forEach(ev => {
                            const target = ev.target as HTMLElement;
                            const id = target.getAttribute('data-id');
                            if (id) {
                                const match = target.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
                                if (match) updateElement(id, { x: parseFloat(match[1]), y: parseFloat(match[2]) });
                            }
                        });
                    }}

                    onResizeStart={() => saveSnapshot()}
                    onResize={e => {
                        e.target.style.width = `${e.width}px`;
                        e.target.style.height = `${e.height}px`;
                        e.target.style.transform = e.drag.transform;
                    }}
                    onResizeEnd={e => {
                        const target = e.target as HTMLElement;
                        const id = target.getAttribute('data-id');
                        if (id) {
                            const match = target.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
                            const x = match ? parseFloat(match[1]) : 0;
                            const y = match ? parseFloat(match[2]) : 0;

                            updateElement(id, {
                                width: e.lastEvent?.width || parseFloat(target.style.width),
                                height: e.lastEvent?.height || parseFloat(target.style.height),
                                x, y
                            });
                        }
                    }}

                    onRotateStart={() => saveSnapshot()}
                    onRotate={e => {
                        e.target.style.transform = e.drag.transform;
                    }}
                    onRotateEnd={e => {
                        const target = e.target as HTMLElement;
                        const id = target.getAttribute('data-id');
                        if (id) {
                            const match = target.style.transform.match(/rotate\(([-\d.]+)deg\)/);
                            if (match) updateElement(id, { rotate: parseFloat(match[1]) });
                        }
                    }}
                />

                <Selecto
                    ref={selectoRef}
                    dragContainer={window}
                    selectableTargets={['.certificate-element']}
                    hitRate={0}
                    selectByClick={true}
                    selectFromInside={false}
                    toggleContinueSelect={['shift']}
                    onSelect={e => {
                        const ids = e.selected.map(el => el.getAttribute('data-id') || '').filter(Boolean);
                        if (ids.length > 0) {
                            setSelectedIds(ids);
                        }
                    }}
                />
            </div>
        </div>
    );
};
