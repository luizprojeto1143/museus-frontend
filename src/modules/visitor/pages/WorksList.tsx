import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { getFullUrl } from "../../../utils/url";
import { ArrowRight } from "lucide-react";
import "./WorksList.css";

type WorkItem = {
  id: string;
  title: string;
  artist: string;
  year?: string;
  category?: string;
  accessible?: boolean;
  imageUrl?: string | null;
};

type ApiWork = {
  id: string;
  title: string;
  artist?: string;
  year?: string;
  category?: { name: string } | string;
  imageUrl?: string;
};

import { useWorks } from "../hooks/useWorks";

export const WorksList: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useAuth();

  const { data: works = [], isLoading: loading } = useWorks();

  if (!tenantId) {
    return <div className="workslist-no-tenant">{t("visitor.works.selectMuseum", "Selecione um museu para ver as obras.")}</div>;
  }

  return (
    <div className="workslist-container">
      <header className="workslist-header">
        <h1 className="workslist-title">{t("visitor.artworks.title")}</h1>
        <p className="workslist-subtitle">
          {t("visitor.works.subtitle")}
        </p>
      </header>

      {loading ? (
        <div className="workslist-skeleton-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="workslist-skeleton-card"></div>
          ))}
        </div>
      ) : works.length === 0 ? (
        <div className="workslist-empty">
          <span className="workslist-empty-icon">🖼️</span>
          <h3>{t("visitor.works.emptyTitle", "Nenhuma obra encontrada")}</h3>
          <p>{t("visitor.works.emptyDesc", "O acervo deste museu ainda não foi cadastrado ou não há obras públicas.")}</p>
        </div>
      ) : (
        <div className="workslist-grid">
          {works.map(work => (
            <article key={work.id} className="workslist-card">
              {work.imageUrl ? (
                <img
                  src={work.imageUrl}
                  alt={work.title}
                  className="workslist-card-image"
                />
              ) : (
                <div className="workslist-card-placeholder">
                  {t("visitor.artwork.imagePlaceholder")}
                </div>
              )}
              <div className="workslist-card-content">
                <h2 className="workslist-card-title">{work.title}</h2>
                <p className="workslist-card-artist">
                  {work.artist} • {work.year}
                </p>
                <div className="workslist-card-meta">
                  <span className="workslist-chip">{work.category}</span>
                  {work.accessible && <span className="workslist-chip">{t("visitor.home.accessible")}</span>}
                </div>
                <Link to={`/obras/${work.id}`} className="workslist-card-btn">
                  {t("visitor.home.viewDetails")}
                  <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
