import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Award, Zap, AlertCircle, CheckCircle2, ChevronLeft } from "lucide-react";
import { api } from "../../../api/client";
import { useGeoFencing } from "../context/GeoFencingProvider";
import { useGamification } from "../../gamification/context/GamificationContext";
import { Badge, Button, PageLoader } from "@/components/ui";
import "./VestigeCapture.css";

export const VestigeCapture: React.FC = () => {
  const { workId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userLocation } = useGeoFencing();
  const { refreshGamification } = useGamification();

  const [work, setWork] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureResult, setCaptureResult] = useState<any>(null);

  const fetchWork = useCallback(async () => {
    try {
      const res = await api.get(`/works/${workId}`);
      setWork(res.data);
    } catch (err: any) {
      setError("Não foi possível localizar este vestígio.");
    } finally {
      setLoading(false);
    }
  }, [workId]);

  useEffect(() => {
    fetchWork();
  }, [fetchWork]);

  const handleCapture = async () => {
    setIsCapturing(true);
    try {
      const res = await api.post("/vestiges/capture", {
        workId,
        lat: userLocation?.lat || null,
        lng: userLocation?.lng || null,
        accuracy: 0
      });
      setCaptureResult(res.data);
      if (typeof refreshGamification === 'function') {
        refreshGamification();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro na captura.");
    } finally {
      setIsCapturing(false);
    }
  };

  if (loading) return (
    <div className="vestige-loader-container">
      <motion.div 
        className="vestige-loader-pulse"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <Shield size={64} className="text-gold" />
      </motion.div>
      <p className="loader-text">{t('vestige.capture.validating', 'Validando QR Code...')}</p>
    </div>
  );

  return (
    <div className="vestige-capture-overlay">
      <header className="capture-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <div className="status-badge">
          <Zap size={14} className="text-gold" />
          {t("vestige.capture.qrValidated", "QR Validado")}
        </div>
      </header>

      <main className="capture-main">
        <div className="radar-container qr-mode">
          <div className="qr-success-orb">
             <CheckCircle2 size={64} className="text-gold animate-pulse" />
          </div>
          
          <div className="radar-header">
            <span className="radar-label">{t('vestige.capture.authStatus', 'Autenticação Digital')}</span>
            <span className="radar-status active">
              {t('vestige.capture.authorized', 'COLETA AUTORIZADA')}
            </span>
          </div>
        </div>

        <div className="target-info">
          <h2 className="target-title">{work?.title || t("vestige.capture.unknownVestige", "Vestígio Desconhecido")}</h2>
          <p className="target-artist">{work?.artist || t("vestige.capture.unknownAuthor", "Autor Desconhecido")}</p>
          
          <div className="target-status">
            <div className="status-active">
              <Shield color="var(--gold)" size={16} />
              <span>{t('vestige.capture.readyToCollect', 'Pronto para Coleta')}</span>
            </div>
          </div>
        </div>

        <button 
          className="capture-btn active"
          disabled={isCapturing}
          onClick={handleCapture}
        >
          {isCapturing ? (
             <div className="flex items-center gap-2">
                <Zap className="animate-spin" size={20} />
                <span>{t('common.saving', 'Salvando...')}</span>
             </div>
          ) : (
            <>
              <Award size={20} />
              <span>{t('vestige.capture.collect', 'REIVINDICAR VESTÍGIO')}</span>
            </>
          )}
        </button>
      </main>

      <AnimatePresence>
        {captureResult && (
          <motion.div 
            className="result-modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className={`result-card ${captureResult.raridade.toLowerCase()}`}>
               <div className="rarity-badge">{captureResult.raridade}</div>
               <div className="result-img-wrapper">
                 <img src={work?.imageUrl} alt={work?.title} className="result-img" />
               </div>
               <h3 className="result-title">{t('vestige.capture.captured', 'CONQUISTADO!')}</h3>
               <p className="result-order">{t('vestige.capture.rank', 'Ordem #')}{captureResult.stamp.numeroCaptura}</p>
               <div className="xp-gain">+{captureResult.xp} XP</div>
               <button className="btn-done" onClick={() => navigate("/passaporte")}>{t('vestige.capture.viewPassport', 'Ver Passaporte')}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="error-toast">
          <AlertCircle size={18} /> {error}
          <button onClick={() => setError(null)}>X</button>
        </div>
      )}
    </div>
  );
};

export default VestigeCapture;
