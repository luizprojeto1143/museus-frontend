import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    if (tenantId) {
      setLoading(true);
      api.get(`/tenants/${tenantId}/settings`)
        .then(res => {
          const s = res.data;
          setMapSettings({
            outdoorCenter: [s.latitude || -20.385574, s.longitude || -43.503578],
            indoorImageUrl: s.mapImageUrl
          });
        })
        .catch(err => console.error("Erro ao carregar mapa", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [tenantId]);

  // Mock POIs for indoor map (using arbitrary image coordinates 0-1000)
  const indoorPois = [
    { id: "1", title: "Monalisa", lat: 600, lng: 400, description: "Sala 1 - Renascimento" },
    { id: "2", title: "Abaporu", lat: 300, lng: 700, description: "Sala 2 - Modernismo" }
  ];

  if (loading) return <div className="p-8 text-center">{t("common.loading")}</div>;

  if (!tenantId) return <div className="p-8 text-center">Selecione um museu para ver o mapa.</div>;

  if (!mapSettings) return <div className="p-8 text-center">Mapa não configurado para este museu.</div>;

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
          pois={indoorPois}
        />
      </div>

      <div className="card" style={{ marginTop: "1rem", padding: "1rem" }}>
        <h3>📍 {t("visitor.map.legend")}</h3>
        <ul style={{ listStyle: "none", padding: 0, marginTop: "0.5rem" }}>
          <li style={{ marginBottom: "0.5rem" }}>🏛️ <b>Museu Principal</b>: Praça Tiradentes, 123</li>
          <li>🎨 <b>Exposição Permanente</b>: 1º e 2º Andar</li>
        </ul>
      </div>
    </div>
  );
};
