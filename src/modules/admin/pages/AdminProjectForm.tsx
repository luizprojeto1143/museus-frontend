import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import {
    ArrowLeft, Save, Users, DollarSign, FileText, Accessibility,
    LayoutList, Tag, CheckCircle2, AlertCircle, Clock, XCircle
} from "lucide-react";
import { useToast } from "../../../contexts/ToastContext";
import { Input, Textarea, Button, Select } from "../../../components/ui";
import "./AdminShared.css";

const STATUS_OPTIONS = [
    { value: "DRAFT", label: "Rascunho", icon: <Clock size={16} />, color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
    { value: "SUBMITTED", label: "Submetido", icon: <CheckCircle2 size={16} />, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { value: "UNDER_REVIEW", label: "Em Análise", icon: <AlertCircle size={16} />, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { value: "APPROVED", label: "Aprovado", icon: <CheckCircle2 size={16} />, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { value: "REJECTED", label: "Rejeitado", icon: <XCircle size={16} />, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    { value: "IN_EXECUTION", label: "Em Execução", icon: <LayoutList size={16} />, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { value: "COMPLETED", label: "Concluído", icon: <CheckCircle2 size={16} />, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    { value: "CANCELED", label: "Cancelado", icon: <XCircle size={16} />, color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" }
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

    const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

    useEffect(() => {
        if (tenantId) {
            // Fetch Notices
            api.get(`/notices?tenantId=${tenantId}`)
                .then(res => setNotices(Array.isArray(res.data) ? res.data : []))
                .catch(console.error);

            // Fetch Categories (Dynamic)
            api.get(`/categories?tenantId=${tenantId}`)
                .then(res => setCategories(res.data))
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
                proponentId: formData.proponentId || "system"
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
        return (
            <div className="flex justify-center items-center h-screen bg-[var(--bg-root)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[var(--fg-muted)] text-sm">Carregando projeto...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-form-container">
            {/* HERO SECTION */}
            <div className="admin-wizard-header">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/admin/projetos')}
                    className="p-0 text-[var(--fg-muted)] hover:text-white"
                >
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="admin-wizard-title">
                        {isEdit ? 'Editar Projeto' : 'Novo Projeto'}
                    </h1>
                    <p className="admin-wizard-subtitle">Gestão de propostas culturais e editais.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-8 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN - MAIN CONTENT */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* BASIC INFO CARD */}
                        <div className="admin-section">
                            <h3 className="admin-section-title">
                                <FileText className="text-[var(--accent-gold)]" size={20} /> Informações do Projeto
                            </h3>

                            <div className="form-group">
                                <Input
                                    label="Título do Projeto *"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Ex: Festival de Jazz de Betim 2024"
                                    required
                                    className="h-12 text-lg font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <Select
                                        label="Categoria Cultural"
                                        value={formData.culturalCategory}
                                        onChange={e => setFormData({ ...formData, culturalCategory: e.target.value })}
                                    >
                                        <option value="">Selecione...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                        {categories.length === 0 && CULTURAL_CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </Select>
                                </div>

                                <div className="form-group">
                                    <Input
                                        label="Região de Atuação"
                                        value={formData.targetRegion}
                                        onChange={e => setFormData({ ...formData, targetRegion: e.target.value })}
                                        placeholder="Ex: Centro, Zona Norte"
                                        leftIcon={<LayoutList size={16} />}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <Textarea
                                    label="Resumo Executivo"
                                    rows={3}
                                    value={formData.summary}
                                    onChange={e => setFormData({ ...formData, summary: e.target.value })}
                                    placeholder="Breve resumo para listagem pública..."
                                />
                            </div>

                            <div className="form-group">
                                <Textarea
                                    label="Descrição Detalhada"
                                    rows={6}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Objetivos, metodologia, cronograma..."
                                />
                            </div>
                        </div>

                        {/* ACCESSIBILITY CARD */}
                        <div className="admin-section">
                            <h3 className="admin-section-title">
                                <Accessibility className="text-[var(--accent-gold)]" size={20} /> Plano de Acessibilidade
                            </h3>

                            <label className={`
                                flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition-all mb-6
                                ${formData.accessibilityPlan.hasAccessibility
                                    ? 'bg-[var(--accent-gold)]/10 border-[var(--accent-gold)]/50 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                                    : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-default)]'}
                            `}>
                                <div className={`
                                    w-6 h-6 rounded-full border flex items-center justify-center transition-colors
                                    ${formData.accessibilityPlan.hasAccessibility ? 'bg-[var(--accent-gold)] border-[var(--accent-gold)]' : 'border-[var(--fg-muted)]/30'}
                                `}>
                                    {formData.accessibilityPlan.hasAccessibility && <CheckCircle2 size={14} className="text-black" />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={formData.accessibilityPlan.hasAccessibility}
                                    onChange={e => setFormData({
                                        ...formData,
                                        accessibilityPlan: { ...formData.accessibilityPlan, hasAccessibility: e.target.checked }
                                    })}
                                />
                                <div>
                                    <div className={`font-bold ${formData.accessibilityPlan.hasAccessibility ? 'text-[var(--fg-main)]' : 'text-[var(--fg-muted)]'}`}>
                                        Acessibilidade Inclusa
                                    </div>
                                    <div className="text-xs text-[var(--fg-muted)]">Este projeto contempla medidas de acessibilidade para PcD.</div>
                                </div>
                            </label>

                            {formData.accessibilityPlan.hasAccessibility && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div>
                                        <label className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider block mb-3">Recursos Oferecidos</label>
                                        <div className="flex flex-wrap gap-2">
                                            {ACCESSIBILITY_SERVICES.map(service => (
                                                <button
                                                    key={service.value}
                                                    type="button"
                                                    onClick={() => toggleAccessibilityService(service.value)}
                                                    className={`
                                                        px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                                                        ${formData.accessibilityPlan.services.includes(service.value)
                                                            ? 'bg-[var(--accent-gold)]/20 border-[var(--accent-gold)]/50 text-[var(--accent-gold)]'
                                                            : 'bg-[var(--bg-surface-active)] border-[var(--border-subtle)] text-[var(--fg-muted)] hover:bg-[var(--bg-surface-hover)]'}
                                                    `}
                                                >
                                                    {service.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <Textarea
                                            label="Detalhamento da Acessibilidade"
                                            rows={3}
                                            value={formData.accessibilityPlan.description}
                                            onChange={e => setFormData({
                                                ...formData,
                                                accessibilityPlan: { ...formData.accessibilityPlan, description: e.target.value }
                                            })}
                                            placeholder="Descreva como os recursos serão implementados..."
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ACCOUNTABILITY FILES */}
                        <div className="admin-section">
                            <h3 className="admin-section-title">
                                <FileText className="text-[var(--accent-gold)]" size={20} /> Prestação de Contas
                            </h3>

                            {formData.attachments && formData.attachments.length > 0 ? (
                                <div className="grid gap-3">
                                    {formData.attachments.map((doc: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 bg-[var(--bg-surface-active)] rounded-lg text-[var(--fg-muted)]">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-[var(--fg-main)]">{doc.name}</div>
                                                    <div className="text-xs text-[var(--fg-muted)]">
                                                        Enviado em: {new Date(doc.date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <a
                                                href={doc.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-4 py-2 bg-[var(--bg-surface-active)] border border-[var(--border-subtle)] rounded-lg text-[var(--fg-muted)] hover:bg-[var(--bg-surface-hover)] hover:text-white text-sm font-medium transition-colors"
                                            >
                                                Visualizar
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 border-2 border-dashed border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-surface)]">
                                    <FileText className="w-10 h-10 text-[var(--fg-muted)] mx-auto mb-3" />
                                    <p className="text-[var(--fg-muted)]">Nenhum documento anexado pelo produtor ainda.</p>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* RIGHT COLUMN - SIDEBAR */}
                    <div className="space-y-6">

                        {/* STATUS CARD */}
                        <div className="admin-section shadow-xl backdrop-blur-xl">
                            <h3 className="admin-section-title">
                                Status do Projeto
                            </h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-2">
                                    {STATUS_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, status: opt.value })}
                                            className={`
                                                flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left
                                                ${formData.status === opt.value
                                                    ? `${opt.bg} ${opt.border} ring-1 ring-inset ${opt.color.replace('text-', 'ring-')}`
                                                    : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] opacity-50 hover:opacity-100'}
                                            `}
                                        >
                                            <div className={formData.status === opt.value ? opt.color : 'text-[var(--fg-muted)]'}>
                                                {opt.icon}
                                            </div>
                                            <span className={`text-sm font-bold ${formData.status === opt.value ? 'text-white' : 'text-[var(--fg-muted)]'}`}>
                                                {opt.label}
                                            </span>
                                            {formData.status === opt.value && (
                                                <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* NUMBERS CARD */}
                        <div className="admin-section">
                            <h3 className="admin-section-title">
                                <DollarSign className="text-[var(--accent-gold)]" size={20} /> Métricas & Edital
                            </h3>

                            <div className="space-y-4">
                                <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
                                    <div className="text-xs text-[var(--fg-muted)] uppercase font-bold mb-1">Edital Vinculado</div>
                                    <select
                                        className="w-full bg-transparent text-[var(--fg-main)] font-medium focus:outline-none text-sm"
                                        value={formData.noticeId}
                                        onChange={e => setFormData({ ...formData, noticeId: e.target.value })}
                                    >
                                        <option value="">Nenhum (Projeto Autônomo)</option>
                                        {notices.map(n => (
                                            <option key={n.id} value={n.id}>{n.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <Input
                                            label="R$ Solicitado"
                                            type="number"
                                            value={formData.requestedBudget}
                                            onChange={e => setFormData({ ...formData, requestedBudget: e.target.value })}
                                            placeholder="0.00"
                                            className="font-mono text-sm"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Input
                                            label="R$ Aprovado"
                                            type="number"
                                            value={formData.approvedBudget}
                                            onChange={e => setFormData({ ...formData, approvedBudget: e.target.value })}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="h-px bg-[var(--border-subtle)]"></div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <Input
                                            label="Público Previsto"
                                            type="number"
                                            value={formData.expectedAudience}
                                            onChange={e => setFormData({ ...formData, expectedAudience: e.target.value })}
                                            leftIcon={<Users size={14} />}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Input
                                            label="Público Real"
                                            type="number"
                                            value={formData.actualAudience}
                                            onChange={e => setFormData({ ...formData, actualAudience: e.target.value })}
                                            leftIcon={<Users size={14} />}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* FLOATING ACTION BAR */}
                <div className="admin-wizard-footer">
                    <div className="admin-wizard-footer-inner">
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={() => navigate('/admin/projetos')}
                            className="text-[var(--fg-muted)] hover:text-white"
                        >
                            Cancelar
                        </Button>
                        <div className="flex items-center gap-3">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="btn-primary"
                                leftIcon={saving ? undefined : <Save size={18} />}
                            >
                                {saving ? 'Salvando...' : 'Salvar Projeto'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

