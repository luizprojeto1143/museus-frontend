import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
    getDirections,
    formatDistance,
    formatDuration,
    getGoogleMapsUrl,
    NavigationRoute,
    NavigationProfile,
    NavigationStep
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

// Calculate distance between two points (Haversine)
function getDistanceBetweenPoints(
    lat1: number, lon1: number,
    lat2: number, lon2: number
): number {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
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
    const userMarkerRef = useRef<L.Marker | null>(null);
    const watchIdRef = useRef<number | null>(null);

    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [route, setRoute] = useState<NavigationRoute | null>(null);
    const [profile, setProfile] = useState<NavigationProfile>("foot-walking");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [gettingLocation, setGettingLocation] = useState(true);

    // Real-time navigation state
    const [isNavigating, setIsNavigating] = useState(false);
    const [remainingDistance, setRemainingDistance] = useState<number>(0);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [hasArrived, setHasArrived] = useState(false);

    // Get current step
    const currentStep = route?.steps?.[currentStepIndex];
    const nextStep = route?.steps?.[currentStepIndex + 1];

    // Calculate remaining distance to destination
    const updateRemainingDistance = useCallback((userLat: number, userLng: number) => {
        const dist = getDistanceBetweenPoints(userLat, userLng, destination.lat, destination.lng);
        setRemainingDistance(dist);

        // Check if arrived (within 20 meters)
        if (dist < 20) {
            setHasArrived(true);
            // Vibrate if supported
            if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
            }
        }
    }, [destination]);

    // Update current step based on position
    const updateCurrentStep = useCallback((userLat: number, userLng: number) => {
        if (!route?.steps || route.steps.length === 0) return;

        // Simple heuristic: move to next step when close to it
        // In a real app, this would use the route geometry to determine progress
        const distToDest = getDistanceBetweenPoints(userLat, userLng, destination.lat, destination.lng);

        // Calculate progress percentage
        const totalDist = route.distance;
        const progressPct = 1 - (distToDest / totalDist);

        // Estimate which step we're on based on progress
        const estimatedStep = Math.floor(progressPct * route.steps.length);
        if (estimatedStep > currentStepIndex && estimatedStep < route.steps.length) {
            setCurrentStepIndex(estimatedStep);
        }
    }, [route, currentStepIndex, destination]);

    // Start real-time tracking
    const startNavigation = useCallback(() => {
        if (!navigator.geolocation) {
            setError("Geolocalização não suportada");
            return;
        }

        setIsNavigating(true);
        setHasArrived(false);
        setCurrentStepIndex(0);

        // Watch position for real-time updates
        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const newLoc = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setUserLocation(newLoc);
                updateRemainingDistance(newLoc.lat, newLoc.lng);
                updateCurrentStep(newLoc.lat, newLoc.lng);
            },
            (err) => {
                console.error("Erro GPS:", err);
                setError("Erro ao rastrear localização");
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 1000 // Update every second
            }
        );
    }, [updateRemainingDistance, updateCurrentStep]);

    // Stop navigation
    const stopNavigation = useCallback(() => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setIsNavigating(false);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopNavigation();
        };
    }, [stopNavigation]);

    // Get initial location
    useEffect(() => {
        if (!isOpen) return;

        setGettingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const loc = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setUserLocation(loc);
                    setRemainingDistance(getDistanceBetweenPoints(loc.lat, loc.lng, destination.lat, destination.lng));
                    setGettingLocation(false);
                },
                (err) => {
                    console.error("Erro ao obter localização:", err);
                    setError("Não foi possível obter sua localização.");
                    setGettingLocation(false);
                },
                { enableHighAccuracy: true }
            );
        } else {
            setError("Geolocalização não suportada");
            setGettingLocation(false);
        }
    }, [isOpen, destination]);

    // Initialize map
    useEffect(() => {
        if (!isOpen || !mapRef.current) return;

        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
        }

        const map = L.map(mapRef.current).setView([destination.lat, destination.lng], 15);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OSM"
        }).addTo(map);

        // Destination marker
        const destIcon = L.divIcon({
            className: "dest-marker",
            html: `<div style="background: #ef4444; color: white; padding: 6px 10px; border-radius: 16px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.3); font-size: 12px;">📍 ${destination.name.substring(0, 15)}</div>`,
            iconAnchor: [40, 35]
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

    // Update user marker position
    useEffect(() => {
        if (!mapInstanceRef.current || !userLocation) return;

        const userIcon = L.divIcon({
            className: "user-marker",
            html: '<div style="width: 20px; height: 20px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
            iconAnchor: [10, 10]
        });

        if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
        } else {
            userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(mapInstanceRef.current);

            // Fit bounds
            const bounds = L.latLngBounds(
                [userLocation.lat, userLocation.lng],
                [destination.lat, destination.lng]
            );
            mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
        }

        // Center on user if navigating
        if (isNavigating) {
            mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 17);
        }
    }, [userLocation, destination, isNavigating]);

    // Calculate route
    const calculateRoute = useCallback(async () => {
        if (!userLocation) return;

        setLoading(true);
        setError(null);

        try {
            const routeData = await getDirections(userLocation, destination, profile);
            setRoute(routeData);
            setRemainingDistance(routeData.distance);

            // Draw route
            if (mapInstanceRef.current && routeData.geometry?.coordinates) {
                if (routeLayerRef.current) {
                    mapInstanceRef.current.removeLayer(routeLayerRef.current);
                }

                const coords = routeData.geometry.coordinates.map(
                    (c: [number, number]) => [c[1], c[0]] as [number, number]
                );
                routeLayerRef.current = L.polyline(coords, {
                    color: profile === "driving-car" ? "#3b82f6" : profile === "cycling-regular" ? "#10b981" : "#8b5cf6",
                    weight: 6,
                    opacity: 0.9
                }).addTo(mapInstanceRef.current);
            }
        } catch (err: any) {
            console.error("Erro rota:", err);
            setError("Erro ao calcular rota");
        } finally {
            setLoading(false);
        }
    }, [userLocation, destination, profile]);

    // Recalculate when location or profile changes
    useEffect(() => {
        if (userLocation && !route) {
            calculateRoute();
        }
    }, [userLocation, calculateRoute, route]);

    useEffect(() => {
        if (userLocation) {
            calculateRoute();
        }
    }, [profile]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "#1a1a1a",
                zIndex: 9999,
                display: "flex",
                flexDirection: "column"
            }}
        >
            {/* Header */}
            <div style={{
                padding: "0.75rem 1rem",
                background: isNavigating ? "#10b981" : "var(--bg-card)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: "1rem", color: isNavigating ? "white" : "inherit" }}>
                        {hasArrived ? "🎉 Você chegou!" : isNavigating ? "🧭 Navegando..." : "📍 Como Chegar"}
                    </h2>
                    <p style={{ margin: 0, fontSize: "0.8rem", opacity: 0.8, color: isNavigating ? "white" : "var(--text-secondary)" }}>
                        {destination.name}
                    </p>
                </div>
                <button
                    onClick={() => { stopNavigation(); onClose(); }}
                    style={{
                        background: "rgba(255,255,255,0.2)",
                        border: "none",
                        color: "white",
                        fontSize: "1.2rem",
                        cursor: "pointer",
                        padding: "0.5rem",
                        borderRadius: "50%"
                    }}
                >
                    ✕
                </button>
            </div>

            {/* Current Instruction (when navigating) */}
            {isNavigating && currentStep && !hasArrived && (
                <div style={{
                    padding: "1rem",
                    background: "#2563eb",
                    color: "white"
                }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "0.25rem" }}>
                        {currentStep.instruction}
                    </div>
                    {nextStep && (
                        <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                            Depois: {nextStep.instruction}
                        </div>
                    )}
                </div>
            )}

            {/* Transport Mode (when not navigating) */}
            {!isNavigating && (
                <div style={{
                    padding: "0.5rem 1rem",
                    background: "var(--bg-card)",
                    display: "flex",
                    gap: "0.5rem",
                    justifyContent: "center"
                }}>
                    {[
                        { id: "foot-walking" as NavigationProfile, icon: "🚶", label: "A pé" },
                        { id: "driving-car" as NavigationProfile, icon: "🚗", label: "Carro" },
                        { id: "cycling-regular" as NavigationProfile, icon: "🚴", label: "Bike" }
                    ].map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setProfile(mode.id)}
                            style={{
                                padding: "0.4rem 0.8rem",
                                borderRadius: "16px",
                                border: profile === mode.id ? "2px solid var(--primary)" : "1px solid #444",
                                background: profile === mode.id ? "var(--primary)" : "transparent",
                                color: profile === mode.id ? "#000" : "white",
                                cursor: "pointer",
                                fontSize: "0.9rem"
                            }}
                        >
                            {mode.icon} {mode.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Map */}
            <div ref={mapRef} style={{ flex: 1, minHeight: "200px" }} />

            {/* Bottom Panel */}
            <div style={{
                padding: "1rem",
                background: "var(--bg-card)",
                borderTop: "1px solid #333"
            }}>
                {gettingLocation ? (
                    <p style={{ textAlign: "center" }}>📡 Obtendo localização...</p>
                ) : error ? (
                    <p style={{ textAlign: "center", color: "#ef4444" }}>{error}</p>
                ) : loading ? (
                    <p style={{ textAlign: "center" }}>🔄 Calculando rota...</p>
                ) : hasArrived ? (
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎉</div>
                        <p style={{ fontWeight: "bold", marginBottom: "1rem" }}>Você chegou ao destino!</p>
                        <button className="btn btn-primary" onClick={() => { stopNavigation(); onClose(); }}>
                            Fechar
                        </button>
                    </div>
                ) : (
                    <div>
                        {/* Distance & Time */}
                        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "1rem" }}>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "var(--primary)" }}>
                                    {formatDistance(isNavigating ? remainingDistance : (route?.distance || 0))}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                                    {isNavigating ? "Restante" : "Distância"}
                                </div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "var(--primary)" }}>
                                    {formatDuration(route?.duration || 0)}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                                    Tempo est.
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            {!isNavigating ? (
                                <>
                                    <button
                                        className="btn btn-primary"
                                        style={{ flex: 1 }}
                                        onClick={startNavigation}
                                    >
                                        🚀 Iniciar Navegação
                                    </button>
                                    <a
                                        href={getGoogleMapsUrl(destination.lat, destination.lng, profile === "driving-car" ? "driving" : "walking")}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary"
                                        style={{ padding: "0.75rem" }}
                                    >
                                        🗺️
                                    </a>
                                </>
                            ) : (
                                <button
                                    className="btn btn-secondary"
                                    style={{ flex: 1 }}
                                    onClick={stopNavigation}
                                >
                                    ⏹️ Parar Navegação
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
