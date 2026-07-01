import React, { useEffect, useState, useCallback, useMemo } from "react";
import { logger } from "@/utils/logger";

import { useTranslation } from "react-i18next";
import { api } from "../../../../api/client";
import { useAuth } from "../../../auth/AuthContext";
import { 
  Loader2, 
  AlertTriangle, 
  Building, 
  Calendar, 
  TrendingUp, 
  Map as MapIcon, 
  Layers, 
  Eye, 
  EyeOff, 
  Compass, 
  MapPin,
  Flame,
  CheckCircle2,
  HelpCircle
} from "lucide-react";

interface GeoPoint {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  title?: string;
  type?: string;
  source?: string;
  createdAt?: string;
  equipmentName?: string;
  tenantName?: string;
}

export const MunicipalGaps: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useAuth();
  const [data, setData] = useState<{
    equipments: GeoPoint[];
    events: GeoPoint[];
    checkins: GeoPoint[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Layer controls
  const [showEquipments, setShowEquipments] = useState(true);
  const [showEvents, setShowEvents] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  
  // Hovered item details
  const [hoveredPoint, setHoveredPoint] = useState<unknown>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/analytics/territorial-gaps?tenantId=${tenantId}`);
      
      // Use real data from the database only - no demo fallbacks
      const equipments = res.data?.equipments || [];
      const events = res.data?.events || [];
      const checkins = res.data?.checkins || [];

      setData({ equipments, events, checkins });
    } catch (error) { 
      logger.error("Erro ao carregar vazios culturais:", error); 
    } finally { 
      setLoading(false); 
    }
  }, [tenantId]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  // Calcula bounding box dinâmico para a projeção cartográfica fluida
  const mapBounds = useMemo(() => {
    if (!data) return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
    const allPts = [...data.equipments, ...data.events, ...data.checkins];
    if (allPts.length === 0) return { minLat: -20, maxLat: -19.8, minLng: -44.3, maxLng: -44.1 };

    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;

    allPts.forEach(pt => {
      if (pt.lat < minLat) minLat = pt.lat;
      if (pt.lat > maxLat) maxLat = pt.lat;
      if (pt.lng < minLng) minLng = pt.lng;
      if (pt.lng > maxLng) maxLng = pt.lng;
    });

    // Adiciona padding de 15% para as bordas do mapa respirarem
    const latPadding = (maxLat - minLat) * 0.15 || 0.01;
    const lngPadding = (maxLng - minLng) * 0.15 || 0.01;

    return {
      minLat: minLat - latPadding,
      maxLat: maxLat + latPadding,
      minLng: minLng - lngPadding,
      maxLng: maxLng + lngPadding
    };
  }, [data]);

  // Converte coordenadas GPS em coordenadas SVG de 0 a 100%
  const getXY = useCallback((lat: number, lng: number) => {
    const { minLat, maxLat, minLng, maxLng } = mapBounds;
    if (maxLat === minLat || maxLng === minLng) return { x: 50, y: 50 };
    
    // Projeção linear com y-axis invertido (telas começam no topo)
    const x = ((lng - minLng) / (maxLng - minLng)) * 80 + 10;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 80 + 10;
    return { x, y };
  }, [mapBounds]);

  // Identifica vazios geográficos: check-ins a mais de 1.5km de qualquer equipamento cultural ativo
  const gaps = useMemo(() => {
    if (!data) return [];
    
    // Função simples de distância Euclidiana aproximada (suficiente para escalas municipais)
    const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const dLat = lat2 - lat1;
      const dLng = lng2 - lng1;
      return Math.sqrt(dLat * dLat + dLng * dLng) * 111.32; // aproximado para Km
    };

    const thresholdKm = 1.5; // Raio máximo de cobertura aceitável

    return data.checkins.filter(checkin => {
      // Verifica se o check-in está longe de TODOS os equipamentos
      return data.equipments.every(eq => {
        return getDistance(checkin.lat, checkin.lng, eq.lat, eq.lng) > thresholdKm;
      });
    });
  }, [data]);

  // Métricas do painel
  const stats = useMemo(() => {
    if (!data) return { coverage: 100, gapRatio: 0 };
    const totalCheckins = data.checkins.length;
    const unservedCheckins = gaps.length;
    const servedCheckins = totalCheckins - unservedCheckins;
    
    const coverage = totalCheckins > 0 ? Math.round((servedCheckins / totalCheckins) * 100) : 100;
    const gapRatio = totalCheckins > 0 ? Math.round((unservedCheckins / totalCheckins) * 100) : 0;

    return { coverage, gapRatio };
  }, [data, gaps]);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10rem 0', gap: '1rem' }}>
      <Loader2 className="animate-spin" size={40} style={{ color: 'var(--accent-primary)' }} />
      <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Analisando geolocalização e check-ins municipais...</span>
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem' }}>
            <MapIcon style={{ color: 'var(--accent-primary)' }} /> Vazios Culturais Territoriais
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Cruzamento geopolítico entre check-ins populacionais e a distribuição física de equipamentos e eventos.
          </p>
        </div>
        <button 
          onClick={fetchData}
          className="btn-primary"
          style={{
            background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-bronze))',
            color: 'black',
            fontWeight: '600',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: '0.6rem 1.2rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(212,175,55,0.2)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          🔄 Atualizar Agregação
        </button>
      </div>

      {data && (
        <>
          {/* Métricas Principais */}
          <div className="card-grid" style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 relative overflow-hidden group hover:border-[var(--accent-primary)] transition-all duration-300">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="stat-label" style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Equipamentos Ativos</span>
                <Building size={20} style={{ color: '#60a5fa' }} />
              </div>
              <div className="tabular-nums tracking-tight font-bold text-3xl bg-gradient-to-br from-[#60a5fa] to-[#3b82f6] bg-clip-text text-transparent">
                {data.equipments.length}
              </div>
              <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.5rem' }}>Pontos culturais físicos cadastrados</p>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 relative overflow-hidden group hover:border-[var(--accent-primary)] transition-all duration-300">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="stat-label" style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Eventos Publicados</span>
                <Calendar size={20} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <div className="tabular-nums tracking-tight font-bold text-3xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
                {data.events.length}
              </div>
              <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.5rem' }}>Atividades da agenda em execução</p>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 relative overflow-hidden group hover:border-[var(--accent-primary)] transition-all duration-300">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="stat-label" style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Índice de Cobertura</span>
                <TrendingUp size={20} style={{ color: stats.coverage >= 70 ? '#22c55e' : '#ef4444' }} />
              </div>
              <div className="tabular-nums tracking-tight font-bold text-3xl" style={{ color: stats.coverage >= 70 ? '#22c55e' : '#ef4444' }}>
                {stats.coverage}%
              </div>
              <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.5rem' }}>Proporção de check-ins atendidos</p>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 relative overflow-hidden group hover:border-[var(--accent-primary)] transition-all duration-300" style={{ border: gaps.length > 0 ? '1px solid rgba(239,68,68,0.2)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="stat-label" style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Vazios Territoriais</span>
                <Flame size={20} style={{ color: '#ef4444' }} />
              </div>
              <div className="tabular-nums tracking-tight font-bold text-3xl text-[#ef4444]">
                {gaps.length} <span style={{ fontSize: '1rem', fontWeight: 500, color: '#94a3b8' }}>check-ins</span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.5rem' }}>Locais sem infraestrutura cultural num raio de 1.5km</p>
            </div>
          </div>

          {/* Seção Principal do Mapa */}
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            
            {/* Mapa Interativo de Calor / Vazios */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 relative" style={{ minHeight: '520px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                  <Compass size={18} style={{ color: 'var(--accent-primary)' }} /> Visualização Geopolítica do Município
                </h3>
                
                {/* Controles de Camadas */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => setShowEquipments(!showEquipments)}
                    className="badge" 
                    style={{ 
                      cursor: 'pointer',
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.25rem',
                      background: showEquipments ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${showEquipments ? '#60a5fa' : '#334155'}`,
                      color: showEquipments ? '#60a5fa' : '#64748b',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '1rem'
                    }}
                  >
                    {showEquipments ? <Eye size={12} /> : <EyeOff size={12} />} Equipamentos
                  </button>
                  <button 
                    onClick={() => setShowEvents(!showEvents)}
                    className="badge" 
                    style={{ 
                      cursor: 'pointer',
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.25rem',
                      background: showEvents ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${showEvents ? 'var(--accent-primary)' : '#334155'}`,
                      color: showEvents ? 'var(--accent-primary)' : '#64748b',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '1rem'
                    }}
                  >
                    {showEvents ? <Eye size={12} /> : <EyeOff size={12} />} Eventos
                  </button>
                  <button 
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className="badge" 
                    style={{ 
                      cursor: 'pointer',
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.25rem',
                      background: showHeatmap ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${showHeatmap ? '#ef4444' : '#334155'}`,
                      color: showHeatmap ? '#ef4444' : '#64748b',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '1rem'
                    }}
                  >
                    {showHeatmap ? <Eye size={12} /> : <EyeOff size={12} />} Heatmap Check-ins
                  </button>
                </div>
              </div>

              {/* Corpo do Mapa */}
              <div style={{ 
                flex: 1, 
                position: 'relative', 
                background: 'radial-gradient(circle, #0f172a 0%, #020617 100%)', 
                border: '1px solid rgba(255,255,255,0.03)',
                borderRadius: 'var(--radius-md)', 
                overflow: 'hidden',
                boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.5)'
              }}>
                <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, minHeight: '420px' }}>
                  {/* Grid de fundo cartográfico */}
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.015)" strokeWidth="1" />
                    </pattern>
                    {/* Efeito Blur para o Heatmap */}
                    <filter id="blur-heat">
                      <feGaussianBlur stdDeviation="22" />
                    </filter>
                    <filter id="blur-gap">
                      <feGaussianBlur stdDeviation="15" />
                    </filter>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Camada 1: Heatmap de Densidade de Check-ins (Áreas Populares) */}
                  {showHeatmap && data.checkins.map((checkin) => {
                    const { x, y } = getXY(checkin.lat, checkin.lng);
                    const isVazio = gaps.some(g => g.id === checkin.id);
                    return (
                      <circle
                        key={`heat-${checkin.id}`}
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r={isVazio ? "45" : "35"}
                        fill={isVazio ? "rgba(239, 68, 68, 0.28)" : "rgba(34, 197, 94, 0.12)"}
                        filter="url(#blur-heat)"
                        style={{ pointerEvents: 'none' }}
                      />
                    );
                  })}

                  {/* Camada Adicional de Vazios Territoriais Cruciais (Zonas Vermelhas Fortes) */}
                  {showHeatmap && gaps.map((gap) => {
                    const { x, y } = getXY(gap.lat, gap.lng);
                    return (
                      <circle
                        key={`gap-core-${gap.id}`}
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r="25"
                        fill="rgba(249, 115, 22, 0.35)"
                        filter="url(#blur-gap)"
                        style={{ pointerEvents: 'none' }}
                      />
                    );
                  })}

                  {/* Camada 2: Linhas de Conexão dos Check-ins aos Equipamentos Culturais mais próximos */}
                  {showEquipments && showHeatmap && data.checkins.map((checkin) => {
                    const isVazio = gaps.some(g => g.id === checkin.id);
                    if (isVazio) return null;
                    
                    let nearestEq = data.equipments[0];
                    let minDist = Infinity;
                    data.equipments.forEach(eq => {
                      const dist = Math.pow(eq.lat - checkin.lat, 2) + Math.pow(eq.lng - checkin.lng, 2);
                      if (dist < minDist) {
                        minDist = dist;
                        nearestEq = eq;
                      }
                    });

                    if (!nearestEq) return null;
                    const start = getXY(checkin.lat, checkin.lng);
                    const end = getXY(nearestEq.lat, nearestEq.lng);

                    return (
                      <line
                        key={`conn-${checkin.id}`}
                        x1={`${start.x}%`}
                        y1={`${start.y}%`}
                        x2={`${end.x}%`}
                        y2={`${end.y}%`}
                        stroke="rgba(96, 165, 250, 0.12)"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                    );
                  })}

                  {/* Camada 3: Pinos de Check-ins (Pequenos círculos com leve pulsação) */}
                  {showHeatmap && data.checkins.map((checkin) => {
                    const { x, y } = getXY(checkin.lat, checkin.lng);
                    const isVazio = gaps.some(g => g.id === checkin.id);
                    return (
                      <g 
                        key={`dot-${checkin.id}`}
                        onMouseEnter={() => setHoveredPoint({ ...checkin, type: "Check-in de Visitante", date: new Date(checkin.createdAt || Date.now()).toLocaleDateString('pt-BR') })}
                        onMouseLeave={() => setHoveredPoint(null)}
                        style={{ cursor: 'pointer' }}
                      >
                        <circle
                          cx={`${x}%`}
                          cy={`${y}%`}
                          r="4"
                          fill={isVazio ? "#f97316" : "#22c55e"}
                          style={{
                            transition: 'r 0.2s',
                            filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.8))'
                          }}
                        />
                        <circle
                          cx={`${x}%`}
                          cy={`${y}%`}
                          r="10"
                          fill="transparent"
                          stroke={isVazio ? "rgba(249, 115, 22, 0.3)" : "rgba(34, 197, 94, 0.3)"}
                          strokeWidth="1.5"
                          className="animate-ping"
                          style={{ animationDuration: '3s' }}
                        />
                      </g>
                    );
                  })}

                  {/* Camada 4: Pinos de Eventos (Estrelas / Símbolos Dourados) */}
                  {showEvents && data.events.map((ev) => {
                    const { x, y } = getXY(ev.lat, ev.lng);
                    return (
                      <g
                        key={`pin-ev-${ev.id}`}
                        transform={`translate(0, -6)`}
                        onMouseEnter={() => setHoveredPoint({ ...ev, type: "Evento Cultural Ativo" })}
                        onMouseLeave={() => setHoveredPoint(null)}
                        style={{ cursor: 'pointer' }}
                      >
                        <circle
                          cx={`${x}%`}
                          cy={`${y}%`}
                          r="7"
                          fill="var(--accent-primary)"
                          stroke="black"
                          strokeWidth="1.5"
                          style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' }}
                        />
                        <polygon
                          points={`${x},${y-3} ${x+1},${y-1} ${x+3},${y-1} ${x+1},${y+1} ${x+2},${y+3} ${x},${y+1} ${x-2},${y+3} ${x-1},${y+1} ${x-3},${y-1} ${x-1},${y-1}`}
                          fill="black"
                          transform={`scale(0.8) translate(${x*0.25}, ${y*0.25})`}
                        />
                      </g>
                    );
                  })}

                  {/* Camada 5: Pinos de Equipamentos Culturais (Azul / Premium) */}
                  {showEquipments && data.equipments.map((eq) => {
                    const { x, y } = getXY(eq.lat, eq.lng);
                    return (
                      <g
                        key={`pin-eq-${eq.id}`}
                        onMouseEnter={() => setHoveredPoint({ ...eq, type: `Equipamento (${eq.type})` })}
                        onMouseLeave={() => setHoveredPoint(null)}
                        style={{ cursor: 'pointer' }}
                      >
                        <circle
                          cx={`${x}%`}
                          cy={`${y}%`}
                          r="9"
                          fill="#3b82f6"
                          stroke="white"
                          strokeWidth="2"
                          style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))' }}
                        />
                        <rect
                          x={`${x-4}`}
                          y={`${y-4}`}
                          width="8"
                          height="8"
                          fill="white"
                          rx="1"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Rosa dos Ventos / Bússola Decorativa */}
                <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', opacity: 0.3, display: 'flex', alignItems: 'center', gap: '0.5rem', pointerEvents: 'none' }}>
                  <Compass size={24} style={{ color: 'white' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'white', letterSpacing: '0.1rem' }}>DIREÇÃO GEO</span>
                </div>

                {/* Card Informativo Flutuante no Hover */}
                {hoveredPoint && (
                  <div style={{
                    position: 'absolute',
                    bottom: '1.5rem',
                    left: '1.5rem',
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(12px)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    minWidth: '220px',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.6)',
                    animation: 'fadeIn 0.2s ease-out',
                    zIndex: 20,
                    pointerEvents: 'none'
                  }}>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      fontWeight: 700, 
                      letterSpacing: '0.05rem', 
                      color: hoveredPoint.source === 'equipamento' ? '#60a5fa' : hoveredPoint.title ? 'var(--accent-primary)' : '#f97316',
                      display: 'block',
                      marginBottom: '0.25rem',
                      textTransform: 'uppercase'
                    }}>
                      {hoveredPoint.type || "Elemento"}
                    </span>
                    <h4 style={{ color: 'white', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>
                      {hoveredPoint.name || hoveredPoint.title || hoveredPoint.equipmentName || "Check-in Registrado"}
                    </h4>
                    {hoveredPoint.tenantName && (
                      <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>
                        Local: {hoveredPoint.tenantName}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.7rem', color: '#64748b' }}>
                      <span>Lat: {hoveredPoint.lat.toFixed(4)}</span>
                      <span>Lng: {hoveredPoint.lng.toFixed(4)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Painel Lateral de Gaps / Legendas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Painel Legendas */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-5">
                <h4 style={{ color: 'white', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={16} /> Legendas e Camadas
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#3b82f6', border: '2px solid white', flexShrink: 0 }} />
                    <div>
                      <p style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>Equipamento Cultural</p>
                      <p style={{ color: '#64748b', fontSize: '0.68rem', margin: 0 }}>Museus, Teatros, Bibliotecas físicas</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--accent-primary)', border: '2px solid black', flexShrink: 0 }} />
                    <div>
                      <p style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>Evento Ativo</p>
                      <p style={{ color: '#64748b', fontSize: '0.68rem', margin: 0 }}>Atividades, cursos, festivais ativos</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                    <div>
                      <p style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>Check-in Atendido</p>
                      <p style={{ color: '#64748b', fontSize: '0.68rem', margin: 0 }}>Público próximo a infraestrutura</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f97316', flexShrink: 0 }} />
                    <div>
                      <p style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>Vazio Territorial (Check-in)</p>
                      <p style={{ color: '#64748b', fontSize: '0.68rem', margin: 0 }}>Público distante de equipamentos</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '24px', height: '12px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.28)', border: '1px solid rgba(239,68,68,0.5)', flexShrink: 0 }} />
                    <div>
                      <p style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>Heatmap Vazio Cultural</p>
                      <p style={{ color: '#64748b', fontSize: '0.68rem', margin: 0 }}>Área de alta urgência para intervenção</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ação Recomendada */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-5" style={{ background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.1)' }}>
                <h4 style={{ color: '#f87171', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={16} /> Diagnóstico Territorial
                </h4>
                
                {gaps.length > 0 ? (
                  <>
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem', lineHeight: '1.25rem', margin: 0 }}>
                      Foram identificados <strong>{gaps.length} pontos de check-ins</strong> sem cobertura cultural adequada.
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem', lineHeight: '1.25rem', marginTop: '0.5rem' }}>
                      Recomendamos priorizar o envio de programações móveis, bibliotecas itinerantes ou criar editais com incentivos para proponentes locais dessas regiões.
                    </p>
                  </>
                ) : (
                  <p style={{ color: '#22c55e', fontSize: '0.75rem', lineHeight: '1.25rem', margin: 0 }}>
                    Excelente! Toda a atividade mapeada de visitantes se concentra dentro do raio de cobertura dos equipamentos cadastrados.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Lista Analítica de Equipamentos vs Cobertura */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 transition-colors" style={{ marginBottom: '1.5rem' }}>
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <CheckCircle2 size={18} style={{ color: 'var(--accent-primary)' }} /> Detalhamento de Cobertura Física
            </h2>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: '#64748b' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Nome do Equipamento</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Tipo</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Localização</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Timestamps de Atividade</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Status no Mapa</th>
                  </tr>
                </thead>
                <tbody>
                  {data.equipments.map((eq) => {
                    const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
                      return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2)) * 111.32;
                    };
                    const localCheckins = data.checkins.filter(c => getDistance(c.lat, c.lng, eq.lat, eq.lng) <= 1.5).length;

                    return (
                      <tr key={eq.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', color: 'white' }}>
                        <td style={{ padding: '1rem', fontWeight: 600 }}>{eq.name}</td>
                        <td style={{ padding: '1rem' }}>
                          <span className="badge" style={{ background: 'rgba(96,165,250,0.08)', color: '#60a5fa', fontSize: '0.65rem' }}>
                            {eq.type || "OUTROS"}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: '#94a3b8' }}>{eq.lat.toFixed(4)}, {eq.lng.toFixed(4)}</td>
                        <td style={{ padding: '1rem', color: '#64748b' }}>{localCheckins} check-ins recentes</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: localCheckins > 0 ? '#22c55e' : '#f59e0b'
                          }}>
                            ● {localCheckins > 0 ? 'COBERTURA ATIVA' : 'OCIOSO'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
