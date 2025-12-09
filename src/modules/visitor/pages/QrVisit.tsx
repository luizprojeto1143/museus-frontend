
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";

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

  const [data, setData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    if (isDemoMode) {
      // Simulação em modo demo
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
      // Endpoint a ser implementado no backend para associar visita ao QR
      await api.post("/visitors/visit-from-qr", { code: data.code });
      setFeedback(t("visitor.qr.success", { xp: data.xpReward }));
    } catch (err) {
      console.error(err);
      setError(t("visitor.qr.error"));
    } finally {
      setRegistering(false);
    }

    // Depois de registrar, redireciona conforme o tipo do QR
    if (data.type === "WORK" && data.referenceId) {
      navigate(`/obras/${data.referenceId}`);
    } else if (data.type === "TRAIL" && data.referenceId) {
      navigate(`/trilhas/${data.referenceId}`);
    } else if (data.type === "EVENT" && data.referenceId) {
      // Poderíamos ter uma rota de detalhe de evento; por enquanto, apenas volta para /eventos
      navigate("/eventos");
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="section-title">{t("visitor.qr.reading")}</h1>
        <p className="section-subtitle">{t("visitor.qr.searching")}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <h1 className="section-title">{t("visitor.qr.title")}</h1>
        <p className="section-subtitle">{error || t("visitor.qr.invalid")}</p>
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
    <div>
      <h1 className="section-title">{t("visitor.qr.scanned")}</h1>
      <p className="section-subtitle">
        {data.title} • {t("visitor.qr.reward", { xp: data.xpReward })}
      </p>

      <div className="card" style={{ padding: "1rem", marginTop: "1rem" }}>
        <p>
          <strong>{t("visitor.qr.type")}:</strong>{" "}
          {getTypeLabel(data.type)}
        </p>
        {data.referenceId && (
          <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#e5e7eb" }}>
            {t("visitor.qr.redirectHint")}
          </p>
        )}

        {feedback && (
          <p style={{ marginTop: "0.75rem", color: "#4ade80", fontSize: "0.9rem" }}>{feedback}</p>
        )}
        {error && (
          <p style={{ marginTop: "0.75rem", color: "#f97373", fontSize: "0.9rem" }}>{error}</p>
        )}

        <button
          className="btn"
          type="button"
          onClick={handleRegisterAndOpen}
          disabled={registering}
          style={{ marginTop: "1rem" }}
        >
          {registering ? t("visitor.qr.registering") : t("visitor.qr.register")}
        </button>
      </div>
    </div>
  );
};
