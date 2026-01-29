import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";
import { BarChart3, Users, Eye } from "lucide-react";
import "./MasterShared.css";

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
    <div className="master-page-container">
      {/* HERO SECTION */}
      <section className="master-hero">
        <div className="master-hero-content">
          <span className="master-badge">
            📊 Dashboard Central
          </span>
          <h1 className="master-title">
            Visão Geral do Sistema
          </h1>
          <p className="master-subtitle">
            Monitore o desempenho de todos os museus, visitantes e acessos em tempo real.
          </p>
        </div>
      </section>

      {loading && <p className="text-center text-gray-400">Carregando dados...</p>}

      {!loading && (
        <>
          {/* STATS GRID */}
          <div className="master-grid-2" style={{ marginBottom: "2rem" }}>
            <article className="master-card">
              <div className="master-card-header">
                <div className="master-icon-wrapper master-icon-blue">
                  <Users size={24} />
                </div>
                <h3>{t("master.dashboard.totalVisitors")}</h3>
              </div>
              <div style={{ flexGrow: 1 }}>
                <p style={{ fontSize: "3rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                  {totalVisitors.toLocaleString()}
                </p>
                <p className="master-card-desc">
                  {t("master.dashboard.totalVisitorsDesc")}
                </p>
              </div>
            </article>

            <article className="master-card">
              <div className="master-card-header">
                <div className="master-icon-wrapper master-icon-green">
                  <Eye size={24} />
                </div>
                <h3>{t("master.dashboard.totalVisits")}</h3>
              </div>
              <div style={{ flexGrow: 1 }}>
                <p style={{ fontSize: "3rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                  {totalVisits.toLocaleString()}
                </p>
                <p className="master-card-desc">
                  {t("master.dashboard.totalVisitsDesc")}
                </p>
              </div>
            </article>
          </div>

          {/* TABLE CARD */}
          <div className="master-card">
            <div className="master-card-header">
              <div className="master-icon-wrapper master-icon-purple">
                <BarChart3 size={24} />
              </div>
              <h3>{t("master.dashboard.summaryByTenant")}</h3>
            </div>

            <div className="master-table-container">
              <table className="master-table">
                <thead>
                  <tr>
                    <th>{t("master.dashboard.table.client")}</th>
                    <th>{t("master.dashboard.table.slug")}</th>
                    <th>{t("master.dashboard.table.works")}</th>
                    <th>{t("master.dashboard.table.trails")}</th>
                    <th>{t("master.dashboard.table.events")}</th>
                    <th>{t("master.dashboard.table.visitors")}</th>
                    <th>{t("master.dashboard.table.visits")}</th>
                  </tr>
                </thead>
                <tbody>
                  {summaries.map((s) => (
                    <tr key={s.tenantId}>
                      <td>
                        <span style={{ fontWeight: 600, color: '#fff' }}>{s.name}</span>
                      </td>
                      <td>
                        <span style={{ padding: '0.25rem 0.5rem', background: '#334155', borderRadius: '4px', fontSize: '0.8rem' }}>
                          {s.slug}
                        </span>
                      </td>
                      <td>{s.worksCount}</td>
                      <td>{s.trailsCount}</td>
                      <td>{s.eventsCount}</td>
                      <td>{s.visitorsCount}</td>
                      <td>{s.visitsCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
