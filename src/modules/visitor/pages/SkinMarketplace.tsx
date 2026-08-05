import { logger } from "@/utils/logger";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../../api/client";
import { Gem, Star, CheckCircle2, CreditCard } from "lucide-react";
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
    priceCents?: number | null;
    currency?: string | null;
    acquisitionMode?: string;
    assetType?: string;
    previewUrl?: string | null;
    thumbnailUrl?: string | null;
    rarity: string;
    owned: boolean;
}


type VisitorProfileResponse = {
    id: string;
    xp?: number | null;
};

type BuySkinResponse = {
    newXpBalance?: number;
    checkoutUrl?: string;
};
export const SkinMarketplace: React.FC = () => {
    const { addToast } = useToast();
    const { tenantId, isAuthenticated, isGuest } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [skins, setSkins] = useState<Skin[]>([]);
    const [visitorXp, setVisitorXp] = useState(0);
    const [visitorId, setVisitorId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [buyingId, setBuyingId] = useState<string | null>(null);
    const [showWarning, setShowWarning] = useState<{ skin: Skin; method: "xp" | "money" } | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get("skinPurchase") === "cancel") {
            addToast("Compra cancelada. Seu marketplace continua intacto.", "info");
            navigate("/marketplace", { replace: true });
        }
    }, [location.search, addToast, navigate]);

    useEffect(() => {
        const loadMarketplace = async () => {
            if (isGuest) {
                setLoading(false);
                return;
            }
            try {
                const profileRes = await api.get<VisitorProfileResponse>("/visitors/me");
                const vid = profileRes.data.id;
                const currentXp = profileRes.data.xp || 0;
                
                if (!vid) {
                    setLoading(false);
                    return;
                }
                setVisitorId(vid);
                setVisitorXp(currentXp);

                // L8 Fix: profileRes already contains XP, only need marketplace now
                const skinsRes = await api.get<Skin[]>(`/marketplace?visitorId=${vid}`);
                setSkins(Array.isArray(skinsRes.data) ? skinsRes.data : []);
            } catch (err) {
                logger.error(err);
                addToast("Erro ao carregar marketplace", "error");
            } finally {
                setLoading(false);
            }
        };

        // B-07: Sync XP when window regains focus
        const handleFocus = () => {
            if (isAuthenticated && !isGuest && visitorId) {
                api.get<VisitorProfileResponse>(`/visitors/${visitorId}`).then(res => setVisitorXp(res.data.xp || 0)).catch(() => {});
            }
        };

        if(isAuthenticated && !isGuest) {
            loadMarketplace();
        } else if (isGuest) {
            setLoading(false);
            // Load public skins or something? For now just empty
            setSkins([]);
        }
        
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [isAuthenticated, isGuest, tenantId, visitorId, addToast]);

    const formatMoney = (cents?: number | null, currency = "BRL") =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format((cents || 0) / 100);

    const canBuyWithXp = (skin: Skin) =>
        ["FREE", "XP_ONLY", "XP_OR_MONEY"].includes(skin.acquisitionMode || "XP_ONLY");

    const canBuyWithMoney = (skin: Skin) =>
        ["MONEY_ONLY", "XP_OR_MONEY", "XP_PLUS_MONEY"].includes(skin.acquisitionMode || "XP_ONLY") && Number(skin.priceCents || 0) > 0;

    const handleBuy = async (skin: Skin, method: "xp" | "money") => {
        if (method === "xp" && visitorXp < skin.xpCost) {
            addToast("XP insuficiente!", "error");
            return;
        }
        if (method === "money" && skin.acquisitionMode === "XP_PLUS_MONEY" && visitorXp < skin.xpCost) {
            addToast("Esta skin tambem exige XP. Continue explorando para liberar.", "error");
            return;
        }

        setBuyingId(skin.id);
        try {
            const endpoint = method === "money" ? "buy-money" : "buy";
            const res = await api.post<BuySkinResponse>(`/marketplace/${skin.id}/${endpoint}`);
            if (res.data.checkoutUrl) {
                window.location.href = res.data.checkoutUrl;
                return;
            }
            addToast("Skin desbloqueada! Va ao Guarda-Roupa para equipar.", "success");
            if (res.data.newXpBalance !== undefined) setVisitorXp(res.data.newXpBalance);
            setSkins(prev => prev.map(s => s.id === skin.id ? { ...s, owned: true } : s));
            setShowWarning(null);
        } catch (_err) {
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
                                <img src={skin.previewUrl || skin.thumbnailUrl || skin.imageUrl} className="market-img-premium" alt={skin.name} />
                                
                                {skin.owned && (
                                     <div className="absolute inset-0 bg-bg/60 backdrop-blur-[2px] flex items-center justify-center">
                                         <CheckCircle2 className="text-gold" size={32} />
                                     </div>
                                )}
                            </div>
                            
                            <div className="market-content-premium">
                                <h3 className="market-item-name">{skin.name}</h3>
                                <p className="market-item-desc line-clamp-2">{skin.description}</p>
                                <div className="market-meta-row">
                                    <span>{skin.assetType || "IMAGE_2D"}</span>
                                    <span>{skin.acquisitionMode || "XP_ONLY"}</span>
                                </div>
                                
                                {skin.owned ? (
                                    <div className="market-owned-badge">
                                        <Gem size={14} /> Item Conquistado
                                    </div>
                                ) : (
                                    <div className="market-actions-stack">
                                        {canBuyWithXp(skin) && (
                                            <button 
                                                className={`market-buy-btn-premium ${visitorXp >= skin.xpCost ? 'can-afford' : 'cannot-afford'}`}
                                                onClick={() => setShowWarning({ skin, method: "xp" })}
                                                disabled={buyingId === skin.id || visitorXp < skin.xpCost}
                                            >
                                                {buyingId === skin.id ? (
                                                    <div className="w-5 h-5 border-2 border-bg2 border-t-gold animate-spin rounded-full" />
                                                ) : (
                                                    <>
                                                        {skin.acquisitionMode === "FREE" ? "Gratis" : `${skin.xpCost.toLocaleString()} XP`}
                                                        <Star size={14} fill="currentColor" />
                                                    </>
                                                )}
                                            </button>
                                        )}
                                        {canBuyWithMoney(skin) && (
                                            <button
                                                className="market-buy-btn-premium money"
                                                onClick={() => setShowWarning({ skin, method: "money" })}
                                                disabled={buyingId === skin.id}
                                            >
                                                {buyingId === skin.id ? (
                                                    <div className="w-5 h-5 border-2 border-white/40 border-t-white animate-spin rounded-full" />
                                                ) : (
                                                    <>
                                                        {formatMoney(skin.priceCents, skin.currency || "BRL")}
                                                        <CreditCard size={14} />
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
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
                                Ao declarar posse sobre <span className="text-white font-bold">{showWarning.skin.name}</span>, voce usara <span className="text-gold-hi font-bold">{showWarning.method === "money" ? formatMoney(showWarning.skin.priceCents, showWarning.skin.currency || "BRL") : `${showWarning.skin.xpCost.toLocaleString()} XP`}</span> para desbloquear esta identidade.
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
                                    onClick={() => handleBuy(showWarning.skin, showWarning.method)}
                                    disabled={buyingId === showWarning.skin.id}
                                >
                                    {buyingId === showWarning.skin.id ? "Processando..." : "Confirmar Troca"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

