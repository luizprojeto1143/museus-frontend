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

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsText, setTermsText] = useState("");
  const [privacyText, setPrivacyText] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ... validations
    if (!termsAccepted) {
      setError(t("auth.errors.termsRequired", "Você precisa aceitar os Termos de Uso."));
      return;
    }
    // ... rest of submit
    // ... inside JSX form
    {/* Termos de Uso */ }
    <div style={{ marginBottom: "1.5rem" }}>
      <label style={{ display: "flex", alignItems: "start", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem", color: "#f5e6d3" }}>
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={e => setTermsAccepted(e.target.checked)}
          style={{ marginTop: "0.2rem" }}
        />
        <span>
          Li e aceito os{" "}
          <button
            type="button"
            onClick={() => setShowTermsModal(true)}
            style={{ background: "none", border: "none", padding: 0, color: "#d4af37", textDecoration: "underline", cursor: "pointer", fontWeight: "bold" }}
          >
            Termos de Uso
          </button>
        </span>
      </label>
    </div>

    {
      error && (
            // ...
        )
    }

    <button //... submit
    >
            //...
    </button>

    {/* Modal Termos */ }
    {
      showTermsModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.8)", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem"
        }}>
          <div style={{
            background: "#1a1108", border: "1px solid #d4af37", borderRadius: "0.5rem",
            width: "100%", maxWidth: "600px", maxHeight: "80vh", display: "flex", flexDirection: "column"
          }}>
            <div style={{ padding: "1rem", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ color: "#d4af37", margin: 0 }}>Termos de Uso</h3>
              <button type="button" onClick={() => setShowTermsModal(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            </div>
            <div style={{ padding: "1rem", overflowY: "auto", color: "#ddd", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
              {termsText || "Termos de uso padrão da plataforma..."}
              {privacyText && (
                <>
                  <h4 style={{ color: "#d4af37", marginTop: "1rem" }}>Política de Privacidade</h4>
                  {privacyText}
                </>
              )}
            </div>
            <div style={{ padding: "1rem", borderTop: "1px solid #333", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => { setTermsAccepted(true); setShowTermsModal(false); }}
                style={{ background: "#d4af37", color: "#000", border: "none", padding: "0.5rem 1rem", borderRadius: "0.25rem", fontWeight: "bold", cursor: "pointer" }}
              >
                Aceitar e Fechar
              </button>
            </div>
          </div>
        </div>
      )
    }
      </form >
    </div >
  );
};
{/* Ornamento superior */ }
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

{/* Foto (opcional) */ }
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

{/* Nome completo */ }
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

{/* E-mail */ }
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

{/* Senha */ }
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

{/* Confirmar Senha */ }
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

{/* Idade */ }
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

{
  error && (
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
  )
}

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

{/* Ornamento inferior */ }
<div style={{
  position: "absolute",
  bottom: "-1px",
  left: "50%",
  transform: "translateX(-50%)",
  width: "80%",
  height: "2px",
  background: "linear-gradient(90deg, transparent, #d4af37, transparent)"
}} />
      </form >
    </div >
  );
};
