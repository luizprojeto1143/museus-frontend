import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useToast } from "../../../contexts/ToastContext";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2, Clock, MapPin, Edit2, Trash2, CalendarRange, CheckCircle2, X, Plus } from "lucide-react";
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
        <div className="max-w-[1600px] mx-auto p-6 animate-fadeIn pb-24">

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <CalendarIcon className="text-gold" size={32} />
                        Agenda de Espaços
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1">Gerencie a ocupação dos espaços culturais.</p>
                </div>

                <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-2 rounded-xl shadow-lg">
                    <Button variant="ghost" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
                        <ChevronLeft className="text-zinc-400 hover:text-white" />
                    </Button>
                    <span className="text-lg font-bold text-white w-40 text-center capitalize">
                        {currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                    </span>
                    <Button variant="ghost" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
                        <ChevronRight className="text-zinc-400 hover:text-white" />
                    </Button>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-250px)] min-h-[600px]">

                {/* --- CALENDAR GRID --- */}
                <div className="flex-1 flex flex-col bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">

                    {/* Weekday Header */}
                    <div className="flex border-b border-zinc-800 bg-zinc-900">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                            <div key={day} className="flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider text-zinc-400">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="animate-spin text-gold" size={48} />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-wrap content-start">
                            {calendarDays.map((date, idx) => {
                                const dayBookings = getBookingsForDay(date);
                                const currentMonth = isSameMonth(date);
                                const today = isToday(date);
                                const selected = selectedDate?.toDateString() === date.toDateString();

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedDate(date)}
                                        className={`
                                            relative w-[14.28%] min-h-[14.28%] border-r border-b border-zinc-800 p-2 cursor-pointer transition-colors
                                            ${!currentMonth ? 'bg-zinc-950/20' : 'bg-zinc-950'}
                                            ${selected ? 'bg-gold/10' : 'hover:bg-zinc-900'}
                                        `}
                                    >
                                        {/* Day Number */}
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`
                                                w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold
                                                ${today ? 'bg-gold text-black' : currentMonth ? 'text-zinc-300' : 'text-zinc-600'}
                                            `}>
                                                {date.getDate()}
                                            </span>
                                        </div>

                                        {/* Events Chips */}
                                        <div className="flex flex-col gap-1 overflow-hidden">
                                            {dayBookings.slice(0, 4).map((b, i) => (
                                                <div key={i} className={`
                                                    text-[10px] px-1.5 py-0.5 rounded truncate border-l-2
                                                    ${today ? 'bg-gold/20 border-gold text-gold' : 'bg-zinc-800 border-zinc-600 text-zinc-300'}
                                                `}>
                                                    <span className="font-bold mr-1">
                                                        {b.startTime ? new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </span>
                                                    {b.space?.name}
                                                </div>
                                            ))}
                                            {dayBookings.length > 4 && (
                                                <span className="text-[10px] text-zinc-500 pl-1 font-medium">
                                                    +{dayBookings.length - 4} mais
                                                </span>
                                            )}
                                        </div>

                                        {/* Selection Outline */}
                                        {selected && (
                                            <div className="absolute inset-0 border-2 border-gold pointer-events-none z-10" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* --- SIDEBAR DETAILS --- */}
                <div className="w-full xl:w-96 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col h-full">
                    <h3 className="text-xl font-bold text-white mb-4 border-b border-zinc-800 pb-4">
                        {selectedDate
                            ? selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
                            : "Detalhes do Dia"}
                    </h3>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                        {selectedDate ? (
                            getBookingsForDay(selectedDate).length === 0 ? (
                                <div className="text-center text-zinc-500 py-10 opacity-50">
                                    <CalendarIcon className="mx-auto mb-2" size={32} />
                                    <p>Nenhuma reserva</p>
                                </div>
                            ) : (
                                getBookingsForDay(selectedDate).map(b => (
                                    <div key={b.id} className="bg-black/40 border border-zinc-800 p-4 rounded-xl group relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-gold">{b.space?.name}</span>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEditModal(b)} className="p-1 hover:text-white text-zinc-400">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(b.id)} className="p-1 hover:text-red-500 text-zinc-400">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-sm text-zinc-300 flex items-center gap-2 mb-2">
                                            <Clock size={14} />
                                            {b.startTime ? new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} -
                                            {b.endTime ? new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </div>
                                        {b.purpose && <p className="text-xs text-zinc-500 italic">"{b.purpose}"</p>}
                                    </div>
                                ))
                            )
                        ) : (
                            <div className="text-center text-zinc-500 py-10">
                                <p>Selecione um dia no calendário.</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-zinc-800 mt-4">
                        <Button
                            className="w-full bg-gold text-black hover:bg-gold/90 font-bold"
                            disabled={!selectedDate}
                            onClick={openNewModal}
                        >
                            <Plus size={18} className="mr-2" /> Nova Reserva
                        </Button>
                    </div>
                </div>
            </div>

            {/* --- MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn p-4">
                    <div className="bg-zinc-900 border border-zinc-700 w-full max-w-md rounded-2xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {editingId ? "Editar Reserva" : "Nova Reserva"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Espaço</label>
                                <select
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-gold outline-none"
                                    value={formData.spaceId}
                                    onChange={e => setFormData({ ...formData, spaceId: e.target.value })}
                                    required
                                >
                                    {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">Início</label>
                                    <input
                                        type="time"
                                        className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-gold outline-none"
                                        value={formData.startTime}
                                        onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">Fim</label>
                                    <input
                                        type="time"
                                        className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-gold outline-none"
                                        value={formData.endTime}
                                        onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Propósito</label>
                                <textarea
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-gold outline-none min-h-[100px]"
                                    value={formData.purpose}
                                    onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                                    placeholder="Detalhes do uso..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">Cancelar</Button>
                                <Button type="submit" isLoading={isSubmitting} className="bg-gold text-black hover:bg-gold/90">Salvar</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
