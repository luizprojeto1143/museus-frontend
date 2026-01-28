import React, { useState } from 'react';
import { X, Minus, Plus, Calendar } from 'lucide-react';
import { api } from '../../../api/client';
import { useAuth } from '../../../modules/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import './CheckoutModal.css';

interface Ticket {
    id: string;
    name: string;
    type: string;
    price: number;
    quantity: number;
    sold: number;
}

interface EventInfo {
    id: string;
    title: string;
    startDate: string;
}

interface CheckoutModalProps {
    event: EventInfo;
    tickets: Ticket[];
    onClose: () => void;
    onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ event, tickets, onClose, onSuccess }) => {
    const { name, email, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);

    const totalAmount = Object.entries(quantities).reduce((acc, [ticketId, qty]) => {
        const ticket = tickets.find(t => t.id === ticketId);
        return acc + (qty * (Number(ticket?.price) || 0));
    }, 0);

    const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);

    const handleUpdate = (ticketId: string, delta: number) => {
        setQuantities(prev => ({
            ...prev,
            [ticketId]: Math.max(0, (prev[ticketId] || 0) + delta)
        }));
    };

    const handleCheckout = async () => {
        if (!isAuthenticated) {
            localStorage.setItem('redirect_after_login', `/eventos/${event.id}`);
            onClose();
            navigate('/login');
            return;
        }

        if (totalItems === 0) return;

        setLoading(true);
        try {
            const items = Object.entries(quantities).filter(([, qty]) => qty > 0);

            for (const [ticketId, qty] of items) {
                for (let i = 0; i < qty; i++) {
                    await api.post('/registrations', {
                        eventId: event.id,
                        ticketId,
                        guestName: name || "Visitante",
                        guestEmail: email || "email@teste.com"
                    });
                }
            }

            onSuccess();
        } catch (e) {
            console.error(e);
            alert("Erro ao processar inscrição. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-backdrop">
            <div className="checkout-modal">
                {/* Header */}
                <div className="checkout-header">
                    <h3 className="checkout-header-title">🎟️ Ingressos</h3>
                    <button onClick={onClose} className="checkout-close-btn">
                        <X size={18} />
                    </button>
                </div>

                {/* Event Info */}
                <div className="checkout-event-info">
                    <h4 className="checkout-event-title">{event.title}</h4>
                    <p className="checkout-event-date">
                        <Calendar size={16} />
                        {new Date(event.startDate).toLocaleDateString()}
                    </p>
                </div>

                {/* Tickets List */}
                <div className="checkout-tickets">
                    {tickets.map(ticket => (
                        <div key={ticket.id} className="checkout-ticket-card">
                            <div className="checkout-ticket-info">
                                <h4>{ticket.name}</h4>
                                <p className="checkout-ticket-price">
                                    {Number(ticket.price) > 0 ? (
                                        `R$ ${Number(ticket.price).toFixed(2)}`
                                    ) : (
                                        <span className="free">Gratuito</span>
                                    )}
                                    {ticket.quantity - ticket.sold < 10 && (
                                        <span className="checkout-ticket-warning">(Últimos!)</span>
                                    )}
                                </p>
                            </div>
                            <div className="checkout-qty-controls">
                                <button
                                    onClick={() => handleUpdate(ticket.id, -1)}
                                    className="checkout-qty-btn minus"
                                    disabled={(quantities[ticket.id] || 0) <= 0}
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="checkout-qty-value">{quantities[ticket.id] || 0}</span>
                                <button
                                    onClick={() => handleUpdate(ticket.id, 1)}
                                    className="checkout-qty-btn plus"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="checkout-footer">
                    <div className="checkout-total">
                        <span className="checkout-total-label">Total</span>
                        <span className="checkout-total-value">R$ {totalAmount.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={totalItems === 0 || loading}
                        className="checkout-submit-btn"
                    >
                        {loading ? 'Processando...' : `Confirmar Inscrição (${totalItems})`}
                    </button>
                    {!isAuthenticated && (
                        <p className="checkout-login-note">
                            Você precisará fazer login para concluir.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
