import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, User, Clock, Filter, MessageCircle, BookOpen, Eye, EyeOff } from 'lucide-react';
import { api } from '../../../api/client';
import { useAuth } from '../../auth/AuthContext';

interface Review {
    id: string;
    rating: number;
    comment: string | null;
    approved: boolean;
    createdAt: string;
    visitor: {
        name: string;
        photoUrl: string | null;
    };
    work?: { title: string };
    event?: { title: string };
}

interface GuestbookEntry {
    id: string;
    message: string;
    isVisible: boolean;
    createdAt: string;
    visitor: {
        name: string;
        photoUrl: string | null;
    };
}

type TabMode = 'reviews' | 'guestbook';

export const AdminReviews: React.FC = () => {
    const { tenantId } = useAuth();
    const [mode, setMode] = useState<TabMode>('reviews');

    // Reviews State
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved'>('pending');

    // Guestbook State
    const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (mode === 'reviews') fetchReviews();
        else fetchGuestbook();
    }, [tenantId, mode, reviewFilter]);

    const fetchReviews = async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const approved = reviewFilter === 'all' ? 'all' : reviewFilter === 'approved' ? 'true' : 'false';
            const res = await api.get(`/reviews?tenantId=${tenantId}&approved=${approved}`);
            setReviews(res.data.reviews || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGuestbook = async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const res = await api.get(`/guestbook?tenantId=${tenantId}&includeHidden=true`);
            setGuestbook(res.data);
        } catch (error) {
            console.error('Error fetching guestbook:', error);
        } finally {
            setLoading(false);
        }
    };

    // Review Actions
    const handleApproveReview = async (id: string) => {
        try {
            await api.patch(`/reviews/${id}/approve`);
            setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: true } : r));
        } catch (error) {
            alert('Erro ao aprovar');
        }
    };

    const handleDeleteReview = async (id: string) => {
        if (!confirm('Excluir avaliação?')) return;
        try {
            await api.delete(`/reviews/${id}`);
            setReviews(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            alert('Erro ao excluir');
        }
    };

    // Guestbook Actions
    const handleToggleVisibility = async (id: string, currentStatus: boolean) => {
        try {
            await api.patch(`/guestbook/${id}/visibility`, { isVisible: !currentStatus });
            setGuestbook(prev => prev.map(g => g.id === id ? { ...g, isVisible: !currentStatus } : g));
        } catch (error) {
            alert('Erro ao atualizar');
        }
    };

    const handleDeleteGuestbook = async (id: string) => {
        if (!confirm('Excluir mensagem do livro de visitas?')) return;
        try {
            await api.delete(`/guestbook/${id}`);
            setGuestbook(prev => prev.filter(g => g.id !== id));
        } catch (error) {
            alert('Erro ao excluir');
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <Star
                key={i}
                size={16}
                fill={i < rating ? '#fbbf24' : 'none'}
                color={i < rating ? '#fbbf24' : '#6b7280'}
            />
        ));
    };

    const pendingCount = reviews.filter(r => !r.approved).length;

    return (
        <div className="admin-reviews-page">
            <header className="page-header">
                <div>
                    <h1>🛡️ Central de Moderação</h1>
                    <p className="subtitle">Gerencie avaliações e mensagens da comunidade</p>
                </div>
            </header>

            {/* Mode Tabs */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem" }}>
                <button
                    onClick={() => setMode('reviews')}
                    style={{
                        background: "transparent",
                        border: "none",
                        borderBottom: mode === "reviews" ? "2px solid #d4af37" : "none",
                        color: mode === "reviews" ? "#d4af37" : "#aaa",
                        fontSize: "1.1rem",
                        fontWeight: "bold",
                        padding: "0.5rem 1rem",
                        cursor: "pointer",
                        display: "flex",
                        gap: "0.5rem"
                    }}
                >
                    <Star size={18} /> Avaliações {pendingCount > 0 && <span className='badge-count'>{pendingCount}</span>}
                </button>
                <button
                    onClick={() => setMode('guestbook')}
                    style={{
                        background: "transparent",
                        border: "none",
                        borderBottom: mode === "guestbook" ? "2px solid #d4af37" : "none",
                        color: mode === "guestbook" ? "#d4af37" : "#aaa",
                        fontSize: "1.1rem",
                        fontWeight: "bold",
                        padding: "0.5rem 1rem",
                        cursor: "pointer",
                        display: "flex",
                        gap: "0.5rem"
                    }}
                >
                    <BookOpen size={18} /> Livro de Visitas
                </button>
            </div>

            {mode === 'reviews' && (
                <>
                    {/* Filters */}
                    <div className="filters-bar">
                        <button
                            className={`filter-btn ${reviewFilter === 'pending' ? 'active' : ''}`}
                            onClick={() => setReviewFilter('pending')}
                        >
                            <Clock size={16} /> Pendentes
                        </button>
                        <button
                            className={`filter-btn ${reviewFilter === 'approved' ? 'active' : ''}`}
                            onClick={() => setReviewFilter('approved')}
                        >
                            <CheckCircle size={16} /> Aprovadas
                        </button>
                        <button
                            className={`filter-btn ${reviewFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setReviewFilter('all')}
                        >
                            <Filter size={16} /> Todas
                        </button>
                    </div>

                    {/* Reviews List */}
                    <div className="reviews-list">
                        {loading ? (
                            <div className="loading-state">Carregando avaliações...</div>
                        ) : reviews.length === 0 ? (
                            <div className="empty-state">
                                <MessageCircle size={48} />
                                <h3>Nenhuma avaliação {reviewFilter === 'pending' ? 'pendente' : ''}</h3>
                            </div>
                        ) : (
                            reviews.map(review => (
                                <div key={review.id} className={`review-card ${review.approved ? 'approved' : 'pending'}`}>
                                    <div className="review-header">
                                        <div className="visitor-info">
                                            <div className="visitor-avatar">
                                                {review.visitor.photoUrl ? (
                                                    <img src={review.visitor.photoUrl} alt="" />
                                                ) : (
                                                    <User size={20} />
                                                )}
                                            </div>
                                            <div>
                                                <span className="visitor-name">{review.visitor.name}</span>
                                                <span className="review-date">
                                                    {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="review-rating">
                                            {renderStars(review.rating)}
                                        </div>
                                    </div>

                                    <div className="review-target">
                                        {review.work ? `📷 ${review.work.title}` : review.event ? `🎭 ${review.event.title}` : ''}
                                    </div>

                                    {review.comment && (
                                        <p className="review-comment">"{review.comment}"</p>
                                    )}

                                    <div className="review-actions">
                                        {!review.approved && (
                                            <button className="approve-btn" onClick={() => handleApproveReview(review.id)}>
                                                <CheckCircle size={16} /> Aprovar
                                            </button>
                                        )}
                                        <button className="delete-btn" onClick={() => handleDeleteReview(review.id)}>
                                            <XCircle size={16} /> Excluir
                                        </button>
                                        {review.approved && (
                                            <span className="approved-badge">✓ Publicada</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {mode === 'guestbook' && (
                <div className="guestbook-list" style={{ display: 'grid', gap: '1rem' }}>
                    {loading ? (
                        <div className="loading-state">Carregando livro de visitas...</div>
                    ) : guestbook.length === 0 ? (
                        <div className="empty-state">
                            <BookOpen size={48} />
                            <h3>Livro de visitas vazio</h3>
                        </div>
                    ) : (
                        guestbook.map(entry => (
                            <div key={entry.id} style={{
                                background: "var(--bg-card, #1f2937)",
                                borderRadius: "1rem",
                                padding: "1.5rem",
                                border: entry.isVisible ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(239, 68, 68, 0.3)",
                                opacity: entry.isVisible ? 1 : 0.7
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <div className="visitor-avatar">
                                            {entry.visitor.photoUrl ? <img src={entry.visitor.photoUrl} /> : <User size={20} />}
                                        </div>
                                        <div>
                                            <span style={{ fontWeight: "bold", display: "block" }}>{entry.visitor.name || "Visitante"}</span>
                                            <span style={{ fontSize: "0.85rem", opacity: 0.6 }}>{new Date(entry.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <button
                                            onClick={() => handleToggleVisibility(entry.id, entry.isVisible)}
                                            style={{
                                                background: entry.isVisible ? "rgba(255,255,255,0.1)" : "#d4af37",
                                                color: entry.isVisible ? "white" : "black",
                                                border: "none", padding: "0.5rem", borderRadius: "0.5rem", cursor: "pointer"
                                            }}
                                            title={entry.isVisible ? "Ocultar" : "Exibir"}
                                        >
                                            {entry.isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteGuestbook(entry.id)}
                                            style={{ background: "rgba(239, 68, 68, 0.2)", color: "#ef4444", border: "none", padding: "0.5rem", borderRadius: "0.5rem", cursor: "pointer" }}
                                            title="Excluir"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                    </div>
                                </div>

                                <p style={{ fontStyle: "italic", fontSize: "1.1rem", marginBottom: "1rem" }}>"{entry.message}"</p>

                                {!entry.isVisible && (
                                    <span style={{ fontSize: "0.8rem", color: "#ef4444", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                        <EyeOff size={12} /> Oculto para o público
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            <style>{`
                .admin-reviews-page { padding: 24px; }
                .page-header { margin-bottom: 24px; }
                .page-header h1 { margin: 0; font-size: 1.75rem; color: #f3f4f6; }
                .subtitle { margin: 4px 0 0; color: #9ca3af; }
                .badge-count { background: #ef4444; color: white; padding: 2px 6px; borderRadius: 10px; fontSize: 0.7rem; verticalAlign: top; }
                
                .filters-bar { display: flex; gap: 8px; margin-bottom: 20px; }
                .filter-btn { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: #374151; border: none; border-radius: 8px; color: #9ca3af; cursor: pointer; transition: all 0.2s; }
                .filter-btn.active { background: #d4af37; color: black; }
                
                .reviews-list { display: flex; flex-direction: column; gap: 16px; }
                .review-card { background: #1f2937; border-radius: 12px; padding: 20px; border-left: 4px solid transparent; }
                .review-card.pending { border-left-color: #f59e0b; }
                .review-card.approved { border-left-color: #22c55e; }
                
                .review-header { display: flex; justifyContent: space-between; margin-bottom: 12px; }
                .visitor-info { display: flex; align-items: center; gap: 12px; }
                .visitor-avatar { width: 40px; height: 40px; border-radius: 50%; background: #374151; display: flex; alignItems: center; justifyContent: center; overflow: hidden; }
                .visitor-avatar img { width: 100%; height: 100%; objectFit: cover; }
                .visitor-name { font-weight: 600; color: #f3f4f6; }
                .review-date { font-size: 0.85rem; color: #9ca3af; display: block; }
                
                .review-comment { font-style: italic; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; margin-bottom: 16px; }
                .review-actions { display: flex; gap: 12px; align-items: center; }
                
                .approve-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #22c55e; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
                .delete-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: rgba(239, 68, 68, 0.2); color: #ef4444; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
                .approved-badge { margin-left: auto; color: #22c55e; font-weight: bold; font-size: 0.9rem; }
                
                .loading-state, .empty-state { text-align: center; padding: 40px; color: #6b7280; }
            `}</style>
        </div>
    );
};
