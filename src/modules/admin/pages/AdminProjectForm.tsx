import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import {
    LayoutList, Tag, CheckCircle2, AlertCircle, Clock, XCircle,
    Sparkles, TrendingUp, ThumbsUp, ThumbsDown, Info, RefreshCw, Send,
    Download, ShieldCheck, AlertTriangle, ArrowLeft, Save, Users, DollarSign, FileText, Accessibility
} from "lucide-react";
import { useToast } from "../../../contexts/ToastContext";
import { Input, Textarea, Button, Select } from "../../../components/ui";
import "./AdminShared.css";

const STATUS_OPTIONS = [
    { value: "DRAFT", label: "Rascunho", icon: <Clock size={16} />, color: "text-zinc-500", bg: "bg-slate-500/10", border: "border-slate-500/20" },
    { value: "SUBMITTED", label: "Submetido", icon: <CheckCircle2 size={16} />, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { value: "UNDER_REVIEW", label: "Em Análise", icon: <AlertCircle size={16} />, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { value: "APPROVED", label: "Aprovado", icon: <CheckCircle2 size={16} />, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { value: "REJECTED", label: "Rejeitado", icon: <XCircle size={16} />, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    { value: "IN_EXECUTION", label: "Em Execução", icon: <LayoutList size={16} />, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { value: "COMPLETED", label: "Concluído", icon: <CheckCircle2 size={16} />, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    { value: "CANCELED", label: "Cancelado", icon: <XCircle size={16} />, color: "text-zinc-500", bg: "bg-slate-500/10", border: "border-slate-500/20" }
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
    const [analyzing, setAnalyzing] = useState(false);
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
        proponent: null as any,
        attachments: [] as any[],
        accessibilityPlan: {
            hasAccessibility: false,
            services: [] as string[],
            description: ""
        },
        aiAnalysis: null as any,
        aiAnalyzedAt: null as string | null,
        reviewNotes: "",
        humanScore: "",
        reviewedBy: "",
        reviewedAt: null as string | null
    });

    const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

    useEffect(() => {
        if (tenantId) {
            // Fetch Notices
            api.get(`/notices?tenantId=${tenantId}`)
                .then(res => setNotices(res.data))
                .catch(console.error);

            // Fetch Categories (Dynamic)
            api.get(`/categories?tenantId=${tenantId}`)
                .then(res => setCategories(res.data))
                .catch(console.error);
        }

        const fetchProject = () => {
            if (!id || !tenantId) return;
            api.get(`/projects/${id}`)
                .then(res => {
                    const data = res.data;
                    setFormData(prev => ({
                        ...prev,
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
                        proponent: data.proponent,
                        attachments: data.attachments || [],
                        accessibilityPlan: data.accessibilityPlan || {
                            hasAccessibility: false,
                            services: [],
                            description: ""
                        },
                        aiAnalysis: data.aiAnalysis,
                        aiAnalyzedAt: data.aiAnalyzedAt,
                        reviewNotes: data.reviewNotes || "",
                        humanScore: data.humanScore?.toString() || "",
                        reviewedBy: data.reviewedBy || "",
                        reviewedAt: data.reviewedAt
                    }));
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        };

        if (id && tenantId) {
            setLoading(true);
            fetchProject();
        }

        // Polling if AI analysis is missing and project is submitted
        let pollInterval: any;
        if (isEdit) {
            pollInterval = setInterval(() => {
                if (!formData.aiAnalyzedAt && formData.status !== 'DRAFT') {
                    api.get(`/projects/${id}`).then(res => {
                        if (res.data.aiAnalyzedAt) {
                            setFormData(prev => ({
                                ...prev,
                                aiAnalysis: res.data.aiAnalysis,
                                aiAnalyzedAt: res.data.aiAnalyzedAt
                            }));
                            addToast("Análise IA recebida!", "success");
                        }
                    });
                }
            }, 5000);
        }

        return () => clearInterval(pollInterval);
    }, [id, tenantId, isEdit, formData.aiAnalyzedAt, formData.status]);

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

    const handleAnalyzeIA = async () => {
        if (!id) return;
        setAnalyzing(true);
        try {
            const res = await api.post(`/projects/${id}/analyze`);
            setFormData(prev => ({
                ...prev,
                aiAnalysis: res.data,
                aiAnalyzedAt: new Date().toISOString()
            }));
            addToast("Análise IA concluída!", "success");
        } catch (err: any) {
            console.error(err);
            addToast("Falha na análise IA.", "error");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        if (!id) return;
        setSaving(true);
        try {
            await api.put(`/projects/${id}/status`, {
                status: newStatus,
                notes: formData.reviewNotes,
                humanScore: formData.humanScore ? parseFloat(formData.humanScore) : null,
                approvedBudget: formData.approvedBudget ? parseFloat(formData.approvedBudget) : null
            });
            setFormData(prev => ({ ...prev, status: newStatus }));
            addToast(`Status atualizado para ${newStatus}`, "success");
        } catch (err) {
            console.error(err);
            addToast("Erro ao atualizar status.", "error");
        } finally {
            setSaving(false);
        }
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

                        {/* AI ANALYSIS PANEL */}
                        {isEdit && (
                            <div className="admin-section border-l-4 border-purple-500 bg-gradient-to-br from-purple-500/5 to-transparent">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="admin-section-title !mb-0">
                                        <Sparkles style={{ color: "#a78bfa" }} size={20} /> Painel de Análise por IA
                                    </h3>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAnalyzeIA}
                                        isLoading={analyzing}
                                        className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                                        leftIcon={<RefreshCw size={14} />}
                                    >
                                        Re-analisar
                                    </Button>
                                </div>

                                {formData.aiAnalysis ? (
                                    <div className="space-y-8 animate-in fade-in duration-500">
                                        {/* Summary & Recommendation */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="md:col-span-2">
                                                <div className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-2">Resumo da Análise</div>
                                                <p className="text-sm text-[var(--fg-main)] leading-relaxed italic">
                                                    "{formData.aiAnalysis.summary}"
                                                </p>
                                            </div>
                                            <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center
                                                ${formData.aiAnalysis.recommendation === 'APPROVE' ? 'bg-emerald-500/10 border-emerald-500/20' :
                                                    formData.aiAnalysis.recommendation === 'REJECT' ? 'bg-red-500/10 border-red-500/20' :
                                                        'bg-amber-500/10 border-amber-500/20'}
                                            `}>
                                                <div className="text-[10px] font-bold uppercase mb-1 opacity-70">Recomendação IA</div>
                                                <div className={`text-lg font-black tracking-tighter
                                                    ${formData.aiAnalysis.recommendation === 'APPROVE' ? 'text-emerald-400' :
                                                        formData.aiAnalysis.recommendation === 'REJECT' ? 'text-red-400' :
                                                            'text-amber-400'}
                                                `}>
                                                    {formData.aiAnalysis.recommendation === 'APPROVE' ? 'APROVAR' :
                                                        formData.aiAnalysis.recommendation === 'REJECT' ? 'REJEITAR' :
                                                            'REVISAR'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Scores Grid */}
                                        <div>
                                            <div className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-4">Pontuação Técnica</div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                                {Object.entries(formData.aiAnalysis.scores || {}).map(([key, value]: [string, any]) => (
                                                    <div key={key} className="bg-black/20 p-3 rounded-xl border border-white/5 text-center">
                                                        <div className="text-[10px] text-[var(--fg-muted)] uppercase font-bold truncate mb-1">{key}</div>
                                                        <div className="text-xl font-black text-purple-400">{value}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Strengths & Weaknesses */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                                                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase mb-3 text-emerald-400/80">
                                                    <ThumbsUp size={14} /> Pontos Fortes
                                                </div>
                                                <ul className="space-y-2">
                                                    {formData.aiAnalysis.strengths?.map((s: string, i: number) => (
                                                        <li key={i} className="text-xs text-[var(--fg-main)] flex gap-2">
                                                            <span className="text-emerald-500">•</span> {s}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="bg-red-500/5 p-4 rounded-2xl border border-red-500/10">
                                                <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase mb-3 text-red-400/80">
                                                    <ThumbsDown size={14} /> Pontos Críticos
                                                </div>
                                                <ul className="space-y-2">
                                                    {formData.aiAnalysis.weaknesses?.map((w: string, i: number) => (
                                                        <li key={i} className="text-xs text-[var(--fg-main)] flex gap-2">
                                                            <span className="text-red-500">•</span> {w}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Requirements Checklist */}
                                        {formData.aiAnalysis.requirementsCheck && (
                                            <div>
                                                <div className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-3">Checklist do Edital</div>
                                                <div className="space-y-2">
                                                    {formData.aiAnalysis.requirementsCheck.map((req: any, i: number) => (
                                                        <div key={i} className="flex items-start gap-3 p-3 bg-black/10 rounded-xl border border-white/5">
                                                            {req.met ? <CheckCircle2 size={16} className="text-emerald-400 mt-0.5" /> : <AlertTriangle size={16} className="text-red-400 mt-0.5" />}
                                                            <div>
                                                                <div className="text-xs font-bold text-[var(--fg-main)]">{req.requirement}</div>
                                                                <div className="text-[10px] text-[var(--fg-muted)]">{req.justification}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="text-[10px] text-[var(--fg-muted)] italic text-right">
                                            Analisado automaticamente em {new Date(formData.aiAnalyzedAt!).toLocaleString()}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-12 flex flex-col items-center justify-center text-center opacity-60">
                                        <Sparkles size={48} className="text-purple-500/30 mb-4" />
                                        <p className="text-sm max-w-xs">Nenhuma análise automática gerada ainda ou projeto pendente de submissão.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* HUMAN REVIEW PANEL */}
                        {isEdit && (
                            <div className="admin-section border-l-4 border-blue-500 shadow-xl">
                                <h3 className="admin-section-title">
                                    <ShieldCheck style={{ color: "#60a5fa" }} size={20} /> Avaliação Humana (Parecer)
                                </h3>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div className="md:col-span-2">
                                            <div className="form-group">
                                                <Textarea
                                                    label="Observações da Revisão"
                                                    rows={4}
                                                    value={formData.reviewNotes}
                                                    onChange={e => setFormData({ ...formData, reviewNotes: e.target.value })}
                                                    placeholder="Descreva os motivos da decisão ou ações necessárias..."
                                                    className="bg-black/20 border-[#463420] text-[#EAE0D5] text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-1">
                                            <div className="form-group">
                                                <Input
                                                    label="Nota Humana (0-100)"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={formData.humanScore}
                                                    onChange={e => setFormData({ ...formData, humanScore: e.target.value })}
                                                    placeholder="0-100"
                                                    className="h-24 text-4xl text-center font-black text-blue-400 bg-blue-500/5 border-blue-500/20"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-1">
                                            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center h-full">
                                                <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Score Final Previsto</div>
                                                <div className="text-4xl font-black text-white">
                                                    {(() => {
                                                        const aiScores = formData.aiAnalysis?.scores || {};
                                                        const aiVals = Object.values(aiScores) as number[];
                                                        const aiAvg = aiVals.length > 0 ? aiVals.reduce((a, b) => a + b, 0) / aiVals.length : 0;
                                                        const hScore = formData.humanScore ? parseFloat(formData.humanScore) : 0;

                                                        if (aiAvg > 0 && hScore > 0) return ((aiAvg + hScore) / 2).toFixed(1);
                                                        if (aiAvg > 0) return aiAvg.toFixed(1);
                                                        if (hScore > 0) return hScore.toFixed(1);
                                                        return "0.0";
                                                    })()}
                                                </div>
                                                <div className="text-[9px] text-zinc-600 mt-1 italic">(Média IA + Humana)</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => handleUpdateStatus('UNDER_REVIEW')}
                                            disabled={saving}
                                            className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10 font-bold"
                                            leftIcon={<RefreshCw size={16} />}
                                        >
                                            Pedir Revisão
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => handleUpdateStatus('REJECTED')}
                                            disabled={saving}
                                            className="border-red-500/50 text-red-500 hover:bg-red-500/10 font-bold"
                                            leftIcon={<XCircle size={16} />}
                                        >
                                            Reprovar
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => handleUpdateStatus('APPROVED')}
                                            disabled={saving}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                            leftIcon={<CheckCircle2 size={16} />}
                                        >
                                            Aprovar Projeto
                                        </Button>
                                    </div>

                                    {formData.reviewedAt && (
                                        <div className="text-[10px] text-[var(--fg-muted)] italic text-right flex items-center justify-end gap-2">
                                            <Info size={10} /> Última avaliação por {formData.reviewedBy || 'Admin'} em {new Date(formData.reviewedAt).toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* RIGHT COLUMN - SIDEBAR */}
                    <div className="space-y-6">

                        {/* PROPONENT CARD */}
                        <div className="admin-section shadow-xl">
                            <h3 className="admin-section-title">
                                <Users className="text-[var(--accent-gold)]" size={20} /> Proponente
                            </h3>
                            {formData.proponent ? (
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center border border-gold/30 text-gold font-bold text-xl overflow-hidden">
                                        {formData.proponent.image ? (
                                            <img src={formData.proponent.image} alt={formData.proponent.name} className="w-full h-full object-cover" />
                                        ) : (
                                            formData.proponent.name?.charAt(0)
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-white font-bold truncate">{formData.proponent.name}</div>
                                        <div className="text-[10px] text-zinc-500 truncate">{formData.proponent.email}</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-zinc-500 italic">Carregando dados do proponente...</div>
                            )}
                        </div>

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
                                                <div className="ml-auto w-2 h-2 rounded-full bg-zinc-900/40 animate-pulse"></div>
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

