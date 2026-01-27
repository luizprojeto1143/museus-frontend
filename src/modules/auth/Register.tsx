import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { api } from "../../api/client";

interface RegisterProps {
  tenantId: string;
  tenantName: string;
}

export const Register: React.FC<RegisterProps> = ({ tenantId, tenantName }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [age, setAge] = useState("");

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    const nameParts = name.trim().split(" ");
    if (nameParts.length < 2) {
      setError(t("auth.errors.fullNameRequired", "Por favor, digite seu nome e sobrenome."));
      return;
    }

    if (!email.includes("@")) {
      setError(t("auth.login.email") + " " + t("common.invalid", "inválido"));
      return;
    }

    if (password.length < 6) {
      setError(t("auth.errors.passwordLength", "Senha muito curta (min 6)"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("auth.errors.passwordsDoNotMatch"));
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setError(t("auth.errors.invalidAge", "Idade inválida"));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Criar conta de usuário visitante com api axios
      const registerRes = await api.post("/auth/register", {
        tenantId,
        name,
        email,
        password: password,
        role: "visitor"
      });

      // 2. Criar registro de visitante com idade (axios)
      await api.post("/visitors/register", {
        tenantId,
        name,
        email,
        age: ageNum
      });

      // Redirecionar para login (SPA Navigation)
      navigate("/login");
    } catch (err) {
      console.error("Registration Error:", err);
      // Axios puts response data in err.response.data
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      const backendMessage = axiosErr.response?.data?.message;
      const errorMsg = backendMessage || axiosErr.message || String(err);

      setError(t("auth.errors.genericFail", "Falha no registro") + `: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="app-shell"
      style={{
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1a1108 0%, #2d1810 100%)",
        padding: "2rem",
        position: "relative"
      }}
    >
      <LanguageSwitcher />
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 480,
          padding: "2.5rem",
          borderRadius: "1rem",
          border: "2px solid #d4af37",
          background:
            "radial-gradient(circle at top, rgba(212,175,55,0.08), transparent 70%)," +
            "linear-gradient(to bottom, #2a1810, #1f1208)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(212,175,55,0.2)",
          position: "relative"
        }}
      >
        {/* Ornamento superior */}
        <div style={{
          position: "absolute",
          top: "-1px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          height: "2px",
          background: "linear-gradient(90deg, transparent, #d4af37, transparent)"
        }} />

        <h2 className="text-2xl font-bold text-[var(--accent-gold)] text-center mb-6" style={{ fontFamily: "Georgia, serif" }}>
          {t("auth.register.title")} <small style={{ fontSize: "0.6em", opacity: 0.5 }}>v1.2</small>
        </h2>

        <p style={{
          textAlign: "center",
          color: "#c9b58c",
          fontSize: "0.9rem",
          marginBottom: "2rem",
          lineHeight: "1.5"
        }}>
          {t("welcome.subtitle")} <strong>{tenantName}</strong>.
        </p>

        {/* Foto (opcional) */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "1.5rem"
        }}>
          <label
            htmlFor="photo-input"
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              border: "3px solid #d4af37",
              overflow: "hidden",
              cursor: "pointer",
              background: photoPreview
                ? `url(${photoPreview}) center/cover`
                : "linear-gradient(135deg, #3a2818, #2a1810)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(0,0,0,0.5), inset 0 2px 8px rgba(212,175,55,0.2)",
              transition: "transform 0.2s",
              position: "relative"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            {!photoPreview && (
              <span style={{
                fontSize: "2.5rem",
                opacity: 0.6,
                filter: "sepia(1) hue-rotate(20deg)"
              }}>
                📸
              </span>
            )}
          </label>
          <input
            id="photo-input"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{ display: "none" }}
          />
        </div>

        <p style={{
          textAlign: "center",
          fontSize: "0.8rem",
          color: "#8b7355",
          marginBottom: "1.5rem"
        }}>
          {photoPreview ? "Foto adicionada ✓" : "Clique para adicionar foto (opcional)"}
        </p>

        {/* Nome completo */}
        <label style={{
          fontSize: "0.9rem",
          display: "block",
          marginBottom: "0.4rem",
          color: "#d4af37",
          fontFamily: "serif"
        }}>
          {t("auth.register.name")} *
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Digite seu nome"
          style={{
            width: "100%",
            marginBottom: "1.2rem",
            padding: "0.75rem",
            borderRadius: "0.5rem",
            border: "1px solid #8b7355",
            background: "rgba(42,24,16,0.6)",
            color: "#f5e6d3",
            fontFamily: "serif"
          }}
        />

        {/* E-mail */}
        <label style={{
          fontSize: "0.9rem",
          display: "block",
          marginBottom: "0.4rem",
          color: "#d4af37",
          fontFamily: "serif"
        }}>
          {t("auth.register.email")} *
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="seu@email.com"
          style={{
            width: "100%",
            marginBottom: "1.2rem",
            padding: "0.75rem",
            borderRadius: "0.5rem",
            border: "1px solid #8b7355",
            background: "rgba(42,24,16,0.6)",
            color: "#f5e6d3"
          }}
        />

        {/* Senha */}
        <label style={{
          fontSize: "0.9rem",
          display: "block",
          marginBottom: "0.4rem",
          color: "#d4af37",
          fontFamily: "serif"
        }}>
          {t("auth.register.password")} *
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          style={{
            width: "100%",
            marginBottom: "1.2rem",
            padding: "0.75rem",
            borderRadius: "0.5rem",
            border: "1px solid #8b7355",
            background: "rgba(42,24,16,0.6)",
            color: "#f5e6d3"
          }}
        />

        {/* Confirmar Senha */}
        <label style={{
          fontSize: "0.9rem",
          display: "block",
          marginBottom: "0.4rem",
          color: "#d4af37",
          fontFamily: "serif"
        }}>
          {t("auth.register.confirmPassword")} *
        </label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="Digite a senha novamente"
          style={{
            width: "100%",
            marginBottom: "1.2rem",
            padding: "0.75rem",
            borderRadius: "0.5rem",
            border: "1px solid #8b7355",
            background: "rgba(42,24,16,0.6)",
            color: "#f5e6d3"
          }}
        />

        {/* Idade */}
        <label style={{
          fontSize: "0.9rem",
          display: "block",
          marginBottom: "0.4rem",
          color: "#d4af37",
          fontFamily: "serif"
        }}>
          Idade *
        </label>
        <input
          type="number"
          required
          min="1"
          max="120"
          value={age}
          onChange={e => setAge(e.target.value)}
          placeholder="Digite sua idade"
          style={{
            width: "100%",
            marginBottom: "1.5rem",
            padding: "0.75rem",
            borderRadius: "0.5rem",
            border: "1px solid #8b7355",
            background: "rgba(42,24,16,0.6)",
            color: "#f5e6d3"
          }}
        />

        {error && (
          <p style={{
            color: "#ff6b6b",
            fontSize: "0.85rem",
            marginBottom: "1rem",
            textAlign: "center",
            background: "rgba(255,107,107,0.1)",
            padding: "0.5rem",
            borderRadius: "0.5rem"
          }}>
            {error}
          </p>
        )}

        <button
          className="btn"
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            background: "linear-gradient(135deg, #d4af37, #b8941f)",
            color: "#1a1108",
            fontWeight: "bold",
            fontSize: "1rem",
            padding: "0.9rem",
            border: "none",
            borderRadius: "0.6rem",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            opacity: isSubmitting ? 0.7 : 1,
            boxShadow: "0 4px 16px rgba(212,175,55,0.4)",
            fontFamily: "serif",
            textTransform: "uppercase",
            letterSpacing: "1px"
          }}
        >
          {isSubmitting ? t("common.loading") : t("auth.register.submit")}
        </button>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <p style={{ color: "#c9b58c", fontSize: "0.9rem" }}>
            {t("auth.register.hasAccount")}
            <span
              onClick={() => navigate("/login")}
              style={{
                color: "#d4af37",
                cursor: "pointer",
                textDecoration: "underline",
                fontWeight: "bold",
                marginLeft: "0.5rem"
              }}
            >
              {t("auth.login.submit")}
            </span>
          </p>
        </div>

        {/* Ornamento inferior */}
        <div style={{
          position: "absolute",
          bottom: "-1px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          height: "2px",
          background: "linear-gradient(90deg, transparent, #d4af37, transparent)"
        }} />
      </form>
    </div>
  );
};
