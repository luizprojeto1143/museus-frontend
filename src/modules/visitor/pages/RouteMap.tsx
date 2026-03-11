import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../../api/client";
import { MapPin, Navigation, ArrowRight, Flag, LocateFixed } from "lucide-react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./RouteMap.css";

// Fix Leaflet marker icons
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const UserIcon = L.divIcon({
    className: 'user-location-icon',
    html: `<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
});

interface RouteStop {
    id: string;
    order: number;
    targetType: string;
    targetId: string;
    latitude: number;
    longitude: number;
}

interface Route {
    id: string;
    name: string;
    description?: string;
    stops: RouteStop[];
}

// Helper to auto-center map
const MapRefocus: React.FC<{ center: [number, number] }> = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

export const RouteMap: React.FC = () => {
    const { routeId } = useParams<{ routeId: string }>();
    const [route, setRoute] = useState<Route | null>(null);
    const [currentStopIndex, setCurrentStopIndex] = useState(0);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoute = async () => {
            try {
                const res = await api.get(`/roadmap-extra/${routeId}`);
                setRoute(res.data);
            } catch (err) {
                console.error("Erro ao carregar rota:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRoute();
    }, [routeId]);

    useEffect(() => {
        if ("geolocation" in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    setUserLocation({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    });
                },
                (err) => console.error("Erro GPS:", err),
                { enableHighAccuracy: true }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, []);

    const distanceToNext = useMemo(() => {
        if (!userLocation || !route || !route.stops[currentStopIndex]) return null;
        const stop = route.stops[currentStopIndex];
        
        // Haversine formula
        const R = 6371e3; // meters
        const φ1 = userLocation.lat * Math.PI / 180;
        const φ2 = stop.latitude * Math.PI / 180;
        const Δφ = (stop.latitude - userLocation.lat) * Math.PI / 180;
        const Δλ = (stop.longitude - userLocation.lng) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return Math.round(R * c);
    }, [userLocation, route, currentStopIndex]);

    if (loading) return null;
    if (!route) return <div className="text-center py-20">Rota não encontrada</div>;

    const currentStop = route.stops[currentStopIndex];
    const isLastStop = currentStopIndex === route.stops.length - 1;

    const handleNext = () => {
        if (currentStopIndex < route.stops.length - 1) {
            setCurrentStopIndex(prev => prev + 1);
        }
    };

    const mapCenter: [number, number] = [currentStop.latitude, currentStop.longitude];
    const polylinePositions = route.stops.map(s => [s.latitude, s.longitude] as [number, number]);

    return (
        <div className="route-container">
            <div className="map-placeholder glass">
                <MapContainer 
                    center={mapCenter} 
                    zoom={16} 
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; OpenStreetMap contributors'
                    />
                    
                    <MapRefocus center={userLocation ? [userLocation.lat, userLocation.lng] : mapCenter} />

                    <Polyline positions={polylinePositions} color="var(--accent-primary)" opacity={0.4} weight={3} dashArray="5, 10" />

                    {route.stops.map((stop, idx) => (
                        <Marker 
                            key={stop.id} 
                            position={[stop.latitude, stop.longitude]}
                            opacity={idx === currentStopIndex ? 1 : 0.5}
                        >
                            <Popup>
                                <div style={{ color: 'black' }}>
                                    <strong>{idx + 1}. {stop.targetType}</strong>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {userLocation && (
                        <Marker position={[userLocation.lat, userLocation.lng]} icon={UserIcon}>
                            <Popup><span style={{ color: 'black' }}>Você está aqui</span></Popup>
                        </Marker>
                    )}
                </MapContainer>

                <div className="map-overlay-top">
                    <div>
                        <h2>{route.name}</h2>
                        <span>Passo {currentStopIndex + 1} de {route.stops.length}</span>
                    </div>
                    {userLocation && (
                        <div className="flex items-center gap-1 text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full border border-blue-500/30">
                            <LocateFixed size={10} /> GPS Ativo
                        </div>
                    )}
                </div>
            </div>

            <motion.div
                className="navigation-card glass"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", damping: 20 }}
            >
                <div className="nav-header">
                    <Navigation className="text-[var(--accent-primary)]" />
                    <div className="ml-3">
                        <h3 className="font-bold">
                            {distanceToNext !== null 
                                ? `A ${distanceToNext > 1000 ? (distanceToNext/1000).toFixed(1) + 'km' : distanceToNext + 'm'}` 
                                : "Siga a rota"}
                        </h3>
                        <p className="text-xs opacity-60">
                            {isLastStop ? "Destino final da trilha" : "Próximo ponto no mapa"}
                        </p>
                    </div>
                </div>

                <div className="nav-body">
                    <div className="destination-name">
                        <MapPin size={16} className="mr-2" />
                        Ponto {currentStop.order + 1}: {currentStop.targetType}
                    </div>

                    <button
                        className="btn-next-step"
                        onClick={handleNext}
                        disabled={isLastStop}
                    >
                        {isLastStop ? (
                            <>
                                <Flag size={18} className="mr-2" />
                                Rota Finalizada
                            </>
                        ) : (
                            <>
                                Próximo Ponto
                                <ArrowRight size={18} className="ml-2" />
                            </>
                        )}
                    </button>
                </div>

                <div className="route-progress">
                    {route.stops.map((_, idx) => (
                        <div
                            key={idx}
                            className={`progress-dot ${idx <= currentStopIndex ? "active" : ""} ${idx === currentStopIndex ? "current" : ""}`}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
};
