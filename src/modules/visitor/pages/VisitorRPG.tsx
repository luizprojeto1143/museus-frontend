import { useTranslation } from "react-i18next";
import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Sword, Shield, Trophy, User, Crown } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { SelfieCapture } from "../components/SelfieCapture";
import "./VisitorRPG.css";

const classConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    NOVATO: { label: 'Novato', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', icon: <User size={20} /> },
    APRENDIZ: { label: 'Aprendiz', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', icon: <Shield size={20} /> },
    MESTRE: { label: 'Mestre', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', icon: <Sword size={20} /> },
    LENDA: { label: 'Lenda', color: 'var(--accent-primary)', bg: 'rgba(212,175,55,0.1)', icon: <Trophy size={20} /> }
};

export const VisitorRPG: React.FC = () => {
    const { t } = useTranslation();
    const { isGuest } = useAuth();
    const navigate = useNavigate();
    const [visitor, setVisitor] = useState<any>(null);
    const [characters, setCharacters] = useState<any[]>([]);
    const [activeChar, setActiveChar] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [newName, setNewName] = useState('');
    const [avatarStatus, setAvatarStatus] = useState<string>('NONE');
    const [isGenerating, setIsGenerating] = useState(false);

    const fetchRPG = useCallback(async () => {
        try {
            const res = await api.get('/rpg/me');
            setVisitor(res.data.visitor);
            setCharacters(res.data.characters);
            
            const active = res.data.characters.find((c: any) => c.isActive) || res.data.characters[0];
            setActiveChar(active);
            if (active) {
                setNewName(active.characterName);
                setAvatarStatus(active.avatarStatus || 'NONE');
                setIsGenerating(active.avatarStatus === 'GENERATING');
            }
        } catch (error) { 
            console.error(error); 
        } finally { 
            setLoading(false); 
        }
    }, []);

    // Polling for avatar status
    useEffect(() => {
        if (!isGenerating) return;

        const interval = setInterval(async () => {
            try {
                const res = await api.get('/rpg/avatar-status');
                if (res.data.status !== 'GENERATING') {
                    setIsGenerating(false);
                    setAvatarStatus(res.data.status);
                    fetchRPG(); // Refresh to get the new URL
                    if (res.data.status === 'READY') {
                        toast.success("Seu avatar personalizado está pronto! ✨");
                    }
                }
            } catch (err) {
                console.error("Polling error", err);
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [isGenerating, fetchRPG]);

    useEffect(() => { 
        if (!isGuest) fetchRPG(); 
    }, [fetchRPG, isGuest]);

    const onSaveName = async () => {
        if (!newName.trim()) return;
        try {
            await api.put('/rpg/customize', { characterName: newName });
            toast.success("Nome atualizado!");
            setEditing(false);
            fetchRPG();
        } catch (err) { toast.error("Erro"); }
    };

    const handleSelfieUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('selfie', file);
        try {
            setIsGenerating(true);
            await api.post('/rpg/selfie', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Foto enviada! A IA está trabalhando...");
        } catch (err) {
            setIsGenerating(false);
            toast.error("Erro ao enviar selfie");
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}><Loader2 className="animate-spin" style={{ color: 'var(--accent-primary)' }} /></div>;

    if (isGuest) {
        return (
            <div className="rpg-container flex flex-col items-center justify-center min-h-[70vh] p-6">
                <div className="rpg-card premium-glass !max-w-md text-center py-16 px-8 relative overflow-hidden">
                    <div className="rpg-card-glow"></div>
                    <div className="rpg-avatar-wrapper !mx-auto mb-8">
                        <div className="rpg-avatar-ring"></div>
                        <div className="rpg-avatar-scanner"></div>
                        <User size={64} className="text-white/20 mx-auto" />
                    </div>
                    
                    <h2 className="text-3xl font-black text-white italic mb-4 uppercase tracking-tighter">
                        Destino Selado
                    </h2>
                    <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                        Sua jornada como herói cultural ainda não começou. Crie sua identidade digital para evoluir seu avatar, conquistar territórios e eternizar seu legado no museu.
                    </p>
                    
                    <button 
                        onClick={() => navigate('/register')} 
                        className="btn-primary-gradient !w-full !py-4 !rounded-2xl font-black italic uppercase tracking-widest shadow-[0_0_30px_rgba(212,175,55,0.2)]"
                    >
                        Iniciar Minha Odisseia
                    </button>
                </div>
            </div>
        );
    }

    if (!visitor) return null;

    const cls = classConfig[visitor.class] || classConfig.NOVATO;
    const currentXp = Number(visitor.currentXp) || 0;
    const nextLevelXp = Number(visitor.nextLevelXp) || 100;
    const xpPct = nextLevelXp > 0 ? Math.round((currentXp / nextLevelXp) * 100) : 0;

    return (
        <div className="rpg-container animate-in fade-in duration-700">
            {/* ═══ CHARACTER CARD ══════════════ */}
            <div className={`rpg-card premium-glass`}>
                <div className="rpg-card-glow"></div>
                <div className="rpg-avatar-wrapper">
                    <div className="rpg-avatar-ring"></div>
                    <div className="rpg-avatar-scanner"></div>
                    <div className="rpg-hologram-effect"></div>
                    <img 
                        src={activeChar?.displayAvatarUrl || '/default_avatar.png'} 
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
                        {activeChar?.characterName || "Seu Herói"} 
                        {activeChar && <span className="opacity-0 group-hover:opacity-100 text-xs ml-2 text-yellow-600 font-mono transition-opacity">EDIT</span>}
                    </h1>
                )}

                <div className="rpg-title">{cls.label}</div>

                {/* XP BAR INTEGRATED */}
                <div className="bg-black/40 rounded-3xl p-6 border border-white/5">
                    <div className="flex justify-between items-end mb-3">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl font-black text-white italic">Nv. {visitor.level}</span>
                            <span className="text-[10px] bg-yellow-600/20 text-yellow-600 px-2 rounded-md font-mono">{xpPct}%</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{visitor.currentXp.toLocaleString()} / {visitor.nextLevelXp.toLocaleString()} XP</span>
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
                    <span className="rpg-stat-val italic">{visitor.totalVisits || 0}</span>
                    <span className="rpg-stat-lbl">Explorações</span>
                </div>
                <div className="rpg-stat-box">
                    <span className="rpg-stat-val italic">{visitor.totalWorks || 0}</span>
                    <span className="rpg-stat-lbl">Relíquias</span>
                </div>
                <div className="rpg-stat-box">
                    <span className="rpg-stat-val italic">{visitor.totalCards || 0}</span>
                    <span className="rpg-stat-lbl">Grimório</span>
                </div>
            </div>

            {/* ═══ CHARACTER MINI-CAROUSEL ═════════ */}
            {characters.length > 1 && (
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-white font-black text-xs uppercase tracking-widest italic flex items-center gap-2">
                            <Crown size={14} className="text-yellow-600" /> Seus heróis
                        </h2>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                        {characters.map((char) => (
                            <button
                                key={char.id}
                                onClick={() => setActiveChar(char)}
                                className={`flex-shrink-0 p-3 rounded-2xl border-2 transition-all ${activeChar?.id === char.id ? 'bg-yellow-600/20 border-yellow-600 shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'bg-white/5 border-white/10 opacity-70 hover:opacity-100'}`}
                            >
                                <img src={char.displayAvatarUrl || '/default_avatar.png'} className="w-10 h-10 object-contain rounded-full" alt={char.characterName} />
                            </button>
                        ))}
                    </div>
                </div>
            )}

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

            {/* ═══ AI AVATAR SECTION ═══════════ */}
            {(avatarStatus === 'NONE' || avatarStatus === 'ERROR' || isGenerating) && (
                <SelfieCapture onCapture={handleSelfieUpload} isGenerating={isGenerating} />
            )}

            {/* ═══ EVOLUTION PATH ══════════════ */}
            <div className="rpg-evolution">
                <div className="rpg-evo-title">Graus de Iniciação Cultural</div>
                <div className="rpg-evo-path">
                    {Object.entries(classConfig).map(([key, cfg], idx) => {
                        const reached = Object.keys(classConfig).indexOf(visitor.class) >= idx;
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
        </div>
    );
};
