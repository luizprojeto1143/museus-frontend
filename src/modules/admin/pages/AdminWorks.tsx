import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

type AdminWorkItem = {
  id: string;
  title: string;
  artist?: string;
  published?: boolean;
};

export const AdminWorks: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useAuth();
  const [works, setWorks] = useState<AdminWorkItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!tenantId) return;

    setLoading(true);
    api
      .get("/works", { params: { tenantId, page, limit: 10 } })
      .then((res) => {
        // Backend returns { data: [], pagination: {} }
        const responseData = res.data;
        const worksList = responseData.data || [];
        const pagination = responseData.pagination || {};

        const apiWorks = worksList.map((w: { id: string; title: string; artist?: string; published?: boolean }) => ({
          id: w.id,
          title: w.title,
          artist: w.artist ?? "",
          published: w.published ?? true
        }));

        setWorks(apiWorks);
        setTotalPages(pagination.totalPages || 1);
      })
      .catch((err) => {
        console.error("Failed to fetch works", err);
        setWorks([]);
      })
      .finally(() => setLoading(false));
  }, [tenantId, page]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div>
          <h1 className="section-title">{t("admin.works.title")}</h1>
          <p className="section-subtitle">
            {t("admin.works.subtitle")}
          </p>
        </div>
        <Link to="/admin/obras/nova" className="btn">
          {t("admin.works.new")}
        </Link>
      </div>

      {loading ? (
        <p>{t("common.loading")}</p>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>{t("admin.works.table.title")}</th>
                <th>{t("admin.works.table.artist")}</th>
                <th>{t("admin.works.table.status")}</th>
                <th style={{ textAlign: "right" }}>{t("admin.works.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {works.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>
                    Nenhuma obra encontrada.
                  </td>
                </tr>
              ) : (
                works.map(work => (
                  <tr key={work.id}>
                    <td>{work.title}</td>
                    <td>{work.artist}</td>
                    <td>
                      <span className="chip">
                        {work.published ? t("admin.works.status.published") : t("admin.works.status.draft")}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link to={`/admin/obras/${work.id}`} className="btn btn-secondary">
                        {t("common.edit")}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "1.5rem", alignItems: "center" }}>
            <button
              className="btn btn-secondary"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              ◀ Anterior
            </button>
            <span>Página {page} de {totalPages}</span>
            <button
              className="btn btn-secondary"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Próxima ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
};
