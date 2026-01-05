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

    if (selectedIds.length === 0) {
        return (
            <aside className="w-72 bg-gradient-to-b from-[#1a1108] to-[#0f0a04] border-l border-[#3d2e1a]/50 flex flex-col z-20 shrink-0 h-full shadow-2xl">
                <div className="flex flex-col items-center justify-center h-full text-[#6a5a3a] text-center px-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#d4af37]/10 to-transparent flex items-center justify-center mb-6">
                        <Settings size={36} className="text-[#d4af37]/40" />
                    </div>
                    <h3 className="text-sm font-semibold text-[#a89060]">Nenhum elemento selecionado</h3>
                    <p className="text-[11px] mt-3 leading-relaxed opacity-70">
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

    const ActionButton: React.FC<{ onClick: () => void; icon: any; label: string; danger?: boolean }> =
        ({ onClick, icon: Icon, label, danger }) => (
            <button
                onClick={onClick}
                className={`flex-1 p-3 rounded-lg flex flex-col items-center gap-1.5 transition-all duration-200 ${danger
                        ? 'hover:bg-red-900/20 text-red-400 hover:text-red-300'
                        : 'hover:bg-[#d4af37]/10 text-[#8a7a5a] hover:text-[#d4af37]'
                    }`}
                title={label}
            >
                <Icon size={18} />
                <span className="text-[9px] font-medium uppercase tracking-wider">{label}</span>
            </button>
        );

    return (
        <aside className="w-72 bg-gradient-to-b from-[#1a1108] to-[#0f0a04] border-l border-[#3d2e1a]/50 flex flex-col z-20 shrink-0 h-full shadow-2xl">
            {/* Header */}
            <div className="p-5 border-b border-[#3d2e1a]/50 bg-gradient-to-r from-[#d4af37]/10 to-transparent">
                <div className="flex justify-between items-center">
                    <h2 className="text-sm font-bold text-[#d4af37] uppercase tracking-widest flex items-center gap-2">
                        <Settings size={18} className="opacity-80" />
                        Propriedades
                    </h2>
                    <span className="text-[10px] bg-[#d4af37]/20 text-[#d4af37] px-3 py-1 rounded-full font-semibold uppercase tracking-wide">
                        {isMulti ? `${selectedIds.length} itens` : selectedElement?.type}
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6">
                {/* Actions */}
                <div className="bg-[#1f1610] rounded-xl border border-[#3d2e1a]/50 p-2 grid grid-cols-4 gap-1">
                    <ActionButton onClick={duplicateSelected} icon={Copy} label="Copiar" />
                    <ActionButton onClick={bringToFront} icon={ArrowUp} label="Frente" />
                    <ActionButton onClick={sendToBack} icon={ArrowDown} label="Trás" />
                    <ActionButton onClick={deleteSelected} icon={Trash} label="Excluir" danger />
                </div>

                {/* Text Properties */}
                {!isMulti && (selectedElement?.type === 'text' || selectedElement?.type === 'variable') && (
                    <div className="space-y-5">
                        {/* Content */}
                        <div>
                            <label className="text-[11px] font-bold text-[#a89060] uppercase tracking-wider mb-3 flex items-center gap-2">
                                <div className="w-6 h-px bg-gradient-to-r from-[#d4af37]/50 to-transparent" />
                                Conteúdo
                            </label>
                            <textarea
                                value={selectedElement.text}
                                onChange={e => handleUpdate({ text: e.target.value })}
                                rows={3}
                                className="w-full bg-[#1f1610] border border-[#3d2e1a] rounded-xl px-4 py-3 text-sm text-[#e8dcc8] placeholder-[#6a5a3a] focus:border-[#d4af37]/50 focus:ring-2 focus:ring-[#d4af37]/20 outline-none transition-all resize-none"
                                placeholder="Digite o texto..."
                            />
                        </div>

                        {/* Typography */}
                        <div>
                            <label className="text-[11px] font-bold text-[#a89060] uppercase tracking-wider mb-3 flex items-center gap-2">
                                <div className="w-6 h-px bg-gradient-to-r from-[#d4af37]/50 to-transparent" />
                                Tipografia
                            </label>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <select
                                    value={selectedElement.fontFamily}
                                    onChange={e => handleUpdate({ fontFamily: e.target.value })}
                                    className="bg-[#1f1610] border border-[#3d2e1a] rounded-lg px-3 py-2.5 text-xs text-[#e8dcc8] focus:border-[#d4af37]/50 outline-none"
                                >
                                    <option value="Helvetica">Helvetica</option>
                                    <option value="Times New Roman">Times</option>
                                    <option value="Courier New">Courier</option>
                                    <option value="Georgia">Georgia</option>
                                </select>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={selectedElement.fontSize}
                                        onChange={e => handleUpdate({ fontSize: Number(e.target.value) })}
                                        className="w-full bg-[#1f1610] border border-[#3d2e1a] rounded-lg px-3 py-2.5 pl-9 text-xs text-[#e8dcc8] focus:border-[#d4af37]/50 outline-none"
                                    />
                                    <Type size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6a5a3a]" />
                                </div>
                            </div>

                            {/* Colors & Align */}
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <div className="flex items-center gap-2 bg-[#1f1610] border border-[#3d2e1a] rounded-lg p-2">
                                        <Palette size={14} className="text-[#6a5a3a]" />
                                        <input
                                            type="color"
                                            value={selectedElement.color}
                                            onChange={e => handleUpdate({ color: e.target.value })}
                                            className="w-full h-6 rounded cursor-pointer bg-transparent border-0"
                                        />
                                    </div>
                                </div>
                                <div className="flex bg-[#1f1610] rounded-lg border border-[#3d2e1a] p-1">
                                    {[
                                        { v: 'left', i: AlignLeft },
                                        { v: 'center', i: AlignCenter },
                                        { v: 'right', i: AlignRight }
                                    ].map(o => (
                                        <button
                                            key={o.v}
                                            onClick={() => handleUpdate({ align: o.v })}
                                            className={`p-2 rounded-md transition-all ${selectedElement.align === o.v
                                                    ? 'bg-gradient-to-br from-[#d4af37] to-[#c4a030] text-[#1a1108] shadow-md'
                                                    : 'text-[#6a5a3a] hover:text-[#d4af37]'
                                                }`}
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
                        <label className="text-[11px] font-bold text-[#a89060] uppercase tracking-wider mb-3 flex items-center gap-2">
                            <div className="w-6 h-px bg-gradient-to-r from-[#d4af37]/50 to-transparent" />
                            Transformação
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: 'X', value: selectedElement.x, icon: Move },
                                { label: 'Y', value: selectedElement.y, icon: Move },
                                { label: 'W', value: selectedElement.width, icon: Maximize2 },
                                { label: 'H', value: selectedElement.height, icon: Maximize2 },
                            ].map(item => (
                                <div key={item.label} className="bg-[#1f1610] border border-[#3d2e1a]/50 rounded-lg p-3 flex items-center gap-2">
                                    <span className="text-[10px] text-[#6a5a3a] font-bold w-3">{item.label}</span>
                                    <span className="flex-1 text-right text-xs font-mono text-[#d4af37]">{Math.round(item.value || 0)}</span>
                                </div>
                            ))}
                            <div className="col-span-2 bg-[#1f1610] border border-[#3d2e1a]/50 rounded-lg p-3 flex items-center gap-3">
                                <RotateCw size={14} className="text-[#6a5a3a]" />
                                <span className="text-[10px] text-[#6a5a3a] font-bold">Rotação</span>
                                <span className="flex-1 text-right text-xs font-mono text-[#d4af37]">{Math.round(selectedElement.rotate || 0)}°</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};
