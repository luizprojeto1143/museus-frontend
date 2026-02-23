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
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-gold/10 border border-gold/20 rounded-2xl flex items-center justify-center shadow-lg shadow-gold/5">
                        <CalendarIcon className="text-gold" size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight">
                            Agenda de <span className="text-gold">Espaços</span>
                        </h1>
                        <p className="text-zinc-500 text-sm font-medium">Gestão integrada da ocupação e horários dos ambientes culturais.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-zinc-900/50 backdrop-blur-md border border-white/5 p-1.5 rounded-2xl shadow-2xl">
                    <Button
                        variant="ghost"
                        className="h-10 w-10 p-0 hover:bg-gold/10 hover:text-gold rounded-xl transition-all"
                        onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                    >
                        <ChevronLeft size={20} />
                    </Button>
                    <div className="px-6 text-center">
                        <span className="text-lg font-bold text-white capitalize block leading-tight">
                            {currentDate.toLocaleDateString("pt-BR", { month: "long" })}
                        </span>
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest leading-none">
                            {currentDate.getFullYear()}
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        className="h-10 w-10 p-0 hover:bg-gold/10 hover:text-gold rounded-xl transition-all"
                        onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                    >
                        <ChevronRight size={20} />
                    </Button>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-8 h-[calc(100vh-280px)] min-h-[650px]">

                {/* --- CALENDAR GRID --- */}
                <div className="flex-1 flex flex-col bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden shadow-2xl">

                    {/* Weekday Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }} className="border-b border-white/5 bg-zinc-900/60">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                            <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 border-r border-white/5 last:border-r-0">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: '1fr' }} className="flex-1 bg-zinc-950/20">
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
                                            relative border-r border-b border-white/5 p-3 cursor-pointer transition-all duration-300 group/day
                                            ${!currentMonth ? 'bg-zinc-950/40 opacity-30 hover:opacity-100' : 'bg-transparent'}
                                            ${selected ? 'bg-gold/5' : 'hover:bg-white/[0.02]'}
                                        `}
                                        style={{ minHeight: '120px' }}
                                    >
                                        {/* Day Number */}
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`
                                                w-8 h-8 flex items-center justify-center rounded-xl text-sm font-black transition-all duration-300
                                                ${today ? 'bg-gold text-black shadow-lg shadow-gold/20 scale-110' : currentMonth ? 'text-zinc-300 group-hover/day:text-gold' : 'text-zinc-600'}
                                                ${selected && !today ? 'border border-gold text-gold' : ''}
                                            `}>
                                                {date.getDate()}
                                            </span>
                                            {dayBookings.length > 0 && currentMonth && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></div>
                                            )}
                                        </div>

                                        {/* Events Chips */}
                                        <div className="flex flex-col gap-1.5 overflow-hidden">
                                            {dayBookings.slice(0, 3).map((b, i) => (
                                                <div key={i} className={`
                                                    text-[10px] px-2 py-1 rounded-lg truncate border border-white/5
                                                    ${today ? 'bg-black/40 text-gold font-bold' : 'bg-zinc-800/50 text-zinc-400 group-hover/day:border-gold/20 group-hover/day:text-zinc-300'}
                                                `}>
                                                    <span className="opacity-60 mr-1.5 font-medium italic">
                                                        {b.startTime ? new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </span>
                                                    {b.space?.name}
                                                </div>
                                            ))}
                                            {dayBookings.length > 3 && (
                                                <span className="text-[9px] text-zinc-600 pl-2 font-bold uppercase tracking-wider">
                                                    + {dayBookings.length - 3} ocupações
                                                </span>
                                            )}
                                        </div>

                                        {/* Glow Effect */}
                                        {selected && (
                                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gold shadow-[0_0_15px_rgba(212,175,55,0.5)] z-10" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* --- SIDEBAR DETAILS --- */}
                <div className="w-full xl:w-[400px] bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col h-full overflow-hidden">
                    <div className="mb-6">
                        <span className="text-[10px] font-black text-gold uppercase tracking-[0.3em] block mb-2 opacity-60">Programação do Dia</span>
                        <h3 className="text-2xl font-black text-white capitalize">
                            {selectedDate
                                ? selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
                                : "Visão Detalhada"}
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-3">
                        {selectedDate ? (
                            getBookingsForDay(selectedDate).length === 0 ? (
                                <div className="text-center text-zinc-600 py-16 opacity-30 flex flex-col items-center">
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <CalendarIcon size={40} />
                                    </div>
                                    <p className="font-bold uppercase tracking-widest text-xs">Espaço Livre</p>
                                </div>
                            ) : (
                                getBookingsForDay(selectedDate).map(b => (
                                    <div key={b.id} className="group/card bg-zinc-950/40 hover:bg-zinc-950/60 border border-white/5 hover:border-gold/30 p-5 rounded-2xl transition-all duration-300 relative">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{b.space?.type || 'Ambiente'}</span>
                                                <span className="font-black text-white text-lg group-hover/card:text-gold transition-colors">{b.space?.name}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => openEditModal(b)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-all">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(b.id)} className="p-2 bg-white/5 hover:bg-red-500/10 rounded-xl text-zinc-400 hover:text-red-500 transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gold/10 border border-gold/20 rounded-xl text-sm font-black text-gold">
                                                <Clock size={14} />
                                                {b.startTime ? new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </div>
                                            <div className="w-4 h-[1px] bg-zinc-800"></div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 border border-white/5 rounded-xl text-sm font-bold text-zinc-400">
                                                <Clock size={14} />
                                                {b.endTime ? new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </div>
                                        </div>

                                        {b.purpose && (
                                            <div className="p-3 bg-black/30 rounded-xl border border-white/5 italic text-sm text-zinc-500 leading-relaxed">
                                                <span className="text-gold/40 text-lg font-serif">"</span>
                                                {b.purpose}
                                                <span className="text-gold/40 text-lg font-serif ml-1">"</span>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )
                        ) : (
                            <div className="text-center text-zinc-600 py-16">
                                <p className="font-bold uppercase tracking-widest text-xs opacity-30">Selecione um dia no calendário</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t border-white/5 mt-auto">
                        <Button
                            className="w-full bg-gold text-black hover:bg-white hover:scale-[1.02] transition-all duration-300 font-black h-14 rounded-2xl shadow-xl shadow-gold/10"
                            disabled={!selectedDate}
                            onClick={openNewModal}
                        >
                            <Plus size={20} className="mr-2" /> SOLICITAR RESERVA
                        </Button>
                    </div>
                </div>
            </div>

            {/* --- MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fadeIn p-4">
                    <div className="bg-zinc-900 border border-white/10 w-full max-w-lg rounded-[2.5rem] p-10 shadow-3xl relative overflow-hidden">
                        {/* Modal background decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <div>
                                <span className="text-[10px] font-black text-gold uppercase tracking-[0.3em] block mb-1">Gerenciamento</span>
                                <h2 className="text-3xl font-black text-white">
                                    {editingId ? "Editar" : "Nova"} <span className="text-gold">Reserva</span>
                                </h2>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl text-zinc-400 hover:text-white transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6 relative z-10">
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Ambiente Selecionado</label>
                                <select
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white focus:border-gold/50 outline-none transition-all cursor-pointer appearance-none font-bold"
                                    value={formData.spaceId}
                                    onChange={e => setFormData({ ...formData, spaceId: e.target.value })}
                                    required
                                >
                                    {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Horário de Início</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gold opacity-50" size={18} />
                                        <input
                                            type="time"
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 pl-12 text-white focus:border-gold/50 outline-none transition-all font-bold"
                                            value={formData.startTime}
                                            onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Horário de Término</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 opacity-50" size={18} />
                                        <input
                                            type="time"
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 pl-12 text-white focus:border-gold/50 outline-none transition-all font-bold"
                                            value={formData.endTime}
                                            onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Finalidade da Ocupação</label>
                                <textarea
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white focus:border-gold/50 outline-none transition-all min-h-[120px] resize-none placeholder:text-zinc-700 font-medium"
                                    value={formData.purpose}
                                    onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                                    placeholder="Ex: Ensaio de coral, Reunião técnica, Manutenção preventiva..."
                                />
                            </div>

                            <div className="flex gap-4 pt-4 mt-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 h-14 rounded-2xl text-zinc-500 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-xs transition-all"
                                >
                                    Descartar
                                </Button>
                                <Button
                                    type="submit"
                                    isLoading={isSubmitting}
                                    className="flex-[1.5] h-14 bg-gold text-black hover:bg-white hover:scale-[1.02] transition-all duration-300 font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-gold/10"
                                >
                                    Confirmar Reserva
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
