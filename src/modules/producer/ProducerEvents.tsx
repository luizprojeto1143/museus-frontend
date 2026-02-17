import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import { api } from "../../api/client";
import { Calendar, Plus, MapPin, Clock, Edit } from "lucide-react";

type Event = {
    id: string;
    title: string;
    description: string;
    coverUrl?: string;
    startDate: string;
    location?: string;
    active: boolean;
};

export const ProducerEvents: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) return;

        api.get("/events", { params: { tenantId } })
            .then(res => {
                // Backend might return { data: [], pagination: {} } or just []
                const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
                setEvents(data);
            })
            .catch(err => console.error("Error fetching events", err))
            .finally(() => setLoading(false));
    }, [tenantId]);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString();
    };

    return (
        <div className="producer-events" style={{ paddingBottom: "4rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", color: "#d4af37", marginBottom: "0.5rem" }}>Meus Eventos</h1>
                    <p style={{ opacity: 0.7 }}>Gerencie seus eventos, exposições e workshops.</p>
                </div>
                <button
                    onClick={() => navigate("/producer/events/new")}
                    className="btn-premium"
                    style={{
                        background: "#d4af37",
                        color: "#000",
                        border: "none",
                        padding: "0.8rem 1.5rem",
                        borderRadius: "0.5rem",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        cursor: "pointer"
                    }}
                >
                    <Plus size={20} /> Novo Evento
                </button>
            </div>

            {loading ? (
                <div style={{ padding: "2rem", textAlign: "center", opacity: 0.5 }}>Carregando projetos...</div>
            ) : events.length === 0 ? (
                <div style={{
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "1rem",
                    padding: "3rem",
                    textAlign: "center",
                    border: "1px dashed rgba(255,255,255,0.2)"
                }}>
                    <Calendar size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
                    <h3>Nenhum evento encontrado</h3>
                    <p style={{ opacity: 0.6, marginBottom: "1.5rem" }}>Comece criando seu primeiro evento ou exposição.</p>
                    <button
                        onClick={() => navigate("/producer/events/new")}
                        style={{
                            background: "transparent",
                            border: "1px solid #d4af37",
                            color: "#d4af37",
                            padding: "0.6rem 1.2rem",
                            borderRadius: "0.5rem",
                            cursor: "pointer"
                        }}
                    >
                        Criar Agora
                    </button>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                    {events.map(event => (
                        <div key={event.id} style={{
                            background: "#1e1e24",
                            borderRadius: "1rem",
                            overflow: "hidden",
                            border: "1px solid rgba(255,255,255,0.05)",
                            transition: "transform 0.2s"
                        }}>
                            {/* Cover Image */}
                            <div style={{
                                height: "160px",
                                background: event.coverUrl ? `url(${event.coverUrl}) center/cover` : "linear-gradient(135deg, #333, #222)",
                                position: "relative"
                            }}>
                                <span style={{
                                    position: "absolute",
                                    top: "1rem",
                                    right: "1rem",
                                    background: event.active ? "#4cd964" : "#ffcc00",
                                    color: event.active ? "black" : "black",
                                    padding: "0.2rem 0.6rem",
                                    borderRadius: "1rem",
                                    fontSize: "0.7rem",
                                    fontWeight: "bold"
                                }}>
                                    {event.active ? "ATIVO" : "RASCUNHO"}
                                </span>
                            </div>

                            {/* Content */}
                            <div style={{ padding: "1.5rem" }}>
                                <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "0.5rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {event.title}
                                </h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", opacity: 0.7, fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <Calendar size={14} /> {formatDate(event.startDate)}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <MapPin size={14} /> {event.location || "Local não informado"}
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/producer/events/${event.id}`)}
                                    style={{
                                        width: "100%",
                                        padding: "0.8rem",
                                        background: "rgba(255,255,255,0.05)",
                                        border: "none",
                                        borderRadius: "0.5rem",
                                        color: "white",
                                        cursor: "pointer",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                        fontWeight: "bold"
                                    }}
                                >
                                    <Edit size={16} /> Gerenciar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
