import React, { useState, useEffect } from "react";
import { Mail, CheckCircle, Archive, AlertCircle, RefreshCw } from "lucide-react";
import { api } from "../../../api/client";

interface Message {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: "NEW" | "READ" | "ARCHIVED" | "REPLIED";
    createdAt: string;
}

export const MasterMessages: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"ALL" | "NEW" | "ARCHIVED">("NEW");

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const res = await api.get("/contact");
            setMessages(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/contact/${id}`, { status: newStatus });
            setMessages(prev => prev.map(m => m.id === id ? { ...m, status: newStatus as any } : m));
        } catch (err) {
            alert("Erro ao atualizar status");
        }
    };

    const filteredMessages = messages.filter(m => {
        if (filter === "ALL") return true;
        if (filter === "NEW") return m.status === "NEW" || m.status === "READ";
        if (filter === "ARCHIVED") return m.status === "ARCHIVED";
        return true;
    });

    return (
        <div style={{ padding: "2rem" }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#d4af37", display: "flex", alignItems: "center", gap: "1rem" }}>
                        <Mail /> Caixa de Entrada
                    </h1>
                    <p style={{ opacity: 0.7 }}>Solicitações de contato e leads da Landing Page.</p>
                </div>
                <button onClick={fetchMessages} style={{ background: "transparent", border: "1px solid #d4af37", color: "#d4af37", padding: "0.5rem 1rem", borderRadius: "0.5rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <RefreshCw size={16} /> Atualizar
                </button>
            </header>

            <div style={{ marginBottom: "2rem", display: "flex", gap: "1rem" }}>
                <button
                    onClick={() => setFilter("NEW")}
                    style={{ padding: "0.5rem 1rem", borderRadius: "2rem", border: "none", background: filter === "NEW" ? "#d4af37" : "rgba(255,255,255,0.1)", color: filter === "NEW" ? "#000" : "#fff", fontWeight: "bold", cursor: "pointer" }}
                >
                    Ativos ({messages.filter(m => m.status === "NEW" || m.status === "READ").length})
                </button>
                <button
                    onClick={() => setFilter("ARCHIVED")}
                    style={{ padding: "0.5rem 1rem", borderRadius: "2rem", border: "none", background: filter === "ARCHIVED" ? "#d4af37" : "rgba(255,255,255,0.1)", color: filter === "ARCHIVED" ? "#000" : "#fff", fontWeight: "bold", cursor: "pointer" }}
                >
                    Arquivados
                </button>
                <button
                    onClick={() => setFilter("ALL")}
                    style={{ padding: "0.5rem 1rem", borderRadius: "2rem", border: "none", background: filter === "ALL" ? "#d4af37" : "rgba(255,255,255,0.1)", color: filter === "ALL" ? "#000" : "#fff", fontWeight: "bold", cursor: "pointer" }}
                >
                    Todos
                </button>
            </div>

            {loading ? (
                <p>Carregando mensagens...</p>
            ) : filteredMessages.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem", opacity: 0.5 }}>
                    <Mail size={48} style={{ marginBottom: "1rem" }} />
                    <h3>Nenhuma mensagem encontrada</h3>
                </div>
            ) : (
                <div style={{ display: "grid", gap: "1rem" }}>
                    {filteredMessages.map(msg => (
                        <div key={msg.id} style={{
                            background: msg.status === "NEW" ? "rgba(212,175,55,0.1)" : "rgba(255,255,255,0.03)",
                            border: msg.status === "NEW" ? "1px solid rgba(212,175,55,0.3)" : "1px solid rgba(255,255,255,0.05)",
                            padding: "1.5rem",
                            borderRadius: "0.8rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#fff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        {msg.status === "NEW" && <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", borderRadius: "4px", background: "#d4af37", color: "#000" }}>NOVO</span>}
                                        {msg.subject}
                                    </h3>
                                    <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", opacity: 0.7, fontSize: "0.9rem" }}>
                                        <span><strong>De:</strong> {msg.name} ({msg.email})</span>
                                        <span>•</span>
                                        <span>{new Date(msg.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    {msg.status !== "ARCHIVED" && (
                                        <button
                                            title="Arquivar"
                                            onClick={() => updateStatus(msg.id, "ARCHIVED")}
                                            style={{ padding: "0.5rem", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "0.5rem", color: "#fff", cursor: "pointer" }}
                                        >
                                            <Archive size={18} />
                                        </button>
                                    )}
                                    {msg.status === "NEW" && (
                                        <button
                                            title="Marcar como Lido"
                                            onClick={() => updateStatus(msg.id, "READ")}
                                            style={{ padding: "0.5rem", background: "rgba(76, 217, 100, 0.2)", border: "1px solid rgba(76, 217, 100, 0.4)", borderRadius: "0.5rem", color: "#4cd964", cursor: "pointer" }}
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div style={{ background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "0.5rem", fontSize: "0.95rem", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                                {msg.message}
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                <a
                                    href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                                    style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", background: "#d4af37", color: "#000", fontWeight: "bold", borderRadius: "0.5rem", textDecoration: "none", fontSize: "0.9rem" }}
                                >
                                    Responder via Email
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
