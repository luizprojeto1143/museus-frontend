import React, { useState, useEffect } from "react";
import { 
    Ticket, Users, CreditCard, Banknote, QrCode, 
    Printer, Search, ShoppingCart, Trash2, 
    ChevronRight, CheckCircle2, Info, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../../components/ui";
import { toast } from "react-hot-toast";

import { api } from "../../../../api/client";
import { theaterApi } from "../../../../api/theater";

export const AdminBoxOffice: React.FC = () => {
    const [step, setStep] = useState<"SESSION" | "SELECTION" | "PAYMENT" | "SUCCESS">("SESSION");
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState<any[]>([]);
    
    // Selection state
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    
    // Theater specific state
    const [seatsLayout, setSeatsLayout] = useState<any>(null);
    const [reservations, setReservations] = useState<any[]>([]);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    
    // General Event specific state
    const [tickets, setTickets] = useState<any[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [ticketQuantity, setTicketQuantity] = useState<number>(1);

    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const res = await api.get("/events/pos/sessions");
                setEvents(res.data);
            } catch (err) {
                toast.error("Erro ao carregar eventos do PDV");
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const handleSelectEvent = async (event: any) => {
        setSelectedEvent(event);
        setSelectedSeats([]);
        setSelectedTicket(null);
        setTicketQuantity(1);
        setLoading(true);

        try {
            if (event.isTheaterSession) {
                const res = await theaterApi.getSessionSeats(event.id);
                setSeatsLayout(res.data.layout);
                setReservations(res.data.reservations);
            } else {
                const res = await api.get(`/tickets/events/${event.id}/tickets`);
                setTickets(res.data);
            }
            setStep("SELECTION");
        } catch (err) {
            toast.error("Erro ao carregar mapa de assentos/ingressos");
        } finally {
            setLoading(false);
        }
    };

    const handleSeatToggle = (seatId: string) => {
        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seatId));
        } else {
            setSelectedSeats([...selectedSeats, seatId]);
        }
    };

    const handleFinalizeSale = async () => {
        if (!paymentMethod) return;
        setLoading(true);
        try {
            if (selectedEvent.isTheaterSession) {
                await theaterApi.sellSeats(selectedEvent.id, {
                    seatIds: selectedSeats,
                    paymentMethod
                });
            } else {
                await api.post(`/events/${selectedEvent.id}/pos-sell`, {
                    ticketId: selectedTicket.id,
                    quantity: ticketQuantity,
                    paymentMethod
                });
            }
            setStep("SUCCESS");
            toast.success("Venda realizada com sucesso!");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Erro ao finalizar venda");
        } finally {
            setLoading(false);
        }
    };

    const isTheater = selectedEvent?.isTheaterSession;

    let totalPrice = 0;
    if (isTheater) {
        totalPrice = selectedSeats.length * (selectedEvent?.price || 0);
    } else if (selectedTicket) {
        totalPrice = selectedTicket.price * ticketQuantity;
    }

    const canProceedToPayment = isTheater ? selectedSeats.length > 0 : (selectedTicket && ticketQuantity > 0);

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            {/* ═══ BOX OFFICE HEADER ═══════════ */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-4">
                <div>
                    <span className="text-red-500 font-black text-[10px] uppercase tracking-[0.4em] mb-2 block italic">Omnichannel Sales</span>
                    <h1 className="text-5xl font-black text-white tracking-tighter italic">Bilheteria Central</h1>
                    <p className="text-slate-500 font-medium mt-2">Venda presencial (PDV) para todos os eventos da cidade.</p>
                </div>
                <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
                    <button className="px-6 py-3 rounded-xl bg-red-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-600/20">Presencial</button>
                    <button className="px-6 py-3 rounded-xl text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all">Monitor Online</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
                {/* ═══ MAIN WORKFLOW ═════════ */}
                <div className="lg:col-span-2 space-y-6">
                    <AnimatePresence mode="wait">
                        {step === "SESSION" && (
                            <motion.div 
                                key="step-session"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="premium-glass p-8 rounded-[40px] border-white/5 space-y-6"
                            >
                                <h3 className="text-xl font-black text-white italic mb-6 flex items-center gap-3">
                                    <Ticket className="text-red-500" /> 1. Selecionar Evento
                                </h3>
                                <div className="space-y-4">
                                    {loading ? (
                                        <div className="p-10 text-center animate-pulse text-red-500 font-black italic">Buscando eventos...</div>
                                    ) : events.length > 0 ? events.map(s => (
                                        <div 
                                            key={s.id}
                                            onClick={() => handleSelectEvent(s)}
                                            className="group flex items-center justify-between p-6 rounded-[32px] bg-white/5 border border-white/5 hover:border-red-500/30 hover:bg-white/10 transition-all cursor-pointer"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-black flex flex-col items-center justify-center text-white font-black shadow-xl group-hover:scale-110 transition-transform">
                                                    <span className="text-xs">{new Date(s.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                                                    <span className="text-lg">{new Date(s.startDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-lg font-black text-white">{s.title}</h4>
                                                        {s.isTheaterSession && <span className="bg-blue-500/20 text-blue-400 text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">Teatro</span>}
                                                    </div>
                                                    <p className="text-xs text-slate-500 font-black uppercase tracking-widest mt-1">
                                                        {s.location || s.space?.name || 'Local não definido'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <ChevronRight className="ml-auto text-slate-700 group-hover:text-red-500" />
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-10 text-center text-slate-500 font-bold italic">Nenhum evento disponível.</div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {step === "SELECTION" && isTheater && (
                            <motion.div 
                                key="step-seats"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="premium-glass p-8 rounded-[40px] border-white/5"
                            >
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-xl font-black text-white italic flex items-center gap-3">
                                        <Users className="text-red-500" /> 2. Escolher Assentos
                                    </h3>
                                    <Button variant="ghost" onClick={() => setStep("SESSION")} className="text-[10px] uppercase font-black tracking-widest text-slate-500">Voltar</Button>
                                </div>

                                <div className="w-full h-4 bg-white/10 rounded-full mb-16 relative">
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-600 uppercase tracking-[0.5em]">Palco</div>
                                </div>

                                <div className="space-y-4 max-w-2xl mx-auto overflow-y-auto max-h-[400px] p-4">
                                    {seatsLayout?.rows?.map((row: any) => (
                                        <div key={row.name} className="flex items-center gap-4">
                                            <div className="w-6 text-[10px] font-black text-slate-600">{row.name}</div>
                                            <div className="flex flex-wrap gap-2 flex-1">
                                                {Array.from({ length: row.seats }, (_, i) => {
                                                    const seatId = `${row.name}-${i + 1}`;
                                                    const reservation = reservations.find(r => r.seatId === seatId);
                                                    const isOccupied = reservation?.status === 'SOLD' || reservation?.status === 'RESERVED';
                                                    const isSelected = selectedSeats.includes(seatId);

                                                    return (
                                                        <button
                                                            key={seatId}
                                                            disabled={isOccupied}
                                                            onClick={() => handleSeatToggle(seatId)}
                                                            className={`
                                                                w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-black transition-all border
                                                                ${isOccupied 
                                                                    ? 'bg-red-500/10 border-red-500/20 text-red-500/30 cursor-not-allowed' 
                                                                    : isSelected
                                                                        ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30 scale-110'
                                                                        : 'bg-white/5 border-white/10 text-slate-500 hover:border-red-500/50 hover:text-white'}
                                                            `}
                                                        >
                                                            {i + 1}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                    {!seatsLayout && (
                                        <div className="text-center p-10 text-slate-500 italic font-bold">Layout do teatro não configurado para este espaço.</div>
                                    )}
                                </div>

                                <div className="mt-12 flex justify-between items-center p-6 bg-black/40 rounded-[32px] border border-white/5">
                                    <div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Selecionados</span>
                                        <p className="text-white font-black">{selectedSeats.length > 0 ? selectedSeats.join(", ") : "Nenhum"}</p>
                                    </div>
                                    <Button 
                                        disabled={!canProceedToPayment}
                                        onClick={() => setStep("PAYMENT")}
                                        className="bg-white text-black px-10 py-6 rounded-2xl font-black italic hover:bg-red-500 hover:text-white transition-all shadow-2xl"
                                    >
                                        Continuar
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === "SELECTION" && !isTheater && (
                            <motion.div 
                                key="step-tickets"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="premium-glass p-8 rounded-[40px] border-white/5"
                            >
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-xl font-black text-white italic flex items-center gap-3">
                                        <Ticket className="text-red-500" /> 2. Escolher Ingressos
                                    </h3>
                                    <Button variant="ghost" onClick={() => setStep("SESSION")} className="text-[10px] uppercase font-black tracking-widest text-slate-500">Voltar</Button>
                                </div>

                                <div className="space-y-4">
                                    {tickets.length > 0 ? tickets.map(ticket => (
                                        <div 
                                            key={ticket.id}
                                            onClick={() => {
                                                if (selectedTicket?.id !== ticket.id) {
                                                    setSelectedTicket(ticket);
                                                    setTicketQuantity(1);
                                                }
                                            }}
                                            className={`
                                                p-6 rounded-[24px] border transition-all cursor-pointer flex justify-between items-center
                                                ${selectedTicket?.id === ticket.id ? 'bg-red-500/10 border-red-500' : 'bg-white/5 border-white/5 hover:border-white/20'}
                                            `}
                                        >
                                            <div>
                                                <h4 className="text-lg font-black text-white">{ticket.name}</h4>
                                                <p className="text-sm text-slate-400">R$ {ticket.price}</p>
                                                <p className="text-xs text-slate-500 mt-1">Disponível: {ticket.quantity - ticket.sold}</p>
                                            </div>
                                            {selectedTicket?.id === ticket.id && (
                                                <div className="flex items-center gap-4 bg-black/40 rounded-xl p-2" onClick={(e) => e.stopPropagation()}>
                                                    <button 
                                                        disabled={ticketQuantity <= 1}
                                                        onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                                                        className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg text-white font-black hover:bg-white/20 disabled:opacity-50"
                                                    >-</button>
                                                    <span className="w-8 text-center text-xl font-black text-white">{ticketQuantity}</span>
                                                    <button 
                                                        disabled={ticketQuantity >= (ticket.quantity - ticket.sold)}
                                                        onClick={() => setTicketQuantity(ticketQuantity + 1)}
                                                        className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg text-white font-black hover:bg-white/20 disabled:opacity-50"
                                                    >+</button>
                                                </div>
                                            )}
                                        </div>
                                    )) : (
                                        <div className="p-10 text-center text-slate-500 font-bold italic">Nenhum ingresso cadastrado para este evento.</div>
                                    )}
                                </div>

                                <div className="mt-12 flex justify-end p-6 bg-black/40 rounded-[32px] border border-white/5">
                                    <Button 
                                        disabled={!canProceedToPayment}
                                        onClick={() => setStep("PAYMENT")}
                                        className="bg-white text-black px-10 py-6 rounded-2xl font-black italic hover:bg-red-500 hover:text-white transition-all shadow-2xl"
                                    >
                                        Continuar
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === "PAYMENT" && (
                            <motion.div 
                                key="step-payment"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="premium-glass p-8 rounded-[40px] border-white/5 space-y-8"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black text-white italic flex items-center gap-3">
                                        <CreditCard className="text-red-500" /> 3. Pagamento
                                    </h3>
                                    <Button variant="ghost" onClick={() => setStep("SELECTION")} className="text-[10px] uppercase font-black tracking-widest text-slate-500">Voltar</Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { id: "CASH", label: "Dinheiro", icon: <Banknote /> },
                                        { id: "CARD", label: "Cartão / POS", icon: <CreditCard /> },
                                        { id: "PIX", label: "Pix Instantâneo", icon: <QrCode /> },
                                    ].map(method => (
                                        <button
                                            key={method.id}
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={`
                                                flex flex-col items-center gap-4 p-8 rounded-[32px] border transition-all
                                                ${paymentMethod === method.id 
                                                    ? 'bg-red-500 border-red-500 text-white shadow-xl shadow-red-500/20' 
                                                    : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20 hover:bg-white/10'}
                                            `}
                                        >
                                            <div className="scale-150 mb-2">{method.icon}</div>
                                            <span className="text-xs font-black uppercase tracking-widest">{method.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="p-8 bg-black/40 rounded-[32px] border border-white/5 flex flex-col items-center text-center">
                                    <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em] mb-4">Total a Pagar</p>
                                    <h2 className="text-6xl font-black text-white tracking-tighter italic mb-8">R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                                    <Button 
                                        disabled={!paymentMethod || loading}
                                        onClick={handleFinalizeSale}
                                        className="w-full max-w-sm bg-red-600 hover:bg-red-700 text-white py-8 rounded-[32px] font-black italic text-xl shadow-2xl shadow-red-600/30"
                                        isLoading={loading}
                                    >
                                        Finalizar Venda
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === "SUCCESS" && (
                            <motion.div 
                                key="step-success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="premium-glass p-12 rounded-[48px] border-emerald-500/20 bg-emerald-500/5 text-center space-y-8"
                            >
                                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto shadow-2xl shadow-emerald-500/30">
                                    <CheckCircle2 size={48} />
                                </div>
                                <div>
                                    <h2 className="text-4xl font-black text-white italic">Venda Concluída!</h2>
                                    <p className="text-emerald-400 font-bold mt-2 uppercase tracking-widest text-xs">Ingressos confirmados</p>
                                </div>
                                <div className="flex flex-col md:flex-row gap-4 justify-center">
                                    <Button className="bg-white text-black px-10 py-6 rounded-2xl font-black italic flex items-center gap-3">
                                        <Printer size={20} /> Imprimir Térmico
                                    </Button>
                                    <Button variant="secondary" className="px-10 py-6 rounded-2xl font-black italic flex items-center gap-3">
                                        <QrCode size={20} /> Enviar QR por WhatsApp
                                    </Button>
                                </div>
                                <button 
                                    onClick={() => { setStep("SESSION"); setSelectedSeats([]); setSelectedTicket(null); setPaymentMethod(null); }}
                                    className="text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white mt-8"
                                >
                                    Iniciar Nova Venda
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ═══ CART SUMMARY / SIDEBAR ═════════ */}
                <div className="space-y-6">
                    <div className="premium-glass p-8 rounded-[40px] border-white/5 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-white italic flex items-center gap-2">
                                <ShoppingCart size={20} className="text-red-500" /> Carrinho
                            </h3>
                            <button onClick={() => { setSelectedSeats([]); setSelectedTicket(null); setTicketQuantity(1); }} className="text-slate-500 hover:text-red-500"><Trash2 size={16} /></button>
                        </div>

                        {selectedEvent ? (
                            <div className="space-y-6">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Evento Selecionado</p>
                                    <p className="text-white font-black">{selectedEvent.title}</p>
                                    <p className="text-[11px] text-red-400 font-bold">
                                        {new Date(selectedEvent.startDate).toLocaleDateString('pt-BR')} • {new Date(selectedEvent.startDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Itens Selecionados</p>
                                    
                                    {isTheater ? (
                                        selectedSeats.length > 0 ? selectedSeats.map(id => (
                                            <div key={id} className="flex justify-between items-center text-sm font-bold bg-white/5 p-3 rounded-xl">
                                                <span className="text-white">Assento {id}</span>
                                                <span className="text-slate-400">R$ {selectedEvent.price || 0}</span>
                                            </div>
                                        )) : <p className="text-xs text-slate-500">Nenhum assento</p>
                                    ) : (
                                        selectedTicket ? (
                                            <div className="flex justify-between items-center text-sm font-bold bg-white/5 p-3 rounded-xl">
                                                <span className="text-white">{ticketQuantity}x {selectedTicket.name}</span>
                                                <span className="text-slate-400">R$ {selectedTicket.price * ticketQuantity}</span>
                                            </div>
                                        ) : <p className="text-xs text-slate-500">Nenhum ingresso</p>
                                    )}
                                </div>

                                <div className="pt-6 border-t border-white/5 space-y-4">
                                    <div className="flex justify-between items-center font-black">
                                        <span className="text-slate-500 uppercase text-[10px] tracking-widest">Subtotal</span>
                                        <span className="text-white">R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center font-black text-2xl pt-2">
                                        <span className="text-white italic">Total</span>
                                        <span className="text-white tracking-tighter">R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 space-y-4">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-700">
                                    <ShoppingCart size={32} />
                                </div>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Nenhum evento selecionado</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
