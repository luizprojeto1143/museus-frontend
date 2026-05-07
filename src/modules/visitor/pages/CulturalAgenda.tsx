import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../api/client";
import { MapPin, Calendar, Clock, ArrowRight, Sparkles, Search, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge, PageLoader } from "@/components/ui";
import { getFullUrl } from "../../../utils/url";
import "./CulturalAgenda.css";

interface City {
  id: string;
  name: string;
  slug: string;
}

interface EventItem {
  id: string;
  title: string;
  startDate: string;
  location?: string;
  coverImageUrl?: string;
  tenant: {
    id: string;
    name: string;
  }
}

export const CulturalAgenda: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCityId, setSelectedCityId] = useState<string>("ALL");

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [citiesRes, eventsRes] = await Promise.all([
          api.get("/tenants/public"),
          api.get("/events", { params: { discovery: 'true' } })
        ]);
        
        // Filter only tenants that are cities (or secretaria)
        const cityData = Array.isArray(citiesRes.data) ? citiesRes.data : [];
        const cityTenants = cityData.filter((t: any) => t.type === 'CITY' || t.type === 'SECRETARIA');
        setCities(cityTenants);
        setEvents(eventsRes.data.data || []);
      } catch (err) {
        console.error("Error fetching agenda data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const fetchFilteredEvents = async (cityId: string) => {
    setLoading(true);
    try {
      const params: any = { discovery: 'true' };
      if (cityId !== 'ALL') params.cityId = cityId;
      
      const res = await api.get("/events", { params });
      setEvents(res.data.data || []);
    } catch (err) {
      console.error("Error fetching filtered events", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    fetchFilteredEvents(cityId);
  };

  const groupedEvents = useMemo(() => {
    const groups: Record<string, EventItem[]> = {};
    const sorted = [...events].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    sorted.forEach(ev => {
      const dateKey = new Date(ev.startDate).toLocaleDateString('pt-BR');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(ev);
    });
    return groups;
  }, [events]);

  if (loading && events.length === 0) return <PageLoader />;

  return (
    <div className="agenda-container">
      <header className="agenda-header-cinematic">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="agenda-badge"
        >
          <Sparkles size={14} className="inline mr-2" />
          Agenda Cultural Unificada
        </motion.div>
        <h1 className="agenda-title-cinematic">Pulso da Cidade</h1>
        <p className="hero-subtitle-premium max-w-2xl mx-auto">
          Explore as melhores experiências culturais concentradas em um só lugar. Escolha sua cidade e garanta seu lugar na história.
        </p>
      </header>

      <div className="city-filter-container">
        <button 
          className={`city-pill ${selectedCityId === 'ALL' ? 'active' : ''}`}
          onClick={() => handleCityChange('ALL')}
        >
          Todas as Cidades
        </button>
        {cities.map(city => (
          <button 
            key={city.id}
            className={`city-pill ${selectedCityId === city.id ? 'active' : ''}`}
            onClick={() => handleCityChange(city.id)}
          >
            {city.name}
          </button>
        ))}
      </div>

      <div className="agenda-timeline">
        {Object.entries(groupedEvents).map(([date, dayEvents], groupIdx) => {
          const d = new Date(dayEvents[0].startDate);
          return (
            <motion.div 
              key={date}
              className="agenda-date-group"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: groupIdx * 0.1 }}
            >
              <div className="agenda-date-sidebar">
                <span className="date-day">{d.getDate()}</span>
                <span className="date-month">
                  {d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                </span>
              </div>

              <div className="agenda-cards-grid">
                {dayEvents.map(ev => (
                  <Link key={ev.id} to={`/eventos/${ev.id}`} className="agenda-card-premium">
                    <div className="card-visual">
                      <img 
                        src={getFullUrl(ev.coverImageUrl || '/placeholder-event.jpg')} 
                        alt={ev.title} 
                        className="card-img" 
                      />
                    </div>
                    
                    <div className="card-content">
                      <span className="card-museum-tag">
                        <Building2 size={12} /> {ev.tenant.name}
                      </span>
                      <h2 className="card-title">{ev.title}</h2>
                      <div className="card-meta">
                        <div className="meta-item"><Clock size={14} /> {new Date(ev.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="meta-item"><MapPin size={14} /> {ev.location || "Sede do Museu"}</div>
                      </div>
                    </div>

                    <div className="card-actions">
                      <div className="btn-ticket">
                        Garantir Ingresso <ArrowRight size={16} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          );
        })}

        {!loading && events.length === 0 && (
          <div className="text-center py-20 opacity-50">
            <Calendar size={64} className="mx-auto mb-4" />
            <h3 className="text-xl font-bold">Nenhum evento encontrado</h3>
            <p>Tente selecionar outra cidade ou volte mais tarde.</p>
          </div>
        )}
      </div>
    </div>
  );
};
