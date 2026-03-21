import React, { useState, useEffect } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Plus, Trash2, Edit3, Image as ImageIcon, Star, Zap, Crown, Diamond, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

const rarities = [
  { value: 'COMMON', label: 'Comum', icon: <Star size={14} />, color: '#9ca3af' },
  { value: 'RARE', label: 'Raro', icon: <Zap size={14} />, color: '#60a5fa' },
  { value: 'EPIC', label: 'Épico', icon: <Crown size={14} />, color: '#a78bfa' },
  { value: 'LEGENDARY', label: 'Lendário', icon: <Diamond size={14} />, color: '#d4af37' }
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cardsRes, worksRes] = await Promise.all([
                    api.get(`/collectibles?tenantId=${tenantId}`),
                    api.get(`/works?tenantId=${tenantId}&limit=1000`)
                ]);
                setCards(cardsRes.data);
                setWorks(worksRes.data.data || worksRes.data);
            } catch (err) {
                toast.error("Erro ao carregar dados");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [tenantId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/collectibles', { ...formData, tenantId });
            setCards([res.data, ...cards]);
            setShowForm(false);
            setFormData({ title: '', description: '', imageUrl: '', rarity: 'COMMON', workId: '', totalMinted: 100, xpReward: 50 });
            toast.success("Card criado com sucesso!");
        } catch (err) {
            toast.error("Erro ao criar card");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Deseja excluir este card?")) return;
        try {
            await api.delete(`/collectibles/${id}`);
            setCards(cards.filter(c => c.id !== id));
            toast.success("Card removido");
        } catch (err) {
            toast.error("Erro ao excluir");
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-gold" /></div>;

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Gestão do Grimório</h1>
                    <p className="text-slate-400 mt-2">Crie cards colecionáveis para suas obras e engaje seus visitantes.</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="h-12 px-6 rounded-xl bg-gold text-bg font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform"
                >
                    {showForm ? "Cancelar" : <><Plus size={16} /> Novo Card</>}
                </button>
            </header>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-8 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4">
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Título do Card</span>
                            <input 
                                type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                                className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl p-4 text-white" 
                                placeholder="Ex: A Noite Estrelada" required
                            />
                        </label>
                        <label className="block">
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Descrição (Opcional)</span>
                            <textarea 
                                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                                className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl p-4 text-white h-24"
                                placeholder="Uma breve história ou detalhe curioso..."
                            />
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="block">
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Limite de Emissão</span>
                                <input 
                                    type="number" value={formData.totalMinted} onChange={e => setFormData({...formData, totalMinted: parseInt(e.target.value)})}
                                    className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl p-4 text-white" 
                                />
                            </label>
                            <label className="block">
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Recompensa XP</span>
                                <input 
                                    type="number" value={formData.xpReward} onChange={e => setFormData({...formData, xpReward: parseInt(e.target.value)})}
                                    className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl p-4 text-white" 
                                />
                            </label>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Vincular a Obra</span>
                            <select 
                                value={formData.workId} onChange={e => setFormData({...formData, workId: e.target.value})}
                                className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl p-4 text-white"
                            >
                                <option value="">Nenhuma (Card Genérico)</option>
                                {works.map(w => (
                                    <option key={w.id} value={w.id}>{w.title}</option>
                                ))}
                            </select>
                        </label>
                        <label className="block">
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Raridade</span>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {rarities.map(r => (
                                    <button 
                                        key={r.value} type="button"
                                        onClick={() => setFormData({...formData, rarity: r.value})}
                                        className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${formData.rarity === r.value ? 'bg-white text-black border-white' : 'bg-white/5 text-slate-400 border-white/10'}`}
                                    >
                                        {r.icon} {r.label}
                                    </button>
                                ))}
                            </div>
                        </label>
                        <label className="block">
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Imagem de Fundo (Opcional)</span>
                            <input 
                                type="text" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                                className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl p-4 text-white" 
                                placeholder="URL da imagem (padrão: imagem da obra)"
                            />
                        </label>
                        <button type="submit" className="w-full mt-4 h-14 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-gold transition-colors">
                            Criar Card no Sistema
                        </button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map(card => {
                    const r = rarities.find(ra => ra.value === card.rarity) || rarities[0];
                    return (
                        <div key={card.id} className="group bg-white/5 border border-white/10 p-6 rounded-[32px] hover:border-white/30 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-16 h-20 rounded-xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center">
                                    {(card.imageUrl || card.work?.imageUrl) ? (
                                        <img src={card.imageUrl || card.work?.imageUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="text-white/20" size={24} />
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleDelete(card.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-white font-bold text-lg mb-1">{card.title}</h3>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-white/10" style={{ color: r.color }}>
                                    {r.label}
                                </span>
                                <span className="text-[9px] font-black text-slate-500 uppercase">
                                    {card._count.owners} Proprietários
                                </span>
                            </div>
                            <p className="text-slate-500 text-xs line-clamp-2 mb-4">
                                {card.description || "Sem descrição adicional."}
                            </p>
                            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                <span className="text-[10px] font-black text-gold">+{card.xpReward} XP</span>
                                <span className="text-[10px] font-black text-slate-500 uppercase">Edição de {card.totalMinted}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
