import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../../api/client";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Edit2, 
  Trash2, 
  Plus, 
  X,
  Info,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Route
} from "lucide-react";
import { 
  Button, 
  Card, 
  AnimateIn, 
  Badge, 
  AnimatedCounter 
} from "@/components/ui";
import { useAuth } from "../../../auth/AuthContext";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
type Booking = {
    id: string;
    date: string;
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

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const endDate = new Date(lastDay);
    if (endDate.getDay() !== 6) {
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    }

    const days = [];
    const current = new Date(startDate);
    while (current <= endDate) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    return days;
};

export const AdminCalendar: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId } = useAuth();

    // State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

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

    const fetchSpaces = useCallback(async () => {
        try {
            const res = await api.get("/spaces");
            setSpaces(res.data);
            if (res.data.length > 0 && !formData.spaceId) {
                setFormData(prev => ({ ...prev, spaceId: res.data[0].id }));
            }
        } catch (e) {
            console.error("Erro ao carregar espaços", e);
        }
    }, [formData.spaceId]);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const res = await api.get("/bookings", { params: { year, month, tenantId } });
            setBookings(res.data);
        } catch (e) {
            console.error("Erro ao carregar reservas", e);
            toast.error("Erro ao carregar reservas");
        } finally {
            setLoading(false);
        }
    }, [currentDate, tenantId]);

    useEffect(() => {
        if (tenantId) {
            fetchSpaces();
            fetchBookings();
        }
    }, [tenantId, fetchSpaces, fetchBookings]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !formData.spaceId) return;

        setIsSubmitting(true);
        const loadingToast = toast.loading(editingId ? "Atualizando reserva..." : "Criando reserva...");
        
        try {
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
                toast.success("Reserva atualizada!", { id: loadingToast });
            } else {
                await api.post("/bookings", payload);
                toast.success("Reserva criada!", { id: loadingToast });
            }

            setIsModalOpen(false);
            setEditingId(null);
            fetchBookings();
        } catch (err: any) {
            const msg = err.response?.data?.message || "Erro ao salvar";
            toast.error(msg, { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Deseja realmente excluir esta reserva?")) return;
        
        const loadingToast = toast.loading("Excluindo reserva...");
        try {
            await api.delete(`/bookings/${id}`, { params: { hard: "true" } });
            toast.success("Reserva excluída", { id: loadingToast });
            fetchBookings();
        } catch {
            toast.error("Erro ao excluir", { id: loadingToast });
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
        <AnimateIn className="space-y-8 pb-32 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                        <CalendarIcon className="text-gold-400" size={32} />
                        Agenda de <span className="text-gold-400">Espaços</span>
                    </h1>
                    <p className="text-slate-400 font-medium max-w-lg">
                        Gestão centralizada da ocupação e horários dos ambientes do museu.
                    </p>
                </div>

                {/* Date Controller */}
                <div className="flex items-center bg-white/5 backdrop-blur-xl border border-white/5 p-1 rounded-3xl">
                    <Button 
                        variant="ghost" 
                        onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                        className="h-12 w-12 rounded-2xl hover:bg-white/10"
                    >
                        <ChevronLeft size={20} />
                    </Button>
                    <div className="px-8 py-2 text-center min-w-[180px]">
                        <span className="block text-sm font-black text-white uppercase tracking-widest">
                            {currentDate.toLocaleDateString("pt-BR", { month: "long" })}
                        </span>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-0.5">
                            {currentDate.getFullYear()}
                        </span>
                    </div>
                    <Button 
                        variant="ghost" 
                        onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                        className="h-12 w-12 rounded-2xl hover:bg-white/10"
                    >
                        <ChevronRight size={20} />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                {/* Main Calendar Grid */}
                <Card className="xl:col-span-8 overflow-hidden bg-white/[0.02] border-white/5 rounded-[40px] p-0 flex flex-col h-[700px]">
                    {/* Day Names */}
                    <div className="grid grid-cols-7 bg-white/[0.03] border-b border-white/5">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                            <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="flex-1 overflow-y-auto grid grid-cols-7 no-scrollbar">
                        {loading ? (
                            <div className="col-span-7 flex flex-col items-center justify-center h-full space-y-4 opacity-50">
                                <div className="w-10 h-10 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sincronizando Agenda...</span>
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
                                        className={`group relative aspect-[1.2/1] p-3 cursor-pointer border-r border-b border-white/5 transition-all duration-300 ${
                                            selected ? 'bg-gold-400/5' : 'hover:bg-white/[0.02]'
                                        } ${!currentMonth ? 'opacity-20 grayscale' : 'opacity-100'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black transition-all ${
                                                today ? 'bg-gold-400 text-slate-950 shadow-lg shadow-gold-400/20' : 
                                                selected ? 'text-gold-400' : 'text-slate-400 group-hover:text-white'
                                            }`}>
                                                {date.getDate()}
                                            </span>
                                            {dayBookings.length > 0 && currentMonth && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-gold-400 shadow-[0_0_100px_rgba(212,175,55,0.5)]" />
                                            )}
                                        </div>

                                        <div className="space-y-1 overflow-hidden">
                                            {dayBookings.slice(0, 2).map((b, i) => (
                                                <div key={i} className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-white/5 border-l-2 border-gold-400 text-slate-400 truncate">
                                                    {b.startTime?.split('T')[1].slice(0, 5)} {b.space?.name}
                                                </div>
                                            ))}
                                            {dayBookings.length > 2 && (
                                                <div className="text-[7px] font-black text-gold-400/50 uppercase tracking-widest pl-2">
                                                    + {dayBookings.length - 2} reservas
                                                </div>
                                            )}
                                        </div>

                                        {selected && (
                                            <motion.div 
                                                layoutId="activeDay"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-400 shadow-[0_-2px_10px_rgba(212,175,55,0.5)]" 
                                            />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Card>

                {/* Day Details Sidebar */}
                <div className="xl:col-span-4 space-y-6">
                    <Button
                        className="w-full h-20 rounded-[32px] bg-gold-400 text-slate-950 font-black text-base uppercase tracking-widest shadow-xl shadow-gold-400/10 transition-transform active:scale-95"
                        disabled={!selectedDate}
                        onClick={openNewModal}
                        leftIcon={<Plus size={24} />}
                    >
                        Nova Reserva
                    </Button>

                    <Card className="bg-white/[0.02] border-white/5 rounded-[40px] p-0 overflow-hidden flex flex-col min-h-[500px]">
                        <div className="p-8 bg-white/[0.03] border-b border-white/5">
                            <span className="text-[10px] font-black text-gold-400 uppercase tracking-[0.3em] block mb-2">Programação do Dia</span>
                            <h3 className="text-2xl font-black text-white capitalize leading-tight">
                                {selectedDate ? selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) : "Selecione uma data"}
                            </h3>
                        </div>

                        <div className="flex-1 p-8 space-y-4 overflow-y-auto no-scrollbar">
                            <AnimatePresence mode="popLayout">
                                {selectedDate ? (
                                    getBookingsForDay(selectedDate).length > 0 ? (
                                        getBookingsForDay(selectedDate).map(b => (
                                            <motion.div
                                                key={b.id}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="group p-6 bg-white/[0.03] border border-white/5 rounded-3xl relative hover:bg-white/[0.05] transition-all"
                                            >
                                                <div className="flex justify-between items-start gap-4 mb-4">
                                                    <div>
                                                        <Badge variant="glass" className="mb-2 text-[8px] border-gold-400/20 text-gold-400">
                                                            {b.space?.type || "Espaço"}
                                                        </Badge>
                                                        <h4 className="text-lg font-black text-white group-hover:text-gold-400 transition-colors leading-tight">{b.space?.name}</h4>
                                                    </div>
                                                    <div className="flex gap-2 shrink-0">
                                                        <button 
                                                            onClick={() => openEditModal(b)} 
                                                            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(b.id)} 
                                                            className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 text-slate-400">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={16} className="text-gold-400/50" />
                                                        <span className="text-sm font-bold">
                                                            {b.startTime?.split('T')[1].slice(0, 5)} — {b.endTime?.split('T')[1].slice(0, 5)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {b.purpose && (
                                                    <div className="mt-4 p-4 bg-black/20 rounded-2xl border border-white/5">
                                                        <p className="text-xs text-slate-500 italic line-clamp-2">"{b.purpose}"</p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 opacity-20">
                                            <CalendarIcon size={64} className="text-slate-500" />
                                            <p className="text-xs font-black uppercase tracking-widest">Nenhuma reserva agendada</p>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 opacity-20">
                                        <Info size={64} className="text-slate-500" />
                                        <p className="text-xs font-black uppercase tracking-widest">Selecione um dia para auditar</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Premium Reservation Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-xl bg-slate-950 border border-white/10 rounded-[40px] p-10 shadow-2xl overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tight leading-none">
                                        {editingId ? "Editar" : "Nova"} <span className="text-gold-400">Reserva</span>
                                    </h2>
                                    <p className="text-sm text-slate-500 font-bold mt-2 flex items-center gap-2 uppercase tracking-widest">
                                        <CalendarIcon size={14} className="text-gold-400" />
                                        {selectedDate?.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setIsModalOpen(false)} 
                                    className="p-2 text-slate-500 hover:text-white transition-colors"
                                >
                                    <XCircle size={32} />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Ambiente do Museu</label>
                                    <select
                                        value={formData.spaceId}
                                        onChange={e => setFormData({ ...formData, spaceId: e.target.value })}
                                        required
                                        className="w-full h-14 px-6 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-gold-400/50 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled className="bg-slate-900">Selecione um local...</option>
                                        {spaces.map(s => <option key={s.id} value={s.id} className="bg-slate-900 text-white">{s.name}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Check-in</label>
                                        <div className="relative">
                                            <Clock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gold-400 opacity-50" />
                                            <input
                                                type="time"
                                                value={formData.startTime}
                                                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                                required
                                                className="w-full h-14 pl-12 pr-6 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-gold-400/50 transition-all [color-scheme:dark]"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Check-out</label>
                                        <div className="relative">
                                            <Clock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
                                            <input
                                                type="time"
                                                value={formData.endTime}
                                                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                                required
                                                className="w-full h-14 pl-12 pr-6 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-gold-400/50 transition-all [color-scheme:dark]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Finalidade do Agendamento</label>
                                    <textarea
                                        value={formData.purpose}
                                        onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                                        className="w-full p-6 bg-white/5 border border-white/5 rounded-[32px] text-white outline-none focus:border-gold-400/50 transition-all min-h-[120px] resize-none"
                                        placeholder="Ex: Treinamento de equipe, Manutenção preventiva, Gravação de vídeo..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <Button 
                                        type="button" 
                                        variant="glass" 
                                        className="h-14 rounded-2xl border-white/5 text-slate-400 hover:text-white" 
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        className="h-14 rounded-2xl bg-gold-400 text-slate-950 font-black shadow-lg shadow-gold-400/20" 
                                        isLoading={isSubmitting}
                                    >
                                        Confirmar Agenda
                                    </Button>
                                </div>
                            </form>

                            {/* Decorative Background Elements */}
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gold-400/10 rounded-full blur-3xl" />
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-gold-400/5 rounded-full blur-3xl" />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AnimateIn>
    );
};
