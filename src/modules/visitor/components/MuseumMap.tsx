import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ImageOverlay, Circle, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Building, Map as MapIcon } from "lucide-react";
import "./MuseumMap.css";

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
    outdoorCenter: [number, number];
    indoorImageUrl?: string;
    indoorBounds?: [[number, number], [number, number]];
    pois: POI[];
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

export const MuseumMap: React.FC<MuseumMapProps> = ({
    outdoorCenter,
    indoorImageUrl,
    pois
}) => {
    const [mode, setMode] = useState<MapMode>("outdoor");
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
    const [aspectRatio, setAspectRatio] = useState<number>(1);
    const [destinationId, setDestinationId] = useState<string | null>(null);

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

    const getRouteTo = (destId: string): [number, number][] => {
        const dest = pois.find(p => p.id === destId);
        if (!dest) return [];

        const start = outdoorCenter;
        const midPoint: [number, number] = [
            (start[0] + dest.lat) / 2,
            (start[1] + dest.lng) / 2 + 0.0005
        ];

        return [start, midPoint, [dest.lat, dest.lng]];
    };

    return (
        <div
            className={`museum-map-container ${mode === 'outdoor' ? 'outdoor' : ''}`}
            style={{
                aspectRatio: mode === "indoor" ? `${aspectRatio}` : "auto",
                height: mode === "indoor" ? "auto" : undefined
            }}
        >
            {/* Controls */}
            <div className="museum-map-controls">
                <div className="museum-map-mode-btns">
                    <button
                        onClick={() => setMode("outdoor")}
                        className={`museum-map-mode-btn ${mode === "outdoor" ? 'active' : 'inactive'}`}
                    >
                        <MapIcon size={16} /> Cidade
                    </button>
                    <button
                        onClick={() => setMode("indoor")}
                        className={`museum-map-mode-btn ${mode === "indoor" ? 'active' : 'inactive'}`}
                    >
                        <Building size={16} /> Planta
                    </button>
                </div>

                {mode === "indoor" && pois.length > 0 && (
                    <select
                        className="museum-map-destination-select"
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
                        <Marker position={outdoorCenter}>
                            <Popup>
                                <div className="museum-map-popup">
                                    <p className="museum-map-popup-title">Museu Principal</p>
                                    <p className="museum-map-popup-desc">Você está aqui.</p>
                                </div>
                            </Popup>
                        </Marker>

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
                                        <div className="museum-map-popup">
                                            <p className="museum-map-popup-title">Sua Localização</p>
                                            <p className="museum-map-popup-desc">
                                                Precisão: {Math.round(userLocation.accuracy)}m<br />
                                                Distância: {calculateDistance(userLocation.lat, userLocation.lng, outdoorCenter[0], outdoorCenter[1]).toFixed(2)} km
                                            </p>
                                        </div>
                                    </Popup>
                                </Marker>
                                <Circle
                                    center={[userLocation.lat, userLocation.lng]}
                                    radius={userLocation.accuracy}
                                    pathOptions={{ color: '#d4af37', fillColor: '#d4af37', fillOpacity: 0.1 }}
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
                            <div className="museum-map-no-image">
                                <p>Imagem da planta não configurada.</p>
                            </div>
                        )}
                        {pois.filter(p => p.lat != null && p.lng != null).map(poi => (
                            <Marker key={poi.id} position={[poi.lat, poi.lng]}>
                                <Popup>
                                    <div className="museum-map-popup">
                                        <p className="museum-map-popup-title">{poi.title}</p>
                                        {poi.description && <p className="museum-map-popup-desc">{poi.description}</p>}
                                        <button
                                            className="museum-map-popup-btn"
                                            onClick={() => setDestinationId(poi.id)}
                                        >
                                            Ir para cá 🏃
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                        {destinationId && (
                            <Polyline
                                positions={getRouteTo(destinationId)}
                                color="#d4af37"
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
