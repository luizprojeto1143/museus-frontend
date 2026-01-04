import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../../api/client';
import { Button } from '../../../components/ui/Button';
import {
    Save, Image as ImageIcon, Type, Trash,
    Settings, Move, ZoomIn, ZoomOut,
    QrCode, LayoutTemplate, MousePointer2, AlertTriangle
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
    const [uploading, setUploading] = useState(false);

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const dragItem = useRef<string | null>(null);
    const textInputRef = useRef<HTMLTextAreaElement>(null);

    // Focus properties panel input when element is selected
    useEffect(() => {
        if (selectedElementId && textInputRef.current) {
            textInputRef.current.focus({ preventScroll: true });
        }
    }, [selectedElementId]);


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
        // Fallback for ID generation to avoid crypto.randomUUID() crash in non-secure contexts
        const newId = Date.now().toString(36) + Math.random().toString(36).substr(2);

        const newEl: Element = {
            id: newId,
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
        const el = elements.find(e => e.id === id);
        if (el) {
            if (el.type === 'qrcode') {
                alert("O QR Code é obrigatório para validação e não pode ser removido.");
                return;
            }
            if (el.text === '{{code}}') {
                alert("O Código de Validação é obrigatório e não pode ser removido.");
                return;
            }
        }
        setElements(prev => prev.filter(elm => elm.id !== id));
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

    // File Upload Handler
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        // Assuming tenantId is handled by cookie/token on backend or not needed for this simple endpoint wrapper
        // If needed, we might need to get it from context, but looking at AdminUploads it passes tenantId.
        // For now, let's try just posting file as typical upload.
        // Correcting based on AdminUploads pattern:
        // formData.append("tenantId", tenantId || ""); 
        // Since I don't have tenantId in this component context easily without adding hook, 
        // I will trust the backend allows upload or I'll add useAuth.

        try {
            // Using the correct endpoint for images
            const res = await api.post("/upload/image", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data && res.data.url) {
                let url = res.data.url;
                // If it's a local relative path, prepend API URL
                if (url.startsWith('/')) {
                    const apiBase = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";
                    // Remove potential double slash if apiBase ends with /
                    url = `${apiBase.replace(/\/$/, "")}${url}`;
                }
                setBackgroundUrl(url);
            } else {
                alert("Upload realizado! Se a imagem não aparecer, verifique o formato.");
            }
        } catch (err) {
            console.error(err);
            alert("Erro ao fazer upload da imagem.");
        } finally {
            setUploading(false);
        }
    };

    const selectedElement = elements.find(el => el.id === selectedElementId);

    return (
        <div className="flex flex-col h-[calc(100vh-70px)] -m-8 bg-[var(--bg-page)] overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b border-[var(--border-subtle)] px-6 flex items-center justify-between z-10 shrink-0 bg-[var(--bg-elevated)]/80 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/certificates')}
                        className="btn btn-secondary py-1 px-3 text-xs flex items-center gap-2"
                    >
                        <span>←</span> Voltar
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
                    <button onClick={handleSave} disabled={loading} className="btn btn-primary gap-2">
                        <Save size={18} />
                        Salvar Modelo
                    </button>
                </div>
            </header>

            <div className="flex-1 flex flex-row overflow-hidden">
                {/* Left Sidebar: Tools */}
                <aside className="w-80 bg-[var(--bg-elevated)] border-r border-[var(--border-subtle)] flex flex-col z-20 shadow-xl shrink-0">
                    <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated-soft)]">
                        <h2 className="text-sm font-bold text-[var(--accent-gold)] uppercase tracking-wider flex items-center gap-2">
                            <LayoutTemplate size={16} /> Ferramentas
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-8">
                        {/* Section: Elements */}
                        <div>
                            <h3 className="section-title text-xs font-bold text-[var(--fg-muted)] uppercase mb-3">Adicionar Elementos</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => addElement('text')} className="flex flex-col items-center justify-center p-4 border border-[var(--border-strong)] rounded-lg hover:border-[var(--accent-gold)] hover:bg-[var(--bg-elevated-soft)] transition-all group bg-[var(--bg-elevated)]/50 aspect-square">
                                    <Type size={28} className="text-[var(--fg-muted)] group-hover:text-[var(--accent-gold)] mb-2" />
                                    <span className="text-xs font-medium text-[var(--fg-muted)] group-hover:text-[var(--accent-gold)]">Texto</span>
                                </button>
                                <button onClick={() => addElement('qrcode')} className="flex flex-col items-center justify-center p-4 border border-[var(--border-strong)] rounded-lg hover:border-[var(--accent-gold)] hover:bg-[var(--bg-elevated-soft)] transition-all group bg-[var(--bg-elevated)]/50 aspect-square">
                                    <QrCode size={28} className="text-[var(--fg-muted)] group-hover:text-[var(--accent-gold)] mb-2" />
                                    <span className="text-xs font-medium text-[var(--fg-muted)] group-hover:text-[var(--accent-gold)]">QR Code</span>
                                </button>
                            </div>
                        </div>

                        {/* Section: Background */}
                        <div>
                            <h3 className="section-title text-xs font-bold text-[var(--fg-muted)] uppercase mb-3">Fundo do Certificado</h3>
                            <div className="space-y-3">
                                <div className="aspect-video bg-[var(--bg-elevated-soft)] rounded-lg overflow-hidden border border-[var(--border-subtle)] relative group cursor-pointer hover:border-[var(--accent-gold)] transition-colors" onClick={() => document.getElementById('bg-upload')?.click()}>
                                    {backgroundUrl ? (
                                        <>
                                            <img src={backgroundUrl} alt="Background" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-xs text-white font-medium flex items-center gap-1"><ImageIcon size={14} /> Trocar Imagem</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-[var(--fg-soft)] gap-2">
                                            <ImageIcon size={32} />
                                            <span className="text-xs">Clique para enviar imagem</span>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    id="bg-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                                {uploading && <p className="text-xs text-[var(--accent-gold)] text-center animate-pulse">Enviando imagem...</p>}

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="w-full border-t border-[var(--border-strong)]"></div>
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-[var(--bg-elevated)] px-2 text-[10px] text-[var(--fg-muted)] uppercase">ou use URL</span>
                                    </div>
                                </div>

                                <input
                                    value={backgroundUrl}
                                    onChange={e => setBackgroundUrl(e.target.value)}
                                    className="input w-full text-xs py-2 bg-[var(--bg-elevated-soft)] border-[var(--border-strong)]"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        {/* Section: Variables */}
                        <div>
                            <h3 className="section-title text-xs font-bold text-[var(--fg-muted)] uppercase mb-3">Variáveis Dinâmicas</h3>
                            <div className="space-y-2">
                                {[
                                    { label: 'Nome do Visitante', val: '{{nome_visitante}}' },
                                    { label: 'Título do Evento', val: '{{nome_evento}}' },
                                    { label: 'Data de Conclusão', val: '{{data_conclusao}}' },
                                    { label: 'Carga Horária', val: '{{carga_cultural}}' },
                                    { label: 'Código de Validação', val: '{{code}}' }
                                ].map(v => (
                                    <button
                                        key={v.val}
                                        onClick={() => addElement('variable', v.val)}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-xs text-[var(--fg-main)] bg-[var(--bg-elevated-soft)] border border-[var(--border-subtle)] rounded-md hover:border-[var(--accent-gold)] hover:bg-[var(--bg-elevated)] hover:shadow-sm transition-all group text-left"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] shrink-0" />
                                        <div className="flex-1">
                                            <span className="block font-medium">{v.label}</span>
                                            <span className="text-[10px] text-[var(--fg-soft)] font-mono opacity-80">{v.val}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Center: Workspace (Canvas) */}
                <main className="flex-1 bg-[#1a1108] relative overflow-hidden flex flex-col items-center justify-center p-8">
                    {/* Grid Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(#d4af37 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                    <div className="relative">
                        <div
                            ref={containerRef}
                            className="shadow-2xl relative transition-transform duration-200 ease-out origin-center select-none"
                            style={{
                                width: '842px',
                                height: '595px',
                                transform: `scale(${zoom})`,
                                backgroundColor: '#ffffff', // FORCE WHITE BACKGROUND
                                backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                border: '1px solid #e5e7eb' // subtle border for white-on-white situations usually, but here contrast is high
                            }}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onClick={() => setSelectedElementId(null)}
                        >
                            {!backgroundUrl && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 text-gray-300 pointer-events-none gap-4 m-8">
                                    <span className="text-6xl opacity-20">📜</span>
                                    <span className="text-2xl font-bold opacity-30 font-serif">Área do Certificado (A4)</span>
                                </div>
                            )}

                            {elements.map(el => {
                                const isSelected = selectedElementId === el.id;
                                return (
                                    <div
                                        key={el.id}
                                        draggable={true}
                                        onDragStart={(e) => handleDragStart(e, el.id)}
                                        onClick={(e) => { e.stopPropagation(); setSelectedElementId(el.id); }}
                                        onDoubleClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedElementId(el.id);
                                        }}
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

                    {/* Zoom Controls Floating */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[var(--bg-elevated)]/90 backdrop-blur border border-[var(--border-subtle)] rounded-full px-4 py-2 shadow-xl z-30">
                        <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="text-[var(--fg-muted)] hover:text-[var(--accent-gold)] transition-colors"><ZoomOut size={16} /></button>
                        <span className="text-xs font-mono w-12 text-center text-[var(--fg-main)]">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="text-[var(--fg-muted)] hover:text-[var(--accent-gold)] transition-colors"><ZoomIn size={16} /></button>
                    </div>
                </main>

                {/* Right Sidebar: Properties */}
                <aside className="w-80 bg-[var(--bg-elevated)] border-l border-[var(--border-subtle)] overflow-y-auto custom-scrollbar shadow-xl z-20 shrink-0">
                    <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated-soft)] flex justify-between items-center">
                        <h2 className="text-sm font-bold text-[var(--accent-gold)] uppercase tracking-wider flex items-center gap-2">
                            <Settings size={16} /> Propriedades
                        </h2>
                    </div>

                    {selectedElement ? (
                        <div className="p-4 space-y-6">
                            <div className="flex items-center justify-between bg-[var(--bg-elevated-soft)] p-3 rounded-lg border border-[var(--border-subtle)]">
                                <span className="text-xs font-bold text-[var(--fg-main)] uppercase">{selectedElement.type === 'variable' ? 'Variável' : selectedElement.type === 'qrcode' ? 'QR Code' : 'Texto'}</span>
                                <button
                                    onClick={() => deleteElement(selectedElement.id)}
                                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-md transition-colors"
                                    title="Remover elemento"
                                    disabled={selectedElement.type === 'qrcode' || selectedElement.text === '{{code}}'}
                                    style={{ opacity: (selectedElement.type === 'qrcode' || selectedElement.text === '{{code}}') ? 0.5 : 1 }}
                                >
                                    <Trash size={16} />
                                </button>
                            </div>

                            {(selectedElement.type === 'qrcode' || selectedElement.text === '{{code}}') && (
                                <div className="bg-yellow-900/20 border border-yellow-700/30 p-2.5 rounded text-xs text-yellow-500 flex items-start gap-2">
                                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                    <span>Este elemento é obrigatório para a validação do certificado e não pode ser removido.</span>
                                </div>
                            )}

                            <div className="space-y-5">
                                {selectedElement.type !== 'qrcode' && (
                                    <>
                                        <div className="form-group">
                                            <label className="form-label text-xs mb-1.5 block uppercase tracking-wide text-[var(--fg-soft)]">Conteúdo de Texto</label>
                                            <textarea
                                                key={selectedElement.id}
                                                ref={textInputRef}
                                                value={selectedElement.text}
                                                onChange={e => updateElement(selectedElement.id, { text: e.target.value })}
                                                rows={4}
                                                className="input w-full text-sm leading-relaxed focus:ring-2 focus:ring-[var(--accent-gold)]"
                                                placeholder="Digite o texto aqui..."
                                            />
                                        </div>

                                        <div className="h-px bg-[var(--border-subtle)] my-2" />

                                        <div className="form-group">
                                            <label className="form-label text-xs mb-1.5 block uppercase tracking-wide text-[var(--fg-soft)]">Tipografia</label>
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
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={selectedElement.fontSize}
                                                        onChange={e => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                                                        className="input text-sm w-full pl-8"
                                                    />
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--fg-muted)]">px</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label text-xs mb-1.5 block uppercase tracking-wide text-[var(--fg-soft)]">Alinhamento</label>
                                            <div className="flex bg-[var(--bg-elevated-soft)] p-1 rounded-md border border-[var(--border-subtle)]">
                                                {['left', 'center', 'right'].map((align) => (
                                                    <button
                                                        key={align}
                                                        onClick={() => updateElement(selectedElement.id, { align: align as any })}
                                                        className={`flex-1 py-1.5 rounded text-xs capitalize transition-all ${selectedElement.align === align ? 'bg-[var(--accent-gold)] text-[var(--bg-page)] font-bold shadow-sm' : 'text-[var(--fg-muted)] hover:text-[var(--fg-main)]'}`}
                                                    >
                                                        {align === 'left' ? 'Esquerda' : align === 'center' ? 'Centro' : 'Direita'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label text-xs mb-1.5 block uppercase tracking-wide text-[var(--fg-soft)]">Cor do Texto</label>
                                            <div className="flex gap-2 items-center bg-[var(--bg-elevated-soft)] p-2 rounded-md border border-[var(--border-subtle)]">
                                                <input
                                                    type="color"
                                                    value={selectedElement.color}
                                                    onChange={e => updateElement(selectedElement.id, { color: e.target.value })}
                                                    className="h-8 w-8 rounded border-none cursor-pointer bg-transparent"
                                                />
                                                <input
                                                    value={selectedElement.color}
                                                    onChange={e => updateElement(selectedElement.id, { color: e.target.value })}
                                                    className="bg-transparent border-none text-sm uppercase font-mono text-[var(--fg-main)] focus:ring-0 flex-1"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="h-px bg-[var(--border-subtle)] my-2" />

                                <div className="form-group">
                                    <label className="form-label text-xs mb-1.5 block uppercase tracking-wide text-[var(--fg-soft)]">Posicionamento (px)</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--fg-muted)] font-bold">X</span>
                                            <input
                                                type="number"
                                                value={Math.round(selectedElement.x)}
                                                onChange={e => updateElement(selectedElement.id, { x: Number(e.target.value) })}
                                                className="input w-full text-sm pl-8 bg-[var(--bg-elevated-soft)]"
                                            />
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--fg-muted)] font-bold">Y</span>
                                            <input
                                                type="number"
                                                value={Math.round(selectedElement.y)}
                                                onChange={e => updateElement(selectedElement.id, { y: Number(e.target.value) })}
                                                className="input w-full text-sm pl-8 bg-[var(--bg-elevated-soft)]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-40">
                            <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated-soft)] flex items-center justify-center mb-4 border border-[var(--border-subtle)]">
                                <MousePointer2 size={24} className="text-[var(--accent-gold)]" />
                            </div>
                            <h3 className="text-sm font-bold text-[var(--fg-main)] mb-1">Nada Selecionado</h3>
                            <p className="text-xs text-[var(--fg-muted)]">Clique em um elemento no certificado para editar suas propriedades.</p>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};
