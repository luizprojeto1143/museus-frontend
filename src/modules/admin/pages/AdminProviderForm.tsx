import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { ArrowLeft, Save, User, Phone, Mail, Star, CheckCircle } from "lucide-react";

const ACCESSIBILITY_SERVICES = [
    { value: "LIBRAS_INTERPRETATION", label: "Interpretação em LIBRAS", icon: "🤟" },
    { value: "AUDIO_DESCRIPTION", label: "Audiodescrição", icon: "🎧" },
    { value: "CAPTIONING", label: "Legendagem", icon: "📝" },
    { value: "BRAILLE", label: "Material em Braille", icon: "⠿" },
    { value: "TACTILE_MODEL", label: "Maquete Tátil", icon: "🖐️" },
    { value: "EASY_READING", label: "Leitura Fácil", icon: "📖" }
];

export const AdminProviderForm: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        document: "",
        email: "",
        phone: "",
        services: [] as string[],
        rating: "",
        completedJobs: 0,
        active: true
    });

    useEffect(() => {
        if (id && tenantId) {
            setLoading(true);
            api.get(`/providers/${id}`)
                .then(res => {
                    const data = res.data;
                    setFormData({
                        name: data.name || "",
                        document: data.document || "",
                        email: data.email || "",
                        phone: data.phone || "",
                        services: data.services || [],
                        rating: data.rating?.toString() || "",
                        completedJobs: data.completedJobs || 0,
                        active: data.active ?? true
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
                rating: formData.rating ? parseFloat(formData.rating) : null
            };

            if (isEdit) {
                await api.put(`/providers/${id}`, payload);
            } else {
                await api.post("/providers", payload);
            }
            navigate("/admin/prestadores");
        } catch (error) {
            console.error("Erro ao salvar prestador:", error);
            alert("Erro ao salvar prestador. Verifique os dados.");
        } finally {
            setSaving(false);
        }
    };

    const toggleService = (service: string) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.includes(service)
                ? prev.services.filter(s => s !== service)
                : [...prev.services, service]
        }));
    };

    if (loading) {
        return <div className="loading">Carregando prestador...</div>;
    }

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
                <button
                    onClick={() => navigate("/admin/prestadores")}
                    style={{ background: "transparent", border: "none", cursor: "pointer", padding: "0.5rem" }}
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="section-title">{isEdit ? "Editar Prestador" : "Novo Prestador"}</h1>
                    <p className="section-subtitle">
                        {isEdit ? "Atualize as informações do prestador" : "Cadastre um novo prestador de acessibilidade"}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Informações Básicas */}
                <div className="card" style={{ marginBottom: "1.5rem" }}>
                    <h2 className="card-title"><User size={20} /> Informações do Prestador</h2>

                    <div className="form-group">
                        <label>Nome Completo / Razão Social *</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Maria Silva ou Acessibilidade LTDA"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>CPF/CNPJ</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.document}
                            onChange={e => setFormData({ ...formData, document: e.target.value })}
                            placeholder="000.000.000-00 ou 00.000.000/0000-00"
                        />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div className="form-group">
                            <label><Mail size={16} style={{ marginRight: "0.5rem" }} />E-mail</label>
                            <input
                                type="email"
                                className="input"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="contato@exemplo.com"
                            />
                        </div>
                        <div className="form-group">
                            <label><Phone size={16} style={{ marginRight: "0.5rem" }} />Telefone</label>
                            <input
                                type="tel"
                                className="input"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="(31) 99999-9999"
                            />
                        </div>
                    </div>
                </div>

                {/* Serviços */}
                <div className="card" style={{ marginBottom: "1.5rem" }}>
                    <h2 className="card-title">♿ Serviços Oferecidos</h2>
                    <p style={{ marginBottom: "1rem", color: "#6b7280", fontSize: "0.875rem" }}>
                        Selecione todos os serviços de acessibilidade que este prestador oferece:
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem" }}>
                        {ACCESSIBILITY_SERVICES.map(service => (
                            <button
                                key={service.value}
                                type="button"
                                onClick={() => toggleService(service.value)}
                                style={{
                                    padding: "1rem",
                                    borderRadius: "0.75rem",
                                    border: "2px solid",
                                    borderColor: formData.services.includes(service.value) ? "#22c55e" : "#e5e7eb",
                                    background: formData.services.includes(service.value) ? "rgba(34, 197, 94, 0.05)" : "white",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.75rem",
                                    textAlign: "left",
                                    transition: "all 0.2s"
                                }}
                            >
                                <span style={{ fontSize: "1.5rem" }}>{service.icon}</span>
                                <span style={{
                                    color: formData.services.includes(service.value) ? "#22c55e" : "#374151",
                                    fontWeight: formData.services.includes(service.value) ? 600 : 400
                                }}>
                                    {service.label}
                                </span>
                                {formData.services.includes(service.value) && (
                                    <CheckCircle size={18} color="#22c55e" style={{ marginLeft: "auto" }} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Avaliação e Histórico */}
                <div className="card" style={{ marginBottom: "1.5rem" }}>
                    <h2 className="card-title"><Star size={20} /> Avaliação e Histórico</h2>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div className="form-group">
                            <label>Avaliação (0-5)</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="5"
                                className="input"
                                value={formData.rating}
                                onChange={e => setFormData({ ...formData, rating: e.target.value })}
                                placeholder="4.5"
                            />
                        </div>
                        <div className="form-group">
                            <label>Trabalhos Concluídos</label>
                            <input
                                type="number"
                                min="0"
                                className="input"
                                value={formData.completedJobs}
                                onChange={e => setFormData({ ...formData, completedJobs: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", marginTop: "1rem" }}>
                        <input
                            type="checkbox"
                            checked={formData.active}
                            onChange={e => setFormData({ ...formData, active: e.target.checked })}
                            style={{ width: "1.25rem", height: "1.25rem" }}
                        />
                        <span>Prestador ativo (disponível para novos trabalhos)</span>
                    </label>
                </div>

                {/* Ações */}
                <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate("/admin/prestadores")}
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
                        {saving ? "Salvando..." : (isEdit ? "Salvar Alterações" : "Cadastrar Prestador")}
                    </button>
                </div>
            </form>
        </div>
    );
};
