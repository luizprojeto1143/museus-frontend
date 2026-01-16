import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    rating?: number;
    maxStars?: number;
    size?: number;
    readonly?: boolean;
    onChange?: (rating: number) => void;
    showLabel?: boolean;
}

/**
 * Star Rating Component
 * Interactive or display-only star rating
 */
export const StarRating: React.FC<StarRatingProps> = ({
    rating = 0,
    maxStars = 5,
    size = 24,
    readonly = false,
    onChange,
    showLabel = false
}) => {
    const [hoverRating, setHoverRating] = useState(0);
    const [currentRating, setCurrentRating] = useState(rating);

    const handleClick = (star: number) => {
        if (readonly) return;
        setCurrentRating(star);
        onChange?.(star);
    };

    const handleMouseEnter = (star: number) => {
        if (readonly) return;
        setHoverRating(star);
    };

    const handleMouseLeave = () => {
        setHoverRating(0);
    };

    const displayRating = hoverRating || currentRating;

    const labels = ['', 'Ruim', 'Regular', 'Bom', 'Muito Bom', 'Excelente'];

    return (
        <div className="star-rating-container">
            <div
                className={`star-rating ${readonly ? 'readonly' : 'interactive'}`}
                role="radiogroup"
                aria-label="Avaliação em estrelas"
            >
                {Array.from({ length: maxStars }).map((_, index) => {
                    const starValue = index + 1;
                    const isFilled = starValue <= displayRating;
                    const isHalf = !isFilled && starValue - 0.5 <= displayRating;

                    return (
                        <button
                            key={starValue}
                            type="button"
                            className={`star ${isFilled ? 'filled' : ''} ${isHalf ? 'half' : ''}`}
                            onClick={() => handleClick(starValue)}
                            onMouseEnter={() => handleMouseEnter(starValue)}
                            onMouseLeave={handleMouseLeave}
                            disabled={readonly}
                            aria-label={`${starValue} estrelas`}
                            aria-checked={currentRating === starValue}
                            role="radio"
                        >
                            <Star
                                size={size}
                                fill={isFilled ? 'currentColor' : 'none'}
                            />
                        </button>
                    );
                })}
            </div>

            {showLabel && displayRating > 0 && (
                <span className="rating-label">{labels[Math.round(displayRating)]}</span>
            )}

            <style>{`
                .star-rating-container {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .star-rating {
                    display: flex;
                    gap: 4px;
                }
                
                .star-rating .star {
                    padding: 2px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--fg-muted, #9ca3af);
                    transition: transform 0.15s, color 0.15s;
                }
                
                .star-rating.interactive .star:hover {
                    transform: scale(1.2);
                }
                
                .star-rating .star.filled {
                    color: #fbbf24;
                }
                
                .star-rating.readonly .star {
                    cursor: default;
                }
                
                .rating-label {
                    font-size: 0.9rem;
                    color: var(--fg-muted, #9ca3af);
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
};

/**
 * Review Form Component
 * Complete form for submitting reviews
 */
interface ReviewFormProps {
    workId?: string;
    eventId?: string;
    onSubmit?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
    workId,
    eventId,
    onSubmit
}) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            setError('Por favor, selecione uma avaliação');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { api } = await import('../../api/client');
            await api.post('/reviews', {
                rating,
                comment: comment.trim() || undefined,
                workId,
                eventId
            });
            setSuccess(true);
            setRating(0);
            setComment('');
            onSubmit?.();
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setError((err as any).response?.data?.message || 'Erro ao enviar avaliação');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="review-success">
                <div className="success-icon">✓</div>
                <h4>Obrigado pela sua avaliação!</h4>
                <p>Sua opinião será revisada e publicada em breve.</p>
                <button onClick={() => setSuccess(false)}>Avaliar novamente</button>

                <style>{`
                    .review-success {
                        text-align: center;
                        padding: 24px;
                        background: var(--bg-card, #1f2937);
                        border-radius: 16px;
                    }
                    .success-icon {
                        width: 60px;
                        height: 60px;
                        margin: 0 auto 16px;
                        background: linear-gradient(135deg, #22c55e, #16a34a);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 28px;
                        color: white;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="review-form">
            <h4>Avalie sua experiência</h4>

            <div className="rating-section">
                <StarRating
                    rating={rating}
                    onChange={setRating}
                    size={32}
                    showLabel
                />
            </div>

            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Compartilhe sua experiência (opcional)"
                rows={3}
                maxLength={500}
            />

            {error && <p className="error-message">{error}</p>}

            <button
                type="submit"
                disabled={loading || rating === 0}
                className="submit-btn"
            >
                {loading ? 'Enviando...' : 'Enviar Avaliação'}
            </button>

            <style>{`
                .review-form {
                    padding: 20px;
                    background: var(--bg-card, #1f2937);
                    border-radius: 16px;
                }
                .review-form h4 {
                    margin: 0 0 16px;
                    color: var(--fg-main, #f3f4f6);
                }
                .rating-section {
                    margin-bottom: 16px;
                }
                .review-form textarea {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid var(--border-color, #374151);
                    border-radius: 8px;
                    background: var(--bg-elevated, #374151);
                    color: var(--fg-main, #f3f4f6);
                    resize: vertical;
                    margin-bottom: 12px;
                }
                .review-form .error-message {
                    color: #ef4444;
                    font-size: 0.9rem;
                    margin-bottom: 12px;
                }
                .submit-btn {
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }
                .submit-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
            `}</style>
        </form>
    );
};
