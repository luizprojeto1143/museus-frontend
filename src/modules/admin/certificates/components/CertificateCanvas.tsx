import React, { useRef, useEffect, useState } from 'react';
import Moveable from 'react-moveable';
import Selecto from 'react-selecto';
import { useCertificate } from '../context/CertificateContext';
import { CertificateElement } from '../types';
import { QrCode } from 'lucide-react';

const ElementRenderer: React.FC<{ element: CertificateElement }> = ({ element }) => {
    return (
        <div
            className={`certificate-element relative group ${element.type === 'qrcode' ? 'bg-black text-white/50 flex flex-col items-center justify-center' : ''}`}
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
                textAlign: element.align,
                opacity: element.opacity ?? 1,
                whiteSpace: 'pre-wrap',
                lineHeight: 1.2,
                cursor: 'pointer',
                touchAction: 'none',
                userSelect: 'none'
            }}
            data-id={element.id}
        >
            {element.type === 'qrcode' ? (
                <>
                    <QrCode size={element.width ? element.width * 0.5 : 24} />
                    <span className="text-[10px]">QR Code</span>
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
        backgroundUrl, zoom, saveSnapshot, toggleSelection
    } = useCertificate();

    // Refs
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

    return (
        <div className="flex-1 bg-[#1a1108] relative overflow-hidden flex flex-col items-center justify-center p-8">
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#d4af37 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            <div className="relative">
                <div
                    ref={containerRef}
                    className="shadow-2xl relative transition-transform duration-200 ease-out origin-center select-none bg-white"
                    style={{
                        width: '842px',
                        height: '595px',
                        transform: `scale(${zoom})`,
                        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                    onClick={() => setSelectedIds([])}
                >
                    {!backgroundUrl && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 text-gray-300 pointer-events-none gap-4">
                            <span className="text-6xl opacity-20">📜</span>
                            <span className="text-2xl font-bold opacity-30 font-serif">Área do Certificado (A4)</span>
                        </div>
                    )}

                    {elements.map(el => (
                        <ElementRenderer key={el.id} element={el} />
                    ))}

                    <Moveable
                        ref={moveableRef}
                        target={targets}
                        draggable={true}
                        resizable={true}
                        rotatable={true}
                        snappable={true}
                        snapDirections={{ top: true, left: true, bottom: true, right: true, center: true, middle: true }}
                        elementGuidelines={Array.from(document.querySelectorAll('.certificate-element'))}

                        // Drag
                        onDragStart={() => saveSnapshot()}
                        onDrag={e => {
                            e.target.style.transform = e.transform;
                        }}
                        onDragEnd={e => {
                            if (e.isDrag) {
                                // Extract X and Y (simple parse for MVP, robust solution uses matrix)
                                // Moveable returns `translate(x, y) rotate(deg)`
                                // We need to sync this back to React state
                                const target = e.target as HTMLElement;
                                const id = target.getAttribute('data-id');
                                if (id) {
                                    // Parse transform manually or assume relative delta?
                                    // Moveable's "beforeTranslate" or "absolute" logic is better, but let's try delta first
                                    // Actually, react-moveable modifies transform directly. We just need to parse it back or use e.lastEvent

                                    // Better approach: use e.beforeTranslate which gives [x, y]
                                    // BUT onDragEnd doesn't give precise final X/Y easily without parsing style.
                                    // Let's rely on parsing the transform style we just set.
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
                        // Group Drag
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

                        // Resize
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

                        // Rotate
                        onRotateStart={() => saveSnapshot()}
                        onRotate={e => {
                            e.target.style.transform = e.drag.transform;
                        }}
                        onRotateEnd={e => {
                            const target = e.target as HTMLElement;
                            const id = target.getAttribute('data-id');
                            if (id) {
                                // We need to extract rotation. Moveable gives us e.lastEvent.rotate ideally?
                                // Or parsing.
                                // Regex for rotate
                                const match = target.style.transform.match(/rotate\(([-\d.]+)deg\)/);
                                if (match) updateElement(id, { rotate: parseFloat(match[1]) });
                            }
                        }}
                    />

                    <Selecto
                        ref={selectoRef}
                        dragContainer={containerRef.current}
                        selectableTargets={['.certificate-element']}
                        hitRate={0}
                        selectByClick={true}
                        selectFromInside={false}
                        toggleContinueSelect={['shift']}
                        onSelect={e => {
                            const ids = e.selected.map(el => el.getAttribute('data-id') || '').filter(Boolean);
                            setSelectedIds(ids);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
