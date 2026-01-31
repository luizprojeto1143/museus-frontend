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
  type?: "MUSEUM" | "PRODUCER";
}

import { Calendar, MapPin } from "lucide-react";

export const CityAgendaCarousel: React.FC<{ onSelectTenant: (tenant: Tenant) => void }> = ({ onSelectTenant }) => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL as string;
    fetch(baseUrl + "/events?discovery=true")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEvents(data);
      })
      .catch(err => console.error("Error fetching agenda", err));
  }, []);

  if (events.length === 0) return (
    <div style={{ opacity: 0.6, fontSize: '0.9rem', fontStyle: 'italic' }}>
      Nenhum evento agendado para os próximos dias.
    </div>
  );

  return (
    <>
      {events.map(event => (
        <div key={event.id} className="event-card-discovery" onClick={() => onSelectTenant(event.tenant)}>
          <div className="event-card-image" style={{ backgroundImage: event.coverImageUrl ? `url(${event.coverImageUrl})` : undefined }}>
            <div className="event-date-badge">
              {new Date(event.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </div>
          </div>
          <div className="event-card-content">
            <h4 className="event-title">{event.title}</h4>
            <div className="event-producer">{event.producerName || event.tenant?.name}</div>
            <div className="event-location">
              <MapPin size={12} color="#d4af37" />
              {event.location || "Local a confirmar"}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

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
            {t("visitor.selectMuseum.title", "Selecione uma Experiência")}
          </h1>
          <p className="select-museum-subtitle">
            {t("visitor.selectMuseum.subtitle", "Explore museus, eventos culturais e roteiros exclusivos da cidade.")}
          </p>
        </div>

        {/* AGENDA GLOBAL DA CIDADE (City Agenda) */}
        {!loading && (
          <div className="agenda-section">
            <div className="section-title">
              <span>📅</span> Agenda de Eventos
            </div>
            <div className="agenda-grid">
              <CityAgendaCarousel onSelectTenant={(tenant) => handleSelectMuseum(tenant)} />
            </div>
          </div>
        )}

        {/* SEÇÃO: INSTITUIÇÕES */}
        <div className="section-title">
          <span>🏛</span> Parceiros Oficiais
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
                {/* Ícone */}
                <div className="museum-card-icon" style={{
                  color: tenant.type === "PRODUCER" ? "#d4af37" : "#fff",
                  borderColor: tenant.type === "PRODUCER" ? "#d4af37" : "rgba(255,255,255,0.2)"
                }}>
                  {tenant.type === "PRODUCER" ? "🎭" : "🏛"}
                </div>

                {/* Tipo Badge */}
                {tenant.type === "PRODUCER" && (
                  <span className="producer-badge">
                    PRODUTOR
                  </span>
                )}

                {/* Nome do museu */}
                <h3 className="museum-card-title">
                  {tenant.name}
                </h3>

                {/* Slug */}
                <p className="museum-card-slug">
                  @{tenant.slug}
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
