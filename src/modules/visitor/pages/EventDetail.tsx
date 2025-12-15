import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";

type EventDetail = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isOnline: boolean;
  meetingLink?: string;
  tenant?: { name: string };
};

export const EventDetail: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [apiEvent, setApiEvent] = useState<EventDetail | null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [attendance, setAttendance] = useState<any>(null);
  const [sendingCert, setSendingCert] = useState(false);

  const mock: EventDetail = {
    id: id || "1",
    title: "Oficina de Aquarela",
    description: "Aprenda técnicas básicas de aquarela com artistas renomados. Evento gratuito, vagas limitadas.",
    location: "Atelier 1 - 2º andar",
    startDate: "2025-12-15T14:00:00",
    endDate: "2025-12-15T17:00:00",
    isOnline: false
  };

  const isDemo = isDemoMode || !id;

  useEffect(() => {
    if (isDemo) return;

    fetchData();
  }, [id, isDemo]);

  const fetchData = async () => {
    try {
      setApiLoading(true);
      const res = await api.get(`/events/${id}`);
      setApiEvent(res.data);

      // Check attendance if logged in
      const rawAuth = localStorage.getItem("museus_auth_v1");
      if (rawAuth) {
        try {
          const auth = JSON.parse(rawAuth);
          if (auth.token) {
            const attRes = await api.get(`/events/${id}/my-attendance`);
            if (attRes.data.attended) {
              setAttendance(attRes.data.attendance);
            }
          }
        } catch (e) {
          console.warn("Could not fetch attendance status", e);
        }
      }
    } catch (e) {
      console.error("Failed", e);
    } finally {
      setApiLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (isDemo) {
      alert("Demo: Check-in realizado!");
      setAttendance({ status: "PRESENT" });
      return;
    }

    try {
      const auth = JSON.parse(localStorage.getItem("museus_auth_v1") || "{}");
      const user = JSON.parse(localStorage.getItem("museus_visitor") || "{}");

      const email = auth.user?.email || user.email;

      if (!email) {
        alert("Você precisa estar logado para fazer check-in.");
        return;
      }

      const res = await api.post(`/events/${id}/checkin`, { email });
      setAttendance(res.data.attendance);
      alert(t("visitor.eventDetail.checkinSuccess", "Check-in realizado com sucesso!"));
    } catch (error: any) {
      alert(error.response?.data?.message || "Erro ao fazer check-in");
      if (error.response?.data?.attendance) {
        setAttendance(error.response.data.attendance);
      }
    }
  };

  const handleDownloadCertificate = async () => {
    if (isDemo) {
      alert("Demo: Download iniciado!");
      return;
    }
    try {
      setSendingCert(true);
      const response = await api.get(`/events/${id}/certificate/download`, {
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Certificado_${event?.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      alert("Erro ao baixar certificado.");
    } finally {
      setSendingCert(false);
    }
  };

  // Reuse existing handleCertificate to point to download
  const handleCertificate = handleDownloadCertificate;

  const event = isDemo ? mock : apiEvent;
  const loading = isDemo ? false : apiLoading;

  if (loading) return <div className="p-4">{t("common.loading")}</div>;
  if (!event) return <div className="p-4">Evento não encontrado</div>;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(i18n.language, {
      day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  const isHappening = new Date() >= new Date(event.startDate) && (!event.endDate || new Date() <= new Date(event.endDate));
  const hasEnded = event.endDate && new Date() > new Date(event.endDate);

  return (
    <div>
      <Link to="/eventos" style={{ fontSize: "0.9rem", color: "#38bdf8" }}>
        ← {t("visitor.eventDetail.backToEvents")}
      </Link>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h1 className="section-title" style={{ marginBottom: "0.5rem" }}>
          {event.title}
        </h1>

        {event.location && (
          <p style={{ fontSize: "0.9rem", color: "#9ca3af", marginBottom: "0.5rem" }}>
            📍 {event.location} {event.isOnline && "(Online)"}
          </p>
        )}

        <p style={{ fontSize: "0.9rem", color: "#9ca3af", marginBottom: "1.5rem" }}>
          🗓 {formatDate(event.startDate)}
          {event.endDate && ` - ${formatDate(event.endDate)}`}
        </p>

        {event.description && (
          <div style={{ marginTop: "1.5rem" }}>
            <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>{t("visitor.eventDetail.about")}</h2>
            <p style={{ color: "#e5e7eb", lineHeight: "1.6" }}>{event.description}</p>
          </div>
        )}

        <div style={{ marginTop: "2rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {!attendance && event.isOnline && isHappening && (
            <button className="btn btn-primary" onClick={handleCheckIn}>
              ✅ {t("visitor.eventDetail.checkinOnline", "Fazer Check-in Online")}
            </button>
          )}

          {!attendance && !event.isOnline && (
            <p style={{ color: "#fbbf24", fontStyle: "italic" }}>
              📷 {t("visitor.eventDetail.scanQr", "Para confirmar presença, escaneie o QR Code no local.")}
            </p>
          )}

          {attendance && (
            <div style={{ background: "rgba(16, 185, 129, 0.2)", padding: "0.5rem 1rem", borderRadius: "0.5rem", color: "#34d399", border: "1px solid #34d399" }}>
              ✓ Presença Confirmada
            </div>
          )}

          {attendance && (hasEnded || true) && (
            <button className="btn btn-outline" onClick={handleCertificate} disabled={sendingCert}>
              {sendingCert ? "Baixando..." : "📥 " + t("visitor.eventDetail.downloadCertificate", "Baixar Certificado")}
            </button>
          )}

          {event.meetingLink && (
            <a href={event.meetingLink} target="_blank" rel="noreferrer" className="btn btn-secondary">
              🔗 Acessar Link do Evento
            </a>
          )}

          <button className="btn btn-secondary" onClick={() => window.history.back()}>
            {t("common.back")}
          </button>
        </div>
      </div>
    </div>
  );
};
