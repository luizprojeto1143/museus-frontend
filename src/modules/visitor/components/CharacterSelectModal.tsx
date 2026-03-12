import React, { useState, useEffect } from "react";
import { api } from "../../../api/client";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Sparkles, User, CheckCircle2, Crown } from "lucide-react";
import { Button } from "../../../components/ui";

interface CharacterBase {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
}

interface CharacterSelectModalProps {
    isOpen: boolean;
    onSelect: (characterId: string) => Promise<void>;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({ isOpen, onSelect }) => {
    const [characters, setCharacters] = useState<CharacterBase[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const load = async () => {
            try {
                const res = await api.get("/characters");
                setCharacters(res.data);
                if (res.data.length > 0) setSelectedId(res.data[0].id);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [isOpen]);

    const handleConfirm = async () => {
        if (!selectedId) return;
        setSubmitting(true);
        try {
            await onSelect(selectedId);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-white/10 p-8 rounded-[48px] max-w-4xl w-full shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <header className="mb-10 text-center">
                        <div className="bg-yellow-500/10 w-fit p-3 rounded-2xl mx-auto mb-4 border border-yellow-500/20">
                            <Sparkles className="text-yellow-500" size={24} />
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tighter italic">Escolha sua Origem</h2>
                        <p className="text-slate-500 text-sm font-medium mt-1">Este será seu personagem base para sempre</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto pr-2 mb-10 custom-scrollbar">
                        {characters.map((char) => (
                            <motion.button
                                key={char.id}
                                whileHover={{ y: -8 }}
                                onClick={() => setSelectedId(char.id)}
                                className={`group relative rounded-[32px] border-2 transition-all p-6 text-center flex flex-col items-center ${
                                    selectedId === char.id
                                        ? "bg-blue-600/10 border-blue-500 shadow-2xl shadow-blue-500/10"
                                        : "bg-white/5 border-white/5 hover:border-white/10"
                                }`}
                            >
                                <div className="relative mb-6">
                                    <div className={`absolute inset-0 blur-2xl opacity-20 bg-blue-500 rounded-full transition-opacity ${selectedId === char.id ? 'opacity-40' : 'group-hover:opacity-40'}`} />
                                    <img src={char.imageUrl} className="w-32 h-32 object-contain relative z-10 drop-shadow-2xl" alt={char.name} />
                                </div>
                                
                                <h3 className="text-white font-black text-lg mb-1">{char.name}</h3>
                                <p className="text-slate-500 text-[10px] font-medium leading-relaxed italic">{char.description}</p>

                                {selectedId === char.id && (
                                    <div className="absolute top-4 right-4 bg-blue-500 rounded-full p-1.5 shadow-lg border-2 border-slate-950">
                                        <CheckCircle2 size={16} className="text-white" />
                                    </div>
                                )}
                            </motion.button>
                        ))}
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/5">
                        <Button
                            className="w-full h-16 rounded-3xl bg-white text-slate-950 hover:bg-yellow-500 hover:text-white transition-all duration-500 font-black text-sm uppercase tracking-widest shadow-2xl shadow-white/5 flex items-center justify-center gap-3 disabled:opacity-50"
                            onClick={handleConfirm}
                            disabled={submitting || !selectedId}
                        >
                            {submitting ? (
                                <div className="w-6 h-6 border-3 border-slate-950/20 border-t-slate-950 animate-spin rounded-full" />
                            ) : (
                                <>
                                    Desbloquear Avatar <Shield size={18} />
                                </>
                            )}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
