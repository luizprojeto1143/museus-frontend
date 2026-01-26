import React, { useState } from 'react';
import { X, Minus, Plus, Calendar } from 'lucide-react';
import { api } from '../../../api/client';
import { useAuth } from '../../../modules/auth/AuthContext';
import { useNavigate } from 'react-router-dom';

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
            // Save current location to return after login
            localStorage.setItem('redirect_after_login', `/eventos/${event.id}`);
            onClose();
            navigate('/login');
            return;
        }

        if (totalItems === 0) return;

        setLoading(true);
        try {
            // Process each ticket type selection
            // In a real app we would bundle this in one robust API call
            const items = Object.entries(quantities).filter(([, qty]) => qty > 0);

            for (const [ticketId, qty] of items) {
                for (let i = 0; i < qty; i++) {
                    // For now, registering for logged user. 
                    // Future: Guest entries for extra tickets
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">Ingressos</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Event Mini Info */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
                    <h4 className="font-bold text-blue-900 dark:text-blue-100">{event.title}</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> {new Date(event.startDate).toLocaleDateString()}
                    </p>
                </div>

                {/* Tickets List */}
                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                    {tickets.map(ticket => (
                        <div key={ticket.id} className="flex justify-between items-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 transition-colors">
                            <div>
                                <p className="font-bold text-lg text-gray-900 dark:text-white">{ticket.name}</p>
                                <p className="text-gray-500 text-sm">
                                    {Number(ticket.price) > 0 ? `R$ ${Number(ticket.price).toFixed(2)}` : 'Gratuito'}
                                    {ticket.quantity - ticket.sold < 10 && <span className="text-red-500 ml-2 text-xs font-bold">(Últimos!)</span>}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleUpdate(ticket.id, -1)}
                                    className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                                    disabled={(quantities[ticket.id] || 0) <= 0}
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-6 text-center font-bold text-lg">{quantities[ticket.id] || 0}</span>
                                <button
                                    onClick={() => handleUpdate(ticket.id, 1)}
                                    className="w-8 h-8 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 hover:bg-blue-100"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-500 text-sm">Total</span>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            R$ {totalAmount.toFixed(2)}
                        </span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={totalItems === 0 || loading}
                        className="w-full btn btn-primary py-4 text-lg font-bold shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
                    >
                        {loading ? 'Processando...' : `Confirmar Inscrição (${totalItems})`}
                    </button>
                    {!isAuthenticated && (
                        <p className="text-center text-xs text-gray-500 mt-2">
                            Você precisará fazer login para concluir.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
