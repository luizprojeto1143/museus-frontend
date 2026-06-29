import React, { useEffect, useState, useCallback } from "react";
import { logger } from "@/utils/logger";

import { useTranslation } from "react-i18next";
import { api } from "../../../../api/client";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Ear, 
  Volume2, 
  Type, 
  HandMetal, 
  BookOpen, 
  Eye,
  History,
  ShieldCheck,
  User,
  ExternalLink,
  ChevronRight,
  Accessibility
} from "lucide-react";
import { 
  Card, 
  Badge, 
  AnimateIn,
  Button 
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";

type TimelineItem = {
    id: string;
    date: string;
    type: string;
    status: string;
    requestedAt: string;
    requestedBy?: string;
    approvedAt?: string;
    approvedBy?: string;
    executedAt?: string;
    provider?: string;
    project?: string;
    delayDays?: number;
};

const serviceTypeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    LIBRAS_INTERPRETATION: { label: "Interpretação Libras", icon: <HandMetal size={18} />, color: "text-blue-400" },
    AUDIO_DESCRIPTION: { label: "Audiodescrição", icon: <Volume2 size={18} />, color: "text-purple-400" },
    CAPTIONING: { label: "Legendagem", icon: <Type size={18} />, color: "text-indigo-400" },
    BRAILLE: { label: "Braille", icon: <Accessibility size={18} />, color: "text-amber-400" },
    TACTILE_MODEL: { label: "Maquete Tátil", icon: <Eye size={18} />, color: "text-emerald-400" },
    EASY_READING: { label: "Leitura Fácil", icon: <BookOpen size={18} />, color: "text-rose-400" }
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: { label: "Pendente", color: "text-amber-400 bg-amber-400/10 border-amber-400/20", icon: <Clock size={12} /> },
    IN_PROGRESS: { label: "Executando", color: "text-gold-400 bg-gold-400/10 border-gold-400/20", icon: <ActivityIcon /> },
    COMPLETED: { label: "Concluído", color: "text-green-400 bg-green-400/10 border-green-400/20", icon: <CheckCircle2 size={12} /> },
    CANCELLED: { label: "Cancelado", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: <XCircle size={12} /> }
};

function ActivityIcon() {
    return <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}><AlertCircle size={12} /></motion.div>;
}

const AccessibilityTimeline: React.FC = () => {
    const { t } = useTranslation();
    const [timeline, setTimeline] = useState<TimelineItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTimeline = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get("/secretary/accessibility-timeline");
            setTimeline(response.data);
        } catch (err) {
            logger.error("Erro ao carregar linha do tempo", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTimeline();
    }, [fetchTimeline]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">Auditando Histórico...</p>
            </div>
        );
    }

    return (
        <AnimateIn className="space-y-8 pb-32 max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                        <History className="text-gold-400" size={32} />
                        Audit Trail: <span className="text-gold-400">Inclusão</span>
                    </h1>
                    <p className="text-slate-400 font-medium">Histórico institucional de ações e políticas públicas de acessibilidade.</p>
                </div>

                <Badge variant="glass" className="h-10 px-4 rounded-xl border-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    <ShieldCheck className="mr-2 text-gold-400" size={14} />
                    Blindagem Institucional
                </Badge>
            </div>

            {timeline.length === 0 ? (
                <Card className="p-20 text-center bg-white/[0.02] border-white/5 rounded-[40px]">
                    <Accessibility className="mx-auto text-slate-800 mb-6" size={64} />
                    <h3 className="text-xl font-bold text-white">Nenhum Registro</h3>
                    <p className="text-slate-500 mt-2 max-w-xs mx-auto text-sm italic">O histórico institucional está vazio no momento.</p>
                </Card>
            ) : (
                <div className="relative pl-8 md:pl-12">
                    {/* Main Track */}
                    <div className="absolute left-0 top-4 bottom-0 w-px bg-gradient-to-b from-gold-400/50 via-white/5 to-transparent ml-4 md:ml-6" />

                    <div className="space-y-12">
                        {timeline.map((item, idx) => {
                            const service = serviceTypeConfig[item.type] || { label: item.type, icon: <Accessibility size={18} />, color: "text-slate-400" };
                            const status = statusConfig[item.status] || { label: item.status, color: "text-slate-500 bg-white/5 border-white/10", icon: <Clock size={12} /> };

                            return (
                                <motion.div 
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="relative"
                                >
                                    {/* Timeline Dot */}
                                    <div className={`absolute -left-8 md:-left-12 top-2 w-8 h-8 md:w-12 md:h-12 rounded-full border-4 border-slate-950 flex items-center justify-center z-10 transition-transform hover:scale-110 shadow-[0_0_20px_rgba(212,175,55,0.2)] ${item.status === 'COMPLETED' ? 'bg-gold-400 text-slate-950' : 'bg-slate-900 text-gold-400'}`}>
                                        <div className="hidden md:block">{service.icon}</div>
                                        <div className="md:hidden w-2 h-2 rounded-full bg-current" />
                                    </div>

                                    {/* Event Card */}
                                    <Card className="p-8 bg-white/[0.02] border-white/5 rounded-[32px] group hover:bg-white/[0.04] transition-all overflow-hidden relative">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                                            <div className="space-y-4 flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${service.color}`}>
                                                            {service.icon}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-bold text-white leading-tight">{service.label}</h3>
                                                            {item.project && (
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{item.project}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Badge className={`h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest border shrink-0 ${status.color}`}>
                                                        <span className="mr-1.5">{status.icon}</span>
                                                        {status.label}
                                                    </Badge>
                                                </div>

                                                {/* Details Grid */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Solicitação</p>
                                                        <p className="text-xs font-bold text-slate-400">{new Date(item.requestedAt).toLocaleDateString("pt-BR")}</p>
                                                        {item.requestedBy && <p className="text-[10px] text-slate-500 italic flex items-center gap-1"><User size={10} /> {item.requestedBy}</p>}
                                                    </div>

                                                    {item.approvedAt && (
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Aprovação</p>
                                                            <p className="text-xs font-bold text-slate-400">{new Date(item.approvedAt).toLocaleDateString("pt-BR")}</p>
                                                            {item.approvedBy && <p className="text-[10px] text-slate-500 italic flex items-center gap-1"><User size={10} /> {item.approvedBy}</p>}
                                                        </div>
                                                    )}

                                                    {item.executedAt && (
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Execução</p>
                                                            <p className="text-xs font-bold text-green-400">{new Date(item.executedAt).toLocaleDateString("pt-BR")}</p>
                                                            {item.provider && <p className="text-[10px] text-slate-500 italic flex items-center gap-1"><ExternalLink size={10} /> {item.provider}</p>}
                                                        </div>
                                                    )}

                                                    {item.delayDays !== undefined && (
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Lead Time</p>
                                                            <p className={`text-xs font-black ${item.delayDays > 30 ? 'text-red-400' : item.delayDays > 14 ? 'text-amber-400' : 'text-gold-400'}`}>
                                                                {item.delayDays} DIAS
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <Button variant="glass" className="rounded-xl h-12 w-12 p-0 border-white/5 opacity-0 group-hover:opacity-100 transition-all">
                                                <ChevronRight size={20} className="text-slate-600" />
                                            </Button>
                                        </div>

                                        {/* Background Glow */}
                                        <div className="absolute -right-20 -top-20 w-40 h-40 bg-gold-400/5 rounded-full blur-3xl pointer-events-none group-hover:bg-gold-400/10 transition-all" />
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}
        </AnimateIn>
    );
};

export default AccessibilityTimeline;
