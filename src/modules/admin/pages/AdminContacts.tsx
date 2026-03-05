import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { Loader2, Mail, Eye, Archive, MessageSquare, User, Clock } from "lucide-react";
import { toast } from "react-hot-toast";

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: string;
    createdAt: string;
}

export const AdminContacts: React.FC = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchMessages = useCallback(async () => {
        try {
            const res = await api.get("/contact");
            setMessages(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar mensagens");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/contact/${id}`, { status });
            setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
            toast.success(status === "READ" ? "Marcado como lido" : "Arquivado");
        } catch (error) {
            toast.error("Erro ao atualizar status");
        }
    };

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}><Loader2 className="animate-spin" style={{ color: "#d4af37" }} /></div>;

    const statusBadge = (status: string) => {
        const map: Record<string, { label: string; cls: string }> = {
            NEW: { label: "Novo", cls: "bg-blue-500/10 text-blue-400" },
            READ: { label: "Lido", cls: "bg-green-500/10 text-green-400" },
            ARCHIVED: { label: "Arquivado", cls: "bg-gray-500/10 text-gray-400" }
        };
        const s = map[status] || { label: status, cls: "bg-gray-500/10 text-gray-400" };
        return <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${s.cls}`}>{s.label}</span>;
    };

    const newCount = messages.filter(m => m.status === "NEW").length;

    return (
        <div style={{ display: "grid", gap: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 className="section-title" style={{ margin: 0 }}>Mensagens de Contato</h1>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                        {newCount > 0 ? `${newCount} nova${newCount > 1 ? 's' : ''} mensage${newCount > 1 ? 'ns' : 'm'}` : "Todas as mensagens lidas"}
                    </p>
                </div>
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <MessageSquare size={16} /> {messages.length} total
                </div>
            </div>

            {messages.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "5rem 2rem", border: "2px dashed rgba(212,175,55,0.15)" }}>
                    <Mail size={48} style={{ margin: "0 auto 1rem", color: "#64748b", opacity: 0.3 }} />
                    <p style={{ color: "#64748b" }}>Nenhuma mensagem recebida.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                    {messages.map(msg => (
                        <div
                            key={msg.id}
                            className="card" style={{ overflow: "hidden", transition: "all 0.2s" }}
                        >
                            <div
                                style={{ padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer", transition: "background 0.2s" }}
                                onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
                            >
                                <div style={{ width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <User size={18} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <span style={{ color: "white", fontWeight: 700, fontSize: "0.9rem" }}>{msg.name}</span>
                                        {statusBadge(msg.status)}
                                    </div>
                                    <p style={{ color: "#64748b", fontSize: "0.75rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.subject || "Sem assunto"} — {msg.email}</p>
                                </div>
                                <div style={{ color: "#475569", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem", flexShrink: 0 }}>
                                    <Clock size={12} /> {new Date(msg.createdAt).toLocaleDateString("pt-BR")}
                                </div>
                            </div>

                            {expandedId === msg.id && (
                                <div style={{ padding: "0 1.5rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                                    <p style={{ color: "#d1d5db", fontSize: "0.85rem", whiteSpace: "pre-wrap", margin: "1rem 0" }}>{msg.message}</p>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        {msg.status !== "READ" && (
                                            <button
                                                onClick={() => updateStatus(msg.id, "READ")}
                                                style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.4rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.75rem", fontWeight: 700, background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "none", cursor: "pointer" }}
                                            >
                                                <Eye size={14} /> Marcar como lido
                                            </button>
                                        )}
                                        {msg.status !== "ARCHIVED" && (
                                            <button
                                                onClick={() => updateStatus(msg.id, "ARCHIVED")}
                                                style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.4rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.75rem", fontWeight: 700, background: "rgba(148,163,184,0.1)", color: "#94a3b8", border: "none", cursor: "pointer" }}
                                            >
                                                <Archive size={14} /> Arquivar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
