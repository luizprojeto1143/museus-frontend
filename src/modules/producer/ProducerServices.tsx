import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { CheckCircle, MessageSquare, Mic, Ear, ShieldCheck, ArrowRight, PlayCircle, Star, Phone, Loader2 } from "lucide-react";
import { EmptyState, Button } from "../../components/ui";
import { useToast } from "../../contexts/ToastContext";
import { inboxService } from "../../services/inboxService";

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
    const navigate = useNavigate();
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
        "LIBRAS_INTERPRETATION": <Ear size={40} className="text-[#D4AF37]" />,
        "AUDIO_DESCRIPTION": <Mic size={40} className="text-[#D4AF37]" />,
        "CAPTIONING": <MessageSquare size={40} className="text-[#D4AF37]" />,
        "BRAILLE": <ShieldCheck size={40} className="text-[#D4AF37]" />,
        "TACTILE_MODEL": <PlayCircle size={40} className="text-[#D4AF37]" />,
        "EASY_READING": <ArrowRight size={40} className="text-[#D4AF37]" />
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

    const handleRequestQuote = async (provider: Provider) => {
        try {
            const initialMessage = `Olá ${provider.name}, gostaria de solicitar um orçamento para serviços de acessibilidade.`;
            // 1. Create Conversation
            await inboxService.createConversation(provider.id, initialMessage);
            // 2. Notify User
            addToast("Negociação iniciada! Você será redirecionado para o Inbox.", "success");
            // 3. Redirect to Inbox
            setTimeout(() => {
                navigate("/producer/inbox");
            }, 1000);
        } catch (error) {
            console.error("Error creating conversation", error);
            addToast("Erro ao iniciar negociação via plataforma.", "error");
        }
    };

    return (
        <div className="producer-services py-12 px-4 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="text-center mb-16 space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-[#EAE0D5] font-serif">
                    Marketplace de <span className="text-[#D4AF37]">Acessibilidade</span>
                </h1>
                <p className="max-w-2xl mx-auto text-[#B0A090] text-lg leading-relaxed">
                    Encontre prestadores homologados para tornar seu projeto acessível e cumprir as exigências legais.
                    Contrate direto pela plataforma através de canais seguros.
                </p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
                    <p className="text-[#B0A090] font-medium">Carregando parceiros homologados...</p>
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
                        <div key={provider.id} className="group relative bg-[#2c1e10] border border-[#463420] rounded-[2rem] p-8 flex flex-col hover:border-[#D4AF37]/50 transition-all hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-[#EAE0D5] group-hover:text-[#D4AF37] transition-colors">{provider.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 text-[#D4AF37] text-sm font-bold">
                                            <Star size={14} fill="currentColor" />
                                            <span>{provider.rating?.toFixed(1) || "Novo"}</span>
                                        </div>
                                        <span className="text-xs text-[#B0A090] font-medium">• {provider.completedJobs} jobs concluídos</span>
                                    </div>
                                </div>
                                <div className="bg-[#D4AF37]/10 p-4 rounded-2xl group-hover:bg-[#D4AF37]/20 transition-colors">
                                    {serviceIcons[provider.services[0]] || <ShieldCheck size={32} className="text-[#D4AF37]" />}
                                </div>
                            </div>

                            <p className="text-[#B0A090] text-sm leading-relaxed mb-8 line-clamp-3">
                                {provider.description || "Prestador especializado em acessibilidade cultural com ampla experiência em projetos públicos e privados."}
                            </p>

                            <div className="flex flex-wrap gap-1.5 mb-8">
                                {provider.services.map(s => (
                                    <span key={s} className="px-3 py-1 bg-black/20 text-xs font-bold text-[#EAE0D5] border border-[#463420] rounded-full uppercase tracking-widest">
                                        {serviceLabels[s] || s}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-auto pt-6 border-t border-[#463420] flex flex-col gap-3">
                                <Button
                                    onClick={() => handleRequestQuote(provider)}
                                    className="w-full py-4 bg-[#D4AF37] hover:bg-[#c5a028] text-[#1a1108] border-none rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-[#D4AF37]/20"
                                    leftIcon={<MessageSquare size={18} fill="currentColor" />}
                                >
                                    Solicitar Orçamento
                                </Button>
                                <Button
                                    onClick={() => handleWhatsApp(provider)}
                                    variant="ghost"
                                    className="w-full py-2 text-[#25D366] hover:bg-[#25D366]/10 text-xs uppercase tracking-wider"
                                    leftIcon={<Phone size={14} />}
                                >
                                    WhatsApp (Externo)
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
