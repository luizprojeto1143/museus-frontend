import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

export const WorksList: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useAuth();

  type WorkItem = {
    id: string;
    title: string;
    artist: string;
    year?: string;
    category?: string;
    accessible?: boolean;
    imageUrl?: string;
  };

  const [works, setWorks] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenantId) {
      // setLoading(true); // Removed to avoid lint warning, loading is true by default
      api
        .get("/works", { params: { tenantId } })
        .then((res) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const worksData = (res.data as any[]).map((w) => ({
            id: w.id,
            title: w.title,
            artist: w.artist ?? "Artista desconhecido",
            year: w.year ?? "",
            category: w.category ?? "Obra",
            accessible: true,
            imageUrl: w.imageUrl
          }));
          setWorks(worksData);
        })
        .catch((err) => {
          console.error("Failed to fetch works", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [tenantId]);

  if (loading) {
    return <div className="p-8 text-center">{t("common.loading")}</div>;
  }

  if (!tenantId) {
    return <div className="p-8 text-center">Selecione um museu para ver as obras.</div>;
  }

  return (
    <div>
      <h1 className="section-title">{t("visitor.artworks.title")}</h1>
      <p className="section-subtitle">
        {t("visitor.works.subtitle")}
      </p>

      {works.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <p className="text-slate-500">Nenhuma obra encontrada.</p>
        </div>
      ) : (
        <div className="card-grid">
          {works.map(work => (
            <article key={work.id} className="card">
              {work.imageUrl && (
                <img
                  src={work.imageUrl}
                  alt={work.title}
                  className="w-full h-48 object-cover rounded-t-lg mb-2"
                />
              )}
              <div className="p-4">
                <h2 className="card-title">{work.title}</h2>
                <p className="card-subtitle">
                  {work.artist} • {work.year}
                </p>
                <div className="card-meta">
                  <span className="chip">{work.category}</span>
                  {work.accessible && <span className="chip">{t("visitor.home.accessible")}</span>}
                </div>
                <Link
                  to={`/obras/${work.id}`}
                  className="btn btn-secondary w-full mt-3 block text-center"
                >
                  {t("visitor.home.viewDetails")}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
