import React, { useState, useEffect } from "react";
import { 
    Ticket, Users, CreditCard, Banknote, QrCode, 
    Printer, Search, ShoppingCart, Trash2, 
    ChevronRight, CheckCircle2, Info, Sparkles, X
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
    const [selectedEvent, setSelectedEvent] = useState<unknown>(null);
    
    // Theater specific state
    const [seatsLayout, setSeatsLayout] = useState<unknown>(null);
    const [reservations, setReservations] = useState<any[]>([]);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    
    // General Event specific state
    const [tickets, setTickets] = useState<any[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<unknown>(null);
    const [ticketQuantity, setTicketQuantity] = useState<number>(1);

    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
    const [activeShift, setActiveShift] = useState<any>(null);
    const [openingVal, setOpeningVal] = useState<number>(0);
    const [closingVal, setClosingVal] = useState<number>(0);
    const [shiftNotes, setShiftNotes] = useState<string>("");
    const [checkingShift, setCheckingShift] = useState<boolean>(true);
    const [showCloseModal, setShowCloseModal] = useState<boolean>(false);

    const fetchCurrentShift = async () => {
        setCheckingShift(true);
        try {
            const res = await api.get("/theater/box-office/current");
            setActiveShift(res.data);
        } catch (err) {
            console.error("Erro ao carregar caixa ativo", err);
        } finally {
            setCheckingShift(false);
        }
    };

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
        fetchCurrentShift();
    }, []);

    const handleOpenShift = async () => {
        try {
            const res = await api.post("/theater/box-office/open", {
                openedValue: Number(openingVal),
                notes: shiftNotes
            });
            setActiveShift(res.data);
            toast.success("Caixa aberto com sucesso!");
            setShiftNotes("");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Erro ao abrir caixa.");
        }
    };

    const handleCloseShift = async () => {
        try {
            const res = await api.post("/theater/box-office/close", {
                closedValue: Number(closingVal),
                notes: shiftNotes
            });
            setActiveShift(null);
            setShowCloseModal(false);
            toast.success(`Caixa fechado com sucesso!`);
            setShiftNotes("");
            setClosingVal(0);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Erro ao fechar caixa.");
        }
    };

    const handleSelectEvent = async (event: unknown) => {
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
        } catch (err: unknown) {
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

    if (checkingShift) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] text-red-500 font-bold italic animate-pulse">
                Verificando status do caixa...
            </div>
        );
    }

    if (!activeShift) {
        return (
            <div className="max-w-md mx-auto space-y-8 animate-in fade-in duration-700 pb-20 pt-10">
                <div className="premium-glass p-8 rounded-[40px] border-white/5 space-y-6 text-center">
                    <span className="text-red-500 font-black text-[10px] uppercase tracking-[0.4em] mb-2 block italic">Caixa Fechado</span>
                    <h2 className="text-3xl font-black text-white italic">Abertura de Caixa</h2>
                    <p className="text-slate-400 text-sm">Insira o valor em dinheiro disponível na gaveta para iniciar a operação.</p>
                    
                    <div className="space-y-4 text-left">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Valor Inicial (R$)</label>
                            <input 
                                type="number" 
                                value={openingVal}
                                onChange={(e) => setOpeningVal(Number(e.target.value))}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-black text-lg focus:border-red-500 outline-none"
                                placeholder="0,00"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Observações (Opcional)</label>
                            <textarea 
                                value={shiftNotes}
                                onChange={(e) => setShiftNotes(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-red-500 outline-none h-24 resize-none"
                                placeholder="Notas sobre a abertura do turno..."
                            />
                        </div>
                    </div>

                    <Button 
                        onClick={handleOpenShift}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-black italic rounded-[24px] py-4 shadow-xl shadow-red-600/20"
                    >
                        Abrir Turno de Vendas
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-4">
                <div>
                    <span className="text-red-500 font-black text-[10px] uppercase tracking-[0.4em] mb-2 block italic">Omnichannel Sales</span>
                    <h1 className="text-5xl font-black text-white tracking-tighter italic">Bilheteria Central</h1>
                    <div className="flex items-center gap-3 mt-2 text-slate-500 font-medium">
                        <span>Venda presencial (PDV) para todos os eventos.</span>
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Caixa Aberto (R$ {Number(activeShift.openedValue).toFixed(2)})</span>
                    </div>
                </div>
                <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 gap-3">
                    <button className="px-6 py-3 rounded-xl bg-red-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-600/20">Presencial</button>
                    <button 
                        onClick={() => setShowCloseModal(true)}
                        className="px-6 py-3 rounded-xl text-red-400 border border-red-500/20 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 transition-all"
                    >
                        Fechar Caixa
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
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

                        {step === "SELECTION" && (
                            <motion.div 
                                key="step-selection"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="premium-glass p-10 rounded-[48px] border-white/5 space-y-8"
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-black text-white italic flex items-center gap-3">
                                        <Users className="text-red-500" /> 2. {isTheater ? 'Selecionar Assentos' : 'Quantidade de Ingressos'}
                                    </h3>
                                    <button onClick={() => setStep("SESSION")} className="text-xs text-slate-500 hover:text-white uppercase font-black tracking-widest">Voltar</button>
                                </div>

                                {isTheater ? (
                                    <div className="space-y-8">
                                        <div className="w-full h-3 bg-white/10 rounded-full flex items-center justify-center relative">
                                            <span className="text-[8px] font-black text-slate-700 uppercase tracking-[1em] absolute">PALCO</span>
                                        </div>

                                        <div className="grid grid-cols-10 gap-2 max-w-lg mx-auto">
                                            {Array.from({ length: 50 }).map((_, i) => {
                                                const seatId = `A-${i + 1}`;
                                                const isOccupied = reservations.some(r => r.seatId === seatId && r.status === "SOLD");
                                                const isReserved = reservations.some(r => r.seatId === seatId && r.status === "RESERVED");
                                                const isSelected = selectedSeats.includes(seatId);

                                                return (
                                                    <button
                                                        key={seatId}
                                                        disabled={isOccupied}
                                                        onClick={() => handleSeatToggle(seatId)}
                                                        className={`
                                                            aspect-square rounded-lg flex items-center justify-center text-[8px] font-black transition-all
                                                            ${isOccupied ? 'bg-white/5 text-slate-800' : isReserved ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : isSelected ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-white/10 text-slate-400 border border-white/5'}
                                                        `}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {tickets.map(t => (
                                            <div 
                                                key={t.id}
                                                onClick={() => setSelectedTicket(t)}
                                                className={`p-6 rounded-[32px] bg-white/5 border transition-all cursor-pointer flex justify-between items-center ${selectedTicket?.id === t.id ? 'border-red-500 bg-white/10' : 'border-white/5 hover:bg-white/10'}`}
                                            >
                                                <div>
                                                    <h4 className="text-lg font-black text-white">{t.name}</h4>
                                                    <p className="text-xs text-slate-500 mt-1">{t.type === 'FREE' ? 'Gratuito' : 'Pago'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xl font-black text-white">R$ {t.price || 0}</span>
                                                </div>
                                            </div>
                                        ))}

                                        {selectedTicket && (
                                            <div className="flex items-center justify-between p-6 bg-black/40 rounded-[32px] border border-white/5">
                                                <span className="text-sm font-bold text-slate-400">Quantidade</span>
                                                <div className="flex items-center gap-4">
                                                    <button onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))} className="w-10 h-10 rounded-full bg-white/5 text-white flex items-center justify-center font-bold text-lg hover:bg-white/10">-</button>
                                                    <span className="text-xl font-black text-white">{ticketQuantity}</span>
                                                    <button onClick={() => setTicketQuantity(ticketQuantity + 1)} className="w-10 h-10 rounded-full bg-white/5 text-white flex items-center justify-center font-bold text-lg hover:bg-white/10">+</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <Button 
                                    disabled={!canProceedToPayment}
                                    onClick={() => setStep("PAYMENT")}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black italic rounded-[24px] py-4 disabled:opacity-50"
                                >
                                    Ir para o Pagamento
                                </Button>
                            </motion.div>
                        )}

                        {step === "PAYMENT" && (
                            <motion.div 
                                key="step-payment"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="premium-glass p-10 rounded-[48px] border-white/5 space-y-8"
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-black text-white italic flex items-center gap-3">
                                        <CreditCard className="text-red-500" /> 3. Método de Pagamento
                                    </h3>
                                    <button onClick={() => setStep("SELECTION")} className="text-xs text-slate-500 hover:text-white uppercase font-black tracking-widest">Voltar</button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { id: "CASH", label: "Dinheiro", icon: <Banknote size={24} /> },
                                        { id: "CARD", label: "Cartão", icon: <CreditCard size={24} /> },
                                        { id: "PIX", label: "Pix", icon: <QrCode size={24} /> }
                                    ].map(method => (
                                        <div 
                                            key={method.id}
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={`p-8 rounded-[32px] bg-white/5 border cursor-pointer text-center space-y-4 transition-all ${paymentMethod === method.id ? 'border-red-500 bg-white/10' : 'border-white/5 hover:bg-white/10'}`}
                                        >
                                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-red-500">
                                                {method.icon}
                                            </div>
                                            <h4 className="font-black text-white">{method.label}</h4>
                                        </div>
                                    ))}
                                </div>

                                <Button 
                                    disabled={!paymentMethod || loading}
                                    onClick={handleFinalizeSale}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black italic rounded-[24px] py-4 disabled:opacity-50"
                                >
                                    {loading ? "Processando..." : "Confirmar Recebimento e Emitir"}
                                </Button>
                            </motion.div>
                        )}

                        {step === "SUCCESS" && (
                            <motion.div 
                                key="step-success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="premium-glass p-12 rounded-[48px] border-green-500/20 text-center space-y-6"
                            >
                                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-400">
                                    <CheckCircle2 size={48} />
                                </div>
                                <h3 className="text-3xl font-black text-white italic">Venda Concluída!</h3>
                                <p className="text-slate-400 text-sm max-w-md mx-auto">Os ingressos foram impressos e o status de pagamento foi confirmado na bilheteria física.</p>
                                
                                <div className="flex gap-4 max-w-sm mx-auto">
                                    <Button onClick={() => { setStep("SESSION"); setSelectedSeats([]); setSelectedTicket(null); setPaymentMethod(null); }} className="flex-1 bg-white/15 hover:bg-white/20 text-white font-black italic rounded-[20px] py-3">Nova Venda</Button>
                                    <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black italic rounded-[20px] py-3 flex items-center justify-center gap-2"><Printer size={16} /> Imprimir</Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

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

            {showCloseModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
                    <div className="premium-glass p-8 rounded-[40px] border-white/5 max-w-md w-full space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-black text-white italic">Fechamento de Caixa</h3>
                            <button onClick={() => setShowCloseModal(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                        </div>
                        <p className="text-slate-400 text-sm">Insira o valor em dinheiro presente na gaveta para encerrar seu turno.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Valor Físico Contado (R$)</label>
                                <input 
                                    type="number"
                                    value={closingVal}
                                    onChange={(e) => setClosingVal(Number(e.target.value))}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-black text-lg focus:border-red-500 outline-none"
                                    placeholder="0,00"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Notas / Justificativas</label>
                                <textarea 
                                    value={shiftNotes}
                                    onChange={(e) => setShiftNotes(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-red-500 outline-none h-24 resize-none"
                                    placeholder="Caso haja diferença de valores, explique aqui..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-2">
                            <Button onClick={() => setShowCloseModal(false)} className="flex-1 bg-white/10 hover:bg-white/15 text-white font-black italic rounded-[20px] py-3">Cancelar</Button>
                            <Button onClick={handleCloseShift} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black italic rounded-[20px] py-3">Confirmar Fechamento</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
