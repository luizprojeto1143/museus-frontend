import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";

type TenantSummary = {
  tenantId: string;
  name: string;
  slug: string;
  worksCount: number;
  trailsCount: number;
  eventsCount: number;
  visitorsCount: number;
  visitsCount: number;
};

export const MasterDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [apiSummaries, setApiSummaries] = useState<TenantSummary[]>([]);
  const [loading, setLoading] = useState(!isDemoMode);

  const mock: TenantSummary[] = [
    {
      tenantId: "1",
      name: "Museu A",
      slug: "museu-a",
      worksCount: 40,
      trailsCount: 4,
      eventsCount: 6,
      visitorsCount: 1200,
      visitsCount: 3200
    },
    {
      tenantId: "2",
      name: "Cidade histórica B",
      slug: "cidade-b",
      worksCount: 28,
      trailsCount: 3,
      eventsCount: 4,
      visitorsCount: 800,
      visitsCount: 2100
    }
  ];

  const summaries = isDemoMode ? mock : apiSummaries;

  useEffect(() => {
    if (isDemoMode) {
      return;
    }

    api
      .get("/analytics/tenants-summary")
      .then((res) => {
        setApiSummaries(res.data as TenantSummary[]);
      })
      .catch((err) => {
        console.error("Erro ao buscar analytics de tenants", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalVisitors = summaries.reduce((acc, s) => acc + (s.visitorsCount || 0), 0);
  const totalVisits = summaries.reduce((acc, s) => acc + (s.visitsCount || 0), 0);

  return (
    <div>
      <h1 className="section-title">{t("master.dashboard.title")}</h1>
      <p className="section-subtitle">
        {t("master.dashboard.subtitle")}
      </p>

      {loading && <p>{t("common.loading")}</p>}

      {!loading && (
        <>
          <div className="card-grid" style={{ marginBottom: "1.5rem" }}>
            <article className="card">
              <h2 className="card-title">{t("master.dashboard.totalVisitors")}</h2>
              <p style={{ fontSize: "2.2rem", fontWeight: 600 }}>{totalVisitors}</p>
              <p className="card-subtitle">
                {t("master.dashboard.totalVisitorsDesc")}
              </p>
            </article>

            <article className="card">
              <h2 className="card-title">{t("master.dashboard.totalVisits")}</h2>
              <p style={{ fontSize: "2.2rem", fontWeight: 600 }}>{totalVisits}</p>
              <p className="card-subtitle">
                {t("master.dashboard.totalVisitsDesc")}
              </p>
            </article>
          </div>

          <div className="card">
            <h2 className="card-title">{t("master.dashboard.summaryByTenant")}</h2>
            <table
              style={{
                width: "100%",
                marginTop: "0.75rem",
                borderCollapse: "collapse",
                fontSize: "0.9rem"
              }}
            >
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "0.5rem" }}>{t("master.dashboard.table.client")}</th>
                  <th style={{ textAlign: "left", padding: "0.5rem" }}>{t("master.dashboard.table.slug")}</th>
                  <th style={{ textAlign: "left", padding: "0.5rem" }}>{t("master.dashboard.table.works")}</th>
                  <th style={{ textAlign: "left", padding: "0.5rem" }}>{t("master.dashboard.table.trails")}</th>
                  <th style={{ textAlign: "left", padding: "0.5rem" }}>{t("master.dashboard.table.events")}</th>
                  <th style={{ textAlign: "left", padding: "0.5rem" }}>{t("master.dashboard.table.visitors")}</th>
                  <th style={{ textAlign: "left", padding: "0.5rem" }}>{t("master.dashboard.table.visits")}</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map((s) => (
                  <tr key={s.tenantId}>
                    <td style={{ padding: "0.5rem" }}>{s.name}</td>
                    <td style={{ padding: "0.5rem" }}>{s.slug}</td>
                    <td style={{ padding: "0.5rem" }}>{s.worksCount}</td>
                    <td style={{ padding: "0.5rem" }}>{s.trailsCount}</td>
                    <td style={{ padding: "0.5rem" }}>{s.eventsCount}</td>
                    <td style={{ padding: "0.5rem" }}>{s.visitorsCount}</td>
                    <td style={{ padding: "0.5rem" }}>{s.visitsCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
