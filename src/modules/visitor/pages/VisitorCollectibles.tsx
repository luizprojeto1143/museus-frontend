import { useTranslation } from "react-i18next";
import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Sparkles, Star, Zap, Crown, Diamond, Lock } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const rarityConfig: Record<string, { label: string; color: string; gradient: string; icon: React.ReactNode }> = {
    COMMON: { label: 'Comum', color: '#9ca3af', gradient: 'linear-gradient(135deg, #374151, #1f2937)', icon: <Star size={14} /> },
    RARE: { label: 'Raro', color: '#60a5fa', gradient: 'linear-gradient(135deg, #1e3a5f, #1e293b)', icon: <Zap size={14} /> },
    EPIC: { label: 'Épico', color: '#a78bfa', gradient: 'linear-gradient(135deg, #3b1f6e, #1e1b3a)', icon: <Crown size={14} /> },
    LEGENDARY: { label: 'Lendário', color: '#d4af37', gradient: 'linear-gradient(135deg, #5c4a1e, #2d2310)', icon: <Diamond size={14} /> }
};

export const VisitorCollectibles: React.FC = () => {
  const { t } = useTranslation();
    const { tenantId, isGuest } = useAuth();
    const navigate = useNavigate();
    const [allCards, setAllCards] = useState<any[]>([]);
    const [myCards, setMyCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'collection' | 'all'>('collection');

    const fetchData = useCallback(async () => {
        try {
            const [all, my] = await Promise.all([
                api.get(`/collectibles?tenantId=${tenantId}`),
                api.get('/collectibles/my')
            ]);
            setAllCards(all.data);
            setMyCards(my.data);
        } catch (error) { console.error(error); toast.error("Erro ao carregar"); }
        finally { setLoading(false); }
    }, [tenantId]);

    useEffect(() => { if (tenantId) fetchData(); }, [tenantId, fetchData]);

    const myCardIds = new Set(myCards.map((c: any) => c.cardId));
    const totalCards = allCards.length;
    const ownedCount = myCards.length;
    const pct = totalCards > 0 ? Math.round((ownedCount / totalCards) * 100) : 0;

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}><Loader2 className="animate-spin" style={{ color: '#d4af37' }} /></div>;

    if (isGuest) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '400px', margin: '4rem auto' }}>
                <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 800 }}>Recurso Exclusivo</h2>
                <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '0.9rem' }}>Crie uma conta gratuita para colecionar cards, interagir com o museu e ganhar recompensas virtuais!</p>
                <button onClick={() => navigate('/register')} style={{ background: 'linear-gradient(135deg, #d4af37, #b8941e)', color: '#1a1108', padding: '0.8rem 2rem', borderRadius: '1rem', fontWeight: 900, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(212,175,55,0.3)', width: '100%' }}>Criar Conta Gratuita</button>
            </div>
        );
    }

    return (
        <div style={{ padding: '1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <Sparkles size={36} style={{ color: '#d4af37', margin: '0 auto 0.5rem' }} />
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white' }}>{t("visitor.collectibles.minhaColeo", `Minha Coleção`)}</h1>
                <p style={{ color: '#888', fontSize: '0.85rem' }}>{ownedCount} de {totalCards} cards • {pct}% completo</p>
                <div style={{ width: '100%', maxWidth: '300px', margin: '0.75rem auto 0', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #d4af37, #f5d76e)', borderRadius: '3px', transition: 'width 0.5s' }} />
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <button onClick={() => setTab('collection')} style={{ padding: '0.5rem 1.25rem', borderRadius: '2rem', border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', background: tab === 'collection' ? '#d4af37' : 'rgba(255,255,255,0.05)', color: tab === 'collection' ? '#1a1108' : '#888' }}>
                    Meus Cards ({ownedCount})
                </button>
                <button onClick={() => setTab('all')} style={{ padding: '0.5rem 1.25rem', borderRadius: '2rem', border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', background: tab === 'all' ? '#d4af37' : 'rgba(255,255,255,0.05)', color: tab === 'all' ? '#1a1108' : '#888' }}>
                    Todos ({totalCards})
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {(tab === 'collection' ? myCards.map((mc: any) => ({ ...mc.card, owned: true })) : allCards.map((c: any) => ({ ...c, owned: myCardIds.has(c.id) }))).map((card: any) => {
                    const r = rarityConfig[card.rarity] || rarityConfig.COMMON;
                    return (
                        <div key={card.id} style={{
                            background: r.gradient,
                            border: `1px solid ${card.owned ? r.color + '40' : 'rgba(255,255,255,0.05)'}`,
                            borderRadius: '1.25rem',
                            padding: '1.25rem',
                            textAlign: 'center',
                            position: 'relative',
                            opacity: card.owned ? 1 : 0.5
                        }}>
                            {!card.owned && <Lock size={20} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', color: '#666' }} />}
                            {card.imageUrl ? (
                                <img src={card.imageUrl} alt={card.title} style={{ width: '60px', height: '60px', borderRadius: '0.75rem', objectFit: 'cover', margin: '0 auto 0.75rem' }} />
                            ) : (
                                <div style={{ width: '60px', height: '60px', borderRadius: '0.75rem', margin: '0 auto 0.75rem', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Sparkles size={24} style={{ color: r.color }} />
                                </div>
                            )}
                            <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>{card.title}</h3>
                            <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '0.25rem', fontWeight: 700, background: r.color + '20', color: r.color, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                {r.icon} {r.label}
                            </span>
                            <p style={{ color: '#666', fontSize: '0.7rem', marginTop: '0.5rem' }}>+{card.xpReward} XP</p>
                        </div>
                    );
                })}
            </div>

            {tab === 'collection' && myCards.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#666' }}>
                    <Sparkles size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                    <p>{t("visitor.collectibles.vocAindaNoColetouNenhumCard", `Você ainda não coletou nenhum card`)}</p>
                    <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Visite obras e complete desafios para ganhar cards!</p>
                </div>
            )}
        </div>
    );
};
