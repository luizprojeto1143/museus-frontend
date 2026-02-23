import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import { api } from "../../api/client";
import { Calendar, Plus, MapPin, Clock, Edit, MoreHorizontal } from "lucide-react";

type Event = {
    id: string;
    title: string;
    description: string;
    coverUrl?: string;
    startDate: string;
    location?: string;
    active: boolean;
};

export const ProducerEvents: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) return;

        api.get("/events", { params: { tenantId } })
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
                setEvents(data);
            })
            .catch(err => console.error("Error fetching events", err))
            .finally(() => setLoading(false));
    }, [tenantId]);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    return (
        <div className="pb-16 animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#D4AF37] mb-2 font-serif">Meus Eventos</h1>
                    <p className="text-[#B0A090]">Gerencie seus eventos, exposições e workshops.</p>
                </div>
                <button
                    onClick={() => navigate("/producer/events/new")}
                    className="bg-[#D4AF37] text-[#1a1108] hover:bg-[#c5a028] px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg shadow-[#D4AF37]/20"
                >
                    <Plus size={20} /> Novo Evento
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
                </div>
            ) : events.length === 0 ? (
                <div className="bg-[#2c1e10] rounded-2xl p-12 text-center border border-dashed border-[#463420]">
                    <div className="w-20 h-20 bg-black/20 rounded-full flex items-center justify-center mx-auto mb-6 text-[#463420]">
                        <Calendar size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-[#EAE0D5] mb-2">Nenhum evento encontrado</h3>
                    <p className="text-[#B0A090] mb-8 max-w-md mx-auto">
                        Comece criando seu primeiro evento ou exposição para aparecer na programação da cidade.
                    </p>
                    <button
                        onClick={() => navigate("/producer/events/new")}
                        className="px-6 py-3 border border-[#D4AF37] text-[#D4AF37] rounded-lg hover:bg-[#D4AF37] hover:text-[#1a1108] transition-all font-bold"
                    >
                        Criar Agora
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map(event => (
                        <div
                            key={event.id}
                            className="bg-[#2c1e10] rounded-2xl overflow-hidden border border-[#463420] hover:border-[#D4AF37]/50 transition-all group hover:-translate-y-1 shadow-lg shadow-black/20"
                        >
                            {/* Cover Image */}
                            <div
                                className="h-48 bg-cover bg-center relative group-hover:scale-105 transition-transform duration-700"
                                style={{
                                    backgroundImage: event.coverUrl ? `url(${event.coverUrl})` : "linear-gradient(135deg, #333, #111)"
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-[#2c1e10] to-transparent opacity-80" />
                                <div className="absolute top-4 right-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${event.active
                                            ? "bg-[#4cd964] text-[#1a1108]"
                                            : "bg-[#eab308] text-[#1a1108]"
                                        }`}>
                                        {event.active ? "ATIVO" : "RASCUNHO"}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 relative">
                                <h3 className="text-xl font-bold text-[#EAE0D5] mb-2 font-serif line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
                                    {event.title}
                                </h3>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-[#B0A090] text-sm">
                                        <Calendar size={14} className="text-[#D4AF37]" />
                                        {formatDate(event.startDate)}
                                    </div>
                                    <div className="flex items-center gap-2 text-[#B0A090] text-sm line-clamp-1">
                                        <MapPin size={14} className="text-[#D4AF37]" />
                                        {event.location || "Local não informado"}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4 border-t border-[#463420]">
                                    <button
                                        onClick={() => navigate(`/producer/events/${event.id}`)}
                                        className="flex-1 py-2.5 bg-black/20 hover:bg-[#D4AF37] hover:text-[#1a1108] border border-[#463420] rounded-lg text-[#EAE0D5] text-sm font-bold flex items-center justify-center gap-2 transition-all"
                                    >
                                        <Edit size={16} /> Gerenciar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
