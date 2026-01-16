import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
    getDirections,
    formatDistance,
    formatDuration,
    getGoogleMapsUrl,
    NavigationRoute,
    NavigationProfile
} from "../../services/navigationService";

interface NavigationModalProps {
    isOpen: boolean;
    onClose: () => void;
    destination: {
        lat: number;
        lng: number;
        name: string;
    };
}

export const NavigationModal: React.FC<NavigationModalProps> = ({
    isOpen,
    onClose,
    destination
}) => {
    const { t } = useTranslation();
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const routeLayerRef = useRef<L.Polyline | null>(null);

    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [route, setRoute] = useState<NavigationRoute | null>(null);
    const [profile, setProfile] = useState<NavigationProfile>("foot-walking");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [gettingLocation, setGettingLocation] = useState(true);

    // Obter localização do usuário
    useEffect(() => {
        if (!isOpen) return;

        setGettingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setGettingLocation(false);
                },
                (err) => {
                    console.error("Erro ao obter localização:", err);
                    setError("Não foi possível obter sua localização. Verifique as permissões.");
                    setGettingLocation(false);
                },
                { enableHighAccuracy: true }
            );
        } else {
            setError("Geolocalização não suportada pelo navegador");
            setGettingLocation(false);
        }
    }, [isOpen]);

    // Inicializar mapa
    useEffect(() => {
        if (!isOpen || !mapRef.current) return;

        // Limpar mapa anterior
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
        }

        // Criar novo mapa
        const map = L.map(mapRef.current).setView([destination.lat, destination.lng], 15);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors"
        }).addTo(map);

        // Marcador do destino
        const destIcon = L.divIcon({
            className: "dest-marker",
            html: '<div style="background: #ef4444; color: white; padding: 8px 12px; border-radius: 20px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">📍 ' + destination.name.substring(0, 20) + '</div>',
            iconAnchor: [50, 40]
        });
        L.marker([destination.lat, destination.lng], { icon: destIcon }).addTo(map);

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [isOpen, destination]);

    // Adicionar marcador do usuário e calcular rota
    useEffect(() => {
        if (!mapInstanceRef.current || !userLocation) return;

        // Marcador do usuário
        const userIcon = L.divIcon({
            className: "user-marker",
            html: '<div style="background: #3b82f6; color: white; padding: 8px 12px; border-radius: 50%; font-size: 1.5rem;">📍</div>',
            iconAnchor: [20, 20]
        });
        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(mapInstanceRef.current);

        // Ajustar zoom para mostrar ambos os pontos
        const bounds = L.latLngBounds(
            [userLocation.lat, userLocation.lng],
            [destination.lat, destination.lng]
        );
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });

        // Calcular rota
        calculateRoute();
    }, [userLocation]);

    // Recalcular quando perfil mudar
    useEffect(() => {
        if (userLocation) {
            calculateRoute();
        }
    }, [profile]);

    const calculateRoute = async () => {
        if (!userLocation) return;

        setLoading(true);
        setError(null);

        try {
            const routeData = await getDirections(userLocation, destination, profile);
            setRoute(routeData);

            // Desenhar rota no mapa
            if (mapInstanceRef.current && routeData.geometry?.coordinates) {
                // Remover rota anterior
                if (routeLayerRef.current) {
                    mapInstanceRef.current.removeLayer(routeLayerRef.current);
                }

                // Desenhar nova rota
                const coords = routeData.geometry.coordinates.map(
                    (c: [number, number]) => [c[1], c[0]] as [number, number]
                );
                routeLayerRef.current = L.polyline(coords, {
                    color: profile === "driving-car" ? "#3b82f6" : profile === "cycling-regular" ? "#10b981" : "#8b5cf6",
                    weight: 5,
                    opacity: 0.8
                }).addTo(mapInstanceRef.current);
            }
        } catch (err: any) {
            console.error("Erro ao calcular rota:", err);
            setError("Erro ao calcular rota");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.9)",
                zIndex: 9999,
                display: "flex",
                flexDirection: "column"
            }}
        >
            {/* Header */}
            <div style={{
                padding: "1rem",
                background: "var(--bg-card)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--border-subtle)"
            }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: "1.1rem" }}>📍 Como Chegar</h2>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        {destination.name}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: "transparent",
                        border: "none",
                        color: "white",
                        fontSize: "1.5rem",
                        cursor: "pointer"
                    }}
                >
                    ✕
                </button>
            </div>

            {/* Transport Mode Selector */}
            <div style={{
                padding: "0.75rem 1rem",
                background: "var(--bg-card)",
                display: "flex",
                gap: "0.5rem",
                justifyContent: "center"
            }}>
                {[
                    { id: "foot-walking" as NavigationProfile, icon: "🚶", label: "A pé" },
                    { id: "driving-car" as NavigationProfile, icon: "🚗", label: "Carro" },
                    { id: "cycling-regular" as NavigationProfile, icon: "🚴", label: "Bicicleta" }
                ].map((mode) => (
                    <button
                        key={mode.id}
                        onClick={() => setProfile(mode.id)}
                        style={{
                            padding: "0.5rem 1rem",
                            borderRadius: "20px",
                            border: profile === mode.id ? "2px solid var(--primary)" : "1px solid var(--border-subtle)",
                            background: profile === mode.id ? "var(--primary)" : "transparent",
                            color: profile === mode.id ? "#000" : "white",
                            cursor: "pointer",
                            fontWeight: profile === mode.id ? "bold" : "normal"
                        }}
                    >
                        {mode.icon} {mode.label}
                    </button>
                ))}
            </div>

            {/* Map */}
            <div ref={mapRef} style={{ flex: 1, minHeight: "300px" }} />

            {/* Route Info */}
            <div style={{
                padding: "1rem",
                background: "var(--bg-card)",
                borderTop: "1px solid var(--border-subtle)"
            }}>
                {gettingLocation ? (
                    <p style={{ textAlign: "center" }}>📡 Obtendo sua localização...</p>
                ) : error ? (
                    <p style={{ textAlign: "center", color: "#ef4444" }}>{error}</p>
                ) : loading ? (
                    <p style={{ textAlign: "center" }}>🔄 Calculando rota...</p>
                ) : route ? (
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "1rem" }}>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary)" }}>
                                    {formatDistance(route.distance)}
                                </div>
                                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Distância</div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary)" }}>
                                    {formatDuration(route.duration)}
                                </div>
                                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Tempo estimado</div>
                            </div>
                        </div>

                        {/* Steps */}
                        {route.steps && route.steps.length > 0 && (
                            <div style={{
                                maxHeight: "150px",
                                overflowY: "auto",
                                marginBottom: "1rem",
                                fontSize: "0.85rem"
                            }}>
                                {route.steps.slice(0, 5).map((step, idx) => (
                                    <div key={idx} style={{
                                        padding: "0.5rem",
                                        borderBottom: "1px solid var(--border-subtle)"
                                    }}>
                                        {step.instruction}
                                    </div>
                                ))}
                                {route.steps.length > 5 && (
                                    <p style={{ color: "var(--text-secondary)", padding: "0.5rem" }}>
                                        + {route.steps.length - 5} passos adicionais
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Open in Google Maps */}
                        <a
                            href={getGoogleMapsUrl(destination.lat, destination.lng, profile === "driving-car" ? "driving" : "walking")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                            style={{
                                display: "block",
                                width: "100%",
                                textAlign: "center",
                                padding: "0.75rem"
                            }}
                        >
                            🗺️ Abrir no Google Maps
                        </a>
                    </div>
                ) : null}
            </div>
        </div>
    );
};
