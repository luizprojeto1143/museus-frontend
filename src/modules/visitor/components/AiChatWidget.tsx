import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Bot, X, Send } from "lucide-react";
import "./AiChatWidget.css";

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
                text: t("common.error")
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button onClick={() => setIsOpen(true)} className="ai-chat-fab">
                <Bot size={28} />
            </button>
        );
    }

    return (
        <div className="ai-chat-window">
            {/* Header */}
            <div className="ai-chat-header">
                <div className="ai-chat-header-title">
                    <Bot size={20} />
                    <span>{t("visitor.ai.chatTitle", "Guia Virtual")}</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="ai-chat-close-btn">
                    <X size={20} />
                </button>
            </div>

            {/* Messages */}
            <div className="ai-chat-messages">
                {messages.length === 0 && (
                    <div className="ai-chat-empty">
                        <div className="ai-chat-empty-icon">👋</div>
                        <p>{t("visitor.ai.welcome", "Olá! Sou seu guia virtual.")}</p>
                        <p>
                            {workContext
                                ? t("visitor.ai.askAboutWork", "Pergunte algo sobre esta obra!")
                                : t("visitor.ai.askAnything", "Pergunte algo sobre o museu!")}
                        </p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id} className={`ai-chat-message ${msg.role}`}>
                        {msg.text}
                    </div>
                ))}

                {loading && (
                    <div className="ai-chat-typing">
                        <div className="ai-chat-typing-dots">
                            <span className="ai-chat-typing-dot"></span>
                            <span className="ai-chat-typing-dot"></span>
                            <span className="ai-chat-typing-dot"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="ai-chat-input-area">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t("visitor.ai.placeholder", "Digite sua pergunta...")}
                    className="ai-chat-input"
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="ai-chat-send-btn"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};
