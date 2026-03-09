import React, { useState, useEffect } from "react";
import { api } from "../../../api/client";
import { useTranslation } from "react-i18next";
import { MasterLayout } from "../MasterLayout";
import { HandMetal, Plus, Edit, Trash2, CheckCircle, Clock, XCircle } from "lucide-react";
import "./MasterShared.css";

interface InPersonService {
    id: string;
    name: string;
    description: string | null;
    active: boolean;
    tenantId: string;
}

interface BookingRequest {
    id: string;
    date: string;
    startTime: string | null;
    endTime: string | null;
    status: string;
    participants: number | null;
    inPersonService: InPersonService;
    tenant: { name: string };
    space: { name: string } | null;
    event: { title: string } | null;
    user: { name: string; email: string };
}

export const MasterInPersonServices: React.FC = () => {
    const { t } = useTranslation();
    const [services, setServices] = useState<InPersonService[]>([]);
    const [requests, setRequests] = useState<BookingRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editService, setEditService] = useState<InPersonService | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        active: true,
        tenantId: "8cc9b546-7f7d-4908-a6cf-acdd7b86982b" // QS Inclusão default
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [servicesRes, requestsRes] = await Promise.all([
                api.get("/in-person-services?tenantId=8cc9b546-7f7d-4908-a6cf-acdd7b86982b"), // Fetch for QS Inclusão tenant
                api.get("/bookings/in-person?tenantId=8cc9b546-7f7d-4908-a6cf-acdd7b86982b")
            ]);
            setServices(servicesRes.data);
            setRequests(requestsRes.data);
        } catch (error) {
            console.error(error);
            alert("Erro ao carregar dados.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveService = async () => {
        if (!formData.name) return alert("O nome é obrigatório.");

        try {
            if (editService) {
                await api.put(`/in-person-services/${editService.id}`, formData);
                alert("Serviço atualizado com sucesso!");
            } else {
                await api.post("/in-person-services", formData);
                alert("Serviço criado com sucesso!");
            }
            setIsAddModalOpen(false);
            setEditService(null);
            setFormData({ name: "", description: "", active: true, tenantId: "8cc9b546-7f7d-4908-a6cf-acdd7b86982b" });
            loadData();
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar serviço.");
        }
    };

    const handleDeleteService = async (id: string) => {
        if (!window.confirm("Certeza que deseja remover este serviço?")) return;
        try {
            await api.delete(`/in-person-services/${id}`);
            alert("Serviço removido com sucesso!");
            loadData();
        } catch (error) {
            console.error(error);
            alert("Erro ao remover serviço.");
        }
    };

    const openEditModal = (service: InPersonService) => {
        setEditService(service);
        setFormData({ name: service.name, description: service.description || "", active: service.active, tenantId: service.tenantId });
        setIsAddModalOpen(true);
    };

    const handleUpdateBookingStatus = async (id: string, newStatus: string) => {
        try {
            await api.put(`/bookings/${id}`, { status: newStatus });
            alert("Status atualizado!");
            loadData();
        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar status do agendamento.");
        }
    };

    if (loading) {
        return (
            <div className="master-card" style={{ textAlign: "center", padding: "4rem" }}>
                <p style={{ color: "#94a3b8" }}>{t("common.loading")}</p>
            </div>
        );
    }

    return (
        <div className="master-page-container">
            {/* HERO SECTION */}
            <section className="master-hero">
                <div className="master-hero-content">
                    <span className="master-badge">
                        🤝 {t("master.inPersonServices.heroBadge", "Serviços Presenciais")}
                    </span>
                    <h1 className="master-title">
                        {t("master.inPersonServices.heroTitle", "Configuração e Demandas")}
                    </h1>
                    <p className="master-subtitle">
                        {t("master.inPersonServices.heroSubtitle", "Gerencie os tipos de serviços oferecidos pelo Master e acompanhe os agendamentos realizados pelos museus.")}
                    </p>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                {/* SERVICES CONFIGURATION */}
                <div className="master-card" style={{ height: 'fit-content' }}>
                    <div className="master-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className="master-icon-wrapper master-icon-blue">
                                <HandMetal size={24} />
                            </div>
                            <h3 style={{ margin: 0 }}>{t("master.inPersonServices.card1Title", "Serviços Ofertados")}</h3>
                        </div>
                        <button
                            className="master-btn btn-primary"
                            style={{ padding: '0.4rem 0.8rem', width: 'auto', fontSize: '0.8rem' }}
                            onClick={() => {
                                setEditService(null);
                                setFormData({ name: "", description: "", active: true, tenantId: "8cc9b546-7f7d-4908-a6cf-acdd7b86982b" });
                                setIsAddModalOpen(true);
                            }}
                        >
                            <Plus size={14} /> Novo
                        </button>
                    </div>

                    {services.length === 0 ? (
                        <p style={{ color: "#94a3b8", padding: "1rem" }}>{t("master.inpersonservices.nenhumServioConfigurado", `Nenhum serviço configurado.`)}</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
                            {services.map(srv => (
                                <div key={srv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                    <div>
                                        <h4 style={{ color: '#fff', margin: '0 0 0.25rem 0' }}>
                                            {srv.name}
                                            {!srv.active && <span className="master-badge" style={{ backgroundColor: '#ef444422', color: '#f87171', border: 'none', marginLeft: '0.5rem', padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>INATIVO</span>}
                                        </h4>
                                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>{srv.description || "Sem descrição"}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => openEditModal(srv)} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: '0.5rem' }} title="Editar">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDeleteService(srv.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.5rem' }} title="Remover">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* INCOMING REQUESTS */}
                <div className="master-card">
                    <div className="master-card-header">
                        <div className="master-icon-wrapper master-icon-yellow">
                            <Clock size={24} />
                        </div>
                        <h3 style={{ margin: 0 }}>{t("master.inPersonServices.card2Title", "Solicitações de Agendamento")} ({requests.length})</h3>
                    </div>

                    {requests.length === 0 ? (
                        <p style={{ color: "#94a3b8", padding: "1rem" }}>{t("master.inpersonservices.nenhumaSolicitaoRecebida", `Nenhuma solicitação recebida.`)}</p>
                    ) : (
                        <div className="master-table-container">
                            <table className="master-table">
                                <thead>
                                    <tr>
                                        <th>{t("master.inpersonservices.instituio", `Instituição`)}</th>
                                        <th>{t("master.inpersonservices.servioSolicitado", `Serviço Solicitado`)}</th>
                                        <th>Detalhes (Data/Local)</th>
                                        <th>Status</th>
                                        <th>{t("master.inpersonservices.aes", `Ações`)}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map(req => (
                                        <tr key={req.id}>
                                            <td>
                                                <div style={{ fontWeight: 'bold' }}>{req.tenant.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{req.user.name} ({req.user.email})</div>
                                            </td>
                                            <td style={{ color: '#60a5fa', fontWeight: 'bold' }}>{req.inPersonService.name}</td>
                                            <td>
                                                <div style={{ fontSize: '0.85rem' }}>{new Date(req.date).toLocaleDateString()}</div>
                                                {req.startTime && (
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                        {new Date(req.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {' as '}
                                                        {req.endTime ? new Date(req.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '?'}
                                                    </div>
                                                )}
                                                {req.space && <div className="master-badge" style={{ marginTop: '0.25rem' }}>{req.space.name}</div>}
                                                {req.event && <div className="master-badge" style={{ backgroundColor: '#a855f722', color: '#d8b4fe', border: 'none', marginTop: '0.25rem' }}>{req.event.title}</div>}
                                            </td>
                                            <td>
                                                <span className="master-badge" style={{
                                                    background: req.status === "PENDING" ? "rgba(249, 115, 22, 0.2)" : req.status === "CONFIRMED" ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
                                                    color: req.status === "PENDING" ? "#fb923c" : req.status === "CONFIRMED" ? "#4ade80" : "#f87171",
                                                    border: "none"
                                                }}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td style={{ display: 'flex', gap: '0.5rem' }}>
                                                {req.status === "PENDING" && (
                                                    <button
                                                        title="Confirmar"
                                                        style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '0.4rem', borderRadius: '4px', color: '#4ade80', cursor: 'pointer' }}
                                                        onClick={() => handleUpdateBookingStatus(req.id, "CONFIRMED")}
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                                {(req.status === "PENDING" || req.status === "CONFIRMED") && (
                                                    <button
                                                        title="Cancelar"
                                                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.4rem', borderRadius: '4px', color: '#f87171', cursor: 'pointer' }}
                                                        onClick={() => handleUpdateBookingStatus(req.id, "CANCELLED")}
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ADD/EDIT MODAL */}
            {isAddModalOpen && (
                <div style={{
                    position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
                    padding: "1rem"
                }}>
                    <div className="master-card" style={{ width: "100%", maxWidth: "500px", margin: 0 }}>
                        <h3 style={{ marginBottom: "1.5rem" }}>{editService ? "Editar Serviço" : "Novo Serviço"}</h3>

                        <div className="master-input-group">
                            <label>{t("master.inpersonservices.nomeDoServio", `Nome do Serviço`)}</label>
                            <input
                                type="text"
                                className="master-input"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder={t("master.inpersonservices.exIntrpreteDeLibras", `Ex: Intérprete de Libras`)}
                            />
                        </div>

                        <div className="master-input-group mt-4">
                            <label>{t("master.inpersonservices.descrio", `Descrição`)}</label>
                            <textarea
                                className="master-input"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                placeholder={t("master.inpersonservices.descrevaOsDetalhesDesteServio", `Descreva os detalhes deste serviço...`)}
                            />
                        </div>

                        <div className="mt-4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                id="active_toggle"
                                checked={formData.active}
                                onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                style={{ width: '1.2rem', height: '1.2rem', accentColor: '#3b82f6', cursor: 'pointer' }}
                            />
                            <label htmlFor="active_toggle" style={{ cursor: 'pointer', color: '#e2e8f0', fontSize: '0.9rem' }}>{t("master.inpersonservices.ativoDisponvelParaAgendamento", `Ativo (Disponível para agendamento)`)}</label>
                        </div>

                        <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", justifyContent: "flex-end" }}>
                            <button
                                className="master-btn btn-secondary"
                                onClick={() => setIsAddModalOpen(false)}
                                style={{ width: 'auto', border: '1px solid #334155', color: '#94a3b8' }}
                            >
                                Cancelar
                            </button>
                            <button
                                className="master-btn btn-primary"
                                onClick={handleSaveService}
                                style={{ width: 'auto' }}
                            >{t("master.inpersonservices.salvarServio", `
                                Salvar Serviço
                            `)}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
