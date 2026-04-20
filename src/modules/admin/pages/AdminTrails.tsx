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

  const fetchTrails = React.useCallback(() => {
    if (!tenantId) return;

    api
      .get("/trails", { params: { tenantId } })
      .then((res) => {
        // Backend returns workIds as string[] array, not works objects
        const apiTrails = (res.data as { id: string; title?: string; name?: string; workIds?: string[]; active?: boolean }[]).map((tr) => ({
          id: tr.id,
          name: tr.title ?? tr.name ?? "Sem nome",
          worksCount: tr.workIds?.length ?? 0,
          active: tr.active ?? true
        }));
        setTrails(apiTrails);
      })
      .catch((err) => {
        console.error("Failed to fetch trails", err);
        setTrails([]);
      });
  }, [tenantId]);

  React.useEffect(() => {
    fetchTrails();
  }, [fetchTrails]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(t("admin.trails.confirmDelete", { name }) || `Tem certeza que deseja excluir a trilha "${name}"?`)) {
      return;
    }

    try {
      await api.delete(`/trails/${id}`);
      fetchTrails();
    } catch (err) {
      console.error("Failed to delete trail", err);
      alert(t("common.error") || "Erro ao excluir trilha");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div>
          <h1 className="section-title">{t("admin.trails.title")}</h1>

        </div>
        <Link to="/admin/trilhas/nova" className="inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors cursor-pointer border bg-[var(--bg-surface-hover)] text-[var(--fg-main)] border-[var(--border-default)] text-[13px] px-5 py-2.5 rounded-[var(--radius-md)]">
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
              <td style={{ textAlign: "right", display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                <Link to={`/admin/trilhas/${trail.id}`} className="inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors cursor-pointer border bg-[var(--glass-bg-light)] text-[var(--fg-main)] border-[var(--border-default)] backdrop-blur-sm text-[13px] px-5 py-2.5 rounded-[var(--radius-md)]">
                  {t("common.edit")}
                </Link>
                <button
                  className="inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors cursor-pointer border bg-red-600 text-[var(--fg-main)] border-transparent hover:bg-red-700 text-[13px] px-5 py-2.5 rounded-[var(--radius-md)]"
                  onClick={() => handleDelete(trail.id, trail.name)}
                  style={{ backgroundColor: "#dc3545", color: "white", border: "none" }}
                >
                  {t("common.delete") || "Excluir"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
