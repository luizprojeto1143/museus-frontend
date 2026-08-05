import React from "react";
import { CreditCard, MessageSquare, Wifi, WifiOff, Search, ChevronLeft, Check, Zap, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Input } from "../../../components/ui";
import { useBoxOffice } from "./useBoxOffice";

export const TheaterMobileBoxOffice: React.FC = () => {
    const {
        step, setStep,
        selectedSession, selectSession,
        selectedSeats, toggleSeat,
        selectedExtras, toggleExtra,
        online,
        sessions, seats, extras,
        loadingSessions, loadingSeats, selling, error,
        seatsTotal, grandTotal,
        sell, resetSale
    } = useBoxOffice();

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-red-500/30 overflow-x-hidden">
            <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {step !== "LIST" && (
                        <button onClick={() => setStep("LIST")} className="p-2 bg-white/5 rounded-xl"><ChevronLeft size={20} /></button>
                    )}
                    <div>
                        <h1 className="text-sm font-black uppercase tracking-widest italic">Mobile POS</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Bilheteria</p>
                    </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${online ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                    {online ? <Wifi size={12} /> : <WifiOff size={12} />} {online ? "Online" : "Offline"}
                </div>
            </header>

            <main className="p-4 pb-32">
                <AnimatePresence mode="wait">
                    {step === "LIST" && (
                        <motion.div key="list" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <Input className="bg-white/5 border-white/5 pl-12 py-6 rounded-2xl" placeholder="Buscar espetaculo..." />
                            </div>

                            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4 ml-1">Sessoes Disponiveis</h2>
                            {error && <p className="text-xs text-red-400 font-bold">{error}</p>}
                            {loadingSessions && <p className="text-sm text-slate-500">Carregando sessoes...</p>}
                            {!loadingSessions && sessions.length === 0 && <p className="text-sm text-slate-500">Nenhuma sessao disponivel.</p>}

                            {sessions.map(session => (
                                <div key={session.id} onClick={() => selectSession(session)} className="p-5 rounded-3xl bg-white/5 border border-white/5 active:scale-95 transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-500 flex items-center justify-center font-black italic">
                                            {session.time}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-sm">{session.title}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Lotacao: {session.occupancy ?? 0}%</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black">R$ {Number(session.price || 0).toFixed(2)}</p>
                                        <span className="text-[8px] text-emerald-400 font-black uppercase tracking-widest">Venda Rapida</span>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {step === "SEATS" && (
                        <motion.div key="seats" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="space-y-6">
                            <div className="bg-red-600/10 p-4 rounded-2xl border border-red-500/20 text-center mb-6">
                                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{selectedSession?.title || "Sessao"} - {selectedSession?.time || "--:--"}</p>
                            </div>

                            <div className="w-full h-2 bg-white/10 rounded-full mb-12 flex items-center justify-center">
                                <span className="text-[8px] font-black text-slate-700 uppercase tracking-[1em] absolute">PALCO</span>
                            </div>

                            {loadingSeats && <p className="text-center text-sm text-slate-500">Carregando assentos...</p>}
                            {!loadingSeats && seats.length === 0 && <p className="text-center text-sm text-slate-500">Mapa de assentos indisponivel para esta sessao.</p>}

                            <div className="grid grid-cols-8 gap-2">
                                {seats.map(seat => {
                                    const id = String(seat.id);
                                    const isOccupied = seat.available === false || ["SOLD", "RESERVED", "BLOCKED"].includes(String(seat.status || "").toUpperCase());
                                    const isSelected = selectedSeats.includes(id);
                                    return (
                                        <button key={id} disabled={isOccupied} onClick={() => toggleSeat(id)} className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${isOccupied ? "bg-white/5 text-slate-800" : isSelected ? "bg-red-500 text-white shadow-lg shadow-red-500/30" : "bg-white/10 text-slate-400 border border-white/5"}`}>
                                            {seat.label || seat.number || id}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="fixed bottom-0 left-0 w-full p-4 bg-slate-950/80 backdrop-blur-2xl border-t border-white/5 flex gap-4">
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total: {selectedSeats.length} Ingressos</p>
                                    <p className="text-xl font-black italic text-white">R$ {seatsTotal.toFixed(2)}</p>
                                </div>
                                <Button disabled={selectedSeats.length === 0} onClick={() => setStep("EXTRAS")} className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-2xl font-black italic flex items-center gap-2">
                                    Continuar <Zap size={16} />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === "EXTRAS" && (
                        <motion.div key="extras" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <h3 className="text-xl font-black text-white italic text-center mb-8">Extras & Souvenirs</h3>
                            <div className="space-y-4">
                                {extras.length === 0 && <div className="p-6 rounded-[32px] border border-white/5 bg-white/5 text-center text-slate-500 text-sm">Nenhum extra configurado para esta sessao.</div>}
                                {extras.map(item => {
                                    const isSelected = selectedExtras.find(e => String(e.id) === String(item.id));
                                    return (
                                        <div key={item.id} onClick={() => toggleExtra(item)} className={`p-6 rounded-[32px] border transition-all flex items-center justify-between ${isSelected ? "bg-red-600 border-red-600 shadow-lg" : "bg-white/5 border-white/5"}`}>
                                            <div className="flex items-center gap-4">
                                                <div className="text-3xl">{item.icon || "+"}</div>
                                                <div>
                                                    <p className="font-black text-sm">{item.name}</p>
                                                    <p className={`text-[10px] font-bold uppercase ${isSelected ? "text-white" : "text-slate-500"}`}>R$ {Number(item.price || 0).toFixed(2)}</p>
                                                </div>
                                            </div>
                                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${isSelected ? "bg-white text-red-600" : "border-white/20"}`}>
                                                {isSelected ? <Check size={16} /> : <Plus size={16} />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="fixed bottom-0 left-0 w-full p-4 bg-slate-950/80 backdrop-blur-2xl border-t border-white/5 flex gap-4">
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Geral</p>
                                    <p className="text-xl font-black italic text-white">R$ {grandTotal.toFixed(2)}</p>
                                </div>
                                <Button onClick={() => setStep("PAY")} className="bg-white text-black px-8 py-6 rounded-2xl font-black italic flex items-center gap-2">
                                    Ir para Pagamento
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === "PAY" && (
                        <motion.div key="pay" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <h3 className="text-xl font-black text-white italic text-center mb-8">Metodo de Pagamento</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: "PIX", label: "Pix", icon: <Zap /> },
                                    { id: "CARD", label: "Cartao", icon: <CreditCard /> },
                                    { id: "MONEY", label: "Dinheiro", icon: <span className="text-xl">R$</span> },
                                    { id: "WA", label: "WhatsApp Pay", icon: <MessageSquare /> },
                                ].map(method => (
                                    <button key={method.id} onClick={() => sell(method.id)} disabled={selling || selectedSeats.length === 0} className="p-8 rounded-[32px] bg-white/5 border border-white/5 flex flex-col items-center gap-3 active:bg-red-600 active:border-red-600 transition-all disabled:opacity-50">
                                        <div className="text-red-500 scale-125">{method.icon}</div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">{selling ? "Processando..." : method.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === "DONE" && (
                        <motion.div key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center space-y-8 pt-10">
                            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-500/30">
                                <Check size={48} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white italic">Vendido!</h2>
                                <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">Venda registrada no backend</p>
                            </div>
                            <Button onClick={resetSale} className="w-full bg-white text-black py-6 rounded-2xl font-black italic text-sm">
                                Proxima Venda
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};
