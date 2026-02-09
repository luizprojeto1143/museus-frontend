import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { ArrowLeft, Save, Users, DollarSign, FileText, Accessibility } from "lucide-react";
import { useToast } from "../../../contexts/ToastContext";
import { Input, Textarea, Button } from "../../../components/ui";

const STATUS_OPTIONS = [
    { value: "DRAFT", label: "Rascunho", color: "#6b7280" },
    { value: "SUBMITTED", label: "Submetido", color: "#3b82f6" },
    { value: "UNDER_REVIEW", label: "Em Análise", color: "#f59e0b" },
    { value: "APPROVED", label: "Aprovado", color: "#22c55e" },
    { value: "REJECTED", label: "Rejeitado", color: "#ef4444" },
    { value: "IN_EXECUTION", label: "Em Execução", color: "#8b5cf6" },
    { value: "COMPLETED", label: "Concluído", color: "#06b6d4" },
    { value: "CANCELED", label: "Cancelado", color: "#64748b" }
];

const CULTURAL_CATEGORIES = [
    "Artes Visuais", "Música", "Teatro", "Dança", "Literatura",
    "Audiovisual", "Patrimônio Cultural", "Cultura Popular", "Artesanato"
];

const ACCESSIBILITY_SERVICES = [
    { value: "LIBRAS_INTERPRETATION", label: "Interpretação em LIBRAS" },
    { value: "AUDIO_DESCRIPTION", label: "Audiodescrição" },
    { value: "CAPTIONING", label: "Legendagem" },
    { value: "BRAILLE", label: "Material em Braille" },
    { value: "TACTILE_MODEL", label: "Maquete Tátil" },
    { value: "EASY_READING", label: "Leitura Fácil" }
];

interface Notice {
    id: string;
    title: string;
}

