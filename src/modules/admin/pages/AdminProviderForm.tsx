import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { Input, Button } from "../../../components/ui";
import { ArrowLeft, Save, User, Phone, Mail, Star, CheckCircle, Briefcase, FileText } from "lucide-react";

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
        return <div className="text-center p-8">Carregando prestador...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" onClick={() => navigate("/admin/prestadores")} className="p-2">
                    <ArrowLeft size={24} />
                </Button>
                <div>
                    <h1 className="section-title">{isEdit ? "Editar Prestador" : "Novo Prestador"}</h1>
                    <p className="section-subtitle">
                        {isEdit ? "Atualize as informações do prestador" : "Cadastre um novo prestador de acessibilidade"}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informações Básicas */}
                <div className="card">
                    <h2 className="card-title flex items-center gap-2 mb-6">
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
                            />
                        </div>

                        <Input
                            label="CPF/CNPJ"
                            value={formData.document}
                            onChange={e => setFormData({ ...formData, document: e.target.value })}
                            placeholder="000.000.000-00 ou 00.000.000/0000-00"
                            leftIcon={<FileText size={16} />}
                        />

                        <Input
                            label="E-mail"
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            placeholder="contato@exemplo.com"
                            leftIcon={<Mail size={16} />}
                        />

                        <Input
                            label="Telefone"
                            type="tel"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="(31) 99999-9999"
                            leftIcon={<Phone size={16} />}
                            containerClassName="md:col-span-2"
                        />
                    </div>
                </div>

                {/* Serviços */}
                <div className="card">
                    <h2 className="card-title mb-2">♿ Serviços Oferecidos</h2>
                    <p className="text-sm text-gray-400 mb-6">
                        Selecione todos os serviços de acessibilidade que este prestador oferece:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ACCESSIBILITY_SERVICES.map(service => {
                            const isSelected = formData.services.includes(service.value);
                            return (
                                <button
                                    key={service.value}
                                    type="button"
                                    onClick={() => toggleService(service.value)}
                                    className={`
                                        p-4 rounded-xl border-2 transition-all flex items-center gap-3 text-left
                                        ${isSelected
                                            ? "border-green-500 bg-green-500/10 text-green-400"
                                            : "border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600"}
                                    `}
                                >
                                    <span className="text-2xl">{service.icon}</span>
                                    <span className={`font-medium ${isSelected ? "text-green-400" : "text-gray-300"}`}>
                                        {service.label}
                                    </span>
                                    {isSelected && (
                                        <CheckCircle size={18} className="ml-auto text-green-500" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Avaliação e Histórico */}
                <div className="card">
                    <h2 className="card-title flex items-center gap-2 mb-6">
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
                        />

                        <Input
                            label="Trabalhos Concluídos"
                            type="number"
                            min="0"
                            value={formData.completedJobs}
                            onChange={e => setFormData({ ...formData, completedJobs: parseInt(e.target.value) || 0 })}
                        />
                    </div>

                    <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.active}
                                onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                className="w-5 h-5 rounded text-gold focus:ring-gold bg-gray-900 border-gray-600"
                            />
                            <span className="font-medium text-gray-200">Prestador ativo (disponível para novos trabalhos)</span>
                        </label>
                    </div>
                </div>

                {/* Ações */}
                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate("/admin/prestadores")}
                        disabled={saving}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        isLoading={saving}
                        leftIcon={<Save size={18} />}
                    >
                        {isEdit ? "Salvar Alterações" : "Cadastrar Prestador"}
                    </Button>
                </div>
            </form>
        </div>
    );
};
