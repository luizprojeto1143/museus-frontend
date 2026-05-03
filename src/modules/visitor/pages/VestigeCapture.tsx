import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Compass, Shield, Award, Zap, AlertCircle, CheckCircle2, ChevronLeft } from "lucide-react";
import { api } from "../../../api/client";
import { useGeoFencing } from "../context/GeoFencingProvider";
import { useGamification } from "../../gamification/context/GamificationContext";
import "./VestigeCapture.css";

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3;
  const f1 = (lat1 * Math.PI) / 180;
  const f2 = (lat2 * Math.PI) / 180;
  const df = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(df / 2) * Math.sin(df / 2) + Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const VestigeCapture: React.FC = () => {
  const { workId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userLocation } = useGeoFencing();
  const { refreshGamification } = useGamification();

  const [work, setWork] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDistance, setCurrentDistance] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureResult, setCaptureResult] = useState<any>(null);

  const fetchWork = useCallback(async () => {
    try {
      const res = await api.get(`/works/${workId}`);
      setWork(res.data);
    } catch (err) {
      setError("Não foi possível localizar este vestígio.");
    } finally {
      setLoading(false);
    }
  }, [workId]);

  useEffect(() => {
    fetchWork();
  }, [fetchWork]);

  useEffect(() => {
    if (userLocation && work?.lat && work?.lng) {
      const dist = calculateDistance(userLocation.lat, userLocation.lng, work.lat, work.lng);
      setCurrentDistance(dist);
    }
  }, [userLocation, work]);

  const handleCapture = async () => {
    if (!userLocation) return;
    setIsCapturing(true);
    try {
      const res = await api.post("/vestiges/capture", {
        workId,
        lat: userLocation.lat,
        lng: userLocation.lng,
        accuracy: 10 // Simulação
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
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <Compass size={64} className="text-gold-500" />
      </motion.div>
      <p className="loader-text">{t('vestige.capture.syncing', 'Sincronizando Satélites GPS...')}</p>
      <div className="loader-bar-bg">
        <motion.div 
          className="loader-bar-fill"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />
      </div>
    </div>
  );

  const inRange = currentDistance !== null && work?.captureRadiusM && currentDistance <= work.captureRadiusM;

  // I4: Handle GPS denied or unavailable
  if (!userLocation && !loading) {
    return (
      <div className="vestige-capture-overlay error-screen">
        <div className="error-content">
          <AlertCircle size={64} className="text-red-500 mb-4" />
          <h2>{t('vestige.capture.gpsRequired', 'GPS Necessário')}</h2>
          <p>{t('vestige.capture.gpsMessage', 'Para capturar vestígios, você precisa habilitar a localização no seu navegador e estar no local da obra.')}</p>
          <button className="finish-btn" onClick={() => navigate(-1)}>
            {t('common.back', 'Voltar')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vestige-capture-overlay">
      <header className="capture-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <div className="status-badge">
          <Zap size={14} className={inRange ? "text-gold-400" : "text-slate-500"} />
          {inRange ? t("vestige.capture.signalStrong", "Sinal Forte") : t("vestige.capture.signalWeak", "Sinal Instável")}
        </div>
      </header>

      <main className="capture-main">
        <div className="radar-container">
          <motion.div 
             className="radar-ring primary"
             animate={{ scale: [1, 1.5, 2], opacity: [0.6, 0.3, 0] }}
             transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
          />
          <motion.div 
             className="radar-ring secondary"
             animate={{ scale: [1, 1.3, 1.8], opacity: [0.4, 0.2, 0] }}
             transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.5 }}
          />
          <div className={`radar-core ${inRange ? 'active' : ''}`}>
             <Compass size={48} className={isCapturing ? 'animate-spin' : ''} />
          </div>
          
          <div className="radar-header">
            <span className="radar-label">{t('vestige.capture.radarStatus', 'Status do Radar')}</span>
            <span className={`radar-status ${inRange ? 'active' : ''}`}>
              {inRange ? t('vestige.capture.inRange', 'ALVO EM ALCANCE') : t('vestige.capture.outOfRange', 'FORA DE ALCANCE')}
            </span>
          </div>
          
          <div className="radar-info">
            {currentDistance !== null && (
              <span className="distance">
                {t('vestige.capture.distance', { distance: Math.round(currentDistance) })}
              </span>
            )}
          </div>
        </div>

        <div className="target-info">
          <h2 className="target-title">{work?.title || t("vestige.capture.unknownVestige", "Vestígio Desconhecido")}</h2>
          <p className="target-artist">{work?.artist || t("vestige.capture.unknownAuthor", "Autor Desconhecido")}</p>
          
          <div className="target-status">
            {inRange ? (
              <div className="status-active">
                <CheckCircle2 color="var(--accent-primary)" />
                <span>{t('vestige.capture.readyToCollect', 'Pronto para Coleta')}</span>
              </div>
            ) : (
              <div className="status-searching">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <AlertCircle color="#64748b" />
                </motion.div>
                <span>{t('vestige.capture.searchingSignal', 'Buscando Sinal...')}</span>
              </div>
            )}
          </div>
        </div>

        <button 
          className={`capture-btn ${inRange && !isCapturing ? 'active' : ''}`}
          disabled={!inRange || isCapturing}
          onClick={handleCapture}
        >
          {isCapturing ? (
             <div className="flex items-center gap-2">
                <Compass className="animate-spin" size={20} />
                <span>{t('common.saving', 'Salvando...')}</span>
             </div>
          ) : (
            <>
              <Shield size={20} />
              <span>{t('vestige.capture.collect', 'COLETAR VESTÍGIO')}</span>
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
               <img src={work?.imageUrl} alt={work?.title} className="result-img" />
               <h3 className="result-title">CAPTURADO!</h3>
               <p className="result-order">Ordem de Captura: #{captureResult.stamp.numeroCaptura}</p>
               <div className="xp-gain">+{captureResult.xp} XP</div>
               <button className="btn-done" onClick={() => navigate("/passaporte")}>Ver no Passaporte</button>
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
