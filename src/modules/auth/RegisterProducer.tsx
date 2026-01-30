import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../api/client";
import { ArrowLeft, CheckCircle } from "lucide-react";

export const RegisterProducer: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [projectName, setProjectName] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const res = await api.post("/auth/register-tenant", {
                projectName,
                name,
                email,
                password
            });

            // Login automático (token vem no response)
            if (res.data.accessToken) {
                localStorage.setItem("token", res.data.accessToken);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                // Redirecionar para Dashboard Admin
                navigate("/admin");
            } else {
                navigate("/login");
            }
        } catch (err: any) {
            console.error("Erro cadastro produtor", err);
            const msg = err.response?.data?.message || "Erro ao criar conta. Tente novamente.";
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "#1a1108",
            color: "#f5e6d3",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem"
        }}>
            <button
                onClick={() => navigate("/")}
                style={{ position: "absolute", top: "2rem", left: "2rem", background: "transparent", border: "none", color: "#d4af37", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
                <ArrowLeft size={20} /> Voltar para o Site
            </button>

            <div style={{
                width: "100%",
                maxWidth: "500px",
                padding: "3rem",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "1rem",
                border: "1px solid rgba(212,175,55,0.3)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
            }}>
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <h1 style={{ color: "#d4af37", fontFamily: "Georgia, serif", fontSize: "1.8rem", marginBottom: "0.5rem" }}>Área do Produtor</h1>
                    <p style={{ opacity: 0.7 }}>Cadastre seu projeto cultural e comece agora.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "#d4af37", fontSize: "0.9rem" }}>Nome do Projeto / Museu / Espaço</label>
                        <input
                            required
                            value={projectName}
                            onChange={e => setProjectName(e.target.value)}
                            placeholder="Ex: Museu Histórico Municipal, Festival de Jazz..."
                            style={{
                                width: "100%",
                                padding: "0.8rem",
                                background: "rgba(0,0,0,0.3)",
                                border: "1px solid #8b7355",
                                borderRadius: "0.5rem",
                                color: "#fff",
                                fontSize: "1rem"
                            }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "#d4af37", fontSize: "0.9rem" }}>Nome do Responsável</label>
                        <input
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Seu nome completo"
                            style={{
                                width: "100%",
                                padding: "0.8rem",
                                background: "rgba(0,0,0,0.3)",
                                border: "1px solid #8b7355",
                                borderRadius: "0.5rem",
                                color: "#fff",
                                fontSize: "1rem"
                            }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "#d4af37", fontSize: "0.9rem" }}>Email Profissional</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            style={{
                                width: "100%",
                                padding: "0.8rem",
                                background: "rgba(0,0,0,0.3)",
                                border: "1px solid #8b7355",
                                borderRadius: "0.5rem",
                                color: "#fff",
                                fontSize: "1rem"
                            }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: "2rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "#d4af37", fontSize: "0.9rem" }}>Senha</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            style={{
                                width: "100%",
                                padding: "0.8rem",
                                background: "rgba(0,0,0,0.3)",
                                border: "1px solid #8b7355",
                                borderRadius: "0.5rem",
                                color: "#fff",
                                fontSize: "1rem"
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{ marginBottom: "1.5rem", padding: "0.8rem", background: "rgba(255,0,0,0.1)", border: "1px solid #ff4444", borderRadius: "0.5rem", color: "#ff8888", fontSize: "0.9rem", textAlign: "center" }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            width: "100%",
                            padding: "1rem",
                            background: "linear-gradient(135deg, #d4af37, #b8941f)",
                            color: "#1a1108",
                            border: "none",
                            borderRadius: "0.5rem",
                            fontSize: "1.1rem",
                            fontWeight: "bold",
                            cursor: isSubmitting ? "wait" : "pointer",
                            opacity: isSubmitting ? 0.7 : 1
                        }}
                    >
                        {isSubmitting ? "Criando Espaço..." : "Criar Meu Projeto Digital"}
                    </button>
                </form>

                <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem", opacity: 0.6 }}>
                    Já tem uma conta? <span onClick={() => navigate("/login")} style={{ color: "#d4af37", cursor: "pointer", textDecoration: "underline" }}>Fazer Login</span>
                </p>

                <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        <CheckCircle size={16} color="#4cd964" />
                        <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>Acesso imediato ao Painel Administrativo</span>
                    </div>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginTop: "0.5rem" }}>
                        <CheckCircle size={16} color="#4cd964" />
                        <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>Período de teste gratuito (Trial)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
