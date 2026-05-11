import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useTerminology } from "../../../hooks/useTerminology";
import { useDebounce } from "../../../hooks/useDebounce";

type AdminWorkItem = {
  id: string;
  title: string;
  artist?: string;
  published?: boolean;
  vestigeActive?: boolean;
  code?: string;
};

export const AdminWorks: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId, hasPermission } = useAuth();
  const term = useTerminology();

  const [works, setWorks] = useState<AdminWorkItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  React.useEffect(() => {
    if (!tenantId) return;

    setLoading(true);
    api
      .get("/works", { params: { tenantId, page, limit: 10, search: debouncedSearch || undefined } })
      .then((res) => {
        const responseData = res.data;
        const worksList = responseData.data || [];
        const pagination = responseData.pagination || {};

        const apiWorks = worksList.map((w: any) => ({
          id: w.id,
          title: w.title,
          artist: w.artist ?? "",
          published: w.published ?? true,
          vestigeActive: w.vestigeActive ?? false,
          imageUrl: w.imageUrl,
          description: w.description,
          year: w.year,
          code: w.qrCode?.code || ""
        }));

        setWorks(apiWorks);
        setTotalPages(pagination.totalPages || 1);
      })
      .catch((err) => {
        console.error("Failed to fetch works", err);
        setWorks([]);
      })
      .finally(() => setLoading(false));
  }, [tenantId, page, debouncedSearch]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <h1 className="section-title">{term.works}</h1>
          {/* Debounced search */}
          <input
            type="search"
            placeholder={`Buscar ${term.work.toLowerCase()}...`}
            value={searchInput}
            onChange={e => { setSearchInput(e.target.value); setPage(1); }}
            aria-label={`Buscar ${term.work.toLowerCase()}`}
            style={{
              marginTop: "0.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-default)",
              background: "var(--bg-surface)",
              color: "var(--fg-main)",
              fontSize: "0.9rem",
              width: "100%",
              maxWidth: "360px",
              outline: "none",
            }}
          />
        </div>
        {hasPermission("manage_works") && (
          <Link to="/admin/obras/nova" className="inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors cursor-pointer border bg-[var(--bg-surface-hover)] text-[var(--fg-main)] border-[var(--border-default)] text-[13px] px-5 py-2.5 rounded-[var(--radius-md)]" style={{ alignSelf: "flex-start" }}>
            + Nova {term.work}
          </Link>
        )}
      </div>

      {loading ? (
        <p>{t("common.loading")}</p>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>{term.work}</th>
                <th>{t("admin.works.table.code", "Código")}</th>
                <th>{term.artist}</th>
                <th>{t("admin.works.table.status")}</th>
                <th style={{ textAlign: "right" }}>{t("admin.works.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {works.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>
                    Nenhuma {term.work.toLowerCase()} encontrada.
                  </td>
                </tr>
              ) : (
                works.map(work => (
                  <tr key={work.id}>
                    <td>{work.title}</td>
                    <td><strong>{work.code || '-'}</strong></td>
                    <td>{work.artist}</td>
                    <td>
                      <span className="chip">
                        {work.published ? t("admin.works.status.published") : t("admin.works.status.draft")}
                      </span>
                      {work.vestigeActive && (
                        <span className="chip" style={{ background: 'var(--accent-primary)', color: 'black', marginLeft: '0.5rem' }}>
                          {t('vestige.admin.vestigeMode', 'Vestígio')}
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        {work.vestigeActive && hasPermission("manage_works") && (
                          <button 
                            className="inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors cursor-pointer border bg-[var(--glass-bg-light)] text-[var(--fg-main)] border-[var(--border-default)] backdrop-blur-sm text-[13px] px-5 py-2.5 rounded-[var(--radius-md)]"
                            style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
                            onClick={async () => {
                              if (window.confirm(t('vestige.admin.confirmExpire', 'Deseja expirar este vestígio? Todos os selos coletados se tornarão relíquias definitivas.'))) {
                                try {
                                  await api.post(`/vestiges/expire/${work.id}`);
                                  alert(t('common.success', 'Sucesso!'));
                                  window.location.reload();
                                } catch (err) {
                                  alert(t('common.error', 'Erro!'));
                                }
                              }
                            }}
                          >
                            {t('vestige.admin.expireAction', 'Expirar')}
                          </button>
                        )}
                        {hasPermission("manage_works") ? (
                          <Link to={`/admin/obras/${work.id}`} className="inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors cursor-pointer border bg-[var(--glass-bg-light)] text-[var(--fg-main)] border-[var(--border-default)] backdrop-blur-sm text-[13px] px-5 py-2.5 rounded-[var(--radius-md)]">
                            {t("common.edit")}
                          </Link>
                        ) : (
                          <Link to={`/admin/obras/${work.id}`} className="inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors cursor-pointer border bg-[var(--glass-bg-light)] text-[var(--fg-main)] border-[var(--border-default)] backdrop-blur-sm text-[13px] px-5 py-2.5 rounded-[var(--radius-md)]">
                             Visualizar
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "1.5rem", alignItems: "center" }}>
              <button
                className="inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors cursor-pointer border bg-[var(--glass-bg-light)] text-[var(--fg-main)] border-[var(--border-default)] backdrop-blur-sm text-[13px] px-5 py-2.5 rounded-[var(--radius-md)]"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                ◀ Anterior
              </button>
              <span>Página {page} de {totalPages}</span>
              <button
                className="inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors cursor-pointer border bg-[var(--glass-bg-light)] text-[var(--fg-main)] border-[var(--border-default)] backdrop-blur-sm text-[13px] px-5 py-2.5 rounded-[var(--radius-md)]"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Próxima ▶
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
