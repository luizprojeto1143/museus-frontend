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
import "../../master/pages/MasterShared.css"; // Reuse the premium styles

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
            <div className="flex justify-center items-center h-screen bg-[#0a0a0c]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-sm">Carregando projeto...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="master-page-container bg-[#0a0a0c] min-h-screen pb-24">
            {/* HERO SECTION */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-8 border-b border-white/10 gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/admin/projetos')}
                        className="w-10 h-10 p-0 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 flex items-center justify-center shrink-0"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-white tracking-tight">
                                {isEdit ? 'Editar Projeto' : 'Novo Projeto'}
                            </h1>
                            {isEdit && (
                                <div className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-bold rounded uppercase tracking-wider">
                                    Admin Mode
                                </div>
                            )}
                        </div>
                        <p className="text-slate-500 text-sm font-medium mt-1">Gestão de propostas culturais e editais.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN - MAIN CONTENT */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* BASIC INFO CARD */}
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <FileText className="text-blue-400" size={20} /> Informações do Projeto
                            </h3>

                            <Input
                                label="Título do Projeto *"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ex: Festival de Jazz de Betim 2024"
                                required
                                className="h-12 text-lg font-bold"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select
                                    label="Categoria Cultural"
                                    value={formData.culturalCategory}
                                    onChange={e => setFormData({ ...formData, culturalCategory: e.target.value })}
                                >
                                    <option value="">Selecione...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                    {/* Fallback for hardcoded if needed, or remove */}
                                    {categories.length === 0 && CULTURAL_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </Select>

                                <Input
                                    label="Região de Atuação"
                                    value={formData.targetRegion}
                                    onChange={e => setFormData({ ...formData, targetRegion: e.target.value })}
                                    placeholder="Ex: Centro, Zona Norte"
                                    leftIcon={<LayoutList size={16} />}
                                />
                            </div>

                            <Textarea
                                label="Resumo Executivo"
                                rows={3}
                                value={formData.summary}
                                onChange={e => setFormData({ ...formData, summary: e.target.value })}
                                placeholder="Breve resumo para listagem pública..."
                                className="bg-black/20"
                            />

                            <Textarea
                                label="Descrição Detalhada"
                                rows={6}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Objetivos, metodologia, cronograma..."
                                className="bg-black/20"
                            />
                        </div>

                        {/* ACCESSIBILITY CARD */}
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 md:p-8">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Accessibility className="text-emerald-400" size={20} /> Plano de Acessibilidade
                            </h3>

                            <label className={`
                                flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition-all mb-6
                                ${formData.accessibilityPlan.hasAccessibility
                                    ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                    : 'bg-black/20 border-white/10 hover:border-white/20'}
                            `}>
                                <div className={`
                                    w-6 h-6 rounded-full border flex items-center justify-center transition-colors
                                    ${formData.accessibilityPlan.hasAccessibility ? 'bg-emerald-500 border-emerald-500' : 'border-white/30'}
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
                                    <div className={`font-bold ${formData.accessibilityPlan.hasAccessibility ? 'text-emerald-400' : 'text-slate-300'}`}>
                                        Acessibilidade Inclusa
                                    </div>
                                    <div className="text-xs text-slate-500">Este projeto contempla medidas de acessibilidade para PcD.</div>
                                </div>
                            </label>

                            {formData.accessibilityPlan.hasAccessibility && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">Recursos Oferecidos</label>
                                        <div className="flex flex-wrap gap-2">
                                            {ACCESSIBILITY_SERVICES.map(service => (
                                                <button
                                                    key={service.value}
                                                    type="button"
                                                    onClick={() => toggleAccessibilityService(service.value)}
                                                    className={`
                                                        px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                                                        ${formData.accessibilityPlan.services.includes(service.value)
                                                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}
                                                    `}
                                                >
                                                    {service.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <Textarea
                                        label="Detalhamento da Acessibilidade"
                                        rows={3}
                                        value={formData.accessibilityPlan.description}
                                        onChange={e => setFormData({
                                            ...formData,
                                            accessibilityPlan: { ...formData.accessibilityPlan, description: e.target.value }
                                        })}
                                        placeholder="Descreva como os recursos serão implementados..."
                                        className="bg-black/20"
                                    />
                                </div>
                            )}
                        </div>

                        {/* ACCOUNTABILITY FILES */}
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 md:p-8">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <FileText className="text-yellow-400" size={20} /> Prestação de Contas
                            </h3>

                            {formData.attachments && formData.attachments.length > 0 ? (
                                <div className="grid gap-3">
                                    {formData.attachments.map((doc: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center p-4 bg-black/20 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 bg-blue-500/20 rounded-lg text-blue-400">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-200">{doc.name}</div>
                                                    <div className="text-xs text-slate-500">
                                                        Enviado em: {new Date(doc.date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <a
                                                href={doc.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white text-sm font-medium transition-colors"
                                            >
                                                Visualizar
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
                                    <FileText className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                                    <p className="text-slate-400">Nenhum documento anexado pelo produtor ainda.</p>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* RIGHT COLUMN - SIDEBAR */}
                    <div className="space-y-6">

                        {/* STATUS CARD */}
                        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 rounded-3xl p-6 shadow-xl">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
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
                                                    : 'bg-white/5 border-white/5 opacity-50 hover:opacity-100'}
                                            `}
                                        >
                                            <div className={formData.status === opt.value ? opt.color : 'text-slate-400'}>
                                                {opt.icon}
                                            </div>
                                            <span className={`text-sm font-bold ${formData.status === opt.value ? 'text-white' : 'text-slate-400'}`}>
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
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-6">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <DollarSign className="text-green-400" size={20} /> Métricas & Edital
                            </h3>

                            <div className="space-y-4">
                                <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Edital Vinculado</div>
                                    <select
                                        className="w-full bg-transparent text-white font-medium focus:outline-none text-sm"
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
                                    <Input
                                        label="R$ Solicitado"
                                        type="number"
                                        value={formData.requestedBudget}
                                        onChange={e => setFormData({ ...formData, requestedBudget: e.target.value })}
                                        placeholder="0.00"
                                        className="font-mono text-sm"
                                    />
                                    <Input
                                        label="R$ Aprovado"
                                        type="number"
                                        value={formData.approvedBudget}
                                        onChange={e => setFormData({ ...formData, approvedBudget: e.target.value })}
                                        placeholder="0.00"
                                        className="font-mono text-sm border-green-500/30 focus:border-green-500"
                                    />
                                </div>

                                <div className="h-px bg-white/10"></div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Público Previsto"
                                        type="number"
                                        value={formData.expectedAudience}
                                        onChange={e => setFormData({ ...formData, expectedAudience: e.target.value })}
                                        leftIcon={<Users size={14} />}
                                    />
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

                {/* FLOATING ACTION BAR */}
                <div className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none px-4">
                    <div className="max-w-4xl mx-auto bg-[#0f172a] border border-white/10 p-2 pr-3 pl-4 rounded-2xl flex items-center justify-between shadow-2xl pointer-events-auto">
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={() => navigate('/admin/projetos')}
                            className="text-slate-400 hover:text-white px-4 h-12"
                        >
                            Cancelar
                        </Button>
                        <div className="flex items-center gap-3">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="px-8 h-12 rounded-xl font-bold text-base shadow-lg shadow-blue-600/20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none"
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
