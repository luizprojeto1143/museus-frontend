
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

type Message = { role: string; content: string };

export default function ChatAI() {
  const { t } = useTranslation();
  const { tenantId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const [isTyping, setIsTyping] = useState(false);

  async function send() {
    if (!input) return;
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
    <div className="page-container" style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 100px)',
      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05), rgba(42, 24, 16, 0.9))',
      backdropFilter: 'blur(10px)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)'
    }}>
      <h1 className="section-title">{t("visitor.chat.title")}</h1>

      <div className="card" style={{ flex: 1, overflowY: 'auto', padding: "1rem", marginBottom: "1rem", display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--fg-muted)', marginTop: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
            <p>{t("visitor.chat.welcome", "Olá! Sou seu guia virtual. Pergunte-me sobre as obras ou o museu!")}</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "80%",
            padding: "0.8rem 1.2rem",
            borderRadius: "1rem",
            backgroundColor: msg.role === "user" ? "var(--accent-gold)" : "rgba(42, 24, 16, 0.8)",
            color: msg.role === "user" ? "var(--bg-page)" : "var(--fg-main)",
            border: msg.role === "assistant" ? "1px solid var(--border-subtle)" : "none",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
          }}>
            <strong style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.2rem', opacity: 0.8 }}>
              {msg.role === "user" ? t("visitor.chat.you") : t("visitor.chat.guide")}
            </strong>
            {msg.content}
          </div>
        ))}
        {isTyping && (
          <div style={{
            alignSelf: "flex-start",
            padding: "0.8rem 1.2rem",
            borderRadius: "1rem",
            backgroundColor: "rgba(42, 24, 16, 0.8)",
            color: "var(--fg-main)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            gap: "0.3rem",
            alignItems: "center"
          }}>
            <span className="typing-dot" style={{ animationDelay: "0s" }}>.</span>
            <span className="typing-dot" style={{ animationDelay: "0.2s" }}>.</span>
            <span className="typing-dot" style={{ animationDelay: "0.4s" }}>.</span>
            <style>{`
              .typing-dot { animation: typing 1.4s infinite ease-in-out both; font-size: 1.5rem; line-height: 0.5rem; }
              @keyframes typing { 0%, 80%, 100% { opacity: 0; } 40% { opacity: 1; } }
            `}</style>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("visitor.chat.placeholder")}
          style={{ flex: 1 }}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button className="btn" onClick={send} disabled={!input.trim()}>
          {t("visitor.chat.send")}
        </button>
      </div>
    </div>
  );
}
