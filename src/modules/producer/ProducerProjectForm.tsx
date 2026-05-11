import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../api/client";
import { useAuth } from "../auth/AuthContext";
import {
    ArrowLeft, Save, FileText, Send, Upload, Trash2, Download, Paperclip,
    Trophy, Rocket, AlertCircle, CheckCircle2, History, Banknote,
    Accessibility, Calendar, ListChecks, Info, Wand2, Sparkles, Calculator,
    Share2, QrCode, ExternalLink, X, Ticket
} from "lucide-react";
import { useToast } from "../../contexts/ToastContext";
import { Button, Input, Textarea } from "../../components/ui";

type AccountabilityDoc = {
    name: string;
    url: string;
    date: string;
};

// Gamified Status Styles - Gold Theme Adapted
const STATUS_STYLES = {
    DRAFT: { label: "Rascunho", bg: "bg-gray-500/10", text: "text-gray-400", border: "border-gray-500/20", icon: <History size={16} /> },
    SUBMITTED: { label: "Submetido", bg: "bg-[var(--accent-primary)]/10", text: "text-blue-400", border: "border-blue-500/20", icon: <Send size={16} /> },
    UNDER_REVIEW: { label: "Em Análise", bg: "bg-[var(--accent-primary)]/10", text: "text-[var(--accent-primary)]", border: "border-[var(--accent-primary)]/20", icon: <AlertCircle size={16} /> },
    APPROVED: { label: "Aprovado!", bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20", icon: <Trophy size={16} /> },
    REJECTED: { label: "Não Aprovado", bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", icon: <AlertCircle size={16} /> },
    IN_EXECUTION: { label: "Em Execução", bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20", icon: <Rocket size={16} /> },
    COMPLETED: { label: "Finalizado", bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20", icon: <CheckCircle2 size={16} /> },
};

export const ProducerProjectForm: React.FC = () => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<"DETAILS" | "ACCESSIBILITY" | "ACCOUNTABILITY">("DETAILS");
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        summary: "",
        description: "",
        justification: "",
        culturalCategory: "",
        targetRegion: "",
        requestedBudget: "",
        expectedAudience: "",
        startDate: "",
        endDate: "",
        noticeId: searchParams.get("noticeId") || "",
        status: "DRAFT" as keyof typeof STATUS_STYLES,
        attachments: [] as AccountabilityDoc[],
        accessibilityPlan: {
            hasPlan: false,
            services: [] as string[],
            description: ""
        },
        reviewNotes: "",
        reviewedAt: null as string | null,
        eventId: null as string | null
    });

    const [showShareModal, setShowShareModal] = useState(false);
    const [publishedEventData, setPublishedEventData] = useState<any>(null);
    const [notice, setNotice] = useState<any>(null);

    useEffect(() => {
        if (id) {
            setLoading(true);
            api.get(`/projects/${id}`).then(res => {
                const data = res.data;
                setFormData({
                    title: data.title || "",
                    summary: data.summary || "",
                    description: data.description || "",
                    justification: data.justification || "",
                    culturalCategory: data.culturalCategory || "",
                    targetRegion: data.targetRegion || "",
                    requestedBudget: data.requestedBudget || "",
                    expectedAudience: data.expectedAudience || "",
                    startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : "",
                    endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : "",
                    noticeId: data.noticeId || "",
                    status: data.status,
                    attachments: data.attachments || [],
                    accessibilityPlan: data.accessibilityPlan || { hasPlan: false, services: [], description: "" },
                    reviewNotes: data.reviewNotes || "",
                    reviewedAt: data.reviewedAt
                });

                if (data.noticeId) {
                    api.get(`/notices/public/${data.noticeId}`).then(nRes => setNotice(nRes.data)).catch(console.error);
                }
            }).finally(() => setLoading(false));

            if (searchParams.get("tab") === "accountability") {
                setActiveTab("ACCOUNTABILITY");
            }
        } else if (searchParams.get("noticeId")) {
            api.get(`/notices/public/${searchParams.get("noticeId")}`).then(nRes => setNotice(nRes.data)).catch(console.error);
        }
    }, [id, searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!tenantId) return;
        setSaving(true);
        try {
            const payload = {
                ...formData,
                tenantId,
                requestedBudget: formData.requestedBudget ? parseFloat(String(formData.requestedBudget)) : null,
                expectedAudience: formData.expectedAudience ? parseInt(String(formData.expectedAudience)) : null,
            };

            if (isEdit) {
                await api.put(`/projects/${id}`, payload);
            } else {
                const res = await api.post("/projects", payload);
                if (res.data.id) navigate(`/producer/projects/${res.data.id}`);
            }

            addToast("Salvo com sucesso!", "success");
        } catch (err: any) {
            console.error(err);
            addToast("Erro ao salvar.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleAiAssist = async (field: "summary" | "description" | "justification") => {
        if (!formData.title) {
            addToast("Dê um título ao projeto para que a IA possa entender o contexto.", "warning");
            return;
        }

        setSaving(true);
        try {
            const res = await api.post("/ai/refine-proposal", {
                field,
                projectTitle: formData.title,
                projectCurrentText: formData[field],
                noticeObjectives: notice?.objectives,
                noticeRequirements: notice?.requirements
            });

            if (res.data.response) {
                setFormData(prev => ({ ...prev, [field]: res.data.response }));
                addToast("Texto refinado pela IA!", "success");
            }
        } catch (err) {
            addToast("O assistente de IA está ocupado agora. Tente novamente em breve.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleSubmitProject = async () => {
        if (!id) return;

        // Budget Validation
        if (notice && notice.maxPerProject && formData.requestedBudget) {
            if (parseFloat(String(formData.requestedBudget)) > parseFloat(String(notice.maxPerProject))) {
                addToast(`O valor solicitado (R$ ${formData.requestedBudget}) excede o teto permitido pelo edital (R$ ${notice.maxPerProject}).`, "error");
                return;
            }
        }

        if (!window.confirm("Após enviar, não será possível editar a proposta. Confirmar?")) return;
        try {
            await api.post(`/projects/${id}/submit`);
            addToast("Projeto submetido com sucesso!", "success");
            setFormData(prev => ({ ...prev, status: "SUBMITTED" }));
        } catch (err: any) {
            console.error(err);
            addToast(err.response?.data?.message || "Erro ao submeter projeto.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handlePublish = async () => {
        if (!id) return;
        if (!window.confirm("Isso tornará o projeto um evento público na Agenda Cultural. Confirmar?")) return;

        setSaving(true);
        try {
            const res = await api.post(`/projects/${id}/publish-event`);
            addToast("Publicado na agenda com sucesso!", "success");
            setPublishedEventData(res.data);
            setShowShareModal(true);
            setFormData(prev => ({ ...prev, status: "IN_EXECUTION", eventId: res.data.eventId }));
        } catch (err: any) {
            addToast("Erro ao publicar.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | File) => {
        const file = e instanceof File ? e : e.target.files?.[0];
        if (file) {
            setUploading(true);
            const uploadData = new FormData();
            uploadData.append("file", file);

            try {
                let type = "document";
                if (file.type.startsWith("image/")) type = "image";

                const res = await api.post(`/upload/${type}`, uploadData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });

                const newDoc: AccountabilityDoc = {
                    name: file.name,
                    url: res.data.url,
                    date: new Date().toISOString()
                };

                setFormData(prev => ({
                    ...prev,
                    attachments: [...prev.attachments, newDoc]
                }));

                addToast("Arquivo anexado!", "success");
            } catch (err) {
                addToast("Erro no upload.", "error");
            } finally {
                setUploading(false);
            }
        }
    };

    // Drag and Drop
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const removeAttachment = (index: number) => {
        const newAttachments = [...formData.attachments];
        newAttachments.splice(index, 1);
        setFormData({ ...formData, attachments: newAttachments });
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-[#1a1108]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)]"></div>
        </div>
    );

    const readOnly = formData.status !== 'DRAFT' && isEdit && activeTab === "DETAILS";
    const accountabilityEditable = ["APPROVED", "IN_EXECUTION", "COMPLETED"].includes(formData.status);
    const statusInfo = STATUS_STYLES[formData.status] || STATUS_STYLES.DRAFT;

    return (
        <div className="min-h-screen bg-[#1a1108] text-[#EAE0D5] p-6 md:p-12 animate-in fade-in duration-500">

            {/* HEADER WITH GAMIFIED STATUS */}
            <div className="max-w-5xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/producer/projects')}
                        className="w-10 h-10 p-0 rounded-full bg-[#2c1e10] hover:bg-[var(--accent-primary)]/10 text-[#B0A090] border border-[#463420]"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-[#EAE0D5] font-serif tracking-tight">
                            {isEdit ? "Gestão do Projeto" : "Nova Proposta"}
                        </h1>
                        <p className="text-[#B0A090]">
                            {formData.title || "Rascunho sem título"}
                        </p>
                    </div>
                </div>

                <div className={`
                    px-6 py-3 rounded-2xl border flex items-center gap-3 shadow-lg backdrop-blur-md
                    ${statusInfo.bg} ${statusInfo.border}
                `}>
                    <div className={`p-2 rounded-full bg-black/10 ${statusInfo.text}`}>
                        {statusInfo.icon}
                    </div>
                    <div>
                        <div className="text-xs font-bold opacity-70 uppercase tracking-wider">Status Atual</div>
                        <div className={`font-bold text-lg ${statusInfo.text}`}>
                            {statusInfo.label}
                        </div>
                    </div>
                </div>
            </div>

            {/* NOTICE BANNER */}
            {notice && (
                <div className="max-w-5xl mx-auto mb-8 bg-gradient-to-r from-[var(--accent-primary)]/20 to-transparent border border-[var(--accent-primary)]/30 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[var(--accent-primary)] rounded-2xl flex items-center justify-center text-[#1a1108]">
                            <FileText size={24} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-[var(--accent-primary)] uppercase tracking-widest mb-1">{t("producer.producerproject.inscrioVinculada", `Inscrição Vinculada`)}</div>
                            <h2 className="text-xl font-bold text-[#EAE0D5]">{notice.title}</h2>
                            <div className="flex flex-wrap gap-4 mt-1 text-sm text-[#B0A090]">
                                <span className="flex items-center gap-1"><Calendar size={14} /> Fim: {new Date(notice.inscriptionEnd).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1"><Banknote size={14} /> Máx: R$ {Number(notice.maxPerProject).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    {notice.documentUrl && (
                        <a
                            href={notice.documentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-[#EAE0D5] rounded-xl border border-white/10 transition-all text-sm font-bold"
                        >
                            <Download size={16} /> Baixar Edital (PDF)
                        </a>
                    )}
                </div>
            )}

            {/* REVIEW NOTES FROM ADMIN */}
            {isEdit && formData.reviewNotes && formData.status !== 'DRAFT' && (
                <div className="max-w-5xl mx-auto mb-8 bg-[var(--accent-primary)]/10 border border-blue-500/20 rounded-3xl p-6 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-blue-400 font-bold">
                        <Info size={18} /> Parecer da Avaliação
                    </div>
                    <p className="text-blue-200 text-sm italic leading-relaxed">
                        "{formData.reviewNotes}"
                    </p>
                    {formData.reviewedAt && (
                        <div className="text-[10px] text-blue-400/60 text-right uppercase tracking-wider font-bold">
                            Avaliado em {new Date(formData.reviewedAt).toLocaleDateString()}
                        </div>
                    )}
                </div>
            )}

            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* SIDEBAR NAVIGATION */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-[#2c1e10] rounded-2xl p-2 border border-[#463420]">
                        <button
                            onClick={() => setActiveTab("DETAILS")}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium text-sm mb-1 ${activeTab === "DETAILS" ? "bg-[var(--accent-primary)] text-black shadow-lg shadow-[var(--accent-primary)]/20 font-bold" : "text-[#B0A090] hover:bg-black/20"}`}
                        >
                            <FileText size={18} /> Detalhes
                        </button>
                        <button
                            onClick={() => setActiveTab("ACCESSIBILITY")}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium text-sm mb-1 ${activeTab === "ACCESSIBILITY" ? "bg-[var(--accent-primary)] text-black shadow-lg shadow-[var(--accent-primary)]/20 font-bold" : "text-[#B0A090] hover:bg-black/20"}`}
                        >
                            <Accessibility size={18} /> Acessibilidade
                        </button>
                        <button
                            onClick={() => setActiveTab("ACCOUNTABILITY")}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium text-sm ${activeTab === "ACCOUNTABILITY" ? "bg-[var(--accent-primary)] text-black shadow-lg shadow-[var(--accent-primary)]/20 font-bold" : "text-[#B0A090] hover:bg-black/20"}`}
                        >
                            <Banknote size={18} /> Prestação de Contas
                        </button>
                    </div>

                    {/* SUBMISSION CHECKLIST */}
                    <div className="bg-[#2c1e10]/50 rounded-2xl p-5 border border-[#463420] backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-[#EAE0D5] font-bold text-sm mb-4">
                            <ListChecks size={16} className="text-[var(--accent-primary)]" /> Checklist de Envio
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-xs">
                                {formData.title ? <CheckCircle2 size={14} className="text-emerald-500" /> : <div className="w-3.5 h-3.5 rounded-full border border-[#463420]" />}
                                <span className={formData.title ? "text-[#EAE0D5]" : "text-[#B0A090]"}>Título do Projeto</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                {formData.description.length > 50 ? <CheckCircle2 size={14} className="text-emerald-500" /> : <div className="w-3.5 h-3.5 rounded-full border border-[#463420]" />}
                                <span className={formData.description.length > 50 ? "text-[#EAE0D5]" : "text-[#B0A090]"}>Descrição Detalhada</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                {formData.requestedBudget ? <CheckCircle2 size={14} className="text-emerald-500" /> : <div className="w-3.5 h-3.5 rounded-full border border-[#463420]" />}
                                <span className={formData.requestedBudget ? "text-[#EAE0D5]" : "text-[#B0A090]"}>Orçamento Definido</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                {formData.accessibilityPlan.hasPlan ? <CheckCircle2 size={14} className="text-emerald-500" /> : <div className="w-3.5 h-3.5 rounded-full border border-[#463420]" />}
                                <span className={formData.accessibilityPlan.hasPlan ? "text-[#EAE0D5]" : "text-[#B0A090]"}>Plano de Acessibilidade</span>
                            </div>
                        </div>
                    </div>

                    {/* TIPS CARD */}
                    <div className="bg-gradient-to-br from-[#2c1e10] to-[#1a1108] rounded-2xl p-5 border border-[#463420]">
                        <div className="flex items-center gap-2 text-[var(--accent-primary)] font-bold text-sm mb-3">
                            <Sparkles size={16} /> Dica de Ouro
                        </div>
                        <p className="text-xs text-[#B0A090] leading-relaxed">
                            Use o <strong>Ajudante IA</strong> nos campos de descrição para alinhar seu texto automaticamente com os objetivos deste edital.
                        </p>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="lg:col-span-3">

                    {activeTab === "DETAILS" ? (
                        <div className="bg-[#2c1e10] border border-[#463420] rounded-3xl p-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            {readOnly && (
                                <div className="mb-6 bg-[var(--accent-primary)]/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 text-blue-300 text-sm">
                                    <AlertCircle size={20} className="shrink-0" />
                                    Este projeto já foi submetido. Edições estão restritas. {formData.status === 'REJECTED' && "Caso deseje realizar ajustes, entre em contato com a organização."}
                                </div>
                            )}

                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="md:col-span-2">
                                        <Input
                                            label={t("producer.producerproject.ttuloDoProjeto", `Título do Projeto`)}
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            disabled={readOnly}
                                            required
                                            className="h-12 bg-black/20 border-[#463420] text-[#EAE0D5] focus:border-[var(--accent-primary)] text-lg font-bold"
                                        />
                                    </div>

                                    {notice && (
                                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 bg-[var(--accent-primary)]/5 rounded-2xl border border-[var(--accent-primary)]/10">
                                                <div className="flex items-center gap-2 text-[var(--accent-primary)] font-bold text-[10px] uppercase mb-2 tracking-wider">
                                                    <Info size={12} /> Objetivos do Edital
                                                </div>
                                                <div className="text-xs text-[#B0A090] leading-relaxed line-clamp-4">{notice.objectives || 'Não informados'}</div>
                                            </div>
                                            <div className="p-4 bg-[var(--accent-primary)]/5 rounded-2xl border border-[var(--accent-primary)]/10">
                                                <div className="flex items-center gap-2 text-[var(--accent-primary)] font-bold text-[10px] uppercase mb-2 tracking-wider">
                                                    <ListChecks size={12} /> Requisitos do Edital
                                                </div>
                                                <div className="text-xs text-[#B0A090] leading-relaxed line-clamp-4">{notice.requirements || 'Não informados'}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label={t("producer.producerproject.oramentoR", `Orçamento (R$)`)}
                                        type="number"
                                        name="requestedBudget"
                                        value={formData.requestedBudget}
                                        onChange={handleChange}
                                        disabled={readOnly}
                                        leftIcon={<span className="text-[var(--accent-primary)] font-bold">$</span>}
                                        className="bg-black/20 border-[#463420] text-[#EAE0D5] focus:border-[var(--accent-primary)] font-mono"
                                    />
                                    <Input
                                        label={t("producer.producerproject.pblicoEstimado", `Público Estimado`)}
                                        type="number"
                                        name="expectedAudience"
                                        value={formData.expectedAudience}
                                        onChange={handleChange}
                                        disabled={readOnly}
                                        className="bg-black/20 border-[#463420] text-[#EAE0D5] focus:border-[var(--accent-primary)]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-bold text-[#B0A090]">Resumo (Pitch de Elevador)</label>
                                        {!readOnly && (
                                            <button 
                                                onClick={() => handleAiAssist("summary")}
                                                className="text-[10px] flex items-center gap-1 text-[var(--accent-primary)] hover:opacity-80 font-bold uppercase"
                                                disabled={saving}
                                            >
                                                <Wand2 size={12} /> Ajudante IA
                                            </button>
                                        )}
                                    </div>
                                    <Textarea
                                        name="summary"
                                        value={formData.summary}
                                        onChange={handleChange}
                                        rows={3}
                                        maxLength={200}
                                        disabled={readOnly}
                                        className="bg-black/20 border-[#463420] text-[#EAE0D5] text-sm focus:border-[var(--accent-primary)]"
                                        placeholder={t("producer.producerproject.vendaSeuPeixeEmAt200Caracteres", `Venda seu peixe em até 200 caracteres...`)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-bold text-[#B0A090]">{t("producer.producerproject.descrioCompleta", `Descrição Completa`)}</label>
                                        {!readOnly && (
                                            <button 
                                                onClick={() => handleAiAssist("description")}
                                                className="text-[10px] flex items-center gap-1 text-[var(--accent-primary)] hover:opacity-80 font-bold uppercase"
                                                disabled={saving}
                                            >
                                                <Wand2 size={12} /> Ajudante IA
                                            </button>
                                        )}
                                    </div>
                                    <Textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={8}
                                        disabled={readOnly}
                                        className="bg-black/20 border-[#463420] text-[#EAE0D5] text-sm focus:border-[var(--accent-primary)]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-bold text-[#B0A090]">Justificativa</label>
                                        {!readOnly && (
                                            <button 
                                                onClick={() => handleAiAssist("justification")}
                                                className="text-[10px] flex items-center gap-1 text-[var(--accent-primary)] hover:opacity-80 font-bold uppercase"
                                                disabled={saving}
                                            >
                                                <Wand2 size={12} /> Ajudante IA
                                            </button>
                                        )}
                                    </div>
                                    <Textarea
                                        name="justification"
                                        value={formData.justification}
                                        onChange={handleChange}
                                        rows={5}
                                        disabled={readOnly}
                                        placeholder="Por que este projeto deve receber o recurso?"
                                        className="bg-black/20 border-[#463420] text-[#EAE0D5] text-sm focus:border-[var(--accent-primary)]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label={t("producer.producerproject.dataDeIncio", `Data de Início`)}
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        disabled={readOnly}
                                        className="bg-black/20 border-[#463420] text-[#EAE0D5] focus:border-[var(--accent-primary)]"
                                    />
                                    <Input
                                        label={t("producer.producerproject.dataDeTrmino", `Data de Término`)}
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        disabled={readOnly}
                                        className="bg-black/20 border-[#463420] text-[#EAE0D5] focus:border-[var(--accent-primary)]"
                                    />
                                </div>

                                {!readOnly && (
                                    <div className="pt-6 flex flex-col md:flex-row justify-end gap-3 border-t border-[#463420]">
                                        {isEdit && formData.status === "DRAFT" && (
                                            <Button
                                                onClick={handleSubmitProject}
                                                isLoading={submitting}
                                                className="bg-[var(--accent-primary)] hover:bg-blue-700 text-white px-8 font-bold"
                                                leftIcon={<Send size={18} />}
                                            >
                                                Submeter ao Edital
                                            </Button>
                                        )}
                                        {isEdit && formData.status === "APPROVED" && (
                                            <Button
                                                onClick={handlePublish}
                                                disabled={saving}
                                                variant="outline"
                                                className="border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10"
                                                leftIcon={<Rocket size={16} />}
                                            >
                                                Ativar e Publicar na Agenda
                                            </Button>
                                        )}
                                        <Button
                                            onClick={() => handleSave()}
                                            isLoading={saving}
                                            className="bg-[var(--accent-primary)] text-[#1a1108] hover:bg-[#c5a028] px-8 font-bold"
                                            leftIcon={<Save size={18} />}
                                        >
                                            {isEdit ? "Salvar Alterações" : "Criar Proposta"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : activeTab === "ACCESSIBILITY" ? (
                        <div className="bg-[#2c1e10] border border-[#463420] rounded-3xl p-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 rounded-2xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                                    <Accessibility size={28} />
                                </div>
                                <div>
                                    <p className="text-[#EAE0D5] font-bold">Acessibilidade</p>
                                    <p className="text-[#B0A090] text-sm">{t("producer.producerproject.recursosParaGarantirAInclusoDeTodosOsPbl", `Recursos para garantir a inclusão de todos os públicos`)}</p>
                                </div>
                            </div>

                            {notice?.requiresAccessibilityPlan && (
                                <div className="mb-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex gap-4 text-orange-200 text-sm">
                                    <AlertCircle size={20} className="shrink-0" />
                                    <div>
                                        <span className="font-bold block mb-1">Obrigatoriedade do Edital</span>
                                        Este edital exige a apresentação de um plano de acessibilidade para submissão.
                                    </div>
                                </div>
                            )}

                            <div className="space-y-8">
                                <div className="flex items-center justify-between p-6 bg-black/20 rounded-2xl border border-[#463420]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center text-blue-400">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-[#EAE0D5]">{t("producer.producerproject.aesDeAcessibilidade", `Ações de Acessibilidade`)}</div>
                                            <div className="text-xs text-[#B0A090]">O projeto contempla recursos para PcD?</div>
                                        </div>
                                    </div>
                                    <button
                                        disabled={readOnly}
                                        onClick={() => setFormData({
                                            ...formData,
                                            accessibilityPlan: {
                                                ...formData.accessibilityPlan,
                                                hasPlan: !formData.accessibilityPlan.hasPlan
                                            }
                                        })}
                                        className={`
                                                w-14 h-8 rounded-full transition-all relative
                                                ${formData.accessibilityPlan.hasPlan ? 'bg-[var(--accent-primary)]' : 'bg-[#463420]'}
                                            `}
                                    >
                                        <div className={`
                                                absolute top-1 w-6 h-6 rounded-full bg-white transition-all
                                                ${formData.accessibilityPlan.hasPlan ? 'left-7' : 'left-1'}
                                            `} />
                                    </button>
                                </div>

                                {formData.accessibilityPlan.hasPlan && (
                                    <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                                        <div>
                                            <label className="text-sm font-bold text-[#B0A090] mb-4 block">{t("producer.producerproject.serviosOferecidos", `Serviços Oferecidos`)}</label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {[
                                                    { id: "LIBRAS", label: "Intérprete de Libras" },
                                                    { id: "AUDIO_DESCRIPTION", label: "Audiodescrição" },
                                                    { id: "CAPTIONING", label: "Legendagem" },
                                                    { id: "BRAILLE", label: "Braille" },
                                                    { id: "TACTILE", label: "Maquetes Táteis" },
                                                    { id: "EASY_READ", label: "Leitura Fácil" }
                                                ].map(service => (
                                                    <button
                                                        key={service.id}
                                                        disabled={readOnly}
                                                        onClick={() => {
                                                            const services = formData.accessibilityPlan.services.includes(service.id)
                                                                ? formData.accessibilityPlan.services.filter(s => s !== service.id)
                                                                : [...formData.accessibilityPlan.services, service.id];
                                                            setFormData({
                                                                ...formData,
                                                                accessibilityPlan: { ...formData.accessibilityPlan, services }
                                                            });
                                                        }}
                                                        className={`
                                                                flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-bold transition-all
                                                                ${formData.accessibilityPlan.services.includes(service.id)
                                                                ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)] text-[var(--accent-primary)]'
                                                                : 'bg-black/20 border-[#463420] text-[#B0A090] hover:border-[var(--accent-primary)]/30'}
                                                            `}
                                                    >
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.accessibilityPlan.services.includes(service.id) ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]' : 'border-[#463420]'}`}>
                                                            {formData.accessibilityPlan.services.includes(service.id) && <CheckCircle2 size={12} className="text-[#1a1108]" />}
                                                        </div>
                                                        {service.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <Textarea
                                            label={t("producer.producerproject.descrioDaImplementao", `Descrição da Implementação`)}
                                            placeholder={t("producer.producerproject.descrevaDetalhadamenteComoOsRecursosDeAc", `Descreva detalhadamente como os recursos de acessibilidade serão garantidos...`)}
                                            value={formData.accessibilityPlan.description}
                                            disabled={readOnly}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                accessibilityPlan: { ...formData.accessibilityPlan, description: e.target.value }
                                            })}
                                            rows={5}
                                            className="bg-black/20 border-[#463420] text-[#EAE0D5] text-sm focus:border-[var(--accent-primary)]"
                                        />
                                    </div>
                                )}

                                {!readOnly && (
                                    <div className="pt-6 flex justify-end gap-3 border-t border-[#463420]">
                                        <Button
                                            onClick={() => handleSave()}
                                            isLoading={saving}
                                            className="bg-[var(--accent-primary)] text-[#1a1108] hover:bg-[#c5a028] px-8 font-bold"
                                            leftIcon={<Save size={18} />}
                                        >
                                            Salvar Acessibilidade
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

                            {/* UPLOAD AREA */}
                            <div className="bg-[#2c1e10] border border-[#463420] rounded-3xl p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-[#EAE0D5] flex items-center gap-2">
                                        <Banknote className="text-[var(--accent-primary)]" size={24} /> Comprovantes
                                    </h2>
                                    <div className="text-xs font-mono text-[#B0A090] bg-black/30 px-3 py-1 rounded-full">
                                        {formData.attachments.length} arquivos
                                    </div>
                                </div>

                                {!accountabilityEditable ? (
                                    <div className="bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 rounded-xl p-6 text-center">
                                        <div className="w-12 h-12 bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] rounded-full flex items-center justify-center mx-auto mb-3">
                                            <AlertCircle size={24} />
                                        </div>
                                        <h3 className="text-[var(--accent-primary)] font-bold mb-1">{t("producer.producerproject.aguardandoAprovao", `Aguardando Aprovação`)}</h3>
                                        <p className="text-[var(--accent-primary)]/70 text-sm">{t("producer.producerproject.aPrestaoDeContasSerLiberadaAssimQueOProj", `
                                            A prestação de contas será liberada assim que o projeto for aprovado ou entrar em execução.
                                        `)}</p>
                                    </div>
                                ) : (
                                    <div
                                        className={`
                                            border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer relative overflow-hidden group
                                            ${dragActive ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 scale-[1.02]' : 'border-[#463420] hover:border-[var(--accent-primary)]/50 hover:bg-black/20'}
                                        `}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            onChange={handleFileUpload}
                                            disabled={uploading}
                                            accept="image/*,.pdf"
                                        />

                                        <div className="relative z-0 pointer-events-none transition-transform group-hover:-translate-y-2">
                                            <div className="w-16 h-16 bg-gradient-to-br from-[var(--accent-primary)] to-[#b39025] rounded-2xl shadow-2xl shadow-[var(--accent-primary)]/20 mx-auto mb-4 flex items-center justify-center">
                                                {uploading ? <div className="animate-spin border-2 border-white border-t-transparent rounded-full w-8 h-8" /> : <Upload className="text-[#1a1108]" size={32} />}
                                            </div>
                                            <h3 className="text-lg font-bold text-[#EAE0D5] mb-1">
                                                {uploading ? 'Enviando...' : 'Arraste arquivos aqui'}
                                            </h3>
                                            <p className="text-[#B0A090] text-sm">
                                                ou clique para selecionar (PDF, Imagens)
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* FILE LIST */}
                            {formData.attachments.length > 0 && (
                                <div className="grid gap-3">
                                    {formData.attachments.map((doc, idx) => (
                                        <div key={idx} className="group flex items-center justify-between p-4 bg-[#2c1e10] border border-[#463420] rounded-2xl hover:border-[var(--accent-primary)]/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center text-[#B0A090]">
                                                    <Paperclip size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-[#EAE0D5] text-sm">{doc.name}</div>
                                                    <div className="text-xs text-[#B0A090] font-mono">
                                                        {new Date(doc.date).toLocaleDateString()} • {new Date(doc.date).toLocaleTimeString().slice(0, 5)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-2 hover:bg-white/10 rounded-lg text-[#B0A090] transition-colors"
                                                    title="Baixar"
                                                >
                                                    <Download size={18} />
                                                </a>
                                                {accountabilityEditable && (
                                                    <button
                                                        onClick={() => removeAttachment(idx)}
                                                        className="p-2 hover:bg-red-500/10 text-[#B0A090] hover:text-red-400 rounded-lg transition-colors"
                                                        title="Remover"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {accountabilityEditable && (
                                <div className="flex justify-end pt-4">
                                    <Button
                                        onClick={() => handleSave()}
                                        isLoading={saving}
                                        disabled={uploading}
                                        className="bg-[var(--accent-primary)] hover:bg-[#c5a028] text-[#1a1108] font-bold px-8 rounded-xl shadow-lg shadow-[var(--accent-primary)]/20 border-none"
                                        leftIcon={<Save size={18} />}
                                    >
                                        Salvar Documentos
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* SHARE & ACTIVATE HUB MODAL */}
            {showShareModal && publishedEventData && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#2c1e10] border border-[var(--accent-primary)]/40 rounded-[40px] max-w-lg w-full p-8 shadow-2xl shadow-[var(--accent-primary)]/10 relative overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute -right-12 -top-12 text-[var(--accent-primary)] opacity-5 rotate-12">
                            <Rocket size={240} />
                        </div>

                        <button 
                            onClick={() => setShowShareModal(false)}
                            className="absolute right-6 top-6 p-2 hover:bg-white/5 rounded-full text-[#B0A090] transition-all"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center mb-8 relative z-10">
                            <div className="w-20 h-20 bg-gradient-to-br from-[var(--accent-primary)] to-[#b39025] rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[var(--accent-primary)]/20">
                                <Rocket className="text-[#1a1108]" size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-[#EAE0D5] font-serif mb-2">Evento Ativado!</h2>
                            <p className="text-[#B0A090] text-sm">Seu projeto agora faz parte da Agenda Cultural oficial da cidade.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 mb-8 relative z-10">
                            {/* QR CODE PREVIEW */}
                            <div className="bg-black/30 rounded-3xl p-6 flex items-center gap-6 border border-[#463420]">
                                <div className="bg-white p-2 rounded-xl shrink-0">
                                    {/* Mock QR Code for Demo - In production we'd use a real lib or Google Charts API */}
                                    <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://cultura.viva/events/${publishedEventData.eventId}`} 
                                        alt="QR Code" 
                                        className="w-20 h-20"
                                    />
                                </div>
                                <div>
                                    <h4 className="text-[#EAE0D5] font-bold text-sm mb-1">Seu QR Code de Divulgação</h4>
                                    <p className="text-[10px] text-[#B0A090] mb-3 uppercase font-bold tracking-wider">Acesso rápido para visitantes</p>
                                    <button 
                                        className="text-xs text-[var(--accent-primary)] font-bold flex items-center gap-1 hover:underline"
                                        onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=https://cultura.viva/events/${publishedEventData.eventId}`, '_blank')}
                                    >
                                        <Download size={14} /> Baixar em Alta Resolução
                                    </button>
                                </div>
                            </div>

                            {/* QUICK ACTIONS */}
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => navigate(`/producer/events/${publishedEventData.eventId}`)}
                                    className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 hover:bg-[var(--accent-primary)] hover:text-black rounded-2xl border border-white/10 transition-all group"
                                >
                                    <Ticket className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-bold uppercase">Gerenciar Ingressos</span>
                                </button>
                                <button 
                                    onClick={() => window.open(`/visitor/event/${publishedEventData.eventId}?tenant=${publishedEventData.slug}`, '_blank')}
                                    className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 hover:bg-[var(--accent-primary)] hover:text-black rounded-2xl border border-white/10 transition-all group"
                                >
                                    <ExternalLink className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-bold uppercase">Ver na Agenda</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3 relative z-10">
                            <button 
                                onClick={() => {
                                    const text = encodeURIComponent(`Confira meu novo evento cultural: ${formData.title}! Veja mais em: https://cultura.viva/events/${publishedEventData.eventId}`);
                                    window.open(`https://wa.me/?text=${text}`, '_blank');
                                }}
                                className="w-full flex items-center justify-center gap-3 py-4 bg-[#25D366] text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg"
                            >
                                <Share2 size={20} /> Compartilhar no WhatsApp
                            </button>
                            <Button 
                                variant="ghost" 
                                className="w-full text-[#B0A090] hover:text-[#EAE0D5] text-sm"
                                onClick={() => setShowShareModal(false)}
                            >
                                Fechar agora e continuar editando
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
