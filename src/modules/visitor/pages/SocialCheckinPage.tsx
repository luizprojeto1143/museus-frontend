import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, MapPin, Send, Smile } from "lucide-react";
import { toast } from "react-hot-toast";

const emojiOptions = ['🏛️', '🎨', '✨', '📸', '🎭', '🎶', '❤️', '🔥', '🌟', '👀'];

export const SocialCheckinPage: React.FC = () => {
    const { tenantId } = useAuth();
    const [checkins, setCheckins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [emoji, setEmoji] = useState('🏛️');
    const [posting, setPosting] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get(`/social-checkin?tenantId=${tenantId}`);
            setCheckins(res.data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    }, [tenantId]);

    useEffect(() => { if (tenantId) fetchData(); }, [tenantId, fetchData]);

    const onPost = async () => {
        setPosting(true);
        try {
            await api.post('/social-checkin', { message, emoji });
            toast.success("Check-in realizado! 🎉");
            setMessage('');
            fetchData();
        } catch (err) { toast.error("Erro"); }
        finally { setPosting(false); }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}><Loader2 className="animate-spin" style={{ color: '#d4af37' }} /></div>;

    return (
        <div style={{ padding: '1.5rem', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <MapPin size={36} style={{ color: '#d4af37', margin: '0 auto 0.5rem' }} />
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white' }}>Check-in</h1>
                <p style={{ color: '#888', fontSize: '0.85rem' }}>Marque presença e compartilhe sua visita!</p>
            </div>

            {/* Post form */}
            <div style={{ background: 'rgba(30,32,38,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.25rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="O que achou da visita? (opcional)" rows={2} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: 'white', fontSize: '0.9rem', outline: 'none', resize: 'none', marginBottom: '0.75rem' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {emojiOptions.map(e => (
                            <button key={e} onClick={() => setEmoji(e)} style={{ fontSize: '1.2rem', padding: '0.25rem 0.4rem', borderRadius: '0.5rem', border: 'none', background: emoji === e ? 'rgba(212,175,55,0.2)' : 'transparent', cursor: 'pointer', filter: emoji === e ? 'none' : 'grayscale(0.5)', transition: 'all 0.2s' }}>{e}</button>
                        ))}
                    </div>
                    <button onClick={onPost} disabled={posting} style={{ background: 'linear-gradient(135deg, #d4af37, #b8941e)', color: '#1a1108', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '1rem', fontWeight: 800, fontSize: '0.85rem', cursor: posting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {posting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        Check-in!
                    </button>
                </div>
            </div>

            {/* Feed */}
            <div style={{ display: 'grid', gap: '0.75rem' }}>
                {checkins.map((c: any) => (
                    <div key={c.id} style={{ background: 'rgba(30,32,38,0.9)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem', padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '1.5rem' }}>{c.emoji || '🏛️'}</span>
                        <div style={{ flex: 1 }}>
                            {c.message && <p style={{ color: '#ddd', fontSize: '0.85rem', marginBottom: '0.25rem' }}>{c.message}</p>}
                            <p style={{ color: '#666', fontSize: '0.7rem' }}>{new Date(c.createdAt).toLocaleString("pt-BR")}</p>
                        </div>
                    </div>
                ))}
                {checkins.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                        <Smile size={36} style={{ opacity: 0.2, margin: '0 auto 0.75rem' }} />
                        <p style={{ fontSize: '0.85rem' }}>Ninguém fez check-in ainda. Seja o primeiro!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
