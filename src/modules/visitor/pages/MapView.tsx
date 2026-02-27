import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MuseumMap } from "../components/MuseumMap";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import "./MapView.css";

export const MapView: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialWorkId = searchParams.get("workId");
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
      const [settingsRes, worksRes] = await Promise.all([
        api.get(`/tenants/${tenantId}/settings`),
        api.get(`/works`, { params: { tenantId } })
      ]);

      const s = settingsRes.data;
      const works = Array.isArray(worksRes.data) ? worksRes.data : (worksRes.data.data || []);

      setMapSettings({
        outdoorCenter: [s.latitude || -20.385574, s.longitude || -43.503578],
        indoorImageUrl: s.mapImageUrl
      });

      setPois(works.map((w: any) => ({
        id: w.id,
        title: w.title,
        lat: w.latitude,
        lng: w.longitude,
        description: w.room ? `${w.room} • ${w.floor || ""}` : w.artist
      })));
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
    <div className="map-view-loading">
      <div className="map-view-spinner"></div>
      <p>{t("common.loading")}</p>
    </div>
  );

  if (!tenantId) return <div className="map-view-message">{t("visitor.map.selectMuseum", "Selecione um museu para ver o mapa.")}</div>;

  if (!mapSettings) return <div className="map-view-message">{t("visitor.map.notConfigured", "Mapa não configurado para este museu.")}</div>;

  return (
    <div className="map-view-container">
      <header className="map-view-header">
        <h1 className="map-view-title">{t("visitor.map.title")}</h1>
        <p className="map-view-subtitle">{t("visitor.map.subtitle")}</p>
      </header>

      <div className="map-view-map-wrapper">
        <MuseumMap
          outdoorCenter={mapSettings.outdoorCenter}
          indoorImageUrl={mapSettings.indoorImageUrl}
          pois={pois}
          initialPoiId={initialWorkId}
        />
      </div>

      <div className="map-view-legend">
        <h3>📍 {t("visitor.map.legend")}</h3>
        <ul className="map-view-legend-list">
          <li className="map-view-legend-item">
            🏛️ <span><strong>{t("visitor.map.legendMain", "Museu Principal")}</strong>: {t("visitor.map.legendAddress", "Praça Tiradentes, 123")}</span>
          </li>
          <li className="map-view-legend-item">
            🎨 <span><strong>{t("visitor.map.legendExhibition", "Exposição Permanente")}</strong>: {t("visitor.map.legendFloors", "1º e 2º Andar")}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
