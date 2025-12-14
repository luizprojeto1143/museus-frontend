import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import "./GlobalSearch.css";

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

    const { tenantId } = useAuth();

    useEffect(() => {
        if (isOpen && query.trim().length >= 2 && tenantId) {
            const search = async () => {
                try {
                    const res = await api.get(`/search`, {
                        params: { q: query, tenantId }
                    });
                    setResults(res.data);
                } catch (error) {
                    console.error("Error searching items", error);
                }
            };

            // Debounce manual
            const timeoutId = setTimeout(search, 300);
            return () => clearTimeout(timeoutId);
        } else if (query.trim().length < 2) {
            setResults([]);
        }
    }, [isOpen, query, tenantId]);

    const handleSelect = (url: string) => {
        navigate(url);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="global-search-overlay" onClick={onClose}>
            <div
                className="global-search-container"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="global-search-header">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        autoFocus
                        placeholder={t("visitor.search.placeholder", "Busque por obras, artistas, trilhas...")}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="search-input"
                    />
                    <button onClick={onClose} className="close-button">
                        ×
                    </button>
                </div>

                <div className="search-results">
                    {results.length === 0 && query.trim() && (
                        <p className="no-results">
                            {t("visitor.search.noResults", "Nenhum resultado encontrado.")}
                        </p>
                    )}

                    {results.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleSelect(item.url)}
                            className="search-result-item"
                        >
                            <div className="result-icon">
                                {item.type === "work" && "🎨"}
                                {item.type === "artist" && "👨‍🎨"}
                                {item.type === "trail" && "🗺️"}
                                {item.type === "event" && "📅"}
                            </div>
                            <div className="result-content">
                                <h4 className="result-title">{item.title}</h4>
                                {item.description && (
                                    <p className="result-description">{item.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
