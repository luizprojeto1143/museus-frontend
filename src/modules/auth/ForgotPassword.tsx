
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { api } from "../../api/client";

export const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Mock API call or real endpoint
            // await api.post("/auth/recover-password", { email });

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            setSent(true);
        } catch (err) {
            console.error(err);
            setError("Não foi possível enviar o e-mail. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#121214",
            color: "white",
            padding: "1rem"
        }}>
            <div style={{
                width: "100%",
                maxWidth: "400px",
                background: "#1e1e24",
                borderRadius: "1rem",
                padding: "2rem",
                border: "1px solid rgba(255,255,255,0.05)"
            }}>
                {sent ? (
                    <div style={{ textAlign: "center" }}>
                        <div style={{ margin: "0 auto 1.5rem", width: "64px", height: "64px", borderRadius: "50%", background: "rgba(76, 217, 100, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#4cd964" }}>
                            <CheckCircle size={32} />
                        </div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>E-mail enviado!</h2>
                        <p style={{ opacity: 0.7, marginBottom: "2rem", lineHeight: "1.6" }}>
                            Se houver uma conta associada a <strong>{email}</strong>, você receberá as instruções de recuperação em instantes.
                        </p>
                        <Link to="/login" className="btn-primary" style={{ width: "100%", padding: "0.8rem", borderRadius: "0.5rem", display: "inline-block", textAlign: "center", textDecoration: "none", color: "black", fontWeight: "bold" }}>
                            Voltar ao Login
                        </Link>
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: "2rem" }}>
                            <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--fg-muted)", textDecoration: "none", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                                <ArrowLeft size={16} /> Voltar ao login
                            </Link>
                            <h1 style={{ fontSize: "1.75rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Esqueceu a senha?</h1>
                            <p style={{ opacity: 0.7 }}>
                                Digite seu e-mail para receber as instruções de redefinição.
                            </p>
                        </div>

                        {error && (
                            <div style={{ background: "rgba(255, 68, 68, 0.1)", color: "#ff4444", padding: "0.8rem", borderRadius: "0.5rem", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "#ccc" }}>E-mail</label>
                                <div style={{ position: "relative" }}>
                                    <Mail size={20} style={{ position: "absolute", top: "12px", left: "12px", color: "#666" }} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        style={{
                                            width: "100%",
                                            padding: "0.8rem 0.8rem 0.8rem 2.5rem",
                                            background: "rgba(0,0,0,0.2)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "0.5rem",
                                            color: "white",
                                            fontSize: "1rem"
                                        }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                                style={{
                                    width: "100%",
                                    padding: "1rem",
                                    borderRadius: "0.5rem",
                                    background: "#d4af37",
                                    color: "black",
                                    border: "none",
                                    fontWeight: "bold",
                                    fontSize: "1rem",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? "Enviando..." : "Enviar Instruções"}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};
