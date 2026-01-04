import React from 'react';

interface SkeletonProps {
    variant?: 'text' | 'circular' | 'rectangular' | 'card';
    width?: string | number;
    height?: string | number;
    count?: number;
    className?: string;
}

/**
 * Skeleton Loader Component
 * Beautiful loading placeholders
 */
export const Skeleton: React.FC<SkeletonProps> = ({
    variant = 'text',
    width,
    height,
    count = 1,
    className = ''
}) => {
    const getStyles = (): React.CSSProperties => {
        const baseStyles: React.CSSProperties = {
            background: 'linear-gradient(90deg, var(--skeleton-base, #374151) 25%, var(--skeleton-shine, #4b5563) 50%, var(--skeleton-base, #374151) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
        };

        switch (variant) {
            case 'circular':
                return {
                    ...baseStyles,
                    width: width || 48,
                    height: height || 48,
                    borderRadius: '50%',
                };
            case 'rectangular':
                return {
                    ...baseStyles,
                    width: width || '100%',
                    height: height || 200,
                    borderRadius: 12,
                };
            case 'card':
                return {
                    ...baseStyles,
                    width: width || '100%',
                    height: height || 300,
                    borderRadius: 16,
                };
            default: // text
                return {
                    ...baseStyles,
                    width: width || '100%',
                    height: height || 20,
                    borderRadius: 8,
                };
        }
    };

    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={`skeleton ${className}`}
                    style={getStyles()}
                    aria-hidden="true"
                />
            ))}
            <style>{`
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                
                .skeleton {
                    display: block;
                }
                
                .skeleton + .skeleton {
                    margin-top: 12px;
                }
            `}</style>
        </>
    );
};

/**
 * Card Skeleton - Pre-built skeleton for cards
 */
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="card-skeleton">
                    <Skeleton variant="rectangular" height={180} />
                    <div className="card-skeleton-content">
                        <Skeleton variant="text" width="80%" />
                        <Skeleton variant="text" width="60%" />
                        <div className="card-skeleton-footer">
                            <Skeleton variant="text" width={80} height={24} />
                            <Skeleton variant="text" width={60} height={24} />
                        </div>
                    </div>
                </div>
            ))}
            <style>{`
                .card-skeleton {
                    background: var(--bg-card, #1f2937);
                    border-radius: 16px;
                    overflow: hidden;
                }
                
                .card-skeleton-content {
                    padding: 16px;
                }
                
                .card-skeleton-content .skeleton + .skeleton {
                    margin-top: 8px;
                }
                
                .card-skeleton-footer {
                    display: flex;
                    gap: 12px;
                    margin-top: 16px;
                }
            `}</style>
        </>
    );
};

/**
 * List Skeleton - Pre-built skeleton for lists
 */
export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="list-skeleton-item">
                    <Skeleton variant="circular" width={48} height={48} />
                    <div className="list-skeleton-content">
                        <Skeleton variant="text" width="70%" />
                        <Skeleton variant="text" width="40%" height={14} />
                    </div>
                </div>
            ))}
            <style>{`
                .list-skeleton-item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    background: var(--bg-card, #1f2937);
                    border-radius: 12px;
                    margin-bottom: 8px;
                }
                
                .list-skeleton-content {
                    flex: 1;
                }
                
                .list-skeleton-content .skeleton + .skeleton {
                    margin-top: 8px;
                }
            `}</style>
        </>
    );
};
