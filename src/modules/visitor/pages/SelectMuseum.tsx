import { logger } from "@/utils/logger";
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import { LanguageSwitcher } from "../../../components/LanguageSwitcher";
import { 
  MapPin, Search, Compass, 
  ArrowRight, Star, Info, 
  Zap, Navigation, X, 
  Clock, Landmark, Theater,
  Calendar, Sparkles, Map as MapIcon
} from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";
import "./SelectMuseum.css";
import { useGeoFencing } from "../../visitor/context/GeoFencingProvider";
import { 
  Button, 
  Card, 
  AnimateIn, 
  Badge
} from "@/components/ui";
import { ParticleBackground } from "@/components/ui/ParticleBackground";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { motion } from "framer-motion";

interface Equipamento {
  id: string;
  tenantId: string;
  nome: string;
  slug: string;
  tipo: string;
  fotoCapaUrl?: string;
  lat?: number;
  lng?: number;
  horarios?: {
    seg?: string;
  };
  endereco?: string;
  cidade?: string;
  cityId?: string | null;
  missao?: string;
  descricao?: string;
  address?: string;
  estado?: string;
  // Computed client-side
  distance?: number;
}

interface Evento {
  id: string;
  title: string;
  category: string;
  startDate: string;
  coverImage?: string;
  tenantName?: string;
  location?: string;
  equipamentoNome?: string;
}

const isCanceledRequest = (err: unknown) => {
  if (!err || typeof err !== "object") return false;
  const maybeCanceled = err as { name?: string; code?: string };
  return maybeCanceled.name === "CanceledError" || maybeCanceled.code === "ERR_CANCELED";
};

