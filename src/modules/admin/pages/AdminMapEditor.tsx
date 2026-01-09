import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

interface Work {
    id: string;
    title: string;
    latitude?: number; // 0-100 for indoor
    longitude?: number; // 0-100 for indoor
}

export const AdminMapEditor: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [works, setWorks] = useState<Work[]>([]);
    const [mapUrl, setMapUrl] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Selection
    const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);

    useEffect(() => {
        if (!tenantId) return;

        const loadData = async () => {
            try {
                const [worksRes, settingsRes] = await Promise.all([
                    api.get("/works", { params: { tenantId } }),
                    api.get(`/tenants/${tenantId}/settings`)
                ]);

                setWorks(worksRes.data);
                setMapUrl(settingsRes.data.mapImageUrl);
            } catch (error) {
                console.error("Error loading data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [tenantId]);

    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!selectedWorkId) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Update local state
        setWorks(prev => prev.map(w =>
            w.id === selectedWorkId
                ? { ...w, latitude: y, longitude: x } // Store indoor coords as lat/lng (0-100)
                : w
        ));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save each modified work
            // This is naive (N requests), but fine for MVP. Ideally bulk update.
            const updates = works.map(w => api.put(`/works/${w.id}`, {
                latitude: w.latitude,
                longitude: w.longitude
            }));

            await Promise.all(updates);
            alert("Pinos salvos com sucesso!");
        } catch (error) {
            console.error("Error saving pins", error);
            alert("Erro ao salvar pinos.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p>{t("common.loading")}</p>;

    return (
        <div style={{ height: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div>
                    <h1 className="section-title">📍 Editor de Pinos</h1>
                    <p className="section-subtitle">Clique em uma obra na lista e depois clique no mapa para posicioná-la.</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? "Salvando..." : "💾 Salvar Posições"}
                </button>
            </div>

            <div style={{ flex: 1, display: "flex", gap: "1rem", overflow: "hidden" }}>
                {/* Works List */}
                <div className="card" style={{ width: "300px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <h3>Obras</h3>
                    {works.map(w => {
                        const hasPos = w.latitude != null && w.longitude != null;
                        const isSelected = selectedWorkId === w.id;

                        return (
                            <div
                                key={w.id}
                                onClick={() => setSelectedWorkId(w.id)}
                                style={{
                                    padding: "0.75rem",
                                    borderRadius: "0.5rem",
                                    border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border-subtle)",
                                    background: isSelected ? "rgba(var(--primary-rgb), 0.1)" : "transparent",
                                    cursor: "pointer",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}
                            >
                                <span style={{ fontWeight: 500 }}>{w.title}</span>
                                {hasPos && <span style={{ fontSize: "0.8rem", color: "green" }}>📍</span>}
                            </div>
                        );
                    })}
                </div>

                {/* Map Area */}
                <div className="card" style={{ flex: 1, position: "relative", padding: 0, overflow: "hidden", background: "#333", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {mapUrl ? (
                        <div
                            style={{ position: "relative", width: "100%", height: "100%", maxHeight: "100%" }}
                        >
                            <img
                                src={mapUrl}
                                alt="Map"
                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            // Check if user clicked on specific position
                            />
                            {/* Overlay for clicks */}
                            <div
                                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", cursor: selectedWorkId ? "crosshair" : "default" }}
                                onClick={handleMapClick}
                            >
                                {/* Render Pins */}
                                {works.map(w => {
                                    if (w.latitude == null || w.longitude == null) return null;

                                    // Assuming lat=y (0-100), lng=x (0-100)
                                    // And assume image object-fit: contain logic matches... 
                                    // WARNING: 'object-fit: contain' creates whitespace. 
                                    // For precise mapping we need the image to fill the container OR calculate the real image rect.
                                    // For simplicity in this step, let's assume we use coordinates relative to this container overlay.

                                    return (
                                        <div
                                            key={w.id}
                                            style={{
                                                position: "absolute",
                                                top: `${w.latitude}%`,
                                                left: `${w.longitude}%`,
                                                transform: "translate(-50%, -100%)", // Pin tip logic
                                                fontSize: "1.5rem",
                                                pointerEvents: "none" // Let clicks pass through to map
                                            }}
                                        >
                                            📍
                                            <span style={{
                                                position: "absolute",
                                                top: "100%",
                                                left: "50%",
                                                transform: "translate(-50%, 0)",
                                                fontSize: "0.7rem",
                                                background: "rgba(0,0,0,0.7)",
                                                color: "white",
                                                padding: "2px 4px",
                                                borderRadius: "4px",
                                                whiteSpace: "nowrap"
                                            }}>
                                                {w.title}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div style={{ color: "white", textAlign: "center" }}>
                            <p>Nenhuma planta baixa configurada.</p>
                            <small>Vá em Configurações para adicionar uma imagem.</small>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
