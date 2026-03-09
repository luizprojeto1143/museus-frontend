import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useToast } from "../../../contexts/ToastContext";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2, Clock, MapPin, Edit2, Trash2, Plus, X } from "lucide-react";
import { Button } from "../../../components/ui";
import { useAuth } from "../../auth/AuthContext";

// --- Types ---
type Booking = {
    id: string;
    date: string; // ISO
    startTime?: string;
    endTime?: string;
    purpose?: string;
    space?: {
        name: string;
        type: string;
    };
    user?: {
        name: string;
    };
    status: string;
};

type Space = {
    id: string;
    name: string;
    type?: string;
};

// --- Utils ---
const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Start from the Sunday before the first day
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    // End on the Saturday after the last day
    const endDate = new Date(lastDay);
    if (endDate.getDay() !== 6) {
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    }

    const days = [];
    let current = new Date(startDate);
    while (current <= endDate) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    return days;
};

export const AdminCalendar: React.FC = () => {
  const { t } = useTranslation();
    const { tenantId } = useAuth();
    const { addToast } = useToast();

    // State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        spaceId: "",
        startTime: "09:00",
        endTime: "10:00",
        purpose: ""
    });

    // --- Effects ---
    useEffect(() => {
        if (tenantId) fetchSpaces();
    }, [tenantId]);

    useEffect(() => {
        if (tenantId) fetchBookings();
    }, [tenantId, currentDate]);

    // --- Actions ---
    const fetchSpaces = async () => {
        try {
            const res = await api.get("/spaces");
            setSpaces(res.data);
            if (res.data.length > 0) {
                setFormData(prev => ({ ...prev, spaceId: res.data[0].id }));
            }
        } catch (e) {
            console.error("Erro ao carregar espaços", e);
        }
    };

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const res = await api.get("/bookings", { params: { year, month, tenantId } });
            setBookings(res.data);
        } catch (e) {
            console.error("Erro ao carregar reservas", e);
            addToast("Erro ao carregar reservas", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !formData.spaceId) return;

        setIsSubmitting(true);
        try {
            // Construct ISO dates
            const dateStub = selectedDate.toISOString().split('T')[0];
            const startISO = `${dateStub}T${formData.startTime}:00`;
            const endISO = `${dateStub}T${formData.endTime}:00`;

            const payload = {
                tenantId,
                spaceId: formData.spaceId,
                date: new Date(startISO).toISOString(),
                startTime: new Date(startISO).toISOString(),
                endTime: new Date(endISO).toISOString(),
                purpose: formData.purpose,
                status: "CONFIRMED"
            };

            if (editingId) {
                await api.put(`/bookings/${editingId}`, payload);
                addToast("Reserva atualizada!", "success");
            } else {
                await api.post("/bookings", payload);
                addToast("Reserva criada!", "success");
            }

            setIsModalOpen(false);
            setEditingId(null);
            fetchBookings();
        } catch (err: any) {
            const msg = err.response?.data?.message || "Erro ao salvar";
            addToast(msg, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Excluir esta reserva?")) return;
        try {
            await api.delete(`/bookings/${id}`, { params: { hard: "true" } });
            addToast("Reserva excluída", "success");
            fetchBookings();
        } catch {
            addToast("Erro ao excluir", "error");
        }
    };

    const openNewModal = () => {
        setEditingId(null);
        setFormData(prev => ({ ...prev, purpose: "", startTime: "09:00", endTime: "10:00" }));
        setIsModalOpen(true);
    };

    const openEditModal = (b: Booking) => {
        setEditingId(b.id);
        const sTime = b.startTime ? new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : "09:00";
        const eTime = b.endTime ? new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : "10:00";

        setFormData({
            spaceId: (b as any).spaceId || spaces.find(s => s.name === b.space?.name)?.id || spaces[0]?.id || "",
            startTime: sTime,
            endTime: eTime,
            purpose: b.purpose || ""
        });
        setIsModalOpen(true);
    };

    // --- Render Helpers ---
    const calendarDays = getDaysInMonth(currentDate);

    const getBookingsForDay = (date: Date) => {
        return bookings.filter(b => {
            const d = new Date(b.date);
            return d.getDate() === date.getDate() &&
                d.getMonth() === date.getMonth() &&
                d.getFullYear() === date.getFullYear();
        });
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            today.getFullYear() === date.getFullYear();
    };

    const isSameMonth = (date: Date) => {
        return date.getMonth() === currentDate.getMonth();
    };

    return (
        <div className="animate-fadeIn" style={{ paddingBottom: "5rem" }}>

            {/* --- HEADER --- */}
            <div style={{ marginBottom: "3rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                        <div style={{
                            width: "56px", height: "56px", background: "rgba(212,175,55,0.1)",
                            border: "1px solid rgba(212,175,55,0.2)", borderRadius: "16px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 8px 32px rgba(212,175,55,0.1)"
                        }}>
                            <CalendarIcon size={28} style={{ color: "var(--accent-gold)" }} />
                        </div>
                        <div>
                            <h1 className="section-title" style={{ margin: 0, fontSize: "2.5rem" }}>
                                Agenda de <span style={{ color: "var(--accent-gold)" }}>{t("admin.calendar.espaos", "Espaços")}</span>
                            </h1>
                            <p className="section-subtitle" style={{ margin: 0, opacity: 0.8 }}>{t("admin.calendar.gestoCentralizadaDaOcupaoEHorr", "Gestão centralizada da ocupação e horários dos ambientes do museu.")}</p>
                        </div>
                    </div>
                </div>

                {/* Date Navigation */}
                <div style={{
                    display: "flex", alignItems: "center", gap: "1.5rem",
                    padding: "0.75rem 1.5rem", background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border-subtle)", borderRadius: "1.25rem",
                    backdropFilter: "blur(12px)"
                }}>
                    <Button
                        variant="ghost"
                        onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                        style={{ padding: "0.5rem", borderRadius: "10px" }}
                    >
                        <ChevronLeft size={20} />
                    </Button>
                    <div style={{ textAlign: "center", minWidth: "140px" }}>
                        <span style={{ display: "block", fontSize: "1.1rem", fontWeight: 800, color: "white", textTransform: "capitalize" }}>
                            {currentDate.toLocaleDateString("pt-BR", { month: "long" })}
                        </span>
                        <span style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.2em", marginTop: "2px" }}>
                            {currentDate.getFullYear()}
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                        style={{ padding: "0.5rem", borderRadius: "10px" }}
                    >
                        <ChevronRight size={20} />
                    </Button>
                </div>
            </div>

            <div style={{ display: "flex", gap: "2rem", height: "calc(100vh - 320px)", minHeight: "650px" }}>

                {/* --- CALENDAR MAIN GRID --- */}
                <div className="card" style={{ flex: 1, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    {/* Day Names Row */}
                    <div style={{
                        display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
                        background: "rgba(212,175,55,0.05)", borderBottom: "1px solid var(--border-subtle)"
                    }}>
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                            <div key={day} style={{
                                padding: "1.25rem 0.5rem", textAlign: "center", fontSize: "0.75rem",
                                fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em",
                                color: "var(--fg-muted)"
                            }}>
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Scrollable Grid Content */}
                    <div style={{ flex: 1, overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gridAutoRows: "minmax(120px, 1fr)" }}>
                        {loading ? (
                            <div style={{ gridColumn: "span 7", display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                                <div className="spinner"></div>
                            </div>
                        ) : (
                            calendarDays.map((date, idx) => {
                                const dayBookings = getBookingsForDay(date);
                                const currentMonth = isSameMonth(date);
                                const today = isToday(date);
                                const selected = selectedDate?.toDateString() === date.toDateString();

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedDate(date)}
                                        style={{
                                            padding: "0.75rem", cursor: "pointer",
                                            borderRight: "1px solid var(--border-subtle)",
                                            borderBottom: "1px solid var(--border-subtle)",
                                            background: selected ? "rgba(212,175,55,0.08)" : "transparent",
                                            opacity: currentMonth ? 1 : 0.3,
                                            transition: "all 0.3s ease",
                                            position: "relative"
                                        }}
                                        className="calendar-cell-hover"
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                                            <span style={{
                                                width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center",
                                                borderRadius: "8px",
                                                background: today ? "var(--accent-gold)" : "transparent",
                                                color: today ? "black" : "white",
                                                fontWeight: today ? 900 : 500,
                                                fontSize: "0.9rem",
                                                boxShadow: today ? "0 4px 12px rgba(212,175,55,0.4)" : "none"
                                            }}>
                                                {date.getDate()}
                                            </span>
                                            {dayBookings.length > 0 && currentMonth && (
                                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent-gold)", boxShadow: "0 0 10px var(--accent-gold)" }}></div>
                                            )}
                                        </div>

                                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                            {dayBookings.slice(0, 2).map((b, i) => (
                                                <div key={i} style={{
                                                    fontSize: "0.7rem", padding: "4px 8px", borderRadius: "6px",
                                                    background: "rgba(255,255,255,0.03)", borderLeft: "3px solid var(--accent-gold)",
                                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--fg-muted)",
                                                    display: "flex", alignItems: "center", gap: "4px"
                                                }}>
                                                    <span style={{ color: "var(--accent-gold)", fontWeight: 700 }}>{b.startTime?.split('T')[1].slice(0, 5)}</span>
                                                    {b.space?.name}
                                                </div>
                                            ))}
                                            {dayBookings.length > 2 && (
                                                <div style={{ fontSize: "0.65rem", color: "var(--fg-tertiary)", fontWeight: 700, paddingLeft: "8px", marginTop: "2px" }}>
                                                    + {dayBookings.length - 2} reservas
                                                </div>
                                            )}
                                        </div>

                                        {/* Selected Indicator */}
                                        {selected && (
                                            <div style={{
                                                position: "absolute", bottom: 0, left: 0, right: 0, height: "3px",
                                                background: "var(--accent-gold)", boxShadow: "0 0 15px var(--accent-gold)"
                                            }}></div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* --- SIDEBAR: DAY DETAILS --- */}
                <div style={{ width: "420px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    {/* Action Button */}
                    <Button
                        className="btn-primary"
                        style={{ height: "4.5rem", borderRadius: "1.25rem", fontSize: "1rem", fontWeight: 800, width: "100%" }}
                        disabled={!selectedDate}
                        onClick={openNewModal}
                    >
                        <Plus size={24} style={{ marginRight: "0.75rem" }} /> NOVA RESERVA
                    </Button>

                    {/* Details Card */}
                    <div className="card" style={{ flex: 1, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-subtle)", background: "rgba(212,175,55,0.03)" }}>
                            <span style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "var(--accent-gold)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "0.25rem" }}>
                                Detalhes do Dia
                            </span>
                            <h3 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "white", textTransform: "capitalize" }}>
                                {selectedDate ? selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) : "Selecione uma data"}
                            </h3>
                        </div>

                        <div style={{ flex: 1, padding: "1.5rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {selectedDate ? (
                                getBookingsForDay(selectedDate).length > 0 ? (
                                    getBookingsForDay(selectedDate).map(b => (
                                        <div key={b.id} style={{
                                            padding: "1.25rem", background: "rgba(255,255,255,0.02)",
                                            border: "1px solid var(--border-subtle)", borderRadius: "1.25rem",
                                            position: "relative", transition: "all 0.2s ease"
                                        }} className="booking-card-hover">
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                                                <div>
                                                    <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "var(--fg-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>
                                                        {b.space?.type || "Espaço"}
                                                    </span>
                                                    <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "white" }}>{b.space?.name}</h4>
                                                </div>
                                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                                    <button onClick={() => openEditModal(b)} style={{ padding: "0.5rem", borderRadius: "10px", background: "rgba(255,255,255,0.05)", border: "none", color: "var(--fg-muted)", cursor: "pointer" }}>
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(b.id)} style={{ padding: "0.5rem", borderRadius: "10px", background: "rgba(239, 68, 68, 0.1)", border: "none", color: "#ef4444", cursor: "pointer" }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1rem" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-gold)" }}></div>
                                                    <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--accent-gold)" }}>
                                                        {b.startTime?.split('T')[1].slice(0, 5)} - {b.endTime?.split('T')[1].slice(0, 5)}
                                                    </span>
                                                </div>
                                            </div>

                                            {b.purpose && (
                                                <div style={{
                                                    padding: "0.75rem", background: "rgba(0,0,0,0.2)",
                                                    borderRadius: "0.75rem", fontSize: "0.85rem", color: "var(--fg-muted)",
                                                    border: "1px solid rgba(255,255,255,0.02)", fontStyle: "italic"
                                                }}>
                                                    {b.purpose}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 0.2, textAlign: "center", padding: "2rem" }}>
                                        <CalendarIcon size={64} style={{ marginBottom: "1rem" }} />
                                        <p style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.8rem" }}>
                                            Nenhuma reserva para este dia
                                        </p>
                                    </div>
                                )
                            ) : (
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 0.2, textAlign: "center", padding: "2rem" }}>
                                    <ChevronRight size={64} style={{ marginBottom: "1rem" }} />
                                    <p style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.8rem" }}>
                                        Selecione uma data para ver os detalhes
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MODAL: RESERVA --- */}
            {isModalOpen && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 1000,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
                    padding: "1rem"
                }} className="animate-fadeIn">
                    <div className="card" style={{ width: "100%", maxWidth: "550px", padding: "2.5rem", position: "relative" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                            <div>
                                <h2 className="card-title" style={{ margin: 0, fontSize: "1.75rem" }}>
                                    {editingId ? "Editar" : "Confirmar"} <span style={{ color: "var(--accent-gold)" }}>Reserva</span>
                                </h2>
                                <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "var(--fg-muted)" }}>
                                    {selectedDate?.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", color: "var(--fg-muted)", cursor: "pointer", padding: "0.5rem" }}>
                                <X size={28} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">Selecione o Ambiente</label>
                                <select
                                    value={formData.spaceId}
                                    onChange={e => setFormData({ ...formData, spaceId: e.target.value })}
                                    required
                                    style={{ width: "100%", height: "3.5rem" }}
                                >
                                    {spaces.map(s => <option key={s.id} value={s.id}>{s.name} ({s.type || 'Geral'})</option>)}
                                </select>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">{t("admin.calendar.horrioDeIncio", "Horário de Início")}</label>
                                    <div style={{ position: "relative" }}>
                                        <Clock size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--accent-gold)", opacity: 0.5 }} />
                                        <input
                                            type="time"
                                            value={formData.startTime}
                                            onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                            required
                                            style={{ width: "100%", height: "3.5rem", paddingLeft: "3rem" }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">{t("admin.calendar.horrioDeTrmino", "Horário de Término")}</label>
                                    <div style={{ position: "relative" }}>
                                        <Clock size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--fg-muted)", opacity: 0.5 }} />
                                        <input
                                            type="time"
                                            value={formData.endTime}
                                            onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                            required
                                            style={{ width: "100%", height: "3.5rem", paddingLeft: "3rem" }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">{t("admin.calendar.finalidadeDaOcupao", "Finalidade da Ocupação")}</label>
                                <textarea
                                    value={formData.purpose}
                                    onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                                    style={{ width: "100%", minHeight: "120px" }}
                                    placeholder={t("admin.calendar.exTreinamentoDeEquipeManutenoP", "Ex: Treinamento de equipe, Manutenção preventiva, Gravação de vídeo...")}
                                />
                            </div>

                            <div style={{ display: "flex", gap: "1.25rem", marginTop: "1rem" }}>
                                <Button type="button" variant="ghost" style={{ flex: 1, height: "3.5rem" }} onClick={() => setIsModalOpen(false)}>
                                    DESCARTE
                                </Button>
                                <Button type="submit" className="btn-primary" style={{ flex: 2, height: "3.5rem", fontWeight: 800 }} isLoading={isSubmitting}>
                                    SALVAR AGENDAMENTO
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

