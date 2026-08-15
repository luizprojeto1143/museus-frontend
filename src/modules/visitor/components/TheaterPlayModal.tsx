import React from "react";
import { X, Calendar, MapPin, Ticket, Users, Clock, Star, Sparkles, ChevronRight, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Badge } from "@/components/ui";

export interface TheaterPlay {
    id: string;
    title: string;
    theaterName: string;
    cityName: string;
    posterUrl: string;
    synopsis?: string;
    dates: string;
    times?: string;
    price: string;
    isLocal: boolean;
    cast?: Array<{
        name: string;
        role: string;
        photoUrl?: string;
    }>;
}

interface TheaterPlayModalProps {
    play: TheaterPlay | null;
    onClose: () => void;
    onBuy: (playId: string) => void;
}

export const TheaterPlayModal: React.FC<TheaterPlayModalProps> = ({ play, onClose, onBuy }) => {
    if (!play) return null;

    const defaultCast = play.cast && play.cast.length > 0 ? play.cast : [
        {
            name: "Matheus Nachtergaele",
            role: "João Grilo (Protagonista)",
            photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
        },
        {
            name: "Fernanda Montenegro",
            role: "Nossa Senhora (Participação Especial)",
            photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80"
        },
        {
            name: "Selton Mello",
            role: "Chicó (Protagonista)",
            photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
        },
        {
            name: "Guel Arraes",
            role: "Diretor de Cena",
            photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80"
        }
    ];

    const synopsisText = play.synopsis || "Uma superprodução teatral emocionante trazendo os maiores nomes da dramaturgia para os palcos do teatro municipal. Venha vivenciar esta experiência inesquecível com mapa interativo de assentos e bilheteria oficial.";

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="bg-slate-950 border border-amber-500/30 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative my-6"
                >
                    {/* Header Banner & Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/70 text-white hover:bg-amber-500 hover:text-slate-950 flex items-center justify-center transition-all border border-white/20"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col md:flex-row">
                        {/* Poster Column */}
                        <div className="md:w-5/12 relative h-80 md:h-auto bg-slate-900 overflow-hidden">
                            <img
                                src={play.posterUrl}
                                alt={play.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent md:hidden" />
                            <Badge className="absolute top-4 left-4 bg-amber-500 text-slate-950 font-black border-none px-3 py-1 text-[10px] uppercase">
                                {play.isLocal ? "Na Sua Cidade" : "Em Cartaz"}
                            </Badge>
                        </div>

                        {/* Content Column */}
                        <div className="md:w-7/12 p-6 md:p-8 space-y-6 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs text-amber-400 font-bold tracking-widest uppercase flex items-center gap-1.5 mb-1">
                                        <MapPin size={14} /> {play.theaterName} • {play.cityName}
                                    </span>
                                    <h2 className="text-2xl md:text-3xl font-black text-white italic tracking-tight leading-tight">
                                        {play.title}
                                    </h2>
                                </div>

                                {/* Date & Schedule Badges */}
                                <div className="flex flex-wrap gap-2 pt-1">
                                    <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                        <Calendar size={14} className="text-amber-400" /> {play.dates}
                                    </span>
                                    <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                        <Clock size={14} className="text-amber-400" /> {play.times || "20:00h"}
                                    </span>
                                </div>

                                {/* Synopsis */}
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                        Sinopse do Espetáculo
                                    </h4>
                                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed bg-white/[0.02] p-3.5 rounded-2xl border border-white/5">
                                        {synopsisText}
                                    </p>
                                </div>

                                {/* Cast Gallery with Photos */}
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                                        <Users size={14} /> Elenco & Ficha Técnica ({defaultCast.length})
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                                        {defaultCast.map((actor, idx) => (
                                            <div key={idx} className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5">
                                                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-slate-900 border border-amber-500/30">
                                                    {actor.photoUrl ? (
                                                        <img src={actor.photoUrl} alt={actor.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-amber-400 font-bold text-xs">
                                                            {actor.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-bold text-white truncate">{actor.name}</p>
                                                    <p className="text-[10px] text-slate-400 truncate">{actor.role}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer & Instant Buy CTA */}
                            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                                <div>
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Ingressos a partir de</span>
                                    <span className="text-xl font-black text-amber-400">{play.price}</span>
                                </div>
                                <Button
                                    onClick={() => onBuy(play.id)}
                                    className="bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-105 transition-all text-xs uppercase"
                                >
                                    <Ticket size={16} /> Comprar Ingresso
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
