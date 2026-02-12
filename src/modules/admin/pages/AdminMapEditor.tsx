import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Search, Save, Map as MapIcon, Info } from "lucide-react";

// Fix Leaflet Default Icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Work {
    id: string;
    title: string;
    latitude?: number;
    longitude?: number;
    description?: string;
    coverImage?: string;
}

// Component to handle clicks on map
const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click: (e) => {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

export const AdminMapEditor: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [works, setWorks] = useState<Work[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([-22.9068, -43.1729]); // Default Rio

    useEffect(() => {
        if (!tenantId) return;

        const loadData = async () => {
            try {
                const [worksRes, settingsRes] = await Promise.all([
                    api.get("/works", { params: { tenantId } }),
                    api.get(`/tenants/${tenantId}/settings`)
                ]);

                setWorks(Array.isArray(worksRes.data) ? worksRes.data : (worksRes.data.data || []));

                // Set map center if tenant has coordinates
                if (settingsRes.data.latitude && settingsRes.data.longitude) {
                    setMapCenter([settingsRes.data.latitude, settingsRes.data.longitude]);
                }
            } catch (error) {
                console.error("Error loading data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [tenantId]);


    const handleMapClick = (lat: number, lng: number) => {
        if (!selectedWorkId) return;

        setWorks(prev => prev.map(w =>
            w.id === selectedWorkId
                ? { ...w, latitude: lat, longitude: lng }
                : w
        ));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates = works.map(w => api.put(`/works/${w.id}`, {
                latitude: w.latitude,
                longitude: w.longitude
            }));

            await Promise.all(updates);
            alert("Localizações salvas com sucesso!");
        } catch (error) {
            console.error("Error saving pins", error);
            alert("Erro ao salvar posições.");
        } finally {
            setSaving(false);
        }
    };

    const filteredWorks = works.filter(w =>
        w.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
        </div>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] gap-4">
            {/* Header */}
            <div className="flex justify-between items-center bg-surface-dark p-4 rounded-xl border border-white/10">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <MapIcon className="text-gold-500" />
                        Editor de Mapa da Cidade
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Selecione uma obra na lista e clique no mapa para definir sua localização real.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gold-500 hover:bg-gold-400 text-black font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save size={20} />
                    {saving ? "Salvando..." : "Salvar Alterações"}
                </button>
            </div>

            <div className="flex flex-1 gap-4 overflow-hidden">
                {/* Sidebar List */}
                <div className="w-80 flex flex-col bg-surface-dark border border-white/10 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar obra..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/50"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {filteredWorks.map(w => {
                            const hasLocation = w.latitude != null && w.longitude != null;
                            const isSelected = selectedWorkId === w.id;

                            return (
                                <div
                                    key={w.id}
                                    onClick={() => setSelectedWorkId(w.id)}
                                    className={`p-3 rounded-lg cursor-pointer transition-all border ${isSelected
                                        ? "bg-gold-500/20 border-gold-500/50"
                                        : "bg-white/5 border-transparent hover:bg-white/10"
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`font-medium ${isSelected ? "text-gold-400" : "text-slate-200"}`}>
                                            {w.title}
                                        </span>
                                        {hasLocation && (
                                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <MapIcon size={12} />
                                                No Mapa
                                            </span>
                                        )}
                                    </div>
                                    {isSelected && (
                                        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1 animate-fadeIn">
                                            <Info size={12} />
                                            Clique no mapa para posicionar
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                        {filteredWorks.length === 0 && (
                            <div className="text-center py-8 text-slate-500">
                                Nenhuma obra encontrada.
                            </div>
                        )}
                    </div>
                </div>

                {/* Map Container */}
                <div className="flex-1 bg-black/20 rounded-xl overflow-hidden border border-white/10 relative">
                    <MapContainer
                        center={mapCenter}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                        className="z-0"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <MapClickHandler onMapClick={handleMapClick} />

                        {works.map(w => (
                            w.latitude && w.longitude && (
                                <Marker
                                    key={w.id}
                                    position={[w.latitude, w.longitude]}
                                    eventHandlers={{
                                        click: () => setSelectedWorkId(w.id),
                                    }}
                                    opacity={selectedWorkId === w.id ? 1 : 0.7}
                                >
                                    <Popup>
                                        <div className="text-slate-900 font-bold p-1">
                                            {w.title}
                                            {selectedWorkId === w.id && (
                                                <div className="text-xs text-slate-500 font-normal mt-1">
                                                    (Selecionado)
                                                </div>
                                            )}
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        ))}
                    </MapContainer>

                    {/* Instruction Overlay */}
                    {!selectedWorkId && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm border border-white/10 z-[1000] pointer-events-none">
                            Selecione uma obra na lista lateral para começar
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
