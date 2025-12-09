import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
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

export const GeoFencingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { tenantId } = useAuth();
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [permission, setPermission] = useState<"granted" | "denied" | "prompt">("prompt");
    const [works, setWorks] = useState<any[]>([]);
    const [notifiedWorks, setNotifiedWorks] = useState<Set<string>>(new Set());

    const loadWorks = async () => {
        try {
            const res = await api.get(`/works?tenantId=${tenantId}`);
            // Filter works that have coordinates
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const geoWorks = res.data.filter((w: any) => w.latitude && w.longitude);
            setWorks(geoWorks);
        } catch (err) {
            console.error("Failed to load works for geofencing", err);
        }
    };

    useEffect(() => {
        if (tenantId) {
            loadWorks();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenantId]);

    const checkProximity = (lat: number, lng: number) => {
        works.forEach((work) => {
            if (notifiedWorks.has(work.id)) return;

            const distance = calculateDistance(lat, lng, work.latitude, work.longitude);
            const radius = work.radius || 5; // meters

            if (distance <= radius) {
                triggerNotification(work);
                setNotifiedWorks((prev) => new Set(prev).add(work.id));
            }
        });
    };

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [works]); // Re-run if works list updates (though works usually static per session)

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

    const triggerNotification = (work: any) => {
        // Browser Notification
        if (Notification.permission === "granted") {
            new Notification(`Você está perto de uma obra!`, {
                body: `Descubra "${work.title}" a poucos passos de você.`,
                icon: work.imageUrl || "/icon-192x192.png"
            });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((perm) => {
                if (perm === "granted") {
                    triggerNotification(work);
                }
            });
        }

        // In-app Toast (Using simple alert for now, or could use a toast library if available)
        // For a better UX, we could dispatch a custom event or use a Toast context.
        // Let's just log for now or assume a global toast exists.


        // Optional: Vibrate
        if (navigator.vibrate) navigator.vibrate(200);
    };

    return (
        <GeoContext.Provider value={{ userLocation, permission }}>
            {children}
        </GeoContext.Provider>
    );
};
