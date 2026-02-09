import React, { useEffect, useState } from "react";
import { api } from "../../../api/client";
import { Trash2, Plus, Search, CheckCircle, ShieldCheck, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

type Provider = {
    id: string;
    name: string;
    description: string;
    email: string;
    phone: string;
    services: string[];
    active: boolean;
    rating: number;
    completedJobs: number;
    tenantId?: string;
};

export const MasterProviders: React.FC = () => {
    const { t } = useTranslation();
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        email: "",
        phone: "",
        services: [] as string[],
        tenantId: ""
    });

    const serviceOptions = [
        "LIBRAS_INTERPRETATION",
        "AUDIO_DESCRIPTION",
        "CAPTIONING",
        "BRAILLE",
        "TACTILE_MODEL",
        "EASY_READING"
    ];

    const serviceLabels: Record<string, string> = {
        "LIBRAS_INTERPRETATION": "Libras",
        "AUDIO_DESCRIPTION": "Audiodescrição",
        "CAPTIONING": "Legendagem",
        "BRAILLE": "Braille",
        "TACTILE_MODEL": "Maquete Tátil",
        "EASY_READING": "Leitura Simples"
    };

    const fetchProviders = () => {
        setLoading(true);
        api.get("/providers")
            .then(res => setProviders(res.data))
            .catch(err => console.error("Error fetching providers", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/providers", formData);
            setModalOpen(false);
            setFormData({ name: "", description: "", email: "", phone: "", services: [], tenantId: "" });
            fetchProviders();
            alert("Prestador cadastrado com sucesso!");
        } catch (err) {
            console.error("Error creating provider", err);
            alert("Erro ao cadastrar prestador");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Tem certeza que deseja remover este prestador?")) return;
        try {
            await api.delete(`/providers/${id}`);
            setProviders(providers.filter(p => p.id !== id));
        } catch (err) {
            console.error("Error deleting provider", err);
            alert("Erro ao remover prestador");
        }
    };

    const handleToggleService = (service: string) => {
        setFormData(prev => {
            if (prev.services.includes(service)) {
                return { ...prev, services: prev.services.filter(s => s !== service) };
            } else {
                return { ...prev, services: [...prev.services, service] };
            }
        });
    };

    return (
        <div className="master-providers">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 className="section-title">🛠️ Prestadores de Acessibilidade</h1>
                    <p className="section-subtitle">Gerencie os parceiros homologados para serviços de acessibilidade</p>
                </div>
                <button onClick={() => setModalOpen(true)} className="btn btn-primary">
                    <Plus size={18} /> Novo Prestador
                </button>
            </div>

            {loading ? (
                <p>Carregando...</p>
            ) : providers.length === 0 ? (
                <div className="empty-state">
                    <p>Nenhum prestador cadastrado.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                    {providers.map(provider => (
                        <div key={provider.id} className="card" style={{ position: "relative" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                                <h3 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{provider.name}</h3>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    {provider.active && <CheckCircle size={18} color="#4cd964" />}
                                    <button onClick={() => handleDelete(provider.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ff4444" }}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ fontSize: "0.9rem", opacity: 0.7, marginBottom: "1rem" }}>
                                <p>📧 {provider.email || "Sem email"}</p>
                                <p>📞 {provider.phone || "Sem telefone"}</p>
                            </div>

                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
                                {provider.services.map(s => (
                                    <span key={s} className="chip" style={{ fontSize: "0.75rem" }}>
                                        {serviceLabels[s] || s}
                                    </span>
                                ))}
                            </div>

                            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem", display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                    <Star size={14} color="#ffd700" fill="#ffd700" />
                                    <span>{provider.rating?.toFixed(1) || "New"}</span>
                                </div>
                                <div>{provider.completedJobs} jobs</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Novo Prestador</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nome</label>
                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Descrição</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", borderRadius: "4px", padding: "0.5rem" }}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Telefone</label>
                                <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>

                            <div className="form-group">
                                <label>Serviços Oferecidos</label>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                                    {serviceOptions.map(opt => (
                                        <div key={opt}
                                            onClick={() => handleToggleService(opt)}
                                            style={{
                                                padding: "0.5rem",
                                                border: "1px solid rgba(255,255,255,0.2)",
                                                borderRadius: "4px",
                                                background: formData.services.includes(opt) ? "rgba(255,255,255,0.1)" : "transparent",
                                                cursor: "pointer",
                                                display: "flex", alignItems: "center", gap: "0.5rem"
                                            }}>
                                            <div style={{ width: "16px", height: "16px", border: "1px solid #ccc", background: formData.services.includes(opt) ? "#4cd964" : "transparent" }}></div>
                                            <span style={{ fontSize: "0.9rem" }}>{serviceLabels[opt]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancelar</button>
                                <button type="submit" className="btn btn-primary">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
