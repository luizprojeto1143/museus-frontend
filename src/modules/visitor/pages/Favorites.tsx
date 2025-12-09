import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
    <div>
      <h1 className="section-title">{t("visitor.favorites.title")}</h1>
      <p className="section-subtitle">
        {t("visitor.favorites.subtitle")}
      </p>

      {favorites.length === 0 ? (
        <div className="card">
          <p>{t("visitor.favorites.empty")}</p>
          <Link to="/obras" className="btn" style={{ marginTop: "1rem", display: "inline-block" }}>
            {t("visitor.favorites.explore")}
          </Link>
        </div>
      ) : (
        <div className="card-grid">
          {favorites.map(item => (
            <article key={item.id} className="card">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "0.5rem", marginBottom: "0.75rem" }}
                />
              )}
              <span className="chip" style={{ marginBottom: "0.5rem" }}>{getTypeLabel(item.type)}</span>
              <h2 className="card-title">{item.title}</h2>
              {item.artist && <p className="card-subtitle">{item.artist}</p>}
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <Link to={getLink(item)} className="btn btn-secondary" style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}>
                  {t("visitor.favorites.viewDetails")}
                </Link>
                <button
                  onClick={() => removeFavorite(item.id)}
                  className="btn btn-secondary"
                  style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}
                >
                  {t("common.remove")}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
