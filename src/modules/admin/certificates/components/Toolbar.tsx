import React from 'react';
import { useCertificate } from '../context/CertificateContext';
import { Type, QrCode, Image as ImageIcon, LayoutTemplate, ZoomIn, ZoomOut } from 'lucide-react';

export const Toolbar: React.FC = () => {
    const {
        addElement, backgroundUrl, setBackgroundUrl, uploading,
        zoom, setZoom
    } = useCertificate() as any; // Cast to avoid strict type checks for now on custom props that might be missing in context type def but present in implementation

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setBackgroundUrl(url);
            // Ideally upload to backend here, but for MVP local preview is instant
        }
    };

    return (
        <aside className="w-72 bg-[var(--bg-elevated)] border-r border-[var(--border-subtle)] flex flex-col z-20 shadow-xl shrink-0 h-full">
            <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated-soft)]">
                <h2 className="text-sm font-bold text-[var(--accent-gold)] uppercase tracking-wider flex items-center gap-2">
                    <LayoutTemplate size={16} /> Ferramentas
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
                {/* Add Basics */}
                <div>
                    <h3 className="text-xs font-bold text-[var(--fg-muted)] uppercase mb-3">Inserir</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => addElement('text')} className="tool-btn flex flex-col items-center justify-center p-4 border border-[var(--border-strong)] rounded-lg hover:border-[var(--accent-gold)] hover:bg-[var(--bg-elevated-soft)] transition-all">
                            <Type size={24} className="mb-2 text-[var(--fg-muted)]" />
                            <span className="text-xs font-medium">Texto</span>
                        </button>
                        <button onClick={() => addElement('qrcode')} className="tool-btn flex flex-col items-center justify-center p-4 border border-[var(--border-strong)] rounded-lg hover:border-[var(--accent-gold)] hover:bg-[var(--bg-elevated-soft)] transition-all">
                            <QrCode size={24} className="mb-2 text-[var(--fg-muted)]" />
                            <span className="text-xs font-medium">QR Code</span>
                        </button>
                    </div>
                </div>

                {/* Variables */}
                <div>
                    <h3 className="text-xs font-bold text-[var(--fg-muted)] uppercase mb-3">Variáveis</h3>
                    <div className="space-y-2">
                        {[
                            { label: 'Nome do Visitante', val: '{{nome_visitante}}' },
                            { label: 'Título do Evento', val: '{{nome_evento}}' },
                            { label: 'Data', val: '{{data_conclusao}}' },
                            { label: 'Carga Horária', val: '{{carga_cultural}}' },
                            { label: 'Código Validação', val: '{{code}}' }
                        ].map(v => (
                            <button
                                key={v.val}
                                onClick={() => addElement('variable', v.val)}
                                className="w-full text-left px-3 py-2 text-xs border border-[var(--border-subtle)] rounded hover:border-[var(--accent-gold)] flex items-center gap-2"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] shrink-0" />
                                {v.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Background */}
                <div>
                    <h3 className="text-xs font-bold text-[var(--fg-muted)] uppercase mb-3">Fundo</h3>
                    <div
                        className="aspect-video bg-[var(--bg-elevated-soft)] rounded border border-[var(--border-subtle)] cursor-pointer hover:border-[var(--accent-gold)] relative overflow-hidden"
                        onClick={() => document.getElementById('bg-upload-new')?.click()}
                    >
                        {backgroundUrl ? (
                            <img src={backgroundUrl} className="w-full h-full object-cover" alt="bg" />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-[var(--fg-soft)]">
                                <ImageIcon size={24} />
                                <span className="text-[10px] mt-1">Alterar Fundo</span>
                            </div>
                        )}
                    </div>
                    <input type="file" id="bg-upload-new" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </div>
            </div>

            {/* Zoom Footer */}
            <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated-soft)] flex items-center justify-between">
                <button onClick={() => setZoom((z: number) => Math.max(0.2, z - 0.1))}><ZoomOut size={16} /></button>
                <span className="text-xs font-mono">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom((z: number) => Math.min(3, z + 0.1))}><ZoomIn size={16} /></button>
            </div>
        </aside>
    );
};
