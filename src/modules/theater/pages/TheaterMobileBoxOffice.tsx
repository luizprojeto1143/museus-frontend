import React from "react";
import { 
    Smartphone, Ticket, Users, CreditCard, 
    Smartphone as MobileIcon, MessageSquare, 
    Wifi, WifiOff, Search, ChevronLeft, 
    X, Check, Zap, Map as MapIcon, Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Input } from "../../../components/ui";
import { useBoxOffice } from "./useBoxOffice";

export const TheaterMobileBoxOffice: React.FC = () => {
    const {
        step, setStep,
        selectedSeats, toggleSeat,
        selectedExtras, toggleExtra,
        online,
        sessions, extras,
        seatsTotal, grandTotal,
        resetSale
    } = useBoxOffice();

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-red-500/30 overflow-x-hidden">
            {/* ═══ MOBILE HEADER ═══════════ */}
            <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {step !== "LIST" && (
                        <button onClick={() => setStep("LIST")} className="p-2 bg-white/5 rounded-xl"><ChevronLeft size={20} /></button>
                    )}
                    <div>
                        <h1 className="text-sm font-black uppercase tracking-widest italic">Mobile POS</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Atendente: Luan S.</p>
                    </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${online ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {online ? <Wifi size={12} /> : <WifiOff size={12} />} {online ? 'Online' : 'Offline'}
                </div>
            </header>

            <main className="p-4 pb-32">
                <AnimatePresence mode="wait">
                    {/* ═══ STEP 1: SESSION LIST ═════════ */}
                    {step === "LIST" && (
                        <motion.div 
                            key="list"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <Input className="bg-white/5 border-white/5 pl-12 py-6 rounded-2xl" placeholder="Buscar espetáculo..." />
                            </div>

                            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4 ml-1">Sessões Disponíveis</h2>
                            {sessions.map(s => (
                                <div 
                                    key={s.id}
                                    onClick={() => setStep("SEATS")}
                                    className="p-5 rounded-3xl bg-white/5 border border-white/5 active:scale-95 transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-500 flex items-center justify-center font-black italic">
                                            {s.time}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-sm">{s.title}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Lotação: {s.occupancy}%</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black">R$ {s.price}</p>
                                        <span className="text-[8px] text-emerald-400 font-black uppercase tracking-widest">Venda Rápida</span>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {/* ═══ STEP 2: SEATS ═════════ */}
                    {step === "SEATS" && (
                        <motion.div 
                            key="seats"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="space-y-6"
                        >
                            <div className="bg-red-600/10 p-4 rounded-2xl border border-red-500/20 text-center mb-6">
                                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">O Fantasma da Ópera • 20:00</p>
                            </div>

                            <div className="w-full h-2 bg-white/10 rounded-full mb-12 flex items-center justify-center">
                                <span className="text-[8px] font-black text-slate-700 uppercase tracking-[1em] absolute">PALCO</span>
                            </div>

                            <div className="grid grid-cols-8 gap-2">
                                {Array.from({ length: 48 }).map((_, i) => {
                                    const id = i + 1;
                                    const isOccupied = id % 5 === 0;
                                    const isSelected = selectedSeats.includes(id);
                                    return (
                                        <button
                                            key={id}
                                            disabled={isOccupied}
                                            onClick={() => toggleSeat(id)}
                                            className={`
                                                aspect-square rounded-lg flex items-center justify-center text-[10px] font-black transition-all
                                                ${isOccupied ? 'bg-white/5 text-slate-800' : isSelected ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-white/10 text-slate-400 border border-white/5'}
                                            `}
                                        >
                                            {id}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="fixed bottom-0 left-0 w-full p-4 bg-slate-950/80 backdrop-blur-2xl border-t border-white/5 flex gap-4">
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total: {selectedSeats.length} Ingressos</p>
                                    <p className="text-xl font-black italic text-white">R$ {seatsTotal}</p>
                                </div>
                                <Button 
                                    disabled={selectedSeats.length === 0}
                                    onClick={() => setStep("EXTRAS")}
                                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-2xl font-black italic flex items-center gap-2"
                                >
                                    Continuar <Zap size={16} />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ STEP: EXTRAS ═════════ */}
                    {step === "EXTRAS" && (
                        <motion.div 
                            key="extras"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <h3 className="text-xl font-black text-white italic text-center mb-8">Upsell & Souvenirs</h3>
                            <div className="space-y-4">
                                {extras.map(item => {
                                    const isSelected = selectedExtras.find(e => e.id === item.id);
                                    return (
                                        <div 
                                            key={item.id}
                                            onClick={() => toggleExtra(item)}
                                            className={`p-6 rounded-[32px] border transition-all flex items-center justify-between ${isSelected ? 'bg-red-600 border-red-600 shadow-lg' : 'bg-white/5 border-white/5'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-3xl">{item.icon}</div>
                                                <div>
                                                    <p className="font-black text-sm">{item.name}</p>
                                                    <p className={`text-[10px] font-bold uppercase ${isSelected ? 'text-white' : 'text-slate-500'}`}>R$ {item.price}</p>
                                                </div>
                                            </div>
                                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${isSelected ? 'bg-white text-red-600' : 'border-white/20'}`}>
                                                {isSelected ? <Check size={16} /> : <Plus size={16} />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="fixed bottom-0 left-0 w-full p-4 bg-slate-950/80 backdrop-blur-2xl border-t border-white/5 flex gap-4">
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Grand Total</p>
                                    <p className="text-xl font-black italic text-white">R$ {grandTotal}</p>
                                </div>
                                <Button 
                                    onClick={() => setStep("PAY")}
                                    className="bg-white text-black px-8 py-6 rounded-2xl font-black italic flex items-center gap-2"
                                >
                                    Ir para Pagamento
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ STEP 3: PAYMENT ═════════ */}
                    {step === "PAY" && (
                        <motion.div 
                            key="pay"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <h3 className="text-xl font-black text-white italic text-center mb-8">Método de Pagamento</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: 'PIX', label: 'Pix', icon: <Zap /> },
                                    { id: 'CARD', label: 'Cartão', icon: <CreditCard /> },
                                    { id: 'MONEY', label: 'Dinheiro', icon: <div className="text-xl">💵</div> },
                                    { id: 'WA', label: 'WhatsApp Pay', icon: <MessageSquare /> },
                                ].map(m => (
                                    <button 
                                        key={m.id}
                                        onClick={() => setStep("DONE")}
                                        className="p-8 rounded-[32px] bg-white/5 border border-white/5 flex flex-col items-center gap-3 active:bg-red-600 active:border-red-600 transition-all"
                                    >
                                        <div className="text-red-500 group-active:text-white scale-125">{m.icon}</div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ STEP 4: DONE ═════════ */}
                    {step === "DONE" && (
                        <motion.div 
                            key="done"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center text-center space-y-8 pt-10"
                        >
                            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-500/30">
                                <Check size={48} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white italic">Vendido!</h2>
                                <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">Ingresso enviado por WhatsApp</p>
                            </div>
                            <Button 
                                onClick={resetSale}
                                className="w-full bg-white text-black py-6 rounded-2xl font-black italic text-sm"
                            >
                                Próxima Venda
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* QUICK ACTIONS BAR (LIST VIEW) */}
            {step === "LIST" && (
                <div className="fixed bottom-6 right-6">
                    <button className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-600/40 active:scale-90 transition-transform">
                        <Zap size={24} className="text-white" />
                    </button>
                </div>
            )}
        </div>
    );
};
