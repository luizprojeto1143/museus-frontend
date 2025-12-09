import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";

type TenantItem = {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
};

export const TenantsList: React.FC = () => {
  const { t } = useTranslation();
  const [apiTenants, setApiTenants] = useState<TenantItem[]>([]);

  const mock: TenantItem[] = [
    { id: "1", name: "Museu A", slug: "museu-a", createdAt: "2025-01-01" },
    { id: "2", name: "Cidade histórica B", slug: "cidade-b", createdAt: "2025-01-15" }
  ];

  const tenants = isDemoMode ? mock : apiTenants;

  useEffect(() => {
    if (isDemoMode) return;

    api
      .get("/tenants")
      .then((res) => {
        setApiTenants(res.data);
      })
      .catch(() => {
        setApiTenants([]);
      });
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div>
          <h1 className="section-title">{t("master.tenants.title")}</h1>
          <p className="section-subtitle">
            {t("master.tenants.subtitle")}
          </p>
        </div>
        <Link to="/master/tenants/novo" className="btn">
          {t("master.tenants.new")}
        </Link>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>{t("master.tenants.table.name")}</th>
            <th>{t("master.tenants.table.slug")}</th>
            <th>{t("master.tenants.table.createdAt")}</th>
            <th style={{ textAlign: "right" }}>{t("master.tenants.table.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map(tenant => (
            <tr key={tenant.id}>
              <td>{tenant.name}</td>
              <td><code>{tenant.slug}</code></td>
              <td>{tenant.createdAt}</td>
              <td style={{ textAlign: "right" }}>
                <Link to={`/master/tenants/${tenant.id}`} className="btn btn-secondary">
                  {t("master.tenants.table.edit")}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
