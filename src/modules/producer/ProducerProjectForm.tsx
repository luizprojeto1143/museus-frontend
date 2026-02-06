import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../api/client";
import { useAuth } from "../auth/AuthContext";
import { ArrowLeft, Save, FileText, Send } from "lucide-react";

export const ProducerProjectForm: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [notices, setNotices] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        summary: "",
        description: "",
        culturalCategory: "",
        targetRegion: "",
        requestedBudget: "",
        expectedAudience: "",
        noticeId: searchParams.get("noticeId") || "",
        status: "DRAFT"
    });

    useEffect(() => {
        // Load notices
        api.get("/notices?status=INSCRIPTIONS_OPEN").then(res =>
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
                    status: data.status
                });
            }).finally(() => setLoading(false));
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!tenantId) {
            alert("Erro de autenticação: TenantId não encontrado.");
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
                const res = await api.post("/projects", payload);
            }

            alert("Projeto salvo com sucesso!");
            navigate("/producer/events");
        } catch (err: any) {
            console.error(err);
            alert("Erro ao salvar projeto: " + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Carregando...</div>;

    const readOnly = formData.status !== 'DRAFT' && isEdit;

    const handlePublish = async () => {
        if (!id) return;
        if (!window.confirm("Deseja publicar este projeto na Agenda Cultural? Isso criará um evento visível para o público.")) return;

        setSaving(true);
        try {
            await api.post(`/projects/${id}/publish-event`);
            alert("Projeto publicado na agenda com sucesso!");
            navigate("/producer/events"); // Or stay?
        } catch (err: any) {
            console.error(err);
            alert("Erro ao publicar: " + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="producer-project-form card p-6">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate("/producer/events")} className="p-2 hover:bg-white/10 rounded">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold text-gold">{isEdit ? "Editar Projeto" : "Novo Projeto"}</h1>
                {formData.status === "IN_EXECUTION" && <span className="ml-auto bg-green-900 text-green-200 px-3 py-1 rounded text-sm">Publicado na Agenda</span>}
            </div>

            {readOnly && <div className="bg-blue-900/50 p-4 rounded mb-4 text-blue-200">Este projeto já foi submetido e não pode ser editado.</div>}

            <form onSubmit={e => e.preventDefault()} className="grid gap-4 max-w-3xl">
                <div>
                    <label className="block text-gray-400 mb-1">Título do Projeto *</label>
                    <input type="text" name="title" required value={formData.title} onChange={handleChange} className="input w-full" disabled={readOnly} />
                </div>
                {/* ... fields ... */}
                {/* I need to make sure I don't replace the middle fields blindly. I should use START/END line carefully or use multiple replacements. 
                   Actually, the form content is large. I will just replace the footer buttons block.
                   And inject the function handlePublish at the top.
                   Let's use 2 replacements.
                */}

                <div>
                    <label className="block text-gray-400 mb-1">Resumo (Pitch)</label>
                    <textarea name="summary" rows={2} value={formData.summary} onChange={handleChange} className="input w-full" maxLength={200} disabled={readOnly} />
                </div>

                <div>
                    <label className="block text-gray-400 mb-1">Descrição Completa</label>
                    <textarea name="description" rows={5} value={formData.description} onChange={handleChange} className="input w-full" disabled={readOnly} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-400 mb-1">Orçamento Estimado (R$)</label>
                        <input type="number" name="requestedBudget" value={formData.requestedBudget} onChange={handleChange} className="input w-full" disabled={readOnly} />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-1">Público Estimado</label>
                        <input type="number" name="expectedAudience" value={formData.expectedAudience} onChange={handleChange} className="input w-full" disabled={readOnly} />
                    </div>
                </div>

                {!readOnly && (
                    <div className="flex justify-end gap-2 mt-4">
                        {isEdit && formData.status !== "IN_EXECUTION" && (
                            <button onClick={handlePublish} disabled={saving} className="btn-secondary flex items-center gap-2" type="button">
                                <Send size={18} /> Publicar na Agenda
                            </button>
                        )}
                        <button onClick={() => handleSave()} disabled={saving} className="btn-primary flex items-center gap-2">
                            <Save size={18} /> Salvar Projeto
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};
