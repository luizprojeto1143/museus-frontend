import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, User, Clock, Filter, MessageCircle } from 'lucide-react';
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

export const AdminReviews: React.FC = () => {
    const { tenantId } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

    useEffect(() => {
        fetchReviews();
    }, [tenantId, filter]);

    const fetchReviews = async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const approved = filter === 'all' ? 'all' : filter === 'approved' ? 'true' : 'false';
            const res = await api.get(`/reviews?tenantId=${tenantId}&approved=${approved}`);
            setReviews(res.data.reviews);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await api.patch(`/reviews/${id}/approve`);
            setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: true } : r));
        } catch (error) {
            console.error('Error approving review:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta avaliação?')) return;
        try {
            await api.delete(`/reviews/${id}`);
            setReviews(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error('Error deleting review:', error);
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
                    <h1>⭐ Moderação de Avaliações</h1>
                    <p className="subtitle">Aprove ou rejeite avaliações dos visitantes</p>
                </div>
                {pendingCount > 0 && (
                    <div className="pending-badge">
                        {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
                    </div>
                )}
            </header>

            {/* Filters */}
            <div className="filters-bar">
                <button
                    className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilter('pending')}
                >
                    <Clock size={16} /> Pendentes
                </button>
                <button
                    className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
                    onClick={() => setFilter('approved')}
                >
                    <CheckCircle size={16} /> Aprovadas
                </button>
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
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
                        <h3>Nenhuma avaliação {filter === 'pending' ? 'pendente' : ''}</h3>
                        <p>As avaliações dos visitantes aparecerão aqui</p>
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
                                    <button
                                        className="approve-btn"
                                        onClick={() => handleApprove(review.id)}
                                    >
                                        <CheckCircle size={16} /> Aprovar
                                    </button>
                                )}
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDelete(review.id)}
                                >
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

            <style>{`
                .admin-reviews-page {
                    padding: 24px;
                }
                
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 24px;
                }
                
                .page-header h1 {
                    margin: 0;
                    font-size: 1.75rem;
                    color: var(--fg-main, #f3f4f6);
                }
                
                .subtitle {
                    margin: 4px 0 0;
                    color: var(--fg-muted, #9ca3af);
                }
                
                .pending-badge {
                    padding: 8px 16px;
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    border-radius: 20px;
                    color: white;
                    font-weight: bold;
                }
                
                .filters-bar {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 20px;
                }
                
                .filter-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: var(--bg-card, #1f2937);
                    border: 1px solid var(--border-color, #374151);
                    border-radius: 8px;
                    color: var(--fg-muted, #9ca3af);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .filter-btn.active {
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    border-color: transparent;
                    color: white;
                }
                
                .reviews-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                
                .review-card {
                    background: var(--bg-card, #1f2937);
                    border-radius: 16px;
                    padding: 20px;
                    border-left: 4px solid transparent;
                }
                
                .review-card.pending {
                    border-left-color: #f59e0b;
                }
                
                .review-card.approved {
                    border-left-color: #22c55e;
                }
                
                .review-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 12px;
                }
                
                .visitor-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .visitor-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--bg-elevated, #374151);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    color: var(--fg-muted, #9ca3af);
                }
                
                .visitor-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .visitor-name {
                    display: block;
                    font-weight: 600;
                    color: var(--fg-main, #f3f4f6);
                }
                
                .review-date {
                    font-size: 0.85rem;
                    color: var(--fg-muted, #9ca3af);
                }
                
                .review-rating {
                    display: flex;
                    gap: 2px;
                }
                
                .review-target {
                    font-size: 0.9rem;
                    color: var(--fg-muted, #9ca3af);
                    margin-bottom: 12px;
                }
                
                .review-comment {
                    font-style: italic;
                    color: var(--fg-main, #f3f4f6);
                    margin: 0 0 16px;
                    padding: 12px;
                    background: var(--bg-elevated, #374151);
                    border-radius: 8px;
                    line-height: 1.6;
                }
                
                .review-actions {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }
                
                .approve-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    background: #22c55e;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }
                
                .delete-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }
                
                .approved-badge {
                    margin-left: auto;
                    padding: 6px 12px;
                    background: rgba(34, 197, 94, 0.2);
                    color: #22c55e;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                }
                
                .loading-state, .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: var(--fg-muted, #9ca3af);
                }
                
                .empty-state h3 {
                    margin: 16px 0 8px;
                    color: var(--fg-main, #f3f4f6);
                }
            `}</style>
        </div>
    );
};
