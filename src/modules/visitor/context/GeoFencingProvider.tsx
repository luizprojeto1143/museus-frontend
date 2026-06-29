import { logger } from "@/utils/logger";
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useIsCityMode } from "../../auth/TenantContext";
import { getFullUrl } from "../../../utils/url";
import { ProximityAlert, ProximityAlertData } from "../components/ProximityAlert";

type GeoContextType = {
    userLocation: { lat: number; lng: number } | null;
    permission: "granted" | "denied" | "prompt";
    activeAlerts: ProximityAlertData[];
    dismissAlert: (id: string) => void;
    dismissAllAlerts: () => void;
};

const GeoContext = createContext<GeoContextType>({
    userLocation: null,
    permission: "prompt",
    activeAlerts: [],
    dismissAlert: () => { },
    dismissAllAlerts: () => { },
});

export const useGeoFencing = () => useContext(GeoContext);

type GeoPoint = {
    id: string;
    type: 'work' | 'museum' | 'point';
    title: string;
    subtitle?: string;
    latitude: number;
    longitude: number;
    radius?: number;
    imageUrl?: string;
    url: string;
};

export const GeoFencingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { tenantId } = useAuth();
    const isCityModeFromContext = useIsCityMode();
    // In discovery mode (no tenant selected), we treat it as city mode to notify about nearby museums
    const isCityMode = isCityModeFromContext || !tenantId; 

    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [permission, setPermission] = useState<"granted" | "denied" | "prompt">("prompt");
    const [geoPoints, setGeoPoints] = useState<GeoPoint[]>([]);
    const [notifiedPoints, setNotifiedPoints] = useState<Set<string>>(new Set());
    const [activeAlerts, setActiveAlerts] = useState<ProximityAlertData[]>([]);

    // Refs for stale closure prevention
    const geoPointsRef = useRef(geoPoints);
    const notifiedPointsRef = useRef(notifiedPoints);
    const userLocationRef = useRef(userLocation);

    // Sync refs
    useEffect(() => { geoPointsRef.current = geoPoints; }, [geoPoints]);
    useEffect(() => { notifiedPointsRef.current = notifiedPoints; }, [notifiedPoints]);
    useEffect(() => { userLocationRef.current = userLocation; }, [userLocation]);

    // Haversine distance formula
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3; // metres
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    const triggerNotification = useCallback((point: GeoPoint, distance: number) => {
        // Browser Notification (Push)
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            const typeLabel = point.type === 'museum' ? 'museu' : point.type === 'point' ? 'ponto turístico' : 'obra';
            new Notification(`Você está perto de um ${typeLabel}!`, {
                body: `"${point.title}" está a ${Math.round(distance)}m de você.`,
                icon: point.imageUrl || "/pwa-192x192.png",
                tag: point.id, // Prevents duplicate notifications
                // @ts-ignore
                renotify: false
            });
        } else if (typeof Notification !== "undefined" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }

        // In-App Alert
        const alertData: ProximityAlertData = {
            id: point.id,
            type: point.type,
            title: point.title,
            subtitle: point.subtitle,
            imageUrl: (point.imageUrl ? getFullUrl(point.imageUrl) : undefined) ?? undefined,
            distance,
            url: point.url
        };

        setActiveAlerts(prev => {
            // Don't add duplicate
            if (prev.some(a => a.id === point.id)) return prev;
            return [...prev, alertData];
        });

        // Optional: Vibrate
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

        // Auto-dismiss after 15 seconds
        setTimeout(() => {
            setActiveAlerts(prev => prev.filter(a => a.id !== point.id));
        }, 15000);
    }, []);

    const checkProximity = useCallback((lat: number, lng: number) => {
        geoPointsRef.current.forEach((point) => {
            if (notifiedPointsRef.current.has(point.id)) return;

            const distance = calculateDistance(lat, lng, point.latitude, point.longitude);
            const radius = point.radius || 50; // Default 50 meters

            if (distance <= radius) {
                triggerNotification(point, distance);
                setNotifiedPoints((prev) => new Set(prev).add(point.id));
            }
        });
    }, [triggerNotification]);

    const loadGeoPoints = useCallback(async () => {
        const points: GeoPoint[] = [];

        try {
            if (isCityMode) {
                // City Mode: Load all cultural equipments with coordinates
                const equipRes = await api.get("/equipamentos/public");
                const equipments = Array.isArray(equipRes.data) ? equipRes.data : [];

                equipments.forEach((item: { id: string; nome: string; lat?: number; lng?: number; logoUrl?: string | null }) => {
                    if (typeof item.lat === 'number' && typeof item.lng === 'number') {
                        points.push({
                            id: `equip-${item.id}`,
                            type: 'museum',
                            title: item.nome,
                            subtitle: 'Equipamento Cultural',
                            latitude: item.lat,
                            longitude: item.lng,
                            radius: 100,
                            imageUrl: item.logoUrl || undefined,
                            url: `/select-museum?select=${item.id}`
                        });
                    }
                });
            }

            if (tenantId) {
                // L2 Fix: Load ONLY works that are marked as vestiges to avoid museum-wide alerts
                const worksRes = await api.get(`/works?tenantId=${tenantId}&vestigeActive=true`);
                const worksArray = Array.isArray(worksRes.data)
                    ? worksRes.data
                    : (worksRes.data?.data || worksRes.data?.works || []);

                worksArray.forEach((w: any) => {
                    const finalLat = w.lat ?? w.latitude;
                    const finalLng = w.lng ?? w.longitude;

                    if (typeof finalLat === 'number' && typeof finalLng === 'number') {
                        points.push({
                            id: `work-${w.id}`,
                            type: 'work',
                            title: w.title,
                            subtitle: w.artist,
                            latitude: finalLat,
                            longitude: finalLng,
                            radius: w.captureRadiusM || (w.room || w.floor || w.equipamentoId ? 3 : (w.vestigeActive ? 20 : 10)),
                            imageUrl: w.imageUrl || undefined,
                            url: w.vestigeActive ? `/vestigios/capturar/${w.id}` : `/obras/${w.id}`
                        });
                    }
                });
            }

            setGeoPoints(points);
        } catch (err: any) {
            logger.error("Failed to load geo points", err);
            setGeoPoints([]);
        }
    }, [tenantId, isCityMode]);

    // Dismiss handlers
    const dismissAlert = useCallback((id: string) => {
        setActiveAlerts(prev => prev.filter(a => a.id !== id));
    }, []);

    const dismissAllAlerts = useCallback(() => {
        setActiveAlerts([]);
    }, []);

    // Storage listener — apenas para sincronização cross-tab
    // (not needed for same-tab changes; useAuth() handles that reactively)
    useEffect(() => {
        const handleStorageChange = () => {
            // Cross-tab: recarregar pontos se tenantId mudou
            loadGeoPoints();
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [loadGeoPoints]);

    // Load geo points when auth changes
    useEffect(() => {
        loadGeoPoints();
    }, [loadGeoPoints]);

    // Check proximity when points change
    useEffect(() => {
        if (userLocationRef.current) {
            checkProximity(userLocationRef.current.lat, userLocationRef.current.lng);
        }
    }, [geoPoints, checkProximity]);

    // Geolocation Watcher
    useEffect(() => {
        if (!navigator.geolocation) {
            logger.warn("Geolocation not supported");
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setPermission("granted");
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });
                checkProximity(latitude, longitude);
            },
            (error) => {
                logger.warn("Geolocation error", error);
                if (error.code === error.PERMISSION_DENIED) {
                    setPermission("denied");
                }
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [checkProximity]);

    return (
        <GeoContext.Provider value={{
            userLocation,
            permission,
            activeAlerts,
            dismissAlert,
            dismissAllAlerts
        }}>
            {children}
            {/* Render alerts globally */}
            <ProximityAlert
                alerts={activeAlerts}
                onDismiss={dismissAlert}
                onDismissAll={dismissAllAlerts}
            />
        </GeoContext.Provider>
    );
};
