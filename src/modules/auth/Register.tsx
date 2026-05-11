import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../api/client";

interface RegisterProps {
  tenantId: string;
  tenantName: string;
  cityId?: string;
  equipamentoId?: string;
}

export const Register: React.FC<RegisterProps> = ({ tenantId, tenantName, cityId, equipamentoId }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [age, setAge] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [termsText, setTermsText] = useState("");
  const [privacyText, setPrivacyText] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (tenantId) {
      api.get(`/tenants/${tenantId}/settings`)
        .then(res => {
          setTermsText(res.data.termsOfUse || "");
          setPrivacyText(res.data.privacyPolicy || "");
        })
        .catch(console.error);
    }
  }, [tenantId]);

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
    setError("");

    if (!termsAccepted) {
      setError(t("auth.errors.termsRequired", "Você precisa aceitar os Termos de Uso."));
      return;
    }

    if (password.length < 6) {
      setError(t("auth.errors.passwordShort", "A senha deve ter no mínimo 6 caracteres."));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("auth.errors.passwordMismatch", "As senhas não conferem."));
      return;
    }

    try {
      setIsSubmitting(true);

      // Register User
      await api.post("/auth/register", {
        tenantId,
        cityId,
        equipamentoId,
        name,
        email,
        password,
        age: age ? parseInt(age) : undefined,
        photoUrl: photoPreview, // Note: In a real app, upload first. Assuming base64 or handled by backend for now.
        isTeacher
      });

      // Auto login or redirect
      navigate("/login");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || t("auth.errors.registerFailed", "Falha ao registrar."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-shell" style={{
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      background: "radial-gradient(circle at 50% 30%, rgba(212, 175, 55, 0.05), transparent 70%), linear-gradient(180deg, #1a1108 0%, #0f0a05 100%)",
      display: "flex"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "400px",
        padding: "2rem",
        background: "linear-gradient(145deg, rgba(44, 30, 16, 0.95), rgba(26, 17, 8, 0.98))",
        borderRadius: "1.5rem",
        border: "1px solid #463420",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 1px rgba(212, 175, 55, 0.2)",
        position: "relative",
        backdropFilter: "blur(10px)"
      }}>
        {/* Ornamento superior */}
        <div style={{
          position: "absolute",
          top: "-1px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          height: "2px",
          background: "linear-gradient(90deg, transparent, var(--accent-primary), transparent)"
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
              border: "3px solid var(--accent-primary)",
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
          {photoPreview ? t("auth.register.photo.added") : t("auth.register.photo.clickToAdd")}
        </p>

        <form onSubmit={handleSubmit}>
          {/* Nome completo */}
          <label style={{
            fontSize: "0.9rem",
            display: "block",
            marginBottom: "0.4rem",
            color: "var(--accent-primary)",
            fontFamily: "serif"
          }}>
            {t("auth.register.name")} *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t("auth.register.placeholders.name")}
            style={{
              width: "100%",
              marginBottom: "1.2rem",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #463420",
              background: "rgba(0, 0, 0, 0.3)",
              color: "#f5e6d3",
              fontFamily: "serif"
            }}
          />

          {/* E-mail */}
          <label style={{
            fontSize: "0.9rem",
            display: "block",
            marginBottom: "0.4rem",
            color: "var(--accent-primary)",
            fontFamily: "serif"
          }}>
            {t("auth.register.email")} *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t("auth.register.placeholders.email")}
            style={{
              width: "100%",
              marginBottom: "1.2rem",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #463420",
              background: "rgba(0, 0, 0, 0.3)",
              color: "#f5e6d3"
            }}
          />

          {/* Senha */}
          <label style={{
            fontSize: "0.9rem",
            display: "block",
            marginBottom: "0.4rem",
            color: "var(--accent-primary)",
            fontFamily: "serif"
          }}>
            {t("auth.register.password")} *
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={t("auth.register.mnimo6Caracteres")}
            style={{
              width: "100%",
              marginBottom: "1.2rem",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #463420",
              background: "rgba(0, 0, 0, 0.3)",
              color: "#f5e6d3"
            }}
          />

          {/* Confirmar Senha */}
          <label style={{
            fontSize: "0.9rem",
            display: "block",
            marginBottom: "0.4rem",
            color: "var(--accent-primary)",
            fontFamily: "serif"
          }}>
            {t("auth.register.confirmPassword")} *
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder={t("auth.register.placeholders.confirmPassword")}
            style={{
              width: "100%",
              marginBottom: "1.2rem",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #463420",
              background: "rgba(0, 0, 0, 0.3)",
              color: "#f5e6d3"
            }}
          />

          {/* Idade */}
          <label style={{
            fontSize: "0.9rem",
            display: "block",
            marginBottom: "0.4rem",
            color: "var(--accent-primary)",
            fontFamily: "serif"
          }}>
            {t("auth.register.age")} *
          </label>
          <input
            type="number"
            required
            min="1"
            max="120"
            value={age}
            onChange={e => setAge(e.target.value)}
            placeholder={t("auth.register.placeholders.age")}
            style={{
              width: "100%",
              marginBottom: "1.5rem",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #463420",
              background: "rgba(0, 0, 0, 0.3)",
              color: "#f5e6d3"
            }}
          />

          {/* Sou Professor? */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", fontSize: "0.9rem", color: "#f5e6d3" }}>
              <div
                onClick={() => setIsTeacher(!isTeacher)}
                style={{
                  width: "44px",
                  height: "24px",
                  borderRadius: "12px",
                  background: isTeacher ? "var(--accent-primary)" : "rgba(255,255,255,0.1)",
                  position: "relative",
                  cursor: "pointer",
                  transition: "background 0.3s",
                  flexShrink: 0,
                  border: isTeacher ? "none" : "1px solid #463420"
                }}
              >
                <div style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "white",
                  position: "absolute",
                  top: "3px",
                  left: isTeacher ? "23px" : "3px",
                  transition: "left 0.3s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
                }} />
              </div>
              <span>
                🎓 {t("auth.register.isTeacher")}
                <span style={{ display: "block", fontSize: "0.7rem", color: "#8b7355", marginTop: "2px" }}>
                  {t("auth.register.isTeacherDesc")}
                </span>
              </span>
            </label>
          </div>

          {/* Termos de Uso */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "flex", alignItems: "start", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem", color: "#f5e6d3" }}>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={e => setTermsAccepted(e.target.checked)}
                style={{ marginTop: "0.2rem" }}
              />
              <span>
                {t("auth.register.acceptTerms")}{" "}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  style={{ background: "none", border: "none", padding: 0, color: "var(--accent-primary)", textDecoration: "underline", cursor: "pointer", fontWeight: "bold" }}
                >
                  {t("auth.register.termsOfUse")}
                </button>
              </span>
            </label>
          </div>

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
            className="inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-all cursor-pointer border text-[13px] px-5 py-2.5 rounded-[var(--radius-md)] active:scale-95"
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, var(--accent-primary) 0%, #b8941f 100%)",
              color: "white",
              fontWeight: "900",
              fontSize: "1rem",
              padding: "1rem",
              border: "none",
              borderRadius: "0.75rem",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.7 : 1,
              boxShadow: "0 10px 25px rgba(212,175,55,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
              fontFamily: "var(--font-body)",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              textShadow: "0 1px 2px rgba(0,0,0,0.3)"
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
                  color: "var(--accent-primary)",
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
            background: "linear-gradient(90deg, transparent, var(--accent-primary), transparent)"
          }} />
        </form>

        {/* Modal Termos */}
        {showTermsModal && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.8)", zIndex: 9999,
            display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem"
          }}>
            <div style={{
              background: "#1a1108", border: "1px solid var(--accent-primary)", borderRadius: "0.5rem",
              width: "100%", maxWidth: "600px", maxHeight: "80vh", display: "flex", flexDirection: "column"
            }}>
              <div style={{ padding: "1rem", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ color: "var(--accent-primary)", margin: 0 }}>{t("auth.register.termsOfUse")}</h3>
                <button type="button" onClick={() => setShowTermsModal(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
              </div>
              <div style={{ padding: "1rem", overflowY: "auto", color: "#ddd", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                {termsText || "Termos de uso padrão da plataforma..."}
                {privacyText && (
                  <>
                    <h4 style={{ color: "var(--accent-primary)", marginTop: "1rem" }}>{t("auth.register.polticaDePrivacidade")}</h4>
                    {privacyText}
                  </>
                )}
              </div>
              <div style={{ padding: "1rem", borderTop: "1px solid #333", display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => { setTermsAccepted(true); setShowTermsModal(false); }}
                  style={{ background: "var(--accent-primary)", color: "#000", border: "none", padding: "0.5rem 1rem", borderRadius: "0.25rem", fontWeight: "bold", cursor: "pointer" }}
                >
                  {t("visitor.selectMuseum.modal.acceptAndClose")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
