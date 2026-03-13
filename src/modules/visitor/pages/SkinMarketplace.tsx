import React, { useState, useEffect } from "react";
import { api } from "../../../api/client";
import { Gem, Star, Lock, Info, CheckCircle2 } from "lucide-react";
import { useToast } from "../../../contexts/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../auth/AuthContext";
import "./Marketplace.css";

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
    const { tenantId, isAuthenticated } = useAuth();
    const [skins, setSkins] = useState<Skin[]>([]);
    const [visitorXp, setVisitorXp] = useState(0);
    const [visitorId, setVisitorId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [buyingId, setBuyingId] = useState<string | null>(null);
    const [showWarning, setShowWarning] = useState<Skin | null>(null);

    useEffect(() => {
        const loadMarketplace = async () => {
            try {
                const profileRes = await api.get("/visitors/me");
                const vid = profileRes.data.id;
                setVisitorId(vid);

                const [skinsRes, visitorRes] = await Promise.all([
                    api.get(`/marketplace?visitorId=${vid}`),
                    api.get(`/visitors/${vid}`)
                ]);
                setSkins(skinsRes.data);
                setVisitorXp(visitorRes.data.xp);
            } catch (err) {
                console.error(err);
                addToast("Erro ao carregar marketplace", "error");
            } finally {
                setLoading(false);
            }
        };
        if(isAuthenticated) loadMarketplace();
    }, [isAuthenticated, tenantId]);

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
            setShowWarning(null);
        } catch (err) {
            addToast("Erro na compra", "error");
        } finally {
            setBuyingId(null);
        }
    };

    const getRarityLabel = (rarity: string) => {
        switch(rarity) {
            case "COMMON": return "Comum";
            case "RARE": return "Raro";
            case "EPIC": return "Épico";
            case "LEGENDARY": return "Lendário";
            case "EXCLUSIVE": return "Exclusivo";
            default: return "Comum";
        }
    };

    return (
        <div className="marketplace-container">
            <header className="market-header-premium">
                <span className="market-badge">Câmara de Relíquias</span>
                <h1 className="market-title-premium">Marketplace</h1>
                <p className="hero-subtitle-premium">Troque seu legado acumulado por itens exclusivos que transcendem o tempo e definem sua jornada.</p>

                <div className="market-balance-hud">
                    <div className="flex flex-col">
                        <span className="market-balance-label">Seu Saldo Total</span>
                        <span>{visitorXp.toLocaleString()} XP</span>
                    </div>
                    <Star className="text-gold fill-gold" size={24} />
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center p-40">
                   <div className="splash-loader-fill h-1 w-40"></div>
                </div>
            ) : (
                <div className="market-grid-premium">
                    {skins.map((skin) => (
                        <motion.div
                            key={skin.id}
                            className="market-card-premium"
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                        >
                            <div className="market-visual-premium">
                                <span className="market-rarity-tag">{getRarityLabel(skin.rarity)}</span>
                                <img src={skin.imageUrl} className="market-img-premium" alt={skin.name} />
                                
                                {skin.owned && (
                                     <div className="absolute inset-0 bg-bg/60 backdrop-blur-[2px] flex items-center justify-center">
                                         <CheckCircle2 className="text-gold" size={32} />
                                     </div>
                                )}
                            </div>
                            
                            <div className="market-content-premium">
                                <h3 className="market-item-name">{skin.name}</h3>
                                <p className="market-item-desc line-clamp-2">{skin.description}</p>
                                
                                {skin.owned ? (
                                    <div className="market-owned-badge">
                                        <Gem size={14} /> Item Conquistado
                                    </div>
                                ) : (
                                    <button 
                                        className={`market-buy-btn-premium ${visitorXp >= skin.xpCost ? 'can-afford' : 'cannot-afford'}`}
                                        onClick={() => setShowWarning(skin)}
                                        disabled={buyingId === skin.id || visitorXp < skin.xpCost}
                                    >
                                        {buyingId === skin.id ? (
                                            <div className="w-5 h-5 border-2 border-bg2 border-t-gold animate-spin rounded-full" />
                                        ) : (
                                            <>
                                                {skin.xpCost.toLocaleString()} XP
                                                <Star size={14} fill="currentColor" />
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* XP WARNING MODAL */}
            <AnimatePresence>
                {showWarning && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg/90 backdrop-blur-xl">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-surface border border-gold-glow p-10 rounded-[40px] max-w-md w-full shadow-2xl relative overflow-hidden"
                        >
                            <h2 className="text-3xl font-fd text-white mb-6">Iniciação de Troca</h2>
                            <p className="text-muted text-sm leading-relaxed mb-8">
                                Ao declarar posse sobre <span className="text-white font-bold">{showWarning.name}</span>, você consumirá <span className="text-gold-hi font-bold">{showWarning.xpCost.toLocaleString()} XP</span> de seu saldo eterno.
                            </p>
                            
                            <div className="flex gap-4">
                                <button 
                                    className="flex-1 py-4 bg-bg2 text-muted font-fm text-[10px] uppercase tracking-widest rounded-2xl border border-border"
                                    onClick={() => setShowWarning(null)}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    className="flex-1 py-4 bg-gold text-bg font-fm text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-gold-glow"
                                    onClick={() => handleBuy(showWarning)}
                                    disabled={buyingId === showWarning.id}
                                >
                                    {buyingId === showWarning.id ? "Processando..." : "Confirmar Troca"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
