import { logger } from "@/utils/logger";
import { useTranslation } from "react-i18next";
import React, { useState } from 'react';
import { X, Minus, Plus, Calendar, CreditCard, Ticket as TicketIcon } from 'lucide-react';
import { api } from '../../../api/client';
import { useAuth } from '../../../modules/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button, Badge } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
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
    const { t } = useTranslation();
    const { name, email, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);

    const totalAmount = Object.entries(quantities).reduce((acc, [ticketId, qty]) => {
        const ticket = tickets.find(item => item.id === ticketId);
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
        } catch (e: any) {
            logger.error(e);
            alert(t("visitor.checkoutmodal.error", "Erro ao processar inscrição. Tente novamente."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-lg bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden"
            >
                {/* Header */}
                <div className="p-8 pb-4 flex justify-between items-start">
                    <div>
                        <Badge variant="glass" className="mb-3 text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border-amber-500/20">
                            {t("visitor.checkoutmodal.checkin", "Check-in Express")}
                        </Badge>
                        <h3 className="text-3xl font-black text-white tracking-tighter flex items-center gap-2">
                            <TicketIcon size={24} className="text-amber-500" />
                            {t("visitor.checkoutmodal.tickets", "Ingressos")}
                        </h3>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Event Info */}
                <div className="px-8 pb-6 border-b border-white/5">
                    <h4 className="text-lg font-bold text-slate-300 mb-1">{event.title}</h4>
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                        <Calendar size={14} />
                        {new Date(event.startDate).toLocaleDateString()}
                    </div>
                </div>

                {/* Tickets List */}
                <div className="p-8 max-h-[40vh] overflow-y-auto custom-scrollbar space-y-4">
                    {tickets.map(ticket => (
                        <div key={ticket.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all duration-300">
                            <div className="flex-1">
                                <h4 className="font-bold text-white mb-1 group-hover:text-amber-500 transition-colors">{ticket.name}</h4>
                                <div className="flex items-center gap-3">
                                    <span className="text-slate-400 font-bold text-sm">
                                        {Number(ticket.price) > 0 ? (
                                            `R$ ${Number(ticket.price).toFixed(2)}`
                                        ) : (
                                            <span className="text-green-400">{t("visitor.checkoutmodal.free", "Gratuito")}</span>
                                        )}
                                    </span>
                                    {ticket.quantity - ticket.sold < 10 && (
                                        <Badge variant="outline" className="text-[9px] h-5 border-red-500/30 text-red-500 bg-red-500/5">
                                            {t("visitor.checkoutmodal.last_tickets", "Últimos!")}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-black/30 rounded-xl p-1.5 border border-white/5">
                                <button
                                    onClick={() => handleUpdate(ticket.id, -1)}
                                    disabled={(quantities[ticket.id] || 0) <= 0}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Minus size={18} />
                                </button>
                                <span className="w-6 text-center text-lg font-black text-white tabular-nums">
                                    {quantities[ticket.id] || 0}
                                </span>
                                <button
                                    onClick={() => handleUpdate(ticket.id, 1)}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-all"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-8 bg-black/40 border-t border-white/5">
                    <div className="flex justify-between items-center mb-8">
                        <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t("visitor.checkoutmodal.total", "Total")}</span>
                        <div className="text-right">
                           <span className="block text-3xl font-black text-white tabular-nums">R$ {totalAmount.toFixed(2)}</span>
                           <span className="text-[10px] text-slate-500 font-medium">{totalItems} {t("visitor.checkoutmodal.items_in_cart", "itens no carrinho")}</span>
                        </div>
                    </div>
                    
                    <Button
                        onClick={handleCheckout}
                        disabled={totalItems === 0 || loading}
                        className="w-full h-16 rounded-[1.25rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl"
                        isLoading={loading}
                        leftIcon={<CreditCard size={18} />}
                    >
                        {loading ? t("visitor.checkoutmodal.processing", "Processando...") : t("visitor.checkoutmodal.confirm", "Confirmar Inscrição")}
                    </Button>

                    {!isAuthenticated && (
                        <p className="mt-4 text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-60">
                           {t("visitor.checkoutmodal.login_required")}
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
