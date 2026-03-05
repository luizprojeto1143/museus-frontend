import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Sword, Shield, Trophy, Star, Sparkles, User } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const classConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    NOVATO: { label: 'Novato', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', icon: <User size={20} /> },
    APRENDIZ: { label: 'Aprendiz', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', icon: <Shield size={20} /> },
    MESTRE: { label: 'Mestre', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', icon: <Sword size={20} /> },
    LENDA: { label: 'Lenda', color: '#d4af37', bg: 'rgba(212,175,55,0.1)', icon: <Trophy size={20} /> }
};

export const VisitorRPG: React.FC = () => {
    const { isGuest } = useAuth();
    const navigate = useNavigate();
    const [rpg, setRpg] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [newName, setNewName] = useState('');

    const fetchRPG = useCallback(async () => {
        try {
            const res = await api.get('/rpg/me');
            setRpg(res.data);
            setNewName(res.data.characterName);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchRPG(); }, [fetchRPG]);

    const onSaveName = async () => {
        if (!newName.trim()) return;
        try {
            await api.put('/rpg/customize', { characterName: newName });
            toast.success("Nome atualizado!");
            setEditing(false);
            fetchRPG();
        } catch (err) { toast.error("Erro"); }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}><Loader2 className="animate-spin" style={{ color: '#d4af37' }} /></div>;

    if (isGuest) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '400px', margin: '4rem auto' }}>
                <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 800 }}>Recurso Exclusivo</h2>
                <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '0.9rem' }}>Crie uma conta gratuita para evoluir seu avatar, ganhar níveis e desbloquear novos títulos do museu!</p>
                <button onClick={() => navigate('/register')} style={{ background: 'linear-gradient(135deg, #d4af37, #b8941e)', color: '#1a1108', padding: '0.8rem 2rem', borderRadius: '1rem', fontWeight: 900, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(212,175,55,0.3)', width: '100%' }}>Criar Conta Gratuita</button>
            </div>
        );
    }

    if (!rpg) return null;

    const cls = classConfig[rpg.characterClass] || classConfig.NOVATO;
    const xpPct = rpg.nextLevelXp > 0 ? Math.round((rpg.currentXp / rpg.nextLevelXp) * 100) : 0;

    return (
        <div style={{ padding: '1.5rem', maxWidth: '500px', margin: '0 auto' }}>
            {/* Character Card */}
            <div style={{ background: cls.bg, border: `2px solid ${cls.color}30`, borderRadius: '1.5rem', padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: `${cls.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', border: `3px solid ${cls.color}`, color: cls.color }}>
                    {cls.icon}
                </div>

                {editing ? (
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
                        <input value={newName} onChange={e => setNewName(e.target.value)} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.5rem 1rem', color: 'white', textAlign: 'center', fontSize: '1.1rem', fontWeight: 800, outline: 'none', width: '200px' }} />
                        <button onClick={onSaveName} style={{ background: cls.color, color: '#000', border: 'none', borderRadius: '0.75rem', padding: '0.5rem 1rem', fontWeight: 800, cursor: 'pointer' }}>✓</button>
                    </div>
                ) : (
                    <h1 onClick={() => setEditing(true)} style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', cursor: 'pointer' }}>{rpg.characterName}</h1>
                )}

                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 700, color: cls.color, background: `${cls.color}20`, padding: '0.25rem 0.75rem', borderRadius: '1rem' }}>
                    {cls.icon} {cls.label}
                </span>

                {/* Level */}
                <div style={{ marginTop: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                        <span style={{ color: cls.color, fontWeight: 900, fontSize: '2rem' }}>Nível {rpg.level}</span>
                        <span style={{ color: '#888', fontSize: '0.75rem' }}>{rpg.currentXp}/{rpg.nextLevelXp} XP</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${xpPct}%`, height: '100%', background: `linear-gradient(90deg, ${cls.color}, ${cls.color}aa)`, borderRadius: '4px', transition: 'width 0.5s' }} />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(30,32,38,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white' }}>{rpg.totalVisits}</p>
                    <p style={{ fontSize: '0.65rem', color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Visitas</p>
                </div>
                <div style={{ background: 'rgba(30,32,38,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white' }}>{rpg.totalWorks}</p>
                    <p style={{ fontSize: '0.65rem', color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Obras</p>
                </div>
                <div style={{ background: 'rgba(30,32,38,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white' }}>{rpg.totalCards}</p>
                    <p style={{ fontSize: '0.65rem', color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Cards</p>
                </div>
            </div>

            {/* Evolution Path */}
            <div style={{ background: 'rgba(30,32,38,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.25rem', padding: '1.25rem' }}>
                <h3 style={{ color: '#aaa', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Caminho de Evolução</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {Object.entries(classConfig).map(([key, cfg], idx) => {
                        const reached = Object.keys(classConfig).indexOf(rpg.characterClass) >= idx;
                        return (
                            <div key={key} style={{ textAlign: 'center', opacity: reached ? 1 : 0.3 }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: reached ? `${cfg.color}20` : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.25rem', border: reached ? `2px solid ${cfg.color}` : '2px solid transparent', color: cfg.color }}>
                                    {cfg.icon}
                                </div>
                                <p style={{ fontSize: '0.65rem', fontWeight: 700, color: reached ? cfg.color : '#666' }}>{cfg.label}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
