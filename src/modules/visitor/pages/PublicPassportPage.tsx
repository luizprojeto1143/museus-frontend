import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../../api/client";
import { Star, Award, MapPin, Globe, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export const PublicPassportPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [visitor, setVisitor] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPublicData = async () => {
            try {
                // Public route - doesn't need auth (needs to be created in backend)
                const res = await api.get(`/visitors/public-passport/${id}`);
                setVisitor(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadPublicData();
    }, [id]);

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Autenticando Passaporte...</div>;
    if (!visitor) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-500">Passaporte não encontrado.</div>;

    const equippedSkin = visitor.skins?.find((s: any) => s.equipped)?.skin;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden">
            {/* AMBIENT BACKGROUNDS */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                
                {/* GRID PATTERN */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            </div>

            <div className="max-w-xl mx-auto px-6 py-12 relative z-10">
                <motion.header 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                     <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-lg shadow-blue-500/5">
                        <ShieldCheck size={14} className="animate-pulse" /> Passaporte Digital Verificado
                     </div>
                     <h1 className="text-5xl font-black text-white tracking-tighter mb-2">
                        QS <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Cultura</span>
                     </h1>
                     <p className="text-slate-500 text-sm font-medium">Registro Oficial de Engajamento Cultural</p>
                </motion.header>

                {/* PROFILE CARD - PREMIUM FEEL */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-[48px] p-10 backdrop-blur-3xl mb-12 relative overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] group"
                >
                     <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
                     
                     {/* LIGHT BEAM EFFECT */}
                     <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 rotate-12 pointer-events-none group-hover:rotate-45 transition-transform duration-1000" />

                     <div className="relative z-10 flex flex-col items-center">
                        <div className="w-40 h-40 bg-slate-900 rounded-[40px] border-4 border-white/10 mb-8 flex items-center justify-center overflow-hidden shadow-2xl relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 animate-pulse" />
                            <img 
                                src={equippedSkin?.imageUrl || "/default_avatar.png"} 
                                className="h-[90%] object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)] z-10 transition-transform group-hover:scale-110 duration-500" 
                                alt="Avatar" 
                            />
                        </div>

                        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">{visitor.name}</h2>
                        <div className="flex items-center gap-2 mb-8 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/10">
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                            <span className="text-blue-400 font-black uppercase tracking-[0.1em] text-[10px]">Cidadão Embaixador</span>
                        </div>

                        <div className="grid grid-cols-2 gap-6 w-full">
                            <div className="bg-black/20 rounded-[24px] p-6 border border-white/5 text-center transition-colors group-hover:border-yellow-500/20">
                                <div className="text-yellow-500 flex justify-center mb-2"><Star size={24} fill="currentColor" className="drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" /></div>
                                <div className="text-3xl font-black text-white tracking-tighter">{visitor.xp?.toLocaleString()}</div>
                                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Acervo Global XP</div>
                            </div>
                            <div className="bg-black/20 rounded-[24px] p-6 border border-white/5 text-center transition-colors group-hover:border-blue-500/20">
                                <div className="text-blue-400 flex justify-center mb-2"><Award size={24} className="drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" /></div>
                                <div className="text-3xl font-black text-white tracking-tighter">{visitor.stamps?.length || 0}</div>
                                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Carimbos Reais</div>
                            </div>
                        </div>
                     </div>
                </motion.div>

                {/* STAMPS GRID */}
                <div className="flex items-center justify-between mb-8 px-2">
                    <h3 className="text-white font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3">
                        <MapPin size={16} className="text-blue-500" /> Jornada Cultural
                    </h3>
                    <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-6" />
                </div>
                
                <div className="grid grid-cols-4 gap-4 mb-16">
                    {visitor.stamps?.map((stamp: any, idx: number) => (
                        <motion.div 
                            key={idx} 
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="aspect-square bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center group relative cursor-help shadow-lg"
                        >
                            <img src={stamp.work?.imageUrl} className="w-[75%] h-[75%] object-contain drop-shadow-lg transition-transform" />
                            <div className="absolute inset-0 bg-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-1.5 shadow-xl border border-white/20">
                                <ShieldCheck size={12} className="text-white" />
                            </div>
                        </motion.div>
                    ))}
                    {Array.from({ length: Math.max(0, 12 - (visitor.stamps?.length || 0)) }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square bg-slate-900/40 border border-dashed border-white/5 rounded-2xl" />
                    ))}
                </div>

                <footer className="text-center pt-12 border-t border-white/5 opacity-40 hover:opacity-100 transition-opacity">
                     <p className="text-slate-500 text-[9px] uppercase font-black tracking-[0.4em] mb-6">Autenticado via Blockchain PicWish</p>
                     <div className="flex justify-center gap-8 items-center">
                        <img src="/logo-prefeitura.png" className="h-6 grayscale" alt="Prefeitura" />
                        <div className="w-px h-4 bg-white/10" />
                        <img src="/logo-cultura.png" className="h-6 grayscale" alt="Cultura" />
                     </div>
                </footer>
            </div>
        </div>
    );
};
