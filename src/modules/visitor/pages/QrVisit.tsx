import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { CheckCircle, AlertTriangle } from "lucide-react";
import "./QrVisit.css";

type QRCodeData = {
  id: string;
  code: string;
  type: "WORK" | "TRAIL" | "EVENT" | "SPACE" | "CUSTOM";
  referenceId?: string | null;
  title: string;
  xpReward: number;
  tenantId: string;
};

export const QrVisit: React.FC = () => {
  const { t } = useTranslation();
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { email } = useAuth();

  const [data, setData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    if (isDemoMode) {
      setData({
        id: "demo",
        code,
        type: "WORK",
        referenceId: "demo-work-1",
        title: t("visitor.qr.demoTitle"),
        xpReward: 10,
        tenantId: "demo-tenant"
      });
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const res = await api.get(`/qr/${code}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError(t("visitor.qr.invalid"));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [code, t]);

  async function handleRegisterAndOpen() {
    if (!data) return;
    if (isDemoMode) {
      setFeedback(t("visitor.qr.successDemo", { xp: data.xpReward }));
      return;
    }

    setRegistering(true);
    setFeedback(null);
    setError(null);

    try {
      await api.post("/visitors/visit-from-qr", { code: data.code, email });
      setFeedback(t("visitor.qr.success", { xp: data.xpReward }));
    } catch (err) {
      console.error(err);
      setError(t("visitor.qr.error"));
    } finally {
      setRegistering(false);
    }

    if (data.type === "WORK" && data.referenceId) {
      navigate(`/obras/${data.referenceId}`);
    } else if (data.type === "TRAIL" && data.referenceId) {
      navigate(`/trilhas/${data.referenceId}`);
    } else if (data.type === "EVENT" && data.referenceId) {
      navigate(`/eventos/${data.referenceId}`);
    }
  }

  if (loading) {
    return (
      <div className="qr-visit-loading">
        <div className="qr-visit-loading-spinner"></div>
        <p>{t("visitor.qr.reading", "Lendo QR Code...")}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="qr-visit-container">
        <div className="qr-visit-error-card">
          <div className="qr-visit-error-icon"><AlertTriangle size={64} /></div>
          <h1>{t("visitor.qr.title", "QR Code Inválido")}</h1>
          <p>{error || t("visitor.qr.invalid", "Não foi possível identificar este código.")}</p>
          <button className="qr-visit-retry-btn" onClick={() => navigate("/scanner")}>
            {t("visitor.qr.tryAgain", "Tentar Novamente")}
          </button>
        </div>
      </div>
    );
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "WORK": return t("visitor.favorites.typeWork");
      case "TRAIL": return t("visitor.favorites.typeTrail");
      case "EVENT": return t("visitor.favorites.typeEvent");
      case "SPACE": return t("visitor.qr.typeSpace");
      default: return t("visitor.qr.typeCustom");
    }
  };

  return (
    <div className="qr-visit-container">
      <header className="qr-visit-header">
        <h1 className="qr-visit-title">
          <CheckCircle size={28} />
          {t("visitor.qr.scanned")}
        </h1>
        <p className="qr-visit-subtitle">
          {data.title} • <span className="qr-visit-reward">{t("visitor.qr.reward", { xp: data.xpReward })}</span>
        </p>
      </header>

      <div className="qr-visit-card">
        <p className="qr-visit-type">
          <strong>{t("visitor.qr.type")}:</strong> {getTypeLabel(data.type)}
        </p>
        {data.referenceId && (
          <p className="qr-visit-hint">
            {t("visitor.qr.redirectHint")}
          </p>
        )}

        {feedback && (
          <div className="qr-visit-feedback success">{feedback}</div>
        )}
        {error && (
          <div className="qr-visit-feedback error">{error}</div>
        )}

        <button
          className="qr-visit-register-btn"
          type="button"
          onClick={handleRegisterAndOpen}
          disabled={registering}
        >
          {registering ? (
            <>
              <span className="qr-visit-register-spinner"></span>
              {t("visitor.qr.registering", "Registrando...")}
            </>
          ) : t("visitor.qr.register", "Registrar Visita")}
        </button>
      </div>
    </div>
  );
};
