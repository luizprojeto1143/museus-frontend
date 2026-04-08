import { useTranslation } from "react-i18next";
import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ImageOverlay, Circle, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import L from "leaflet";
import "leaflet.markercluster";
import { Building, Map as MapIcon } from "lucide-react";
import "./MuseumMap.css";

// Local assets from public folder
const icon = "/images/leaflet/marker-icon.png";
const iconShadow = "/images/leaflet/marker-shadow.png";

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const VestigeIcon = L.divIcon({
    className: 'vestige-map-marker',
    html: '<div style="width:20px;height:20px;background:#d4af37;border-radius:50%;border:3px solid #fff;box-shadow:0 0 12px rgba(212,175,55,0.6)"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

type MapMode = "outdoor" | "indoor";

interface POI {
    id: string;
    title: string;
    lat: number;
    lng: number;
    description?: string;
    type?: string;
    vestigeActive?: boolean;
}

interface MuseumMapProps {
    outdoorCenter: [number, number];
    indoorImageUrl?: string;
    indoorBounds?: [[number, number], [number, number]];
    pois: POI[];
    initialPoiId?: string | null;
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

/** Renders a MarkerClusterGroup for outdoor POIs */
function ClusteredMarkers({ pois, vestigeIcon, defaultIcon }: {
    pois: POI[];
    vestigeIcon: L.DivIcon;
    defaultIcon: L.Icon;
}) {
    const map = useMap();
    const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

    useEffect(() => {
        const { t: _t } = { t: (k: string, d: string) => d }; // local fallback
        if (!map) return;

        // Remove existing cluster group
        if (clusterGroupRef.current) {
            map.removeLayer(clusterGroupRef.current);
        }

        // Create new cluster group
        const clusterGroup = L.markerClusterGroup({
            showCoverageOnHover: false,
            maxClusterRadius: 60,
            iconCreateFunction: (cluster) => {
                const count = cluster.getChildCount();
                const size = count < 10 ? 36 : count < 50 ? 44 : 52;
                return L.divIcon({
                    html: `<div style="
                        width:${size}px;height:${size}px;
                        background:linear-gradient(135deg,#d4af37,#cd7f32);
                        border-radius:50%;
                        display:flex;align-items:center;justify-content:center;
                        color:#000;font-weight:900;font-size:${size < 44 ? 13 : 15}px;
                        box-shadow:0 4px 16px rgba(212,175,55,0.5);
                        border:2px solid rgba(255,255,255,0.4);
                    ">${count}</div>`,
                    className: "",
                    iconSize: [size, size],
                    iconAnchor: [size / 2, size / 2],
                });
            },
        });

        // Add markers to cluster
        pois
            .filter(p => p.lat != null && p.lng != null)
            .forEach(poi => {
                const marker = L.marker(
                    [poi.lat, poi.lng],
                    { icon: poi.type === "vestige" ? vestigeIcon : defaultIcon }
                );

                const popupContent = document.createElement("div");
                popupContent.className = "museum-map-popup";
                popupContent.innerHTML = `
                    <p class="museum-map-popup-title">${poi.type === "vestige" ? "\u2728 " : ""}${poi.title}</p>
                    ${poi.description ? `<p class="museum-map-popup-desc">${poi.description}</p>` : ""}
                `;
                marker.bindPopup(popupContent);
                clusterGroup.addLayer(marker);
            });

        map.addLayer(clusterGroup);
        clusterGroupRef.current = clusterGroup;

        return () => {
            if (clusterGroupRef.current) {
                map.removeLayer(clusterGroupRef.current);
            }
        };
    }, [map, pois, vestigeIcon, defaultIcon]);

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
    pois,
    initialPoiId
}) => {
    const { t } = useTranslation();
    const [mode, setMode] = useState<MapMode>("outdoor");
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
    const [aspectRatio, setAspectRatio] = useState<number>(1);
    const [destinationId, setDestinationId] = useState<string | null>(null);

    useEffect(() => {
        if (indoorImageUrl && mode === "outdoor") {
            setMode("indoor");
        }
    }, [indoorImageUrl]);

    useEffect(() => {
        if (initialPoiId) {
            const poi = pois.find(p => p.id === initialPoiId);
            if (poi) {
                if (indoorImageUrl) {
                    setMode("indoor");
                }
                setDestinationId(initialPoiId);
            }
        }
    }, [initialPoiId, pois, indoorImageUrl]);

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
                                    <p className="museum-map-popup-desc">{t("visitor.museummap.vocEstAqui", `Você está aqui.`)}</p>
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
                                            <p className="museum-map-popup-title">{t("visitor.museummap.suaLocalizao", `Sua Localização`)}</p>
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

                        {/* Clustered outdoor POI markers */}
                        <ClusteredMarkers
                            pois={pois}
                            vestigeIcon={VestigeIcon}
                            defaultIcon={DefaultIcon}
                        />
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
                                <p>{t("visitor.museummap.imagemDaPlantaNoConfigurada", `Imagem da planta não configurada.`)}</p>
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
