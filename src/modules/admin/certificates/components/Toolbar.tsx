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
    } = useCertificate() as any;

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

    return (
        <aside className="w-72 bg-gradient-to-b from-[#1a1108] to-[#0f0a04] border-r border-[#3d2e1a]/50 flex flex-col z-20 shrink-0 h-full shadow-2xl">
            {/* Header */}
            <div className="p-5 border-b border-[#3d2e1a]/50 bg-gradient-to-r from-[#d4af37]/10 to-transparent">
                <h2 className="text-sm font-bold text-[#d4af37] uppercase tracking-widest flex items-center gap-2">
                    <LayoutTemplate size={18} className="opacity-80" />
                    Ferramentas
                </h2>
                <p className="text-[10px] text-[#a89060] mt-1 opacity-70">Arraste elementos para o canvas</p>
            </div>

            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-8">
                {/* Basic Elements */}
                <div>
                    <h3 className="text-[11px] font-bold text-[#a89060] uppercase tracking-wider mb-4 flex items-center gap-2">
                        <div className="w-8 h-px bg-gradient-to-r from-[#d4af37]/50 to-transparent" />
                        Elementos
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => addElement('text')}
                            className="group relative flex flex-col items-center justify-center p-5 rounded-xl border border-[#3d2e1a] bg-gradient-to-b from-[#1f1610] to-[#151009] hover:border-[#d4af37]/60 hover:shadow-lg hover:shadow-[#d4af37]/10 transition-all duration-300 hover:-translate-y-0.5"
                        >
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Type size={22} className="text-[#d4af37]" />
                            </div>
                            <span className="text-xs font-semibold text-[#e8dcc8]">Texto</span>
                            <span className="text-[9px] text-[#8a7a5a] mt-1">Adicionar texto</span>
                        </button>

                        <button
                            onClick={() => addElement('qrcode')}
                            className="group relative flex flex-col items-center justify-center p-5 rounded-xl border border-[#3d2e1a] bg-gradient-to-b from-[#1f1610] to-[#151009] hover:border-[#d4af37]/60 hover:shadow-lg hover:shadow-[#d4af37]/10 transition-all duration-300 hover:-translate-y-0.5"
                        >
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <QrCode size={22} className="text-[#d4af37]" />
                            </div>
                            <span className="text-xs font-semibold text-[#e8dcc8]">QR Code</span>
                            <span className="text-[9px] text-[#8a7a5a] mt-1">Validação</span>
                        </button>
                    </div>
                </div>

                {/* Variables */}
                <div>
                    <h3 className="text-[11px] font-bold text-[#a89060] uppercase tracking-wider mb-4 flex items-center gap-2">
                        <div className="w-8 h-px bg-gradient-to-r from-[#d4af37]/50 to-transparent" />
                        Variáveis Dinâmicas
                    </h3>
                    <div className="space-y-2">
                        {variables.map(v => (
                            <button
                                key={v.val}
                                onClick={() => addElement('variable', v.val)}
                                className="w-full text-left px-4 py-3 text-xs rounded-lg border border-[#3d2e1a]/60 bg-[#1a1108]/50 hover:bg-[#d4af37]/10 hover:border-[#d4af37]/40 flex items-center gap-3 transition-all duration-200 group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 flex items-center justify-center group-hover:bg-[#d4af37]/20 transition-colors">
                                    <v.icon size={14} className="text-[#d4af37]" />
                                </div>
                                <div className="flex-1">
                                    <span className="text-[#e8dcc8] font-medium block">{v.label}</span>
                                    <span className="text-[9px] text-[#6a5a3a] font-mono">{v.val}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Background */}
                <div>
                    <h3 className="text-[11px] font-bold text-[#a89060] uppercase tracking-wider mb-4 flex items-center gap-2">
                        <div className="w-8 h-px bg-gradient-to-r from-[#d4af37]/50 to-transparent" />
                        Imagem de Fundo
                    </h3>
                    <div
                        className="aspect-video bg-gradient-to-br from-[#1f1610] to-[#0f0a04] rounded-xl border-2 border-dashed border-[#3d2e1a] hover:border-[#d4af37]/50 cursor-pointer relative overflow-hidden group transition-all duration-300"
                        onClick={() => document.getElementById('bg-upload-new')?.click()}
                    >
                        {backgroundUrl ? (
                            <>
                                <img src={backgroundUrl} className="w-full h-full object-cover" alt="bg" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <span className="text-white text-xs font-medium">Alterar</span>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-[#6a5a3a] group-hover:text-[#d4af37] transition-colors">
                                <div className="w-14 h-14 rounded-full border-2 border-dashed border-current flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <ImageIcon size={24} />
                                </div>
                                <span className="text-[11px] font-medium">Clique para adicionar</span>
                                <span className="text-[9px] opacity-60 mt-1">PNG, JPG até 5MB</span>
                            </div>
                        )}
                    </div>
                    <input type="file" id="bg-upload-new" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </div>
            </div>

            {/* Zoom Footer */}
            <div className="p-4 border-t border-[#3d2e1a]/50 bg-[#0f0a04]/80">
                <div className="flex items-center justify-between bg-[#1a1108] rounded-lg p-2 border border-[#3d2e1a]/50">
                    <button
                        onClick={() => setZoom((z: number) => Math.max(0.2, z - 0.1))}
                        className="w-8 h-8 rounded-lg hover:bg-[#d4af37]/10 flex items-center justify-center text-[#8a7a5a] hover:text-[#d4af37] transition-colors"
                    >
                        <ZoomOut size={16} />
                    </button>
                    <div className="flex-1 mx-3">
                        <div className="h-1.5 bg-[#2a1f14] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#d4af37] to-[#f0d878] rounded-full transition-all"
                                style={{ width: `${Math.min(100, (zoom - 0.2) / 2.8 * 100)}%` }}
                            />
                        </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#d4af37] w-12 text-center">{Math.round(zoom * 100)}%</span>
                    <button
                        onClick={() => setZoom((z: number) => Math.min(3, z + 0.1))}
                        className="w-8 h-8 rounded-lg hover:bg-[#d4af37]/10 flex items-center justify-center text-[#8a7a5a] hover:text-[#d4af37] transition-colors"
                    >
                        <ZoomIn size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
};
