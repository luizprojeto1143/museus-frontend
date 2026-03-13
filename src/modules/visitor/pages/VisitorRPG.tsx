import { useTranslation } from "react-i18next";
import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Sword, Shield, Trophy, Star, Sparkles, User, Crown } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { CharacterSelectModal } from "../components/CharacterSelectModal";

const classConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    NOVATO: { label: 'Novato', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', icon: <User size={20} /> },
    APRENDIZ: { label: 'Aprendiz', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', icon: <Shield size={20} /> },
    MESTRE: { label: 'Mestre', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', icon: <Sword size={20} /> },
    LENDA: { label: 'Lenda', color: '#d4af37', bg: 'rgba(212,175,55,0.1)', icon: <Trophy size={20} /> }
};

export const VisitorRPG: React.FC = () => {
    const { t } = useTranslation();
    const { isGuest } = useAuth();
    const navigate = useNavigate();
    const [rpg, setRpg] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [newName, setNewName] = useState('');
    const [showSelection, setShowSelection] = useState(false);

    const fetchRPG = useCallback(async () => {
        try {
            const res = await api.get('/rpg/me');
            setRpg(res.data);
            setNewName(res.data.characterName);
            
            // If no character selected, show selection modal
            if (!res.data.selectedCharacterId) {
                setShowSelection(true);
            }
        } catch (error) { 
            console.error(error); 
        } finally { 
            setLoading(false); 
        }
    }, []);

    useEffect(() => { 
        fetchRPG(); 
    }, [fetchRPG]);

    const onSaveName = async () => {
        if (!newName.trim()) return;
        try {
            await api.put('/rpg/customize', { characterName: newName });
            toast.success("Nome atualizado!");
            setEditing(false);
            fetchRPG();
        } catch (err) { toast.error("Erro"); }
    };

    const handleSelectCharacter = async (characterId: string) => {
        try {
            await api.put('/rpg/select-character', { characterId });
            toast.success("Personagem desbloqueado!");
            setShowSelection(false);
            fetchRPG();
        } catch (err) {
            toast.error("Erro ao selecionar personagem");
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}><Loader2 className="animate-spin" style={{ color: '#d4af37' }} /></div>;

    if (isGuest) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '400px', margin: '4rem auto' }}>
                <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 800 }}>Recurso Exclusivo</h2>
                <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '0.9rem' }}>{t("visitor.rpg.crieUmaContaGratuitaParaEvoluirSeuAvatar", `Crie uma conta gratuita para evoluir seu avatar, ganhar níveis e desbloquear novos títulos do museu!`)}</p>
                <button onClick={() => navigate('/register')} style={{ background: 'linear-gradient(135deg, #d4af37, #b8941e)', color: '#1a1108', padding: '0.8rem 2rem', borderRadius: '1rem', fontWeight: 900, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(212,175,55,0.3)', width: '100%' }}>Criar Conta Gratuita</button>
            </div>
        );
    }

    if (!rpg) return null;

    const cls = classConfig[rpg.characterClass] || classConfig.NOVATO;
    const xpPct = rpg.nextLevelXp > 0 ? Math.round((rpg.currentXp / rpg.nextLevelXp) * 100) : 0;

    return (
        <div className="rpg-container animate-in fade-in duration-700">
            {/* ═══ CHARACTER CARD ══════════════ */}
            <div className={`rpg-card`}>
                <div className="rpg-card-glow"></div>
                <div className="rpg-avatar-wrapper">
                    <div className="rpg-avatar-ring"></div>
                    <img 
                        src={rpg.equippedSkin?.skin?.imageUrl || rpg.selectedCharacter?.imageUrl || '/default_avatar.png'} 
                        className="rpg-avatar-img"
                        alt="Character" 
                    />
                </div>

                {editing ? (
                    <div className="flex gap-2 justify-center mb-6 relative z-10">
                        <input 
                            value={newName} 
                            onChange={e => setNewName(e.target.value)} 
                            className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-center text-xl font-bold text-white focus:border-yellow-600 outline-none"
                        />
                        <button onClick={onSaveName} className="bg-yellow-600 text-black px-4 rounded-xl font-black transition-transform hover:scale-105">✓</button>
                    </div>
                ) : (
                    <h1 onClick={() => setEditing(true)} className="rpg-name cursor-pointer group">
                        {rpg.characterName} 
                        <span className="opacity-0 group-hover:opacity-100 text-xs ml-2 text-yellow-600 font-mono transition-opacity">EDIT</span>
                    </h1>
                )}

                <div className="rpg-title">{cls.label}</div>

                {/* XP BAR INTEGRATED */}
                <div className="bg-black/40 rounded-3xl p-6 border border-white/5">
                    <div className="flex justify-between items-end mb-3">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl font-black text-white italic">Nv. {rpg.level}</span>
                            <span className="text-[10px] bg-yellow-600/20 text-yellow-600 px-2 rounded-md font-mono">{xpPct}%</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{rpg.currentXp.toLocaleString()} / {rpg.nextLevelXp.toLocaleString()} XP</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-yellow-700 to-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.3)] transition-all duration-1000" 
                            style={{ width: `${xpPct}%` }} 
                        />
                    </div>
                </div>
            </div>

            {/* ═══ STATS GRID ══════════════════ */}
            <div className="rpg-stats">
                <div className="rpg-stat-box">
                    <span className="rpg-stat-val italic">{rpg.totalVisits}</span>
                    <span className="rpg-stat-lbl">Explorações</span>
                </div>
                <div className="rpg-stat-box">
                    <span className="rpg-stat-val italic">{rpg.totalWorks}</span>
                    <span className="rpg-stat-lbl">Relíquias</span>
                </div>
                <div className="rpg-stat-box">
                    <span className="rpg-stat-val italic">{rpg.totalCards}</span>
                    <span className="rpg-stat-lbl">Grimório</span>
                </div>
            </div>

            {/* ═══ ACTIONS & EVOLUTION ═════════ */}
            <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => navigate('/wardrobe')} className="bento-card !p-6 flex-row items-center gap-4 cursor-pointer">
                        <span className="text-2xl">🎒</span>
                        <div className="text-left">
                            <div className="text-[9px] uppercase tracking-tighter text-yellow-600">Skins</div>
                            <div className="text-xs font-bold text-white">Vestiário</div>
                        </div>
                    </button>
                    <button onClick={() => navigate('/marketplace')} className="bento-card !p-6 flex-row items-center gap-4 cursor-pointer">
                        <span className="text-2xl">🛒</span>
                        <div className="text-left">
                            <div className="text-[9px] uppercase tracking-tighter text-yellow-600">Trading</div>
                            <div className="text-xs font-bold text-white">Mercado</div>
                        </div>
                    </button>
                </div>
                
                <button onClick={() => navigate('/cracha/rastreio')} className="bento-card !p-6 flex-row items-center gap-4 cursor-pointer">
                    <span className="text-2xl">🚚</span>
                    <div className="text-left">
                        <div className="text-[9px] uppercase tracking-tighter text-yellow-600">Status Físico</div>
                        <div className="text-xs font-bold text-white">Rastrear Crachá de Embaixador</div>
                    </div>
                </button>
            </div>

            {/* ═══ EVOLUTION PATH ══════════════ */}
            <div className="rpg-evolution">
                <div className="rpg-evo-title">Graus de Iniciação Cultural</div>
                <div className="rpg-evo-path">
                    {Object.entries(classConfig).map(([key, cfg], idx) => {
                        const reached = Object.keys(classConfig).indexOf(rpg.characterClass) >= idx;
                        return (
                            <div key={key} className={`rpg-evo-node ${reached ? 'active' : ''}`}>
                                <div className="rpg-evo-icon">
                                    {cfg.icon}
                                </div>
                                <span className="rpg-evo-lbl">{cfg.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <CharacterSelectModal isOpen={showSelection} onSelect={handleSelectCharacter} />
        </div>
    );
};
