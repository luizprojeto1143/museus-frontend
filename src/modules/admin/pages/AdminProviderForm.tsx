import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { Input, Button } from "../../../components/ui";
import { ArrowLeft, Save, User, Phone, Mail, Star, CheckCircle, Briefcase, FileText, CheckCircle2 } from "lucide-react";
import "./AdminShared.css";


const ACCESSIBILITY_SERVICES = [
    { value: "LIBRAS_INTERPRETATION", label: "Interpretação em LIBRAS", icon: "🤟" },
    { value: "AUDIO_DESCRIPTION", label: "Audiodescrição", icon: "🎧" },
    { value: "CAPTIONING", label: "Legendagem", icon: "📝" },
    { value: "BRAILLE", label: "Material em Braille", icon: "⠿" },
    { value: "TACTILE_MODEL", label: "Maquete Tátil", icon: "🖐️" },
    { value: "EASY_READING", label: "Leitura Fácil", icon: "📖" }
];

export const AdminProviderForm: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const { addToast } = useToast();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        document: "",
        email: "",
        phone: "",
        services: [] as string[],
        rating: "",
        completedJobs: 0,
        active: true
    });

    useEffect(() => {
        if (id && tenantId) {
            setLoading(true);
            api.get(`/providers/${id}`)
                .then(res => {
                    const data = res.data;
                    setFormData({
                        name: data.name || "",
                        document: data.document || "",
                        email: data.email || "",
                        phone: data.phone || "",
                        services: data.services || [],
                        rating: data.rating?.toString() || "",
                        completedJobs: data.completedJobs || 0,
                        active: data.active ?? true
                    });
                })
                .catch(err => {
                    console.error(err);
                    addToast("Erro ao carregar prestador", "error");
                })
                .finally(() => setLoading(false));
        }
    }, [id, tenantId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!tenantId) {
            addToast("Erro de autenticação", "error");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...formData,
                tenantId,
                rating: formData.rating ? parseFloat(formData.rating) : null
            };

            if (isEdit) {
                await api.put(`/providers/${id}`, payload);
            } else {
                await api.post("/providers", payload);
            }
            addToast(isEdit ? "Prestador atualizado com sucesso!" : "Prestador cadastrado com sucesso!", "success");
            navigate("/admin/prestadores");
        } catch (error) {
            console.error("Erro ao salvar prestador:", error);
            addToast("Erro ao salvar prestador. Verifique os dados.", "error");
        } finally {
            setSaving(false);
        }
    };

    const toggleService = (service: string) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.includes(service)
                ? prev.services.filter(s => s !== service)
                : [...prev.services, service]
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[var(--bg-root)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-zinc-400 text-sm">Carregando prestador...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-24 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button
                    variant="ghost"
                    onClick={() => navigate("/admin/prestadores")}
                    className="w-10 h-10 p-0 rounded-full bg-zinc-900/40 border border-gold/20/5 hover:bg-zinc-900/40 border border-gold/20/10 text-zinc-400 hover:text-white flex items-center justify-center shrink-0 transition-colors"
                >
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        {isEdit ? "Editar Prestador" : "Novo Prestador"}
                    </h1>
                    <p className="text-zinc-400 text-sm font-medium mt-1">
                        Gerencie os dados e serviços deste prestador.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Informações Básicas */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <User size={20} className="text-gold" /> Informações do Prestador
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <Input
                                label="Nome Completo / Razão Social *"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Maria Silva ou Acessibilidade LTDA"
                                required
                                className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
                            />
                        </div>

                        <Input
                            label="CPF/CNPJ"
                            value={formData.document}
                            onChange={e => setFormData({ ...formData, document: e.target.value })}
                            placeholder="000.000.000-00 ou 00.000.000/0000-00"
                            leftIcon={<FileText size={16} />}
                            className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
                        />

                        <Input
                            label="E-mail"
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            placeholder="contato@exemplo.com"
                            leftIcon={<Mail size={16} />}
                            className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
                        />

                        <Input
                            label="Telefone"
                            type="tel"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="(31) 99999-9999"
                            leftIcon={<Phone size={16} />}
                            containerClassName="md:col-span-2"
                            className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
                        />
                    </div>
                </div>

                {/* Serviços */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-white mb-1">♿ Serviços Oferecidos</h2>
                        <p className="text-sm text-zinc-400">
                            Selecione todos os serviços de acessibilidade que este prestador oferece:
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {ACCESSIBILITY_SERVICES.map(service => {
                            const isSelected = formData.services.includes(service.value);
                            return (
                                <button
                                    key={service.value}
                                    type="button"
                                    onClick={() => toggleService(service.value)}
                                    className={`
                                        p-4 rounded-xl border transition-all flex items-center gap-3 text-left group
                                        ${isSelected
                                            ? "border-gold bg-gold/10 text-gold shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                                            : "border-white/10 bg-zinc-900/50 text-zinc-400 hover:border-white/20 hover:text-white"}
                                    `}
                                >
                                    <span className="text-2xl">{service.icon}</span>
                                    <span className="font-medium">
                                        {service.label}
                                    </span>
                                    {isSelected && (
                                        <CheckCircle2 size={18} className="ml-auto text-gold" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Avaliação e Histórico */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Briefcase size={20} className="text-gold" /> Avaliação e Histórico
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Avaliação (0-5)"
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            value={formData.rating}
                            onChange={e => setFormData({ ...formData, rating: e.target.value })}
                            placeholder="4.5"
                            leftIcon={<Star size={16} />}
                            className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
                        />

                        <Input
                            label="Trabalhos Concluídos"
                            type="number"
                            min="0"
                            value={formData.completedJobs}
                            onChange={e => setFormData({ ...formData, completedJobs: parseInt(e.target.value) || 0 })}
                            className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
                        />
                    </div>

                    <div className="p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`
                                w-5 h-5 rounded border flex items-center justify-center transition-colors
                                ${formData.active ? 'bg-gold border-gold' : 'border-zinc-600 group-hover:border-zinc-500'}
                            `}>
                                {formData.active && <CheckCircle size={14} className="text-black" />}
                            </div>
                            <input
                                type="checkbox"
                                checked={formData.active}
                                onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                className="hidden"
                            />
                            <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">
                                Prestador ativo (disponível para novos trabalhos)
                            </span>
                        </label>
                    </div>
                </div>

                {/* Ações */}
                <div className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none px-4">
                    <div className="max-w-4xl mx-auto bg-zinc-900/90 border border-white/10 p-2 pr-3 pl-4 rounded-2xl flex items-center justify-between shadow-2xl backdrop-blur-xl pointer-events-auto">
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={() => navigate("/admin/prestadores")}
                            className="text-zinc-400 hover:text-white px-4 h-12 hover:bg-zinc-900/40 border border-gold/20/5"
                            disabled={saving}
                        >
                            Cancelar
                        </Button>
                        <div className="flex items-center gap-3">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="px-8 h-12 rounded-xl font-bold text-base shadow-lg shadow-gold/20 bg-gold hover:bg-gold/90 text-black border-none"
                                leftIcon={saving ? undefined : <Save size={18} />}
                            >
                                {saving ? 'Salvando...' : (isEdit ? "Salvar Alterações" : "Cadastrar Prestador")}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};
