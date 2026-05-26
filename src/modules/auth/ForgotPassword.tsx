
import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { api } from "../../api/client";

export const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await api.post("/auth/recover-password", { email });
            setSent(true);
        } catch (err) {
            console.error(err);
            setError(t("auth.forgotpassword.error", "Não foi possível enviar o e-mail. Verifique se o endereço está correto."));
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
                            <div style={{ background: "rgba(255, 68, 68, 0.1)", color: "#ff4444", padding: "0.8rem", borderRadius: "0.5rem", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "#ccc" }}>{t("auth.forgotpassword.email", "E-mail")}</label>
                                <div style={{ position: "relative" }}>
                                    <Mail size={20} style={{ position: "absolute", top: "12px", left: "12px", color: "#666" }} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder={t("auth.forgotpassword.emailPlaceholder", "seu@email.com")}
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
                                    background: "var(--accent-primary)",
                                    color: "black",
                                    border: "none",
                                    fontWeight: "bold",
                                    fontSize: "1rem",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? t("auth.forgotpassword.sending", "Enviando...") : t("auth.forgotpassword.sendInstructions", "Enviar Instruções")}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};
