import { logger } from "@/utils/logger";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { extractQRCode } from "../../../utils/qrHelpers";
import { useGamification } from "../../gamification/context/GamificationContext";
import { XpToast } from "../components/XpToast";
import "./QrVisit.css";

type ResolveResponse = {
  code: string;
  type: string;
  status: string;
  redirectUrl: string;
  title: string;
  trackScan: boolean;
  xpReward: number;
};

export const QrVisit: React.FC = () => {
  const { t } = useTranslation();
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const { stats, refreshGamification } = useGamification();
  const [scanResult, setScanResult] = useState<{
    xpGained: number;
    newTotalXp: number;
    level: number;
    stampCreated: boolean;
    achievementsUnlocked: Array<{ id: string; title: string; iconUrl?: string | null }>;
  } | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!code) return;

    async function resolveCode() {
      try {
        const cleanCode = extractQRCode(code);
        if (!cleanCode) throw new Error("Código inválido");

        const res = await api.get(`/qrcodes/${cleanCode}/resolve`);
        setData(res.data);
      } catch (err: unknown) {
        logger.error(err);
        const msg = (err as any)?.response?.data?.message || t("visitor.qr.invalid", "Não foi possível identificar este código.");
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    resolveCode();
  }, [code, t]);

  async function handleRegisterAndOpen() {
    if (!data) return;

    setRegistering(true);

    try {
      if (data.trackScan) {
        const scanRes = await api.post(`/qrcodes/${data.code}/scan`);
        if (scanRes.data && scanRes.data.success) {
          setScanResult(scanRes.data);
          setShowToast(true);
          if (refreshGamification) {
            refreshGamification();
          }
          // Delay navigation by 3 seconds to let user celebrate and read achievements
          setTimeout(() => {
            navigate(data.redirectUrl + (data.redirectUrl.includes('?') ? '&scan=true' : '?scan=true'));
          }, 3200);
          return;
        }
      }
      navigate(data.redirectUrl + (data.redirectUrl.includes('?') ? '&scan=true' : '?scan=true'));
    } catch (err: unknown) {
      logger.error("Erro ao registrar scan", err);
      // Navega mesmo com erro de scan
      navigate(data.redirectUrl);
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
          <p>{error}</p>
          <button className="qr-visit-retry-btn" onClick={() => navigate("/scanner")}>
            {t("visitor.qr.tryAgain", "Tentar Novamente")}
          </button>
        </div>
      </div>
    );
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "WORK": return t("visitor.favorites.typeWork", "Obra");
      case "TRAIL": return t("visitor.favorites.typeTrail", "Roteiro");
      case "EVENT": return t("visitor.favorites.typeEvent", "Evento");
      case "CITY": return "Cidade";
      case "EQUIPMENT": return "Equipamento Cultural";
      case "ROOM": return "Espaço";
      case "TICKET": return "Ingresso";
      default: return type;
    }
  };

  return (
    <div className="qr-visit-container">
      <header className="qr-visit-header">
        <h1 className="qr-visit-title">
          <CheckCircle size={28} />
          {t("visitor.qr.scanned", "QR Code Encontrado")}
        </h1>
        <p className="qr-visit-subtitle">
          {data.title} 
          {data.xpReward > 0 && ` • +${data.xpReward} XP`}
        </p>
      </header>

      <div className="qr-visit-card">
        <p className="qr-visit-type">
          <strong>{t("visitor.qr.type", "Tipo")}:</strong> {getTypeLabel(data.type)}
        </p>
        
        {scanResult ? (
          <div className="qr-visit-success-summary mt-4 p-4 rounded-lg bg-green-950/20 border border-green-500/30 text-green-300">
            <p className="font-bold mb-1">✓ Leitura Registrada!</p>
            <p className="text-sm">Obtido: +{scanResult.xpGained} XP (Total: {scanResult.newTotalXp} XP)</p>
            {scanResult.stampCreated && <p className="text-xs text-green-400 mt-1">★ Novo carimbo adicionado ao seu passaporte.</p>}
          </div>
        ) : (
          <p className="qr-visit-hint mt-2 text-sm text-gray-400">
            Você será redirecionado para o destino.
          </p>
        )}

        <button
          className="qr-visit-register-btn mt-6"
          type="button"
          onClick={handleRegisterAndOpen}
          disabled={registering}
        >
          {registering ? (
            <>
              <span className="qr-visit-register-spinner"></span>
              {scanResult ? "Carregando destino..." : "Registrando..."}
            </>
          ) : (isAuthenticated ? "Registrar e Abrir" : "Abrir")}
        </button>
      </div>

      {showToast && scanResult && (
        <XpToast
          xpGained={scanResult.xpGained}
          stampCreated={scanResult.stampCreated}
          achievements={scanResult.achievementsUnlocked}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};
