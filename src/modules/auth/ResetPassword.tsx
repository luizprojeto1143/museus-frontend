
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";
import { api } from "../../api/client";

export const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const token = query.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (password !== confirmPassword) {
            setError("As senhas não coincidem.");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres.");
            setLoading(false);
            return;
        }

        if (!token) {
            setError("Token inválido ou ausente. Solicite uma nova redefinição.");
            setLoading(false);
            return;
        }

        try {
            await api.post("/auth/reset-password", { token, newPassword: password });
            setSuccess(true);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Não foi possível redefinir a senha. O link pode ter expirado.");
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
                {success ? (
                    <div style={{ textAlign: "center" }}>
                        <div style={{ margin: "0 auto 1.5rem", width: "64px", height: "64px", borderRadius: "50%", background: "rgba(76, 217, 100, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#4cd964" }}>
                            <CheckCircle size={32} />
                        </div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>Senha Alterada!</h2>
                        <p style={{ opacity: 0.7, marginBottom: "2rem", lineHeight: "1.6" }}>
                            Sua senha foi atualizada com sucesso. Você já pode fazer login.
                        </p>
                        <Link to="/login" className="btn-primary" style={{ width: "100%", padding: "0.8rem", borderRadius: "0.5rem", display: "inline-block", textAlign: "center", textDecoration: "none", color: "black", fontWeight: "bold", background: "#d4af37" }}>
                            Ir para Login
                        </Link>
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: "2rem" }}>
                            <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--fg-muted)", textDecoration: "none", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                                <ArrowLeft size={16} /> Voltar ao login
                            </Link>
                            <h1 style={{ fontSize: "1.75rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Nova Senha</h1>
                            <p style={{ opacity: 0.7 }}>
                                Crie uma nova senha segura para sua conta.
                            </p>
                        </div>

                        {error && (
                            <div style={{ background: "rgba(255, 68, 68, 0.1)", color: "#ff4444", padding: "0.8rem", borderRadius: "0.5rem", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "#ccc" }}>Nova Senha</label>
                                <div style={{ position: "relative" }}>
                                    <Lock size={20} style={{ position: "absolute", top: "12px", left: "12px", color: "#666" }} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="No mínimo 6 caracteres"
                                        style={{
                                            width: "100%",
                                            padding: "0.8rem 2.5rem 0.8rem 2.5rem",
                                            background: "rgba(0,0,0,0.2)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "0.5rem",
                                            color: "white",
                                            fontSize: "1rem"
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: "absolute",
                                            right: "10px",
                                            top: "12px",
                                            background: "none",
                                            border: "none",
                                            color: "#666",
                                            cursor: "pointer"
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "#ccc" }}>Confirmar Senha</label>
                                <div style={{ position: "relative" }}>
                                    <Lock size={20} style={{ position: "absolute", top: "12px", left: "12px", color: "#666" }} />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="Repita a senha"
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
                                {loading ? "Redefinindo..." : "Redefinir Senha"}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};
