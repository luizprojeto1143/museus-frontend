import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { MuseumMap } from "../components/MuseumMap";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

export const MapView: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mapSettings, setMapSettings] = useState<{
    outdoorCenter: [number, number];
    indoorImageUrl?: string;
  } | null>(null);

  const [pois, setPois] = useState<{ id: string; title: string; lat: number; lng: number; description: string }[]>([]);

  const fetchMapData = useCallback(async () => {
    if (!tenantId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch settings (works endpoint kept for future use)
      const [settingsRes] = await Promise.all([
        api.get(`/tenants/${tenantId}/settings`),
        api.get(`/works`, { params: { tenantId } })
      ]);

      const s = settingsRes.data;
      setMapSettings({
        outdoorCenter: [s.latitude || -20.385574, s.longitude || -43.503578],
        indoorImageUrl: s.mapImageUrl
      });

      // POIs will be populated when works have x/y coordinates
      setPois([]);
    } catch (err) {
      console.error("Erro ao carregar dados do mapa", err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', gap: '1rem' }}>
      <div className="spinner" style={{ width: "40px", height: "40px", border: "4px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
      <p>{t("common.loading")}</p>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!tenantId) return <div className="p-8 text-center">{t("visitor.map.selectMuseum", "Selecione um museu para ver o mapa.")}</div>;

  if (!mapSettings) return <div className="p-8 text-center">{t("visitor.map.notConfigured", "Mapa não configurado para este museu.")}</div>;

  return (
    <div>
      <h1 className="section-title">{t("visitor.map.title")}</h1>
      <p className="section-subtitle">
        {t("visitor.map.subtitle")}
      </p>

      <div style={{ marginTop: "1rem" }}>
        <MuseumMap
          outdoorCenter={mapSettings.outdoorCenter}
          indoorImageUrl={mapSettings.indoorImageUrl}
          pois={pois}
        />
      </div>

      <div className="card" style={{ marginTop: "1rem", padding: "1rem" }}>
        <h3>📍 {t("visitor.map.legend")}</h3>
        <ul style={{ listStyle: "none", padding: 0, marginTop: "0.5rem" }}>
          <li style={{ marginBottom: "0.5rem" }}>🏛️ <b>{t("visitor.map.legendMain", "Museu Principal")}</b>: {t("visitor.map.legendAddress", "Praça Tiradentes, 123")}</li>
          <li>🎨 <b>{t("visitor.map.legendExhibition", "Exposição Permanente")}</b>: {t("visitor.map.legendFloors", "1º e 2º Andar")}</li>
        </ul>
      </div>
    </div>
  );
};
