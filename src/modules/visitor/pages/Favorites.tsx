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
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❤️</div>
          <h3>{t("visitor.favorites.emptyTitle", "Sua lista de favoritos está vazia")}</h3>
          <p style={{ color: "#9ca3af", marginBottom: "1.5rem" }}>{t("visitor.favorites.emptyDesc", "Salve suas obras, trilhas e eventos favoritos para acessá-los facilmente aqui.")}</p>
          <Link to="/obras" className="btn btn-primary">
            {t("visitor.favorites.explore", "Explorar Obras")}
          </Link>
        </div>
      ) : (
        <div className="card-grid">
          {favorites.map(item => (
            <article key={item.id} className="card" style={{ display: "flex", flexDirection: "column" }}>
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "0.5rem 0.5rem 0 0", marginBottom: "0" }}
                />
              ) : (
                <div style={{
                  width: "100%",
                  height: "180px",
                  borderRadius: "0.5rem 0.5rem 0 0",
                  background: "linear-gradient(135deg, rgba(30,64,175,0.8), rgba(56,189,248,0.4))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#e5e7eb",
                  fontSize: "2rem"
                }}>
                  ❤️
                </div>
              )}
              <div style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <span className="chip">{getTypeLabel(item.type)}</span>
                  <button
                    onClick={() => removeFavorite(item.id)}
                    className="btn-icon"
                    style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: "0.25rem" }}
                    title={t("common.remove")}
                  >
                    🗑️
                  </button>
                </div>
                <h2 className="card-title">{item.title}</h2>
                {item.artist && <p className="card-subtitle">{item.artist}</p>}

                <Link
                  to={getLink(item)}
                  className="btn btn-secondary"
                  style={{ marginTop: "auto", width: "100%", textAlign: "center" }}
                >
                  {t("visitor.favorites.viewDetails")}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
