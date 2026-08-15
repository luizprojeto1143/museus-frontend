import React, { useState, useEffect } from "react";
import { Theater, Ticket, QrCode, CreditCard, CheckCircle2, ArrowRight, RefreshCw, Volume2, Sparkles, MapPin, Calendar, Clock, Armchair, ShieldCheck, Printer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Badge } from "@/components/ui";
import { toast } from "react-hot-toast";

interface KioskPlay {
    id: string;
    title: string;
    posterUrl: string;
    time: string;
    price: number;
    availableSeats: number;
}

const DEMO_KIOSK_PLAYS: KioskPlay[] = [
    {
        id: "kiosk-play-1",
        title: "O Auto da Compadecida",
        posterUrl: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=600&q=80",
        time: "Hoje às 20:00h",
        price: 25.00,
        availableSeats: 48
    },
    {
        id: "kiosk-play-2",
        title: "O Fantasma da Ópera",
        posterUrl: "https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=600&q=80",
        time: "Hoje às 22:30h",
        price: 40.00,
        availableSeats: 12
    }
];

type KioskStep = "SELECT_PLAY" | "SELECT_SEAT" | "PAYMENT" | "SUCCESS";

export const TheaterKiosk: React.FC = () => {
    const [step, setStep] = useState<KioskStep>("SELECT_PLAY");
    const [selectedPlay, setSelectedPlay] = useState<KioskPlay | null>(DEMO_KIOSK_PLAYS[0]);
    const [ticketType, setTicketType] = useState<"INTEIRA" | "MEIA">("INTEIRA");
    const [selectedSeat, setSelectedSeat] = useState<string>("B-04");
    const [isPaying, setIsPaying] = useState(false);
    const [countdown, setCountdown] = useState(120);

    // Auto-reset kiosk if idle for 2 minutes
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    setStep("SELECT_PLAY");
                    return 120;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [step]);

    const handleSelectPlay = (play: KioskPlay) => {
        setSelectedPlay(play);
        setStep("SELECT_SEAT");
    };

    const handleConfirmSeat = () => {
        setStep("PAYMENT");
    };

    const handleSimulatePayment = () => {
        setIsPaying(true);
        setTimeout(() => {
            setIsPaying(false);
            setStep("SUCCESS");
            toast.success("Pagamento aprovado! Imprimindo ingresso...");
        }, 3500);
    };

    const handlePrintTicket = () => {
        window.print();
    };

    const handleRestartKiosk = () => {
        setStep("SELECT_PLAY");
        setSelectedPlay(DEMO_KIOSK_PLAYS[0]);
        setCountdown(120);
    };

    const finalPrice = selectedPlay ? (ticketType === "MEIA" ? selectedPlay.price / 2 : selectedPlay.price) : 0;

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between p-6 md:p-12 select-none overflow-hidden relative">
            {/* Header Totem */}
            <header className="flex items-center justify-between border-b border-amber-500/20 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl">
                        <Theater size={36} />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
                            Teatro Municipal • Totem de Autoatendimento
                        </span>
                        <h1 className="text-2xl md:text-4xl font-black italic tracking-tight text-white">
                            Bilheteria Express Touch
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 px-4 py-2 text-xs font-bold uppercase tracking-wider">
                        ● Totem Online
                    </Badge>
                    <button
                        onClick={handleRestartKiosk}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-slate-400 hover:text-white transition-all flex items-center gap-2 text-xs font-bold"
                    >
                        <RefreshCw size={16} /> Reiniciar
                    </button>
                </div>
            </header>

            {/* Main Content Body */}
            <main className="flex-1 my-8 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {/* STEP 1: SELECT PLAY */}
                    {step === "SELECT_PLAY" && (
                        <motion.div
                            key="select_play"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full max-w-5xl space-y-8"
                        >
                            <div className="text-center space-y-2">
                                <h2 className="text-3xl md:text-5xl font-black italic tracking-tight text-white">
                                    Toque na Peça para Comprar seu Ingresso
                                </h2>
                                <p className="text-slate-400 text-sm md:text-lg">
                                    Apresentações disponíveis hoje com escolha imediata de assento na plateia.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                                {DEMO_KIOSK_PLAYS.map(play => (
                                    <div
                                        key={play.id}
                                        onClick={() => handleSelectPlay(play)}
                                        className="bg-slate-900/90 border-2 border-white/10 hover:border-amber-500 rounded-3xl p-6 cursor-pointer transition-all hover:scale-105 shadow-2xl flex gap-6 group"
                                    >
                                        <img
                                            src={play.posterUrl}
                                            alt={play.title}
                                            className="w-32 h-44 object-cover rounded-2xl border border-white/10 group-hover:border-amber-500/50 shadow-lg shrink-0"
                                        />
                                        <div className="flex flex-col justify-between flex-1">
                                            <div className="space-y-2">
                                                <Badge className="bg-amber-500/20 border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase">
                                                    Sessão de Hoje
                                                </Badge>
                                                <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors">
                                                    {play.title}
                                                </h3>
                                                <p className="text-xs text-slate-400 flex items-center gap-1.5 font-bold">
                                                    <Clock size={14} className="text-amber-400" /> {play.time}
                                                </p>
                                                <p className="text-xs text-emerald-400 font-bold">
                                                    {play.availableSeats} poltronas disponíveis
                                                </p>
                                            </div>

                                            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                                <div>
                                                    <span className="text-[10px] text-slate-500 uppercase font-bold block">A partir de</span>
                                                    <span className="text-xl font-black text-amber-400">R$ {play.price.toFixed(2)}</span>
                                                </div>
                                                <Button className="bg-amber-500 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs uppercase flex items-center gap-1.5">
                                                    Comprar <ArrowRight size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: SELECT SEAT & TICKET TYPE */}
                    {step === "SELECT_SEAT" && selectedPlay && (
                        <motion.div
                            key="select_seat"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-4xl bg-slate-900 border border-amber-500/30 rounded-3xl p-8 space-y-8 shadow-2xl"
                        >
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div>
                                    <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Passo 2 de 3</span>
                                    <h2 className="text-2xl md:text-3xl font-black text-white italic">
                                        Escolha seu Assento & Categoria
                                    </h2>
                                </div>
                                <Button variant="outline" onClick={() => setStep("SELECT_PLAY")} className="border-white/10 text-slate-400">
                                    Voltar
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Seat Selector Simulation */}
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                        Poltronas Recomendadas na Plateia:
                                    </label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {["A-01", "A-02", "B-03", "B-04", "B-05", "C-01", "C-02", "C-03"].map(seat => (
                                            <button
                                                key={seat}
                                                onClick={() => setSelectedSeat(seat)}
                                                className={`p-4 rounded-2xl border font-black text-sm transition-all flex flex-col items-center gap-1 ${
                                                    selectedSeat === seat
                                                        ? "bg-amber-500 border-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 scale-105"
                                                        : "bg-white/5 border-white/10 text-slate-300 hover:border-amber-500/50"
                                                }`}
                                            >
                                                <Armchair size={20} />
                                                <span>{seat}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Ticket Category */}
                                <div className="space-y-6 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                            Selecione a Categoria do Ingresso:
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div
                                                onClick={() => setTicketType("INTEIRA")}
                                                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                                                    ticketType === "INTEIRA"
                                                        ? "bg-amber-500/10 border-amber-500 text-white"
                                                        : "bg-white/5 border-white/10 text-slate-400"
                                                }`}
                                            >
                                                <strong className="text-base font-bold block text-white">Inteira</strong>
                                                <span className="text-amber-400 font-black text-lg block mt-1">
                                                    R$ {selectedPlay.price.toFixed(2)}
                                                </span>
                                            </div>

                                            <div
                                                onClick={() => setTicketType("MEIA")}
                                                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                                                    ticketType === "MEIA"
                                                        ? "bg-amber-500/10 border-amber-500 text-white"
                                                        : "bg-white/5 border-white/10 text-slate-400"
                                                }`}
                                            >
                                                <strong className="text-base font-bold block text-white">Meia-Entrada</strong>
                                                <span className="text-amber-400 font-black text-lg block mt-1">
                                                    R$ {(selectedPlay.price / 2).toFixed(2)}
                                                </span>
                                                <span className="text-[9px] text-slate-500 uppercase font-bold block mt-1">
                                                    Estudantes, Idosos, PCD
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                                        <div>
                                            <span className="text-xs text-slate-400 block">Total a Pagar ({selectedSeat}):</span>
                                            <span className="text-2xl font-black text-amber-400">R$ {finalPrice.toFixed(2)}</span>
                                        </div>
                                        <Button
                                            onClick={handleConfirmSeat}
                                            className="bg-amber-500 text-slate-950 font-black px-6 py-3 rounded-xl text-xs uppercase"
                                        >
                                            Avançar para Pagamento <ArrowRight size={16} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: PIX / NFC PAYMENT */}
                    {step === "PAYMENT" && selectedPlay && (
                        <motion.div
                            key="payment"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-xl bg-slate-900 border border-amber-500/40 rounded-3xl p-8 text-center space-y-6 shadow-2xl"
                        >
                            <div>
                                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 px-3 py-1 text-xs font-bold uppercase">
                                    Pagamento Instantâneo Totem
                                </Badge>
                                <h2 className="text-2xl md:text-3xl font-black text-white italic mt-2">
                                    Escaneie o QR Code PIX na Tela
                                </h2>
                                <p className="text-xs text-slate-400">Aponte a câmera do seu aplicativo bancário para confirmar.</p>
                            </div>

                            {/* Simulated PIX QR Code */}
                            <div className="bg-white p-6 rounded-3xl inline-block shadow-2xl border-4 border-amber-500/30">
                                <QrCode size={180} className="text-slate-950 mx-auto" />
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs text-slate-400 font-bold block">Valor Total:</span>
                                <span className="text-3xl font-black text-amber-400">R$ {finalPrice.toFixed(2)}</span>
                                <p className="text-xs text-slate-500 font-bold">Assento: {selectedSeat} • {selectedPlay.title}</p>
                            </div>

                            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                                <Button variant="outline" onClick={() => setStep("SELECT_SEAT")} className="border-white/10 text-slate-400">
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleSimulatePayment}
                                    disabled={isPaying}
                                    className="bg-emerald-500 text-slate-950 font-black px-8 py-3 rounded-xl uppercase text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                                >
                                    {isPaying ? "Processando Pagamento..." : "Simular Pagamento PIX"}
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: SUCCESS & PRINT */}
                    {step === "SUCCESS" && selectedPlay && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-xl bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-8 text-center space-y-6 shadow-2xl"
                        >
                            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-500/40 animate-bounce">
                                <CheckCircle2 size={48} />
                            </div>

                            <div>
                                <h2 className="text-3xl font-black text-white italic">
                                    Pagamento Aprovado!
                                </h2>
                                <p className="text-sm text-slate-300 mt-1">
                                    Seu ingresso foi gerado e a impressora térmica do totem foi acionada.
                                </p>
                            </div>

                            {/* Ticket Stub Receipt */}
                            <div className="bg-white text-slate-950 p-6 rounded-2xl border-2 border-dashed border-slate-400 font-mono text-left space-y-2 text-xs shadow-inner">
                                <div className="text-center border-b border-slate-300 pb-2 mb-2">
                                    <strong className="block text-sm font-black">TEATRO MUNICIPAL</strong>
                                    <span>BILHETE OFICIAL DE ENTRADA</span>
                                </div>
                                <p><strong>Espetáculo:</strong> {selectedPlay.title}</p>
                                <p><strong>Horário:</strong> {selectedPlay.time}</p>
                                <p><strong>Assento / Poltrona:</strong> {selectedSeat}</p>
                                <p><strong>Tipo:</strong> {ticketType}</p>
                                <p><strong>Valor Pago:</strong> R$ {finalPrice.toFixed(2)}</p>
                                <div className="text-center pt-2 border-t border-slate-300">
                                    <span className="text-[10px] text-slate-600">Apresente na portaria para entrada</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-4 pt-4">
                                <Button
                                    onClick={handlePrintTicket}
                                    className="bg-amber-500 text-slate-950 font-black px-6 py-3 rounded-xl flex items-center gap-2 text-xs uppercase"
                                >
                                    <Printer size={16} /> Imprimir Bilhete
                                </Button>
                                <Button
                                    onClick={handleRestartKiosk}
                                    className="bg-white/10 hover:bg-white/20 text-white font-black px-6 py-3 rounded-xl text-xs uppercase"
                                >
                                    Concluir e Voltar
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer Status */}
            <footer className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-500">
                <span>Toque na tela para interagir • Suporte a Acessibilidade LIBRAS/Áudio</span>
                <span>Reset automático em {countdown}s</span>
            </footer>
        </div>
    );
};
