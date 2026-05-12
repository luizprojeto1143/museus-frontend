import React, { useState } from "react";
import { 
    Ticket, Users, CreditCard, Banknote, QrCode, 
    Printer, Search, ShoppingCart, Trash2, 
    ChevronRight, CheckCircle2, AlertCircle, Info, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Input } from "../../../components/ui";
import { toast } from "react-hot-toast";

import { theaterApi } from "../../../api/theater";

export const TheaterBoxOffice: React.FC = () => {
    const [step, setStep] = useState<"SESSION" | "SEATS" | "PAYMENT" | "SUCCESS">("SESSION");
    const [loading, setLoading] = useState(false);
    const [sessions, setSessions] = useState<any[]>([]);
    const [selectedSession, setSelectedSession] = useState<any>(null);
    const [seatsLayout, setSeatsLayout] = useState<any>(null);
    const [reservations, setReservations] = useState<any[]>([]);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

    React.useEffect(() => {
        const fetchSessions = async () => {
            setLoading(true);
            try {
                const res = await theaterApi.getSessions();
                setSessions(res.data);
            } catch (err) {
                toast.error("Erro ao carregar sessões");
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, []);

    const handleSelectSession = async (session: any) => {
        setSelectedSession(session);
        setLoading(true);
        try {
            const res = await theaterApi.getSessionSeats(session.id);
            setSeatsLayout(res.data.layout);
            setReservations(res.data.reservations);
            setStep("SEATS");
        } catch (err) {
            toast.error("Erro ao carregar mapa de assentos");
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
            await theaterApi.sellSeats(selectedSession.id, {
                seatIds: selectedSeats,
                paymentMethod
            });
            setStep("SUCCESS");
            toast.success("Venda realizada com sucesso!");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Erro ao finalizar venda");
        } finally {
            setLoading(false);
        }
    };

    const totalPrice = selectedSeats.length * (selectedSession?.price || 0); // Note: Should probably fetch specific ticket prices

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            {/* ═══ BOX OFFICE HEADER ═══════════ */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-4">
                <div>
                    <span className="text-red-500 font-black text-[10px] uppercase tracking-[0.4em] mb-2 block italic">Omnichannel Sales</span>
                    <h1 className="text-5xl font-black text-white tracking-tighter italic">Bilheteria Central</h1>
                    <p className="text-slate-500 font-medium mt-2">Venda presencial e monitoramento online em tempo real.</p>
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
                                    <Ticket className="text-red-500" /> 1. Selecionar Espetáculo
                                </h3>
                                <div className="space-y-4">
                                    {loading ? (
                                        <div className="p-10 text-center animate-pulse text-red-500 font-black italic">Buscando espetáculos...</div>
                                    ) : sessions.length > 0 ? sessions.map(s => (
                                        <div 
                                            key={s.id}
                                            onClick={() => handleSelectSession(s)}
                                            className="group flex items-center justify-between p-6 rounded-[32px] bg-white/5 border border-white/5 hover:border-red-500/30 hover:bg-white/10 transition-all cursor-pointer"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-black flex items-center justify-center text-white font-black shadow-xl group-hover:scale-110 transition-transform">
                                                    {new Date(s.startDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-white">{s.title}</h4>
                                                    <p className="text-xs text-slate-500 font-black uppercase tracking-widest mt-1">
                                                        {new Date(s.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} • {s.location || s.space?.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black text-white">R$ {s.price || 0}</p>
                                                <ChevronRight className="ml-auto text-slate-700 group-hover:text-red-500" />
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-10 text-center text-slate-500 font-bold italic">Nenhuma sessão disponível para hoje.</div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {step === "SEATS" && (
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
                                        disabled={selectedSeats.length === 0}
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
                                    <Button variant="ghost" onClick={() => setStep("SEATS")} className="text-[10px] uppercase font-black tracking-widest text-slate-500">Voltar</Button>
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
                                    <h2 className="text-6xl font-black text-white tracking-tighter italic mb-8">R$ {totalPrice.toLocaleString()}</h2>
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
                                    <p className="text-emerald-400 font-bold mt-2 uppercase tracking-widest text-xs">Ingressos prontos para impressão</p>
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
                                    onClick={() => { setStep("SESSION"); setSelectedSeats([]); setPaymentMethod(null); }}
                                    className="text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white"
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
                            <button onClick={() => setSelectedSeats([])} className="text-slate-500 hover:text-red-500"><Trash2 size={16} /></button>
                        </div>

                        {selectedSession ? (
                            <div className="space-y-6">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Evento Selecionado</p>
                                    <p className="text-white font-black">{selectedSession.title}</p>
                                    <p className="text-[11px] text-red-400 font-bold">{selectedSession.date} • {selectedSession.time}</p>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Itens ({selectedSeats.length})</p>
                                    {selectedSeats.map(id => (
                                        <div key={id} className="flex justify-between items-center text-sm font-bold bg-white/5 p-3 rounded-xl">
                                            <span className="text-white">Assento {id}</span>
                                            <span className="text-slate-400">R$ {selectedSession.price}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-white/5 space-y-4">
                                    <div className="flex justify-between items-center font-black">
                                        <span className="text-slate-500 uppercase text-[10px] tracking-widest">Subtotal</span>
                                        <span className="text-white">R$ {totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center font-black">
                                        <span className="text-slate-500 uppercase text-[10px] tracking-widest">Taxas (PDV)</span>
                                        <span className="text-emerald-400">R$ 0,00</span>
                                    </div>
                                    <div className="flex justify-between items-center font-black text-2xl pt-2">
                                        <span className="text-white italic">Total</span>
                                        <span className="text-white tracking-tighter">R$ {totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 space-y-4">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-700">
                                    <ShoppingCart size={32} />
                                </div>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Nenhuma sessão selecionada</p>
                            </div>
                        )}
                    </div>

                    <div className="premium-glass p-8 rounded-[40px] border-blue-500/20 bg-blue-500/5">
                        <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2 italic">
                            <Sparkles size={14} /> Insights de IA
                        </h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            "Notei que <strong>75% dos ingressos VIP</strong> para a sessão das 20h já foram vendidos. Recomendo abrir o segundo lote promocional para a plateia padrão."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
