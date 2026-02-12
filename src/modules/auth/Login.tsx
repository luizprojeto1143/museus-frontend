import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
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
    <div className="app-shell" style={{
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      background: "radial-gradient(circle at 50% 30%, rgba(212, 175, 55, 0.05), transparent 70%), linear-gradient(180deg, #1a1108 0%, #0f0a05 100%)",
      fontFamily: "'Georgia', serif"
    }}>
      <LanguageSwitcher />
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 400,
          padding: "2.5rem",
          borderRadius: "1.5rem",
          border: "1px solid #463420",
          background: "linear-gradient(145deg, rgba(44, 30, 16, 0.95), rgba(26, 17, 8, 0.98))",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 1px rgba(212, 175, 55, 0.2)"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <img src="/logo-culturaviva.jpg" alt="Logo" style={{ width: 60, height: 60, borderRadius: "50%", marginBottom: "1rem", border: "2px solid #d4af37" }} />
          <h1 style={{ margin: 0, fontSize: "1.8rem", color: "#d4af37", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
            {t("auth.login.title")}
          </h1>
          <p style={{ color: "#8b7355", marginTop: "0.5rem", fontSize: "0.95rem" }}>
            {t("welcome.subtitle")}
          </p>
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{ fontSize: "0.9rem", display: "block", marginBottom: "0.5rem", color: "#EAE0D5" }}>
            {t("auth.login.email")}
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "0.85rem 1rem",
              borderRadius: "0.75rem",
              border: "1px solid #463420",
              background: "rgba(0, 0, 0, 0.3)",
              color: "#EAE0D5",
              fontSize: "1rem",
              outline: "none",
              transition: "border-color 0.3s"
            }}
            onFocus={(e) => e.target.style.borderColor = "#d4af37"}
            onBlur={(e) => e.target.style.borderColor = "#463420"}
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ fontSize: "0.9rem", display: "block", marginBottom: "0.5rem", color: "#EAE0D5" }}>
            {t("auth.login.password")}
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "0.85rem 1rem",
              borderRadius: "0.75rem",
              border: "1px solid #463420",
              background: "rgba(0, 0, 0, 0.3)",
              color: "#EAE0D5",
              fontSize: "1rem",
              outline: "none",
              transition: "border-color 0.3s"
            }}
            onFocus={(e) => e.target.style.borderColor = "#d4af37"}
            onBlur={(e) => e.target.style.borderColor = "#463420"}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
          <Link to="/forgot-password" style={{ color: '#d4af37', fontSize: '0.9rem', textDecoration: 'none', opacity: 0.8 }}>Esqueceu a senha?</Link>
        </div>

        {import.meta.env.VITE_DEMO_MODE === "true" && (
          <p style={{ fontSize: "0.8rem", color: "#8b7355", marginBottom: "1rem", background: "rgba(212, 175, 55, 0.05)", padding: "0.5rem", borderRadius: "0.5rem" }}>
            <strong>Modo Demo:</strong> use qualquer e-mail.
          </p>
        )}

        {error && (
          <p style={{ color: "#ef4444", fontSize: "0.9rem", marginBottom: "1rem", padding: "0.75rem", background: "rgba(239, 68, 68, 0.1)", borderRadius: "0.5rem", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: "1rem",
            background: "linear-gradient(135deg, #d4af37 0%, #b8860b 100%)",
            color: "#1a1108",
            border: "none",
            borderRadius: "0.75rem",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: isSubmitting ? "wait" : "pointer",
            opacity: isSubmitting ? 0.7 : 1,
            boxShadow: "0 4px 15px rgba(212, 175, 55, 0.3)"
          }}
        >
          {isSubmitting ? t("common.loading") : t("auth.login.submit")}
        </button>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <p style={{ fontSize: "0.95rem", color: "#8b7355" }}>
            {t("auth.login.noAccount")}{" "}
            <span
              style={{ color: "#d4af37", cursor: "pointer", textDecoration: "underline", fontWeight: "bold" }}
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
