import React, { useState } from 'react';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../modules/auth/AuthContext';

/**
 * Newsletter Subscription Form
 * Floating or inline newsletter signup
 */
export const NewsletterForm: React.FC<{ variant?: 'inline' | 'card' }> = ({
    variant = 'card'
}) => {
    const { tenantId } = useAuth();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !tenantId) {
            setError('Email é obrigatório');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post('/newsletter/subscribe', {
                email,
                name: name.trim() || undefined,
                tenantId
            });
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao inscrever');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className={`newsletter-form ${variant}`}>
                <div className="success-state">
                    <CheckCircle size={48} className="success-icon" />
                    <h4>Inscrição confirmada!</h4>
                    <p>Você receberá nossas novidades em breve.</p>
                </div>

                <style>{`
                    .newsletter-form.card .success-state {
                        text-align: center;
                        padding: 24px;
                    }
                    .success-icon {
                        color: #22c55e;
                        margin-bottom: 12px;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className={`newsletter-form ${variant}`}>
            <div className="newsletter-header">
                <Mail size={24} />
                <div>
                    <h4>Receba Novidades</h4>
                    <p>Fique por dentro de eventos e exposições</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {variant === 'card' && (
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome (opcional)"
                    />
                )}

                <div className="email-row">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Seu melhor email"
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? '...' : <Send size={18} />}
                    </button>
                </div>

                {error && <p className="error">{error}</p>}
            </form>

            <style>{`
                .newsletter-form {
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
                    border: 1px solid rgba(99, 102, 241, 0.3);
                    border-radius: 16px;
                    padding: 20px;
                }
                
                .newsletter-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 16px;
                    color: var(--primary-color, #3b82f6);
                }
                
                .newsletter-header h4 {
                    margin: 0;
                    font-size: 1rem;
                    color: var(--fg-main, #f3f4f6);
                }
                
                .newsletter-header p {
                    margin: 0;
                    font-size: 0.85rem;
                    color: var(--fg-muted, #9ca3af);
                }
                
                .newsletter-form input {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid var(--border-color, #374151);
                    border-radius: 8px;
                    background: var(--bg-elevated, #374151);
                    color: var(--fg-main, #f3f4f6);
                    margin-bottom: 8px;
                }
                
                .email-row {
                    display: flex;
                    gap: 8px;
                }
                
                .email-row input {
                    flex: 1;
                    margin-bottom: 0;
                }
                
                .email-row button {
                    padding: 12px 16px;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                
                .email-row button:hover:not(:disabled) {
                    transform: scale(1.05);
                }
                
                .email-row button:disabled {
                    opacity: 0.6;
                }
                
                .newsletter-form .error {
                    color: #ef4444;
                    font-size: 0.85rem;
                    margin: 8px 0 0;
                }
                
                .newsletter-form.inline {
                    background: transparent;
                    border: none;
                    padding: 0;
                }
                
                .newsletter-form.inline .newsletter-header {
                    display: none;
                }
            `}</style>
        </div>
    );
};
