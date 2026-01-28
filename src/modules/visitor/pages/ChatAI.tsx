import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Send, Bot } from "lucide-react";
import "./ChatAI.css";

type Message = { role: string; content: string };

export default function ChatAI() {
  const { t } = useTranslation();
  const { tenantId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await api.post("/ai/chat", { message: input, tenantId });
      const botMsg = { role: "assistant", content: res.data.text };
      setMessages((m) => [...m, botMsg]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: t("visitor.chat.error") }]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1 className="chat-title">
          <Bot size={28} />
          {t("visitor.chat.title")}
        </h1>
      </header>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty-icon">🤖</div>
            <p>{t("visitor.chat.welcome", "Olá! Sou seu guia virtual. Pergunte-me sobre as obras ou o museu!")}</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role}`}>
            <span className="chat-message-label">
              {msg.role === "user" ? t("visitor.chat.you") : t("visitor.chat.guide")}
            </span>
            <span className="chat-message-content">{msg.content}</span>
          </div>
        ))}

        {isTyping && (
          <div className="chat-typing">
            <span className="chat-typing-dot"></span>
            <span className="chat-typing-dot"></span>
            <span className="chat-typing-dot"></span>
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <input
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("visitor.chat.placeholder")}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button className="chat-send-btn" onClick={send} disabled={!input.trim()}>
          <Send size={18} />
          {t("visitor.chat.send")}
        </button>
      </div>
    </div>
  );
}
