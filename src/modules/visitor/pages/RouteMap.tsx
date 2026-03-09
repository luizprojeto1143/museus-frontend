import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../../api/client";
import { MapPin, Navigation, ArrowRight, CheckCircle, Flag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./RouteMap.css";

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

    if (loading) return null;
    if (!route) return <div className="text-center py-20">Rota não encontrada</div>;

    const currentStop = route.stops[currentStopIndex];
    const isLastStop = currentStopIndex === route.stops.length - 1;

    const handleNext = () => {
        if (currentStopIndex < route.stops.length - 1) {
            setCurrentStopIndex(prev => prev + 1);
        }
    };

    return (
        <div className="route-container">
            <div className="map-placeholder glass">
                {/* 
                   In a real implementation, we would use Google Maps JS API here 
                   injecting a map with markers for all stops and current user location.
                */}
                <div className="map-dummy">
                    <MapPin className="text-[var(--accent-primary)] animate-bounce" size={48} />
                    <p className="mt-4 font-mono text-xs opacity-50 uppercase tracking-widest">
                        Mapa Interativo: {currentStop.latitude.toFixed(4)}, {currentStop.longitude.toFixed(4)}
                    </p>
                </div>

                <div className="map-overlay-top">
                    <h2>{route.name}</h2>
                    <span>Passo {currentStopIndex + 1} de {route.stops.length}</span>
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
                        <h3 className="font-bold">Próximo Destino</h3>
                        <p className="text-xs opacity-60">Siga as coordenadas no mapa</p>
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
