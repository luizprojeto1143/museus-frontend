import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MuseumMap } from "../components/MuseumMap";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Map, MapPin, Compass, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
import "./MapView.css";

export const MapView: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialWorkId = searchParams.get("workId");
  const { tenantId, equipamentoId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mapSettings, setMapSettings] = useState<{
    outdoorCenter: [number, number];
    indoorImageUrl?: string;
    nome?: string;
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
        equipamentoId ? api.get(`/equipamentos/public/${equipamentoId}`) : api.get(`/tenants/${tenantId}/settings`),
        api.get(`/works`, { params: { tenantId, equipamentoId } })
      ]);

      const s = settingsRes.data;
      const works = Array.isArray(worksRes.data) ? worksRes.data : (worksRes.data.data || []);

      setMapSettings({
        outdoorCenter: [s.lat || s.latitude || -20.385574, s.lng || s.longitude || -43.503578],
        indoorImageUrl: s.fotoMapaUrl || s.mapImageUrl,
        nome: s.nome || s.name
      });

      setPois(works.map((w: any) => ({
        id: w.id,
        title: w.title,
        lat: w.latitude,
        lng: w.longitude,
        description: w.room ? `${w.room} • ${w.floor || ""}` : w.artist || "Ponto de Interesse"
      })));
    } catch (err) {
      console.error("Erro ao carregar dados do mapa", err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, equipamentoId]);

  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);

  if (loading) return (
    <div className="map-view-loading">
      <div className="map-view-spinner"></div>
      <p className="text-gold-400 font-bold tracking-widest uppercase text-xs">Mapeando Experiência...</p>
    </div>
  );

  if (!tenantId) return (
     <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl">
           <Map className="mx-auto mb-4 opacity-20" size={48} />
           <p className="text-slate-400">Selecione um museu para explorar o mapa.</p>
        </div>
     </div>
  );

  return (
    <motion.div 
      className="map-view-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <header className="map-view-header flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="map-view-title italic">
              Exploração: <span className="text-gold-400">{mapSettings?.nome || "Espaço Cultural"}</span>
           </h1>
           <p className="map-view-subtitle">
             Navegue pelos andares e encontre obras neste equipamento.
           </p>
        </div>

        <div className="flex gap-2">
            <button className="h-12 w-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all">
               <Search size={20} />
            </button>
            <button className="h-12 px-6 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 text-sm font-bold text-slate-400 hover:text-white transition-all">
               <Filter size={18} />
               Filtros
            </button>
        </div>
      </header>

      <div className="map-view-map-wrapper relative group">
        {!mapSettings ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
             <div className="text-center">
                <Compass className="mx-auto mb-4 text-gold-400 animate-pulse" size={48} />
                <p className="text-white font-bold">Mapa Indisponível</p>
                <p className="text-slate-400 text-sm">Este museu ainda não forneceu uma planta interativa.</p>
             </div>
          </div>
        ) : (
          <MuseumMap
            outdoorCenter={mapSettings.outdoorCenter}
            indoorImageUrl={mapSettings.indoorImageUrl}
            pois={pois}
            initialPoiId={initialWorkId}
          />
        )}
        
        {/* MAP OVERLAY UI */}
        <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
           <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4 text-white shadow-2xl">
              <div className="h-10 w-10 bg-gold-400/20 border border-gold-400/40 rounded-full flex items-center justify-center text-gold-400">
                 <MapPin size={18} />
              </div>
              <div>
                 <span className="block text-[10px] uppercase font-black tracking-widest text-gold-400/80">Localização Atual</span>
                 <span className="text-sm font-bold">Galeria das Américas, Piso 2</span>
              </div>
           </div>
        </div>
      </div>

      <div className="map-view-legend">
        <div className="legend-card">
           <h3 className="text-white"><Compass className="text-gold-400" size={18} /> Pontos de Interesse</h3>
           <ul className="legend-list">
              <li className="legend-item"><div className="legend-icon" /> Obras de Arte Destacadas</li>
              <li className="legend-item"><div className="legend-icon !bg-blue-400 !shadow-blue-400" /> Áreas de Acessibilidade</li>
              <li className="legend-item"><div className="legend-icon !bg-amber-400 !shadow-amber-400" /> Totens de Realidade Aumentada</li>
           </ul>
        </div>
        
        <div className="legend-card">
           <h3 className="text-white"><Map className="text-gold-400" size={18} /> Informações de Prédio</h3>
           <p className="text-sm text-slate-400 leading-relaxed">
             Nosso sistema de navegação indoor utiliza sensores Bluetooth para precisão milimétrica. Siga a linha azul no mapa para rotas de trilhas guiadas.
           </p>
        </div>
      </div>
    </motion.div>
  );
};
