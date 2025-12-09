import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

interface Message {
    id: string;
    role: "user" | "assistant";
    text: string;
}

interface AiChatWidgetProps {
    workContext?: {
        title: string;
        artist: string;
        description: string;
    };
}

export const AiChatWidget: React.FC<AiChatWidgetProps> = ({ workContext }) => {
    const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            text: input
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            // Se tiver contexto da obra, adicionamos na mensagem
            let fullMessage = userMsg.text;
            if (workContext && messages.length === 0) {
                fullMessage = `[Contexto: O usuário está vendo a obra "${workContext.title}" de ${workContext.artist}. Descrição: ${workContext.description}] ${userMsg.text}`;
            }

            const res = await api.post("/ai/chat", {
                tenantId,
                message: fullMessage
            });

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                text: res.data.text
            };

            setMessages((prev) => [...prev, aiMsg]);
        } catch {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                text: t("common.error") // "Ocorreu um erro. Tente novamente."
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="btn btn-primary"
                style={{
                    position: "fixed",
                    bottom: "2rem",
                    right: "2rem",
                    borderRadius: "50%",
                    width: "60px",
                    height: "60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    zIndex: 1000
                }}
            >
                🤖
            </button>
        );
    }

    return (
        <div
            style={{
                position: "fixed",
                bottom: "2rem",
                right: "2rem",
                width: "350px",
                height: "500px",
                background: "linear-gradient(135deg, #1a1108 0%, #2a1810 100%)",
                borderRadius: "1rem",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                display: "flex",
                flexDirection: "column",
                zIndex: 1000,
                border: "1px solid var(--accent-gold)",
                overflow: "hidden"
            }}
        >
            {/* Header */}
            <div
                style={{
                    padding: "1rem",
                    background: "var(--accent-gold)",
                    color: "#1a1108",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontWeight: "bold"
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>🤖</span>
                    <span>{t("visitor.ai.chatTitle", "Guia Virtual")}</span>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    style={{
                        background: "none",
                        border: "none",
                        fontSize: "1.2rem",
                        cursor: "pointer",
                        color: "#1a1108"
                    }}
                >
                    ✕
                </button>
            </div>

            {/* Messages */}
            <div
                style={{
                    flex: 1,
                    padding: "1rem",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem"
                }}
            >
                {messages.length === 0 && (
                    <div style={{ textAlign: "center", color: "var(--fg-soft)", marginTop: "2rem" }}>
                        <p>👋 {t("visitor.ai.welcome", "Olá! Sou seu guia virtual.")}</p>
                        <p style={{ fontSize: "0.9rem" }}>
                            {workContext
                                ? t("visitor.ai.askAboutWork", "Pergunte algo sobre esta obra!")
                                : t("visitor.ai.askAnything", "Pergunte algo sobre o museu!")}
                        </p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        style={{
                            alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                            maxWidth: "80%",
                            backgroundColor: msg.role === "user" ? "var(--accent-gold)" : "rgba(255,255,255,0.1)",
                            color: msg.role === "user" ? "#1a1108" : "var(--fg-primary)",
                            padding: "0.75rem",
                            borderRadius: "0.5rem",
                            borderBottomRightRadius: msg.role === "user" ? 0 : "0.5rem",
                            borderBottomLeftRadius: msg.role === "assistant" ? 0 : "0.5rem",
                            fontSize: "0.9rem",
                            lineHeight: 1.4
                        }}
                    >
                        {msg.text}
                    </div>
                ))}

                {loading && (
                    <div style={{ alignSelf: "flex-start", color: "var(--fg-soft)", fontSize: "0.8rem" }}>
                        {t("common.typing", "Digitando...")}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
                onSubmit={handleSend}
                style={{
                    padding: "1rem",
                    borderTop: "1px solid var(--border-subtle)",
                    display: "flex",
                    gap: "0.5rem"
                }}
            >
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t("visitor.ai.placeholder", "Digite sua pergunta...")}
                    style={{
                        flex: 1,
                        padding: "0.75rem",
                        borderRadius: "0.5rem",
                        border: "1px solid var(--border-subtle)",
                        backgroundColor: "rgba(255,255,255,0.05)",
                        color: "var(--fg-primary)"
                    }}
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="btn btn-primary"
                    style={{ padding: "0.75rem" }}
                >
                    ➤
                </button>
            </form>
        </div>
    );
};
