import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";
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

  React.useEffect(() => {
    const mock: AdminWorkItem[] = [
      { id: "1", title: t("visitor.home.exampleArtwork") + " 1", artist: "Artista A", published: true },
      { id: "2", title: t("visitor.home.exampleArtwork") + " 2", artist: "Artista B", published: false }
    ];

    if (isDemoMode || !tenantId) {
      setWorks(mock);
      return;
    }

    api
      .get("/works", { params: { tenantId } })
      .then((res) => {
        const apiWorks = (res.data as { id: string; title: string; artist?: string; published?: boolean }[]).map((w) => ({
          id: w.id,
          title: w.title,
          artist: w.artist ?? "",
          published: w.published ?? true
        }));
        setWorks(apiWorks);
      })
      .catch(() => {
        setWorks(mock);
      });
  }, [tenantId, t]);

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
          {works.map(work => (
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
          ))}
        </tbody>
      </table>
    </div>
  );
};
