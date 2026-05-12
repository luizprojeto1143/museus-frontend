import React, { useState } from "react";
import { 
    BookOpen, Image as ImageIcon, Users, Type, 
    QrCode, Share2, Eye, Save, Plus, 
    Trash2, Sparkles, Wand2, Smartphone
} from "lucide-react";
import { Button, Input, Textarea } from "../../../components/ui";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

export const TheaterPlaybill: React.FC = () => {
    const [step, setStep] = useState(1);
    const [playbill, setPlaybill] = useState({
        title: "O Fantasma da Ópera",
        synopsis: "Um gênio musical deformado vive nas catacumbas da Ópera de Paris...",
        cast: [
            { name: "Erik Destler", role: "O Fantasma", bio: "Barítono com 15 anos de experiência..." },
            { name: "Christine Daaé", role: "Soprano", bio: "Revelação do teatro lírico..." }
        ],
        sponsors: []
    });

    const addActor = () => {
        setPlaybill({
            ...playbill,
            cast: [...playbill.cast, { name: "", role: "", bio: "" }]
        });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20 px-4">
            {/* ═══ HEADER ═══════════ */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <span className="text-red-500 font-black text-[10px] uppercase tracking-[0.4em] mb-2 block italic">Interactive Audience Experience</span>
                    <h1 className="text-5xl font-black text-white tracking-tighter italic">Programa Digital</h1>
                    <p className="text-slate-500 font-medium mt-2">Crie experiências imersivas para o seu público via QR Code.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="secondary" className="px-8 py-7 rounded-3xl font-black italic flex items-center gap-3">
                        <Eye size={20} /> Preview Mobile
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700 text-white px-10 py-7 rounded-3xl font-black italic shadow-2xl shadow-red-600/20 flex items-center gap-3">
                        <Save size={20} /> Publicar Programa
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* ═══ WIZARD STEPS ═════════ */}
                <div className="lg:col-span-2 space-y-8">
                    {/* SECTION: BASICS */}
                    <section className="premium-glass p-10 rounded-[48px] border-white/5 space-y-8">
                        <h3 className="text-xl font-black text-white italic flex items-center gap-3">
                            <Type className="text-red-500" /> 1. Identidade do Espetáculo
                        </h3>
                        <div className="space-y-6">
                            <Input 
                                label="Título do Programa"
                                value={playbill.title}
                                onChange={e => setPlaybill({...playbill, title: e.target.value})}
                                className="bg-white/5 border-white/10 text-white text-lg font-bold py-7 rounded-2xl"
                            />
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Sinopse de Impacto</label>
                                    <button className="text-[10px] text-red-400 font-black flex items-center gap-1 uppercase hover:underline">
                                        <Wand2 size={12} /> Refinar com IA
                                    </button>
                                </div>
                                <Textarea 
                                    value={playbill.synopsis}
                                    onChange={e => setPlaybill({...playbill, synopsis: e.target.value})}
                                    className="bg-white/5 border-white/10 text-white min-h-[150px] rounded-[32px] p-6"
                                    placeholder="Descreva a magia do espetáculo..."
                                />
                            </div>
                        </div>
                    </section>

                    {/* SECTION: CAST */}
                    <section className="premium-glass p-10 rounded-[48px] border-white/5 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-white italic flex items-center gap-3">
                                <Users className="text-red-500" /> 2. Elenco & Ficha Técnica
                            </h3>
                            <Button onClick={addActor} variant="ghost" className="text-[10px] font-black uppercase text-slate-500">
                                <Plus size={16} /> Adicionar Ator
                            </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {playbill.cast.map((actor, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-6 rounded-[32px] bg-white/5 border border-white/5 group relative"
                                >
                                    <button className="absolute top-4 right-4 text-slate-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={16} />
                                    </button>
                                    <div className="flex gap-4 mb-4">
                                        <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-dashed border-white/10 flex items-center justify-center text-slate-600 hover:border-red-500/30 hover:text-red-400 cursor-pointer transition-all">
                                            <ImageIcon size={24} />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <input 
                                                className="w-full bg-transparent border-none text-white font-black text-sm p-0 focus:ring-0 placeholder:text-slate-700"
                                                placeholder="Nome do Ator"
                                                value={actor.name}
                                                onChange={e => {
                                                    const cast = [...playbill.cast];
                                                    cast[idx].name = e.target.value;
                                                    setPlaybill({...playbill, cast});
                                                }}
                                            />
                                            <input 
                                                className="w-full bg-transparent border-none text-red-400 font-black text-[10px] uppercase tracking-widest p-0 focus:ring-0 placeholder:text-slate-700"
                                                placeholder="Papel / Função"
                                                value={actor.role}
                                                onChange={e => {
                                                    const cast = [...playbill.cast];
                                                    cast[idx].role = e.target.value;
                                                    setPlaybill({...playbill, cast});
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <textarea 
                                        className="w-full bg-black/20 border-none text-slate-400 text-[11px] rounded-xl p-3 focus:ring-0 resize-none"
                                        placeholder="Breve biografia..."
                                        rows={2}
                                        value={actor.bio}
                                        onChange={e => {
                                            const cast = [...playbill.cast];
                                            cast[idx].bio = e.target.value;
                                            setPlaybill({...playbill, cast});
                                        }}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* ═══ PREVIEW & PUBLISH ═════════ */}
                <div className="space-y-6">
                    <div className="premium-glass p-8 rounded-[48px] border-white/5 flex flex-col items-center text-center space-y-6">
                        <div className="w-48 h-48 p-4 bg-white rounded-[32px] shadow-2xl flex items-center justify-center">
                            <QrCode size={140} className="text-black" />
                        </div>
                        <div>
                            <h4 className="text-white font-black italic">Acesso Instantâneo</h4>
                            <p className="text-xs text-slate-500 font-bold mt-1">Este QR Code levará seu público diretamente ao programa.</p>
                        </div>
                        <div className="flex gap-2 w-full">
                            <Button variant="secondary" className="flex-1 rounded-2xl py-4 text-[10px] font-black uppercase"><Share2 size={14} /> Link</Button>
                            <Button variant="secondary" className="flex-1 rounded-2xl py-4 text-[10px] font-black uppercase"><QrCode size={14} /> PNG</Button>
                        </div>
                    </div>

                    <div className="premium-glass p-10 rounded-[48px] border-red-500/20 bg-red-500/5 relative overflow-hidden group">
                        <Smartphone className="absolute -right-4 -bottom-4 text-red-500 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000" size={200} />
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white">
                                    <Smartphone size={20} />
                                </div>
                                <h4 className="text-white font-black italic">Visual Mobile</h4>
                            </div>
                            <div className="space-y-4">
                                <div className="h-2 bg-white/10 rounded-full w-3/4" />
                                <div className="h-2 bg-white/5 rounded-full w-1/2" />
                                <div className="h-32 bg-white/5 rounded-2xl border border-white/5" />
                                <div className="flex gap-2">
                                    <div className="w-12 h-12 rounded-xl bg-white/10" />
                                    <div className="w-12 h-12 rounded-xl bg-white/10" />
                                    <div className="w-12 h-12 rounded-xl bg-white/10" />
                                </div>
                            </div>
                            <p className="text-[11px] text-red-400 font-black uppercase tracking-widest mt-4">Padrão Otimizado PWA</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
