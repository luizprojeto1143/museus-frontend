import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getFullUrl } from "../../../utils/url";
import { ArrowRight, Trash2, Compass } from "lucide-react";
import "./Favorites.css";

import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

type FavoriteItem = {
  id: string; // id do favorito na tabela
  type: "work" | "trail" | "event";
  title: string;
  artist?: string;
  imageUrl?: string;
};

export const Favorites: React.FC = () => {
  const { t } = useTranslation();
  const { isGuest, tenantId } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(!isGuest);

  React.useEffect(() => {
    if (isGuest || !tenantId) return;
    api.get("/favorites")
      .then(res => setFavorites(res.data))
      .catch(err => console.error("Erro ao carregar favoritos", err))
      .finally(() => setLoading(false));
  }, [isGuest, tenantId]);

  const removeFavorite = async (type: string, itemId: string) => {
    try {
      await api.delete(`/favorites/${type}/${itemId}`);
      setFavorites(prev => prev.filter(f => f.id !== itemId));
    } catch (err) {
      console.error("Erro ao remover favorito", err);
    }
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

      {isGuest ? (
        <div className="favorites-empty" style={{ border: '1px dashed rgba(212,175,55,0.4)', background: 'rgba(212,175,55,0.05)' }}>
          <span className="favorites-empty-icon">💎</span>
          <h3 style={{ color: 'var(--primary-color)' }}>Recurso Exclusivo</h3>
          <p>{t("visitor.favorites.crieSuaContaNoMuseuParaSalvarSuasObrasTr", `Crie sua conta no museu para salvar suas obras, trilhas e eventos favoritos na nuvem e acessá-los de qualquer dispositivo.`)}</p>
          <Link to="/register" className="favorites-explore-btn" style={{ marginTop: '1rem', background: 'var(--primary-color)', color: '#1a1108' }}>
            Criar Minha Conta
          </Link>
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>{t("visitor.favorites.carregandoSuaColeo", `Carregando sua coleção...`)}</div>
      ) : favorites.length === 0 ? (
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
                    onClick={() => removeFavorite(item.type, item.id)}
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
