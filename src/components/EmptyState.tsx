import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
    title: string;
    description: string;
    icon: LucideIcon;
    actionLabel?: string;
    actionLink?: string;
    onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    icon: Icon,
    actionLabel,
    actionLink,
    onAction
}) => {
    const navigate = useNavigate();

    const handleAction = () => {
        if (onAction) {
            onAction();
        } else if (actionLink) {
            navigate(actionLink);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '16px',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
            margin: '2rem 0'
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '1.5rem',
                borderRadius: '50%',
                marginBottom: '1.5rem'
            }}>
                <Icon size={48} color="#9ca3af" />
            </div>

            <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#e5e7eb',
                marginBottom: '0.5rem'
            }}>
                {title}
            </h3>

            <p style={{
                color: '#9ca3af',
                maxWidth: '400px',
                lineHeight: '1.6',
                marginBottom: actionLabel ? '2rem' : '0'
            }}>
                {description}
            </p>

            {actionLabel && (
                <button
                    onClick={handleAction}
                    style={{
                        background: '#d4af37',
                        color: '#000',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};