export const SelectMuseum: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, updateSession, isGuest, enterAsGuest, role, name, tenantId } = useAuth();
  const [searchParams] = useSearchParams();
  const isRegisterMode = searchParams.get("mode") === "register";

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedEstado, setSelectedEstado] = useState<string | null>(null);
  const [selectedCidade, setSelectedCidade] = useState<string | null>(null);
  const [selectedLandmark, setSelectedLandmark] = useState<Equipamento | null>(null);
  const [events, setEvents] = useState<Evento[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const { userLocation } = useGeoFencing();

  // Load Tenants & Handle Auto-selection
  useEffect(() => {
    const abortController = new AbortController();
    
    async function init() {
      await loadEquipamentos(abortController.signal);
      await loadEvents(abortController.signal);
    }
    init();

    return () => abortController.abort();
  }, []);

  useEffect(() => {
    const selectId = searchParams.get("select");
    if (selectId && equipamentos.length > 0) {
      const found = equipamentos.find(e => e.id === selectId);
      if (found) setSelectedLandmark(found);
    }
  }, [searchParams, equipamentos]);

  const loadEquipamentos = async (signal?: AbortSignal) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.get("/equipamentos/public", { signal });
      setEquipamentos(Array.isArray(res.data) ? res.data : []);
    } catch (err: unknown) {
      if (isCanceledRequest(err)) return;
      logger.error("Error loading equipments", err);
      setErrorMsg("O servidor está momentaneamente fora do ar. Estamos restabelecendo a conexão!");
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async (signal?: AbortSignal) => {
    setLoadingEvents(true);
    try {
      const res = await api.get("/events?discovery=true", { signal });
      setEvents(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err: unknown) {
      if (isCanceledRequest(err)) return;
      logger.error("Error loading events", err);
    } finally {
      setLoadingEvents(false);
    }
  };


  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filteredAndSortedEquipamentos = useMemo(() => {
    let result = equipamentos.map(e => {
      let distance = undefined;
      if (userLocation && e.lat && e.lng) {
        distance = calculateDistance(userLocation.lat, userLocation.lng, e.lat, e.lng);
      }
      return { ...e, distance };
    });

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(e =>
        e.nome.toLowerCase().includes(lower) ||
        (e.cidade && e.cidade.toLowerCase().includes(lower)) ||
        (e.estado && e.estado.toLowerCase().includes(lower))
      );
    }

    if (activeFilter !== "ALL") {
      result = result.filter(e => e.tipo === activeFilter);
    }

    if (userLocation) {
      result.sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
    }

    return result;
  }, [equipamentos, searchTerm, activeFilter, userLocation]);

  const nearestEquipamentos = useMemo(() => {
    if (!userLocation) return [];
    return [...filteredAndSortedEquipamentos]
      .filter(e => e.distance !== undefined && e.distance < 5) // Within 5km
      .slice(0, 3);
  }, [filteredAndSortedEquipamentos, userLocation]);

  const estadosDisponiveis = useMemo(() => {
    const estados = new Set(filteredAndSortedEquipamentos.map(e => e.estado || "MG"));
    return Array.from(estados).sort();
  }, [filteredAndSortedEquipamentos]);

  const cidadesDoEstado = useMemo(() => {
    if (!selectedEstado) return [];
    const cidades = new Set(filteredAndSortedEquipamentos.filter(e => (e.estado || "MG") === selectedEstado).map(e => e.cidade));
    return Array.from(cidades).sort();
  }, [filteredAndSortedEquipamentos, selectedEstado]);

  const equipamentosDaCidade = useMemo(() => {
    if (!selectedCidade || !selectedEstado) return [];
    return filteredAndSortedEquipamentos.filter(e => (e.estado || "MG") === selectedEstado && e.cidade === selectedCidade);
  }, [filteredAndSortedEquipamentos, selectedEstado, selectedCidade]);

  const handleSelect = async (equip: Equipamento) => {
    // Se logado, atualiza sessao
    if (isAuthenticated && !isGuest) {
      try {
        // Reutilizamos switch-tenant mas agora focando em equipamento contextualmente se necessario,
        // ou apenas atualizamos localmente o ID
        updateSession(role || "visitor", equip.tenantId, name, equip.id, equip.cityId || null);
        navigate("/hub");
        return;
      } catch (err: unknown) {
        logger.error("Error selecting equipment", err);
      }
    }

    if (isRegisterMode) {
      navigate("/register", { 
        state: { 
          tenantId: equip.tenantId, 
          equipamentoId: equip.id, 
          cityId: equip.cityId,
          tenantName: equip.nome 
        } 
      });
      return;
    }

    enterAsGuest(equip.tenantId, equip.id, equip.cityId || null);
    navigate("/hub");
  };

  const formatDistance = (dist?: number) => {
    if (dist === undefined) return null;
    if (dist < 1) return `${(dist * 1000).toFixed(0)}m`;
    return `${dist.toFixed(1)}km`;
  };

  return (
    <div className="discovery-page pulse-hub bg-[var(--bg-page)] min-h-screen relative overflow-x-hidden">
      {/* 🔮 PULSE BACKGROUND ELEMENTS */}
      <ParticleBackground />
      {/* Vignette effect to fade out the edges and highlight center */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_0%,_var(--bg-page)_80%)]" />

      {/* HEADER TOP BAR */}
      <nav className="pulse-top-bar flex justify-between items-center px-8 py-6 sticky top-0 z-[100] backdrop-blur-xl bg-[var(--bg-overlay)] border-b border-[var(--border-subtle)]">
        <div className="pulse-brand flex items-center gap-3 font-black text-xl tracking-tighter">
          <span className="text-[var(--fg-main)]">{t("visitor.selectMuseum.hubTitle")}</span>
        </div>
        <div className="pulse-top-actions flex items-center gap-4">
          <Button
            variant="glass"
            size="sm"
            onClick={() => {
              const museum = selectedLandmark;
              const nextTenantId = (museum?.tenantId || tenantId || "").trim();
              if (!nextTenantId || nextTenantId === "undefined" || nextTenantId === "null") {
                setErrorMsg("Selecione um museu para entrar no Hub.");
                return;
              }
              enterAsGuest(nextTenantId, museum?.id ?? null, museum?.cityId || null);
              navigate("/hub");
            }}
            rightIcon={<ArrowRight size={16} />}
            className="rounded-full px-5 text-xs font-bold bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 hover:bg-[var(--accent-primary)] hover:text-black transition-all"
          >
            Ir para o Hub
          </Button>
          {isAuthenticated && <Badge variant="outline" className="text-green-400 border-green-400/30 bg-green-400/5">Online</Badge>}
          <LanguageSwitcher absolute={false} />
          <ThemeToggle />
        </div>
      </nav>
