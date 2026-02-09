import React, { useEffect, useState } from "react";
import { api } from "../../../api/client";
import { Trash2, Plus, Search, CheckCircle, ShieldCheck, Star, Mail, Phone, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button, Input, Textarea, EmptyState } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";

type Provider = {
    id: string;
    name: string;
    description: string;
    email: string;
    phone: string;
    services: string[];
    active: boolean;
    rating: number;
    completedJobs: number;
    tenantId?: string;
};

export const MasterProviders: React.FC = () => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        email: "",
        phone: "",
        services: [] as string[],
        tenantId: ""
    });

    const serviceOptions = [
        "LIBRAS_INTERPRETATION",
        "AUDIO_DESCRIPTION",
        "CAPTIONING",
        "BRAILLE",
        "TACTILE_MODEL",
        "EASY_READING"
    ];

    const serviceLabels: Record<string, string> = {
        "LIBRAS_INTERPRETATION": "Libras",
        "AUDIO_DESCRIPTION": "Audiodescrição",
        "CAPTIONING": "Legendagem",
        "BRAILLE": "Braille",
        "TACTILE_MODEL": "Maquete Tátil",
        "EASY_READING": "Leitura Simples"
    };

    const fetchProviders = useCallback(() => {
        setLoading(true);
        api.get("/providers")
            .then(res => setProviders(res.data))
            .catch(err => {
                console.error("Error fetching providers", err);
                addToast("Erro ao carregar prestadores", "error");
            })
            .finally(() => setLoading(false));
    }, [addToast]);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/providers", formData);
            setModalOpen(false);
            setFormData({ name: "", description: "", email: "", phone: "", services: [], tenantId: "" });
            fetchProviders();
            addToast("Prestador cadastrado com sucesso!", "success");
        } catch (err) {
            console.error("Error creating provider", err);
            addToast("Erro ao cadastrar prestador", "error");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Tem certeza que deseja remover este prestador?")) return;
        try {
            await api.delete(`/providers/${id}`);
            setProviders(providers.filter(p => p.id !== id));
            addToast("Prestador removido com sucesso!", "success");
        } catch (err) {
            console.error("Error deleting provider", err);
            addToast("Erro ao remover prestador", "error");
        }
    };

    const handleToggleService = (service: string) => {
        setFormData(prev => {
            if (prev.services.includes(service)) {
                return { ...prev, services: prev.services.filter(s => s !== service) };
            } else {
                return { ...prev, services: [...prev.services, service] };
            }
        });
    };

    return (
        <div className="master-providers">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">🛠️ Prestadores de Acessibilidade</h1>
                    <p className="opacity-70 mt-1">Gerencie os parceiros homologados para serviços de acessibilidade</p>
                </div>
                <Button onClick={() => setModalOpen(true)} leftIcon={<Plus size={18} />} className="w-full md:w-auto">
                    Novo Prestador
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <p className="animate-pulse opacity-50">Carregando...</p>
                </div>
            ) : providers.length === 0 ? (
                <EmptyState
                    title="Nenhum prestador cadastrado"
                    description="Comece cadastrando um novo parceiro de acessibilidade."
                    icon={ShieldCheck}
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {providers.map(provider => (
                        <div key={provider.id} className="card relative group hover:ring-2 hover:ring-blue-500/50 transition-all bg-white/5 border-white/10 p-6 rounded-2xl">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white leading-tight">{provider.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex items-center gap-1 text-yellow-500 text-sm">
                                            <Star size={14} fill="currentColor" />
                                            <span>{provider.rating?.toFixed(1) || "Novo"}</span>
                                        </div>
                                        <span className="text-xs text-slate-400">• {provider.completedJobs} jobs</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {provider.active && <CheckCircle size={18} className="text-green-500" />}
                                    <button
                                        onClick={() => handleDelete(provider.id)}
                                        className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors"
                                        title="Remover"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-slate-400 mb-6">
                                <p className="flex items-center gap-2"><Mail size={14} /> {provider.email || "Sem email"}</p>
                                <p className="flex items-center gap-2"><Phone size={14} /> {provider.phone || "Sem telefone"}</p>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mb-6">
                                {provider.services.map(s => (
                                    <span key={s} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-[10px] uppercase font-bold tracking-wider">
                                        {serviceLabels[s] || s}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-auto border-t border-white/5 pt-4">
                                <p className="text-xs text-slate-500 line-clamp-2 italic">
                                    {provider.description || "Sem descrição informada."}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#0f172a] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold">Novo Prestador</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                            <Input label="Nome" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />

                            <Textarea
                                label="Descrição"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                placeholder="Breve resumo dos serviços..."
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                <Input label="Telefone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold flex items-center gap-2"><Info size={14} /> Serviços Oferecidos</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {serviceOptions.map(opt => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => handleToggleService(opt)}
                                            className={`
                                                flex items-center gap-2 p-3 text-left border rounded-xl transition-all
                                                ${formData.services.includes(opt) ? 'bg-blue-500/10 border-blue-500' : 'bg-white/5 border-white/10 hover:border-white/20'}
                                            `}
                                        >
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.services.includes(opt) ? 'bg-blue-500 border-blue-500' : 'border-white/20'}`}>
                                                {formData.services.includes(opt) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                            </div>
                                            <span className="text-xs">{serviceLabels[opt]}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 sticky bottom-0 bg-[#0f172a] border-t border-white/10">
                                <Button variant="outline" type="button" onClick={() => setModalOpen(false)} className="flex-1">Cancelar</Button>
                                <Button type="submit" className="flex-1">Salvar</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
