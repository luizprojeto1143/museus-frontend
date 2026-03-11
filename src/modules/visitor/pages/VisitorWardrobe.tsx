import React, { useState, useEffect } from "react";
import { api } from "../../../api/client";
import { useTranslation } from "react-i18next";
import { User, Shield, Gem, Check, LayoutGrid } from "lucide-react";
import { Button } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

interface VisitorSkin {
    id: string;
    equipped: boolean;
    skin: {
        id: string;
        name: string;
        imageUrl: string;
        rarity: string;
    }
}

export const VisitorWardrobe: React.FC = () => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const [visitorSkins, setVisitorSkins] = useState<VisitorSkin[]>([]);
    const [loading, setLoading] = useState(true);
    const [equipping, setEquipping] = useState<string | null>(null);

    // Mock visitor ID - would normally come from auth context
    const visitorId = localStorage.getItem("visitor_id") || "";

    useEffect(() => {
        const loadSkins = async () => {
             try {
                 const res = await api.get(`/visitors/${visitorId}/skins`);
                 setVisitorSkins(res.data);
             } catch (err) {
                 console.error(err);
             } finally {
                 setLoading(false);
             }
        };
        if(visitorId) loadSkins();
    }, [visitorId]);

    const handleEquip = async (skinId: string) => {
        setEquipping(skinId);
        try {
            await api.put(`/visitors/${visitorId}/skin/equip`, { skinId });
            addToast("Visual atualizado!", "success");
            // Refresh local state to show new equipped skin
            setVisitorSkins(prev => prev.map(vs => ({
                ...vs,
                equipped: vs.skin.id === skinId
            })));
        } catch (err) {
            addToast("Erro ao equipar", "error");
        } finally {
            setEquipping(null);
        }
    };

    const equippedSkin = visitorSkins.find(vs => vs.equipped)?.skin;

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
        <div className="p-6 max-w-2xl mx-auto pb-32 relative min-h-screen content-center">
            {/* AMBIENT BACKGROUND */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 blur-[120px] rounded-full" />
            </div>

            <header className="mb-12 flex items-center justify-between sticky top-0 z-20 py-4 bg-slate-950/80 backdrop-blur-md -mx-6 px-6 border-b border-white/5">
                <div>
                     <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <User className="text-blue-500" size={32} /> Guarda-Roupa
                     </h1>
                     <p className="text-slate-500 text-sm font-medium">Sua identidade cultural única</p>
                </div>
                <div className="bg-gradient-to-tr from-blue-500/10 to-purple-500/10 p-3 rounded-[24px] border border-white/10 shadow-lg">
                     <LayoutGrid className="text-white" size={24} />
                </div>
            </header>

            {/* PREVIEW SECTION - PREMIUM CASE */}
            <div className="relative aspect-square w-full max-w-[340px] mx-auto mb-16 group">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 via-transparent to-purple-500/20 rounded-[48px] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                
                <div className="relative h-full bg-slate-900/60 rounded-[48px] border border-white/10 backdrop-blur-3xl flex items-center justify-center p-12 overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={equippedSkin?.id || 'default'}
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            className="relative z-10 w-full h-full flex items-center justify-center"
                        >
                            <img
                                src={equippedSkin?.imageUrl || "/default_avatar.png"}
                                alt="Preview"
                                className="h-full object-contain drop-shadow-[0_45px_65px_rgba(0,0,0,0.8)]"
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {visitorSkins.map((vs) => {
                    const style = getRarityStyle(vs.skin.rarity);
                    return (
                        <motion.button
                            key={vs.id}
                            layout
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ y: -5 }}
                            onClick={() => !vs.equipped && handleEquip(vs.skin.id)}
                            className={`relative aspect-square rounded-3xl border transition-all duration-300 flex flex-col items-center justify-center p-4 group
                                ${vs.equipped ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20' : `${style} hover:border-white/20`}
                            `}
                        >
                            <img src={vs.skin.imageUrl} className="h-[75%] object-contain drop-shadow-lg group-hover:scale-110 transition-transform" alt={vs.skin.name} />
                            
                            <div className="absolute bottom-2 left-0 right-0 px-2">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 truncate block text-center opacity-0 group-hover:opacity-100 transition-opacity">{vs.skin.name}</span>
                            </div>

                            {vs.equipped && (
                                <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1.5 shadow-xl border-2 border-slate-950">
                                    <Check size={12} className="text-white" />
                                </div>
                            )}

                            {equipping === vs.skin.id && (
                                 <div className="absolute inset-0 bg-slate-950/60 rounded-3xl flex items-center justify-center backdrop-blur-sm z-20">
                                     <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent animate-spin rounded-full shadow-lg" />
                                 </div>
                            )}
                        </motion.button>
                    );
                })}

                {visitorSkins.length === 0 && !loading && (
                    <div className="col-span-3 py-20 text-center bg-white/5 rounded-[40px] border border-dashed border-white/10 backdrop-blur-sm">
                        <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/5">
                            <Gem className="text-slate-700" size={32} />
                        </div>
                        <h3 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-2">Acervo Vazio</h3>
                        <p className="text-slate-500 text-xs font-medium px-12">Você ainda não conquistou itens visuais. Explore o Marketplace para personalizar seu avatar!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
