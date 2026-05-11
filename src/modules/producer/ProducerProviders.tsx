import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../api/client";
import { 
    Users, Search, Filter, Mail, Phone, Star, 
    CheckCircle2, AlertCircle, MessageSquare, 
    ChevronRight, Briefcase, Info, X
} from "lucide-react";
import { Button, Input, Badge } from "../../components/ui";
import { useToast } from "../../contexts/ToastContext";

interface Provider {
    id: string;
    name: string;
    description: string;
    email: string;
    phone: string;
    services: string[];
    rating: number;
    active: boolean;
    _count: {
        executions: number;
    };
}

export const ProducerProviders: React.FC = () => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedService, setSelectedService] = useState<string>("");
    
    // Quote Modal
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [quoteMessage, setQuoteMessage] = useState("");
    const [sendingQuote, setSendingQuote] = useState(false);

    const SERVICE_LABELS: Record<string, string> = {
        LIBRAS: "Intérprete de Libras",
        AUDIO_DESCRIPTION: "Audiodescrição",
        CAPTIONING: "Legendagem",
        BRAILLE: "Braille/Tátil",
        EASY_READ: "Leitura Fácil",
        OTHER: "Outros Serviços Culturais"
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        setLoading(true);
        try {
            const res = await api.get("/providers", { params: { active: true } });
            setProviders(res.data);
        } catch (err) {
            addToast("Erro ao carregar prestadores.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSendQuote = async () => {
        if (!selectedProvider || !quoteMessage) return;
        setSendingQuote(true);
        try {
            await api.post(`/providers/${selectedProvider.id}/quote`, { message: quoteMessage });
            addToast("Solicitação de orçamento enviada com sucesso!", "success");
            setSelectedProvider(null);
            setQuoteMessage("");
        } catch (err) {
            addToast("Erro ao enviar solicitação.", "error");
        } finally {
            setSendingQuote(false);
        }
    };

    const filteredProviders = providers.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             p.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesService = selectedService ? p.services.includes(selectedService) : true;
        return matchesSearch && matchesService;
    });

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)]"></div>
        </div>
    );

    return (
        <div className="p-6 md:p-10 bg-[#1a1108] min-h-screen text-[#EAE0D5] animate-in fade-in duration-500">
            
            {/* HEADER */}
            <div className="max-w-7xl mx-auto mb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-[#EAE0D5] font-serif mb-2">Marketplace de Prestadores</h1>
                        <p className="text-[#B0A090]">Encontre os melhores profissionais para tornar seu projeto acessível e inesquecível.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-[#2c1e10] p-4 rounded-3xl border border-[#463420] shadow-xl">
                        <div className="p-3 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] rounded-2xl">
                            <Briefcase size={24} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-[#B0A090] uppercase tracking-wider">Rede Credenciada</div>
                            <div className="text-xl font-bold text-[#EAE0D5]">{providers.length} Profissionais</div>
                        </div>
                    </div>
                </div>

                {/* FILTERS */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B0A090]" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar por nome ou especialidade..."
                            className="w-full bg-[#2c1e10] border-[#463420] rounded-2xl py-3 pl-12 pr-4 text-[#EAE0D5] focus:ring-2 focus:ring-[var(--accent-primary)]/50 transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                        <button 
                            onClick={() => setSelectedService("")}
                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${!selectedService ? 'bg-[var(--accent-primary)] text-black border-[var(--accent-primary)]' : 'bg-white/5 border-white/10 text-[#B0A090] hover:border-white/20'}`}
                        >
                            Todos
                        </button>
                        {Object.keys(SERVICE_LABELS).map(key => (
                            <button 
                                key={key}
                                onClick={() => setSelectedService(key)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${selectedService === key ? 'bg-[var(--accent-primary)] text-black border-[var(--accent-primary)]' : 'bg-white/5 border-white/10 text-[#B0A090] hover:border-white/20'}`}
                            >
                                {SERVICE_LABELS[key]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* PROVIDERS GRID */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProviders.map(provider => (
                    <div key={provider.id} className="group bg-[#2c1e10] border border-[#463420] rounded-[32px] p-6 hover:border-[var(--accent-primary)]/50 transition-all hover:shadow-2xl hover:shadow-[var(--accent-primary)]/5 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#463420] to-[#1a1108] rounded-2xl flex items-center justify-center text-[var(--accent-primary)] border border-white/5 group-hover:scale-110 transition-transform">
                                <Users size={32} />
                            </div>
                            <div className="flex items-center gap-1 bg-black/30 px-3 py-1 rounded-full border border-white/5">
                                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                <span className="text-xs font-bold text-[#EAE0D5]">{provider.rating || '5.0'}</span>
                            </div>
                        </div>

                        <div className="flex-1 mb-6">
                            <h3 className="text-xl font-bold text-[#EAE0D5] mb-2">{provider.name}</h3>
                            <p className="text-sm text-[#B0A090] line-clamp-3 mb-4 leading-relaxed italic">
                                "{provider.description || 'Este profissional ainda não adicionou uma descrição.'}"
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {provider.services.map(s => (
                                    <Badge key={s} variant="outline" className="bg-[var(--accent-primary)]/5 border-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-[10px] uppercase font-bold">
                                        {SERVICE_LABELS[s] || s}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-[#463420] flex items-center justify-between">
                            <div className="text-[10px] text-[#B0A090] uppercase tracking-widest font-bold">
                                {provider._count.executions} Trabalhos realizados
                            </div>
                            <Button 
                                size="sm" 
                                onClick={() => setSelectedProvider(provider)}
                                className="bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-black rounded-xl font-bold px-4"
                            >
                                Contratar
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* EMPTY STATE */}
            {filteredProviders.length === 0 && (
                <div className="max-w-7xl mx-auto text-center py-32 bg-[#2c1e10]/50 rounded-[40px] border border-dashed border-[#463420]">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-[#B0A090]">
                        <Search size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-[#EAE0D5]">Nenhum prestador encontrado</h3>
                    <p className="text-[#B0A090]">Tente ajustar os filtros ou buscar por outros termos.</p>
                </div>
            )}

            {/* QUOTE MODAL */}
            {selectedProvider && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#2c1e10] border border-[var(--accent-primary)]/40 rounded-[40px] max-w-lg w-full p-8 shadow-2xl relative">
                        <button 
                            onClick={() => setSelectedProvider(null)}
                            className="absolute right-6 top-6 p-2 hover:bg-white/5 rounded-full text-[#B0A090] transition-all"
                        >
                            <X size={24} />
                        </button>

                        <div className="mb-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-[var(--accent-primary)]/10 rounded-2xl flex items-center justify-center text-[var(--accent-primary)]">
                                    <MessageSquare size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-[#EAE0D5]">Solicitar Orçamento</h2>
                                    <p className="text-[#B0A090] text-sm">Fale com {selectedProvider.name}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-[var(--accent-primary)]/5 rounded-2xl border border-[var(--accent-primary)]/10 text-xs text-[#B0A090] leading-relaxed">
                                <Info size={14} className="inline mr-2 mb-0.5" />
                                Sua mensagem será enviada por e-mail para o prestador. Ele entrará em contato com você diretamente.
                            </div>
                        </div>

                        <div className="space-y-4">
                            <textarea 
                                className="w-full bg-black/30 border-[#463420] rounded-2xl p-4 text-[#EAE0D5] min-h-[150px] outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 transition-all"
                                placeholder="Olá! Gostaria de um orçamento para o projeto..."
                                value={quoteMessage}
                                onChange={(e) => setQuoteMessage(e.target.value)}
                            />
                            <div className="flex flex-col gap-3">
                                <Button 
                                    onClick={handleSendQuote}
                                    isLoading={sendingQuote}
                                    disabled={!quoteMessage}
                                    className="w-full h-14 bg-[var(--accent-primary)] text-black font-bold rounded-2xl"
                                >
                                    Enviar Solicitação
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    className="w-full text-[#B0A090]"
                                    onClick={() => setSelectedProvider(null)}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
