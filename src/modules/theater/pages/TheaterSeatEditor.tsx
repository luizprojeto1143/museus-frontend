import React, { useState, useEffect } from "react";
import { 
    Layout, Plus, Save, Trash2, Layers, 
    MousePointer2, Grid, Accessibility, Star, 
    Copy, Move, RefreshCw, Sparkles, Info
} from "lucide-react";
import { motion } from "framer-motion";
import { Button, Input } from "../../../components/ui";
import { toast } from "react-hot-toast";

import { spacesApi } from "../../../api/spaces";

export const TheaterSeatEditor: React.FC = () => {
    const [spaces, setSpaces] = useState<any[]>([]);
    const [selectedSpaceId, setSelectedSpaceId] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [rows, setRows] = useState<any[]>([]);

    useEffect(() => {
        const fetchSpaces = async () => {
            setLoading(true);
            try {
                const res = await spacesApi.list();
                setSpaces(res.data);
            } catch (err: unknown) {
                toast.error("Erro ao carregar espaços");
            } finally {
                setLoading(false);
            }
        };
        fetchSpaces();
    }, []);

    const handleSelectSpace = async (id: string) => {
        setSelectedSpaceId(id);
        if (!id) {
            setRows([]);
            return;
        }
        setLoading(true);
        try {
            const res = await spacesApi.get(id);
            if (res.data.theaterLayout) {
                setRows(res.data.theaterLayout.rows || []);
            } else {
                setRows([]);
            }
        } catch (err: unknown) {
            toast.error("Erro ao carregar layout");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedSpaceId) {
            toast.error("Selecione um espaço primeiro");
            return;
        }
        setSaving(true);
        try {
            // Fetch existing space to get all required fields (since update is PUT and requires full body or I should use PATCH)
            // Actually, my PUT in spaces.ts requires full body because of validation.
            const existingRes = await spacesApi.get(selectedSpaceId);
            const updateData = {
                ...existingRes.data,
                theaterLayout: { rows }
            };
            await spacesApi.update(selectedSpaceId, updateData);
            toast.success("Layout salvo com sucesso!");
        } catch (err: unknown) {
            toast.error("Erro ao salvar layout");
        } finally {
            setSaving(false);
        }
    };

    const addRow = () => {
        const nextLetter = String.fromCharCode(65 + rows.length);
        setRows([...rows, { id: nextLetter, seats: 10, type: "STANDARD" }]);
        toast.success(`Fileira ${nextLetter} adicionada`);
    };

    const removeRow = (id: string) => {
        setRows(rows.filter(r => r.id !== id));
    };

    const updateRowSeats = (id: string, seats: number) => {
        setRows(rows.map(r => r.id === id ? { ...r, seats: Math.max(1, seats) } : r));
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 px-4">
            {/* ═══ EDITOR HEADER ═══════════ */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <span className="text-red-500 font-black text-[10px] uppercase tracking-[0.4em] mb-2 block italic">Architect & Layout Builder</span>
                    <h1 className="text-5xl font-black text-white tracking-tighter italic">Arquiteto de Sala</h1>
                    <p className="text-slate-500 font-medium mt-2">Modele seu espaço cultural, defina zonas e precificação dinâmica.</p>
                </div>
                <div className="flex gap-4">
                    <select 
                        value={selectedSpaceId}
                        onChange={(e) => handleSelectSpace(e.target.value)}
                        className="h-16 px-6 rounded-[32px] bg-white/5 border border-white/10 text-white font-bold outline-none focus:border-red-500/50 transition-all appearance-none cursor-pointer hover:bg-white/10"
                    >
                        <option value="" className="bg-slate-900">Selecione um Espaço</option>
                        {spaces.map(s => (
                            <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>
                        ))}
                    </select>
                    <Button 
                        onClick={handleSave}
                        disabled={saving || !selectedSpaceId}
                        className="bg-red-600 hover:bg-red-700 text-white px-10 py-7 rounded-[32px] font-black italic shadow-2xl shadow-red-600/20 flex items-center gap-3"
                        isLoading={saving}
                    >
                        <Save size={20} /> Salvar Layout
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* ═══ CONTROLS SIDEBAR ═════════ */}
                <div className="space-y-6">
                    <div className="premium-glass p-8 rounded-[40px] border-white/5 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-white italic">Ferramentas</h3>
                            <Layers size={18} className="text-slate-500" />
                        </div>
                        
                        <div className="space-y-4">
                            <Button onClick={addRow} variant="secondary" className="w-full justify-start gap-3 py-6 rounded-2xl">
                                <Plus size={18} /> Adicionar Fileira
                            </Button>
                            <Button variant="secondary" className="w-full justify-start gap-3 py-6 rounded-2xl opacity-50 cursor-not-allowed">
                                <Accessibility size={18} /> Zona Acessível
                            </Button>
                            <Button variant="secondary" className="w-full justify-start gap-3 py-6 rounded-2xl opacity-50 cursor-not-allowed">
                                <Star size={18} /> Área VIP
                            </Button>
                        </div>

                        <div className="pt-6 border-t border-white/5">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Precificação Automática (IA)</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                                    <span className="text-xs font-bold text-white">VIP</span>
                                    <span className="text-emerald-400 font-black">R$ 150</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                                    <span className="text-xs font-bold text-white">Padrão</span>
                                    <span className="text-emerald-400 font-black">R$ 80</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="premium-glass p-8 rounded-[40px] border-blue-500/20 bg-blue-500/5">
                         <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-widest mb-3">
                            <Sparkles size={14} /> Sugestão do Arquiteto
                         </div>
                         <p className="text-[11px] text-slate-400 leading-relaxed">
                            "Para espetáculos intimistas, recomendo um layout em <strong>Arena</strong>. Posso converter as fileiras atuais automaticamente para você."
                         </p>
                    </div>
                </div>

                {/* ═══ CANVAS ═════════ */}
                <div className="lg:col-span-3 premium-glass p-12 rounded-[48px] border-white/5 min-h-[600px] flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8">
                        <div className="flex gap-2">
                            <button className="p-3 rounded-xl bg-white/5 text-white/50 hover:bg-white hover:text-black transition-all"><MousePointer2 size={20} /></button>
                            <button className="p-3 rounded-xl bg-white text-black transition-all shadow-xl"><Grid size={20} /></button>
                        </div>
                    </div>

                    {/* STAGE VISUALIZER */}
                    <div className="w-full h-12 bg-gradient-to-b from-slate-700/50 to-transparent rounded-full mb-20 flex items-center justify-center border-t border-white/10">
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-[2em] ml-[2em]">PALCO PRINCIPAL</span>
                    </div>

                    {/* SEATS GRID */}
                    <div className="flex-1 space-y-8 flex flex-col items-center">
                        {rows.map((row, rIdx) => (
                            <motion.div 
                                key={row.id} 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: rIdx * 0.1 }}
                                className="flex items-center gap-6 group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white font-black border border-white/10">
                                    {row.id}
                                </div>
                                
                                <div className="flex gap-2">
                                    {Array.from({ length: row.seats }).map((_, sIdx) => (
                                        <div 
                                            key={sIdx} 
                                            className={`
                                                w-8 h-8 rounded-lg border flex items-center justify-center text-[9px] font-black
                                                ${row.type === 'VIP' ? 'bg-gold-500/20 border-gold-500/40 text-gold-500' : 'bg-white/5 border-white/10 text-slate-600'}
                                            `}
                                        >
                                            {sIdx + 1}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex items-center bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                                        <button 
                                            onClick={() => updateRowSeats(row.id, row.seats - 1)}
                                            className="p-2 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                                        >-</button>
                                        <span className="px-3 text-[10px] font-black text-white">{row.seats}</span>
                                        <button 
                                            onClick={() => updateRowSeats(row.id, row.seats + 1)}
                                            className="p-2 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                                        >+</button>
                                    </div>
                                    <button onClick={() => removeRow(row.id)} className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                                </div>
                            </motion.div>
                        ))}

                        <button 
                            onClick={addRow}
                            className="w-full max-w-sm py-4 border-2 border-dashed border-white/10 rounded-[32px] text-slate-600 font-black text-[10px] uppercase tracking-widest hover:border-red-500/30 hover:text-red-500 transition-all flex items-center justify-center gap-3 mt-8"
                        >
                            <Plus size={16} /> Adicionar Nova Camada
                        </button>
                    </div>

                    {/* INFOBAR */}
                    <div className="mt-20 pt-8 border-t border-white/5 flex justify-between items-center text-slate-500">
                        <div className="flex gap-8">
                            <div className="flex items-center gap-2"><Info size={14} /> Total: {rows.reduce((acc, r) => acc + r.seats, 0)} Assentos</div>
                            <div className="flex items-center gap-2"><Layout size={14} /> Capacidade: 520 Pessoas</div>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest italic">Draft v1.4 • Ultima alteração hoje às 14:05</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
