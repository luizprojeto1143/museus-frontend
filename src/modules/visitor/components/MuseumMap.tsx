import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ImageOverlay, Circle, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default icon issue in Leaflet + React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

type MapMode = "outdoor" | "indoor";

interface POI {
    id: string;
    title: string;
    lat: number;
    lng: number;
    description?: string;
}

interface MuseumMapProps {
    outdoorCenter: [number, number]; // [lat, lng]
    indoorImageUrl?: string;
    indoorBounds?: [[number, number], [number, number]]; // [[lat, lng], [lat, lng]]
    pois: POI[];
}

// Component helper to change view
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

// Haversine formula to calculate distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

export const MuseumMap: React.FC<MuseumMapProps> = ({
    outdoorCenter,
    indoorImageUrl,
    // indoorBounds not used in current implementation
    pois
}) => {
    const [mode, setMode] = useState<MapMode>("outdoor");
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
    const [aspectRatio, setAspectRatio] = useState<number>(1);

    useEffect(() => {
        if (mode === "indoor" && indoorImageUrl) {
            const img = new Image();
            img.src = indoorImageUrl;
            img.onload = () => {
                if (img.width && img.height) {
                    setAspectRatio(img.width / img.height);
                }
            };
        }
    }, [mode, indoorImageUrl]);

    // Toggle mode handler removed as it was unused (buttons set mode directly)

    useEffect(() => {
        if (mode === "outdoor" && "geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude, accuracy } = position.coords;
                    setUserLocation({ lat: latitude, lng: longitude, accuracy });
                },
                (error) => console.error("Erro ao obter localização", error),
                { enableHighAccuracy: true }
            );
        }
    }, [mode]);

    // Add Polyline support
    const [destinationId, setDestinationId] = useState<string | null>(null);

    // Simple mocked graph/routes for demo purposes
    // In a real app, this would use a graph algorithm (Dijkstra)
    const getRouteTo = (destId: string): [number, number][] => {
        const dest = pois.find(p => p.id === destId);
        if (!dest) return [];

        // Mock route: Center -> Random Point -> Destination
        // Assuming starting point is "Center" or User Location
        const start = outdoorCenter;
        const midPoint: [number, number] = [
            (start[0] + dest.lat) / 2,
            (start[1] + dest.lng) / 2 + 0.0005 // Little curve
        ];

        return [start, midPoint, [dest.lat, dest.lng]];
    };

    return (
        <div style={{
            position: "relative",
            width: "100%",
            aspectRatio: mode === "indoor" ? `${aspectRatio}` : "auto",
            height: mode === "indoor" ? "auto" : "500px",
            borderRadius: "1rem",
            overflow: "hidden",
            border: "1px solid var(--border-subtle)"
        }}>
            {/* Controls */}
            <div
                style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    zIndex: 1000,
                    background: "var(--bg-card)",
                    padding: "0.5rem",
                    borderRadius: "0.5rem",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    alignItems: "flex-end"
                }}
            >
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                        onClick={() => setMode("outdoor")}
                        className={`btn ${mode === "outdoor" ? "btn-primary" : "btn-secondary"} `}
                        style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}
                    >
                        🏙️ Cidade
                    </button>
                    <button
                        onClick={() => setMode("indoor")}
                        className={`btn ${mode === "indoor" ? "btn-primary" : "btn-secondary"} `}
                        style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}
                    >
                        🏛️ Planta
                    </button>
                </div>

                {/* Destination Selector for Wayfinding Demo */}
                {mode === "indoor" && pois.length > 0 && (
                    <select
                        className="input"
                        style={{ fontSize: "0.8rem", padding: "0.25rem", width: "150px" }}
                        onChange={(e) => setDestinationId(e.target.value)}
                        value={destinationId || ""}
                    >
                        <option value="">🎯 Ir para...</option>
                        {pois.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                )}
            </div>

            <MapContainer
                center={mode === "outdoor" ? outdoorCenter : [50, 50]}
                zoom={mode === "outdoor" ? 15 : 1}
                scrollWheelZoom={true}
                style={{ width: "100%", height: "100%", borderRadius: "1rem" }}
                crs={mode === "outdoor" ? L.CRS.EPSG3857 : L.CRS.Simple}
            >
                {mode === "outdoor" ? (
                    <>
                        <ChangeView center={outdoorCenter} zoom={15} />
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {/* Outdoor Markers */}
                        <Marker position={outdoorCenter}>
                            <Popup>
                                <b>Museu Principal</b><br />
                                Você está aqui.
                            </Popup>
                        </Marker>

                        {/* User Location */}
                        {userLocation && (
                            <>
                                <Marker position={[userLocation.lat, userLocation.lng]} icon={new L.Icon({
                                    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
                                    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
                                    iconSize: [25, 41],
                                    iconAnchor: [12, 41],
                                    popupAnchor: [1, -34],
                                    shadowSize: [41, 41]
                                })}>
                                    <Popup>
                                        <b>Sua Localização</b><br />
                                        Precisão: {Math.round(userLocation.accuracy)}m<br />
                                        Distância do Museu: {calculateDistance(userLocation.lat, userLocation.lng, outdoorCenter[0], outdoorCenter[1]).toFixed(2)} km
                                    </Popup>
                                </Marker>
                                <Circle
                                    center={[userLocation.lat, userLocation.lng]}
                                    radius={userLocation.accuracy}
                                    pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
                                />
                            </>
                        )}
                    </>
                ) : (
                    <>
                        {indoorImageUrl ? (
                            <ImageOverlay
                                url={indoorImageUrl}
                                bounds={[[0, 0], [100, 100]]}
                            />
                        ) : (
                            <div style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                zIndex: 1000,
                                color: "#333",
                                textAlign: "center"
                            }}>
                                <p>Imagem da planta não configurada.</p>
                            </div>
                        )}
                        {/* Indoor Markers: Filter POIs that have internal coordinates */}
                        {pois.filter(p => p.lat != null && p.lng != null).map(poi => {
                            // If we use 0-100 logic, poi.lat is y, poi.lng is x.
                            // Ensure they are within bounds or logic matches AdminMapEditor
                            return (
                                <Marker key={poi.id} position={[poi.lat, poi.lng]}>
                                    <Popup>
                                        <b>{poi.title}</b><br />
                                        {poi.description}
                                        <button
                                            className="btn btn-sm btn-primary"
                                            style={{ marginTop: "0.5rem", width: "100%" }}
                                            onClick={() => setDestinationId(poi.id)}
                                        >
                                            Ir para cá 🏃
                                        </button>
                                    </Popup>
                                </Marker>
                            );
                        })}

                        {/* Route Line */}
                        {destinationId && (
                            <Polyline
                                positions={getRouteTo(destinationId)}
                                color="blue"
                                dashArray={[10, 10]}
                                weight={4}
                            />
                        )}
                    </>
                )}
            </MapContainer>
        </div>
    );
};
