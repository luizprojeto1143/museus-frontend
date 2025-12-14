import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

type Booking = {
    id: string;
    date: string;
    status: string;
    tenant: {
        name: string;
    };
};

export const SchedulingPage: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("10:00");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setInitialLoading(true);
        try {
            const res = await api.get("/bookings/my");
            setBookings(res.data);
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !selectedTime) return;

        setLoading(true);
        setMessage(null);

        try {
            // Combine date and time into ISO string
            const dateTime = new Date(`${selectedDate}T${selectedTime}:00`);

            await api.post("/bookings", {
                date: dateTime.toISOString(),
                tenantId
            });

            setMessage({ type: "success", text: t("visitor.scheduling.success", "Agendamento realizado com sucesso!") });
            fetchBookings();
            setSelectedDate("");
        } catch (error) {
            setMessage({ type: "error", text: t("visitor.scheduling.error", "Erro ao realizar agendamento.") });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm(t("visitor.scheduling.confirmCancel", "Tem certeza que deseja cancelar?"))) return;

        try {
            await api.delete(`/bookings/${id}`);
            fetchBookings();
        } catch (error) {
            alert(t("visitor.scheduling.cancelError", "Erro ao cancelar."));
        }
    };

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem" }}>
            <h1 className="section-title">{t("visitor.scheduling.title", "Agendamento de Visitas")}</h1>

            <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
                <h2 className="card-title">{t("visitor.scheduling.new", "Novo Agendamento")}</h2>
                <form onSubmit={handleSchedule} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem" }}>{t("visitor.scheduling.date", "Data")}</label>
                        <input
                            type="date"
                            className="input"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem" }}>{t("visitor.scheduling.time", "Horário")}</label>
                        <select
                            className="input"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            required
                        >
                            <option value="09:00">09:00</option>
                            <option value="10:00">10:00</option>
                            <option value="11:00">11:00</option>
                            <option value="13:00">13:00</option>
                            <option value="14:00">14:00</option>
                            <option value="15:00">15:00</option>
                            <option value="16:00">16:00</option>
                        </select>
                    </div>

                    {message && (
                        <div style={{
                            padding: "0.75rem",
                            borderRadius: "0.5rem",
                            backgroundColor: message.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                            color: message.type === "success" ? "#10b981" : "#ef4444"
                        }}>
                            {message.text}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        {loading ? (
                            <>
                                <span className="spinner" style={{ width: "16px", height: "16px", border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></span>
                                {t("common.sending", "Enviando...")}
                            </>
                        ) : t("visitor.scheduling.submit", "Agendar Visita")}
                    </button>
                </form>
            </div>

            <h2 className="section-title">{t("visitor.scheduling.myBookings", "Meus Agendamentos")}</h2>
            <div className="card-grid">
                <div className="card-grid">
                    {initialLoading ? (
                        <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem" }}>
                            <div className="spinner" style={{ width: "30px", height: "30px", border: "3px solid #ccc", borderTopColor: "var(--primary-color)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 1rem auto" }}></div>
                            <p>{t("common.loading")}</p>
                            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem" }}>
                            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📅</div>
                            <h3>{t("visitor.scheduling.emptyTitle", "Nenhum agendamento")}</h3>
                            <p style={{ color: "#9ca3af" }}>{t("visitor.scheduling.emptyDesc", "Você ainda não tem visitas agendadas. Use o formulário acima para marcar uma visita.")}</p>
                        </div>
                    ) : (
                        bookings.map((booking) => (
                            <article key={booking.id} className="card" style={{ borderLeft: booking.status === "CANCELLED" ? "4px solid #ef4444" : "4px solid #10b981" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <h3 className="card-title">
                                            {new Date(booking.date).toLocaleDateString()} às {new Date(booking.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </h3>
                                        <p className="card-subtitle">{booking.tenant.name}</p>
                                        <span className="badge" style={{
                                            backgroundColor: booking.status === "CANCELLED" ? "#ef4444" : "#10b981",
                                            color: "white",
                                            marginTop: "0.5rem",
                                            display: "inline-block"
                                        }}>
                                            {booking.status === "CANCELLED" ? t("common.cancelled", "Cancelado") : t("common.confirmed", "Confirmado")}
                                        </span>
                                    </div>
                                    {booking.status !== "CANCELLED" && (
                                        <button
                                            onClick={() => handleCancel(booking.id)}
                                            className="btn"
                                            style={{ color: "#ef4444", padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                                        >
                                            {t("common.cancel", "Cancelar")}
                                        </button>
                                    )}
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
