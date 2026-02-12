import React, { useState } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../../auth/AuthContext";
import { Search, User, Ticket, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const TotemSearch: React.FC = () => {
    const { tenantId } = useAuth();
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setSearched(true);
        try {
            // Search registrations by code, guest name, visitor name
            const res = await api.get(`/registrations?tenantId=${tenantId}&q=${query}`);
            // Map backend format to frontend expectation
            const mapped = res.data.data.map((reg: any) => ({
                id: reg.id,
                code: reg.code,
                status: reg.status,
                ownerName: reg.guestName || reg.visitor?.name || "Visitante",
                eventName: reg.event?.title || "Evento",
                ticketName: reg.ticket?.name
            }));
            setResults(mapped);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao buscar");
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (ticketCode: string) => {
        try {
            await api.post('/registrations/checkin', { code: ticketCode });
            toast.success("Check-in realizado!");
            // Refresh results
            handleSearch({ preventDefault: () => { } } as any);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Erro ao realizar check-in");
        }
    };

    return (
        <div style={{ padding: "2rem", height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "100%", maxWidth: "800px", marginBottom: "2rem" }}>
                <button
                    onClick={() => navigate('/totem')}
                    style={{
                        background: "rgba(255,255,255,0.1)",
                        border: "none",
                        color: "#fff",
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        cursor: "pointer",
                        marginBottom: "1rem"
                    }}
                >
                    ← Voltar
                </button>
                <h1 style={{ margin: "0 0 2rem", fontSize: "2rem", textAlign: "center" }}>Busca Manual</h1>

                <form onSubmit={handleSearch} style={{ position: "relative" }}>
                    <Search style={{ position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.5)" }} size={24} />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Nome, CPF ou Código do Ingresso"
                        style={{
                            width: "100%",
                            padding: "1.5rem 1.5rem 1.5rem 3.5rem",
                            fontSize: "1.2rem",
                            background: "rgba(255,255,255,0.1)",
                            border: "2px solid rgba(255,255,255,0.1)",
                            borderRadius: "16px",
                            color: "#fff",
                            outline: "none"
                        }}
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            position: "absolute",
                            right: "10px",
                            top: "10px",
                            bottom: "10px",
                            background: "#d4af37",
                            color: "#000",
                            border: "none",
                            borderRadius: "12px",
                            padding: "0 2rem",
                            fontSize: "1rem",
                            fontWeight: "bold",
                            cursor: "pointer"
                        }}
                    >
                        {loading ? "..." : "Buscar"}
                    </button>
                </form>
            </div>

            <div style={{ width: "100%", maxWidth: "800px", display: "flex", flexDirection: "column", gap: "1rem" }}>
                {results.length === 0 && searched && !loading && (
                    <div style={{ textAlign: "center", padding: "3rem", color: "rgba(255,255,255,0.5)" }}>
                        Nenhum resultado encontrado
                    </div>
                )}

                {results.map(ticket => (
                    <div key={ticket.id} style={{
                        background: "rgba(30, 30, 36, 0.8)",
                        borderRadius: "16px",
                        padding: "1.5rem",
                        border: "1px solid rgba(255,255,255,0.1)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                            <div style={{
                                width: "50px", height: "50px",
                                background: ticket.status === 'CHECKED_IN' ? "rgba(34, 197, 94, 0.2)" : "rgba(255,255,255,0.1)",
                                borderRadius: "50%",
                                display: "flex", alignItems: "center", justifyContent: "center"
                            }}>
                                {ticket.status === 'CHECKED_IN' ? <CheckCircle color="#22c55e" /> : <Ticket color="#fff" />}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: "1.2rem" }}>{ticket.ownerName || "Visitante"}</h3>
                                <p style={{ margin: "0.2rem 0 0", opacity: 0.6, fontSize: "0.9rem" }}>Code: {ticket.code} • {ticket.eventName}</p>
                            </div>
                        </div>

                        {ticket.status === 'CHECKED_IN' ? (
                            <span style={{ color: "#22c55e", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <CheckCircle size={18} />
                                Já entrou
                            </span>
                        ) : ticket.status === 'CANCELED' ? (
                            <span style={{ color: "#ef4444", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <XCircle size={18} />
                                Cancelado
                            </span>
                        ) : (
                            <button
                                onClick={() => handleCheckIn(ticket.code)}
                                style={{
                                    background: "#22c55e",
                                    color: "#fff",
                                    border: "none",
                                    padding: "0.8rem 1.5rem",
                                    borderRadius: "8px",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    fontSize: "1rem"
                                }}
                            >
                                Realizar Check-in
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <style>{`
                input:focus {
                    border-color: #d4af37 !important;
                }
            `}</style>
        </div>
    );
};
