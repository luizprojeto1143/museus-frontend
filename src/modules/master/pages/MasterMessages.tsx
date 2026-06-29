import { useTranslation } from "react-i18next";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
    Mail, 
    CheckCircle, 
    Archive, 
    AlertCircle, 
    RefreshCw, 
    User, 
    Clock, 
    Tag, 
    ArrowUpRight, 
    Search, 
    X, 
    Send,
    Inbox,
    ShieldCheck,
    Briefcase,
    Zap,
    Layers,
    MessageSquare,
    Signal,
    Radio,
    Terminal,
    Fingerprint,
    SearchCheck,
    FileText,
    Share2,
    CheckCircle2,
    ShieldAlert
} from "lucide-react";
import { api } from "../../../api/client";
import { 
    Button, 
    Card, 
    Badge, 
    AnimateIn,
    AnimatedCounter
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface Message {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: "NEW" | "READ" | "ARCHIVED" | "REPLIED";
    createdAt: string;
}

export const MasterMessages: React.FC = () => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"ALL" | "NEW" | "ARCHIVED">("NEW");

    const fetchMessages = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/contact");
            setMessages(res.data || []);
        } catch (err: any) {
            toast.error("Erro ao sincronizar terminal de mensagens.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/contact/${id}`, { status: newStatus });
            setMessages(prev => prev.map(m => m.id === id ? { ...m, status: newStatus as any } : m));
            toast.success(`Protocolo: Mensagem ${newStatus === 'ARCHIVED' ? 'arquivada' : 'processada'}.`);
        } catch (err: any) {
            toast.error("Falha no protocolo de atualização de status.");
        }
    };

    const filteredMessages = useMemo(() => {
        return messages.filter(m => {
            if (filter === "ALL") return true;
            if (filter === "NEW") return m.status === "NEW" || m.status === "READ";
            if (filter === "ARCHIVED") return m.status === "ARCHIVED";
            return true;
        });
    }, [messages, filter]);

    const newMessagesCount = useMemo(() => messages.filter(m => m.status === "NEW").length, [messages]);

    if (loading && messages.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-[0.3em] text-[10px] italic">Sincronizando Inbox Terminal...</p>
        </div>
    );

    return (
        <AnimateIn className="space-y-12 pb-32">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-blue-600/10 text-blue-400 border-none px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.4em] italic">
                            Inbound Sovereignty & Institutional Intelligence
                        </Badge>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic leading-none">
                        Caixa de <span className="text-blue-600">Entrada</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-xl max-w-3xl leading-relaxed">
                        Gerenciamento clínico de solicitações, parcerias institucionais e novos leads provenientes do ecossistema público global.
                    </p>
                </div>
                
                <Card className="p-10 bg-blue-600/5 border-2 border-blue-500/20 rounded-[48px] flex items-center gap-10 group min-w-[320px] shadow-2xl relative overflow-hidden border-t-white/10">
                    <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-all duration-500 shadow-xl border border-blue-500/20">
                        <Signal size={36} className="animate-pulse" />
                    </div>
                    <div className="space-y-1 relative z-10">
                        <p className="text-[11px] font-black text-blue-400/50 uppercase tracking-[0.3em] italic leading-none mb-1">Novas Transmissões</p>
                        <p className="text-5xl font-black text-white tracking-tighter italic leading-none">
                            <AnimatedCounter value={newMessagesCount} />
                        </p>
                    </div>
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-600/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-blue-600/10 transition-all" />
                </Card>
            </div>

            {/* Inbound Operations Filters */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-10 bg-[#0b1120]/60 p-5 rounded-[40px] border-2 border-white/5 shadow-2xl backdrop-blur-xl border-t-white/10">
                <div className="flex flex-wrap items-center gap-4">
                    {[
                        { id: 'NEW', label: 'Nodes Ativos', count: messages.filter(m => m.status === 'NEW' || m.status === 'READ').length },
                        { id: 'ARCHIVED', label: 'Logs Arquivados', count: messages.filter(m => m.status === 'ARCHIVED').length },
                        { id: 'ALL', label: 'Manifesto Global', count: messages.length }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id as any)}
                            className={`px-10 py-5 rounded-[22px] text-[10px] font-black uppercase tracking-[0.2em] italic transition-all duration-500 shadow-lg flex items-center gap-4 ${filter === f.id ? 'bg-blue-600 text-white shadow-blue-600/20' : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white border border-white/5'}`}
                        >
                            {f.label} <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black ${filter === f.id ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-600'}`}>{f.count}</span>
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-6 pr-6">
                    <Button onClick={fetchMessages} variant="glass" className="h-14 px-8 rounded-2xl border-white/10 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all">
                        <RefreshCw size={18} className={`mr-3 ${loading ? 'animate-spin' : ''}`} /> Sincronizar Inbox
                    </Button>
                    <Badge variant="glass" className="bg-emerald-500/10 text-emerald-500 border-none px-6 py-3 text-[9px] font-black uppercase tracking-[0.3em] italic rounded-xl flex items-center gap-3">
                        <Radio size={14} className="animate-pulse" /> Signal: Optimal
                    </Badge>
                </div>
            </div>

            {/* Message Feed - Intelligence Streams */}
            <div className="space-y-10">
                <AnimatePresence mode="popLayout">
                    {filteredMessages.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-48 text-center opacity-30 flex flex-col items-center gap-12 shadow-inner rounded-[64px] bg-white/[0.01] border-2 border-dashed border-white/5"
                        >
                            <div className="w-24 h-24 rounded-[40px] bg-white/5 flex items-center justify-center border-2 border-white/5">
                                <SearchCheck size={64} className="text-slate-700" />
                            </div>
                            <div className="space-y-4">
                                <p className="text-2xl font-black uppercase tracking-[0.4em] text-slate-500 italic leading-none">Frequência Limpa</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-700 italic">Nenhuma transmissão pendente de triagem neste protocolo.</p>
                            </div>
                        </motion.div>
                    ) : (
                        filteredMessages.map((msg, idx) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95, x: 20 }}
                                transition={{ delay: idx * 0.05, ease: "circOut" }}
                            >
                                <Card className={`group/msg bg-[#0b1120]/60 border-2 rounded-[56px] p-14 flex flex-col gap-10 hover:bg-white/[0.04] transition-all duration-700 relative overflow-hidden shadow-2xl border-t-white/10 ${msg.status === 'NEW' ? 'border-blue-500/30 ring-2 ring-blue-500/5' : 'border-white/5'}`}>
                                    {/* Intelligence Identity Header */}
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
                                        <div className="space-y-6 flex-1">
                                            <div className="flex items-center gap-4">
                                                {msg.status === 'NEW' && (
                                                    <Badge className="bg-blue-600 text-white border-none px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.3em] italic rounded-lg shadow-lg animate-pulse">
                                                        Incoming_Signal
                                                    </Badge>
                                                )}
                                                <Badge variant="glass" className="bg-white/5 border-none text-slate-500 text-[8px] font-black uppercase tracking-widest italic px-3 py-1.5">
                                                    UUID: {msg.id.toUpperCase()}
                                                </Badge>
                                            </div>
                                            <h3 className="text-3xl font-black text-white italic tracking-tighter leading-none group-hover/msg:text-blue-400 transition-colors uppercase">{msg.subject}</h3>
                                            
                                            <div className="flex flex-wrap items-center gap-10 pt-4">
                                                <div className="flex items-center gap-4 group/info">
                                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-blue-500/40 border border-white/5 group-hover/info:border-blue-500/30 transition-all">
                                                        <User size={20} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-white font-black text-lg tracking-tighter italic leading-none">{msg.name}</span>
                                                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic mt-1">{msg.email}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 group/info">
                                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-blue-500/40 border border-white/5 group-hover/info:border-blue-500/30 transition-all">
                                                        <Clock size={20} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-white font-black text-lg tracking-tighter italic leading-none">{new Date(msg.createdAt).toLocaleTimeString('pt-BR')}</span>
                                                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic mt-1">{new Date(msg.createdAt).toLocaleDateString('pt-BR')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 items-center">
                                            {msg.status !== "ARCHIVED" && (
                                                <button
                                                    onClick={() => updateStatus(msg.id, "ARCHIVED")}
                                                    className="w-16 h-16 rounded-[22px] bg-white/5 text-rose-500/30 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center border-2 border-white/5 shadow-2xl group/btn"
                                                    title="Mover p/ Arquivo Morto"
                                                >
                                                    <Archive size={24} className="group-hover/btn:scale-110" />
                                                </button>
                                            )}
                                            {msg.status === "NEW" && (
                                                <button
                                                    onClick={() => updateStatus(msg.id, "READ")}
                                                    className="w-16 h-16 rounded-[22px] bg-white/5 text-blue-400/50 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center border-2 border-white/5 shadow-2xl group/btn"
                                                    title="Validar Transmissão"
                                                >
                                                    <CheckCircle2 size={24} className="group-hover/btn:scale-110" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Area - Clinical Grimoire Aesthetic */}
                                    <div className="p-12 bg-[#020617] rounded-[48px] border-2 border-white/5 relative group-hover/msg:border-blue-500/20 transition-all duration-1000 shadow-inner group/content">
                                        <div className="absolute top-10 left-10 text-blue-600/5 group-hover/content:text-blue-600/10 transition-colors">
                                            <FileText size={80} />
                                        </div>
                                        <div className="relative z-10 pl-20 border-l-4 border-blue-600/20">
                                            <p className="text-slate-400 text-lg font-medium leading-relaxed italic group-hover/msg:text-slate-300 transition-colors">
                                                "{msg.message}"
                                            </p>
                                        </div>
                                        <div className="absolute top-8 right-10 opacity-10">
                                            <Terminal size={24} className="text-blue-500" />
                                        </div>
                                    </div>

                                    {/* Strategic Response Footer */}
                                    <div className="flex flex-col md:flex-row justify-between items-center pt-6 gap-8 relative z-10">
                                        <div className="flex items-center gap-6">
                                            <Badge variant="glass" className="bg-blue-600/5 border-none text-slate-700 text-[9px] font-black uppercase tracking-[0.3em] italic flex items-center gap-3">
                                                <Fingerprint size={14} /> LEAD_INTEGRITY_INDEX: OPTIMAL
                                            </Badge>
                                        </div>
                                        <div className="flex gap-4 w-full md:w-auto">
                                            <Button variant="glass" className="h-16 flex-1 md:flex-none px-10 rounded-2xl border-white/10 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white group/share">
                                                <Share2 size={18} className="mr-3 group-hover/share:rotate-12 transition-transform" /> Propagar Lead
                                            </Button>
                                            <a
                                                href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                                                className="h-16 flex-[1.5] md:flex-none px-12 rounded-2xl bg-blue-600 text-white font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-blue-600/30 hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center gap-4 group/reply"
                                            >
                                                Iniciar Resposta Tática <Send size={20} className="group-reply:translate-x-1 group-reply:-translate-y-1 transition-transform" />
                                            </a>
                                        </div>
                                    </div>

                                    {/* Signal Background Decor */}
                                    <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none group-hover/msg:opacity-100 opacity-20 transition-opacity duration-1000" />
                                </Card>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Support Governance SOC Footer */}
            <div className="bg-[#0f172a]/80 p-14 rounded-[64px] border-2 border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group shadow-2xl border-t-white/10">
                <div className="flex items-center gap-10 relative z-10">
                    <div className="w-24 h-24 bg-blue-600/10 rounded-[32px] flex items-center justify-center text-blue-500 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 border border-blue-500/20 shadow-2xl relative overflow-hidden">
                        <ShieldCheck size={48} />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent" />
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-white font-black text-3xl italic tracking-tighter uppercase italic leading-none">Soberania de Relacionamento Master</h4>
                        <p className="text-sm text-slate-500 font-medium max-w-2xl leading-relaxed italic mt-2">
                            O terminal de mensagens centraliza a demanda global de novos parceiros e solicitações institucionais de alto nível. Cada transmissão é tratada como um node de inteligência no ecossistema MSV.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-6 relative z-10">
                    <Badge variant="glass" className="bg-blue-500/10 text-blue-400 border-none px-12 py-6 text-[12px] font-black uppercase tracking-[0.4em] italic rounded-[24px] flex items-center gap-4 shadow-2xl border border-blue-500/20">
                        <ShieldAlert size={24} /> Communication: Secured
                    </Badge>
                </div>
                <div className="absolute top-[-50%] right-[-10%] w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[200px] pointer-events-none" />
                <div className="absolute left-[-5%] bottom-[-10%] w-[300px] h-[300px] bg-amber-600/5 rounded-full blur-[120px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </AnimateIn>
    );
};
