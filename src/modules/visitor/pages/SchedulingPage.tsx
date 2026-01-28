import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { CalendarDays, Clock } from "lucide-react";
import "./Scheduling.css";

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
            const dateTime = new Date(`${selectedDate}T${selectedTime}:00`);

            await api.post("/bookings", {
                date: dateTime.toISOString(),
                tenantId
            });

            setMessage({ type: "success", text: t("visitor.scheduling.success", "Agendamento realizado com sucesso!") });
            fetchBookings();
            setSelectedDate("");
        } catch {
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
        } catch {
            setMessage({ type: "error", text: t("visitor.scheduling.cancelError", "Erro ao cancelar.") });
        }
    };

    return (
        <div className="scheduling-container">
            <header className="scheduling-header">
                <h1 className="scheduling-title">{t("visitor.scheduling.title", "Agendamento de Visitas")}</h1>
            </header>

            <div className="scheduling-form-card">
                <h2 className="scheduling-form-title">
                    <CalendarDays size={20} />
                    {t("visitor.scheduling.new", "Novo Agendamento")}
                </h2>
                <form onSubmit={handleSchedule} className="scheduling-form">
                    <div className="scheduling-form-group">
                        <label>{t("visitor.scheduling.date", "Data")}</label>
                        <input
                            type="date"
                            className="scheduling-input"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            required
                        />
                    </div>

                    <div className="scheduling-form-group">
                        <label><Clock size={14} /> {t("visitor.scheduling.time", "Horário")}</label>
                        <select
                            className="scheduling-select"
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
                        <div className={`scheduling-message ${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    <button type="submit" className="scheduling-submit-btn" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="scheduling-spinner"></span>
                                {t("common.sending", "Enviando...")}
                            </>
                        ) : t("visitor.scheduling.submit", "Agendar Visita")}
                    </button>
                </form>
            </div>

            <h2 className="scheduling-section-title">{t("visitor.scheduling.myBookings", "Meus Agendamentos")}</h2>
            <div className="scheduling-bookings-grid">
                {initialLoading ? (
                    <div className="scheduling-loading">
                        <div className="scheduling-loading-spinner"></div>
                        <p>{t("common.loading")}</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="scheduling-empty">
                        <div className="scheduling-empty-icon">📅</div>
                        <h3>{t("visitor.scheduling.emptyTitle", "Nenhum agendamento")}</h3>
                        <p>{t("visitor.scheduling.emptyDesc", "Você ainda não tem visitas agendadas. Use o formulário acima para marcar uma visita.")}</p>
                    </div>
                ) : (
                    bookings.map((booking) => (
                        <article
                            key={booking.id}
                            className={`scheduling-booking-card ${booking.status === "CANCELLED" ? 'cancelled' : 'confirmed'}`}
                        >
                            <div className="scheduling-booking-header">
                                <div>
                                    <h3 className="scheduling-booking-date">
                                        {new Date(booking.date).toLocaleDateString()} às {new Date(booking.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </h3>
                                    <p className="scheduling-booking-venue">{booking.tenant.name}</p>
                                    <span className={`scheduling-booking-badge ${booking.status === "CANCELLED" ? 'cancelled' : 'confirmed'}`}>
                                        {booking.status === "CANCELLED" ? t("common.cancelled", "Cancelado") : t("common.confirmed", "Confirmado")}
                                    </span>
                                </div>
                                {booking.status !== "CANCELLED" && (
                                    <button
                                        onClick={() => handleCancel(booking.id)}
                                        className="scheduling-cancel-btn"
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
    );
};
