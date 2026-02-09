import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../api/client";
import { CheckCircle, MessageSquare, Mic, Ear, ShieldCheck, ArrowRight, PlayCircle, Star, Phone, Loader2 } from "lucide-react";
import { EmptyState, Button } from "../../components/ui";
import { useToast } from "../../contexts/ToastContext";

type Provider = {
    id: string;
    name: string;
    description: string;
    email: string;
    phone: string;
    services: string[];
    rating: number;
    completedJobs: number;
};

export const ProducerServices: React.FC = () => {
    const { addToast } = useToast();
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);

    const serviceLabels: Record<string, string> = {
        "LIBRAS_INTERPRETATION": "Libras",
        "AUDIO_DESCRIPTION": "Audiodescrição",
        "CAPTIONING": "Legendagem",
        "BRAILLE": "Braille",
        "TACTILE_MODEL": "Maquete Tátil",
        "EASY_READING": "Leitura Simples"
    };

    const serviceIcons: Record<string, React.ReactNode> = {
        "LIBRAS_INTERPRETATION": <Ear size={40} className="text-yellow-500" />,
        "AUDIO_DESCRIPTION": <Mic size={40} className="text-yellow-500" />,
        "CAPTIONING": <MessageSquare size={40} className="text-yellow-500" />,
        "BRAILLE": <ShieldCheck size={40} className="text-yellow-500" />,
        "TACTILE_MODEL": <PlayCircle size={40} className="text-yellow-500" />,
        "EASY_READING": <ArrowRight size={40} className="text-yellow-500" />
    };

    const fetchProviders = useCallback(() => {
        api.get("/providers")
            .then(res => setProviders(res.data))
            .catch(err => {
                console.error("Error fetching providers", err);
                addToast("Erro ao carregar prestadores.", "error");
            })
            .finally(() => setLoading(false));
    }, [addToast]);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    const handleWhatsApp = (provider: Provider) => {
        const message = `Olá ${provider.name}, vi seu perfil na plataforma Museus e gostaria de um orçamento para serviços de acessibilidade.`;
        const phone = provider.phone ? provider.phone.replace(/\D/g, "") : "";
        if (phone) {
            window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, "_blank");
        } else {
            addToast("Telefone não cadastrado para este prestador.", "info");
        }
    };

    return (
        <div className="producer-services py-12 px-4 max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                    Marketplace de Acessibilidade
                </h1>
                <p className="max-w-2xl mx-auto opacity-70 text-lg leading-relaxed">
                    Encontre prestadores homologados para tornar seu projeto acessível e cumprir as exigências legais.
                    Contrate direto pela plataforma através de canais seguros.
                </p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-yellow-500" size={48} />
                    <p className="opacity-50 font-medium">Carregando parceiros homologados...</p>
                </div>
            ) : providers.length === 0 ? (
                <EmptyState
                    title="Nenhum prestador disponível"
                    description="No momento não há prestadores cadastrados nesta categoria. Tente novamente mais tarde."
                    icon={ShieldCheck}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {providers.map(provider => (
                        <div key={provider.id} className="group relative bg-[#15151a] border border-white/5 rounded-[2rem] p-8 flex flex-col hover:border-yellow-500/30 transition-all hover:shadow-2xl hover:shadow-yellow-500/5">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-white group-hover:text-yellow-500 transition-colors uppercase tracking-tight">{provider.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                                            <Star size={14} fill="currentColor" />
                                            <span>{provider.rating?.toFixed(1) || "Novo"}</span>
                                        </div>
                                        <span className="text-xs text-slate-500 font-medium">• {provider.completedJobs} jobs concluídos</span>
                                    </div>
                                </div>
                                <div className="bg-yellow-500/10 p-4 rounded-2xl group-hover:bg-yellow-500/20 transition-colors">
                                    {serviceIcons[provider.services[0]] || <ShieldCheck size={32} className="text-yellow-500" />}
                                </div>
                            </div>

                            <p className="text-slate-400 text-sm leading-relaxed mb-8 line-clamp-3">
                                {provider.description || "Prestador especializado em acessibilidade cultural com ampla experiência em projetos públicos e privados."}
                            </p>

                            <div className="flex flex-wrap gap-1.5 mb-8">
                                {provider.services.map(s => (
                                    <span key={s} className="px-3 py-1 bg-white/5 text-xs font-bold text-slate-400 border border-white/10 rounded-full uppercase tracking-widest">
                                        {serviceLabels[s] || s}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-auto pt-6 border-t border-white/5">
                                <Button
                                    onClick={() => handleWhatsApp(provider)}
                                    className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white border-none rounded-2xl font-black text-sm uppercase tracking-wider"
                                    leftIcon={<Phone size={18} fill="currentColor" />}
                                >
                                    Contatar no WhatsApp
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
