import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { ArrowLeft, Save, User, Calendar, DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react";

const ACCESSIBILITY_SERVICES = [
    { value: "LIBRAS_INTERPRETATION", label: "Interpretação em LIBRAS", icon: "🤟" },
    { value: "AUDIO_DESCRIPTION", label: "Audiodescrição", icon: "🎧" },
    { value: "CAPTIONING", label: "Legendagem", icon: "📝" },
    { value: "BRAILLE", label: "Material em Braille", icon: "⠿" },
    { value: "TACTILE_MODEL", label: "Maquete Tátil", icon: "🖐️" },
    { value: "EASY_READING", label: "Leitura Fácil", icon: "📖" }
];

const STATUS_OPTIONS = [
    { value: "PENDING", label: "Pendente", color: "#f59e0b", icon: Clock },
    { value: "APPROVED", label: "Aprovado", color: "#22c55e", icon: CheckCircle },
    { value: "IN_PROGRESS", label: "Em Andamento", color: "#3b82f6", icon: Clock },
    { value: "DELIVERED", label: "Entregue", color: "#8b5cf6", icon: CheckCircle },
    { value: "VALIDATED", label: "Validado", color: "#06b6d4", icon: CheckCircle },
    { value: "REJECTED", label: "Rejeitado", color: "#ef4444", icon: AlertCircle }
];

interface Provider {
    id: string;
    name: string;
    services: string[];
}

interface Project {
    id: string;
    title: string;
}

export const AdminAccessibilityForm: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);

    const [formData, setFormData] = useState({
        serviceType: searchParams.get("serviceType") || "LIBRAS_INTERPRETATION",
        requestedBy: "",
        approvedBudget: "",
        providerId: "",
        projectId: searchParams.get("projectId") || "",
        status: "PENDING",
        deliverables: "",
        validationStatus: ""
    });

    useEffect(() => {
        if (tenantId) {
            // Load providers
            api.get(`/providers?tenantId=${tenantId}`)
                .then(res => setProviders(Array.isArray(res.data) ? res.data : []))
                .catch(console.error);

            // Load projects
            api.get(`/projects?tenantId=${tenantId}`)
                .then(res => setProjects(Array.isArray(res.data) ? res.data : []))
                .catch(console.error);
        }

        if (id && tenantId) {
            setLoading(true);
            api.get(`/accessibility-execution/${id}`)
                .then(res => {
                    const data = res.data;
                    setFormData({
                        serviceType: data.serviceType || "LIBRAS_INTERPRETATION",
                        requestedBy: data.requestedBy || "",
                        approvedBudget: data.approvedBudget?.toString() || "",
                        providerId: data.providerId || "",
                        projectId: data.projectId || "",
                        status: data.status || "PENDING",
                        deliverables: typeof data.deliverables === "object"
                            ? JSON.stringify(data.deliverables, null, 2)
                            : data.deliverables || "",
                        validationStatus: data.validationStatus || ""
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
            let deliverables = null;
            if (formData.deliverables.trim()) {
                try {
                    deliverables = JSON.parse(formData.deliverables);
                } catch {
                    deliverables = { notes: formData.deliverables };
                }
            }

            const payload = {
                ...formData,
                tenantId,
                approvedBudget: formData.approvedBudget ? parseFloat(formData.approvedBudget) : null,
                providerId: formData.providerId || null,
                projectId: formData.projectId || null,
                deliverables
            };

            if (isEdit) {
                await api.put(`/accessibility-execution/${id}`, payload);
            } else {
                await api.post("/accessibility-execution", payload);
            }
            navigate("/admin/acessibilidade");
        } catch (error) {
            console.error("Erro ao salvar execução:", error);
            alert("Erro ao salvar. Verifique os dados.");
        } finally {
            setSaving(false);
        }
    };

    const filteredProviders = providers.filter(p =>
        p.services?.includes(formData.serviceType)
    );

    if (loading) {
        return <div className="loading">Carregando...</div>;
    }

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
                <button
                    onClick={() => navigate("/admin/acessibilidade")}
                    style={{ background: "transparent", border: "none", cursor: "pointer", padding: "0.5rem" }}
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="section-title">{isEdit ? "Editar Solicitação" : "Nova Solicitação de Acessibilidade"}</h1>
                    <p className="section-subtitle">
                        {isEdit ? "Atualize os dados da solicitação" : "Registre uma nova demanda de acessibilidade"}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Tipo de Serviço */}
                <div className="card" style={{ marginBottom: "1.5rem" }}>
                    <h2 className="card-title">♿ Tipo de Serviço</h2>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem" }}>
                        {ACCESSIBILITY_SERVICES.map(service => (
                            <button
                                key={service.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, serviceType: service.value, providerId: "" })}
                                style={{
                                    padding: "1rem",
                                    borderRadius: "0.75rem",
                                    border: "2px solid",
                                    borderColor: formData.serviceType === service.value ? "#3b82f6" : "#e5e7eb",
                                    background: formData.serviceType === service.value ? "rgba(59, 130, 246, 0.05)" : "white",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.75rem",
                                    textAlign: "left"
                                }}
                            >
                                <span style={{ fontSize: "1.5rem" }}>{service.icon}</span>
                                <span style={{
                                    color: formData.serviceType === service.value ? "#3b82f6" : "#374151",
                                    fontWeight: formData.serviceType === service.value ? 600 : 400
                                }}>
                                    {service.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Detalhes */}
                <div className="card" style={{ marginBottom: "1.5rem" }}>
                    <h2 className="card-title"><User size={20} /> Detalhes da Solicitação</h2>

                    <div className="form-group">
                        <label>Solicitante</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.requestedBy}
                            onChange={e => setFormData({ ...formData, requestedBy: e.target.value })}
                            placeholder="Nome do solicitante ou departamento"
                        />
                    </div>

                    <div className="form-group">
                        <label>Projeto Vinculado</label>
                        <select
                            className="input"
                            value={formData.projectId}
                            onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                        >
                            <option value="">Nenhum projeto vinculado</option>
                            {projects.map(project => (
                                <option key={project.id} value={project.id}>{project.title}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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
                            <label><DollarSign size={16} /> Orçamento Aprovado (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="input"
                                value={formData.approvedBudget}
                                onChange={e => setFormData({ ...formData, approvedBudget: e.target.value })}
                                placeholder="1500.00"
                            />
                        </div>
                    </div>
                </div>

                {/* Prestador */}
                <div className="card" style={{ marginBottom: "1.5rem" }}>
                    <h2 className="card-title">👤 Prestador Designado</h2>

                    {filteredProviders.length === 0 ? (
                        <p style={{ color: "#f59e0b", fontSize: "0.875rem" }}>
                            ⚠️ Nenhum prestador cadastrado para este tipo de serviço.{" "}
                            <a href="/admin/prestadores/novo" style={{ color: "#3b82f6" }}>Cadastrar prestador</a>
                        </p>
                    ) : (
                        <div className="form-group">
                            <label>Selecionar Prestador</label>
                            <select
                                className="input"
                                value={formData.providerId}
                                onChange={e => setFormData({ ...formData, providerId: e.target.value })}
                            >
                                <option value="">Sem prestador designado</option>
                                {filteredProviders.map(provider => (
                                    <option key={provider.id} value={provider.id}>{provider.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Entregáveis */}
                <div className="card" style={{ marginBottom: "1.5rem" }}>
                    <h2 className="card-title">📦 Entregáveis e Validação</h2>

                    <div className="form-group">
                        <label>Descrição dos Entregáveis</label>
                        <textarea
                            className="input"
                            rows={3}
                            value={formData.deliverables}
                            onChange={e => setFormData({ ...formData, deliverables: e.target.value })}
                            placeholder="Descreva os materiais ou serviços entregues..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Status da Validação</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.validationStatus}
                            onChange={e => setFormData({ ...formData, validationStatus: e.target.value })}
                            placeholder="Ex: Aprovado, Pendente de ajustes..."
                        />
                    </div>
                </div>

                {/* Ações */}
                <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate("/admin/acessibilidade")}
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
                        {saving ? "Salvando..." : (isEdit ? "Salvar Alterações" : "Criar Solicitação")}
                    </button>
                </div>
            </form>
        </div>
    );
};
