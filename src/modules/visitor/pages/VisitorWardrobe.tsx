import React, { useState, useEffect } from "react";
import { api } from "../../../api/client";
import { useTranslation } from "react-i18next";
import { User, Shield, Gem, Check, LayoutGrid } from "lucide-react";
import { Button } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../auth/AuthContext";

interface CharacterProfile {
    id: string;
    characterName: string;
    isActive: boolean;
    selectedCharacter?: {
        id: string;
        name: string;
        imageUrl: string;
        description: string;
    } | null;
    equippedSkin?: {
        id: string;
        name: string;
        imageUrl: string;
    } | null;
    baseAvatarUrl?: string | null;
    avatarStatus?: string;
}

interface OwnedSkin {
    id: string;
    skin: {
        id: string;
        name: string;
        imageUrl: string;
        rarity: string;
    };
    generatedAvatarUrl?: string | null;
}

export const VisitorWardrobe: React.FC = () => {
    const { addToast } = useToast();
    const { isAuthenticated, isGuest } = useAuth();
    const [characters, setCharacters] = useState<CharacterProfile[]>([]);
    const [ownedSkins, setOwnedSkins] = useState<OwnedSkin[]>([]);
    const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
    const [visitorId, setVisitorId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [equipping, setEquipping] = useState<string | null>(null);
    const [generatingSkin, setGeneratingSkin] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (isGuest) {
                setLoading(false);
                return;
            }
            try {
                const [rpgRes, profileRes] = await Promise.all([
                    api.get("/rpg/me"),
                    api.get("/visitors/me")
                ]);
                
                const vid = profileRes.data.id;
                setVisitorId(vid);
                
                const skinsRes = await api.get(`/visitors/${vid}/skins`);
                
                setCharacters(rpgRes.data.characters);
                setOwnedSkins(skinsRes.data);
                
                // Select active character by default
                const active = rpgRes.data.characters.find((c: any) => c.isActive);
                if (active) setSelectedCharId(active.id);
                else if (rpgRes.data.characters.length > 0) setSelectedCharId(rpgRes.data.characters[0].id);
                
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (isAuthenticated && !isGuest) loadData();
        else if (isGuest) setLoading(false);
    }, [isAuthenticated, isGuest]);

    // Polling for skin generation
    useEffect(() => {
        if (!generatingSkin) return;

        let attempts = 0;
        const interval = setInterval(async () => {
            attempts++;
            if (attempts > 30) { // 2 minutes (30 * 4s)
                clearInterval(interval);
                setGeneratingSkin(null);
                addToast("Tempo de geração esgotado. Tente novamente mais tarde.", "error");
                return;
            }

            try {
                const res = await api.get(`/rpg/skin-status/${generatingSkin}`);
                if (res.data.status !== 'GENERATING') {
                    setGeneratingSkin(null);
                    if (res.data.status === 'READY') {
                        addToast("Skin aplicada com sucesso pela IA! ✨", "success");
                        // Refresh to get the new generatedAvatarUrl
                        const skinsRes = await api.get(`/visitors/${visitorId}/skins`);
                        setOwnedSkins(skinsRes.data);
                    } else if (res.data.status === 'ERROR') {
                        addToast("Erro na geração da IA pela skin.", "error");
                    }
                }
            } catch (err) {
                console.error("Polling skin error", err);
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [generatingSkin, visitorId, addToast]);

    const handleRetryAvatar = async () => {
        try {
            await api.post("/rpg/retry-avatar");
            addToast("Status resetado. Você pode tentar gerar novamente!", "success");
            // Refresh character data
            const rpgRes = await api.get("/rpg/me");
            setCharacters(rpgRes.data.characters);
        } catch (err) {
            addToast("Erro ao resetar status", "error");
        }
    };

    const handleEquip = async (skinId: string) => {
        if (!selectedCharId) return;
        setEquipping(skinId);
        try {
            await api.put(`/rpg/equip-skin`, { 
                characterId: selectedCharId, 
                skinId 
            });
            addToast("Visual atualizado!", "success");
            
            // Update local state
            setCharacters(prev => prev.map(c => 
                c.id === selectedCharId 
                    ? { ...c, equippedSkinId: skinId, equippedSkin: ownedSkins.find(s => s.skin.id === skinId)?.skin } 
                    : c
            ));
        } catch (err) {
            addToast("Erro ao equipar", "error");
        } finally {
            setEquipping(null);
        }

        // Trigger AI skin application if avatar is ready
        if (currentChar?.avatarStatus === 'READY' && skinId) {
            try {
                setGeneratingSkin(skinId);
                await api.post(`/rpg/apply-skin/${skinId}`);
                addToast("IA está aplicando a skin ao seu avatar...", "info");
            } catch (err) {
                setGeneratingSkin(null);
                console.error("AI Skin start error", err);
            }
        }
    };

    const currentChar = characters.find(c => c.id === selectedCharId);
    const compatibleSkins = ownedSkins;

    const getRarityStyle = (rarity: string) => {
        switch(rarity) {
            case "COMMON": return "border-white/5 bg-white/5";
            case "RARE": return "border-blue-500/30 bg-[var(--accent-primary)]/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]";
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
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--accent-primary)]/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 blur-[120px] rounded-full" />
            </div>

            {isGuest && (
                <div className="relative z-50 flex flex-col items-center justify-center py-40 text-center">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                        <User size={48} className="text-slate-700" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Acesso Restrito</h2>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto mb-10 leading-relaxed">
                        Crie uma conta gratuita para desbravar o RPG, conquistar skins exclusivas e personalizar sua identidade cultural.
                    </p>
                    <button 
                        onClick={() => window.location.href='/register'}
                        className="w-full max-w-xs py-4 bg-[var(--accent-primary)] text-slate-950 font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
                    >
                        Criar Perfil Heróico
                    </button>
                </div>
            )}

            {!isGuest && (
                <>
                <header className="flex items-center justify-between mb-12 relative z-10">
                    <div>
                         <h1 className="text-3xl font-black text-white flex items-center gap-3">
                            <User className="text-[var(--accent-primary)]" size={32} /> Guarda-Roupa
                         </h1>
                         <p className="text-slate-500 text-sm font-medium">Sua identidade cultural única</p>
                    </div>
                    <div className="bg-gradient-to-tr from-blue-500/10 to-purple-500/10 p-3 rounded-[24px] border border-white/10 shadow-lg">
                         <LayoutGrid className="text-white" size={24} />
                    </div>
                </header>

            {/* CHARACTER SELECTOR CAROUSEL */}
            <div className="flex gap-4 overflow-x-auto pb-8 mb-8 no-scrollbar snap-x">
                {characters.map((profile) => (
                    <button
                        key={profile.id}
                        onClick={() => setSelectedCharId(profile.id)}
                        className={`flex-shrink-0 snap-center p-4 rounded-[32px] border-2 transition-all relative w-32
                            ${selectedCharId === profile.id 
                                ? 'bg-[var(--accent-primary)]/10 border-blue-500 shadow-xl shadow-blue-500/10' 
                                : 'bg-white/5 border-white/5 hover:border-white/10'}
                        `}
                    >
                        <img 
                            src={profile.baseAvatarUrl || profile.selectedCharacter?.imageUrl || '/default_avatar.png'} 
                            className="w-16 h-16 object-contain mx-auto mb-2 drop-shadow-md rounded-full" 
                            alt={profile.characterName} 
                        />
                        <span className="text-[10px] font-black text-white uppercase tracking-tighter block text-center truncate">
                            {profile.characterName}
                        </span>
                    </button>
                ))}
            </div>

            {/* PREVIEW SECTION */}
            <div className="relative aspect-square w-full max-w-[340px] mx-auto mb-16 group">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 via-transparent to-purple-500/20 rounded-[48px] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                
                <div className="relative h-full bg-slate-900/60 rounded-[48px] border border-white/10 backdrop-blur-3xl flex items-center justify-center p-12 overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${selectedCharId}-${currentChar?.equippedSkin?.id}`}
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            className="relative z-10 w-full h-full flex items-center justify-center"
                        >
                            <img
                                src={
                                    (currentChar?.avatarStatus === 'READY' && ownedSkins.find(s => s.skin.id === currentChar?.equippedSkin?.id)?.generatedAvatarUrl) ||
                                    currentChar?.equippedSkin?.imageUrl || 
                                    currentChar?.baseAvatarUrl ||
                                    currentChar?.selectedCharacter?.imageUrl || 
                                    "/default_avatar.png"
                                }
                                alt="Preview"
                                className="h-full object-contain drop-shadow-[0_45px_65px_rgba(0,0,0,0.8)]"
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
                
                {currentChar && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30">
                        <div className="bg-slate-900 border border-white/10 px-6 py-2 rounded-full shadow-2xl backdrop-blur-xl">
                            <span className="text-white font-bold text-[10px] uppercase tracking-[0.2em]">
                                {currentChar.equippedSkin?.name || "Skin Padrão"}
                            </span>
                        </div>
                        
                        {currentChar.avatarStatus === 'ERROR' && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="bg-red-500/10 border-red-500/20 text-red-400 text-[10px] h-8 px-4 rounded-full"
                                onClick={handleRetryAvatar}
                            >
                                Tentar IA Novamente
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-3 gap-4">
                {/* DEFAULT SKIN OPTION */}
                {selectedCharId && (
                    <motion.button
                        layout
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ y: -5 }}
                        onClick={() => currentChar?.equippedSkin && handleEquip("")}
                        className={`relative aspect-square rounded-3xl border transition-all duration-300 flex flex-col items-center justify-center p-4 group
                            ${!currentChar?.equippedSkin ? 'border-blue-500 bg-[var(--accent-primary)]/10 ring-2 ring-blue-500/20' : 'border-white/5 bg-white/5 hover:border-white/20'}
                        `}
                    >
                         <img src={currentChar?.baseAvatarUrl || currentChar?.selectedCharacter?.imageUrl || '/default_avatar.png'} className="h-[75%] object-contain opacity-50 drop-shadow-lg rounded-full" alt="Padrão" />
                         <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 mt-2">Padrão</span>
                    </motion.button>
                )}

                {compatibleSkins.map((vs) => {
                    const style = getRarityStyle(vs.skin.rarity);
                    const isEquipped = currentChar?.equippedSkin?.id === vs.skin.id;

                    return (
                        <motion.button
                            key={vs.id}
                            layout
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ y: -5 }}
                            onClick={() => !isEquipped && handleEquip(vs.skin.id)}
                            className={`relative aspect-square rounded-3xl border transition-all duration-300 flex flex-col items-center justify-center p-4 group
                                ${isEquipped ? 'border-blue-500 bg-[var(--accent-primary)]/10 ring-2 ring-blue-500/20' : `${style} hover:border-white/20`}
                            `}
                        >
                            <img src={vs.skin.imageUrl} className="h-[75%] object-contain drop-shadow-lg group-hover:scale-110 transition-transform" alt={vs.skin.name} />
                            
                            <div className="absolute bottom-2 left-0 right-0 px-2">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 truncate block text-center opacity-0 group-hover:opacity-100 transition-opacity">{vs.skin.name}</span>
                            </div>

                            {isEquipped && (
                                <div className="absolute top-2 right-2 bg-[var(--accent-primary)] rounded-full p-1.5 shadow-xl border-2 border-slate-950">
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

                {compatibleSkins.length === 0 && !loading && (
                    <div className="col-span-3 py-12 text-center bg-white/5 rounded-[40px] border border-dashed border-white/10 backdrop-blur-sm">
                        <Gem className="text-slate-700 mx-auto mb-4" size={24} />
                        <h3 className="text-white font-black uppercase text-[10px] tracking-[0.2em] mb-1">Sem Skins</h3>
                        <p className="text-slate-500 text-[10px] font-medium px-12 italic">Nenhuma skin descoberta para este herói ainda.</p>
                    </div>
                )}
            </div>
            </>
        )}
    </div>
);
};
