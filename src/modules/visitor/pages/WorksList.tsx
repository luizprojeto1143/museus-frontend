import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { getFullUrl } from "../../../utils/url";

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
    imageUrl?: string | null;
  };

  const [works, setWorks] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenantId) {
      setLoading(true);
      api
        .get("/works", { params: { tenantId } })
        .then((res) => {
          // API returns { data: works[], pagination: {} }
          const rawData = Array.isArray(res.data) ? res.data : (res.data.data || []);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const worksData = (rawData as any[]).map((w) => ({
            id: w.id,
            title: w.title,
            artist: w.artist ?? "Artista desconhecido",
            year: w.year ?? "",
            category: w.category?.name ?? w.category ?? "Obra",
            accessible: true,
            imageUrl: getFullUrl(w.imageUrl)
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

  if (!tenantId) {
    return <div className="p-8 text-center">{t("visitor.works.selectMuseum", "Selecione um museu para ver as obras.")}</div>;
  }

  return (
    <div>
      <h1 className="section-title">{t("visitor.artworks.title")}</h1>
      <p className="section-subtitle">
        {t("visitor.works.subtitle")}
      </p>

      {loading ? (
        <div className="card-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card" style={{ height: "300px", animation: "pulse 1.5s infinite", background: "rgba(255,255,255,0.05)" }}></div>
          ))}
        </div>
      ) : works.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🖼️</div>
          <h3>{t("visitor.works.emptyTitle", "Nenhuma obra encontrada")}</h3>
          <p style={{ color: "#9ca3af" }}>{t("visitor.works.emptyDesc", "O acervo deste museu ainda não foi cadastrado ou não há obras públicas.")}</p>
        </div>
      ) : (
        <div className="card-grid">
          {works.map(work => (
            <article key={work.id} className="card" style={{ display: "flex", flexDirection: "column" }}>
              {work.imageUrl ? (
                <img
                  src={work.imageUrl}
                  alt={work.title}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "0.5rem 0.5rem 0 0",
                    marginBottom: "1rem",
                    backgroundColor: "rgba(0,0,0,0.2)"
                  }}
                />
              ) : (
                <div style={{
                  width: "100%",
                  height: "200px",
                  borderRadius: "0.5rem 0.5rem 0 0",
                  marginBottom: "1rem",
                  background: "linear-gradient(135deg, rgba(30,64,175,0.8), rgba(56,189,248,0.4))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#e5e7eb"
                }}>
                  {t("visitor.artwork.imagePlaceholder")}
                </div>
              )}
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <h2 className="card-title">{work.title}</h2>
                <p className="card-subtitle">
                  {work.artist} • {work.year}
                </p>
                <div className="card-meta" style={{ marginTop: "auto" }}>
                  <span className="chip">{work.category}</span>
                  {work.accessible && <span className="chip">{t("visitor.home.accessible")}</span>}
                </div>
                <Link
                  to={`/obras/${work.id}`}
                  className="btn btn-secondary"
                  style={{ marginTop: "1rem", width: "100%", textAlign: "center" }}
                >
                  {t("visitor.home.viewDetails")}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};
