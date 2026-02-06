import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { ArrowLeft, Save, Users, DollarSign, FileText, Accessibility } from "lucide-react";

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
            navigate("/admin/projetos");
        } catch (error) {
            console.error("Erro ao salvar projeto:", error);
            alert("Erro ao salvar projeto. Verifique os dados.");
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
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
                <button
                    onClick={() => navigate("/admin/projetos")}
                    style={{ background: "transparent", border: "none", cursor: "pointer", padding: "0.5rem" }}
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="section-title">{isEdit ? "Editar Projeto" : "Novo Projeto Cultural"}</h1>
                    <p className="section-subtitle">
                        {isEdit ? "Atualize as informações do projeto" : "Cadastre um novo projeto cultural"}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Informações Básicas */}
                <div className="card" style={{ marginBottom: "1.5rem" }}>
                    <h2 className="card-title"><FileText size={20} /> Informações Básicas</h2>

                    <div className="form-group">
                        <label>Título do Projeto *</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ex: Festival de Jazz de Betim 2024"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Resumo</label>
                        <textarea
                            className="input"
                            rows={2}
                            value={formData.summary}
                            onChange={e => setFormData({ ...formData, summary: e.target.value })}
                            placeholder="Breve resumo do projeto..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Descrição Completa</label>
                        <textarea
                            className="input"
                            rows={5}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Descreva os objetivos, metodologia, cronograma e impactos esperados..."
                        />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div className="form-group">
                            <label>Categoria Cultural</label>
                            <select
                                className="input"
                                value={formData.culturalCategory}
                                onChange={e => setFormData({ ...formData, culturalCategory: e.target.value })}
                            >
                                <option value="">Selecione...</option>
                                {CULTURAL_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Região</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.targetRegion}
                                onChange={e => setFormData({ ...formData, targetRegion: e.target.value })}
                                placeholder="Ex: Centro, Zona Norte..."
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Vinculado ao Edital</label>
                        <select
                            className="input"
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
                        <label>Status</label>
                        <select
                            className="input"
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
                <div className="card" style={{ marginBottom: "1.5rem" }}>
                    <h2 className="card-title"><DollarSign size={20} /> Orçamento</h2>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div className="form-group">
                            <label>Valor Solicitado (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="input"
                                value={formData.requestedBudget}
                                onChange={e => setFormData({ ...formData, requestedBudget: e.target.value })}
                                placeholder="50000.00"
                            />
                        </div>
                        <div className="form-group">
                            <label>Valor Aprovado (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="input"
                                value={formData.approvedBudget}
                                onChange={e => setFormData({ ...formData, approvedBudget: e.target.value })}
                                placeholder="45000.00"
                            />
                        </div>
                    </div>
                </div>

                {/* Público */}
                <div className="card" style={{ marginBottom: "1.5rem" }}>
                    <h2 className="card-title"><Users size={20} /> Público</h2>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div className="form-group">
                            <label>Público Esperado</label>
                            <input
                                type="number"
                                min="0"
                                className="input"
                                value={formData.expectedAudience}
                                onChange={e => setFormData({ ...formData, expectedAudience: e.target.value })}
                                placeholder="1000"
                            />
                        </div>
                        <div className="form-group">
                            <label>Público Real (após execução)</label>
                            <input
                                type="number"
                                min="0"
                                className="input"
                                value={formData.actualAudience}
                                onChange={e => setFormData({ ...formData, actualAudience: e.target.value })}
                                placeholder="1200"
                            />
                        </div>
                    </div>
                </div>

                {/* Plano de Acessibilidade */}
                <div className="card" style={{ marginBottom: "1.5rem" }}>
                    <h2 className="card-title"><Accessibility size={20} /> Plano de Acessibilidade</h2>

                    <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", marginBottom: "1rem" }}>
                        <input
                            type="checkbox"
                            checked={formData.accessibilityPlan.hasAccessibility}
                            onChange={e => setFormData({
                                ...formData,
                                accessibilityPlan: { ...formData.accessibilityPlan, hasAccessibility: e.target.checked }
                            })}
                            style={{ width: "1.25rem", height: "1.25rem" }}
                        />
                        <span>Este projeto inclui recursos de acessibilidade</span>
                    </label>

                    {formData.accessibilityPlan.hasAccessibility && (
                        <>
                            <div style={{ marginBottom: "1rem" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem" }}>Serviços de Acessibilidade:</label>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                    {ACCESSIBILITY_SERVICES.map(service => (
                                        <button
                                            key={service.value}
                                            type="button"
                                            onClick={() => toggleAccessibilityService(service.value)}
                                            style={{
                                                padding: "0.5rem 1rem",
                                                borderRadius: "2rem",
                                                border: "1px solid",
                                                borderColor: formData.accessibilityPlan.services.includes(service.value) ? "#22c55e" : "#e5e7eb",
                                                background: formData.accessibilityPlan.services.includes(service.value) ? "rgba(34, 197, 94, 0.1)" : "white",
                                                color: formData.accessibilityPlan.services.includes(service.value) ? "#22c55e" : "#6b7280",
                                                cursor: "pointer",
                                                fontSize: "0.875rem"
                                            }}
                                        >
                                            {service.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Descrição do Plano de Acessibilidade</label>
                                <textarea
                                    className="input"
                                    rows={3}
                                    value={formData.accessibilityPlan.description}
                                    onChange={e => setFormData({
                                        ...formData,
                                        accessibilityPlan: { ...formData.accessibilityPlan, description: e.target.value }
                                    })}
                                    placeholder="Descreva como os recursos de acessibilidade serão implementados..."
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Ações */}
                <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate("/admin/projetos")}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                        style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                    >
                        <Save size={18} />
                        {saving ? "Salvando..." : (isEdit ? "Salvar Alterações" : "Criar Projeto")}
                    </button>
                </div>
            </form>
        </div>
    );
};
