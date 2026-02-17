import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Input, Select, Textarea, Button } from "../../../components/ui";
import {
    ArrowLeft, Save, User, Calendar, DollarSign,
    CheckCircle, Clock, AlertCircle, Headphones,
    Type, HandMetal, Eye, FileText, Layers, Box
} from "lucide-react";
import "./AdminShared.css";

const ACCESSIBILITY_SERVICES = [
    { value: "LIBRAS_INTERPRETATION", label: "Interpretação em LIBRAS", icon: <HandMetal size={24} />, description: "Tradução simultânea para língua de sinais" },
    { value: "AUDIO_DESCRIPTION", label: "Audiodescrição", icon: <Headphones size={24} />, description: "Narração descritiva para deficientes visuais" },
    { value: "CAPTIONING", label: "Legendagem", icon: <Type size={24} />, description: "Legendas para vídeos e conteúdos" },
    { value: "BRAILLE", label: "Material em Braille", icon: <Layers size={24} />, description: "Impressão e adaptação tátil" },
    { value: "TACTILE_MODEL", label: "Maquete Tátil", icon: <Box size={24} />, description: "Reprodução física para toque" },
    { value: "EASY_READING", label: "Leitura Fácil", icon: <Eye size={24} />, description: "Adaptação de textos para compreensão simplificada" }
];

