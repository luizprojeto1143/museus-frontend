import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, ImageOverlay, Marker, Popup, useMap, Circle } from "react-leaflet";
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
    indoorBounds = [[0, 0], [1000, 1000]],
    pois
}) => {
    const [mode, setMode] = useState<MapMode>("outdoor");
    const [zoom] = useState(15);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);

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

    return (
        <div style={{ position: "relative", height: "500px", width: "100%", borderRadius: "1rem", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
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
                    gap: "0.5rem"
                }}
            >
                <button
                    onClick={() => setMode("outdoor")}
                    className={`btn ${mode === "outdoor" ? "btn-primary" : "btn-secondary"}`}
                    style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}
                >
                    🏙️ Cidade
                </button>
                <button
                    onClick={() => setMode("indoor")}
                    className={`btn ${mode === "indoor" ? "btn-primary" : "btn-secondary"}`}
                    style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}
                >
                    🏛️ Planta
                </button>
            </div>

            <MapContainer
                center={outdoorCenter}
                zoom={zoom}
                style={{ height: "100%", width: "100%", background: "#e5e7eb" }}
                scrollWheelZoom={true}
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
                        <ChangeView center={[500, 500]} zoom={0} />
                        {indoorImageUrl ? (
                            <ImageOverlay
                                url={indoorImageUrl}
                                bounds={indoorBounds}
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
                        {/* Indoor Markers */}
                        {pois.map(poi => (
                            <Marker key={poi.id} position={[poi.lat, poi.lng]}>
                                <Popup>
                                    <b>{poi.title}</b><br />
                                    {poi.description}
                                </Popup>
                            </Marker>
                        ))}
                    </>
                )}
            </MapContainer>
        </div>
    );
};
