import React, { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { 
    Plus, 
    Trash2, 
    Edit3, 
    Image as ImageIcon, 
    Star, 
    Zap, 
    Crown, 
    Diamond, 
    Loader2,
    Layers,
    ArrowUpRight,
    Globe,
    ShieldCheck,
    Briefcase,
    Search,
    X,
    Sparkles,
    Database,
    Palette,
    Coins,
    Gem,
    Workflow,
    Fingerprint,
    ShieldAlert,
    Box,
    Terminal,
    Code,
    Cpu,
    ZapOff,
    RefreshCw,
    SearchCheck,
    Lock
} from "lucide-react";
import { 
    Button, 
    Input, 
    Select, 
    Textarea, 
    Card, 
    Badge, 
    AnimateIn,
    AnimatedCounter
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { getFullUrl } from "../../../utils/url";

const rarities = [
  { value: 'COMMON', label: 'Comum', icon: <Star size={14} />, color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20', shadow: 'shadow-slate-400/5', glow: 'rgba(148, 163, 184, 0.1)' },
  { value: 'RARE', label: 'Raro', icon: <Zap size={14} />, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', shadow: 'shadow-blue-400/5', glow: 'rgba(96, 165, 250, 0.1)' },
  { value: 'EPIC', label: 'Épico', icon: <Crown size={14} />, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', shadow: 'shadow-purple-400/5', glow: 'rgba(192, 132, 252, 0.1)' },
  { value: 'LEGENDARY', label: 'Lendário', icon: <Diamond size={14} />, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', shadow: 'shadow-amber-500/10', glow: 'rgba(245, 158, 11, 0.2)' }
];

export const MasterCardManager: React.FC = () => {
    const { tenantId } = useAuth();
    const [cards, setCards] = useState<any[]>([]);
    const [works, setWorks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        imageUrl: '',
        rarity: 'COMMON',
        workId: '',
        totalMinted: 100,
        xpReward: 50
    });

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [cardsRes, worksRes] = await Promise.all([
                api.get(`/collectibles?tenantId=${tenantId}`),
                api.get(`/works?tenantId=${tenantId}&limit=1000`)
            ]);
            setCards(cardsRes.data || []);
            setWorks(worksRes.data.data || worksRes.data || []);
        } catch (err: any) {
            toast.error("Erro ao sincronizar grimório de ativos.");
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/collectibles', { ...formData, tenantId });
            setCards([res.data, ...cards]);
            setShowForm(false);
            setFormData({ title: '', description: '', imageUrl: '', rarity: 'COMMON', workId: '', totalMinted: 100, xpReward: 50 });
            toast.success("Novo artefato forjado no grimório.");
        } catch (err: any) {
            toast.error("Falha na criação do artefato.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("PROTOCOL: Deseja expurgar este artefato do grimório? Esta ação é imutável.")) return;
        try {
            await api.delete(`/collectibles/${id}`);
            setCards(cards.filter(c => c.id !== id));
            toast.success("Artefato removido do registro histórico.");
        } catch (err: any) {
            toast.error("Falha na remoção do ativo.");
        }
    };

    if (loading && cards.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-[0.3em] text-[10px] italic">Acessando Grimório de Ativos...</p>
        </div>
    );

    return (
        <AnimateIn className="space-y-12 pb-32">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-amber-500/10 text-amber-500 border-none px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.4em] italic">
                            Collectible Assets & Neural Rewards
                        </Badge>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic leading-none">
                        Cofre de <span className="text-amber-500">Cartões</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-xl max-w-3xl leading-relaxed">
                        Criação e gestão soberana de ativos digitais colecionáveis vinculados ao acervo físico da rede global.
                    </p>
                </div>
                
                <Button 
                    onClick={() => setShowForm(!showForm)}
                    className={`h-16 px-10 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-2xl active:scale-95 flex items-center gap-4 ${showForm ? 'bg-white/5 text-slate-400 border-2 border-white/10 hover:text-white' : 'bg-amber-600 text-white hover:bg-amber-500 shadow-amber-600/30'}`}
                >
                    {showForm ? <><X size={20} /> Abortar Forja</> : <><Plus size={20} /> Forjar Artefato</>}
                </Button>
            </div>

            {/* Creation Chamber Overlay */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                    >
                        <Card className="p-14 bg-[#0b1120]/60 border-2 border-amber-500/20 rounded-[64px] shadow-[0_0_80px_rgba(245,158,11,0.1)] grid grid-cols-1 lg:grid-cols-2 gap-16 relative overflow-hidden border-t-white/10">
                            <div className="space-y-12 relative z-10">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[24px] bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-xl">
                                        <Palette size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase leading-none">Parâmetros de Forja</h3>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mt-2 italic">Definição de Propriedades e Escassez</p>
                                    </div>
                                </div>
                                
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Título do Artefato</label>
                                        <Input 
                                            value={formData.title} 
                                            onChange={e => setFormData({...formData, title: e.target.value})}
                                            placeholder="Ex: Obra Prima em Destaque (Edição Limitada)"
                                            required
                                            className="h-16 bg-white/5 border-white/10 rounded-2xl px-8 text-white font-black italic tracking-tight uppercase"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Narrativa / Lore do Ativo</label>
                                        <Textarea 
                                            value={formData.description} 
                                            onChange={e => setFormData({...formData, description: e.target.value})}
                                            placeholder="Conte a história épica por trás deste artefato..."
                                            rows={3}
                                            className="bg-white/5 border-white/10 rounded-[32px] p-8 text-white font-medium italic leading-relaxed resize-none min-h-[140px]"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Limite de Emissão (Supply)</label>
                                            <Input 
                                                type="number" 
                                                value={formData.totalMinted} 
                                                onChange={e => setFormData({...formData, totalMinted: parseInt(e.target.value)})}
                                                className="h-16 bg-white/5 border-white/10 rounded-2xl px-8 font-black text-amber-500"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Recompensa XP Master</label>
                                            <Input 
                                                type="number" 
                                                value={formData.xpReward} 
                                                onChange={e => setFormData({...formData, xpReward: parseInt(e.target.value)})}
                                                className="h-16 bg-white/5 border-white/10 rounded-2xl px-8 font-black text-blue-400"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic">Nível de Raridade do Node</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {rarities.map(r => (
                                                <button 
                                                    key={r.value} type="button"
                                                    onClick={() => setFormData({...formData, rarity: r.value})}
                                                    className={`h-14 rounded-2xl border-2 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-500 ${formData.rarity === r.value ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-105' : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/10'}`}
                                                >
                                                    {r.icon} {r.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full h-20 rounded-[28px] bg-amber-600 text-white font-black uppercase tracking-[0.3em] text-xs hover:bg-amber-500 transition-all shadow-2xl shadow-amber-600/30 flex items-center justify-center gap-4 group">
                                        Forjar Artefato Digital <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                                    </Button>
                                </form>
                            </div>

                            <div className="space-y-12 flex flex-col items-center justify-center relative">
                                <div className="absolute top-0 left-0 flex items-center gap-4 text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] italic">
                                    <ArrowUpRight size={20} className="text-blue-500" /> Live Preview: Neural Grimoire
                                </div>
                                
                                {/* Card Preview - Elite Renderer */}
                                <AnimatePresence mode="wait">
                                    {(() => {
                                        const r = rarities.find(ra => ra.value === formData.rarity) || rarities[0];
                                        const work = works.find(w => w.id === formData.workId);
                                        return (
                                            <motion.div 
                                                key={formData.rarity}
                                                initial={{ rotateY: 90, opacity: 0, scale: 0.9 }}
                                                animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                                                exit={{ rotateY: -90, opacity: 0, scale: 0.9 }}
                                                transition={{ duration: 0.6, ease: "circOut" }}
                                                className={`w-full max-w-[360px] aspect-[2/3] rounded-[64px] border-[6px] p-10 relative overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)] flex flex-col group/preview ${r.bg} ${r.border} border-t-white/20`}
                                                style={{ boxShadow: `0 0 60px ${r.glow}` }}
                                            >
                                                <div className="flex justify-between items-start mb-8 relative z-10">
                                                    <Badge variant="glass" className={`bg-white/10 border-none text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-xl italic ${r.color}`}>
                                                        {r.icon} <span className="ml-2">{r.label}</span>
                                                    </Badge>
                                                    <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-amber-500/30 border border-white/5">
                                                        <Gem size={20} />
                                                    </div>
                                                </div>
                                                <div className="aspect-square bg-slate-950 rounded-[48px] border-2 border-white/10 overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] mb-8 relative group-hover/preview:scale-[1.02] transition-transform duration-700">
                                                    <div className={`absolute inset-0 opacity-20 blur-3xl ${r.bg}`} />
                                                    {(formData.imageUrl || work?.imageUrl) ? (
                                                        <img src={getFullUrl(formData.imageUrl || work?.imageUrl)} className="w-full h-full object-cover z-10 relative" alt="" />
                                                    ) : (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/5 gap-4">
                                                            <ImageIcon size={64} />
                                                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Awaiting Asset</span>
                                                        </div>
                                                    )}
                                                    {/* Holographic Swipe */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover/preview:translate-x-full transition-transform duration-1000" />
                                                </div>
                                                <div className="space-y-3 flex-1 relative z-10">
                                                    <h3 className="text-2xl font-black text-white italic tracking-tighter leading-none group-hover/preview:text-amber-400 transition-colors">{formData.title || 'Artefato Neural'}</h3>
                                                    <p className="text-xs text-slate-500 font-medium italic line-clamp-3 leading-relaxed">
                                                        "{formData.description || 'A narrativa épica deste artefato digital aparecerá aqui após o provisionamento.'}"
                                                    </p>
                                                </div>
                                                <div className="pt-8 mt-auto border-t border-white/10 flex justify-between items-center relative z-10">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none">Global Rewards</span>
                                                        <span className="text-lg font-black text-amber-500 tracking-tighter italic leading-none">+{formData.xpReward} XP</span>
                                                    </div>
                                                    <div className="flex flex-col text-right gap-1">
                                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none">Max Emission</span>
                                                        <span className="text-lg font-black text-white tracking-tighter italic leading-none">{formData.totalMinted} <span className="text-[10px] opacity-40">ED.</span></span>
                                                    </div>
                                                </div>
                                                {/* Card Atmospheric Glow */}
                                                <div className={`absolute -right-20 -bottom-20 w-64 h-64 rounded-full blur-[100px] opacity-30 pointer-events-none ${r.bg}`} />
                                            </motion.div>
                                        );
                                    })()}
                                </AnimatePresence>
                                <div className="w-full max-w-[360px] space-y-4">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-6 italic">Âncora de Acervo Físico</label>
                                    <div className="relative group/sel">
                                        <Select 
                                            value={formData.workId} 
                                            onChange={e => setFormData({...formData, workId: e.target.value})}
                                            className="h-16 bg-white/5 border-2 border-white/10 rounded-[24px] px-8 text-white font-black italic tracking-tight appearance-none cursor-pointer hover:border-amber-500/30 transition-all"
                                        >
                                            <option value="" className="bg-slate-950">Ativo Independente (Neural Only)</option>
                                            {works.map(w => (
                                                <option key={w.id} value={w.id} className="bg-slate-950">{w.title}</option>
                                            ))}
                                        </Select>
                                        <Workflow size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none group-hover/sel:text-amber-500 transition-colors" />
                                    </div>
                                </div>
                            </div>
                            {/* Chamber Background Aura */}
                            <div className="absolute top-[-50%] right-[-10%] w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Grimoire Showcase Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                <AnimatePresence mode="popLayout">
                    {cards.map((card, idx) => {
                        const r = rarities.find(ra => ra.value === card.rarity) || rarities[0];
                        return (
                            <motion.div
                                key={card.id}
                                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 30 }}
                                transition={{ delay: idx * 0.05, ease: "circOut" }}
                            >
                                <Card className={`group/card bg-[#0b1120]/60 border-2 rounded-[56px] p-10 flex flex-col h-full hover:bg-white/[0.04] transition-all duration-700 relative overflow-hidden ${r.border} shadow-2xl border-t-white/10`}>
                                    <div className="flex justify-between items-start mb-8 relative z-10">
                                        <Badge className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] italic border-none shadow-lg ${r.bg} ${r.color}`}>
                                            {r.icon} <span className="ml-2">{r.label}</span>
                                        </Badge>
                                        <button 
                                            onClick={() => handleDelete(card.id)} 
                                            className="w-12 h-12 rounded-2xl bg-white/5 text-rose-500/30 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center opacity-0 group-hover/card:opacity-100 border-2 border-white/5 shadow-xl group/del"
                                        >
                                            <Trash2 size={20} className="group-hover/del:scale-110 transition-transform" />
                                        </button>
                                    </div>

                                    <div className="aspect-square bg-slate-950 rounded-[44px] border-2 border-white/10 overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] mb-8 relative group-hover/card:scale-105 transition-transform duration-1000">
                                        <div className={`absolute inset-0 opacity-10 blur-[40px] ${r.bg}`} />
                                        {(card.imageUrl || card.work?.imageUrl) ? (
                                            <img src={getFullUrl(card.imageUrl || card.work?.imageUrl)} className="w-full h-full object-cover z-10 relative group-hover/card:scale-110 transition-transform duration-[2s]" alt="" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-white/5">
                                                <Gem size={48} />
                                            </div>
                                        )}
                                        {/* Scan Effect on Hover */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent h-[50%] w-full -translate-y-full group-hover/card:translate-y-[200%] transition-transform duration-1500 pointer-events-none" />
                                    </div>

                                    <div className="space-y-3 flex-1 relative z-10">
                                        <h3 className="text-2xl font-black text-white italic tracking-tighter leading-none group-hover/card:text-amber-500 transition-colors uppercase">{card.title}</h3>
                                        <p className="text-xs text-slate-500 font-medium italic line-clamp-3 leading-relaxed group-hover/card:text-slate-400 transition-colors">
                                            {card.description || "Este artefato possui uma lore ainda não revelada pelo mestre curador."}
                                        </p>
                                    </div>

                                    <div className="mt-10 pt-8 border-t border-white/5 flex flex-wrap gap-6 justify-between items-center relative z-10">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic leading-none">Ownership</span>
                                            <span className="text-lg font-black text-white tracking-tighter italic uppercase leading-none">{card._count?.owners || 0} Masters</span>
                                        </div>
                                        <div className="flex flex-col text-right gap-1">
                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic leading-none">Tier Reward</span>
                                            <span className="text-lg font-black text-amber-500 tracking-tighter italic leading-none">+{card.xpReward} XP</span>
                                        </div>
                                    </div>

                                    {/* Card Ambient Glow Aura */}
                                    <div className={`absolute -right-16 -bottom-16 w-48 h-48 rounded-full blur-[80px] opacity-10 group-hover/card:opacity-30 transition-all duration-1000 pointer-events-none ${r.bg}`} />
                                </Card>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {cards.length === 0 && !loading && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full py-40 text-center opacity-30 text-slate-500 flex flex-col items-center gap-10 shadow-inner rounded-[64px] bg-white/[0.01] border-2 border-dashed border-white/5"
                    >
                        <div className="w-24 h-24 rounded-[40px] bg-white/5 flex items-center justify-center border-2 border-white/5">
                            <ZapOff size={64} className="text-slate-700" />
                        </div>
                        <div className="space-y-4">
                            <p className="text-2xl font-black uppercase tracking-[0.4em] text-slate-500 italic leading-none">Grimório Vazio</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-700 italic">Nenhum artefato foi forjado para este node regional.</p>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Asset Governance SOC Footer */}
            <div className="bg-[#0f172a]/80 p-14 rounded-[64px] border-2 border-amber-500/10 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group shadow-2xl border-t-white/10">
                <div className="flex items-center gap-10 relative z-10">
                    <div className="w-24 h-24 bg-amber-500/10 rounded-[32px] flex items-center justify-center text-amber-500 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 border border-amber-500/20 shadow-2xl relative overflow-hidden">
                        <Coins size={48} />
                        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent" />
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-white font-black text-3xl italic tracking-tighter uppercase italic leading-none">Soberania de Ativos Digitais</h4>
                        <p className="text-sm text-slate-500 font-medium max-w-2xl leading-relaxed italic mt-2">
                            O grimório centraliza a gestão de ativos gamificados da rede cultural. Cada artefato forjado possui uma assinatura única que garante sua raridade e prestígio no ecossistema MSV.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-6 relative z-10">
                    <Badge variant="glass" className="bg-amber-500/10 text-amber-500 border-none px-12 py-6 text-[12px] font-black uppercase tracking-[0.4em] italic rounded-[24px] flex items-center gap-4 shadow-2xl border border-amber-500/20">
                        <Lock size={24} /> Asset Integrity: Secured
                    </Badge>
                </div>
                <div className="absolute top-[-50%] right-[-10%] w-[800px] h-[800px] bg-amber-600/5 rounded-full blur-[200px] pointer-events-none" />
                <div className="absolute left-[-5%] bottom-[-10%] w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </AnimateIn>
    );
};
