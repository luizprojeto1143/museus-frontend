import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Navigation, Star, MapPin } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './InteractiveMap.css';
import { api } from '@/api/client';

// Custom Marker Icons
const createCustomIcon = (color: string, iconUrl: string) => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div class="pin-wrapper" style="background-color: ${color}">
        <img src="${iconUrl}" width="16" height="16" />
      </div>
      <div class="pin-pulse" style="border-color: ${color}"></div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36]
  });
};

const defaultCenter: [number, number] = [-19.916681, -43.934493]; // Default to BH/MG

export const InteractiveMap: React.FC = () => {
  const navigate = useNavigate();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [selectedPin, setSelectedPin] = useState<any>(null);
  const [pins, setPins] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number]>(defaultCenter);

  // Busca dados reais de obras e serviços pela proximidade
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        fetchPins(coords[0], coords[1]);
      }, () => {
        fetchPins(defaultCenter[0], defaultCenter[1]);
      });
    } else {
      fetchPins(defaultCenter[0], defaultCenter[1]);
    }
  }, [tenantSlug]);

  const fetchPins = async (lat: number, lng: number) => {
    try {
      const res = await api.post(`/roteiros/${tenantSlug}/intelligent`, {
        userLatitude: lat,
        userLongitude: lng,
        timeAvailable: 1440 // tempo ilimitado para listar todos
      });
      
      const realPins = res.data.stops.map((stop: any) => ({
        id: stop.targetId,
        type: stop.targetType,
        title: stop.name,
        lat: stop.latitude,
        lng: stop.longitude,
        color: stop.targetType === 'WORK' ? '#d4af37' : '#ff4b4b',
        distance: stop.distanceKm
      }));

      // Filtra itens sem coordenada válida
      setPins(realPins.filter((p: any) => p.lat !== 0 && p.lng !== 0));
    } catch (err: any) {
      console.error("Erro ao carregar mapa", err);
    }
  };

  return (
    <div className="interactive-map-container">
      {/* Floating Header */}
      <motion.div 
        className="map-floating-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h2>Explorar Mapa</h2>
        <button className="location-btn" onClick={() => fetchPins(userLocation[0], userLocation[1])}>
          <Navigation size={20} />
        </button>
      </motion.div>

      {/* The Leaflet Map */}
      <MapContainer 
        center={userLocation} 
        zoom={14} 
        zoomControl={false}
        className="leaflet-map-wrapper"
      >
        {/* Dark Mode Map Tiles (CartoDB Dark Matter) */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {pins.map(pin => (
          <Marker 
            key={pin.id} 
            position={[pin.lat, pin.lng]}
            eventHandlers={{ click: () => setSelectedPin(pin) }}
            // Fallback icon definition since we don't have SVGs physically yet
            icon={L.divIcon({
              className: 'fallback-icon',
              html: `<div style="background:${pin.color};width:20px;height:20px;border-radius:50%;border:2px solid white;box-shadow:0 0 10px ${pin.color}"></div>`,
              iconSize: [24, 24]
            })}
          />
        ))}
      </MapContainer>

      {/* Floating Bottom Sheet for Details */}
      <AnimatePresence>
        {selectedPin && (
          <motion.div 
            className="pin-details-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", bounce: 0.2 }}
          >
            <div className="sheet-drag-handle" onClick={() => setSelectedPin(null)} />
            <div className="sheet-content">
              <h3>{selectedPin.title}</h3>
              <p className="type-badge">{selectedPin.type}</p>
              
              <div className="sheet-actions">
                <button className="primary-btn">
                  {selectedPin.type === 'RESTAURANT' ? 'Reservar Mesa' : 'Ver Detalhes'}
                </button>
                <button className="route-btn">
                  <Navigation size={18} /> Traçar Rota
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
