import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../auth/AuthContext";
import { api } from "../../api/client";
import { Ticket, Plus, DollarSign, Users, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/ui";

type TicketBatch = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    sold: number;
    eventId: string;
    event?: {
        title: string;
    };
    status?: string;
};

export const ProducerTickets: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [tickets, setTickets] = useState<TicketBatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [events, setEvents] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        quantity: "",
        eventId: ""
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [ticketsRes, eventsRes] = await Promise.all([
                api.get("/tickets"),
                api.get("/events")
            ]);
            setTickets(ticketsRes.data);
            setEvents(eventsRes.data);
        } catch (err) {
            console.error("Error fetching data", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/tickets", {
                ...formData,
                price: Number(formData.price),
                quantity: Number(formData.quantity)
            });
            setShowModal(false);
            setFormData({ name: "", price: "", quantity: "", eventId: "" });
            fetchData();
        } catch (err) {
            console.error("Error creating batch", err);
            alert("Erro ao criar lote");
        }
    };

    return (
        <div className="pb-16 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#D4AF37] mb-2 font-serif">{t("producer.tickets.title")}</h1>
                    <p className="text-[#B0A090]">{t("producer.tickets.subtitle")}</p>
                </div>
                <Button
                    onClick={() => setShowModal(true)}
                    className="bg-[#D4AF37] text-[#1a1108] hover:bg-[#c5a028] font-bold shadow-lg shadow-[#D4AF37]/20 border-none px-6"
                    leftIcon={<Plus size={20} />}
                >
                    {t("producer.tickets.newBatch")}
                </Button>
            </div>

            {/* Create Batch Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#1a1108] border border-[#463420] rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-[#B0A090] hover:text-white">
                            <Plus className="rotate-45" size={24} />
                        </button>
                        <h2 className="text-2xl font-bold text-[#D4AF37] mb-6 font-serif">Novo Lote</h2>
                        <form onSubmit={handleCreateBatch} className="space-y-4">
                            <div>
                                <label className="block text-sm text-[#B0A090] mb-1">Nome do Lote</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-black/20 border border-[#463420] rounded-xl px-4 py-2 text-white focus:border-[#D4AF37] outline-none"
                                    placeholder="Ex: 1º Lote - Meia"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-[#B0A090] mb-1">{t("producer.producertickets.preoR", `Preço (R$)`)}</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full bg-black/20 border border-[#463420] rounded-xl px-4 py-2 text-white focus:border-[#D4AF37] outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#B0A090] mb-1">Quantidade</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.quantity}
                                        onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                        className="w-full bg-black/20 border border-[#463420] rounded-xl px-4 py-2 text-white focus:border-[#D4AF37] outline-none"
                                        placeholder="100"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-[#B0A090] mb-1">Evento</label>
                                <select
                                    required
                                    value={formData.eventId}
                                    onChange={e => setFormData({ ...formData, eventId: e.target.value })}
                                    className="w-full bg-black/20 border border-[#463420] rounded-xl px-4 py-2 text-white focus:border-[#D4AF37] outline-none"
                                >
                                    <option value="">Selecione um evento</option>
                                    {events.map(ev => (
                                        <option key={ev.id} value={ev.id}>{ev.title}</option>
                                    ))}
                                </select>
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-[#D4AF37] text-black font-bold h-12 mt-4"
                            >
                                Criar Lote
                            </Button>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="p-12 text-center text-[#B0A090]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
                    {t("producer.tickets.loading")}
                </div>
            ) : tickets.length === 0 ? (
                <div className="bg-[#2c1e10] rounded-2xl p-12 text-center border border-dashed border-[#463420]">
                    <div className="w-20 h-20 bg-black/20 rounded-full flex items-center justify-center mx-auto mb-6 text-[#463420]">
                        <Ticket size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-[#EAE0D5] mb-2">Nenhum ingresso criado</h3>
                    <p className="text-[#B0A090] max-w-md mx-auto">
                        Crie lotes de ingressos para seus eventos e acompanhe as vendas aqui.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {tickets.map(ticket => (
                        <div key={ticket.id} className="bg-[#2c1e10] border border-[#463420] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-[#D4AF37]/50 transition-all shadow-lg shadow-black/20 group">

                            <div className="flex items-center gap-6 w-full md:w-auto">
                                <div className="bg-[#D4AF37]/10 p-4 rounded-2xl text-[#D4AF37] group-hover:scale-110 transition-transform">
                                    <Ticket size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-[#EAE0D5] mb-1 font-serif">{ticket.name}</h3>
                                    <div className="flex flex-wrap gap-3 text-sm text-[#B0A090]">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} /> {ticket.event?.title || "Evento"}
                                        </span>
                                        <span className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded text-xs uppercase border ${ticket.status === 'ACTIVE'
                                            ? 'bg-[#4cd964]/10 text-[#4cd964] border-[#4cd964]/20'
                                            : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                            }`}>
                                            {ticket.status === 'ACTIVE' ? t("producer.tickets.status.active") : t("producer.tickets.status.paused")}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-4 md:gap-12 w-full md:w-auto border-t md:border-t-0 border-[#463420] pt-4 md:pt-0">
                                <div>
                                    <div className="text-xs text-[#B0A090] uppercase tracking-wider mb-1">{t("producer.tickets.price")}</div>
                                    <div className="text-xl font-bold text-[#EAE0D5]">
                                        {ticket.price === 0 ? t("producer.tickets.free") : `R$ ${Number(ticket.price).toFixed(2)}`}
                                    </div>
                                </div>

                                <div className="text-right md:text-left">
                                    <div className="text-xs text-[#B0A090] uppercase tracking-wider mb-1">{t("producer.tickets.sold")}</div>
                                    <div className={`text-xl font-bold ${ticket.sold > ticket.quantity * 0.9 ? "text-red-400" : "text-[#4cd964]"}`}>
                                        {ticket.sold} <span className="text-sm text-[#B0A090] font-normal">/ {ticket.quantity}</span>
                                    </div>
                                </div>

                                <div className="hidden md:block text-right">
                                    <div className="text-xs text-[#B0A090] uppercase tracking-wider mb-1">{t("producer.tickets.revenue")}</div>
                                    <div className="text-xl font-bold text-[#D4AF37]">
                                        R$ {(ticket.sold * Number(ticket.price)).toFixed(2)}
                                    </div>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
