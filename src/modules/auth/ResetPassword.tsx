
import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";
import { api } from "../../api/client";

export const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation();
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
            setError(t("auth.resetpassword.passwordsDontMatch", "As senhas não coincidem."));
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError(t("auth.resetpassword.passwordTooShort", "A senha deve ter pelo menos 6 caracteres."));
            setLoading(false);
            return;
        }

        if (!token) {
            setError(t("auth.resetpassword.invalidToken", "Token inválido ou ausente. Solicite uma nova redefinição."));
            setLoading(false);
            return;
        }

        try {
            await api.post("/auth/reset-password", { token, newPassword: password });
            setSuccess(true);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || t("auth.resetpassword.errorReset", "Não foi possível redefinir a senha. O link pode ter expirado."));
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
                                {loading ? t("auth.resetpassword.resetting", "Redefinindo...") : t("auth.resetpassword.submit", "Redefinir Senha")}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};
