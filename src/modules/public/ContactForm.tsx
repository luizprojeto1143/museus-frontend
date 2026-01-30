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
            <div style={{ textAlign: "center", padding: "3rem", background: "rgba(76, 217, 100, 0.1)", borderRadius: "1rem", border: "1px solid #4cd964" }}>
                <CheckCircle size={48} color="#4cd964" style={{ marginBottom: "1rem" }} />
                <h3 style={{ color: "#4cd964", marginBottom: "0.5rem" }}>Mensagem Enviada!</h3>
                <p>Nossa equipe entrará em contato em breve.</p>
                <button onClick={() => setStatus("idle")} style={{ marginTop: "1rem", background: "transparent", border: "1px solid #4cd964", padding: "0.5rem 1rem", borderRadius: "0.5rem", color: "#4cd964", cursor: "pointer" }}>Enviar outra</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{ background: "rgba(255,255,255,0.03)", padding: "2rem", borderRadius: "1rem", border: "1px solid rgba(212,175,55,0.2)" }}>
            <h3 style={{ color: "#d4af37", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Mail size={20} /> Fale com um Consultor
            </h3>

            <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", opacity: 0.8 }}>Nome</label>
                <input
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ width: "100%", padding: "0.8rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#fff" }}
                    placeholder="Seu nome"
                />
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", opacity: 0.8 }}>Email Profissional</label>
                <input
                    required
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ width: "100%", padding: "0.8rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#fff" }}
                    placeholder="seu@empresa.com"
                />
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", opacity: 0.8 }}>Assunto</label>
                <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    style={{ width: "100%", padding: "0.8rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#fff" }}
                >
                    <option value="Consultoria LBI">Adequação Lei Rouanet (LBI)</option>
                    <option value="Comercial">Planos e Preços</option>
                    <option value="Suporte">Suporte Técnico</option>
                </select>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", opacity: 0.8 }}>Mensagem</label>
                <textarea
                    required
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={4}
                    style={{ width: "100%", padding: "0.8rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#fff", resize: "vertical" }}
                    placeholder="Como podemos ajudar?"
                />
            </div>

            {status === "error" && (
                <div style={{ padding: "0.8rem", background: "rgba(255,0,0,0.1)", border: "1px solid #ff4444", borderRadius: "0.5rem", color: "#ff8888", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <AlertCircle size={16} /> Erro ao enviar. Tente novamente.
                </div>
            )}

            <button
                type="submit"
                disabled={status === "submitting"}
                style={{ width: "100%", padding: "1rem", background: "#d4af37", color: "#000", border: "none", borderRadius: "0.5rem", fontWeight: "bold", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", opacity: status === "submitting" ? 0.7 : 1 }}
            >
                {status === "submitting" ? "Enviando..." : <>Enviar Mensagem <Send size={18} /></>}
            </button>
        </form>
    );
};
