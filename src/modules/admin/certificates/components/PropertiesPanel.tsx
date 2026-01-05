import React from 'react';
import { useCertificate } from '../context/CertificateContext';
import {
    Trash, Copy, ArrowUp, ArrowDown, Type, AlignLeft, AlignCenter, AlignRight,
    Settings, Layers
} from 'lucide-react';

export const PropertiesPanel: React.FC = () => {
    const {
        selectedIds, elements, updateElement, deleteSelected, duplicateSelected,
        bringToFront, sendToBack
    } = useCertificate();

    if (selectedIds.length === 0) {
        return (
            <aside className="w-72 bg-[var(--bg-elevated)] border-l border-[var(--border-subtle)] flex flex-col z-20 shadow-xl shrink-0 h-full p-4">
                <div className="flex flex-col items-center justify-center h-full text-[var(--fg-muted)] opacity-50 text-center">
                    <Settings size={48} className="mb-4" />
                    <h3 className="text-sm font-medium">Nenhum elemento selecionado</h3>
                    <p className="text-xs mt-2 max-w-[200px]">Clique em um elemento para editar suas propriedades.</p>
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
        <aside className="w-72 bg-[var(--bg-elevated)] border-l border-[var(--border-subtle)] flex flex-col z-20 shadow-xl shrink-0 h-full">
            <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated-soft)] flex justify-between items-center">
                <h2 className="text-sm font-bold text-[var(--accent-gold)] uppercase tracking-wider flex items-center gap-2">
                    <Settings size={16} /> Propriedades
                </h2>
                <span className="text-[10px] bg-[var(--bg-elevated)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                    {isMulti ? `${selectedIds.length} selecionados` : selectedElement?.type}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
                {/* GLOBAL ACTIONS */}
                <div className="flex items-center gap-2 p-2 bg-[var(--bg-elevated-soft)] rounded border border-[var(--border-subtle)]">
                    <button onClick={duplicateSelected} className="flex-1 p-2 hover:bg-[var(--bg-elevated)] rounded transition-colors text-[var(--fg-main)]" title="Duplicar">
                        <Copy size={16} className="mx-auto" />
                    </button>
                    <div className="w-px h-6 bg-[var(--border-subtle)]" />
                    <button onClick={bringToFront} className="flex-1 p-2 hover:bg-[var(--bg-elevated)] rounded transition-colors text-[var(--fg-main)]" title="Trazer p/ Frente">
                        <ArrowUp size={16} className="mx-auto" />
                    </button>
                    <button onClick={sendToBack} className="flex-1 p-2 hover:bg-[var(--bg-elevated)] rounded transition-colors text-[var(--fg-main)]" title="Enviar p/ Trás">
                        <ArrowDown size={16} className="mx-auto" />
                    </button>
                    <div className="w-px h-6 bg-[var(--border-subtle)]" />
                    <button onClick={deleteSelected} className="flex-1 p-2 hover:bg-red-900/20 text-red-500 rounded transition-colors" title="Excluir">
                        <Trash size={16} className="mx-auto" />
                    </button>
                </div>

                {/* TEXT PROPERTIES */}
                {!isMulti && (selectedElement?.type === 'text' || selectedElement?.type === 'variable') && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-[var(--fg-muted)] uppercase mb-2 block">Conteúdo</label>
                            <textarea
                                value={selectedElement.text}
                                onChange={e => handleUpdate({ text: e.target.value })}
                                rows={3}
                                className="input w-full text-sm"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-[var(--fg-muted)] uppercase mb-2 block">Tipografia</label>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <select
                                    value={selectedElement.fontFamily}
                                    onChange={e => handleUpdate({ fontFamily: e.target.value })}
                                    className="input text-xs"
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
                                        className="input text-xs pl-8"
                                    />
                                    <Type size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]" />
                                </div>
                            </div>

                            {/* Colors & Align */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="color"
                                        value={selectedElement.color}
                                        onChange={e => handleUpdate({ color: e.target.value })}
                                        className="w-full h-8 rounded cursor-pointer border border-[var(--border-subtle)]"
                                    />
                                </div>
                                <div className="flex bg-[var(--bg-elevated-soft)] rounded border border-[var(--border-subtle)] p-0.5">
                                    {[
                                        { v: 'left', i: AlignLeft },
                                        { v: 'center', i: AlignCenter },
                                        { v: 'right', i: AlignRight }
                                    ].map(o => (
                                        <button
                                            key={o.v}
                                            onClick={() => handleUpdate({ align: o.v })}
                                            className={`p-1.5 rounded ${selectedElement.align === o.v ? 'bg-[var(--accent-gold)] text-black' : 'text-[var(--fg-muted)]'}`}
                                        >
                                            <o.i size={16} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* DIMENSIONS (Read Only mostly, or allow manual edit) */}
                {!isMulti && (
                    <div className="pt-4 border-t border-[var(--border-subtle)]">
                        <label className="text-xs font-bold text-[var(--fg-muted)] uppercase mb-2 block">Transformação</label>
                        <div className="grid grid-cols-2 gap-2 text-xs text-[var(--fg-muted)]">
                            <div className="flex justify-between bg-[var(--bg-elevated-soft)] p-2 rounded">
                                <span>X:</span> <span className="text-[var(--fg-main)] font-mono">{Math.round(selectedElement?.x || 0)}</span>
                            </div>
                            <div className="flex justify-between bg-[var(--bg-elevated-soft)] p-2 rounded">
                                <span>Y:</span> <span className="text-[var(--fg-main)] font-mono">{Math.round(selectedElement?.y || 0)}</span>
                            </div>
                            <div className="flex justify-between bg-[var(--bg-elevated-soft)] p-2 rounded">
                                <span>W:</span> <span className="text-[var(--fg-main)] font-mono">{Math.round(selectedElement?.width || 0)}</span>
                            </div>
                            <div className="flex justify-between bg-[var(--bg-elevated-soft)] p-2 rounded">
                                <span>H:</span> <span className="text-[var(--fg-main)] font-mono">{Math.round(selectedElement?.height || 0)}</span>
                            </div>
                            <div className="flex justify-between bg-[var(--bg-elevated-soft)] p-2 rounded col-span-2">
                                <span>Rotação:</span> <span className="text-[var(--fg-main)] font-mono">{Math.round(selectedElement?.rotate || 0)}°</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};
