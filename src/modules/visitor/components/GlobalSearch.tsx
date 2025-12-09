import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Fuse from "fuse.js";
// import { api } from "../../api/client";

interface SearchResult {
    id: string;
    title: string;
    type: "work" | "artist" | "trail" | "event";
    description?: string;
    url: string;
}

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [allItems, setAllItems] = useState<SearchResult[]>([]);

    // Mock data loader - in real app, fetch from API or use react-query cache
    useEffect(() => {
        if (isOpen && allItems.length === 0) {
            // Simulating fetching all searchable items
            // In a real scenario, you might want to search via API if dataset is huge
            // or pre-load a lightweight index.
            const loadItems = async () => {
                try {
                    // Mocking data for now as we don't have a dedicated search endpoint yet
                    // and we want to demonstrate functionality immediately.
                    const mockItems: SearchResult[] = [
                        { id: "1", title: "A Noite Estrelada", type: "work", description: "Van Gogh", url: "/obras/1" },
                        { id: "2", title: "Mona Lisa", type: "work", description: "Da Vinci", url: "/obras/2" },
                        { id: "3", title: "Vincent van Gogh", type: "artist", url: "/obras?artist=Vincent van Gogh" },
                        { id: "4", title: "Impressionismo", type: "trail", description: "Trilha guiada", url: "/trilhas/1" },
                        { id: "5", title: "Workshop de Aquarela", type: "event", description: "Evento prático", url: "/eventos/1" },
                    ];
                    setAllItems(mockItems);
                } catch (error) {
                    console.error("Error loading search items", error);
                }
            };
            loadItems();
        }
    }, [isOpen, allItems.length]);

    const fuse = useMemo(() => {
        return new Fuse(allItems, {
            keys: ["title", "description", "type"],
            threshold: 0.3,
        });
    }, [allItems]);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }
        const searchResults = fuse.search(query).map((r) => r.item);
        setResults(searchResults);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, fuse]);

    const handleSelect = (url: string) => {
        navigate(url);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.8)",
                zIndex: 2000,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingTop: "5rem",
                paddingLeft: "1rem",
                paddingRight: "1rem",
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "600px",
                    backgroundColor: "var(--bg-card)",
                    borderRadius: "1rem",
                    padding: "1rem",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                    <span style={{ fontSize: "1.5rem" }}>🔍</span>
                    <input
                        type="text"
                        autoFocus
                        placeholder={t("visitor.search.placeholder", "Busque por obras, artistas, trilhas...")}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{
                            width: "100%",
                            border: "none",
                            background: "transparent",
                            fontSize: "1.2rem",
                            color: "var(--text-primary)",
                            outline: "none",
                        }}
                    />
                    <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>
                        ×
                    </button>
                </div>

                <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                    {results.length === 0 && query.trim() && (
                        <p style={{ textAlign: "center", color: "#6b7280", padding: "2rem" }}>
                            {t("visitor.search.noResults", "Nenhum resultado encontrado.")}
                        </p>
                    )}

                    {results.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleSelect(item.url)}
                            style={{
                                padding: "1rem",
                                borderBottom: "1px solid var(--border-color)",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                transition: "background 0.2s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                            <div
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "8px",
                                    backgroundColor: "#e5e7eb",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.2rem",
                                }}
                            >
                                {item.type === "work" && "🎨"}
                                {item.type === "artist" && "👨‍🎨"}
                                {item.type === "trail" && "🗺️"}
                                {item.type === "event" && "📅"}
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: "1rem", color: "var(--text-primary)" }}>{item.title}</h4>
                                {item.description && (
                                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>{item.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
