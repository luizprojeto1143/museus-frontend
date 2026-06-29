import { useTranslation } from "react-i18next";
import { logger } from "@/utils/logger";

import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ImageOverlay, Circle, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import L from "leaflet";
import "leaflet.markercluster";
import { Building, Map as MapIcon, Navigation, Target, Zap, Waves } from "lucide-react";
import "./MuseumMap.css";
import { Button, Badge, AnimateIn } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/cn";

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
    html: `
        <div class="relative flex items-center justify-center">
            <div class="absolute w-10 h-10 bg-[var(--accent-primary)]/20 rounded-full animate-ping"></div>
            <div class="relative w-5 h-5 bg-[var(--accent-primary)] rounded-full border-2 border-white shadow-[0_0_15px_rgba(212,175,55,0.8)] flex items-center justify-center">
                <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
        </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
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
                        background:linear-gradient(135deg,var(--accent-primary),var(--accent-secondary));
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
                popupContent.className = "flex flex-col gap-3 min-w-[200px] p-2";
                const titleContainer = document.createElement("div");
                titleContainer.className = "flex items-center gap-2";
                if (poi.type === "vestige") {
                    const spark = document.createElement("span");
                    spark.className = "text-gold-500";
                    spark.textContent = "✨";
                    titleContainer.appendChild(spark);
                }
                const titleNode = document.createElement("h4");
                titleNode.className = "font-black text-slate-900 tracking-tight text-lg";
                titleNode.textContent = poi.title;
                titleContainer.appendChild(titleNode);
                popupContent.appendChild(titleContainer);

                if (poi.description) {
                    const descNode = document.createElement("p");
                    descNode.className = "text-slate-600 text-xs leading-relaxed font-medium";
                    descNode.textContent = poi.description;
                    popupContent.appendChild(descNode);
                }

                const footerContainer = document.createElement("div");
                footerContainer.className = "flex items-center gap-1 mt-1";
                const typeBadge = document.createElement("span");
                typeBadge.className = "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200";
                typeBadge.textContent = poi.type || "Ponto de Interesse";
                footerContainer.appendChild(typeBadge);
                popupContent.appendChild(footerContainer);

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
                (error) => logger.error("Erro ao obter localização", error),
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
            className={cn(
                "museum-map-container relative w-full overflow-hidden rounded-[var(--radius-xl)] border-2 border-[var(--border-strong)] shadow-2xl transition-all duration-500",
                mode === 'outdoor' ? 'h-[600px]' : 'aspect-square md:aspect-video'
            )}
            style={{
                aspectRatio: mode === "indoor" ? `${aspectRatio}` : undefined,
            }}
        >
            {/* Controls Layer */}
            <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-4 items-end">
                <AnimateIn variant="fadeUp" delay={0.2}>
                    <div className="flex bg-[var(--bg-overlay)] backdrop-blur-xl p-1.5 rounded-2xl border border-[var(--border-subtle)] shadow-2xl">
                        <Button
                            variant={mode === "outdoor" ? "primary" : "ghost"}
                            size="sm"
                            onClick={() => setMode("outdoor")}
                            className="rounded-xl h-12 px-5 font-bold uppercase tracking-widest text-[10px]"
                            leftIcon={<MapIcon size={14} />}
                        >
                            Cidade
                        </Button>
                        <Button
                            variant={mode === "indoor" ? "primary" : "ghost"}
                            size="sm"
                            onClick={() => setMode("indoor")}
                            className="rounded-xl h-12 px-5 font-bold uppercase tracking-widest text-[10px]"
                            leftIcon={<Building size={14} />}
                        >
                            Planta
                        </Button>
                    </div>
                </AnimateIn>

                <AnimatePresence>
                    {mode === "indoor" && pois.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <select
                                className="bg-[var(--bg-overlay)] backdrop-blur-xl border border-[var(--border-subtle)] text-white text-xs font-bold rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--accent-primary)] shadow-2xl min-w-[180px]"
                                onChange={(e) => setDestinationId(e.target.value)}
                                value={destinationId || ""}
                            >
                                <option value="" className="bg-slate-900 text-gray-400">🎯 Ir para...</option>
                                {pois.map(p => <option key={p.id} value={p.id} className="bg-slate-900">{p.title}</option>)}
                            </select>
                        </motion.div>
                    )}
                </AnimatePresence>
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
                                <div className="p-2 min-w-[160px]">
                                    <h4 className="font-black text-slate-900 mb-1">Museu Principal</h4>
                                    <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50 text-[10px]">
                                        Você está aqui
                                    </Badge>
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
                                    pathOptions={{ 
                                        color: 'var(--accent-primary)', 
                                        fillColor: 'var(--accent-primary)', 
                                        fillOpacity: 0.1,
                                        weight: 2,
                                        dashArray: '5, 10'
                                    }}
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
                                    <div className="flex flex-col gap-3 min-w-[200px] p-2">
                                        <h4 className="font-black text-slate-900 text-lg tracking-tight">{poi.title}</h4>
                                        {poi.description && <p className="text-slate-600 text-xs font-medium leading-relaxed">{poi.description}</p>}
                                        <Button
                                            size="sm"
                                            className="w-full h-10 font-bold text-[10px] uppercase tracking-widest"
                                            onClick={() => setDestinationId(poi.id)}
                                            leftIcon={<Target size={14} />}
                                        >
                                            Ir para cá
                                        </Button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                        {destinationId && (
                            <Polyline
                                positions={getRouteTo(destinationId)}
                                color="var(--accent-primary)"
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
