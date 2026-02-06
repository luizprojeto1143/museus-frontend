import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { ArrowLeft, Save, Calendar, DollarSign, FileText, MapPin } from "lucide-react";

const STATUS_OPTIONS = [
    { value: "DRAFT", label: "Rascunho", color: "#6b7280" },
    { value: "PUBLISHED", label: "Publicado", color: "#3b82f6" },
    { value: "INSCRIPTIONS_OPEN", label: "Inscrições Abertas", color: "#22c55e" },
    { value: "INSCRIPTIONS_CLOSED", label: "Inscrições Encerradas", color: "#f59e0b" },
    { value: "EVALUATION", label: "Em Avaliação", color: "#8b5cf6" },
    { value: "RESULTS_PUBLISHED", label: "Resultados Publicados", color: "#06b6d4" },
    { value: "FINISHED", label: "Finalizado", color: "#64748b" }
];

const CULTURAL_CATEGORIES = [
    "Artes Visuais", "Música", "Teatro", "Dança", "Literatura",
    "Audiovisual", "Patrimônio Cultural", "Cultura Popular", "Artesanato"
];

export const AdminNoticeForm: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        inscriptionStart: "",
        inscriptionEnd: "",
        resultsDate: "",
        executionEnd: "",
        totalBudget: "",
        maxPerProject: "",
        culturalCategories: [] as string[],
        targetRegions: [] as string[],
        status: "DRAFT",
        documentUrl: "",
        requiresAccessibilityPlan: true
    });

    const [newRegion, setNewRegion] = useState("");

    useEffect(() => {
        if (id && tenantId) {
            setLoading(true);
            api.get(`/notices/${id}`)
                .then(res => {
                    const data = res.data;
                    setFormData({
                        title: data.title || "",
                        description: data.description || "",
                        inscriptionStart: data.inscriptionStart ? data.inscriptionStart.split("T")[0] : "",
                        inscriptionEnd: data.inscriptionEnd ? data.inscriptionEnd.split("T")[0] : "",
                        resultsDate: data.resultsDate ? data.resultsDate.split("T")[0] : "",
                        executionEnd: data.executionEnd ? data.executionEnd.split("T")[0] : "",
                        totalBudget: data.totalBudget?.toString() || "",
                        maxPerProject: data.maxPerProject?.toString() || "",
                        culturalCategories: data.culturalCategories || [],
                        targetRegions: data.targetRegions || [],
                        status: data.status || "DRAFT",
                        documentUrl: data.documentUrl || "",
                        requiresAccessibilityPlan: data.requiresAccessibilityPlan ?? true
                    });
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [id, tenantId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenantId) return;

        setSaving(true);
        try {
            const payload = {
                ...formData,
                tenantId,
                inscriptionStart: formData.inscriptionStart ? new Date(formData.inscriptionStart).toISOString() : null,
                inscriptionEnd: formData.inscriptionEnd ? new Date(formData.inscriptionEnd).toISOString() : null,
                resultsDate: formData.resultsDate ? new Date(formData.resultsDate).toISOString() : null,
                executionEnd: formData.executionEnd ? new Date(formData.executionEnd).toISOString() : null,
                totalBudget: formData.totalBudget ? parseFloat(formData.totalBudget) : null,
                maxPerProject: formData.maxPerProject ? parseFloat(formData.maxPerProject) : null
            };

            if (isEdit) {
                await api.put(`/notices/${id}`, payload);
            } else {
                await api.post("/notices", payload);
            }
            navigate("/admin/editais");
        } catch (error) {
            console.error("Erro ao salvar edital:", error);
            alert("Erro ao salvar edital. Verifique os dados.");
        } finally {
            setSaving(false);
        }
    };

    const toggleCategory = (cat: string) => {
        setFormData(prev => ({
            ...prev,
            culturalCategories: prev.culturalCategories.includes(cat)
                ? prev.culturalCategories.filter(c => c !== cat)
                : [...prev.culturalCategories, cat]
        }));
    };

    const addRegion = () => {
        if (newRegion.trim() && !formData.targetRegions.includes(newRegion.trim())) {
            setFormData(prev => ({
                ...prev,
                targetRegions: [...prev.targetRegions, newRegion.trim()]
            }));
            setNewRegion("");
        }
    };

    const removeRegion = (region: string) => {
        setFormData(prev => ({
            ...prev,
            targetRegions: prev.targetRegions.filter(r => r !== region)
        }));
    };

    if (loading) {
        return <div className="loading">Carregando edital...</div>;
    }

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
                <button
                    onClick={() => navigate("/admin/editais")}
                    style={{ background: "transparent", border: "none", cursor: "pointer", padding: "0.5rem" }}
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="section-title">{isEdit ? "Editar Edital" : "Novo Edital"}</h1>
                    <p className="section-subtitle">
                        {isEdit ? "Atualize as informações do edital público" : "Crie um novo edital de fomento cultural"}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Informações Básicas */}
                <div className="card" style={{ marginBottom: "1.5rem" }}>
                    <h2 className="card-title"><FileText size={20} /> Informações Básicas</h2>

                    <div className="form-group">
                        <label>Título do Edital *</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ex: Edital de Fomento à Cultura 2024"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Descrição</label>
                        <textarea
                            className="input"
                            rows={4}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Descreva os objetivos, público-alvo e regras do edital..."
                        />
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

                    <div className="form-group">
                        <label>Link do Documento (PDF)</label>
                        <input
                            type="url"
                            className="input"
                            value={formData.documentUrl}
                            onChange={e => setFormData({ ...formData, documentUrl: e.target.value })}
                            placeholder="https://exemplo.com/edital.pdf"
                        />
                    </div>
                </div>

                {/* Datas */}
                <div className="card" style={{ marginBottom: "1.5rem" }}>
                    <h2 className="card-title"><Calendar size={20} /> Cronograma</h2>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div className="form-group">
                            <label>Início das Inscrições *</label>
                            <input
                                type="date"
                                className="input"
                                value={formData.inscriptionStart}
                                onChange={e => setFormData({ ...formData, inscriptionStart: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Fim das Inscrições *</label>
                            <input
                                type="date"
                                className="input"
                                value={formData.inscriptionEnd}
                                onChange={e => setFormData({ ...formData, inscriptionEnd: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Data de Divulgação dos Resultados</label>
                            <input
                                type="date"
                                className="input"
                                value={formData.resultsDate}
                                onChange={e => setFormData({ ...formData, resultsDate: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Prazo de Execução</label>
                            <input
                                type="date"
                                className="input"
                                value={formData.executionEnd}
                                onChange={e => setFormData({ ...formData, executionEnd: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Orçamento */}
                <div className="card" style={{ marginBottom: "1.5rem" }}>
                    <h2 className="card-title"><DollarSign size={20} /> Orçamento</h2>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div className="form-group">
                            <label>Orçamento Total (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="input"
                                value={formData.totalBudget}
                                onChange={e => setFormData({ ...formData, totalBudget: e.target.value })}
                                placeholder="500000.00"
                            />
                        </div>
                        <div className="form-group">
                            <label>Valor Máximo por Projeto (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="input"
                                value={formData.maxPerProject}
                                onChange={e => setFormData({ ...formData, maxPerProject: e.target.value })}
                                placeholder="50000.00"
                            />
                        </div>
                    </div>
                </div>

                {/* Categorias */}
                <div className="card" style={{ marginBottom: "1.5rem" }}>
                    <h2 className="card-title">🎨 Categorias Culturais</h2>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {CULTURAL_CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => toggleCategory(cat)}
                                style={{
                                    padding: "0.5rem 1rem",
                                    borderRadius: "2rem",
                                    border: "1px solid",
                                    borderColor: formData.culturalCategories.includes(cat) ? "#3b82f6" : "#e5e7eb",
                                    background: formData.culturalCategories.includes(cat) ? "rgba(59, 130, 246, 0.1)" : "white",
                                    color: formData.culturalCategories.includes(cat) ? "#3b82f6" : "#6b7280",
                                    cursor: "pointer",
                                    fontSize: "0.875rem"
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Regiões */}
                <div className="card" style={{ marginBottom: "1.5rem" }}>
                    <h2 className="card-title"><MapPin size={20} /> Regiões Alvo</h2>

                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                        <input
                            type="text"
                            className="input"
                            value={newRegion}
                            onChange={e => setNewRegion(e.target.value)}
                            placeholder="Ex: Zona Norte, Centro..."
                            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addRegion())}
                        />
                        <button type="button" className="btn btn-secondary" onClick={addRegion}>
                            Adicionar
                        </button>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {formData.targetRegions.map(region => (
                            <span
                                key={region}
                                style={{
                                    padding: "0.25rem 0.75rem",
                                    background: "rgba(59, 130, 246, 0.1)",
                                    color: "#3b82f6",
                                    borderRadius: "1rem",
                                    fontSize: "0.875rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem"
                                }}
                            >
                                {region}
                                <button
                                    type="button"
                                    onClick={() => removeRegion(region)}
                                    style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Acessibilidade */}
                <div className="card" style={{ marginBottom: "1.5rem" }}>
                    <h2 className="card-title">♿ Acessibilidade</h2>

                    <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
                        <input
                            type="checkbox"
                            checked={formData.requiresAccessibilityPlan}
                            onChange={e => setFormData({ ...formData, requiresAccessibilityPlan: e.target.checked })}
                            style={{ width: "1.25rem", height: "1.25rem" }}
                        />
                        <span>Exigir plano de acessibilidade nos projetos</span>
                    </label>
                </div>

                {/* Ações */}
                <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate("/admin/editais")}
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
                        {saving ? "Salvando..." : (isEdit ? "Salvar Alterações" : "Criar Edital")}
                    </button>
                </div>
            </form>
        </div>
    );
};
