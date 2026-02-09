import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../api/client";
import { useAuth } from "../auth/AuthContext";
import {
    ArrowLeft, Save, FileText, Send, Upload, Trash2, Download, Paperclip,
    Trophy, Rocket, AlertCircle, CheckCircle2, History, Banknote
} from "lucide-react";
import { useToast } from "../../contexts/ToastContext";
import { Button, Input, Textarea, Select } from "../../components/ui";
import "../master/pages/MasterShared.css"; // Reuse relevant styles

type AccountabilityDoc = {
    name: string;
    url: string;
    date: string;
};

// Gamified Status Styles
const STATUS_STYLES = {
    DRAFT: { label: "Rascunho", bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20", icon: <History size={16} /> },
    SUBMITTED: { label: "Submetido", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", icon: <Send size={16} /> },
    UNDER_REVIEW: { label: "Em Análise", bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", icon: <AlertCircle size={16} /> },
    APPROVED: { label: "Aprovado!", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", icon: <Trophy size={16} /> },
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
    const [notices, setNotices] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"DETAILS" | "ACCOUNTABILITY">("DETAILS");
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        summary: "",
        description: "",
        culturalCategory: "",
        targetRegion: "",
        requestedBudget: "",
        expectedAudience: "",
        noticeId: searchParams.get("noticeId") || "",
        status: "DRAFT" as keyof typeof STATUS_STYLES,
        attachments: [] as AccountabilityDoc[]
    });

    useEffect(() => {
        api.get("/notices/public?status=INSCRIPTIONS_OPEN").then(res =>
            setNotices(Array.isArray(res.data) ? res.data : [])
        ).catch(console.error);

        if (id) {
            setLoading(true);
            api.get(`/projects/${id}`).then(res => {
                const data = res.data;
                setFormData({
                    title: data.title || "",
                    summary: data.summary || "",
                    description: data.description || "",
                    culturalCategory: data.culturalCategory || "",
                    targetRegion: data.targetRegion || "",
                    requestedBudget: data.requestedBudget || "",
                    expectedAudience: data.expectedAudience || "",
                    noticeId: data.noticeId || "",
                    status: data.status,
                    attachments: data.attachments || []
                });
            }).finally(() => setLoading(false));

            if (searchParams.get("tab") === "accountability") {
                setActiveTab("ACCOUNTABILITY");
            }
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
                await api.post("/projects", payload);
            }

            addToast("Salvo com sucesso!", "success");
            if (!isEdit) navigate("/producer/events");
        } catch (err: any) {
            console.error(err);
            addToast("Erro ao salvar.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!id) return;
        if (!window.confirm("Publicar na Agenda Cultural?")) return;

        setSaving(true);
        try {
            await api.post(`/projects/${id}/publish-event`);
            addToast("Publicado na agenda!", "success");
            navigate("/producer/events");
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
        <div className="flex justify-center items-center h-screen bg-[#0a0a0c]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    const readOnly = formData.status !== 'DRAFT' && isEdit && activeTab === "DETAILS";
    const accountabilityEditable = ["APPROVED", "IN_EXECUTION", "COMPLETED"].includes(formData.status);
    const statusInfo = STATUS_STYLES[formData.status] || STATUS_STYLES.DRAFT;

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-200 p-6 md:p-12">

            {/* HEADER WITH GAMIFIED STATUS */}
            <div className="max-w-5xl mx-auto mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/producer/events')}
                        className="w-10 h-10 p-0 rounded-full bg-white/5 hover:bg-white/10 text-slate-400"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            {isEdit ? "Gestão do Projeto" : "Nova Proposta"}
                        </h1>
                        <p className="text-slate-500 font-medium">
                            {formData.title || "Rascunho sem título"}
                        </p>
                    </div>
                </div>

                <div className={`
                    px-6 py-3 rounded-2xl border flex items-center gap-3 shadow-lg backdrop-blur-md
                    ${statusInfo.bg} ${statusInfo.border}
                `}>
                    <div className={`p-2 rounded-full bg-white/10 ${statusInfo.text}`}>
                        {statusInfo.icon}
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Atual</div>
                        <div className={`font-black text-lg ${statusInfo.text}`}>
                            {statusInfo.label}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* SIDEBAR NAVIGATION */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-[#1e293b] rounded-2xl p-2 border border-white/5">
                        <button
                            onClick={() => setActiveTab("DETAILS")}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium text-sm mb-1 ${activeTab === "DETAILS" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-slate-400 hover:bg-white/5"}`}
                        >
                            <FileText size={18} /> Detalhes
                        </button>
                        <button
                            onClick={() => setActiveTab("ACCOUNTABILITY")}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium text-sm ${activeTab === "ACCOUNTABILITY" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20" : "text-slate-400 hover:bg-white/5"}`}
                        >
                            <Banknote size={18} /> Prestação de Contas
                        </button>
                    </div>

                    {/* TIPS CARD */}
                    <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-2xl p-5 border border-white/5">
                        <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-3">
                            <Rocket size={16} /> Dica do Mentor
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Projetos com descrições detalhadas e orçamentos realistas têm 40% mais chance de aprovação rápida.
                        </p>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="lg:col-span-3">

                    {activeTab === "DETAILS" ? (
                        <div className="bg-[#1e293b] border border-white/5 rounded-3xl p-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            {readOnly && (
                                <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 text-blue-300 text-sm">
                                    <AlertCircle size={20} className="shrink-0" />
                                    Este projeto já foi submetido. Edições estão restritas.
                                </div>
                            )}

                            <div className="space-y-6">
                                <Input
                                    label="Título do Projeto"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    disabled={readOnly}
                                    required
                                    className="h-12 bg-black/20 font-bold"
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Orçamento (R$)"
                                        type="number"
                                        name="requestedBudget"
                                        value={formData.requestedBudget}
                                        onChange={handleChange}
                                        disabled={readOnly}
                                        leftIcon={<span className="text-slate-500 font-bold">$</span>}
                                        className="bg-black/20 font-mono"
                                    />
                                    <Input
                                        label="Público Estimado"
                                        type="number"
                                        name="expectedAudience"
                                        value={formData.expectedAudience}
                                        onChange={handleChange}
                                        disabled={readOnly}
                                        className="bg-black/20"
                                    />
                                </div>

                                <Textarea
                                    label="Resumo (Pitch de Elevador)"
                                    name="summary"
                                    value={formData.summary}
                                    onChange={handleChange}
                                    rows={3}
                                    maxLength={200}
                                    disabled={readOnly}
                                    className="bg-black/20 text-sm"
                                    placeholder="Venda seu peixe em até 200 caracteres..."
                                />

                                <Textarea
                                    label="Descrição Completa"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={8}
                                    disabled={readOnly}
                                    className="bg-black/20 text-sm"
                                />

                                {!readOnly && (
                                    <div className="pt-6 flex justify-end gap-3 border-t border-white/5">
                                        {isEdit && formData.status !== "IN_EXECUTION" && (
                                            <Button
                                                onClick={handlePublish}
                                                disabled={saving}
                                                variant="outline"
                                                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                                leftIcon={<Send size={16} />}
                                            >
                                                Publicar na Agenda
                                            </Button>
                                        )}
                                        <Button
                                            onClick={() => handleSave()}
                                            isLoading={saving}
                                            className="bg-white text-black hover:bg-slate-200 px-8 font-bold"
                                            leftIcon={<Save size={18} />}
                                        >
                                            Salvar Alterações
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

                            {/* UPLOAD AREA */}
                            <div className="bg-[#1e293b] border border-white/5 rounded-3xl p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Banknote className="text-emerald-400" size={24} /> Comprovantes
                                    </h2>
                                    <div className="text-xs font-mono text-slate-500 bg-black/30 px-3 py-1 rounded-full">
                                        {formData.attachments.length} arquivos
                                    </div>
                                </div>

                                {!accountabilityEditable ? (
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 text-center">
                                        <div className="w-12 h-12 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <AlertCircle size={24} />
                                        </div>
                                        <h3 className="text-amber-400 font-bold mb-1">Aguardando Aprovação</h3>
                                        <p className="text-amber-200/60 text-sm">
                                            A prestação de contas será liberada assim que o projeto for aprovado ou entrar em execução.
                                        </p>
                                    </div>
                                ) : (
                                    <div
                                        className={`
                                            border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer relative overflow-hidden group
                                            ${dragActive ? 'border-emerald-500 bg-emerald-500/10 scale-[1.02]' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}
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
                                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-2xl shadow-emerald-500/20 mx-auto mb-4 flex items-center justify-center">
                                                {uploading ? <div className="animate-spin border-2 border-white border-t-transparent rounded-full w-8 h-8" /> : <Upload className="text-white" size={32} />}
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-1">
                                                {uploading ? 'Enviando...' : 'Arraste arquivos aqui'}
                                            </h3>
                                            <p className="text-slate-400 text-sm">
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
                                        <div key={idx} className="group flex items-center justify-between p-4 bg-[#1e293b] border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center text-slate-400">
                                                    <Paperclip size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-200 text-sm">{doc.name}</div>
                                                    <div className="text-xs text-slate-500 font-mono">
                                                        {new Date(doc.date).toLocaleDateString()} • {new Date(doc.date).toLocaleTimeString().slice(0, 5)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-2 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"
                                                    title="Baixar"
                                                >
                                                    <Download size={18} />
                                                </a>
                                                {accountabilityEditable && (
                                                    <button
                                                        onClick={() => removeAttachment(idx)}
                                                        className="p-2 hover:bg-red-500/10 text-slate-300 hover:text-red-400 rounded-lg transition-colors"
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
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 rounded-xl shadow-lg shadow-emerald-900/20 border-none"
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
        </div>
    );
};
