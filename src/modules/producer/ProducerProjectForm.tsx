import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../api/client";
import { useAuth } from "../auth/AuthContext";
import { ArrowLeft, Save, FileText, Send, Upload, Trash2, Download, Paperclip } from "lucide-react";
import { useToast } from "../../contexts/ToastContext";

type AccountabilityDoc = {
    name: string;
    url: string;
    date: string;
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

    const [formData, setFormData] = useState({
        title: "",
        summary: "",
        description: "",
        culturalCategory: "",
        targetRegion: "",
        requestedBudget: "",
        expectedAudience: "",
        noticeId: searchParams.get("noticeId") || "",
        status: "DRAFT",
        attachments: [] as AccountabilityDoc[]
    });

    useEffect(() => {
        // Load notices
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
                    attachments: data.attachments || [] // JSON field
                });
            }).finally(() => setLoading(false));

            // Check query param to switch tab
            if (searchParams.get("tab") === "accountability") {
                setActiveTab("ACCOUNTABILITY");
            }
        }
    }, [id, searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!tenantId) {
            addToast("Erro de autenticação: TenantId não encontrado.", "error");
            return;
        }
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

            addToast("Projeto salvo com sucesso!", "success");
            if (!isEdit) navigate("/producer/events");
        } catch (err: any) {
            console.error(err);
            addToast("Erro ao salvar projeto: " + (err.response?.data?.message || err.message), "error");
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!id) return;
        if (!window.confirm("Deseja publicar este projeto na Agenda Cultural?")) return;

        setSaving(true);
        try {
            await api.post(`/projects/${id}/publish-event`);
            addToast("Projeto publicado na agenda com sucesso!", "success");
            navigate("/producer/events");
        } catch (err: any) {
            console.error(err);
            addToast("Erro ao publicar: " + (err.response?.data?.message || err.message), "error");
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const uploadData = new FormData();
            uploadData.append("file", file);

            setUploading(true);
            try {
                // Determine generic type based on mimetype
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

                addToast("Arquivo enviado com sucesso! Clique em Salvar para persistir.", "success");
            } catch (err) {
                console.error("Upload error", err);
                addToast("Erro ao enviar arquivo.", "error");
            } finally {
                setUploading(false);
            }
        }
    };

    const removeAttachment = (index: number) => {
        if (!window.confirm("Remover este anexo?")) return;
        const newAttachments = [...formData.attachments];
        newAttachments.splice(index, 1);
        setFormData({ ...formData, attachments: newAttachments });
    };

    if (loading) return <div>Carregando...</div>;

    const readOnly = formData.status !== 'DRAFT' && isEdit && activeTab === "DETAILS";
    // Accountability is editable if project is approved/execution
    const accountabilityEditable = formData.status === "APPROVED" || formData.status === "IN_EXECUTION" || formData.status === "COMPLETED";

    return (
        <div className="producer-project-form card p-6">
            <div className="flex items-center gap-4 mb-6">
                <Button
                    onClick={() => navigate("/producer/events")}
                    variant="ghost"
                    className="p-2 hover:bg-white/10 rounded"
                >
                    <ArrowLeft size={20} />
                </Button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-gold">{isEdit ? "Gestão do Projeto" : "Novo Projeto"}</h1>
                    <p className="text-sm opacity-70">{formData.title || "Sem título"}</p>
                </div>
                {formData.status === "IN_EXECUTION" && <span className="bg-green-900 text-green-200 px-3 py-1 rounded text-sm">Em Execução</span>}
            </div>

            {/* TABS */}
            {isEdit && (
                <div className="flex gap-4 border-b border-white/10 mb-6">
                    <button
                        onClick={() => setActiveTab("DETAILS")}
                        className={`pb-3 px-4 ${activeTab === "DETAILS" ? "border-b-2 border-gold text-gold" : "opacity-70 hover:opacity-100"}`}
                    >
                        Detalhes do Projeto
                    </button>
                    <button
                        onClick={() => setActiveTab("ACCOUNTABILITY")}
                        className={`pb-3 px-4 ${activeTab === "ACCOUNTABILITY" ? "border-b-2 border-gold text-gold" : "opacity-70 hover:opacity-100"}`}
                    >
                        Prestação de Contas
                    </button>
                </div>
            )}

            {activeTab === "DETAILS" ? (
                <>
                    {readOnly && <div className="bg-blue-900/50 p-4 rounded mb-4 text-blue-200">Este projeto já foi submetido.</div>}

                    <form onSubmit={e => e.preventDefault()} className="grid gap-4 max-w-3xl">
                        <Input
                            label="Título do Projeto *"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            disabled={readOnly}
                            required
                        />

                        <Textarea
                            label="Resumo (Pitch)"
                            name="summary"
                            value={formData.summary}
                            onChange={handleChange}
                            rows={2}
                            maxLength={200}
                            disabled={readOnly}
                        />

                        <Textarea
                            label="Descrição Completa"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={5}
                            disabled={readOnly}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Orçamento Estimado (R$)"
                                type="number"
                                name="requestedBudget"
                                value={formData.requestedBudget}
                                onChange={handleChange}
                                disabled={readOnly}
                            />
                            <Input
                                label="Público Estimado"
                                type="number"
                                name="expectedAudience"
                                value={formData.expectedAudience}
                                onChange={handleChange}
                                disabled={readOnly}
                            />
                        </div>

                        {!readOnly && (
                            <div className="flex justify-end gap-2 mt-4">
                                {isEdit && formData.status !== "IN_EXECUTION" && (
                                    <Button
                                        onClick={handlePublish}
                                        disabled={saving}
                                        variant="secondary"
                                        type="button"
                                        leftIcon={<Send size={18} />}
                                    >
                                        Publicar na Agenda
                                    </Button>
                                )}
                                <Button
                                    onClick={() => handleSave()}
                                    disabled={saving || uploading}
                                    isLoading={saving}
                                    leftIcon={<Save size={18} />}
                                >
                                    Salvar Projeto
                                </Button>
                            </div>
                        )}
                    </form>
                </>
            ) : (
                <div className="accountability-tab">
                    <div className="mb-6">
                        <h2 className="text-lg font-bold mb-2">Documentos e Comprovantes</h2>
                        <p className="opacity-70 text-sm mb-4">
                            Envie notas fiscais, recibos, relatórios fotográficos e outros documentos comprobatórios da execução do projeto.
                        </p>

                        {!accountabilityEditable && (
                            <div className="bg-yellow-900/50 p-3 rounded text-yellow-200 mb-4 inline-block">
                                A prestação de contas só está disponível para projetos Aprovados ou em Execução.
                            </div>
                        )}

                        {accountabilityEditable && (
                            <div className="mb-6">
                                <label className="btn-secondary inline-flex items-center gap-2 cursor-pointer">
                                    <Upload size={18} />
                                    {uploading ? "Enviando..." : "Anexar Documento (PDF/Img)"}
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        disabled={uploading}
                                    />
                                </label>
                            </div>
                        )}

                        <div className="grid gap-3 max-w-2xl">
                            {formData.attachments.length === 0 ? (
                                <p className="opacity-50 italic">Nenhum documento anexado.</p>
                            ) : (
                                formData.attachments.map((doc, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-white/5 p-3 rounded border border-white/10">
                                        <div className="flex items-center gap-3">
                                            <Paperclip size={18} className="text-gold" />
                                            <div>
                                                <p className="font-medium">{doc.name}</p>
                                                <p className="text-xs opacity-50">{new Date(doc.date).toLocaleDateString()} {new Date(doc.date).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a href={doc.url} target="_blank" rel="noreferrer" className="p-2 hover:bg-white/10 rounded" title="Baixar">
                                                <Download size={16} />
                                            </a>
                                            {accountabilityEditable && (
                                                <button onClick={() => removeAttachment(idx)} className="p-2 hover:bg-red-900/50 text-red-400 rounded" title="Remover">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {accountabilityEditable && (
                            <div className="mt-6 border-t border-white/10 pt-4 flex justify-end">
                                <button onClick={() => handleSave()} disabled={saving} className="btn-primary flex items-center gap-2">
                                    <Save size={18} /> Salvar Prestação de Contas
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
