import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../../api/client';
import { Button } from '../../../components/ui/Button';
import {
    Save, Image as ImageIcon, Type, Trash,
    Settings, Move, ZoomIn, ZoomOut,
    QrCode, LayoutTemplate, MousePointer2
} from 'lucide-react';

interface Element {
    id: string;
    type: 'text' | 'variable' | 'qrcode';
    text?: string;
    x: number;
    y: number;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    width?: number;
    height?: number;
    align?: 'left' | 'center' | 'right';
}

export const CertificateEditor: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // State
    const [name, setName] = useState('Novo Modelo');
    const [backgroundUrl, setBackgroundUrl] = useState('');
    const [elements, setElements] = useState<Element[]>([]);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [zoom, setZoom] = useState(0.8);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'tools' | 'settings'>('tools');

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const dragItem = useRef<string | null>(null);

    useEffect(() => {
        if (id) loadTemplate();
    }, [id]);

    const loadTemplate = async () => {
        try {
            // Fetch logic would go here. For now, assuming mock or list fetch handled elsewhere
            const res = await api.get('/certificate-templates');
            const found = res.data.find((t: any) => t.id === id);
            if (found) {
                setName(found.name);
                setBackgroundUrl(found.backgroundUrl || '');
                setElements(found.elements || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async () => {
        setLoading(true);
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
            alert('Erro ao salvar modelo');
        } finally {
            setLoading(false);
        }
    };

    // Element Management
    const addElement = (type: 'text' | 'variable' | 'qrcode', content?: string) => {
        const newEl: Element = {
            id: crypto.randomUUID(),
            type,
            x: 50,
            y: 50,
            text: content || (type === 'text' ? 'Novo Texto' : type === 'qrcode' ? 'QR Code' : '{{variavel}}'),
            fontSize: type === 'text' ? 24 : 14,
            color: '#000000',
            fontFamily: 'Helvetica',
            width: type === 'qrcode' ? 100 : undefined,
            height: type === 'qrcode' ? 100 : undefined,
            align: 'left'
        };
        setElements([...elements, newEl]);
        setSelectedElementId(newEl.id);
    };

    const updateElement = (id: string, updates: Partial<Element>) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
    };

    const deleteElement = (id: string) => {
        setElements(prev => prev.filter(el => el.id !== id));
        setSelectedElementId(null);
    };

    // Drag & Drop
    const handleDragStart = (e: React.DragEvent, elId: string) => {
        e.stopPropagation();
        dragItem.current = elId;
        e.dataTransfer.effectAllowed = 'move';
        // Set drag image to transparent or custom if needed
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const elId = dragItem.current;
        if (!elId || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();

        // Calculate position relative to the scaled canvas
        // Mouse ClientX - Canvas Left = X relative to canvas screen pixels
        // Divide by Zoom to get X relative to canvas real pixels
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;

        // Snap to grid (optional, 10px)
        const snappedX = Math.round(x / 10) * 10;
        const snappedY = Math.round(y / 10) * 10;

        updateElement(elId, { x: snappedX, y: snappedY });
        dragItem.current = null;
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const selectedElement = elements.find(el => el.id === selectedElementId);

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-[var(--bg-page)] overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b border-[var(--border-subtle)] px-6 flex items-center justify-between z-10 shrink-0 bg-[var(--bg-elevated)]/80 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/certificates')}
                        className="btn btn-secondary py-1 px-3 text-xs"
                    >
                        Voltar
                    </button>
                    <div className="h-6 w-px bg-[var(--border-subtle)]" />
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="input bg-transparent border-transparent hover:border-[var(--border-strong)] focus:border-[var(--accent-gold)] text-lg font-semibold px-2 py-1 w-64"
                        placeholder="Nome do Modelo"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-[var(--bg-elevated-soft)] rounded-lg p-1 mr-4 border border-[var(--border-subtle)]">
                        <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="p-1 hover:text-[var(--accent-gold)] rounded transition-colors text-[var(--fg-muted)]"><ZoomOut size={16} /></button>
                        <span className="text-xs font-medium w-12 text-center text-[var(--fg-main)]">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1 hover:text-[var(--accent-gold)] rounded transition-colors text-[var(--fg-muted)]"><ZoomIn size={16} /></button>
                    </div>
                    <button onClick={handleSave} disabled={loading} className="btn btn-primary gap-2">
                        <Save size={18} />
                        Salvar
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar: Tools */}
                <aside className="w-72 bg-[var(--bg-elevated)] border-r border-[var(--border-subtle)] flex flex-col z-10">
                    <div className="flex border-b border-[var(--border-subtle)]">
                        <button
                            onClick={() => setActiveTab('tools')}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'tools' ? 'border-[var(--accent-gold)] text-[var(--accent-gold)] bg-[var(--bg-elevated-soft)]' : 'border-transparent text-[var(--fg-muted)] hover:text-[var(--fg-main)]'}`}
                        >
                            Elementos
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'settings' ? 'border-[var(--accent-gold)] text-[var(--accent-gold)] bg-[var(--bg-elevated-soft)]' : 'border-transparent text-[var(--fg-muted)] hover:text-[var(--fg-main)]'}`}
                        >
                            Configurações
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {activeTab === 'tools' ? (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="section-title text-sm mb-3 !m-0">Básico</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={() => addElement('text')} className="flex flex-col items-center justify-center p-4 border border-[var(--border-strong)] rounded-lg hover:border-[var(--accent-gold)] hover:bg-[var(--bg-elevated-soft)] transition-all group bg-[var(--bg-elevated)]/50">
                                            <Type size={24} className="text-[var(--fg-muted)] group-hover:text-[var(--accent-gold)] mb-2" />
                                            <span className="text-xs font-medium text-[var(--fg-muted)] group-hover:text-[var(--accent-gold)]">Texto</span>
                                        </button>
                                        <button onClick={() => addElement('qrcode')} className="flex flex-col items-center justify-center p-4 border border-[var(--border-strong)] rounded-lg hover:border-[var(--accent-gold)] hover:bg-[var(--bg-elevated-soft)] transition-all group bg-[var(--bg-elevated)]/50">
                                            <QrCode size={24} className="text-[var(--fg-muted)] group-hover:text-[var(--accent-gold)] mb-2" />
                                            <span className="text-xs font-medium text-[var(--fg-muted)] group-hover:text-[var(--accent-gold)]">QR Code</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="section-title text-sm mb-3 !m-0">Variáveis Dinâmicas</h3>
                                    <div className="space-y-2">
                                        {[
                                            { label: 'Nome do Visitante', val: '{{nome_visitante}}' },
                                            { label: 'Título do Evento/Trilha', val: '{{nome_evento}}' },
                                            { label: 'Data de Conclusão', val: '{{data_conclusao}}' },
                                            { label: 'Carga Horária', val: '{{carga_cultural}}' },
                                            { label: 'Código Único', val: '{{code}}' }
                                        ].map(v => (
                                            <button
                                                key={v.val}
                                                onClick={() => addElement('variable', v.val)}
                                                className="w-full flex items-center px-3 py-2 text-sm text-[var(--fg-main)] bg-[var(--bg-elevated-soft)] border border-[var(--border-subtle)] rounded-md hover:border-[var(--accent-gold)] hover:shadow-[0_0_10px_rgba(212,175,55,0.1)] transition-all group"
                                            >
                                                <span className="w-2 h-2 rounded-full bg-[var(--accent-gold)] mr-2 group-hover:shadow-[0_0_8px_var(--accent-gold)]" />
                                                {v.label}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-[var(--fg-muted)] mt-2 px-1 italic opacity-70">
                                        Esses campos serão preenchidos automaticamente ao gerar o certificado.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="section-title text-sm mb-3 !m-0">Fundo do Certificado</h3>
                                    <div className="space-y-3">
                                        <div className="aspect-video bg-[var(--bg-elevated-soft)] rounded-lg overflow-hidden border border-[var(--border-subtle)] relative group">
                                            {backgroundUrl ? (
                                                <img src={backgroundUrl} alt="Background" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[var(--fg-muted)]">
                                                    <ImageIcon size={32} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="form-label text-xs mb-1 block">URL da Imagem</label>
                                            <input
                                                value={backgroundUrl}
                                                onChange={e => setBackgroundUrl(e.target.value)}
                                                className="input w-full text-sm"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Center: Workspace (Canvas) */}
                <main className="flex-1 bg-[var(--bg-page)] relative overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-auto p-8 flex items-center justify-center relative">
                        {/* Grid Pattern Overlay */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(#d4af37 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                        <div
                            ref={containerRef}
                            className="bg-white shadow-[0_0_50px_rgba(0,0,0,0.5)] relative transition-transform duration-200 ease-out origin-center select-none"
                            style={{
                                width: '842px',
                                height: '595px',
                                transform: `scale(${zoom})`,
                                backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onClick={() => setSelectedElementId(null)}
                        >
                            {!backgroundUrl && (
                                <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-300 pointer-events-none">
                                    <span className="text-4xl font-bold opacity-20 font-serif">A4 Landscape</span>
                                </div>
                            )}

                            {elements.map(el => {
                                const isSelected = selectedElementId === el.id;
                                return (
                                    <div
                                        key={el.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, el.id)}
                                        onClick={(e) => { e.stopPropagation(); setSelectedElementId(el.id); }}
                                        className={`absolute group cursor-move hover:outline hover:outline-1 hover:outline-[var(--accent-gold)] ${isSelected ? 'outline outline-2 outline-[var(--accent-gold)] z-10' : ''}`}
                                        style={{
                                            left: el.x,
                                            top: el.y,
                                            fontSize: `${el.fontSize}px`,
                                            color: el.color,
                                            fontFamily: el.fontFamily,
                                            width: el.width,
                                            height: el.height,
                                            textAlign: el.align
                                        }}
                                    >
                                        {isSelected && (
                                            <>
                                                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-[var(--accent-gold)] rounded-full shadow-sm" />
                                                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-[var(--accent-gold)] rounded-full shadow-sm" />
                                                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-[var(--accent-gold)] rounded-full shadow-sm" />
                                                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-[var(--accent-gold)] rounded-full shadow-sm" />
                                            </>
                                        )}

                                        {el.type === 'qrcode' ? (
                                            <div className="w-full h-full bg-black flex flex-col items-center justify-center text-white/50 text-xs gap-1">
                                                <QrCode size={24} />
                                                QR
                                            </div>
                                        ) : (
                                            <span className="select-none whitespace-pre-wrap leading-tight">{el.text}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </main>

                {/* Right Sidebar: Properties */}
                <aside className="w-72 bg-[var(--bg-elevated)] border-l border-[var(--border-subtle)] overflow-y-auto custom-scrollbar">
                    {selectedElement ? (
                        <div className="p-4 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-[var(--accent-gold)] font-serif tracking-wide">Propriedades</h3>
                                <button
                                    onClick={() => deleteElement(selectedElement.id)}
                                    className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-md transition-colors"
                                    title="Remover elemento"
                                >
                                    <Trash size={16} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {selectedElement.type !== 'qrcode' && (
                                    <>
                                        <div>
                                            <label className="form-label text-xs mb-1 block">Conteúdo</label>
                                            <textarea
                                                value={selectedElement.text}
                                                onChange={e => updateElement(selectedElement.id, { text: e.target.value })}
                                                rows={3}
                                                className="input w-full text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label text-xs mb-1 block">Fonte</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <select
                                                    value={selectedElement.fontFamily}
                                                    onChange={e => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                                                    className="input text-sm"
                                                >
                                                    <option value="Helvetica">Helvetica</option>
                                                    <option value="Times">Times New Roman</option>
                                                    <option value="Courier">Courier</option>
                                                    <option value="Georgia">Georgia</option>
                                                </select>
                                                <input
                                                    type="number"
                                                    value={selectedElement.fontSize}
                                                    onChange={e => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                                                    className="input text-sm"
                                                    placeholder="Size"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="form-label text-xs mb-1 block">Alinhamento</label>
                                            <div className="flex bg-[var(--bg-elevated-soft)] p-1 rounded-md border border-[var(--border-subtle)]">
                                                {['left', 'center', 'right'].map((align) => (
                                                    <button
                                                        key={align}
                                                        onClick={() => updateElement(selectedElement.id, { align: align as any })}
                                                        className={`flex-1 py-1 rounded text-xs capitalize transition-all ${selectedElement.align === align ? 'bg-[var(--accent-gold)] text-[var(--bg-page)] font-bold shadow-sm' : 'text-[var(--fg-muted)] hover:text-[var(--fg-main)]'}`}
                                                    >
                                                        {align === 'left' ? 'Esq' : align === 'center' ? 'Centro' : 'Dir'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="form-label text-xs mb-1 block">Cor</label>
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="color"
                                                    value={selectedElement.color}
                                                    onChange={e => updateElement(selectedElement.id, { color: e.target.value })}
                                                    className="h-9 w-9 rounded-md border border-[var(--border-strong)] cursor-pointer p-0 overflow-hidden bg-transparent"
                                                />
                                                <input
                                                    value={selectedElement.color}
                                                    onChange={e => updateElement(selectedElement.id, { color: e.target.value })}
                                                    className="input flex-1 text-sm uppercase font-mono"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="pt-4 border-t border-[var(--border-subtle)]">
                                    <label className="form-label text-xs mb-2 block">Posição</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <span className="text-[10px] text-[var(--fg-muted)] uppercase mb-1 block">X</span>
                                            <input
                                                type="number"
                                                value={Math.round(selectedElement.x)}
                                                onChange={e => updateElement(selectedElement.id, { x: Number(e.target.value) })}
                                                className="input w-full text-sm"
                                            />
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-[var(--fg-muted)] uppercase mb-1 block">Y</span>
                                            <input
                                                type="number"
                                                value={Math.round(selectedElement.y)}
                                                onChange={e => updateElement(selectedElement.id, { y: Number(e.target.value) })}
                                                className="input w-full text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-[var(--fg-muted)] p-8 text-center opacity-50">
                            <MousePointer2 size={48} className="mb-4 text-[var(--accent-gold)]" />
                            <p className="text-sm font-serif italic">Selecione um elemento para editar</p>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};
