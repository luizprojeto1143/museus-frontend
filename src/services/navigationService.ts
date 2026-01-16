import { api } from "../api/client";

export interface NavigationRoute {
    type: "route" | "direct";
    distance: number; // metros
    duration: number; // segundos
    geometry: {
        type: string;
        coordinates: [number, number][];
    };
    steps: NavigationStep[];
}

export interface NavigationStep {
    instruction: string;
    distance: number;
    duration: number;
    type?: number;
    name?: string;
}

export type NavigationProfile = "foot-walking" | "driving-car" | "cycling-regular";

export async function getDirections(
    start: { lat: number; lng: number },
    end: { lat: number; lng: number },
    profile: NavigationProfile = "foot-walking"
): Promise<NavigationRoute> {
    const response = await api.post("/navigation/directions", {
        start: [start.lng, start.lat],
        end: [end.lng, end.lat],
        profile
    });
    return response.data;
}

export function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
    if (seconds < 60) {
        return "< 1 min";
    }
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
        return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
}

export function getGoogleMapsUrl(
    destLat: number,
    destLng: number,
    travelMode: "walking" | "driving" = "walking"
): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=${travelMode}`;
}