export const AdminProjectForm: React.FC = () => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [notices, setNotices] = useState<Notice[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        summary: "",
        description: "",
        culturalCategory: "",
        targetRegion: "",
        requestedBudget: "",
        approvedBudget: "",
        expectedAudience: "",
        actualAudience: "",
        status: "DRAFT",
        noticeId: searchParams.get("noticeId") || "",
        proponentId: "",
        attachments: [] as any[],
        accessibilityPlan: {
            hasAccessibility: false,
            services: [] as string[],
            description: ""
        }
    });

    useEffect(() => {
        // Load available notices
        if (tenantId) {
            api.get(`/notices?tenantId=${tenantId}`)
                .then(res => setNotices(Array.isArray(res.data) ? res.data : []))
                .catch(console.error);
        }

        if (id && tenantId) {
            setLoading(true);
            api.get(`/projects/${id}`)
                .then(res => {
                    const data = res.data;
                    setFormData({
                        title: data.title || "",
                        summary: data.summary || "",
                        description: data.description || "",
                        culturalCategory: data.culturalCategory || "",
                        targetRegion: data.targetRegion || "",
                        requestedBudget: data.requestedBudget?.toString() || "",
                        approvedBudget: data.approvedBudget?.toString() || "",
                        expectedAudience: data.expectedAudience?.toString() || "",
                        actualAudience: data.actualAudience?.toString() || "",
                        status: data.status || "DRAFT",
                        noticeId: data.noticeId || "",
                        proponentId: data.proponentId || "",
                        attachments: data.attachments || [],
                        accessibilityPlan: data.accessibilityPlan || {
                            hasAccessibility: false,
                            services: [],
                            description: ""
                        }
                    });
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [id, tenantId, searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenantId) return;

        setSaving(true);
        try {
            const payload = {
                ...formData,
                tenantId,
                requestedBudget: formData.requestedBudget ? parseFloat(formData.requestedBudget) : null,
                approvedBudget: formData.approvedBudget ? parseFloat(formData.approvedBudget) : null,
                expectedAudience: formData.expectedAudience ? parseInt(formData.expectedAudience) : null,
                actualAudience: formData.actualAudience ? parseInt(formData.actualAudience) : null,
                noticeId: formData.noticeId || null,
                proponentId: formData.proponentId || "system" // Default proponent
            };

            if (isEdit) {
                await api.put(`/projects/${id}`, payload);
            } else {
                await api.post("/projects", payload);
            }
            addToast("Projeto salvo com sucesso!", "success");
            navigate("/admin/projetos");
        } catch (error) {
            console.error("Erro ao salvar projeto:", error);
            addToast("Erro ao salvar projeto. Verifique os dados.", "error");
        } finally {
            setSaving(false);
        }
    };

    const toggleAccessibilityService = (service: string) => {
        setFormData(prev => ({
            ...prev,
            accessibilityPlan: {
                ...prev.accessibilityPlan,
                services: prev.accessibilityPlan.services.includes(service)
                    ? prev.accessibilityPlan.services.filter(s => s !== service)
                    : [...prev.accessibilityPlan.services, service]
            }
        }));
    };

    if (loading) {
        return <div className="loading">Carregando projeto...</div>;
    }

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button
                    onClick={() => navigate("/admin/projetos")}
                    variant="ghost"
                    className="p-2 hover:bg-white/10 rounded"
                >
                    <ArrowLeft size={24} />
                </Button>
                <div>
                    <h1 className="section-title">{isEdit ? "Editar Projeto" : "Novo Projeto Cultural"}</h1>
                    <p className="section-subtitle">
                        {isEdit ? "Atualize as informações do projeto" : "Cadastre um novo projeto cultural"}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Informações Básicas */}
                <div className="card mb-6">
                    <h2 className="card-title flex items-center gap-2 text-gold border-b border-gray-700 pb-2 mb-4">
                        <FileText size={20} /> Informações Básicas
                    </h2>

                    <Input
                        label="Título do Projeto *"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ex: Festival de Jazz de Betim 2024"
                        required
                    />

                    <Textarea
                        label="Resumo"
                        rows={2}
                        value={formData.summary}
                        onChange={e => setFormData({ ...formData, summary: e.target.value })}
                        placeholder="Breve resumo do projeto..."
                    />

                    <Textarea
                        label="Descrição Completa"
                        rows={5}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Descreva os objetivos, metodologia, cronograma e impactos esperados..."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-300 mb-1">Categoria Cultural</label>
                            <select
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-white"
                                value={formData.culturalCategory}
                                onChange={e => setFormData({ ...formData, culturalCategory: e.target.value })}
                            >
                                <option value="">Selecione...</option>
                                {CULTURAL_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="Região"
                            value={formData.targetRegion}
                            onChange={e => setFormData({ ...formData, targetRegion: e.target.value })}
                            placeholder="Ex: Centro, Zona Norte..."
                            containerClassName="mb-0"
                        />
                    </div>

                    <div className="form-group mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Vinculado ao Edital</label>
                        <select
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-white"
                            value={formData.noticeId}
                            onChange={e => setFormData({ ...formData, noticeId: e.target.value })}
                        >
                            <option value="">Nenhum (projeto autônomo)</option>
                            {notices.map(notice => (
                                <option key={notice.id} value={notice.id}>{notice.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                        <select
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-white"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                        >
                            {STATUS_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Orçamento */}
                <div className="card mb-6">
                    <h2 className="card-title flex items-center gap-2 text-gold border-b border-gray-700 pb-2 mb-4">
                        <DollarSign size={20} /> Orçamento
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Valor Solicitado (R$)"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.requestedBudget}
                            onChange={e => setFormData({ ...formData, requestedBudget: e.target.value })}
                            placeholder="50000.00"
                        />
                        <Input
                            label="Valor Aprovado (R$)"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.approvedBudget}
                            onChange={e => setFormData({ ...formData, approvedBudget: e.target.value })}
                            placeholder="45000.00"
                        />
                    </div>
                </div>

                {/* Público */}
                <div className="card mb-6">
                    <h2 className="card-title flex items-center gap-2 text-gold border-b border-gray-700 pb-2 mb-4">
                        <Users size={20} /> Público
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Público Esperado"
                            type="number"
                            min="0"
                            value={formData.expectedAudience}
                            onChange={e => setFormData({ ...formData, expectedAudience: e.target.value })}
                            placeholder="1000"
                        />
                        <Input
                            label="Público Real (após execução)"
                            type="number"
                            min="0"
                            value={formData.actualAudience}
                            onChange={e => setFormData({ ...formData, actualAudience: e.target.value })}
                            placeholder="1200"
                        />
                    </div>
                </div>

                {/* Plano de Acessibilidade */}
                <div className="card mb-6">
                    <h2 className="card-title flex items-center gap-2 text-gold border-b border-gray-700 pb-2 mb-4">
                        <Accessibility size={20} /> Plano de Acessibilidade
                    </h2>

                    <label className="flex items-center gap-3 cursor-pointer mb-4">
                        <input
                            type="checkbox"
                            checked={formData.accessibilityPlan.hasAccessibility}
                            onChange={e => setFormData({
                                ...formData,
                                accessibilityPlan: { ...formData.accessibilityPlan, hasAccessibility: e.target.checked }
                            })}
                            className="w-5 h-5 rounded border-gray-600 text-gold focus:ring-gold bg-gray-700"
                        />
                        <span>Este projeto inclui recursos de acessibilidade</span>
                    </label>

                    {formData.accessibilityPlan.hasAccessibility && (
                        <>
                            <div className="mb-4">
                                <label className="block mb-2 text-sm font-medium text-gray-300">Serviços de Acessibilidade:</label>
                                <div className="flex flex-wrap gap-2">
                                    {ACCESSIBILITY_SERVICES.map(service => (
                                        <button
                                            key={service.value}
                                            type="button"
                                            onClick={() => toggleAccessibilityService(service.value)}
                                            className={`
                                                px-4 py-2 rounded-full border text-sm transition-colors
                                                ${formData.accessibilityPlan.services.includes(service.value)
                                                    ? 'border-green-500 bg-green-500/10 text-green-500'
                                                    : 'border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-400'}
                                            `}
                                        >
                                            {service.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Textarea
                                label="Descrição do Plano de Acessibilidade"
                                rows={3}
                                value={formData.accessibilityPlan.description}
                                onChange={e => setFormData({
                                    ...formData,
                                    accessibilityPlan: { ...formData.accessibilityPlan, description: e.target.value }
                                })}
                                placeholder="Descreva como os recursos de acessibilidade serão implementados..."
                            />
                        </>
                    )}
                </div>

                {/* Prestação de Contas */}
                <div className="card mb-6">
                    <h2 className="card-title flex items-center gap-2 text-gold border-b border-gray-700 pb-2 mb-4">
                        <FileText size={20} /> Prestação de Contas
                    </h2>

                    {formData.attachments && formData.attachments.length > 0 ? (
                        <div className="grid gap-3">
                            {formData.attachments.map((doc: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center p-4 bg-gray-800 rounded-md border border-gray-700">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-blue-900/30 rounded-full text-blue-400">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-200">{doc.name}</div>
                                            <div className="text-sm text-gray-500">
                                                Enviado em: {new Date(doc.date).toLocaleDateString()} {new Date(doc.date).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                    <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-600 text-sm font-medium transition-colors"
                                    >
                                        Baixar Arquivo
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">
                            Nenhum documento de prestação de contas anexado pelo produtor.
                        </p>
                    )}
                </div>

                {/* Ações */}
                <div className="flex justify-end gap-4 mt-8">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate("/admin/projetos")}
                        disabled={saving}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={saving}
                        isLoading={saving}
                        leftIcon={<Save size={18} />}
                    >
                        {isEdit ? "Salvar Alterações" : "Criar Projeto"}
                    </Button>
                </div>
            </form>
        </div>
    );
};
