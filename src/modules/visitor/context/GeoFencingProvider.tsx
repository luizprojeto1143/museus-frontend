import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { api } from "../../../api/client";

type GeoContextType = {
    userLocation: { lat: number; lng: number } | null;
    permission: "granted" | "denied" | "prompt";
};

const GeoContext = createContext<GeoContextType>({
    userLocation: null,
    permission: "prompt",
});

export const useGeoFencing = () => useContext(GeoContext);

// Helper to safely get tenantId from localStorage
const getTenantIdFromStorage = (): string | null => {
    try {
        const stored = window.localStorage.getItem("museus_auth_v1");
        if (stored) {
            const parsed = JSON.parse(stored);
            return parsed.tenantId ?? null;
        }
    } catch {
        // Ignore parse errors
    }
    return null;
};

type GeoWork = {
    id: string;
    title: string;
    latitude: number;
    longitude: number;
    radius?: number;
    imageUrl?: string;
    [key: string]: unknown; // Allow other props
};

export const GeoFencingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [permission, setPermission] = useState<"granted" | "denied" | "prompt">("prompt");
    const [works, setWorks] = useState<GeoWork[]>([]);
    const [notifiedWorks, setNotifiedWorks] = useState<Set<string>>(new Set());
    const [tenantId, setTenantId] = useState<string | null>(getTenantIdFromStorage);

    // Refs for stale closure prevention
    const worksRef = useRef(works);
    const notifiedWorksRef = useRef(notifiedWorks);
    const userLocationRef = useRef(userLocation);

    // Sync refs
    useEffect(() => { worksRef.current = works; }, [works]);
    useEffect(() => { notifiedWorksRef.current = notifiedWorks; }, [notifiedWorks]);
    useEffect(() => { userLocationRef.current = userLocation; }, [userLocation]);

    // Helpers
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

    const triggerNotification = useCallback((work: GeoWork) => {
        // Browser Notification
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification(`Você está perto de uma obra!`, {
                body: `Descubra "${work.title}" a poucos passos de você.`,
                icon: (work.imageUrl as string) || "/icon-192x192.png"
            });
        } else if (typeof Notification !== "undefined" && Notification.permission !== "denied") {
            Notification.requestPermission().then((perm) => {
                if (perm === "granted") {
                    triggerNotification(work);
                }
            });
        }

        // Optional: Vibrate
        if (navigator.vibrate) navigator.vibrate(200);
    }, []);

    const checkProximity = useCallback((lat: number, lng: number) => {
        worksRef.current.forEach((work) => {
            if (notifiedWorksRef.current.has(work.id)) return;

            const distance = calculateDistance(lat, lng, work.latitude, work.longitude);
            const radius = work.radius || 5; // meters

            if (distance <= radius) {
                triggerNotification(work);
                setNotifiedWorks((prev) => new Set(prev).add(work.id));
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [triggerNotification]); // Deps can be minimal as we use refs

    const loadWorks = useCallback(async () => {
        if (!tenantId) {
            setWorks([]);
            return;
        }

        try {
            const res = await api.get(`/works?tenantId=${tenantId}`);
            const worksArray = Array.isArray(res.data)
                ? res.data
                : (res.data?.data || res.data?.works || []);
            const geoWorks = worksArray.filter((w: unknown): w is GeoWork => {
                const work = w as GeoWork;
                return typeof work.latitude === 'number' && typeof work.longitude === 'number';
            });
            setWorks(geoWorks);
        } catch (err) {
            console.error("Failed to load works for geofencing", err);
            setWorks([]);
        }
    }, [tenantId]);

    // Effects

    // Storage listener
    useEffect(() => {
        const handleStorageChange = () => {
            setTenantId(getTenantIdFromStorage());
        };

        window.addEventListener("storage", handleStorageChange);
        const interval = setInterval(() => {
            const newTenantId = getTenantIdFromStorage();
            if (newTenantId !== tenantId) {
                setTenantId(newTenantId);
            }
        }, 1000);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            clearInterval(interval);
        };
    }, [tenantId]);

    // Load Works
    useEffect(() => {
        if (tenantId) {
            loadWorks();
        }
    }, [tenantId, loadWorks]);

    // Check when works change if we have location
    useEffect(() => {
        if (userLocationRef.current) {
            checkProximity(userLocationRef.current.lat, userLocationRef.current.lng);
        }
    }, [works, checkProximity]);

    // Geolocation Watcher
    useEffect(() => {
        if (!navigator.geolocation) {
            console.warn("Geolocation not supported");
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setPermission("granted");
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });
                // Check proximity with fresh coordinates
                checkProximity(latitude, longitude);
            },
            (error) => {
                console.warn("Geolocation error", error);
                if (error.code === error.PERMISSION_DENIED) {
                    setPermission("denied");
                }
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [checkProximity]); // checkProximity is now stable (mostly) or we rely on it

    return (
        <GeoContext.Provider value={{ userLocation, permission }}>
            {children}
        </GeoContext.Provider>
    );
};
