import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const { role: userRole, tenantType } = await login({ email, password });

      // Redirecionar baseado no role após login
      let redirectPath = "/";

      if (userRole === "master") {
        redirectPath = "/master";
      } else if (userRole === "admin") {
        if (tenantType === "PRODUCER") {
          redirectPath = "/producer";
        } else {
          redirectPath = "/admin";
        }
      } else if (userRole === "visitor") {
        redirectPath = "/home";
      }



      const from = location.state?.from?.pathname;
      navigate(from || redirectPath, { replace: true, state: { justLoggedIn: true } });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("auth.errors.generic")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-shell" style={{ justifyContent: "center", alignItems: "center", position: "relative" }}>
      <LanguageSwitcher />
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 380,
          padding: "2rem",
          borderRadius: "1.25rem",
          border: "1px solid rgba(148,163,184,0.5)",
          background:
            "radial-gradient(circle at top left, rgba(56,189,248,0.16), transparent 55%)," +
            "radial-gradient(circle at bottom right, rgba(139,92,246,0.18), transparent 55%)," +
            "rgba(15,23,42,0.96)",
          boxShadow: "0 20px 60px rgba(15,23,42,0.9)"
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.4rem", marginBottom: "0.25rem" }}>
          {t("auth.login.title")}
        </h1>
        <p className="section-subtitle" style={{ marginBottom: "1.5rem" }}>
          {t("welcome.subtitle")}
        </p>

        <label style={{ fontSize: "0.85rem", display: "block", marginBottom: "0.25rem" }}>
          {t("auth.login.email")}
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            width: "100%",
            marginBottom: "0.9rem",
            padding: "0.6rem 0.75rem",
            borderRadius: "0.6rem",
            border: "1px solid rgba(148,163,184,0.7)",
            background: "rgba(15,23,42,0.9)",
            color: "#e5e7eb"
          }}
        />

        <label style={{ fontSize: "0.85rem", display: "block", marginBottom: "0.25rem" }}>
          {t("auth.login.password")}
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            width: "100%",
            marginBottom: "1.1rem",
            padding: "0.6rem 0.75rem",
            borderRadius: "0.6rem",
            border: "1px solid rgba(148,163,184,0.7)",
            background: "rgba(15,23,42,0.9)",
            color: "#e5e7eb"
          }}
        />

        {import.meta.env.VITE_DEMO_MODE === "true" && (
          <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.75rem" }}>
            <strong>Dica para modo demo:</strong> use qualquer e-mail. Se incluir{" "}
            <code>master</code> no e-mail, entra como master.
          </p>
        )}

        {error && (
          <p style={{ color: "#f97373", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
            {error}
          </p>
        )}

        <button className="btn" type="submit" disabled={isSubmitting} style={{ width: "100%" }}>
          {isSubmitting ? t("common.loading") : t("auth.login.submit")}
        </button>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <p style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
            {t("auth.login.noAccount")}{" "}
            <span
              style={{ color: "#38bdf8", cursor: "pointer", textDecoration: "underline" }}
              onClick={() => navigate("/register")}
            >
              {t("auth.register.submit")}
            </span>
          </p>
        </div>
      </form>


    </div>
  );
};
