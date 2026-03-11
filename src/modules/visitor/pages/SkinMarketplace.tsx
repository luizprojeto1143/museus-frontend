import React, { useState, useEffect } from "react";
import { api } from "../../../api/client";
import { Gem, Star, Lock, Info, CheckCircle2, ShoppingCart } from "lucide-react";
import { Button } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import { motion } from "framer-motion";

interface Skin {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    xpCost: number;
    rarity: string;
    owned: boolean;
    equipped: boolean;
}

export const SkinMarketplace: React.FC = () => {
    const { addToast } = useToast();
    const [skins, setSkins] = useState<Skin[]>([]);
    const [visitorXp, setVisitorXp] = useState(0);
    const [loading, setLoading] = useState(true);
    const [buyingId, setBuyingId] = useState<string | null>(null);

    // Mock visitor ID - would normally come from auth context
    const visitorId = localStorage.getItem("visitor_id") || "";

    useEffect(() => {
        const loadMarketplace = async () => {
            try {
                const [skinsRes, visitorRes] = await Promise.all([
                    api.get(`/marketplace?visitorId=${visitorId}`),
                    api.get(`/visitors/${visitorId}`)
                ]);
                setSkins(skinsRes.data);
                setVisitorXp(visitorRes.data.xp);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if(visitorId) loadMarketplace();
    }, [visitorId]);

    const handleBuy = async (skin: Skin) => {
        if (visitorXp < skin.xpCost) {
            addToast("XP insuficiente!", "error");
            return;
        }

        setBuyingId(skin.id);
        try {
            const res = await api.post(`/marketplace/${skin.id}/buy`, { visitorId });
            addToast("Skin desbloqueada!", "success");
            setVisitorXp(res.data.newXpBalance);
            setSkins(prev => prev.map(s => s.id === skin.id ? { ...s, owned: true } : s));
        } catch (err) {
            addToast("Erro na compra", "error");
        } finally {
            setBuyingId(null);
        }
    };

    const getRarityLabel = (rarity: string) => {
        switch(rarity) {
            case "COMMON": return { text: "Comum", color: "bg-slate-500/20 text-slate-400" };
            case "RARE": return { text: "Raro", color: "bg-blue-500/20 text-blue-400" };
            case "EPIC": return { text: "Épico", color: "bg-purple-500/20 text-purple-400" };
            case "LEGENDARY": return { text: "Lendário", color: "bg-yellow-500/20 text-yellow-400" };
            case "EXCLUSIVE": return { text: "Exclusivo", color: "bg-green-500/20 text-green-400" };
            default: return { text: "Comum", color: "bg-slate-500/20 text-slate-400" };
        }
    };

    const getRarityStyle = (rarity: string) => {
        switch(rarity) {
            case "COMMON": return "border-white/5 bg-white/5";
            case "RARE": return "border-blue-500/30 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]";
            case "EPIC": return "border-purple-500/30 bg-purple-500/5 shadow-[0_0_25px_rgba(168,85,247,0.1)]";
            case "LEGENDARY": return "border-yellow-500/40 bg-yellow-500/5 shadow-[0_0_35px_rgba(234,179,8,0.15)] ring-1 ring-yellow-500/20";
            case "EXCLUSIVE": return "border-green-500/30 bg-green-500/5 shadow-[0_0_20px_rgba(34,197,94,0.1)]";
            default: return "border-white/5 bg-white/5";
        }
    };

    return (
        <div className="p-6 pb-24 max-w-5xl mx-auto">
            <header className="mb-12 flex flex-col gap-4 sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md py-4 -mx-6 px-6 border-b border-white/5">
                <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-black text-white flex items-center gap-3">
                            <ShoppingCart className="text-yellow-500" size={32} /> Marketplace
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">Troque seu XP por itens lendários</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 px-6 py-3 rounded-2xl border border-yellow-500/30 flex items-center gap-3 shadow-lg shadow-yellow-500/5">
                        <div className="bg-yellow-500 rounded-full p-1.5 shadow-inner">
                            <Star className="text-white fill-white" size={16} />
                        </div>
                        <span className="font-black text-yellow-500 text-xl tracking-tighter">{visitorXp.toLocaleString()} <small className="text-[10px] opacity-70">XP</small></span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {skins.map((skin) => {
                    const r = getRarityLabel(skin.rarity);
                    const style = getRarityStyle(skin.rarity);
                    return (
                        <motion.div
                            key={skin.id}
                            layout
                            whileHover={{ y: -8, scale: 1.02 }}
                            className={`rounded-[32px] border transition-all duration-500 flex flex-col group relative overflow-hidden ${style}`}
                        >
                            {/* RAINBOW GLOW FOR LEGENDARY */}
                            {skin.rarity === "LEGENDARY" && (
                                <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 via-orange-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
                            )}

                            <div className="aspect-[4/5] bg-slate-900/50 flex items-center justify-center p-8 relative">
                                <img src={skin.imageUrl} className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] group-hover:drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)] transition-all duration-500 group-hover:scale-110" alt={skin.name} />
                                
                                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 ${r.color}`}>
                                    {r.text}
                                </div>

                                {skin.owned && (
                                     <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center backdrop-blur-[4px]">
                                         <div className="bg-green-500 rounded-full p-2.5 shadow-xl shadow-green-500/40 border-2 border-white/20">
                                            <CheckCircle2 className="text-white" size={24} />
                                         </div>
                                     </div>
                                )}
                            </div>
                            
                            <div className="p-5 flex flex-col flex-1 relative z-10">
                                <h3 className="text-white font-black text-lg leading-none mb-2 group-hover:text-yellow-500 transition-colors">{skin.name}</h3>
                                <p className="text-slate-500 text-xs font-medium line-clamp-2 mb-6 leading-relaxed opacity-80">{skin.description}</p>
                                
                                <div className="mt-auto">
                                    {skin.owned ? (
                                        <div className="w-full py-3 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest border border-white/5 rounded-2xl bg-white/5">
                                            Disponível no Guarda-Roupa
                                        </div>
                                    ) : (
                                        <button 
                                            className={`w-full h-14 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale ${
                                                visitorXp >= skin.xpCost 
                                                ? "bg-white text-slate-950 hover:bg-yellow-500 hover:text-white shadow-xl shadow-white/5" 
                                                : "bg-white/5 text-slate-600 cursor-not-allowed border border-white/5"
                                            }`}
                                            onClick={() => handleBuy(skin)}
                                            disabled={buyingId === skin.id || visitorXp < skin.xpCost}
                                        >
                                            {buyingId === skin.id ? (
                                                <div className="w-5 h-5 border-2 border-slate-950/20 border-t-slate-950 animate-spin rounded-full" />
                                            ) : (
                                                <>
                                                    <span className="font-black text-lg tracking-tighter">{skin.xpCost.toLocaleString()}</span>
                                                    <Star size={18} fill="currentColor" className={visitorXp >= skin.xpCost ? "text-yellow-500" : "text-slate-600"} />
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
