import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../auth/AuthContext";
import { LanguageSwitcher } from "../../../components/LanguageSwitcher";
import "./SelectMuseum.css";

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
        const baseUrl = (import.meta.env.VITE_API_URL as string | undefined) || "https://museus-backend.onrender.com";
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
        const baseUrl = (import.meta.env.VITE_API_URL as string | undefined) || "https://museus-backend.onrender.com";
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
      <div className="select-museum-loading">
        {t("visitor.selectMuseum.loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="select-museum-error">
        <p>{error}</p>
        <button
          onClick={() => navigate("/")}
          className="error-back-button"
        >
          {t("common.back")}
        </button>
      </div>
    );
  }

  return (
    <div className="select-museum-container">
      <LanguageSwitcher />
      <div className="select-museum-content">
        {/* Cabeçalho */}
        <div className="select-museum-header">
          <h1 className="select-museum-title">
            🏛 {t("visitor.selectMuseum.title")}
          </h1>
          <p className="select-museum-subtitle">
            {t("visitor.selectMuseum.subtitle")}
          </p>
        </div>

        {/* Grid de museus */}
        {tenants.length === 0 ? (
          <div className="no-museums">
            <p>{t("visitor.selectMuseum.noMuseums")}</p>
            <p className="admin-hint">
              {t("visitor.selectMuseum.adminHint")}
            </p>
          </div>
        ) : (
          <div className="museum-grid">
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                onClick={() => handleSelectMuseum(tenant)}
                className="museum-card"
              >
                {/* Moldura decorativa */}
                <div className="museum-card-frame" />

                {/* Ícone */}
                <div className="museum-card-icon">
                  🏛
                </div>

                {/* Nome do museu */}
                <h3 className="museum-card-title">
                  {tenant.name}
                </h3>

                {/* Slug */}
                <p className="museum-card-slug">
                  {tenant.slug}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Botão voltar */}
        <div className="back-button-container">
          <button
            onClick={() => navigate("/welcome")}
            className="back-button"
          >
            ← {t("common.back")}
          </button>
        </div>
      </div>
    </div>
  );
};
