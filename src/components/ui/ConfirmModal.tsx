import React from 'react';
import { AlertTriangle, Trash2, Check } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    loading?: boolean;
}

/**
 * Confirmation Modal Component
 * Used for destructive actions like delete, cancel, etc.
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirmar Ação',
    message = 'Tem certeza que deseja continuar?',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger',
    loading = false
}) => {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: <Trash2 size={32} />,
            iconBg: '#ef4444',
            confirmBg: 'linear-gradient(135deg, #ef4444, #dc2626)',
        },
        warning: {
            icon: <AlertTriangle size={32} />,
            iconBg: '#f59e0b',
            confirmBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
        },
        info: {
            icon: <Check size={32} />,
            iconBg: '#3b82f6',
            confirmBg: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        }
    };

    const style = variantStyles[variant];

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    };

    return (
        <div
            className="confirm-modal-backdrop"
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
        >
            <div className="confirm-modal">
                {/* Icon */}
                <div
                    className="confirm-modal-icon"
                    style={{ background: style.iconBg }}
                >
                    {style.icon}
                </div>

                {/* Content */}
                <h2 id="confirm-modal-title" className="confirm-modal-title">
                    {title}
                </h2>
                <p className="confirm-modal-message">
                    {message}
                </p>

                {/* Actions */}
                <div className="confirm-modal-actions">
                    <button
                        className="confirm-modal-btn cancel"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>
                    <button
                        className="confirm-modal-btn confirm"
                        onClick={onConfirm}
                        disabled={loading}
                        style={{ background: style.confirmBg }}
                    >
                        {loading ? (
                            <span className="loading-spinner" />
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>

            <style>{`
                .confirm-modal-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    animation: fadeIn 0.2s ease;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                .confirm-modal {
                    background: var(--bg-card, #1f2937);
                    border-radius: 20px;
                    padding: 32px;
                    max-width: 400px;
                    width: 90%;
                    text-align: center;
                    animation: scaleIn 0.2s ease;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
                }
                
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                
                .confirm-modal-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    color: white;
                }
                
                .confirm-modal-title {
                    margin: 0 0 12px;
                    font-size: 1.4rem;
                    color: var(--fg-main, #f3f4f6);
                }
                
                .confirm-modal-message {
                    margin: 0 0 24px;
                    color: var(--fg-muted, #9ca3af);
                    line-height: 1.6;
                }
                
                .confirm-modal-actions {
                    display: flex;
                    gap: 12px;
                }
                
                .confirm-modal-btn {
                    flex: 1;
                    padding: 14px 24px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    border: none;
                    transition: transform 0.2s, opacity 0.2s;
                }
                
                .confirm-modal-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                
                .confirm-modal-btn:not(:disabled):hover {
                    transform: translateY(-2px);
                }
                
                .confirm-modal-btn.cancel {
                    background: var(--bg-elevated, #374151);
                    color: var(--fg-main, #f3f4f6);
                }
                
                .confirm-modal-btn.confirm {
                    color: white;
                }
                
                .loading-spinner {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};
