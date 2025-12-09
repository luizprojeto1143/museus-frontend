import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../auth/AuthContext";
import { LanguageSwitcher } from "../../../components/LanguageSwitcher";

interface Tenant {
  id: string;
  name: string;
  slug: string;
}

export const SelectMuseum: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, token, updateSession } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTenants = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL as string;
        const res = await fetch(baseUrl + "/tenants/public");

        if (!res.ok) {
          throw new Error(t("visitor.selectMuseum.errorLoading"));
        }

        const data = await res.json();
        setTenants(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("common.error"));
      } finally {
        setLoading(false);
      }
    };

    loadTenants();
  }, [t]);

  const handleSelectMuseum = async (tenant: Tenant) => {
    if (isAuthenticated && token) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL as string;
        const res = await fetch(baseUrl + "/auth/switch-tenant", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ targetTenantId: tenant.id })
        });

        if (res.ok) {
          const data = await res.json();
          updateSession(data.accessToken, data.role, data.tenantId);
          navigate("/");
          return;
        } else {
          console.error("Erro ao trocar de museu, status:", res.status);
          if (res.status === 401) {
            navigate("/register", {
              state: {
                tenantId: tenant.id,
                tenantName: tenant.name
              }
            });
          }
        }
      } catch (err) {
        console.error("Erro ao trocar de museu (exception)", err);
      }
    } else {
      // Fallback ou não autenticado
      navigate("/register", {
        state: {
          tenantId: tenant.id,
          tenantName: tenant.name
        }
      });
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a1108, #2d1810)",
        color: "#d4af37",
        fontSize: "1.2rem",
        fontFamily: "serif"
      }}>
        {t("visitor.selectMuseum.loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a1108, #2d1810)",
        color: "#ff6b6b",
        fontSize: "1.1rem",
        fontFamily: "serif",
        padding: "2rem",
        textAlign: "center"
      }}>
        <p>{error}</p>
        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "1rem",
            padding: "0.75rem 1.5rem",
            background: "#d4af37",
            color: "#1a1108",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontFamily: "serif"
          }}
        >
          {t("common.back")}
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a1108, #2d1810)",
      padding: "4rem 2rem 2rem 2rem", // Increased top padding to clear LanguageSwitcher
      overflowY: "auto",
      position: "relative" // Ensure absolute positioning of LanguageSwitcher works
    }}>
      <LanguageSwitcher />
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        {/* Cabeçalho */}
        <div style={{
          textAlign: "center",
          marginBottom: "3rem"
        }}>
          <h1 style={{
            fontSize: "2.5rem",
            color: "#d4af37",
            fontFamily: "serif",
            margin: 0,
            marginBottom: "0.5rem",
            textShadow: "0 2px 12px rgba(212,175,55,0.5)"
          }}>
            🏛 {t("visitor.selectMuseum.title")}
          </h1>
          <p style={{
            color: "#c9b58c",
            fontSize: "1rem",
            fontFamily: "serif"
          }}>
            {t("visitor.selectMuseum.subtitle")}
          </p>
        </div>

        {/* Grid de museus */}
        {tenants.length === 0 ? (
          <div style={{
            textAlign: "center",
            color: "#8b7355",
            fontSize: "1.1rem",
            fontFamily: "serif",
            padding: "3rem"
          }}>
            <p>{t("visitor.selectMuseum.noMuseums")}</p>
            <p style={{ fontSize: "0.9rem", marginTop: "1rem" }}>
              {t("visitor.selectMuseum.adminHint")}
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "2rem"
          }}>
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                onClick={() => handleSelectMuseum(tenant)}
                style={{
                  background:
                    "linear-gradient(135deg, rgba(212,175,55,0.1), rgba(42,24,16,0.8))",
                  border: "2px solid #8b7355",
                  borderRadius: "1rem",
                  padding: "2rem 1.5rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.5)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.borderColor = "#d4af37";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(212,175,55,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "#8b7355";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.5)";
                }}
              >
                {/* Moldura decorativa */}
                <div style={{
                  position: "absolute",
                  top: "10px",
                  left: "10px",
                  right: "10px",
                  bottom: "10px",
                  border: "1px solid rgba(212,175,55,0.2)",
                  borderRadius: "0.8rem",
                  pointerEvents: "none"
                }} />

                {/* Ícone */}
                <div style={{
                  fontSize: "4rem",
                  marginBottom: "1rem",
                  filter: "sepia(0.5) hue-rotate(20deg)"
                }}>
                  🏛
                </div>

                {/* Nome do museu */}
                <h3 style={{
                  fontSize: "1.3rem",
                  color: "#d4af37",
                  fontFamily: "serif",
                  margin: 0,
                  marginBottom: "0.5rem",
                  textShadow: "0 2px 8px rgba(212,175,55,0.3)"
                }}>
                  {tenant.name}
                </h3>

                {/* Slug */}
                <p style={{
                  fontSize: "0.85rem",
                  color: "#8b7355",
                  fontFamily: "serif",
                  margin: 0
                }}>
                  {tenant.slug}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Botão voltar */}
        <div style={{
          textAlign: "center",
          marginTop: "3rem"
        }}>
          <button
            onClick={() => navigate("/welcome")}
            style={{
              background: "transparent",
              color: "#8b7355",
              fontSize: "0.9rem",
              fontFamily: "serif",
              padding: "0.6rem 1.5rem",
              border: "1px solid #8b7355",
              borderRadius: "0.5rem",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#d4af37";
              e.currentTarget.style.borderColor = "#d4af37";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#8b7355";
              e.currentTarget.style.borderColor = "#8b7355";
            }}
          >
            ← {t("common.back")}
          </button>
        </div>
      </div>
    </div>
  );
};
