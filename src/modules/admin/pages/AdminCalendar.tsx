import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useToast } from "../../../contexts/ToastContext";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2, Clock, MapPin, Edit2, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui";

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

import { useAuth } from "../../auth/AuthContext";

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
        fetchSpaces();
    }, []);

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
        fetchBookings();
    }, [currentDate]);

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
            // Mock data for demo if backend not ready or empty
            // addToast("Erro ao carregar agenda", "error");
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
            const bDate = new Date(b.date); // or b.startTime if booking logic changed to range
            return bDate.getDate() === date.getDate() &&
                bDate.getMonth() === date.getMonth() &&
                bDate.getFullYear() === date.getFullYear();
        });
    };

    const renderDay = (date: Date | null, index: number) => {
        if (!date) return <div key={`empty-${index}`} className="h-32 bg-white/5 border border-white/5 rounded-xl opacity-50"></div>;

        const dayBookings = getBookingsForDate(date);
        const isToday = new Date().toDateString() === date.toDateString();
        const isSelected = selectedDate?.toDateString() === date.toDateString();

        return (
            <div
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`
           h-32 border rounded-xl p-2 flex flex-col gap-1 cursor-pointer transition-all hover:border-blue-500/50
           ${isToday ? 'bg-blue-500/10 border-blue-500' : 'bg-white/5 border-white/10'}
           ${isSelected ? 'ring-2 ring-blue-500' : ''}
        `}
            >
                <div className="flex justify-between items-start">
                    <span className={`text-sm font-bold ${isToday ? 'text-blue-400' : 'text-slate-400'}`}>
                        {date.getDate()}
                    </span>
                    {dayBookings.length > 0 && (
                        <span className="text-xs bg-blue-500 text-white px-1.5 rounded-full">
                            {dayBookings.length}
                        </span>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 mt-1">
                    {dayBookings.slice(0, 3).map((b, idx) => (
                        <div key={idx} className="text-[10px] bg-black/40 p-1 rounded border border-white/5 truncate text-slate-300">
                            {b.startTime ? new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} {b.space?.name || "Reserva"}
                        </div>
                    ))}
                    {dayBookings.length > 3 && (
                        <div className="text-[10px] text-slate-500 text-center">
                            + {dayBookings.length - 3} mais
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const selectedBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

    return (
        <div className="admin-page animate-fadeIn space-y-6">
            <div className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400">
                            <CalendarIcon size={24} />
                        </div>
                        Agenda de Espaços
                    </h1>
                    <p className="text-slate-400 mt-1">Visualize e gerencie a ocupação das salas e estúdios.</p>
                </div>
                <div className="flex items-center gap-4 bg-black/20 p-2 rounded-2xl border border-white/5">
                    <Button variant="ghost" onClick={prevMonth} className="text-slate-400 hover:text-white">
                        <ChevronLeft />
                    </Button>
                    <span className="text-xl font-bold text-white min-w-[150px] text-center capitalize">
                        {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </span>
                    <Button variant="ghost" onClick={nextMonth} className="text-slate-400 hover:text-white">
                        <ChevronRight />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar Grid */}
                <div className="lg:col-span-2 bg-[#0f172a] p-6 rounded-3xl border border-white/10">
                    <div className="grid grid-cols-7 gap-4 mb-4 text-center">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                            <div key={d} className="text-slate-500 text-sm font-bold uppercase tracking-wider">{d}</div>
                        ))}
                    </div>

                    {loading ? (
                        <div className="h-96 flex items-center justify-center">
                            <Loader2 className="animate-spin text-blue-500" size={40} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-2">
                            {days.map((date, idx) => renderDay(date, idx))}
                        </div>
                    )}
                </div>

                {/* Sidebar Details */}
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 h-fit">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Clock size={20} className="text-blue-400" />
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
                            className="w-full mb-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20"
                        >
                            + Nova Reserva
                        </Button>
                    )}

                    {!selectedDate ? (
                        <div className="text-center py-10 text-slate-500">
                            Clique em um dia no calendário para ver os detalhes.
                        </div>
                    ) : selectedBookings.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                            Nenhuma reserva para este dia.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {selectedBookings.map(b => (
                                <div key={b.id} className="bg-black/20 p-4 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${b.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                            {b.status === 'CONFIRMED' ? 'Confirmado' : b.status}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleEditClick(b)}
                                                className="p-1.5 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBooking(b.id)}
                                                className="p-1.5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <span className="text-slate-400 text-xs ml-2">
                                                {b.startTime ? new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Dia todo'}
                                                {' - '}
                                                {b.endTime ? new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                    </div>
                                    <h4 className="text-white font-bold text-lg mb-1">{b.purpose || "Sem título"}</h4>
                                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                                        <MapPin size={14} className="text-blue-400" />
                                        {b.space?.name || "Espaço desconhecido"}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 border-t border-white/5 pt-2 mt-2">
                                        <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">
                                            {b.user?.name?.charAt(0) || "U"}
                                        </div>
                                        Reservado por {b.user?.name || "Usuário"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Booking Modal */}
            {isBookingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
                        <h2 className="text-2xl font-bold text-white mb-6">{editingBookingId ? "Editar Reserva" : "Nova Reserva"}</h2>

                        <form onSubmit={handleSaveBooking} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2">Espaço</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                                    value={bookingForm.spaceId}
                                    onChange={e => setBookingForm({ ...bookingForm, spaceId: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>Selecione um espaço...</option>
                                    {spaces.map(s => (
                                        <option key={s.id} value={s.id} className="bg-slate-800">{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-2">Início</label>
                                    <input
                                        type="time"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                                        value={bookingForm.startTime}
                                        onChange={e => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-2">Fim</label>
                                    <input
                                        type="time"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                                        value={bookingForm.endTime}
                                        onChange={e => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2">Propósito</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Reunião de Equipe, Ensaio..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                                    value={bookingForm.purpose}
                                    onChange={e => setBookingForm({ ...bookingForm, purpose: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsBookingModalOpen(false)}
                                    className="flex-1"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Confirmar Reserva"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
