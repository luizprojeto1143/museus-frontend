import React, { useState } from "react";
import { Mail, Send, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "../../api/client";

export const ContactForm: React.FC = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [subject, setSubject] = useState("Consultoria LBI");

    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");

        try {
            await api.post("/contact", { name, email, subject, message });
            setStatus("success");
            // Limpa o form
            setName("");
            setEmail("");
            setMessage("");
        } catch (error) {
            console.error(error);
            setStatus("error");
        }
    };

    if (status === "success") {
        return (
            <div role="alert" style={{ textAlign: "center", padding: "3rem", background: "rgba(34, 197, 94, 0.1)", borderRadius: "var(--radius-lg)", border: "1px solid var(--status-success)" }}>
                <CheckCircle size={48} color="var(--status-success)" style={{ marginBottom: "1rem" }} aria-hidden="true" />
                <h3 style={{ color: "var(--status-success)", marginBottom: "0.5rem" }}>Mensagem Enviada!</h3>
                <p style={{ fontFamily: "var(--font-body)" }}>Nossa equipe entrará em contato em breve.</p>
                <button
                    onClick={() => setStatus("idle")}
                    style={{
                        marginTop: "1rem",
                        background: "transparent",
                        border: "1px solid var(--status-success)",
                        padding: "0.5rem 1rem",
                        borderRadius: "var(--radius-md)",
                        color: "var(--status-success)",
                        cursor: "pointer",
                        fontFamily: "var(--font-body)"
                    }}
                >
                    Enviar outra
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{ background: "var(--bg-surface)", padding: "2rem", borderRadius: "1rem", border: "1px solid var(--border-default)" }}>
            <h3 style={{ color: "var(--accent-primary)", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Mail size={20} aria-hidden="true" /> Fale com um Consultor
            </h3>

            <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="contact-name" style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", opacity: 0.8, fontFamily: "var(--font-body)" }}>Nome</label>
                <input
                    id="contact-name"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ width: "100%", padding: "0.8rem", background: "var(--bg-page)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", color: "var(--fg-main)", fontFamily: "var(--font-body)" }}
                    placeholder="Seu nome"
                />
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="contact-email" style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", opacity: 0.8, fontFamily: "var(--font-body)" }}>Email Profissional</label>
                <input
                    id="contact-email"
                    required
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ width: "100%", padding: "0.8rem", background: "var(--bg-page)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", color: "var(--fg-main)", fontFamily: "var(--font-body)" }}
                    placeholder="seu@empresa.com"
                />
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="contact-subject" style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", opacity: 0.8, fontFamily: "var(--font-body)" }}>Assunto</label>
                <select
                    id="contact-subject"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    style={{ width: "100%", padding: "0.8rem", background: "var(--bg-page)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", color: "var(--fg-main)", fontFamily: "var(--font-body)" }}
                >
                    <option value="Consultoria LBI">Adequação Lei Rouanet (LBI)</option>
                    <option value="Comercial">Planos e Preços</option>
                    <option value="Suporte">Suporte Técnico</option>
                </select>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
                <label htmlFor="contact-message" style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", opacity: 0.8, fontFamily: "var(--font-body)" }}>Mensagem</label>
                <textarea
                    id="contact-message"
                    required
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={4}
                    style={{ width: "100%", padding: "0.8rem", background: "var(--bg-page)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", color: "var(--fg-main)", resize: "vertical", fontFamily: "var(--font-body)" }}
                    placeholder="Como podemos ajudar?"
                />
            </div>

            {status === "error" && (
                <div role="alert" style={{ padding: "0.8rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--status-error)", borderRadius: "var(--radius-md)", color: "#ff8888", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <AlertCircle size={16} aria-hidden="true" /> Erro ao enviar. Tente novamente.
                </div>
            )}

            <button
                type="submit"
                disabled={status === "submitting"}
                style={{
                    width: "100%",
                    padding: "1rem",
                    background: "var(--accent-primary)",
                    color: "var(--color-neutral-950)",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    fontWeight: "bold",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "0.5rem",
                    opacity: status === "submitting" ? 0.7 : 1,
                    fontFamily: "var(--font-body)"
                }}
            >
                {status === "submitting" ? "Enviando..." : <>Enviar Mensagem <Send size={18} aria-hidden="true" /></>}
            </button>
        </form>
    );
};
