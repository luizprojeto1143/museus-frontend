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
        email: "",
        phone: "",
        document: "", // CNPJ/CPF
        type: "COMPANY", // INDIVIDUAL, COMPANY
        services: [] as string[],
        rating: 0,
        completedJobs: 0,
        active: true
    });

    useEffect(() => {
        if (isEdit) {
            setLoading(true);
            api.get(`/providers/${id}`)
                .then(res => setFormData({
                    name: res.data.name || "",
                    email: res.data.email || "",
                    phone: res.data.phone || "",
                    document: res.data.document || "",
                    type: res.data.type || "COMPANY",
                    services: res.data.services || [],
                    rating: res.data.rating || 0,
                    completedJobs: res.data.completedJobs || 0,
                    active: res.data.active ?? true
                }))
                .catch(err => {
                    console.error("Erro ao carregar prestador", err);
                    addToast("Não foi possível carregar os dados.", "error");
                    navigate("/admin/prestadores");
                })
                .finally(() => setLoading(false));
        }
    }, [id, isEdit, navigate, addToast]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleService = (service: string) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.includes(service)
                ? prev.services.filter(s => s !== service)
                : [...prev.services, service]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isEdit) {
                await api.put(`/providers/${id}`, formData);
                addToast("Prestador atualizado com sucesso!", "success");
            } else {
                await api.post('/providers', { ...formData, tenantId });
                addToast("Prestador cadastrado com sucesso!", "success");
            }
            navigate("/admin/prestadores");
        } catch (err: any) {
            console.error("Erro ao salvar prestador", err);
            addToast(err.response?.data?.error || "Ocorreu um erro ao salvar.", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center animate-pulse text-gold">Carregando prestador...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl pb-24 mx-auto pt-6 px-4 md:px-0">
            {/* Header Area */}
            <div className="flex flex-col gap-4 sticky top-0 bg-zinc-950/90 py-4 z-40 backdrop-blur-md border-b border-white/5 md:border-none md:bg-transparent md:py-0">
                <div className="flex items-center gap-3 text-sm text-zinc-400 font-bold mb-2">
                    <button onClick={() => navigate(-1)} className="hover:text-gold flex items-center gap-1 transition-colors">
                        <ArrowLeft size={16} /> Voltar
                    </button>
                    <span>/</span>
                    <span className="text-zinc-500">{t("admin.providerform.gestoDePrestadores", "Gestão de Prestadores")}</span>
                </div>

                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <div className="w-12 h-12 bg-gold/10 text-gold rounded-xl flex items-center justify-center border border-gold/20 shadow-lg shadow-gold/5">
                        <Briefcase size={24} />
                    </div>
                    {isEdit ? "Editar Prestador" : "Novo Prestador de Serviço"}
                </h1>
                <p className="text-zinc-400 max-w-2xl text-lg">{t("admin.providerform.cadastreProfissionaisOuEmpresa", "Cadastre profissionais ou empresas especializadas em serviços de acessibilidade (LIBRAS, Audiodescrição, etc).")}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 mt-6">

                {/* Dados Principais */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-4">
                        <User size={20} className="text-gold" />{t("admin.providerform.informaesBsicas", "Informações Básicas")}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label={t("admin.providerform.nomeOuRazoSocial", "Nome ou Razão Social")}
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Ex: Instituto Acessibilidade Brasil"
                            required
                            className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
                        />

                        <div>
                            <label className="block text-sm font-bold text-zinc-300 mb-2">Tipo de Pessoa</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full bg-zinc-900/50 border border-white/10 text-white rounded-xl px-4 py-2.5 outline-none focus:border-gold/50 transition-colors"
                            >
                                <option value="COMPANY">{t("admin.providerform.pessoaJurdicaEmpresa", "Pessoa Jurídica (Empresa)")}</option>
                                <option value="INDIVIDUAL">{t("admin.providerform.pessoaFsicaAutnomo", "Pessoa Física (Autônomo)")}</option>
                            </select>
                        </div>

                        <Input
                            label="Documento (CPF ou CNPJ)"
                            name="document"
                            value={formData.document}
                            onChange={handleChange}
                            placeholder="00.000.000/0001-00"
                            leftIcon={<FileText size={16} className="text-zinc-500" />}
                            className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
                        />
                    </div>
                </div>

                {/* Contato */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-4">
                        <Phone size={20} className="text-gold" /> Contato
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Email Comercial"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="contato@empresa.com.br"
                            leftIcon={<Mail size={16} className="text-zinc-500" />}
                            className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
                        />

                        <Input
                            label="Telefone ou WhatsApp"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="(00) 90000-0000"
                            leftIcon={<Phone size={16} className="text-zinc-500" />}
                            className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
                        />
                    </div>
                </div>

                {/* Serviços */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">{t("admin.providerform.ServiosOferecidos", "♿ Serviços Oferecidos")}</h2>
                        <p className="text-sm text-zinc-400">{t("admin.providerform.selecioneTodosOsServiosDeAcess", "Selecione todos os serviços de acessibilidade que este prestador oferece:")}</p>
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
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-4">
                        <Briefcase size={20} className="text-gold" />{t("admin.providerform.avaliaoEHistrico", "Avaliação e Histórico")}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label={t("admin.providerform.avaliao05", "Avaliação (0-5)")}
                            type="number"
                            name="rating"
                            step="0.1"
                            min="0"
                            max="5"
                            value={formData.rating}
                            onChange={handleChange as any}
                            placeholder="4.5"
                            leftIcon={<Star size={16} className="text-zinc-500" />}
                            className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
                        />

                        <Input
                            label={t("admin.providerform.trabalhosConcludos", "Trabalhos Concluídos")}
                            type="number"
                            name="completedJobs"
                            min="0"
                            value={formData.completedJobs}
                            onChange={handleChange as any}
                            className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
                        />
                    </div>

                    <div className="p-4 bg-zinc-900/50 rounded-xl border border-white/5 mt-4">
                        <label className="flex items-center gap-3 cursor-pointer group w-fit">
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
                            <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">{t("admin.providerform.prestadorAtivoDisponvelParaNov", "Prestador ativo (disponível para novos trabalhos)")}</span>
                        </label>
                    </div>
                </div>

                {/* Ações */}
                <div className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none px-4">
                    <div className="max-w-4xl mx-auto bg-zinc-900/95 border border-white/10 p-2 pr-3 pl-4 rounded-2xl flex items-center justify-between shadow-2xl backdrop-blur-xl pointer-events-auto">
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={() => navigate("/admin/prestadores")}
                            className="text-zinc-400 hover:text-white px-4 h-12 hover:bg-zinc-900/40"
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
