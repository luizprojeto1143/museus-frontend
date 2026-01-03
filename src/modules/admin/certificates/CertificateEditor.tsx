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
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => navigate('/admin/certificates')}>
                        Voltar
                    </Button>
                    <div className="h-6 w-px bg-gray-300" />
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="text-lg font-semibold bg-transparent border-none outline-none focus:ring-2 focus:ring-primary-500 rounded px-2"
                        placeholder="Nome do Modelo"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-gray-100 rounded-lg p-1 mr-4">
                        <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="p-1 hover:bg-white rounded"><ZoomOut size={16} /></button>
                        <span className="text-xs font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1 hover:bg-white rounded"><ZoomIn size={16} /></button>
                    </div>
                    <Button onClick={handleSave} disabled={loading} className="gap-2">
                        <Save size={18} />
                        Salvar
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar: Tools */}
                <aside className="w-72 bg-white border-r border-gray-200 flex flex-col z-10">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('tools')}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'tools' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'}`}
                        >
                            Elementos
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'settings' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'}`}
                        >
                            Configurações
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {activeTab === 'tools' ? (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Básico</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={() => addElement('text')} className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors group">
                                            <Type size={24} className="text-gray-600 group-hover:text-primary-600 mb-2" />
                                            <span className="text-xs font-medium text-gray-600 group-hover:text-primary-600">Texto</span>
                                        </button>
                                        <button onClick={() => addElement('qrcode')} className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors group">
                                            <QrCode size={24} className="text-gray-600 group-hover:text-primary-600 mb-2" />
                                            <span className="text-xs font-medium text-gray-600 group-hover:text-primary-600">QR Code</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Variáveis Dinâmicas</h3>
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
                                                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-transparent rounded-md hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all"
                                            >
                                                <span className="w-2 h-2 rounded-full bg-green-400 mr-2" />
                                                {v.label}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2 px-1">
                                        Esses campos serão preenchidos automaticamente ao gerar o certificado.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Fundo do Certificado</h3>
                                    <div className="space-y-3">
                                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative group">
                                            {backgroundUrl ? (
                                                <img src={backgroundUrl} alt="Background" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <ImageIcon size={32} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">URL da Imagem</label>
                                            <input
                                                value={backgroundUrl}
                                                onChange={e => setBackgroundUrl(e.target.value)}
                                                className="w-full text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
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
                <main className="flex-1 bg-gray-100 relative overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-auto p-8 flex items-center justify-center relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                        <div
                            ref={containerRef}
                            className="bg-white shadow-2xl relative transition-transform duration-200 ease-out origin-center select-none"
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
                                <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-gray-200 text-gray-300 pointer-events-none">
                                    <span className="text-4xl font-bold opacity-10">A4 Landscape</span>
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
                                        className={`absolute group cursor-move hover:outline hover:outline-1 hover:outline-primary-400 ${isSelected ? 'outline outline-2 outline-primary-600 z-10' : ''}`}
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
                                                <div className="absolute -top-3 -left-3 w-2 h-2 bg-white border border-primary-600 rounded-full" />
                                                <div className="absolute -top-3 -right-3 w-2 h-2 bg-white border border-primary-600 rounded-full" />
                                                <div className="absolute -bottom-3 -left-3 w-2 h-2 bg-white border border-primary-600 rounded-full" />
                                                <div className="absolute -bottom-3 -right-3 w-2 h-2 bg-white border border-primary-600 rounded-full" />
                                            </>
                                        )}

                                        {el.type === 'qrcode' ? (
                                            <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center text-white/50 text-xs gap-1">
                                                <QrCode size={24} />
                                                QR
                                            </div>
                                        ) : (
                                            <span className="select-none whitespace-pre-wrap">{el.text}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </main>

                {/* Right Sidebar: Properties */}
                <aside className="w-72 bg-white border-l border-gray-200 overflow-y-auto">
                    {selectedElement ? (
                        <div className="p-4 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-900">Propriedades</h3>
                                <button
                                    onClick={() => deleteElement(selectedElement.id)}
                                    className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                                    title="Remover elemento"
                                >
                                    <Trash size={16} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {selectedElement.type !== 'qrcode' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Conteúdo</label>
                                            <textarea
                                                value={selectedElement.text}
                                                onChange={e => updateElement(selectedElement.id, { text: e.target.value })}
                                                rows={3}
                                                className="w-full text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Fonte</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <select
                                                    value={selectedElement.fontFamily}
                                                    onChange={e => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                                                    className="text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                                                >
                                                    <option value="Helvetica">Helvetica</option>
                                                    <option value="Times">Times New Roman</option>
                                                    <option value="Courier">Courier</option>
                                                </select>
                                                <input
                                                    type="number"
                                                    value={selectedElement.fontSize}
                                                    onChange={e => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                                                    className="text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                                                    placeholder="Tamanho"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Alinhamento</label>
                                            <div className="flex bg-gray-100 p-1 rounded-md">
                                                {['left', 'center', 'right'].map((align) => (
                                                    <button
                                                        key={align}
                                                        onClick={() => updateElement(selectedElement.id, { align: align as any })}
                                                        className={`flex-1 py-1 rounded text-xs capitalize ${selectedElement.align === align ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
                                                    >
                                                        {align === 'left' ? 'Esq' : align === 'center' ? 'Centro' : 'Dir'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Cor</label>
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="color"
                                                    value={selectedElement.color}
                                                    onChange={e => updateElement(selectedElement.id, { color: e.target.value })}
                                                    className="h-8 w-8 rounded border border-gray-300 cursor-pointer p-0 overflow-hidden"
                                                />
                                                <input
                                                    value={selectedElement.color}
                                                    onChange={e => updateElement(selectedElement.id, { color: e.target.value })}
                                                    className="flex-1 text-sm border-gray-300 rounded-md uppercase font-mono"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="pt-4 border-t border-gray-200">
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Posição</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <span className="text-[10px] text-gray-500 uppercase">X</span>
                                            <input
                                                type="number"
                                                value={Math.round(selectedElement.x)}
                                                onChange={e => updateElement(selectedElement.id, { x: Number(e.target.value) })}
                                                className="w-full text-sm border-gray-300 rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-gray-500 uppercase">Y</span>
                                            <input
                                                type="number"
                                                value={Math.round(selectedElement.y)}
                                                onChange={e => updateElement(selectedElement.id, { y: Number(e.target.value) })}
                                                className="w-full text-sm border-gray-300 rounded-md"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                            <MousePointer2 size={48} className="mb-4 opacity-20" />
                            <p className="text-sm">Selecione um elemento no certificado para editar suas propriedades.</p>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};
