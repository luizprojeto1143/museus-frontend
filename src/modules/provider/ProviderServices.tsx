import React, { useEffect, useState, useCallback } from "react";
import { Briefcase, Loader2, Check, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { api } from "../../api/client";
import { toast } from "react-hot-toast";

const SERVICE_LABELS: Record<string, string> = {
    AUDIO_DESCRIPTION: "Audiodescrição",
    LIBRAS_INTERPRETATION: "Tradução/Interpretação de Libras",
    BRAILLE_PRINTING: "Impressão em Braille",
    TACTILE_REPRODUCTION: "Reprodução Tátil",
    SUBTITLING: "Legendagem para Surdos e Ensurdecidos (LSE)",
    CONSULTANCY: "Consultoria e Auditoria",
    TRAINING: "Treinamento e Capacitação",
    PHYSICAL_ACCESSIBILITY: "Projetos de Acessibilidade Física"
};

export const ProviderServices: React.FC = () => {
    const [provider, setProvider] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get("/providers/me");
            setProvider(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar dados");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const toggleService = async (service: string) => {
        const currentServices = provider.services || [];
        const newServices = currentServices.includes(service)
            ? currentServices.filter((s: string) => s !== service)
            : [...currentServices, service];

        try {
            setSaving(true);
            const res = await api.put(`/providers/${provider.id}`, { services: newServices });
            setProvider(res.data);
            toast.success("Serviços atualizados!");
        } catch (error) {
            toast.error("Erro ao salvar alteração");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-[60vh]">
            <Loader2 className="animate-spin text-[#9f7aea]" size={40} />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Meus Serviços</h1>
                <p className="text-[#b794f4] mt-2">Escolha as especialidades que você oferece para aparecer nas buscas dos produtores.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(SERVICE_LABELS).map(([value, label]) => {
                    const isSelected = provider?.services?.includes(value);
                    return (
                        <button
                            key={value}
                            onClick={() => toggleService(value)}
                            disabled={saving}
                            className={`p-6 rounded-2xl border transition-all text-left flex items-center justify-between group ${isSelected
                                    ? "bg-[#9f7aea]/20 border-[#9f7aea] shadow-lg shadow-[#9f7aea]/10"
                                    : "bg-[#1a0f2c] border-[#3b2164] hover:border-[#9f7aea]/50"
                                }`}
                        >
                            <div>
                                <h3 className={`font-bold transition-colors ${isSelected ? "text-white" : "text-[#b794f4]"}`}>{label}</h3>
                                <p className="text-xs text-[#718096] mt-1">Clique para {isSelected ? "remover" : "adicionar"}</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${isSelected ? "bg-[#9f7aea] border-[#9f7aea] text-white" : "border-[#3b2164] text-transparent"
                                }`}>
                                <Check size={14} />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
