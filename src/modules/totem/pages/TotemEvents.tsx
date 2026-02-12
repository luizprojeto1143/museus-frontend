import React, { useState, useEffect } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Calendar, Users, CheckCircle, Clock } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const TotemEvents: React.FC = () => {
    const { tenantId } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, [tenantId]);

    const fetchEvents = async () => {
        try {
            // Fetch events for today (or all upcoming)
            // Ideally backend supports date filter. Using generic list for now.
            const res = await api.get(`/events?tenantId=${tenantId}`);
            setEvents(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar eventos");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "2rem", height: "100%", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "2rem", gap: "1rem" }}>
                <button
                    onClick={() => navigate('/totem')}
                    style={{
                        background: "rgba(255,255,255,0.1)",
                        border: "none",
                        color: "#fff",
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        cursor: "pointer"
                    }}
                >
                    ← Voltar
                </button>
                <h1 style={{ margin: 0, fontSize: "2rem" }}>Eventos do Dia</h1>
            </div>

            {loading ? (
                <div style={{ color: "#fff", textAlign: "center", marginTop: "4rem" }}>Carregando...</div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "1.5rem"
                }}>
                    {events.map(event => (
                        <div key={event.id} className="event-card" style={{
                            background: "rgba(30, 30, 36, 0.8)",
                            borderRadius: "16px",
                            padding: "1.5rem",
                            border: "1px solid rgba(255,255,255,0.1)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem"
                        }}>
                            <div>
                                <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.4rem", color: "#d4af37" }}>{event.title}</h3>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>
                                    <Clock size={16} />
                                    <span>{new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>

                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                background: "rgba(0,0,0,0.2)",
                                padding: "1rem",
                                borderRadius: "8px"
                            }}>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{event.registrationsCount || 0}</div>
                                    <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>Inscritos</div>
                                </div>
                                <div style={{ width: "1px", background: "rgba(255,255,255,0.1)" }}></div>
                                <div style={{ textAlign: "center", color: "#22c55e" }}>
                                    <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{event.checkedInCount || 0}</div>
                                    <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>Presentes</div>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/totem/eventos/${event.id}`)}
                                style={{
                                    width: "100%",
                                    padding: "1rem",
                                    background: "#3b82f6",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "1rem",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "0.5rem"
                                }}
                            >
                                <Users size={20} />
                                Lista de Presença
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .event-card:hover {
                    transform: translateY(-2px);
                    border-color: #d4af37;
                    transition: all 0.2s;
                }
            `}</style>
        </div>
    );
};
