import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getFullUrl } from "../../../utils/url";
import { ArrowRight, Trash2, Compass } from "lucide-react";
import "./Favorites.css";

type FavoriteItem = {
  id: string;
  type: "work" | "trail" | "event";
  title: string;
  artist?: string;
  imageUrl?: string;
};

export const Favorites: React.FC = () => {
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    const stored = localStorage.getItem("favorites");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (err) {
        console.error("Erro ao carregar favoritos", err);
        return [];
      }
    }
    return [];
  });

  const removeFavorite = (id: string) => {
    const updated = favorites.filter(f => f.id !== id);
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const getLink = (item: FavoriteItem) => {
    if (item.type === "work") return `/obras/${item.id}`;
    if (item.type === "trail") return `/trilhas/${item.id}`;
    if (item.type === "event") return `/eventos/${item.id}`;
    return "#";
  };

  const getTypeLabel = (type: string) => {
    if (type === "work") return t("visitor.favorites.typeWork");
    if (type === "trail") return t("visitor.favorites.typeTrail");
    if (type === "event") return t("visitor.favorites.typeEvent");
    return type;
  };

  return (
    <div className="favorites-container">
      <header className="favorites-header">
        <h1 className="favorites-title">{t("visitor.favorites.title")}</h1>
        <p className="favorites-subtitle">
          {t("visitor.favorites.subtitle")}
        </p>
      </header>

      {favorites.length === 0 ? (
        <div className="favorites-empty">
          <span className="favorites-empty-icon">💎</span>
          <h3>{t("visitor.favorites.emptyTitle", "Sua coleção está vazia")}</h3>
          <p>{t("visitor.favorites.emptyDesc", "Salve suas obras, trilhas e eventos favoritos para acessá-los facilmente aqui.")}</p>
          <Link to="/obras" className="favorites-explore-btn">
            <Compass size={18} />
            {t("visitor.favorites.explore", "Explorar Obras")}
          </Link>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map(item => (
            <article key={item.id} className="favorite-card">
              {item.imageUrl ? (
                <img
                  src={getFullUrl(item.imageUrl) || item.imageUrl}
                  alt={item.title}
                  className="favorite-image"
                />
              ) : (
                <div className="favorite-image-placeholder">
                  {item.type === "work" ? "🎨" : item.type === "trail" ? "🛤️" : "🎪"}
                </div>
              )}
              <div className="favorite-content">
                <div className="favorite-content-header">
                  <span className="favorite-type-badge">{getTypeLabel(item.type)}</span>
                  <button
                    onClick={() => removeFavorite(item.id)}
                    className="favorite-remove-btn"
                    title={t("common.remove")}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h2 className="favorite-title">{item.title}</h2>
                {item.artist && <p className="favorite-artist">{item.artist}</p>}

                <Link to={getLink(item)} className="favorite-view-btn">
                  {t("visitor.favorites.viewDetails")}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
