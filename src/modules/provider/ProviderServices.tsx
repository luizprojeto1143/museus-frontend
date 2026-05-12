import { useTranslation } from "react-i18next";
import React, { useEffect, useState, useCallback } from "react";
import { 
    Briefcase, 
    Loader2, 
    Check, 
    Plus, 
    Trash2, 
    Zap, 
    ShieldCheck, 
    Eye, 
    Volume2, 
    HandMetal, 
    Accessibility, 
    BookOpen, 
    Search,
    Ear,
    Activity
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { api } from "../../api/client";
import { toast } from "react-hot-toast";
import { 
    Card, 
    Badge, 
    AnimateIn, 
    Button 
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";

const SERVICE_CONFIG: Record<string, { label: string; icon: React.ReactNode; desc: string; color: string }> = {
    AUDIO_DESCRIPTION: { 
        label: "Audiodescrição", 
        icon: <Volume2 size={24} />, 
        desc: "Narrativas detalhadas para pessoas com deficiência visual.",
        color: "text-purple-400 bg-purple-400/10"
    },
    LIBRAS_INTERPRETATION: { 
        label: "Interpretação de Libras", 
        icon: <HandMetal size={24} />, 
        desc: "Tradução simultânea para Língua Brasileira de Sinais.",
        color: "text-blue-400 bg-blue-400/10"
    },
    BRAILLE_PRINTING: { 
        label: "Impressão em Braille", 
        icon: <Accessibility size={24} />, 
        desc: "Produção de materiais táteis e sinalização Braille.",
        color: "text-amber-400 bg-amber-400/10"
    },
    TACTILE_REPRODUCTION: { 
        label: "Reprodução Tátil", 
        icon: <Eye size={24} />, 
        desc: "Maquetes e réplicas táteis para exploração sensorial.",
        color: "text-emerald-400 bg-emerald-400/10"
    },
    SUBTITLING: { 
        label: "Legendagem (LSE)", 
        icon: <Ear size={24} />, 
        desc: "Legendagem descritiva para surdos e ensurdecidos.",
        color: "text-indigo-400 bg-indigo-400/10"
    },
    CONSULTANCY: { 
        label: "Consultoria e Auditoria", 
        icon: <ShieldCheck size={24} />, 
        desc: "Avaliação técnica de conformidade e acessibilidade.",
        color: "text-rose-400 bg-rose-400/10"
    },
    TRAINING: { 
        label: "Treinamento de Equipes", 
        icon: <BookOpen size={24} />, 
        desc: "Capacitação em atendimento inclusivo e diversidade.",
        color: "text-cyan-400 bg-cyan-400/10"
    },
    PHYSICAL_ACCESSIBILITY: { 
        label: "Acessibilidade Física", 
        icon: <Zap size={24} />, 
        desc: "Projetos de adaptação de espaços e fluxos.",
        color: "text-orange-400 bg-orange-400/10"
    }
};

export const ProviderServices: React.FC = () => {
    const { t } = useTranslation();
    const [provider, setProvider] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/providers/me");
            setProvider(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar catálogo de serviços.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const toggleService = async (service: string) => {
        const currentServices = provider.services || [];
        const isRemoving = currentServices.includes(service);
        const newServices = isRemoving
            ? currentServices.filter((s: string) => s !== service)
            : [...currentServices, service];

        try {
            setSaving(true);
            const res = await api.put(`/providers/${provider.id}`, { services: newServices });
            setProvider(res.data);
            toast.success(isRemoving ? "Serviço removido." : "Serviço ativado no seu perfil!");
        } catch (error) {
            toast.error("Erro ao atualizar portfólio de serviços.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">Indexando Especialidades...</p>
        </div>
    );

    return (
        <AnimateIn className="space-y-10 pb-32 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                        Meus <span className="text-indigo-500">Serviços</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg max-w-lg leading-relaxed">
                        Defina quais especialidades estratégicas compõem seu catálogo para ser encontrado por produtores.
                    </p>
                </div>
                <Badge variant="glass" className="h-10 px-4 rounded-xl border-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    <Activity size={14} className="mr-2 text-indigo-500" />
                    Catálogo Ativo
                </Badge>
            </div>

            {/* Service Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(SERVICE_CONFIG).map(([value, config]) => {
                    const isSelected = provider?.services?.includes(value);
                    return (
                        <motion.div
                            key={value}
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Card
                                onClick={() => !saving && toggleService(value)}
                                className={`h-full p-8 rounded-[32px] border transition-all cursor-pointer relative overflow-hidden group ${
                                    isSelected 
                                    ? "bg-indigo-600/10 border-indigo-500/50 shadow-2xl shadow-indigo-600/10" 
                                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                                }`}
                            >
                                <div className="flex flex-col h-full space-y-6 relative z-10">
                                    <div className="flex justify-between items-start">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${config.color}`}>
                                            {config.icon}
                                        </div>
                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                                            isSelected 
                                            ? "bg-indigo-600 border-indigo-600 text-white shadow-lg" 
                                            : "border-white/10 text-transparent"
                                        }`}>
                                            <Check size={16} />
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className={`text-xl font-black tracking-tight mb-2 transition-colors ${isSelected ? "text-white" : "text-slate-300"}`}>
                                            {config.label}
                                        </h3>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                            {config.desc}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-white/5">
                                        <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isSelected ? 'text-indigo-400' : 'text-slate-600'}`}>
                                            {isSelected ? 'Serviço Ativado' : 'Clique para Ativar'}
                                        </span>
                                    </div>
                                </div>

                                {/* Background Glow */}
                                {isSelected && (
                                    <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                                )}
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Info Footer */}
            <Card className="p-10 bg-gradient-to-r from-indigo-600/5 to-transparent border-indigo-500/10 rounded-[40px] flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center text-indigo-500 shrink-0 border border-indigo-500/20">
                    <Search size={40} />
                </div>
                <div className="space-y-2 text-center md:text-left">
                    <h3 className="text-xl font-black text-white">Como você aparece nas buscas?</h3>
                    <p className="text-slate-500 text-sm max-w-2xl font-medium leading-relaxed">
                        Nossa IA prioriza prestadores que possuem especialidades bem definidas e descrições ricas no perfil. Ative apenas os serviços que você realmente domina para manter sua reputação de excelência.
                    </p>
                </div>
                <div className="shrink-0">
                    <Button variant="glass" className="h-12 px-6 rounded-xl border-white/5 text-indigo-400 font-black text-[10px] uppercase tracking-widest">
                        Preview da Busca
                    </Button>
                </div>
            </Card>
        </AnimateIn>
    );
};
