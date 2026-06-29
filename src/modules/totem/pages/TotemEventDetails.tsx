import React, { useState, useEffect } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { Users, CheckCircle, Search, ArrowLeft, Ticket } from "lucide-react";
import { toast } from "react-hot-toast";

import { useTranslation } from "react-i18next";

export const TotemEventDetails: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const { tenantId } = useAuth();
    const navigate = useNavigate();

    const [event, setEvent] = useState<any>(null);
    const [attendees, setAttendees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");

    useEffect(() => {
        if (id && tenantId) {
            fetchDetails();
        }
    }, [id, tenantId]);

    const fetchDetails = async () => {
        try {
            const [eventRes, attendeesRes] = await Promise.all([
                api.get(`/events/${id}`),
                api.get(`/registrations?eventId=${id}&limit=1000`)
            ]);
            setEvent(eventRes.data);
            setAttendees(attendeesRes.data.data);
        } catch (error: any) {
            console.error(error);
            toast.error(t("totem.event_details.load_error", "Erro ao carregar detalhes"));
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (code: string) => {
        try {
            await api.post('/registrations/checkin', { code });
            toast.success(t("totem.event_details.checkin_success", "Check-in realizado!"));
            // Update local state to avoid full reload
            setAttendees(prev => prev.map(att =>
                att.code === code ? { ...att, status: 'CHECKED_IN' } : att
            ));
        } catch (error: any) {
            toast.error(error.response?.data?.error || t("totem.event_details.checkin_error", "Erro no check-in"));
        }
    };

    const filteredAttendees = attendees.filter(att => {
        const search = filter.toLowerCase();
        const name = att.guestName || att.visitor?.name || "";
        const email = att.guestEmail || att.visitor?.email || "";
        const code = att.code || "";
        return name.toLowerCase().includes(search) ||
            email.toLowerCase().includes(search) ||
            code.toLowerCase().includes(search);
    });

    const checkedInCount = attendees.filter(a => a.status === 'CHECKED_IN').length;

    return (
        <div style={{ padding: "2rem", height: "100%", overflowY: "auto" }}>
            <button
                onClick={() => navigate('/totem/eventos')}
                style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "none",
                    color: "#fff",
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                    marginBottom: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                }}
            >
                <ArrowLeft size={20} />
                {t("totem.event_details.back_btn", "Voltar")}
            </button>

            {loading ? (
                <div style={{ color: "#fff", textAlign: "center" }}>{t("totem.event_details.loading", "Carregando...")}</div>
            ) : event && (
                <>
                    <div style={{
                        background: "rgba(30, 30, 36, 0.8)",
                        padding: "2rem",
                        borderRadius: "16px",
                        marginBottom: "2rem",
                        border: "1px solid rgba(255,255,255,0.1)"
                    }}>
                        <h1 style={{ margin: "0 0 1rem", color: "var(--accent-primary)" }}>{event.title}</h1>
                        <div style={{ display: "flex", gap: "2rem", color: "rgba(255,255,255,0.7)" }}>
                            <div>
                                <strong>{t("totem.event_details.date_label", "Data:")}</strong> {new Date(event.startDate).toLocaleDateString()}
                            </div>
                            <div>
                                <strong>{t("totem.event_details.time_label", "Hora:")}</strong> {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div>
                                <strong>{t("totem.event_details.total_attendees_label", "Total Inscritos:")}</strong> {attendees.length}
                            </div>
                            <div style={{ color: "#22c55e" }}>
                                <strong>{t("totem.event_details.present_label", "Presentes:")}</strong> {checkedInCount}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: "2rem", position: "relative" }}>
                        <Search style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.5)" }} />
                        <input
                            type="text"
                            placeholder={t("totem.event_details.search_placeholder", "Buscar na lista...")}
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "1rem 1rem 1rem 3rem",
                                borderRadius: "12px",
                                background: "rgba(255,255,255,0.1)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: "#fff",
                                fontSize: "1rem",
                                outline: "none"
                            }}
                        />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {filteredAttendees.map(att => (
                            <div key={att.id} style={{
                                background: "rgba(255,255,255,0.05)",
                                padding: "1.5rem",
                                borderRadius: "12px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                borderLeft: att.status === 'CHECKED_IN' ? "4px solid #22c55e" : "4px solid transparent"
                            }}>
                                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                    <div style={{
                                        width: "40px", height: "40px",
                                        background: "rgba(255,255,255,0.1)",
                                        borderRadius: "50%",
                                        display: "flex", alignItems: "center", justifyContent: "center"
                                    }}>
                                        <Users size={20} color="#fff" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{att.guestName || att.visitor?.name || t("totem.event_details.visitor_default", "Visitante")}</h3>
                                        <p style={{ margin: "0.2rem 0 0", opacity: 0.5, fontSize: "0.9rem" }}>
                                            Code: {att.code} • {att.guestEmail || att.visitor?.email}
                                        </p>
                                    </div>
                                </div>

                                {att.status === 'CHECKED_IN' ? (
                                    <span style={{ color: "#22c55e", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <CheckCircle size={20} />
                                        {t("totem.event_details.status_present", "Presente")}
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => handleCheckIn(att.code)}
                                        style={{
                                            background: "var(--accent-primary)",
                                            color: "#000",
                                            border: "none",
                                            padding: "0.8rem 1.5rem",
                                            borderRadius: "8px",
                                            fontWeight: "bold",
                                            cursor: "pointer"
                                        }}
                                    >
                                        {t("totem.event_details.checkin_btn", "Check-in")}
                                    </button>
                                )}
                            </div>
                        ))}

                        {filteredAttendees.length === 0 && (
                            <div style={{ textAlign: "center", padding: "2rem", opacity: 0.5 }}>
                                {t("totem.event_details.no_attendees_found", "Nenhum participante encontrado")}
                            </div>
                        )}
                    </div>
                </>
            )}
            <style>{`
                input:focus {
                    border-color: var(--accent-primary) !important;
                }
            `}</style>
        </div>
    );
};
