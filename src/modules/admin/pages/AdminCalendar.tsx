import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useToast } from "../../../contexts/ToastContext";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2, Clock, MapPin, Edit2, Trash2, CalendarRange, CheckCircle2, X } from "lucide-react";
import { Button, Input, Select, Textarea } from "../../../components/ui";
import { useAuth } from "../../auth/AuthContext";

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

export const AdminCalendar: React.FC = () => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const { tenantId } = useAuth();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const [spaces, setSpaces] = useState<{ id: string, name: string }[]>([]);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [bookingForm, setBookingForm] = useState({
        spaceId: "",
        startTime: "09:00",
        endTime: "10:00",
        purpose: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingBookingId, setEditingBookingId] = useState<string | null>(null);

    useEffect(() => {
        if (tenantId) fetchSpaces();
    }, [tenantId]);

    const fetchSpaces = async () => {
        try {
            const res = await api.get("/spaces");
            setSpaces(res.data);
            if (res.data.length > 0) {
                setBookingForm(prev => ({ ...prev, spaceId: res.data[0].id }));
            }
        } catch {
            console.error("Erro ao carregar espaços");
        }
    };

    const handleSaveBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !bookingForm.spaceId) return;

        setIsSubmitting(true);
        try {
            const dateStr = selectedDate.toISOString().split("T")[0];
            const start = new Date(`${dateStr}T${bookingForm.startTime}:00`);
            const end = new Date(`${dateStr}T${bookingForm.endTime}:00`);

            const payload = {
                date: start.toISOString(),
                tenantId,
                spaceId: bookingForm.spaceId,
                startTime: start.toISOString(),
                endTime: end.toISOString(),
                purpose: bookingForm.purpose
            };

            if (editingBookingId) {
                await api.put(`/bookings/${editingBookingId}`, payload);
                addToast("Reserva atualizada com sucesso!", "success");
            } else {
                await api.post("/bookings", payload);
                addToast("Reserva criada com sucesso!", "success");
            }

            setIsBookingModalOpen(false);
            setEditingBookingId(null);
            fetchBookings();
        } catch (err: any) {
            addToast(err.response?.data?.message || "Erro ao salvar reserva", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (booking: Booking) => {
        setEditingBookingId(booking.id);
        const startTime = booking.startTime ? new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : "09:00";
        const endTime = booking.endTime ? new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : "10:00";

        setBookingForm({
            spaceId: (booking as any).spaceId || spaces.find(s => s.name === booking.space?.name)?.id || "",
            startTime,
            endTime,
            purpose: booking.purpose || ""
        });
        setIsBookingModalOpen(true);
    };

    const handleDeleteBooking = async (id: string) => {
        if (!window.confirm("Deseja realmente excluir esta reserva permanentemente?")) return;

        try {
            await api.delete(`/bookings/${id}`, { params: { hard: "true" } });
            addToast("Reserva excluída com sucesso!", "success");
            fetchBookings();
        } catch (err) {
            addToast("Erro ao excluir reserva", "error");
        }
    };

    useEffect(() => {
        if (tenantId) fetchBookings();
    }, [currentDate, tenantId]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            // Fetch bookings for the whole month
            const res = await api.get("/bookings", { params: { year, month } });
            setBookings(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

    const days = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getBookingsForDate = (date: Date) => {
        return bookings.filter(b => {
            const bDate = new Date(b.date);
            return bDate.getDate() === date.getDate() &&
                bDate.getMonth() === date.getMonth() &&
                bDate.getFullYear() === date.getFullYear();
        });
    };

    const selectedBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

    // Group days into weeks for table rows
    const weeks = [];
    let currentWeek = [];
    for (let i = 0; i < days.length; i++) {
        currentWeek.push(days[i]);
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }
    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
            currentWeek.push(null);
        }
        weeks.push(currentWeek);
    }

    return (
        <div className="max-w-[95%] mx-auto pb-24 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 flex items-center gap-3">
                        <CalendarRange className="text-gold" size={32} /> Agenda de Espaços
                    </h1>
                    <p className="text-zinc-400 text-sm font-medium mt-1">
                        Gerencie as reservas e disponibilidade dos espaços.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-zinc-900/80 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl">
                    <Button variant="ghost" onClick={prevMonth} className="text-zinc-400 hover:text-white hover:bg-white/5 w-10 h-10 p-0 rounded-xl">
                        <ChevronLeft size={20} />
                    </Button>
                    <span className="text-lg font-bold text-white min-w-[150px] text-center capitalize">
                        {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </span>
                    <Button variant="ghost" onClick={nextMonth} className="text-zinc-400 hover:text-white hover:bg-white/5 w-10 h-10 p-0 rounded-xl">
                        <ChevronRight size={20} />
                    </Button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Calendar Table */}
                <div className="flex-1 bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
                    {loading ? (
                        <div className="h-96 flex flex-col items-center justify-center gap-4">
                            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-zinc-500 text-sm">Carregando agenda...</p>
                        </div>
                    ) : (
                        <div className="w-full overflow-x-auto">
                            <table className="w-full border-collapse table-fixed bg-black">
                                <thead>
                                    <tr>
                                        {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map(d => (
                                            <th key={d} className="py-3 text-center text-zinc-400 text-xs font-bold uppercase tracking-wider bg-zinc-900 border-b border-r border-zinc-800 last:border-r-0 w-[14.28%]">
                                                {d}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {weeks.map((week, wIdx) => (
                                        <tr key={wIdx}>
                                            {week.map((date, dIdx) => {
                                                if (!date) return <td key={`empty-${wIdx}-${dIdx}`} className="h-32 bg-zinc-950 border-r border-b border-zinc-800"></td>;

                                                const dayBookings = getBookingsForDate(date);
                                                const isToday = new Date().toDateString() === date.toDateString();
                                                const isSelected = selectedDate?.toDateString() === date.toDateString();

                                                return (
                                                    <td
                                                        key={date.toISOString()}
                                                        onClick={() => {
                                                            setSelectedDate(date);
                                                            if (isBookingModalOpen) setIsBookingModalOpen(false);
                                                        }}
                                                        className={`
                                                             h-32 border-r border-b border-zinc-800 cursor-pointer transition-colors relative align-top p-1 hover:bg-zinc-800/30
                                                             ${isToday ? 'bg-zinc-900' : 'bg-black'}
                                                             ${isSelected ? 'bg-gold/5' : ''}
                                                         `}
                                                    >
                                                        {isSelected && <div className="absolute inset-0 ring-2 ring-inset ring-gold pointer-events-none z-10 w-full h-full"></div>}

                                                        <div className="flex justify-between items-start mb-1 px-1 pt-1">
                                                            <span className={`
                                                                 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                                                                 ${isToday ? 'bg-gold text-black' : 'text-zinc-400'}
                                                             `}>
                                                                {date.getDate()}
                                                            </span>
                                                        </div>

                                                        <div className="flex flex-col gap-0.5 pointer-events-none">
                                                            {dayBookings.slice(0, 4).map((b, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className={`
                                                                         text-[10px] px-1.5 py-0.5 rounded-sm truncate border-l-2
                                                                         ${isToday
                                                                            ? 'bg-gold/20 text-gold border-gold'
                                                                            : 'bg-zinc-800 text-zinc-300 border-zinc-600'}
                                                                     `}
                                                                >
                                                                    <span className="font-semibold mr-1">
                                                                        {b.startTime ? new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                                    </span>
                                                                    <span>{b.space?.name}</span>
                                                                </div>
                                                            ))}
                                                            {dayBookings.length > 4 && (
                                                                <div className="text-[10px] text-zinc-500 pl-1 font-medium">
                                                                    + {dayBookings.length - 4} mais
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Sidebar Details */}
                <div className="w-full lg:w-96 space-y-6 shrink-0">
                    <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-md h-fit relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                            <Clock size={20} className="text-gold" />
                            {selectedDate
                                ? selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
                                : "Selecione uma data"}
                        </h3>

                        {selectedDate && (
                            <Button
                                onClick={() => {
                                    setEditingBookingId(null);
                                    setBookingForm({
                                        spaceId: spaces[0]?.id || "",
                                        startTime: "09:00",
                                        endTime: "10:00",
                                        purpose: ""
                                    });
                                    setIsBookingModalOpen(true);
                                }}
                                className="w-full mb-6 py-6 rounded-xl font-bold text-base shadow-lg shadow-gold/20 bg-gold hover:bg-gold/90 text-black border-none"
                            >
                                + Nova Reserva
                            </Button>
                        )}

                        {!selectedDate ? (
                            <div className="text-center py-12 text-zinc-500 flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-zinc-600">
                                    <CalendarIcon size={24} />
                                </div>
                                <p className="text-sm font-medium">Clique em um dia no calendário para ver os detalhes.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                                {selectedBookings.length === 0 ? (
                                    <div className="text-center py-10 text-zinc-500 bg-black/20 rounded-xl border border-white/5">
                                        <p className="text-sm">Nenhuma reserva para este dia.</p>
                                    </div>
                                ) : (
                                    selectedBookings.map(booking => (
                                        <div key={booking.id} className="bg-black/40 border border-white/5 p-4 rounded-xl hover:border-white/10 transition-colors group">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-gold" />
                                                    <span className="font-bold text-white text-sm">{booking.space?.name}</span>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEditClick(booking)}
                                                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteBooking(booking.id)}
                                                        className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                                                <Clock size={12} />
                                                {booking.startTime ? new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'} -
                                                {booking.endTime ? new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                                            </div>
                                            {booking.purpose && (
                                                <p className="text-xs text-zinc-500 italic border-t border-white/5 pt-2 mt-2">
                                                    "{booking.purpose}"
                                                </p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Reserva */}
            {isBookingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
                        <button
                            onClick={() => setIsBookingModalOpen(false)}
                            className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-white/5"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            {editingBookingId ? "Editar Reserva" : "Nova Reserva"}
                        </h2>

                        <form onSubmit={handleSaveBooking} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Espaço</label>
                                <select
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50"
                                    value={bookingForm.spaceId}
                                    onChange={e => setBookingForm({ ...bookingForm, spaceId: e.target.value })}
                                    required
                                >
                                    {spaces.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Início</label>
                                    <input
                                        type="time"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50"
                                        value={bookingForm.startTime}
                                        onChange={e => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Fim</label>
                                    <input
                                        type="time"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50"
                                        value={bookingForm.endTime}
                                        onChange={e => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Propósito / Observações</label>
                                <textarea
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 min-h-[100px]"
                                    value={bookingForm.purpose}
                                    onChange={e => setBookingForm({ ...bookingForm, purpose: e.target.value })}
                                    placeholder="Ex: Reunião de equipe..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsBookingModalOpen(false)}
                                    className="text-zinc-400 hover:text-white"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    isLoading={isSubmitting}
                                    className="bg-gold text-black hover:bg-gold/90 font-bold"
                                >
                                    Salvar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
