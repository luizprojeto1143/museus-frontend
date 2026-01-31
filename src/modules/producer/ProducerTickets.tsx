import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { api } from "../../api/client";
import { Ticket, Plus, DollarSign, Users, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";

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

    useEffect(() => {
        // Fetch tickets directly from the real endpoint
        api.get("/tickets")
            .then((res) => {
                setTickets(res.data);
            })
            .catch(err => console.error("Error fetching tickets", err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="producer-tickets">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: "2.5rem" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", color: "#d4af37", marginBottom: "0.5rem" }}>{t("producer.tickets.title")}</h1>
                    <p style={{ opacity: 0.7 }}>{t("producer.tickets.subtitle")}</p>
                </div>
                <button className="btn-premium" style={{
                    background: "#d4af37", color: "#000", border: "none",
                    padding: "0.8rem 1.5rem", borderRadius: "0.5rem", fontWeight: "bold",
                    display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer"
                }}>
                    <Plus size={20} /> {t("producer.tickets.newBatch")}
                </button>
            </div>

            {loading ? (
                <div style={{ opacity: 0.5 }}>{t("producer.tickets.loading")}</div>
            ) : (
                <div style={{ display: "grid", gap: "1rem" }}>
                    {tickets.map(ticket => (
                        <div key={ticket.id} style={{
                            background: "linear-gradient(145deg, #1e1e24, #15151a)",
                            borderRadius: "0.8rem",
                            padding: "1.5rem",
                            border: "1px solid rgba(255,255,255,0.05)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                                <div style={{ background: "rgba(212,175,55,0.1)", padding: "1rem", borderRadius: "0.8rem" }}>
                                    <Ticket size={24} color="#d4af37" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "0.3rem" }}>{ticket.name}</h3>
                                    <div style={{ display: "flex", gap: "1rem", fontSize: "0.9rem", opacity: 0.6 }}>
                                        <span>{ticket.event?.title || "Evento"}</span>
                                        <span className={`status-badge ${ticket.status === 'ACTIVE' ? 'active' : ''}`}>
                                            {ticket.status === 'ACTIVE' ? t("producer.tickets.status.active") : t("producer.tickets.status.paused")}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "3rem", textAlign: "right" }}>
                                <div>
                                    <div style={{ fontSize: "0.8rem", opacity: 0.5 }}>{t("producer.tickets.price")}</div>
                                    <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                                        {ticket.price === 0 ? t("producer.tickets.free") : `R$ ${Number(ticket.price).toFixed(2)}`}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: "0.8rem", opacity: 0.5 }}>{t("producer.tickets.sold")}</div>
                                    <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: ticket.sold > ticket.quantity * 0.9 ? "#ff4444" : "#4cd964" }}>
                                        {ticket.sold} <span style={{ fontSize: "0.8rem", opacity: 0.7, color: "white" }}>/ {ticket.quantity}</span>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: "0.8rem", opacity: 0.5 }}>{t("producer.tickets.revenue")}</div>
                                    <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#d4af37" }}>
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
