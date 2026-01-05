import React, { useRef, useEffect, useState } from 'react';
import Moveable from 'react-moveable';
import Selecto from 'react-selecto';
import { useCertificate } from '../context/CertificateContext';
import { CertificateElement } from '../types';
import { QrCode } from 'lucide-react';

const ElementRenderer: React.FC<{ element: CertificateElement }> = ({ element }) => {
    return (
        <div
            className={`certificate-element relative group ${element.type === 'qrcode' ? 'bg-gradient-to-br from-gray-900 to-black text-white/60 flex flex-col items-center justify-center rounded-lg' : ''}`}
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
                    <span className="text-[10px] mt-1 opacity-60">QR Code</span>
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

    useEffect(() => {
        const domTargets: (HTMLElement | SVGElement)[] = [];
        selectedIds.forEach(id => {
            const el = document.querySelector(`[data-id="${id}"]`);
            if (el) domTargets.push(el as HTMLElement);
        });
        setTargets(domTargets);
    }, [selectedIds, elements]);

    return (
        <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-8"
            style={{ background: 'radial-gradient(ellipse at center, #1f1610 0%, #0f0a04 100%)' }}>
            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#d4af37 0.5px, transparent 0.5px)',
                    backgroundSize: '32px 32px',
                    opacity: 0.08
                }}
            />

            {/* Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.05) 0%, transparent 70%)' }} />

            <div className="relative">
                {/* Certificate Shadow */}
                <div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{
                        transform: `scale(${zoom})`,
                        width: '842px',
                        height: '595px',
                        boxShadow: '0 25px 80px -20px rgba(0,0,0,0.6), 0 0 60px -15px rgba(212,175,55,0.15)',
                    }}
                />

                <div
                    ref={containerRef}
                    className="relative transition-transform duration-200 ease-out origin-center select-none rounded-sm overflow-hidden"
                    style={{
                        width: '842px',
                        height: '595px',
                        transform: `scale(${zoom})`,
                        backgroundColor: '#ffffff',
                        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                    onClick={() => setSelectedIds([])}
                >
                    {!backgroundUrl && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center border border-gray-200 text-gray-300 pointer-events-none">
                            <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center mb-4">
                                <span className="text-4xl opacity-30">📜</span>
                            </div>
                            <span className="text-lg font-medium opacity-40">Área do Certificado</span>
                            <span className="text-xs text-gray-400 mt-2 opacity-50">842 × 595 px (A4 Paisagem)</span>
                        </div>
                    )}

                    {elements.map(el => (
                        <ElementRenderer key={el.id} element={el} />
                    ))}
                </div>

                {/* Moveable & Selecto - Outside scaled container */}
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
                        setSelectedIds(ids);
                    }}
                />
            </div>
        </div>
    );
};
