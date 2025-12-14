import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

export const AdminTrails: React.FC = () => {
  type AdminTrailItem = {
    id: string;
    name: string;
    worksCount: number;
    active: boolean;
  };

  const { t } = useTranslation();
  const { tenantId } = useAuth();
  const [trails, setTrails] = useState<AdminTrailItem[]>([]);


  React.useEffect(() => {
    if (!tenantId) return;

    api
      .get("/trails", { params: { tenantId } })
      .then((res) => {
        const apiTrails = (res.data as { id: string; title?: string; name: string; works?: { length: number }[]; active?: boolean }[]).map((tr) => ({
          id: tr.id,
          name: tr.title ?? tr.name,
          worksCount: tr.works?.length ?? 0,
          active: tr.active ?? true
        }));
        setTrails(apiTrails);
      })
      .catch((err) => {
        console.error("Failed to fetch trails", err);
        setTrails([]);
      });
  }, [tenantId, t]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div>
          <h1 className="section-title">{t("admin.trails.title")}</h1>
          <p className="section-subtitle">
            {t("admin.trails.subtitle")}
          </p>
        </div>
        <Link to="/admin/trilhas/nova" className="btn">
          {t("admin.trails.new")}
        </Link>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>{t("admin.trails.table.name")}</th>
            <th>{t("admin.trails.table.works")}</th>
            <th>{t("admin.trails.table.status")}</th>
            <th style={{ textAlign: "right" }}>{t("admin.trails.table.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {trails.map(trail => (
            <tr key={trail.id}>
              <td>{trail.name}</td>
              <td>{trail.worksCount}</td>
              <td>
                <span className="chip">{trail.active ? t("admin.trails.status.active") : t("admin.trails.status.inactive")}</span>
              </td>
              <td style={{ textAlign: "right" }}>
                <Link to={`/admin/trilhas/${trail.id}`} className="btn btn-secondary">
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
