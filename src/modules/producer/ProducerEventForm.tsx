import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../api/client";
import { useAuth } from "../auth/AuthContext";
import { Save, ArrowLeft, Calendar, MapPin, Image as ImageIcon, AlignLeft, Tag } from "lucide-react";

export const ProducerEventForm: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { tenantId } = useAuth();

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]); // New state
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        categoryId: "", // New field
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        coverUrl: "",
        location: "",
        visibility: "PUBLIC",
        status: "DRAFT" // New default
    });

    useEffect(() => {
        // Fetch categories
        api.get("/categories", { params: { tenantId } })
            .then(res => setCategories(res.data))
            .catch(err => console.error("Error fetching categories", err));

        if (id) {
            setLoading(true);
            api.get(`/events/${id}`)
                .then(res => {
                    const ev = res.data;
                    setFormData({
                        title: ev.title,
                        description: ev.description || "",
                        categoryId: ev.categoryId || "", // Set category
                        startDate: ev.startDate ? ev.startDate.split('T')[0] : "",
                        startTime: ev.startDate ? new Date(ev.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
                        endDate: ev.endDate ? ev.endDate.split('T')[0] : "",
                        endTime: ev.endDate ? new Date(ev.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
                        coverUrl: ev.coverUrl || "",
                        location: ev.location || "",
                        visibility: ev.visibility || "PUBLIC",
                        status: ev.status || "DRAFT"
                    });
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [id, tenantId]); // Added tenantId to dependency array for category fetch

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Combine date and time
        const startDateTime = new Date(`${formData.startDate}T${formData.startTime || "00:00"}`);
        const endDateTime = formData.endDate ? new Date(`${formData.endDate}T${formData.endTime || "23:59"}`) : null;

        const payload = {
            ...formData,
            startDate: startDateTime.toISOString(),
            endDate: endDateTime?.toISOString(),
            tenantId
        };

        try {
            if (id) {
                await api.put(`/events/${id}`, payload);
            } else {
                await api.post("/events", payload);
            }
            navigate("/producer/events");
        } catch (error) {
            console.error("Error saving event", error);
            alert("Erro ao salvar projeto. Verifique os dados.");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        display: "block",
        width: "100%",
        padding: "0.8rem",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "0.5rem",
        color: "white",
        marginTop: "0.5rem"
    };

    const labelStyle = {
        display: "block",
        fontSize: "0.9rem",
        opacity: 0.7,
        marginTop: "1.5rem"
    };

    return (
        <div className="producer-event-form" style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
                <button onClick={() => navigate("/producer/events")} style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}>
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ fontSize: "2rem", color: "#d4af37", margin: 0 }}>
                    {id ? "Editar Projeto" : "Novo Projeto"}
                </h1>
            </div>

            <form onSubmit={handleSubmit} style={{ background: "linear-gradient(145deg, #1e1e24, #15151a)", padding: "2rem", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.05)" }}>

                <label style={{ ...labelStyle, marginTop: 0 }}>Título do Projeto</label>
                <div style={{ position: "relative" }}>
                    <AlignLeft size={18} style={{ position: "absolute", top: "1.2rem", left: "0.8rem", opacity: 0.5 }} />
                    <input
                        required
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        style={{ ...inputStyle, paddingLeft: "2.5rem", fontSize: "1.1rem" }}
                        placeholder="Ex: Festival de Jazz 2024"
                    />
                </div>

                <label style={labelStyle}>Descrição</label>
                <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
                    placeholder="Descreva o evento, atrações e detalhes importantes..."
                />

                <label style={labelStyle}>Categoria</label>
                <div style={{ position: "relative" }}>
                    <Tag size={18} style={{ position: "absolute", top: "1.2rem", left: "0.8rem", opacity: 0.5 }} />
                    <select
                        value={formData.categoryId}
                        onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                        style={{ ...inputStyle, paddingLeft: "2.5rem", appearance: "none" }}
                    >
                        <option value="">Selecione uma categoria (Opcional)</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                        <label style={labelStyle}>Data Início</label>
                        <input
                            type="date"
                            required
                            value={formData.startDate}
                            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Horário Início</label>
                        <input
                            type="time"
                            value={formData.startTime}
                            onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                            style={inputStyle}
                        />
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                        <label style={labelStyle}>Data Fim (Opcional)</label>
                        <input
                            type="date"
                            value={formData.endDate}
                            onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Horário Fim</label>
                        <input
                            type="time"
                            value={formData.endTime}
                            onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                            style={inputStyle}
                        />
                    </div>
                </div>

                <label style={labelStyle}>Localização</label>
                <div style={{ position: "relative" }}>
                    <MapPin size={18} style={{ position: "absolute", top: "1.2rem", left: "0.8rem", opacity: 0.5 }} />
                    <input
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        style={{ ...inputStyle, paddingLeft: "2.5rem" }}
                        placeholder="Ex: Teatro Municipal - Sala 2"
                    />
                </div>

                <label style={labelStyle}>URL da Imagem de Capa</label>
                <div style={{ position: "relative" }}>
                    <ImageIcon size={18} style={{ position: "absolute", top: "1.2rem", left: "0.8rem", opacity: 0.5 }} />
                    <input
                        value={formData.coverUrl}
                        onChange={e => setFormData({ ...formData, coverUrl: e.target.value })}
                        style={{ ...inputStyle, paddingLeft: "2.5rem" }}
                        placeholder="https://..."
                    />
                </div>

                <div style={{ marginTop: "1.5rem", background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "0.5rem" }}>
                    <label style={{ ...labelStyle, marginTop: 0, marginBottom: "0.5rem" }}>Status do Evento</label>
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, status: "DRAFT" })}
                            style={{
                                flex: 1,
                                padding: "0.8rem",
                                borderRadius: "0.5rem",
                                border: formData.status === "DRAFT" ? "1px solid #94a3b8" : "1px solid rgba(255,255,255,0.1)",
                                background: formData.status === "DRAFT" ? "rgba(148,163,184,0.1)" : "transparent",
                                color: formData.status === "DRAFT" ? "#94a3b8" : "rgba(255,255,255,0.5)",
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                        >
                            Rascunho
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, status: "PUBLISHED" })}
                            style={{
                                flex: 1,
                                padding: "0.8rem",
                                borderRadius: "0.5rem",
                                border: formData.status === "PUBLISHED" ? "1px solid #10b981" : "1px solid rgba(255,255,255,0.1)",
                                background: formData.status === "PUBLISHED" ? "rgba(16,185,129,0.1)" : "transparent",
                                color: formData.status === "PUBLISHED" ? "#10b981" : "rgba(255,255,255,0.5)",
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                        >
                            Publicado
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-premium"
                        style={{
                            flex: 1,
                            background: "#d4af37",
                            color: "#000",
                            border: "none",
                            padding: "1rem",
                            borderRadius: "0.5rem",
                            fontWeight: "bold",
                            fontSize: "1rem",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "0.5rem",
                            cursor: loading ? "wait" : "pointer",
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        <Save size={20} /> {loading ? "Salvando..." : "Salvar Projeto"}
                    </button>
                </div>

            </form>
        </div>
    );
};
