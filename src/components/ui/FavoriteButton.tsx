import React, { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { api } from '../../api/client';

interface FavoriteButtonProps {
    workId: string;
    size?: number;
    showCount?: boolean;
}

/**
 * Favorite Button Component
 * Toggles favorite status for a work
 */
export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
    workId,
    size = 24,
    showCount = false
}) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);
    const [count, setCount] = useState(0);

    const checkFavoriteStatus = useCallback(async () => {
        try {
            const res = await api.get(`/favorites/check/${workId}`);
            setIsFavorite(res.data.isFavorite);
        } catch (error) {
            console.error('Error checking favorite:', error);
        }
    }, [workId]);

    useEffect(() => {
        checkFavoriteStatus();
    }, [workId, checkFavoriteStatus]);

    const toggleFavorite = async () => {
        if (loading) return;

        setLoading(true);
        try {
            if (isFavorite) {
                await api.delete(`/favorites/${workId}`);
                setIsFavorite(false);
                setCount(c => Math.max(0, c - 1));
            } else {
                await api.post(`/favorites/${workId}`);
                setIsFavorite(true);
                setCount(c => c + 1);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleFavorite}
            disabled={loading}
            className={`favorite-button ${isFavorite ? 'is-favorite' : ''}`}
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            aria-pressed={isFavorite}
        >
            <Heart
                size={size}
                fill={isFavorite ? 'currentColor' : 'none'}
                className={loading ? 'pulse' : ''}
            />
            {showCount && count > 0 && (
                <span className="favorite-count">{count}</span>
            )}

            <style>{`
                .favorite-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    color: var(--fg-muted, #9ca3af);
                    transition: all 0.2s ease;
                }
                
                .favorite-button:hover:not(:disabled) {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                    transform: scale(1.1);
                }
                
                .favorite-button.is-favorite {
                    color: #ef4444;
                }
                
                .favorite-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                
                .favorite-button .pulse {
                    animation: pulse 0.5s ease infinite;
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                }
                
                .favorite-count {
                    font-size: 0.85rem;
                    font-weight: bold;
                }
            `}</style>
        </button>
    );
};