const STATUS_OPTIONS = [
    { value: "PENDING", label: "Pendente", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { value: "APPROVED", label: "Aprovado", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { value: "IN_PROGRESS", label: "Em Andamento", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { value: "DELIVERED", label: "Entregue", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { value: "VALIDATED", label: "Validado", color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    { value: "REJECTED", label: "Rejeitado", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" }
];

interface Provider {
    id: string;
    name: string;
    services: string[];
}

interface Project {
    id: string;
    title: string;
}

export const AdminAccessibilityForm: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);

    const [formData, setFormData] = useState({
        serviceType: searchParams.get("serviceType") || "LIBRAS_INTERPRETATION",
        requestedBy: "",
        approvedBudget: "",
        providerId: "",
        projectId: searchParams.get("projectId") || "",
        status: "PENDING",
        deliverables: "",
        validationStatus: ""
    });

    useEffect(() => {
        if (tenantId) {
            // Load providers
            api.get(`/providers?tenantId=${tenantId}`)
                .then(res => setProviders(Array.isArray(res.data) ? res.data : []))
                .catch(console.error);

            // Load projects
            api.get(`/projects?tenantId=${tenantId}`)
                .then(res => setProjects(Array.isArray(res.data) ? res.data : []))
                .catch(console.error);
        }

        if (id && tenantId) {
            setLoading(true);
            api.get(`/accessibility-execution/${id}`)
                .then(res => {
                    const data = res.data;
                    setFormData({
                        serviceType: data.serviceType || "LIBRAS_INTERPRETATION",
                        requestedBy: data.requestedBy || "",
                        approvedBudget: data.approvedBudget?.toString() || "",
                        providerId: data.providerId || "",
                        projectId: data.projectId || "",
                        status: data.status || "PENDING",
                        deliverables: typeof data.deliverables === "object"
                            ? JSON.stringify(data.deliverables, null, 2)
                            : data.deliverables || "",
                        validationStatus: data.validationStatus || ""
                    });
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [id, tenantId, searchParams]);

    const handleSubmit = async () => {
        if (!tenantId) return;

        setSaving(true);
        try {
            let deliverables = null;
            if (formData.deliverables.trim()) {
                try {
                    deliverables = JSON.parse(formData.deliverables);
                } catch {
                    deliverables = { notes: formData.deliverables };
                }
            }

            const payload = {
                ...formData,
                tenantId,
                approvedBudget: formData.approvedBudget ? parseFloat(formData.approvedBudget) : null,
                providerId: formData.providerId || null,
                projectId: formData.projectId || null,
                deliverables
            };

            if (isEdit) {
                await api.put(`/accessibility-execution/${id}`, payload);
            } else {
                await api.post("/accessibility-execution", payload);
            }
            navigate("/admin/acessibilidade");
        } catch (error) {
            console.error("Erro ao salvar execução:", error);
            alert("Erro ao salvar. Verifique os dados.");
        } finally {
            setSaving(false);
        }
    };

    const filteredProviders = providers.filter(p =>
        p.services?.includes(formData.serviceType)
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[var(--bg-root)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[var(--fg-muted)] text-sm">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-form-container">
            {/* Header */}
            <div className="admin-wizard-header">
                <Button
                    variant="ghost"
                    onClick={() => navigate("/admin/acessibilidade")}
                    className="p-0 text-[var(--fg-muted)] hover:text-white"
                >
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="admin-wizard-title">
                        {isEdit ? "Editar Solicitação" : "Nova Solicitação de Acessibilidade"}
                    </h1>
                    <p className="admin-wizard-subtitle">
                        {isEdit ? "Atualize os dados da solicitação" : "Registre uma nova demanda de recursos acessíveis"}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-24">
                {/* COLUNA ESQUERDA - TIPO DE SERVIÇO */}
                <div className="lg:col-span-2 space-y-8">

                    <div className="admin-section">
                        <h2 className="admin-section-title">
                            <span className="text-blue-400">♿</span> Tipo de Serviço
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {ACCESSIBILITY_SERVICES.map(service => (
                                <div
                                    key={service.value}
                                    onClick={() => setFormData({ ...formData, serviceType: service.value, providerId: "" })}
                                    className={`
                                        cursor-pointer p-4 rounded-xl border transition-all duration-200 relative overflow-hidden group
                                        ${formData.serviceType === service.value
                                            ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.1)]'
                                            : 'bg-[var(--bg-surface-active)] border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--bg-surface-hover)]'}
                                    `}
                                >
                                    <div className={`mb-3 ${formData.serviceType === service.value ? 'text-blue-400' : 'text-[var(--fg-muted)] group-hover:text-white'}`}>
                                        {service.icon}
                                    </div>
                                    <h3 className={`font-bold text-sm mb-1 ${formData.serviceType === service.value ? 'text-white' : 'text-[var(--fg-main)]'}`}>
                                        {service.label}
                                    </h3>
                                    <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
                                        {service.description}
                                    </p>

                                    {formData.serviceType === service.value && (
                                        <div className="absolute top-4 right-4 text-blue-400">
                                            <CheckCircle size={18} className="fill-blue-500/10" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="admin-section">
                        <h2 className="admin-section-title">
                            <FileText className="text-[var(--accent-gold)]" size={20} /> Detalhes da Solicitação
                        </h2>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Solicitante / Departamento"
                                    value={formData.requestedBy}
                                    onChange={e => setFormData({ ...formData, requestedBy: e.target.value })}
                                    placeholder="Ex: Educativo, Curadoria..."
                                    leftIcon={<User size={16} />}
                                />
                                <Select
                                    label="Projeto Vinculado"
                                    value={formData.projectId}
                                    onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                                    options={[
                                        { value: "", label: "Nenhum projeto vinculado" },
                                        ...projects.map(p => ({ value: p.id, label: p.title }))
                                    ]}
                                />
                            </div>

                            <Textarea
                                label="Descrição dos Entregáveis"
                                value={formData.deliverables}
                                onChange={e => setFormData({ ...formData, deliverables: e.target.value })}
                                placeholder="Descreva detalhadamente o que deve ser entregue..."
                                rows={4}
                            />
                        </div>
                    </div>
                </div>

                {/* COLUNA DIREITA - STATUS E PRESTADOR */}
                <div className="space-y-8">

                    {/* Status Card */}
                    <div className="admin-section">
                        <h2 className="admin-section-title">Status e Orçamento</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-[var(--fg-muted)] uppercase mb-2 block">Situação Atual</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {STATUS_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, status: opt.value })}
                                            className={`
                                                flex items-center gap-3 p-3 rounded-xl border transition-all text-sm font-medium
                                                ${formData.status === opt.value
                                                    ? `${opt.bg} ${opt.border} ${opt.color}`
                                                    : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--fg-muted)] hover:bg-[var(--bg-surface-hover)]'}
                                            `}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${formData.status === opt.value ? 'bg-current' : 'bg-slate-600'}`} />
                                            {opt.label}
                                            {formData.status === opt.value && <CheckCircle size={14} className="ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-[var(--border-subtle)]">
                                <Input
                                    label="Orçamento Aprovado (R$)"
                                    type="number"
                                    value={formData.approvedBudget}
                                    onChange={e => setFormData({ ...formData, approvedBudget: e.target.value })}
                                    leftIcon={<DollarSign size={16} />}
                                    className="font-mono text-lg"
                                    placeholder="0,00"
                                />
                            </div>

                            <div className="pt-4">
                                <Input
                                    label="Status da Validação"
                                    value={formData.validationStatus}
                                    onChange={e => setFormData({ ...formData, validationStatus: e.target.value })}
                                    placeholder="Ex: Aprovado pelo especialista"
                                    leftIcon={<CheckCircle size={16} />}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Prestador Card */}
                    <div className="admin-section">
                        <h2 className="admin-section-title">
                            <User className="text-purple-400" size={20} /> Prestador
                        </h2>

                        {filteredProviders.length === 0 ? (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                                <AlertCircle className="mx-auto text-amber-500 mb-2" size={24} />
                                <p className="text-xs text-amber-200 mb-3">
                                    Nenhum prestador encontrado para {ACCESSIBILITY_SERVICES.find(s => s.value === formData.serviceType)?.label}.
                                </p>
                                <Button
                                    variant="outline"
                                    className="w-full text-xs h-8 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                                    onClick={() => navigate("/admin/prestadores/novo")}
                                >
                                    Cadastrar Prestador
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Select
                                    label="Prestador Designado"
                                    value={formData.providerId}
                                    onChange={e => setFormData({ ...formData, providerId: e.target.value })}
                                    options={[
                                        { value: "", label: "Selecione um prestador..." },
                                        ...filteredProviders.map(p => ({ value: p.id, label: p.name }))
                                    ]}
                                />
                                {formData.providerId && (
                                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-lg">
                                            {filteredProviders.find(p => p.id === formData.providerId)?.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">
                                                {filteredProviders.find(p => p.id === formData.providerId)?.name}
                                            </p>
                                            <p className="text-xs text-purple-300">Prestador Habilitado</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Floating Action Bar */}
            <div className="admin-wizard-footer">
                <div className="admin-wizard-footer-inner">
                    <span className="text-xs text-[var(--fg-muted)] font-medium ml-2 hidden sm:block">
                        {isEdit ? "Edição de registro" : "Novo registro"}
                    </span>
                    <Button
                        onClick={handleSubmit}
                        isLoading={saving}
                        className="btn-primary"
                        leftIcon={<Save size={18} />}
                    >
                        Salvar Solicitação
                    </Button>
                </div>
            </div>
        </div>
    );
};
