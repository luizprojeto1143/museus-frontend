import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { api } from "../../api/client";
import { Search, Mail, Download, User } from "lucide-react";

type Participant = {
    id: string;
    name: string;
    email: string;
    event: string;
    ticketType: string;
    status: "CONFIRMED" | "CHECKED_IN" | "PENDING";
    date: string;
};

export const ProducerAudience: React.FC = () => {
    // Mock Data
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch real registrations
        api.get("/registrations")
            .then(res => {
                // Map API response to Participant type
                const data = res.data.map((reg: any) => ({
                    id: reg.id,
                    name: reg.visitor?.name || reg.guestName || "Visitante",
                    email: reg.visitor?.email || reg.guestEmail || "",
                    event: reg.event?.title || "Evento Desconhecido",
                    ticketType: reg.ticket?.name || "Ingresso",
                    status: reg.status,
                    date: reg.createdAt // Used for sorting if needed
                }));
                setParticipants(data);
            })
            .catch(err => console.error("Error fetching audience", err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="producer-audience">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: "2.5rem" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", color: "#d4af37", marginBottom: "0.5rem" }}>Meu Público (CRM)</h1>
                    <p style={{ opacity: 0.7 }}>Visualize quem são seus visitantes e exporte dados para marketing.</p>
                </div>
                <button className="btn-premium" style={{
                    background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)",
                    padding: "0.8rem 1.5rem", borderRadius: "0.5rem", fontWeight: "bold",
                    display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer"
                }}>
                    <Download size={20} /> Exportar CSV
                </button>
            </div>

            <div style={{ background: "linear-gradient(145deg, #1e1e24, #15151a)", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
                {/* Toolbar */}
                <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: "1rem" }}>
                    <div style={{ position: "relative", flex: 1 }}>
                        <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", opacity: 0.5 }} />
                        <input
                            placeholder="Buscar por nome ou email..."
                            style={{
                                width: "100%", padding: "0.8rem 1rem 0.8rem 3rem",
                                background: "rgba(0,0,0,0.2)", border: "none", borderRadius: "0.5rem", color: "white"
                            }}
                        />
                    </div>
                </div>

                {/* Table Header */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 2fr 1.5fr 1fr", padding: "1rem 1.5rem", background: "rgba(0,0,0,0.3)", fontSize: "0.85rem", textTransform: "uppercase", opacity: 0.7, fontWeight: "bold" }}>
                    <div>Nome</div>
                    <div>Evento</div>
                    <div>Ingresso</div>
                    <div>Status</div>
                    <div style={{ textAlign: "right" }}>Ações</div>
                </div>

                {/* Rows */}
                {participants.map(p => (
                    <div key={p.id} style={{
                        display: "grid", gridTemplateColumns: "2fr 2fr 2fr 1.5fr 1fr",
                        padding: "1.2rem 1.5rem",
                        borderBottom: "1px solid rgba(255,255,255,0.02)",
                        alignItems: "center",
                        fontSize: "0.95rem"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#333", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <User size={16} opacity={0.7} />
                            </div>
                            <div>
                                <div style={{ fontWeight: "bold" }}>{p.name}</div>
                                <div style={{ fontSize: "0.8rem", opacity: 0.5 }}>{p.email}</div>
                            </div>
                        </div>
                        <div style={{ opacity: 0.8 }}>{p.event}</div>
                        <div>
                            <span style={{ background: "rgba(255,255,255,0.05)", padding: "0.2rem 0.6rem", borderRadius: "0.3rem", fontSize: "0.85rem" }}>
                                {p.ticketType}
                            </span>
                        </div>
                        <div>
                            <span style={{
                                background: p.status === "CHECKED_IN" ? "rgba(76, 217, 100, 0.1)" : "rgba(255, 179, 64, 0.1)",
                                color: p.status === "CHECKED_IN" ? "#4cd964" : "#ffb340",
                                padding: "0.2rem 0.6rem", borderRadius: "1rem", fontSize: "0.75rem", fontWeight: "bold"
                            }}>
                                {p.status === "CHECKED_IN" ? "PRESENTE" : "CONFIRMADO"}
                            </span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <button style={{ background: "transparent", border: "none", cursor: "pointer", opacity: 0.7 }}>
                                <Mail size={18} color="white" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
